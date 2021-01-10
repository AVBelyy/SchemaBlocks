function workspaceOnChangeListener(e) {
}

function createShadowBlocks(texts) {
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        Blockly.defineBlocksWithJsonArray([
            {
                "type": "lp_shadow_" + text,
                "message0": text,
                "output": null,
                "colour": 330,
                "tooltip": "",
                "helpUrl": ""
            }
        ]);
    }
}

function toXml() {
    var xml = Blockly.Xml.workspaceToDom(workspace);
    var contents = Blockly.Xml.domToPrettyText(xml);
    download('legal_prolog.xml', contents);
}

function ontInit() {
    // Import additional Blockly blocks
    loadJS('blockly/blocks/math.js');
    loadJS('blockly/blocks/text.js');
    loadJS('blockly/blocks/lists.js');

    // Define shadow blocks
    createShadowBlocks(['Event', 'Agent', 'Patient', 'Amount', 'Purpose', 'Day', 'Year']);
    createShadowBlocks(['Day1', 'Day2', 'Child', 'Parent', 'Stepchild', 'Stepparent', 'Start', 'End']);

    // Top-level blocks
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "lp_clause",
            "message0": "clause %1 over %2 holds if ALL %3 %4",
            "args0": [
                {
                    "type": "field_input",
                    "name": "name",
                    "text": "s2_a_1"
                },
                {
                    "type": "input_value",
                    "name": "name"
                },
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "body"
                }
            ],
            "colour": 135,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_event",
            "message0": "%1 is a %2 event, where %3 %4",
            "args0": [
                {
                    "type": "input_value",
                    "name": "event"
                },
                {
                    "type": "field_dropdown",
                    "name": "event_type",
                    "options": [
                        [
                            "marriage",
                            "marriage"
                        ],
                        [
                            "death",
                            "death"
                        ],
                        [
                            "payment",
                            "payment"
                        ],
                        [
                            "residence",
                            "residence"
                        ]
                    ]
                },
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "properties"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_and",
            "message0": "holds if ALL %1 %2",
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "body"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_or",
            "message0": "holds if ANY %1 %2",
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "body"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_not",
            "message0": "does NOT hold %1 %2",
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "body"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_clause_applies",
            "message0": "clause %1 applies to %2",
            "args0": [
                {
                    "type": "field_input",
                    "name": "name",
                    "text": "name"
                },
                {
                    "type": "input_value",
                    "name": "name"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_spf_applies",
            "message0": "spf %1 applies to %2",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "name",
                    "options": [
                        [
                            "split_string",
                            "split_string"
                        ],
                        [
                            "atom_number",
                            "atom_number"
                        ],
                        [
                            "var",
                            "var"
                        ],
                        [
                            "findall",
                            "findall"
                        ],
                        [
                            "sum_list",
                            "sum_list"
                        ]
                    ]
                },
                {
                    "type": "input_value",
                    "name": "spf"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "Standard Prolog Function",
            "helpUrl": ""
        },
        {
            "type": "lp_compare",
            "message0": "%1 %2 %3 %4",
            "args0": [
                {
                    "type": "input_value",
                    "name": "lhs"
                },
                {
                    "type": "field_dropdown",
                    "name": "comparator",
                    "options": [
                        [
                            "=",
                            "eq"
                        ],
                        [
                            "≠",
                            "neq"
                        ],
                        [
                            "<",
                            "lt"
                        ],
                        [
                            "≤",
                            "leq"
                        ],
                        [
                            ">",
                            "gt"
                        ],
                        [
                            "≥",
                            "geq"
                        ]
                    ]
                },
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_value",
                    "name": "rhs"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        }
    ]);

    // Legal Prolog functions
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "lp_is_before",
            "message0": "%1 is before %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "day1"
                },
                {
                    "type": "input_value",
                    "name": "day2"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_first_day_year",
            "message0": "%1 is the first day in %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "day"
                },
                {
                    "type": "input_value",
                    "name": "year"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_last_day_year",
            "message0": "%1 is the last day in %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "day"
                },
                {
                    "type": "input_value",
                    "name": "year"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_is_child_of",
            "message0": "%1 is the child of %2 from %3 to %4",
            "args0": [
                {
                    "type": "input_value",
                    "name": "child"
                },
                {
                    "type": "input_value",
                    "name": "parent"
                },
                {
                    "type": "input_value",
                    "name": "start"
                },
                {
                    "type": "input_value",
                    "name": "end"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_is_stepparent_of",
            "message0": "%1 is the stepparent of %2 from %3 to %4",
            "args0": [
                {
                    "type": "input_value",
                    "name": "stepchild"
                },
                {
                    "type": "input_value",
                    "name": "stepparent"
                },
                {
                    "type": "input_value",
                    "name": "start"
                },
                {
                    "type": "input_value",
                    "name": "end"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_wildcard",
            "message0": "_",
            "output": null,
            "colour": 330,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_fork2",
            "message0": "%1 %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "top"
                },
                {
                    "type": "input_value",
                    "name": "bottom"
                }
            ],
            "inputsInline": false,
            "output": null,
            "colour": 330,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_fork3",
            "message0": "%1 %2 %3",
            "args0": [
                {
                    "type": "input_value",
                    "name": "top"
                },
                {
                    "type": "input_value",
                    "name": "middle"
                },
                {
                    "type": "input_value",
                    "name": "bottom"
                }
            ],
            "inputsInline": false,
            "output": null,
            "colour": 330,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_goal",
            "message0": "holds if ALL %1 %2",
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "body"
                }
            ],
            "output": null,
            "colour": 330,
            "tooltip": "",
            "helpUrl": ""
        }
    ]);

    // Event properties
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "lp_prop_agent",
            "message0": "%1 is the agent",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 300,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_agent_full",
            "message0": "%1 is the agent of %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                },
                {
                    "type": "input_value",
                    "name": "event"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_patient",
            "message0": "%1 is the patient",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 300,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_patient_full",
            "message0": "%1 is the patient of %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                },
                {
                    "type": "input_value",
                    "name": "event"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_amount",
            "message0": "%1 is the amount",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 300,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_amount_full",
            "message0": "%1 is the amount of %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                },
                {
                    "type": "input_value",
                    "name": "event"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_purpose",
            "message0": "%1 is the purpose",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 300,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_purpose_full",
            "message0": "%1 is the purpose of %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                },
                {
                    "type": "input_value",
                    "name": "event"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_start",
            "message0": "event starts on %1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 300,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_start_full",
            "message0": "%1 starts on %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "event"
                },
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_end",
            "message0": "event ends on %1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 300,
            "tooltip": "",
            "helpUrl": ""
        },
        {
            "type": "lp_prop_end_full",
            "message0": "%1 ends on %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "event"
                },
                {
                    "type": "input_value",
                    "name": "prop"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 230,
            "tooltip": "",
            "helpUrl": ""
        }
    ]);

    var multivar_msg = "%1";
    var multivar_args = [{"type": "input_value", "name": "VAR1"}];
    for (var i = 2; i <= 8; i++) {
        multivar_msg += ", %" + i;
        multivar_args.push({"type": "input_value", "name": "VAR" + i});
        Blockly.defineBlocksWithJsonArray([{
            "type": "lp_multivar_" + i,
            "message0": JSON.parse(JSON.stringify(multivar_msg)), // make a deep copy
            "args0": JSON.parse(JSON.stringify(multivar_args)), // make a deep copy
            "inputsInline": true,
            "style": "variable_blocks",
            "output": "lp_multivar"
        }]);
    }
}