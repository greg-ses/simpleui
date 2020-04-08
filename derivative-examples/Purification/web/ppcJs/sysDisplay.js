
// These functions support the main control system page.


var _MAX_NUM_ATTRIBS = 8;

function closeValve(valve) {

        document.getElementById(valve + "id").innerHTML = "closed";
        document.getElementById(valve + "id").style.backgroundColor = "OrangeRed";
}

function openValve(valve) {

    document.getElementById(valve + "id").innerHTML = "open";
    document.getElementById(valve + "id").style.backgroundColor = "LightGreen";
}

function closeUtilityValve(valve) {

    if (valve == "An Utility Valve") {
        document.getElementById("AnMix").hidden = false;
        document.getElementById("AnTransfer").hidden = true;
    }
    else if (valve == "Ca Utility Valve") {
        document.getElementById("CathMix").hidden = false;
        document.getElementById("CathTransfer").hidden = true;
    }
}

function openUtilityValve(valve) {
    if (valve == "An Utility Valve") {
        document.getElementById("AnMix").hidden = true;
        document.getElementById("AnTransfer").hidden = false;
    }
    else if (valve == "Ca Utility Valve") {
        document.getElementById("CathMix").hidden = true;
        document.getElementById("CathTransfer").hidden = false;
    }
}

function hideChargeIndicatorGifs() {
    document.getElementById("ChargeIndicator-1").hidden = true;
    document.getElementById("ChargeIndicator-2").hidden = true;
    document.getElementById("DischargeIndicator-1").hidden = true;
    document.getElementById("DischargeIndicator-2").hidden = true;

}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function parseAnalogInputData(xml_str, analogVarName, analogData) {


    var analog_xml = xmlFindTag(xml_str, "AnalogInputs", 1);
    analog_xml = xmlExtractElement(analog_xml);

    //Iterate through the analog variable list and update
    for (var loopCount = 0; loopCount < analogVarName.length; loopCount++) {

        analog_xml = xmlFindTag(xml_str, analogVarName[loopCount][0], 1);
        analog_xml = xmlExtractElement(analog_xml);
        //Assign tag name and value
        analogData[loopCount]["name"] = _tag_name;
        //display the data to the specified number of decimals
        analogData[loopCount]["val"] = Number(_val).toFixed(analogVarName[loopCount][7]); //parseFloat(_val, analogVarName[loopCount][7]);

        //Get the units field
        analog_xml = xmlFindTag(xml_str, analogVarName[loopCount][0] + "_Units", 1);
        analog_xml = xmlExtractElement(analog_xml);
        analogData[loopCount]["units"] = _val;


    }


}

function updateAnalogInputData(xml_str, analogVarName, analogData) {
    for (var loopCount = 0; loopCount < analogVarName.length; loopCount++) {

        document.getElementById(analogVarName[loopCount][0] + "id").innerHTML = analogData[loopCount]["val"] + " "
            + analogData[loopCount]["units"];

    }

    var currentSystemMode = xmlFindTag(xml_str, "System_Mode", 1);
    currentSystemMode = xmlExtractElement(currentSystemMode);
    currentSystemMode = _val;

    var currentSystemSubMode = xmlFindTag(xml_str, "System_SubMode", 1);
    currentSystemSubMode = xmlExtractElement(currentSystemSubMode);
    currentSystemSubMode = _val;

    document.getElementById("DischargeIndicator-1").hidden = currentSystemMode != "Discharge";
    document.getElementById("DischargeIndicator-2").hidden = currentSystemMode != "Discharge";
    document.getElementById("ChargeIndicator-1").hidden = currentSystemMode != "Charge";
    document.getElementById("ChargeIndicator-2").hidden = currentSystemMode != "Charge";

};

function parseData(xml_str, varName, varData) {
    var xmlData;

    for (var loopCount = 0; loopCount < varName.length; loopCount++) {

        xmlData = xmlFindTag(xml_str, varName[loopCount][0], 1);
        xmlData = xmlExtractElement(xmlData);
        //Assign tag name and value
        varData[loopCount]["name"] = _tag_name;
        //display the data to the specified number of decimals
        varData[loopCount]["val"] = _val;

    }

}


function parseDigitalOutputData(xml_str, digitalVarName, digitalData) {


    var digital_xml;

    for (var loopCount = 0; loopCount < digitalVarName.length; loopCount++) {

        digital_xml = xmlFindTag(xml_str, digitalVarName[loopCount][0], 1);
        digital_xml = xmlExtractElement(digital_xml);
        //Assign tag name and value
        digitalData[loopCount]["name"] = _tag_name;
        //display the data to the specified number of decimals
        digitalData[loopCount]["val"] = _val;

        if (_val == 0) {
            digitalData[loopCount]["val"] = "OFF";
        } else {
            digitalData[loopCount]["val"] = "ON";
        }


    }

}

function updateData(varName, varData) {

    for (var loopCount = 0; loopCount < varName.length; loopCount++) {

        document.getElementById(varName[loopCount][0] + "id").innerHTML = varData[loopCount]["val"];

    }
}

function createProcessVar(ele, t, to, l, lo, text, boxWidth, bTransparent) {
    //createProcessVar("AnolytePumpPress", t, 3.8, l, 5.9, "APP");
    if (typeof bTransparent == 'undefined')
        bTransparent = false;

    if (typeof text == 'undefined')
        text = "---";

    v = document.createElement("label.process_var");
    v.id = ele;
    v.innerHTML = text;
    v.style.position = "absolute";
    v.style.top = t + to + "in";
    v.style.left = l + lo + "in";
    v.style.width = boxWidth + "px";
    v.style.color = "#003399";
    v.style.fontSize = "15px";
    if (bTransparent == false) {
        //v.style.backgroundColor = "transparent";
        v.style.backgroundColor = "#FFFFFF";
        v.style.border = "thick";
    } else {
        v.style.backgroundColor = "#FFFFFF";
        v.style.border = "thick";
    }

    document.body.appendChild(v);
    return v;
}

function createValveVar(valve, t, to, l, lo, text) {
    if (typeof text == 'undefined')
        text = "---";

    v = document.createElement("valve_state");
    v.id = valve;
    v.innerHTML = text;
    v.style.position = "absolute";
    v.style.top = t + to + "in";
    v.style.left = l + lo + "in";

    document.body.appendChild(v);
}

function addProcessVars(varNameList) {
    for (var loopCount = 0; loopCount < varNameList.length; loopCount++) {

        createProcessVar(varNameList[loopCount][0] + "id", varNameList[loopCount][1], varNameList[loopCount][2], varNameList[loopCount][3], varNameList[loopCount][4],
            varNameList[loopCount][5], varNameList[loopCount][6], varNameList[loopCount][7]);
    }
}

function addValveVars(valveInfoName) {
    for (var loopCount = 0; loopCount < valveInfoName.length; loopCount++) {
        createValveVar(valveInfoName[loopCount][0] + "id", valveInfoName[loopCount][1], valveInfoName[loopCount][2],
            valveInfoName[loopCount][3], valveInfoName[loopCount][4], valveInfoName[loopCount][5]);
    }
}

function parseValveData(xml_str, valveInfoName, valveData) {

    var valve_xml = new Array();


    var row_txt;
    var valve_name;
    var valve_pos;
    var findCount = 0;

    valve_xml = xmlFindTag(xml_str, "ValvesOverview", 1);
    if ("" == valve_xml) return 0;

    // Remove section tag
    valve_xml = xmlExtractElement(valve_xml);

    valve_xml = xmlExtractElement(valve_xml);

    while (_tag == "r" && "" != valve_xml && findCount < valveData.length) {

        row_txt = _val;
        valve_name = row_txt.slice(0, row_txt.indexOf("|"));
        valve_pos = row_txt.slice(row_txt.indexOf("|") + 1);

        var valveIdx = findValveName(valve_name, valveInfoName);

        if (valveIdx >= 0) {
            valveData[valveIdx]["val"] = valve_pos;
            findCount++;
        }

        valve_xml = xmlExtractElement(valve_xml);
    }

}

function findValveName(name, valveInfoName) {
    for (var uiCount = 0; uiCount < valveInfoName.length; uiCount ++) {
        if (name == valveInfoName[uiCount][0]) {
            return (uiCount);
        }
    }

    return (-1);
}

function updateValveData(valveInfoName, valveData) {

    for (var loopCount = 0; loopCount < valveInfoName.length; loopCount ++) {
        if (valveData[loopCount]["val"] == "closed")
            closeValve(valveInfoName[loopCount][0]);
        else if (valveData[loopCount]["val"] == "open")
            openValve(valveInfoName[loopCount][0]);
    }

}

function updateUtilityValveData(valveInfoName, valveData) {

    for (var loopCount = 0; loopCount < valveInfoName.length; loopCount++) {
        if (valveData[loopCount]["val"] == "closed")
            closeUtilityValve(valveInfoName[loopCount][0]);
        else if (valveData[loopCount]["val"] == "open")
            openUtilityValve(valveInfoName[loopCount][0]);
    }

}

function createTables(responseStr) {
    q = GetUrlParameter("idnum");
    table_str = "";
    style_str = "";

    // Build the quadrant panes.
    table_str += '<table cellspacing="8" border="0" align="left" valign="top">';
    table_str += '<tr>';
    table_str += '<td align="center" valign="top" width="300">' + createQuadStatusTable(responseStr, page_detail_level, style_str);
    table_str += '</td>';

    document.getElementById('data').innerHTML = table_str;
}

function createQuadStatusTable(xml_str, _page_detail_level, _style_str) {
    var quad_table = xmlTagTable(xml_str, "quad", 1, _page_detail_level, _style_str);

    return quad_table;
}

function LocalCommandHandler(button_id, cmd, dcdc) {
    //var button = document.getElementById(button_id).disabled = true;

    switch (cmd) {
    case "charge":
        document.getElementById("DischargeIndicator-1").hidden = true;
        document.getElementById("DischargeIndicator-2").hidden = true;
        document.getElementById("ChargeIndicator-1").hidden = false;
        document.getElementById("ChargeIndicator-2").hidden = false;
        //valvesInBatteryProcessState();
        break;

    case "discharge":
        document.getElementById("ChargeIndicator-1").hidden = true;
        document.getElementById("ChargeIndicator-2").hidden = true;
        document.getElementById("DischargeIndicator-1").hidden = false;
        document.getElementById("DischargeIndicator-2").hidden = false;
        break;

    case "standby":
    case "float":
        hideChargeIndicatorGifs();
        break;

    case "cath_to_an":
        hideChargeIndicatorGifs();
        break;

    case "an_to_cath":
        hideChargeIndicatorGifs();
        break;

    default:
        hideChargeIndicatorGifs();
        break;
    }

    createTheTables = true;
}

function commandHandler(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, aValue, ExtraParm, ExtraParmVal) {
    if (typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined') {
        SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, '', ExtraParm, ExtraParmVal);
    } else {
        SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum);
    }

    if (null != document.getElementById('QuadCtrlDlgTitle')) // Hack to verify dialog is showing.
        _qctrl_dialog.close();
    _qctrl_dialog = null;
}

function toggle() {
    createTheTables = true;

    if (false == ajaxCmd.autoUpdate) {
        ajaxCmd.beginUpdates(1500, {
                COMMAND: "SYSTEM_SUMMARY_XML" //"EXPORT_SHMEM_XML"
                ,
                IDNUM: 1,
                DCDC: 0,
                DETAILLEVEL: page_detail_level
            }
        );
    } else {
        ajaxCmd.stopUpdates();
    }
}