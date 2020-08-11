import itertools
import sys

from lxml import etree

nsmap = {'b': 'https://developers.google.com/blockly/xml',
         'x': 'http://www.w3.org/1999/xhtml'}


def xpath(query, root):
    return root.xpath(query, namespaces=nsmap)

# TODO: specify all class properties' types


class Slot:
    def __init__(self, name, vars_ids):
        self.name = name
        self.vars_ids = vars_ids


class Step:
    def __init__(self, type, name, comment, slots):
        self.type = type
        self.name = name
        self.comment = comment
        self.slots = slots

    @staticmethod
    def from_xml_block(cur_step):
        valid_prefix = 'kairos_event_'
        block_type = cur_step.get('type')
        assert block_type.startswith(valid_prefix)

        # Get step type, name, and comment
        step_type = block_type[len(valid_prefix):]
        step_name = xpath('b:field[@name="step_name"]', cur_step)[0].text
        step_comment = xpath('b:comment', cur_step)[0].text

        # Get step slots
        slots_blocks = xpath('b:value[starts-with(@name,"part_")]/b:block/b:value', cur_step)
        step_slots = []
        for slot_block in slots_blocks:
            # Check for 'disabled' flag
            if slot_block.getparent().get('disabled') is not None:
                continue
            slot_name = slot_block.get('name')
            slot_vars = xpath('.//b:block[@type="variables_get"]/b:field', slot_block)
            slot_vars_ids = [sv.get('id') for sv in slot_vars]
            step_slots.append(Slot(slot_name, slot_vars_ids))

        return Step(step_type, step_name, step_comment, step_slots)


class Schema:
    def __init__(self, name, vars, steps, rels, order):
        self.name = name
        self.vars = vars
        self.steps = steps
        self.rels = rels
        self.order = order

    def to_json_ld(self):
        pass  # TODO: implement me!

    @staticmethod
    def from_xml(xml_path):
        tree = etree.parse(xml_path)  # TODO: handle errors
        tree_root = tree.getroot()

        # Get all defined variables
        vars_root = xpath('b:variables/b:variable', tree_root)
        vars = {var.get('id'): var.text for var in vars_root}

        # Get schema block
        schema_block = xpath('//b:block[@id="kairos_schema"]', tree_root)
        assert len(schema_block) == 1
        schema_block = schema_block[0]
        schema_name = xpath('b:field[@name="NAME"]', schema_block)[0].text
        schema_cur_step = xpath('b:statement[@name="DO"]/b:block', schema_block)

        # Get schema steps
        steps = Schema._process_steps(schema_cur_step)

        # TODO: process opts

        return Schema(schema_name, vars, steps, [], [])

    @staticmethod
    # TODO: fill out 'order' map here
    def _process_steps(cur_step):
        steps = []
        while len(cur_step) > 0:
            cur_step = cur_step[0]
            if cur_step.get('type') == 'kairos_control_parallel':
                child_step = xpath('b:statement[@name="DO"]/b:block', cur_step)
                new_steps = Schema._process_steps(child_step)
            else:
                new_steps = [Step.from_xml_block(cur_step)]
            cur_step = xpath('b:next/b:block', cur_step)
            steps.append(new_steps)
        return list(itertools.chain.from_iterable(steps))


if __name__ == '__main__':
    # TODO: beware of all xmlns, other than 'b', that might "randomly" occur
    bxml_path = sys.argv[1]
    Schema.from_xml(bxml_path)
