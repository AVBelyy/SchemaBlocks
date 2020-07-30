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

goog.provide('Blockly.Constants.Kairos');

goog.require('Blockly');
goog.require('Blockly.Blocks');


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
        if (this.isInFlyout && this.type.includes('kairos_event_') && this.type.includes('_part_')) {
            var pvm = this.workspace.getPotentialVariableMap();
            var all_used_var_models = this.workspace.getAllVariables();
            // Build a var model map for all used vars
            var used_vars_map = {};
            var inv_used_vars_map = {};
            all_used_var_models.forEach(function(used_var) {
                used_vars_map[used_var.getId()] = used_var.name;
                inv_used_vars_map[used_var.name] = true;
            });
            var children = this.getChildren(false);
            children.forEach(function(child) {
                if (child.type == "variables_get") {
                    var var_id = child.getFieldValue('VAR');
                    if (var_id in used_vars_map) {
                        var new_name = used_vars_map[var_id];
                        do {
                            new_name = Blockly.Constants.Kairos.EVENTS_ONCHANGE_MIXIN.incrName(new_name);
                        } while (new_name in inv_used_vars_map);
                        var new_var_model = pvm.createVariable(new_name).getId();
                        child.setFieldValue(new_var_model, 'VAR');
                    }
                }
            });
        }


    }
};

Blockly.Extensions.registerMixin('kairos_events_checkVarName',
    Blockly.Constants.Kairos.EVENTS_ONCHANGE_MIXIN);
