/**
 * @license
 * Copyright 2012 Google LLC
 * Copyright 2020 Anton Belyy? (not sure though)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview KAIROS blocks for Blockly.
 * @author abel@jhu.edu (Anton Belyy)
 */
'use strict';

var is_enabled_typecheck = true;

goog.provide('Blockly.Constants.Kairos');

goog.require('Blockly');
goog.require('Blockly.Blocks');


Blockly.defineBlocksWithJsonArray([
    {
        "type": "kairos_control_schema",
        "message0": "schema %1",
        "args0": [{
            "type": "input_value",
            "name": "NAME"
        }],
        "message1": "do %1",
        "args1": [{
            "type": "input_statement",
            "name": "DO"
        }],
        "message2": "%1",
        "args2": [{
            "type": "input_value",
            "name": "TC0",
            "check": "kairos_control_type_constraint",
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
        "previousStatement": null,
        "nextStatement": null,
        "style": "list_blocks",
        "extensions": [
        ]
    },
]);

Blockly.defineBlocksWithJsonArray([
    {
        "type": "kairos_control_type_constraint",
        "message0": "constrain %1 to types %2 and reference %3",
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
        "output": "kairos_control_type_constraint",
        "style": "text_blocks",
    }
]);

// Extensions

Blockly.Constants.Kairos.EVENTS_ONCHANGE_MIXIN = {
    incrName: function(varName) {
        if (/\w+_\d+/.test(varName)) {
            var res = varName.split('_');
            return res[0] + '_' + (parseInt(res[1]) + 1).toString();
        } else {
            return varName + "_2";
        }
    },

    onchange: function(_e) {
        if (!this.workspace.isDragging || this.workspace.isDragging()) {
            return;  // Don't change state at the start of a drag.
        }
        if (this.type.includes('kairos_event_') && this.type.includes('_part_')) {
            // Make variable names unique in flyouts
            if (this.isInFlyout) {
                var pvm = this.workspace.getPotentialVariableMap();
                var all_used_var_models = this.workspace.getAllVariables();
                // Build a var model map for all used vars
                var used_vars_map = {};
                var inv_used_vars_set = new Set();
                all_used_var_models.forEach(function(used_var) {
                    used_vars_map[used_var.getId()] = used_var.name;
                    inv_used_vars_set.add(used_var.name);
                });
                var children = this.getChildren(false);
                children.forEach(function(child) {
                    console.assert(child.type === "variables_get");
                    var var_id = child.getFieldValue('VAR');
                    if (var_id in used_vars_map) {
                        var new_name = used_vars_map[var_id];
                        do {
                            new_name = Blockly.Constants.Kairos.EVENTS_ONCHANGE_MIXIN.incrName(new_name);
                        } while (inv_used_vars_set.has(new_name));
                        var new_var_model = pvm.createVariable(new_name).getId();
                        child.setFieldValue(new_var_model, 'VAR');
                    }
                });
            }
        }
    }
};

Blockly.Extensions.registerMixin('kairos_events_checkVarsNamesAndTypes',
    Blockly.Constants.Kairos.EVENTS_ONCHANGE_MIXIN);

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

function typecheck(ws) {
    var vars_slots = {};
    var blocks = ws.getAllBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.type.includes('kairos_event_') && block.type.includes('_part_')) {
            var event_name_and_part_id_str = block.type.substr('kairos_event_'.length);
            var event_name_and_part_id = event_name_and_part_id_str.split('_part_');
            var event_name = event_name_and_part_id[0], part_id = parseInt(event_name_and_part_id[1]);
            var children = block.getChildren(true);
            for (var part_offset = 0; part_offset < children.length; part_offset++) {
                var child = children[part_offset];
                console.assert(child.type === "variables_get");
                var var_id = child.getFieldValue('VAR');
                // compute arg_id
                var arg_id = events_parts_args[event_name][part_id][part_offset];
                if (!(var_id in vars_slots)) {
                    vars_slots[var_id] = new Set();
                }
                var event_name_and_arg_id = event_name + "_arg_" + arg_id.toString();
                vars_slots[var_id].add(event_name_and_arg_id);
            }
        }
    }
    var vars_types = {};
    for (var var_id in vars_slots) {
        vars_types[var_id] = slots2types(vars_slots[var_id]);
    }

    var typeCheckVarDescr = [];
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
                    typeCheckVarDescr.push([variable.name, types]);
                    block.setEnabled(true);
                    block.setTooltip(Blockly.Msg['VARIABLES_GET_TOOLTIP']);
                }
            }
        }
    }
    var typeCheckVarDescrHTML = "";
    typeCheckVarDescr.sort();
    var prev_var_name = null;
    for (var i = 0; i < typeCheckVarDescr.length; i++) {
        if (typeCheckVarDescr[i][0] === prev_var_name) {
            continue;
        }
        var onclick_handler = "addConstraint(\"" + typeCheckVarDescr[i][0] + "\",\"" + typeCheckVarDescr[i][1].join(',') + "\")";
        typeCheckVarDescrHTML += "<a style='cursor: pointer' onclick='" + onclick_handler + "'><b>" + typeCheckVarDescr[i][0] + "</b></a> : " + typeCheckVarDescr[i][1].join(", ") + "<br>";
        prev_var_name = typeCheckVarDescr[i][0];
    }
    document.getElementById('typeCheckVars').innerHTML = typeCheckVarDescrHTML;
}

function addConstraint(var_name, var_types) {
    var schema_block = workspace.getBlockById('kairos_schema');
    var first_free_tc = 0;
    while (workspace.getBlockById('kairos_schema_TC' + first_free_tc) !== null) {
        first_free_tc++;
    }
    var num_available_tc = 0;
    while (schema_block.getInput('TC' + num_available_tc) !== null) {
        var potential_input = workspace.getBlockById('kairos_schema_TC' + num_available_tc);
        if (potential_input !== null) {
            var var_id = potential_input.getFieldValue('VAR');
            if (var_id !== null) {
                var variable = workspace.getVariableById(var_id);
                if (variable.name === var_name) {
                    return;
                }
            }
        }
        num_available_tc++;
    }
    num_available_tc--;

    var schema_block_connection = schema_block.getInput('TC' + first_free_tc).connection;
    var schema_xml = "<xml xmlns='https://developers.google.com/blockly/xml'><block type='kairos_control_type_constraint' id='kairos_schema_TC" + first_free_tc + "' movable='false'>" +
        "<field name=\"VAR\">" + var_name + "</field>" +
        "<field name=\"TYPES\">" + var_types + "</field>" +
        "<field name=\"REF\"></field></block></xml>";
    var dom = Blockly.Xml.textToDom(schema_xml);
    var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
    var block = workspace.getBlockById(new_block_id);

    schema_block_connection.connect(block.outputConnection);

    if (first_free_tc === num_available_tc) {
        schema_block.appendValueInput('TC' + (first_free_tc + 1));
    }
}

function setTypecheck(new_typecheck_value) {
    is_enabled_typecheck = new_typecheck_value;
    if (is_enabled_typecheck) {
        typecheck(workspace);
    }
}

function workspaceOnChangeListener(e) {
    if (is_enabled_typecheck) {
        typecheck(workspace);
    }
}

function kairos_init() {
    var schema_xml = "<xml xmlns='https://developers.google.com/blockly/xml'><block id='kairos_schema' type='kairos_control_schema' deletable='false'>\n" +
        "<value name=\"NAME\"><shadow type=\"text\"><field name=\"TEXT\">TestSchema001</field></shadow></value>\n" +
        "</block></xml>";
    var dom = Blockly.Xml.textToDom(schema_xml);
    var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
    var block = workspace.getBlockById(new_block_id);
    block.moveBy(50, 50);
}
