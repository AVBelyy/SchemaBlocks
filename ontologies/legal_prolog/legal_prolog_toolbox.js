var toolbox_xml = `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-legal_prolog-blocks" style="display: none">
<category name="Clauses" categorystyle="loop_category">
  <block type="lp_clause"></block>
</category>
<category name="Logic" categorystyle="logic_category">
  <block type="lp_and"></block>
  <block type="lp_or"></block>
  <block type="lp_not"></block>
  <block type="lp_compare"></block>
</category>
<category name="Events" categorystyle="list_category">
  <block type="lp_event">
    <value name="event"><shadow type="lp_shadow_Event"/></value>
  </block>
  <block type="lp_prop_agent"><value name="prop"><shadow type="lp_shadow_Agent"/></value></block>
  <block type="lp_prop_agent_full"><value name="event"><shadow type="lp_shadow_Event"/></value><value name="prop"><shadow type="lp_shadow_Agent"/></value></block>
  <block type="lp_prop_patient"><value name="prop"><shadow type="lp_shadow_Patient"/></value></block>
  <block type="lp_prop_patient_full"><value name="event"><shadow type="lp_shadow_Event"/></value><value name="prop"><shadow type="lp_shadow_Patient"/></value></block>
  <block type="lp_prop_amount"><value name="prop"><shadow type="lp_shadow_Amount"/></value></block>
  <block type="lp_prop_amount_full"><value name="event"><shadow type="lp_shadow_Event"/></value><value name="prop"><shadow type="lp_shadow_Amount"/></value></block>
  <block type="lp_prop_purpose"><value name="prop"><shadow type="lp_shadow_Purpose"/></value></block>
  <block type="lp_prop_purpose_full"><value name="event"><shadow type="lp_shadow_Event"/></value><value name="prop"><shadow type="lp_shadow_Purpose"/></value></block>
  <block type="lp_prop_start"><value name="prop"><shadow type="lp_shadow_Day"/></value></block>
  <block type="lp_prop_start_full"><value name="event"><shadow type="lp_shadow_Event"/></value><value name="prop"><shadow type="lp_shadow_Day"/></value></block>
  <block type="lp_prop_end"><value name="prop"><shadow type="lp_shadow_Day"/></value></block>
  <block type="lp_prop_end_full"><value name="event"><shadow type="lp_shadow_Event"/></value><value name="prop"><shadow type="lp_shadow_Day"/></value></block>
</category>
    <category name="Math" categorystyle="math_category">
      <block type="math_number" gap="32">
        <field name="NUM">123</field>
      </block>
      <block type="math_arithmetic">
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="math_single">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">9</field>
          </shadow>
        </value>
      </block>
      <block type="math_trig">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">45</field>
          </shadow>
        </value>
      </block>
      <block type="math_constant"></block>
      <block type="math_number_property">
        <value name="NUMBER_TO_CHECK">
          <shadow type="math_number">
            <field name="NUM">0</field>
          </shadow>
        </value>
      </block>
      <block type="math_round">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">3.1</field>
          </shadow>
        </value>
      </block>
      <block type="math_on_list"></block>
      <block type="math_modulo">
        <value name="DIVIDEND">
          <shadow type="math_number">
            <field name="NUM">64</field>
          </shadow>
        </value>
        <value name="DIVISOR">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
      <block type="math_constrain">
        <value name="VALUE">
          <shadow type="math_number">
            <field name="NUM">50</field>
          </shadow>
        </value>
        <value name="LOW">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="HIGH">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_int">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_float"></block>
      <block type="math_atan2">
        <value name="X">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="Y">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
    </category>
    <category name="Text" categorystyle="text_category">
      <block type="text"></block>
      <block type="text_multiline"></block>
      <block type="text_join"></block>
      <block type="text_append">
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <block type="text_length">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_isEmpty">
        <value name="VALUE">
          <shadow type="text">
            <field name="TEXT"></field>
          </shadow>
        </value>
      </block>
      <block type="text_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">text</field>
          </block>
        </value>
        <value name="FIND">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_charAt">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">text</field>
          </block>
        </value>
      </block>
      <block type="text_getSubstring">
        <value name="STRING">
          <block type="variables_get">
            <field name="VAR">text</field>
          </block>
        </value>
      </block>
      <block type="text_changeCase">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_trim">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_count">
        <value name="SUB">
          <shadow type="text"></shadow>
        </value>
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <block type="text_replace">
        <value name="FROM">
          <shadow type="text"></shadow>
        </value>
        <value name="TO">
          <shadow type="text"></shadow>
        </value>
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <block type="text_reverse">
        <value name="TEXT">
          <shadow type="text"></shadow>
        </value>
      </block>
      <label text="Input/Output:" web-class="ioLabel"></label>
      <block type="text_print">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
      <block type="text_prompt_ext">
        <value name="TEXT">
          <shadow type="text">
            <field name="TEXT">abc</field>
          </shadow>
        </value>
      </block>
    </category>
    <category name="Lists" categorystyle="list_category">
      <block type="lists_create_with">
        <mutation items="0"></mutation>
      </block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat">
        <value name="NUM">
          <shadow type="math_number">
            <field name="NUM">5</field>
          </shadow>
        </value>
      </block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_indexOf">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_getIndex">
        <value name="VALUE">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_setIndex">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_getSublist">
        <value name="LIST">
          <block type="variables_get">
            <field name="VAR">list</field>
          </block>
        </value>
      </block>
      <block type="lists_split">
        <value name="DELIM">
          <shadow type="text">
            <field name="TEXT">,</field>
          </shadow>
        </value>
      </block>
      <block type="lists_sort"></block>
      <block type="lists_reverse"></block>
    </category>
<sep></sep>
<category name="Functions" categorystyle="procedure_category">
    <block type="lp_clause_applies"></block>
    <block type="lp_spf_applies"></block>
    <block type="lp_is_during"><value name="day1"><shadow type="lp_shadow_Day1"/></value><value name="day2"><shadow type="lp_shadow_Day2"/></value></block>
    <block type="lp_is_before"><value name="day1"><shadow type="lp_shadow_Day1"/></value><value name="day2"><shadow type="lp_shadow_Day2"/></value></block>
    <block type="lp_is_after"><value name="day1"><shadow type="lp_shadow_Day1"/></value><value name="day2"><shadow type="lp_shadow_Day2"/></value></block>
    <block type="lp_is_before_or_during"><value name="day1"><shadow type="lp_shadow_Day1"/></value><value name="day2"><shadow type="lp_shadow_Day2"/></value></block>
    <block type="lp_is_after_or_during"><value name="day1"><shadow type="lp_shadow_Day1"/></value><value name="day2"><shadow type="lp_shadow_Day2"/></value></block>
    <block type="lp_is_year_of"><value name="year"><shadow type="lp_shadow_Year"/></value><value name="date"><shadow type="lp_shadow_Date"/></value></block>
    <block type="lp_first_day_year"><value name="day"><shadow type="lp_shadow_Day"/></value><value name="year"><shadow type="lp_shadow_Year"/></value></block>
    <block type="lp_last_day_year"><value name="day"><shadow type="lp_shadow_Day"/></value><value name="year"><shadow type="lp_shadow_Year"/></value></block>
    <block type="lp_is_child_of"><value name="child"><shadow type="lp_shadow_Child"/></value><value name="parent"><shadow type="lp_shadow_Parent"/></value><value name="start"><shadow type="lp_shadow_Start"/></value><value name="end"><shadow type="lp_shadow_End"/></value></block>
    <block type="lp_is_stepparent_of"><value name="stepchild"><shadow type="lp_shadow_Stepchild"/></value><value name="stepparent"><shadow type="lp_shadow_Stepparent"/></value><value name="start"><shadow type="lp_shadow_Start"/></value><value name="end"><shadow type="lp_shadow_End"/></value></block>
    <block type="lp_is_sum_of"><value name="sum"><shadow type="lp_shadow_Sum"/></value><value name="list"><shadow type="lp_shadow_List"/></value></block>
</category>
<category name="Variables" categorystyle="variable_category">
  <button text="Create variable" callbackKey="CREATE_VARIABLE"></button>
  <block type="lp_wildcard"></block>
  <block type="lp_goal"></block>
  <block type="lp_fork2"></block>
  <block type="lp_fork3"></block>
  <block type="lp_multivar_2"></block>
  <block type="lp_multivar_3"></block>
  <block type="lp_multivar_4"></block>
  <block type="lp_multivar_5"></block>
  <block type="lp_multivar_6"></block>
  <block type="lp_multivar_7"></block>
  <block type="lp_multivar_8"></block>
</category>
</xml>
`;
