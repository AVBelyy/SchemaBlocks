import sys
import json
import regex
import pickle
import itertools
import collections

from lxml import etree
from datetime import datetime

nsmap = {'b': 'https://developers.google.com/blockly/xml',
         'x': 'http://www.w3.org/1999/xhtml'}


def xpath(query, root):
    return root.xpath(query, namespaces=nsmap)


# TODO: specify all class properties' types


class Slot:
    def __init__(self, role, id, name, refvar, types, ref):
        self.role = role
        self.id = id
        self.name = name
        self.refvar = refvar
        self.types = types
        self.ref = ref

    def to_json_ld(self):
        out = collections.OrderedDict({
            '@id': self.id,
            'name': self.name,
            'role': self.role,
            'refvar': self.refvar,
            'entityTypes': self.types,
            'reference': self.ref
        })
        if self.ref is None:
            del out['reference']
        return out

    @staticmethod
    def from_var(slot_role_id, slot_id, slot_name, slot_types, var_id, var):
        if slot_types is None:
            slot_types = []
        slot_types = sorted(slot_types)
        slot_types = [f'kairos:Primitives/Entities/{st.upper()}' for st in slot_types]
        slot_ref = f'wiki:{var["ref"]}' if var['ref'] else None
        return Slot(slot_role_id, slot_id, slot_name, var_id, slot_types, slot_ref)


class Step:
    def __init__(self, type, id, name, comment, slots):
        self.type = type
        self.id = id
        self.name = name
        self.comment = comment
        self.slots = slots

    @staticmethod
    def from_xml_block(cur_step, sbs):
        valid_prefix = 'kairos_event_'
        block_type = cur_step.get('type')
        assert block_type.startswith(valid_prefix)

        # Get step type, name, and comment
        step_type = block_type[len(valid_prefix):]
        step_type_id = f'kairos:Primitives/Events/{step_type}'
        step_name = xpath('b:field[@name="step_name"]', cur_step)[0].text
        step_id = sbs.gen_unique_id(step_name, f'{sbs.schema_id}/Steps')
        step_comment_block = xpath('b:comment', cur_step)
        if len(step_comment_block) == 1:
            step_comment = step_comment_block[0].text
        else:
            step_comment = None

        # Get step slots
        slots_blocks = xpath('b:value[starts-with(@name,"part_")]/b:block/b:value', cur_step)
        step_slots = []
        for slot_block in slots_blocks:
            # Check for 'disabled' flag
            if slot_block.getparent().get('disabled') is not None:
                continue
            slot_role = slot_block.get('name')
            slot_vars = xpath('.//b:block[@type="variables_get"]/b:field', slot_block)
            slot_role_id = f'{step_type_id}/Slots/{slot_role}'
            slot_id_prefix = f'{step_id}/Slots'
            for sv in slot_vars:
                slot_var_id = sv.get('id')
                slot_name = sbs.vars[slot_var_id]['name']
                slot_id = sbs.gen_unique_id(slot_name, slot_id_prefix)
                slot_name = slot_id[len(slot_id_prefix) + 1:]  # to ensure slot names are unique across the step
                slot_ont_types = events_args[step_type][slot_role]
                sbs.vars[slot_var_id]['steps_slots'].add((step_type, slot_role))
                new_slot = Slot.from_var(slot_role_id, slot_id, slot_name, slot_ont_types, slot_var_id,
                                         sbs.vars[slot_var_id])
                step_slots.append(new_slot)

        return Step(step_type_id, step_id, step_name, step_comment, step_slots)

    def to_json_ld(self):
        out = collections.OrderedDict({
            '@id': self.id,
            'name': self.name,
            '@type': self.type,
            'comment': self.comment,
            'participants': [slot.to_json_ld() for slot in self.slots]
        })
        if self.comment is None:
            del out['comment']
        return out


class Schema:
    def __init__(self, id, name, descr, steps, rels, order, slots):
        self.id = id
        self.name = name
        self.descr = descr
        self.steps = steps
        self.rels = rels
        self.order = order
        self.slots = slots

    def to_json_ld(self):
        out = collections.OrderedDict({
            '@id': self.id,
            'name': self.name,
            'description': self.descr,
            'version': schema_version,
            'steps': [step.to_json_ld() for step in self.steps],
            'order': self.order,
            'entityRelations': self.rels,
            'slots': self.slots
        })
        if self.descr is None:
            del out['description']
        return out

    @staticmethod
    def from_xml(xml_path):
        tree = etree.parse(xml_path)  # TODO: handle errors
        tree_root = tree.getroot()

        # Get schema block
        schema_block = xpath('//b:block[@id="kairos_schema"]', tree_root)
        assert len(schema_block) == 1
        schema_block = schema_block[0]
        schema_name = xpath('b:field[@name="NAME"]', schema_block)[0].text
        schema_id = SchemaBuilderState.get_id(schema_name, f'{vendor_id}:Schemas')
        schema_comment_block = xpath('b:comment', schema_block)
        if len(schema_comment_block) == 1:
            schema_comment = schema_comment_block[0].text
        else:
            schema_comment = None

        # Get all defined variables
        vars_root = xpath('b:variables/b:variable', tree_root)
        vars = {
            var.get('id'): {'name': var.text, 'types': None, 'ref': None, 'steps_slots': set(), 'valid_types': set()}
            for var in vars_root}

        sbs = SchemaBuilderState(schema_id, vars)

        # Get schema type constraints
        schema_cur_tc = xpath('b:statement[@name="TC"]/b:block', schema_block)
        Schema._process_tcs(schema_cur_tc, sbs)

        # Get schema steps
        schema_cur_step = xpath('b:statement[@name="DO"]/b:block', schema_block)
        steps = Schema._process_steps(schema_cur_step, sbs, None)

        # Typecheck variables
        for var_id, var in sbs.vars.items():
            valid_types = set.intersection(
                *[set(events_args[step_slot[0]][step_slot[1]]) for step_slot in var['steps_slots']])
            sbs.vars[var_id]['valid_types'] = list(valid_types)

        # Build relations
        rels = []

        # Fill out slots (added in SDF v0.8)
        slots = []
        for var_id, var in sbs.vars.items():
            slot_role_name = var['name']
            slot_types = var['types']
            slot_valid_types = var['valid_types']
            if slot_types:
                slot_types = [slot_type for slot_type in slot_types if slot_type in slot_valid_types]
            if not slot_types:
                slot_types = slot_valid_types
            slot_id = sbs.gen_unique_id(slot_role_name, f'{schema_id}/Slots')
            new_slot = Slot.from_var(None, slot_id, slot_role_name, slot_types, var_id, var)
            new_slot_descr = collections.OrderedDict({
                '@id': new_slot.id,
                'roleName': new_slot.name,
                'refvar': new_slot.refvar,
                'entityTypes': new_slot.types,
                'reference': new_slot.ref
            })
            if new_slot.ref is None:
                del new_slot_descr['reference']
            slots.append(new_slot_descr)

        return Schema(schema_id, schema_name, schema_comment, steps, rels, sbs.order, slots)

    @staticmethod
    def _process_steps(cur_step, sbs, prev_steps, is_nested=False):
        steps = []
        while len(cur_step) > 0:
            cur_step = cur_step[0]
            if cur_step.get('type') == 'kairos_control_parallel':
                child_step = xpath('b:statement[@name="DO"]/b:block', cur_step)
                new_steps = Schema._process_steps(child_step, sbs, prev_steps, is_nested=True)
            else:
                new_steps = [Step.from_xml_block(cur_step, sbs)]
            cur_step = xpath('b:next/b:block', cur_step)
            steps.append(new_steps)
            if not is_nested and prev_steps is not None:
                sbs.gen_order(prev_steps, new_steps, order_type='before_after')
            prev_steps = new_steps
        return list(itertools.chain.from_iterable(steps))

    @staticmethod
    def _process_tcs(cur_tc, sbs):
        while len(cur_tc) > 0:
            cur_tc = cur_tc[0]
            assert cur_tc.get('type') == 'kairos_control_type_constraint'
            var_id = xpath('b:field[@name="VAR"]', cur_tc)[0].get('id')
            var_types_str = xpath('b:field[@name="TYPES"]', cur_tc)[0].text
            var_ref_str = xpath('b:field[@name="REF"]', cur_tc)[0].text
            assert var_id in sbs.vars
            var_types = [var_type.strip() for var_type in var_types_str.split(',')]
            var_ref = None if var_ref_str is None else var_ref_str.strip()
            sbs.vars[var_id]['types'] = var_types
            sbs.vars[var_id]['ref'] = var_ref
            cur_tc = xpath('b:next/b:block', cur_tc)


class SchemaBuilderState:
    def __init__(self, schema_id, vars):
        self.schema_id = schema_id
        self.vars = vars
        self.ids_set = set()
        self.order = []

    @staticmethod
    def get_id(seed, id_prefix):
        """
        Convert an arbitrary identifier (e.g. schema or step name) into a valid JSON-LD @id.
        :param seed: arbitrary identified
        :param id_prefix: JSON-LD compliant prefix
        :return: JSON-LD compliant @id
        """
        new_id = regex.sub(r'[\s/]+', '_', seed)
        if id_prefix:
            return id_prefix + '/' + new_id
        else:
            return new_id

    def gen_unique_id(self, seed, id_prefix=''):
        seed = self.get_id(seed, id_prefix)
        if seed not in self.ids_set:
            self.ids_set.add(seed)
            return seed
        else:
            match = regex.findall(r'(^.*)_(\d+)$', seed)
            if len(match) == 1:
                new_id_prefix, num_suffix = match[0]
                num_suffix = int(num_suffix)
            else:
                new_id_prefix = seed
                num_suffix = 1
            while True:
                num_suffix += 1
                new_id = f'{new_id_prefix}_{num_suffix}'
                if new_id not in self.ids_set:
                    self.ids_set.add(new_id)
                    return new_id

    def gen_order(self, prev_steps, next_steps, order_type='before_after'):
        for prev_step in prev_steps:
            for next_step in next_steps:
                if order_type == 'before_after':
                    self.order.append({'before': prev_step.id, 'after': next_step.id})


if __name__ == '__main__':
    # TODO: beware of all xmlns, other than 'b', that might "randomly" occur
    bxml_path = sys.argv[1]
    jsonld_path = sys.argv[2]
    schema_version = datetime.now().strftime('%m/%d/%Y')
    vendor_id = 'jhu'

    with open('../kairos_events.pkl', 'rb') as fin:
        events = pickle.load(fin)
    events_args = {k: dict(v['args']) for k, v in events.items()}

    schema = Schema.from_xml(bxml_path)
    out = collections.OrderedDict({
        '@context': 'https://kairos-sdf.s3.amazonaws.com/context/kairos-v0.8.jsonld',
        '@id': f'{vendor_id}:Submissions/TA1/Quizlet3',
        'sdfVersion': '0.8',
        'schemas': [schema.to_json_ld()]
    })
    with open(jsonld_path, 'w') as fout:
        json.dump(out, fout, indent=2)
