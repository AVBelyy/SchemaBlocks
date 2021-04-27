/**
 * @fileoverview KAIROS blocks for Blockly.
 * @author abel@jhu.edu (Anton Belyy)
 */
'use strict';

var is_enabled_typecheck = true;

goog.provide('Blockly.Constants.Kairos');

goog.require('Blockly');
goog.require('Blockly.Blocks');

function slots2types(var_slots) {
    var_slots = Array.from(var_slots);
    var types = new Set();
    for (var i = 0; i < var_slots.length; i++) {
        var var_slot_str = var_slots[i];
        var event_name_and_arg_id = var_slot_str.split("_arg_");
        var event_name = event_name_and_arg_id[0], arg_id = event_name_and_arg_id[1];
        var slot_types = new Set(events_args[event_name][arg_id][1]);
        if (i === 0) {
            types = slot_types;
        } else {
            types = new Set([...types].filter(i => slot_types.has(i)));
        }
    }
    return types;
}

function typecheck() {
    function get_all_vars(block) {
        if (block.type === 'variables_get') {
            return [block];
        } else if (block.type.startsWith('kairos_control_multivar')) {
            var output = [];
            var block_children = block.getChildren(false);
            for (var i = 0; i < block_children.length; i++) {
                var child_vars = get_all_vars(block_children[i]);
                for (var j = 0; j < child_vars.length; j++) {
                    output.push(child_vars[j]);
                }
            }
            return output;
        } else {
            return [];
        }
    }

    var all_unused_vars = new Set(workspace.getAllVariables().map(x => x.getId()));
    var all_used_vars = new Set();
    var vars_slots = {};
    var tc_var_id_set = new Set();
    var blocks = workspace.getAllBlocks(false);
    var schema_block = workspace.getBlockById('kairos_schema');

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.type !== 'kairos_control_type_constraint') {
            var blockVariables = block.getVarModels();
            if (blockVariables) {
                for (var j = 0; j < blockVariables.length; j++) {
                    var variable = blockVariables[j];
                    var var_id = variable.getId();
                    if (var_id) {
                        all_used_vars.add(var_id)
                    }
                }
            }
        }
    }
    all_unused_vars = new Set([...all_unused_vars].filter(x => !all_used_vars.has(x)));
    all_unused_vars.forEach(function(var_id) {
        workspace.deleteVariableById(var_id);
    });

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.type.includes('kairos_event_') && block.type.includes('_part_')) {
            var event_name_and_part_id_str = block.type.substr('kairos_event_'.length);
            var event_name_and_part_id = event_name_and_part_id_str.split('_part_');
            var event_name = event_name_and_part_id[0], part_id = parseInt(event_name_and_part_id[1]);
            var args_ids = events_parts_args[event_name][part_id];
            for (var j = 0; j < args_ids.length; j++) {
                var arg_id = args_ids[j];
                var arg_name = events_args[event_name][arg_id][0];
                var arg_block = block.getInput(arg_name).connection.targetBlock();
                if (arg_block) {
                    var arg_all_vars = get_all_vars(arg_block);
                    for (var k = 0; k < arg_all_vars.length; k++) {
                        var var_block = arg_all_vars[k];
                        console.assert(var_block.type === 'variables_get');
                        var var_id = var_block.getFieldValue('VAR');
                        if (!(var_id in vars_slots)) {
                            vars_slots[var_id] = new Set();
                        }
                        var event_name_and_arg_id = event_name + "_arg_" + arg_id.toString();
                        vars_slots[var_id].add(event_name_and_arg_id);
                    }
                }
            }
        } else if(block.type === 'kairos_control_type_constraint') {
            var var_id = block.getFieldValue('VAR');
            if (!all_used_vars.has(var_id)) {
                block.dispose(true);
            } else {
                tc_var_id_set.add(var_id);
            }
        }
    }
    var vars_types = {};
    for (var var_id in vars_slots) {
        vars_types[var_id] = slots2types(vars_slots[var_id]);
    }

    // var typeCheckVarDescr = [];
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.type === "variables_get") {
            var var_id = block.getFieldValue('VAR');
            if (var_id in vars_types) {
                if (vars_types[var_id].size === 0) {
                    block.setEnabled(false);
                    block.setTooltip('This variable has contradicting types from the slots it is used in.');
                } else {
                    var variable = workspace.getVariableById(var_id);
                    var types = Array.from(vars_types[var_id]);
                    types.sort();
                    // typeCheckVarDescr.push([variable.name, types]);
                    if (!tc_var_id_set.has(var_id)) {
                        addConstraint(variable.name, types.join(','), schema_block);
                        tc_var_id_set.add(var_id);
                    }
                    block.setEnabled(true);
                    block.setTooltip(Blockly.Msg['VARIABLES_GET_TOOLTIP']);
                }
            }
        }
    }
}

function addConstraint(var_name, var_types, schema_block) {
    var tc_xml = "<xml xmlns='https://developers.google.com/blockly/xml'><block type='kairos_control_type_constraint'>" +
        "<field name=\"VAR\">" + var_name + "</field>" +
        "<field name=\"TYPES\">" + var_types + "</field>" +
        "<field name=\"REF\"></field></block></xml>";
    var dom = Blockly.Xml.textToDom(tc_xml);
    var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
    var block = workspace.getBlockById(new_block_id);
    var tc_connection = schema_block.getInput('TC').connection;
    tc_connection.connect(block.previousConnection);
}

function workspaceOnChangeListener(e) {
    if (is_enabled_typecheck) {
        typecheck();
    }
    if (e.type === Blockly.Events.UI && e.element === "click") {
        var block = workspace.getBlockById(e.blockId);
        if (block.type.startsWith("kairos_event_")) {
            var event_and_arg_name = block.type.substr("kairos_event_".length).split("_arg_");
            if (event_and_arg_name.length === 2) {
                addNewVariable(block.getParent(), event_and_arg_name[0], event_and_arg_name[1]);
            }
        }
    }
}

function addNewVariable(parent_block, event_name, arg_name) {
    var arg_connection = parent_block.getInput(arg_name).connection;
    var var_block = createNamedVariable(arg_name, true);
    arg_connection.connect(var_block.outputConnection);
}

function showHelp() {
    var dont_show_help_flag = localStorage.getItem('dont-show-help-on-startup');
    document.getElementById('dont-show-help-on-startup').checked = (dont_show_help_flag === 'true');
    if (dont_show_help_flag !== 'true') {
        document.getElementById('show-help').click();
    }
}

function toXml() {
    var xml = Blockly.Xml.workspaceToDom(workspace);
    var contents = Blockly.Xml.domToPrettyText(xml);
    var cur_schema_block = workspace.getBlockById('kairos_schema');
    var schema_name;

    if (loaded_schema_name) {
        schema_name = loaded_schema_name;
    } else if (cur_schema_block) {
        schema_name = cur_schema_block.getFieldValue('NAME') || 'schema';
    } else {
        schema_name = 'schema';
    }
    schema_name = schema_name.replace(/[^a-z0-9]/gi, '_');
    download(schema_name + ".xml", contents);
}

function ontInit() {
    loadJS('ontologies/kairos/kairos_ontology.js', function() {
        loadJS('ontologies/kairos/kairos_blocks.js');

        var events_connections = events_types.concat(["kairos_control_parallel", "kairos_control_linear", "kairos_control_xor"]);

        Blockly.defineBlocksWithJsonArray([
            {
                "type": "kairos_control_schema",
                "message0": "schema %1",
                "args0": [{
                    "type": "field_input",
                    "name": "NAME",
                }],
                "message1": "steps %1",
                "args1": [{
                    "type": "input_statement",
                    "name": "DO",
                    "check": events_connections,
                }],
                "message2": "entities %1",
                "args2": [{
                    "type": "input_statement",
                    "name": "TC",
                    "check": ["kairos_control_type_constraint"],
                }],
                "message3": "relations %1",
                "args3": [{
                    "type": "input_statement",
                    "name": "relations",
                    "check": relations_types,
                }],

                "inputsInline": false,
                "style": "math_blocks",
            },
        ]);

        Blockly.defineBlocksWithJsonArray([
            {
                "type": "kairos_control_parallel",
                "message0": "in any order",
                "message1": "do %1",
                "args1": [{
                    "type": "input_statement",
                    "name": "DO"
                }],
                "previousStatement": events_connections,
                "nextStatement": events_connections,
                "style": "list_blocks",
                "extensions": [
                ]
            },
        ]);

        Blockly.defineBlocksWithJsonArray([
            {
                "type": "kairos_control_linear",
                "message0": "in linear order",
                "message1": "do %1",
                "args1": [{
                    "type": "input_statement",
                    "name": "DO"
                }],
                "previousStatement": events_connections,
                "nextStatement": events_connections,
                "style": "list_blocks",
                "extensions": [
                ]
            },
        ]);

        Blockly.defineBlocksWithJsonArray([
            {
                "type": "kairos_control_xor",
                "message0": "mutually exclusive",
                "message1": "do %1",
                "args1": [{
                    "type": "input_statement",
                    "name": "DO"
                }],
                "previousStatement": events_connections,
                "nextStatement": events_connections,
                "style": "list_blocks",
                "extensions": [
                ]
            },
        ]);

        var multivar_msg = "%1";
        var multivar_args = [{"type": "input_value", "name": "VAR1", "check": ["variables_get", "kairos_multivar"]}];
        for (var i = 2; i <= 5; i++) {
            multivar_msg += ", %" + i;
            multivar_args.push({"type": "input_value", "name": "VAR" + i, "check": ["variables_get", "kairos_multivar"]});
            Blockly.defineBlocksWithJsonArray([{
                "type": "kairos_control_multivar_" + i,
                "message0": JSON.parse(JSON.stringify(multivar_msg)), // make a deep copy
                "args0": JSON.parse(JSON.stringify(multivar_args)), // make a deep copy
                "inputsInline": true,
                "style": "variable_blocks",
                "output": "kairos_multivar"
            }]);
        }

        Blockly.defineBlocksWithJsonArray([
            {
                "type": "kairos_control_type_constraint",
                "message0": "Constrain %1 to types %2 and reference %3",
                "args0": [
                    {
                        "type": "field_variable",
                        "name": "VAR"
                    },
                    {
                        "type": "field_input",
                        "name": "TYPES"
                    },
                    {
                        "type": "field_input",
                        "name": "REF"
                    }
                ],
                "inputsInline": true,
                "previousStatement": ["kairos_control_type_constraint"],
                "nextStatement": ["kairos_control_type_constraint"],
                "style": "text_blocks",
            }
        ]);

        var schema_xml = "<xml xmlns='https://developers.google.com/blockly/xml'><block id='kairos_schema' type='kairos_control_schema' deletable='false'>\n" +
            "<field name=\"NAME\">TestSchema</field>\n" +
            "</block></xml>";
        var dom = Blockly.Xml.textToDom(schema_xml);
        var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
        var block = workspace.getBlockById(new_block_id);
        block.moveBy(50, 50);

        $('#helpModal').on('hide.bs.modal', function () {
            var dont_show_help_flag = document.getElementById('dont-show-help-on-startup').checked === true;
            localStorage.setItem('dont-show-help-on-startup', dont_show_help_flag);
        })
        // showHelp();
    });
}
