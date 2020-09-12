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

var events_connections = Object.keys(events_args).concat(["kairos_control_parallel", "kairos_control_xor"]);

Blockly.defineBlocksWithJsonArray([
    {
        "type": "kairos_control_schema",
        "message0": "schema %1",
        "args0": [{
            "type": "field_input",
            "name": "NAME",
        }],
        "message1": "do %1",
        "args1": [{
            "type": "input_statement",
            "name": "DO",
        }],
        "message2": "opts %1",
        "args2": [{
            "type": "input_statement",
            "name": "TC",
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
        "previousStatement": ["kairos_control_type_constraint"],
        "nextStatement": ["kairos_control_type_constraint"],
        "style": "text_blocks",
    }
]);

// Extensions

/*
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
*/

// Blockly.Extensions.registerMixin('kairos_events_checkVarsNamesAndTypes',
//     Blockly.Constants.Kairos.EVENTS_ONCHANGE_MIXIN);

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
        if (block.type == 'variables_get') {
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

    var vars_slots = {};
    var blocks = workspace.getAllBlocks(false);
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
        var inst_handler = "instantiateVar(\"" + typeCheckVarDescr[i][0] + "\")";
        var add_cons_handler = "addConstraint(\"" + typeCheckVarDescr[i][0] + "\",\"" + typeCheckVarDescr[i][1].join(',') + "\")";
        var var_types_html = [];
        for (var j = 0; j < typeCheckVarDescr[i][1].length; j++) {
            var type_name = typeCheckVarDescr[i][1][j];
            var type_tooltip = slot_types[type_name] || "";
            var_types_html.push("<span title='" + type_tooltip + "'>" + type_name + "</span>");
        }
        typeCheckVarDescrHTML += "<button onclick='" + add_cons_handler + "'>" + typeCheckVarDescr[i][0] + "</button> : " + var_types_html.join(", ") + "<br>";
        prev_var_name = typeCheckVarDescr[i][0];
    }
    document.getElementById('typeCheckVars').innerHTML = typeCheckVarDescrHTML;
}

function addConstraint(var_name, var_types) {
    var schema_block = workspace.getBlockById('kairos_schema');

    var tc_var_set = new Set();
    var tc_root = schema_block;
    var flag = true;
    while (flag) {
        flag = false;
        var tc_children = tc_root.getChildren(false);
        for (var i = 0; i < tc_children.length; i++) {
            var tc_child = tc_children[i];
            if (tc_child.type === 'kairos_control_type_constraint') {
                tc_var_set.add(tc_child.getFieldValue('VAR'));
                tc_root = tc_child;
                flag = true;
                break;
            }
        }
    }

    var tc_xml = "<xml xmlns='https://developers.google.com/blockly/xml'><block type='kairos_control_type_constraint' movable='false'>" +
        "<field name=\"VAR\">" + var_name + "</field>" +
        "<field name=\"TYPES\">" + var_types + "</field>" +
        "<field name=\"REF\"></field></block></xml>";
    var dom = Blockly.Xml.textToDom(tc_xml);
    var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
    var block = workspace.getBlockById(new_block_id);
    if (tc_var_set.has(block.getFieldValue('VAR'))) {
        block.dispose(true);
    } else {
        var tc_connection = schema_block.getInput('TC').connection;
        tc_connection.connect(block.previousConnection);
    }
}

function setTypecheck(new_typecheck_value) {
    is_enabled_typecheck = new_typecheck_value;
    if (is_enabled_typecheck) {
        typecheck();
    }
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

function createNamedVariable(var_name, is_unique_name) {
    function incrName(varName) {
        if (/\w+_\d+/.test(varName)) {
            var res = varName.split('_');
            return res[0] + '_' + (parseInt(res[1]) + 1).toString();
        } else {
            return varName + "_2";
        }
    }

    if (is_unique_name) {
        var all_used_var_models = workspace.getAllVariables();
        var inv_used_vars_set = new Set();
        all_used_var_models.forEach(function(used_var) {
            inv_used_vars_set.add(used_var.name);
        });
        while (inv_used_vars_set.has(var_name)) {
            var_name = incrName(var_name);
        }
    }
    var xml = '<block type="variables_get"><field name="VAR">' + var_name + '</field></block>';
    xml = '<xml xmlns="https://developers.google.com/blockly/xml">' + xml + '</xml>';
    var dom = Blockly.Xml.textToDom(xml);
    var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
    var block = workspace.getBlockById(new_block_id);
    return block;
}

function createVariableHandler(button) {
    Blockly.Variables.promptName('Enter variable name:', '', function(var_name) {
        if (!var_name) {
            return;
        }
        var block = createNamedVariable(var_name, false);
        var metrics = workspace.getMetrics();
        var rnd_x = Math.random() * 0.5 + 0.25, rnd_y = Math.random() * 0.5 + 0.25;
        block.moveBy((rnd_x * metrics.viewWidth + metrics.viewLeft) / workspace.scale, (rnd_y * metrics.viewHeight + metrics.viewTop) / workspace.scale);
        Blockly.hideChaff();
    })
}

function kairos_init() {
    var schema_xml = "<xml xmlns='https://developers.google.com/blockly/xml'><block id='kairos_schema' type='kairos_control_schema' deletable='false'>\n" +
        "<field name=\"NAME\">TestSchema001</field>\n" +
        "</block></xml>";
    var dom = Blockly.Xml.textToDom(schema_xml);
    var new_block_id = Blockly.Xml.domToWorkspace(dom, workspace)[0];
    var block = workspace.getBlockById(new_block_id);
    block.moveBy(50, 50);
}
