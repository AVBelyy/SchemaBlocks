# Overview

schema-ui provides a visual, intuitive way to design and represent *schemas*, or complex scenarios involving multiple steps, participants and relations.

The main intended use-case is KAIROS TA1 schema creation, but in theory it should work with any similar ontology that defines events, entities and relations. It would also be interesting to apply schema-ui for KAIROS TA2 schema instantiation.

schema-ui is based on the [Google Blockly](https://github.com/google/blockly) library and abides by the following principles:
* Everything is a Block: all schema parts -- steps, slots, relations, and slot constraints -- are represented as blocks,
* What You See is What You Get: every property of any block can be modified in UI, meaning there is no hidden state,
* If It Compiles, It Works: by using block typing and post-hoc checks, we ensure that a valid schema block on the screen always results in a syntactically correct schema file.

Below we describe what these principles mean in more detail.

# Everything is a Block

In Blockly, everything is expressed with blocks. Blocks can represent *expressions*, *variables*, and *statements*. In schema-ui, we represent:
* schema steps as statement blocks, that can be nested vertically to represent chains of events,
* schema and steps' slots as expressions, where each slot can be filled in by one or many variable blocks, and each variable can be part of one or many slots (to represent co-reference),
* slots' type constraints are represented as statement blocks (but their order is ignored),
* the top-level schema block is a singleton block (to work with one schema at a time), that has multiple *connections*, or "sockets" to attach the above blocks

There are two additional "control", or meta blocks that express some meta information for other schema parts:
1. "in any order" / *parallel block*, a statement block that can connect with schema steps blocks. By default, the ordering of step blocks encodes the linear order of steps in the actual schema. In contrast, every child block of a parallel block represent an action, that can occur in any order wrt to other children of the same blocks. Parallel blocks can not be nested in one another.
2. *Multi-variable block*, an expression block that allow multiple variables to connect to a single slot. This allows to express  e.g. multiple components in the Assemble event.

# What You See is What You Get

Standrd Blockly blocks typically have none or few properties that are not displayed and hence cannot be edited by a user directly. We keep the same principle in schema-ui, allowing direct one-to-one mapping between the visual schema blocks and the internal Blockly XML format.

This format can then be mapped to other human-readable formats or to KAIROS JSON-LD schema format. For the latter, we provide a converter tool, located in `helpers/bxml2jsonld.py`. This conversion is straightforward from a user's perspective, but does include a couple JSON-LD-specific mappings. For instance, each Blockly blocks can have a "comment" attached to it. The converter tool interprets them differently based on a schema part: for the schema block, block comment becomes a schema's "description" in JSON-LD. For steps, and slots' type constraints, a block comment becomes a "comment" JSON-LD field.

# If It Compiles, It Works

When creating schema-ui, we wanted to strike a balance between the expressivity of Blockly and the strict typing rules of the schema data format. To achieve that, we utilize Blockly block typing and additional post-hoc validation to notify a user in an intuitive way when their actions results in a incorrect schema before submission, and what needs to be fixed. For example,
* schema steps and schema type constraints have different block types, and thus cannot be stacked or connected together,
* if the same variable is used in two or more slots, that have mutually exclusive type constraints, the variable blocks would become "disabled" in UI and a tooltip would suggest to use different variables for those slots,
* (TODO) if two parallel blocks are nested, the innermost one would become inactive, and a tooltip would suggest to merge those into a single parallel block.

schema-ui JSON-LD converter tool also makes writing JSON-LD @id's transparent for users by converting human-readable steps' and variables' names from Blockly XML into JSON-LD-compliant identifiers by removing whitespaces and slash symbols, prepending correct @id path prefixes, and resolving name collisions, if needed.

