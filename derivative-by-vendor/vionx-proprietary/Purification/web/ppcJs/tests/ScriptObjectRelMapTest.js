dojo.provide('ppcJs.tests.ScriptObjectRelMapTest');

dojo.require('ppcJs.script.Arg');
dojo.require('ppcJs.script.Entry');
dojo.require('ppcJs.script.ScriptObjectRelMap');
dojo.require('ppcJs.tests.ParamControlTestUtilities');
dojo.require('ppcJs.tests.ScriptTestUtilities');
dojo.require('ppcJs.utilities.Compatibility');
dojo.require('ppcJs.utilities.Reflection');

doh.register('ppcJs.tests.ScriptObjectRelMapTest',
    [
        function testLabelBusinessObjectToXml(t) {
            var uuid = 'a8e21a25-d040-11e1-9b23-0800200c9a66';
            var arg0 = new ppcJs.script.Arg('1', 'label', 'AA', ppcJs.script.EntryEnum.ValueType.String);
            var bo = new ppcJs.script.Entry(uuid, ppcJs.script.EntryEnum.CommandType.Label, [arg0]);

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getLabelXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);

            // verify description attribute added
            t.assertEqual('Label', ppcJs.utilities.Compatibility.attr(result, 'cmdName'));
        },

        function testGetLabelBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var labelEntry = ppcJs.tests.ScriptObjectRelMapTestUtilities.getLabelXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var bo = sut.toBusinessObject(labelEntry);

            t.assertEqual('a8e21a25-d040-11e1-9b23-0800200c9a66', bo.uuid, 'incorrect uuid');
            t.assertEqual(ppcJs.script.EntryEnum.CommandType.Label, bo.commandType, 'incorrect commandType');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, bo.args[0].valueType, 'incorrect arg valueType');
            t.assertEqual('label', bo.args[0].name, 'incorrect arg name');
            t.assertEqual('AA', bo.args[0].value, 'incorrect arg value');
        },

        function testGetRelWaitCmdBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var entry = ppcJs.tests.ScriptObjectRelMapTestUtilities.getRelWaitCmdXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var bo = sut.toBusinessObject(entry);

            t.assertEqual('a8e21a20-d040-11e1-9b23-0800200c9a66', bo.uuid, 'incorrect uuid');
            t.assertEqual(ppcJs.script.EntryEnum.CommandType.WaitRelative, bo.commandType, 'incorrect commandType');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.TimeSpan, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('time', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual(10, bo.args[0].value, 'incorrect arg0 value');

            // test backward compatibility (missing xml)
            t.assertEqual(2, bo.args.length, 'incorrect args length');
            t.assertEqual('monitor', bo.args[1].name, 'incorrect arg1 name');
            t.assertEqual(0, bo.args[1].value, 'incorrect arg1 value');
        },

        function testGoToBusinessObjectToXml(t) {
            var uuid = 'a8e21a30-d040-11e1-9b23-0800200c9a66';
            var arg0 = new ppcJs.script.Arg('1', 'label', 'AA', ppcJs.script.EntryEnum.ValueType.String);
            var arg1 = new ppcJs.script.Arg('2', 'count', 1, ppcJs.script.EntryEnum.ValueType.Int);
            var bo = new ppcJs.script.Entry(uuid, ppcJs.script.EntryEnum.CommandType.GoTo, [arg0, arg1]);

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getGoToCmdXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testGetGoToBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var goToEntry = ppcJs.tests.ScriptObjectRelMapTestUtilities.getGoToCmdXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var bo = sut.toBusinessObject(goToEntry);

            t.assertEqual('a8e21a30-d040-11e1-9b23-0800200c9a66', bo.uuid, 'incorrect uuid');
            t.assertEqual(ppcJs.script.EntryEnum.CommandType.GoTo, bo.commandType, 'incorrect commandType');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('label', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual('AA', bo.args[0].value, 'incorrect arg0 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Int, bo.args[1].valueType, 'incorrect arg1 valueType');
            t.assertEqual('count', bo.args[1].name, 'incorrect arg1 name');
            t.assertEqual(1, bo.args[1].value, 'incorrect arg1 value');
        },

        function testActionParamBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getActionParamBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getActionParamXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testGetActionParamBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getActionParamXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getActionParamBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testLessThanWaitBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getLessThanWaitBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getLessThanWaitXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testGetLessThanWaitBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getLessThanWaitXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getLessThanWaitBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGreaterThanWaitBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getGreaterThanWaitBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getGreaterThanWaitXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testGetGreaterThanWaitBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getGreaterThanWaitXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getGreaterThanWaitBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testDateTimeWaitBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getDateTimeWaitBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getDateTimeWaitCmdXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testGetDateTimeWaitBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getDateTimeWaitCmdXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getDateTimeWaitBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testTimeOfDayWaitBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getTimeOfDayWaitBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getTimeOfDayWaitCmdXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testGetTimeOfDayWaitBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getTimeOfDayWaitCmdXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getTimeOfDayWaitBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testCustomActionBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getCustomActionBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getCustomActionCmdXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);
        },

        function testCustomActionBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getCustomActionCmdXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getCustomActionBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testForLoopBusinessObjectToXml(t) {
            var bo = ppcJs.tests.ScriptTestUtilities.getForLoopBo();

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();
            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var result = sut.toXmlElement(bo);

            var refElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getforLoopCmdXmlElement();
            ppcJs.tests.ScriptObjectRelMapTestUtilities.assertElementsEqual(t, refElement, result);

            var updateArgIdNode = result.childNodes[8].firstChild;
            t.assertEqual(updateArgIdNode.nodeName, 'updateArgId');
        },

        function testForLoopBusinessObjectFromXml(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();
            var xmlElement = ppcJs.tests.ScriptObjectRelMapTestUtilities.getforLoopCmdXmlElement();

            var sut = new ppcJs.script.ScriptObjectRelMap(commandTemplate);
            var resultBo = sut.toBusinessObject(xmlElement);
            var refBo = ppcJs.tests.ScriptTestUtilities.getForLoopBo();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        }

    ]
);


ppcJs.tests.ScriptObjectRelMapTestUtilities = {
    getLabelXmlElement: function () {
        var xmlString = '<cmd cmdtype="0" uuid="a8e21a25-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>label</name>' +
                                '<value>AA</value>' +
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getRelWaitCmdXmlElement: function () {
        var xmlString = '<cmd cmdtype="1" uuid="a8e21a20-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>time</name>' +
                                '<value>10</value>' +
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getGoToCmdXmlElement: function () {
        var xmlString = '<cmd cmdtype="3" uuid="a8e21a30-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>label</name>' +
                                '<value>AA</value>' +
                            '</arg>' +
                            '<arg id="2">' +
                                '<name>count</name>' +
                                '<value>1</value>' +
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getActionParamXmlElement: function () {
        var xmlString = '<cmd cmdtype="9" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
            '<arg id="1">' +
                '<name>COMMAND</name>' +
                '<value>PARAM_UPDATE</value>' +
            '</arg>' +
            '<arg id="r1">' +
                '<name>PSTR</name>' +
                '<value>MAX_CHARGECURRENT_A</value>' +
            '</arg>' +
            '<arg id="r2">' +
                '<name>VALUE</name>' +
                '<value>7.0</value>' +
            '</arg>' +
            '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getLessThanWaitXmlElement: function () {
        var xmlString = '<cmd cmdtype="4" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>units</name>' +
                                '<value>Avg_Batt_AH</value>' +
                            '</arg>' +
                            '<arg id="2">' +
                                '<name>threshold</name>' +
                                '<value>11.23</value>' +
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getGreaterThanWaitXmlElement: function () {
        var xmlString = '<cmd cmdtype="5" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>units</name>' +
                                '<value>Avg_Batt_AH</value>' +
                            '</arg>' +
                            '<arg id="2">' +
                                '<name>threshold</name>' +
                                '<value>11.23</value>' +
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getDateTimeWaitCmdXmlElement: function () {
        var xmlString = '<cmd cmdtype="2" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>time</name>' +
                                '<value>1976278800</value>' +   // Monday, August 16, 2032 10:20:00 AM EDT (GMT - 4), NOTE: seconds are zeroed (not used)
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getTimeOfDayWaitCmdXmlElement: function () {
        var xmlString = '<cmd cmdtype="7" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>time</name>' +
                                '<value>48660</value>' +   // 48660 = 13hr, 31 min = 1:31 PM (US)
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getCustomActionCmdXmlElement: function () {
        var xmlString = '<cmd cmdtype="10" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                                '<name>customAction1</name>' +
                                '<value>customValue1</value>' +
                            '</arg>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    getforLoopCmdXmlElement: function () {
        var xmlString = '<cmd cmdname="ForLoop" cmdtype="16" uuid="a8e21a26-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                              '<name>variable</name>' +
                              '<value>loopIndex</value>' +
                            '</arg>' +
                            '<arg id="2">' +
                              '<name>initial_value</name>' +
                              '<value>1.1</value>' +
                            '</arg>' +
                            '<arg id="3">' +
                              '<name>incrementer</name>' +
                              '<value>+=</value>' +
                            '</arg>' +
                            '<arg id="4">' +
                              '<name>increment</name>' +
                              '<value>0.1</value>' +
                            '</arg>' +
                            '<arg id="5">' +
                              '<name>while</name>' +
                              '<value>&lt;</value>' +
                            '</arg>' +
                            '<arg id="6">' +
                              '<name>threshold</name>' +
                              '<value>1.2</value>' +
                            '</arg>' +
                            '<arg id="7">' +
                              '<name>end_label</name>' +
                              '<value>AA</value>' +
                            '</arg>' +
                            '<arg id="8">' +
                              '<name>label_uuid</name>' +
                              '<value>a8e21a25-d040-11e1-9b23-0800200c9a66</value>' +
                            '</arg>' +
                            '<updateSequence>' +
                              '<updateArgId once="false">7</updateArgId>' +
                            '</updateSequence>' +
                        '</cmd>';
        var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        return xmlItem['element'];
    },

    assertElementsEqual: function (t, refElement, resultElement) {
        var resultNodes = dojo.query('*', resultElement);
        var refNodes = dojo.query('*', refElement);
        for (var i = 0; i < refNodes.length; i++) {
            var refTextContent = dojox.xml.parser.textContent(refNodes[i]);
            if (refTextContent) {
                var resultTextContent = dojox.xml.parser.textContent(resultNodes[i]);
                t.assertEqual(refTextContent, resultTextContent);
            }

            // verify nodes' attribute values (note: directly uses javascript DOM, test fixture tested on FF only)
            dojo.forEach(refNodes[i].attributes, function (attrib, i) {
                var refAttribVal = ppcJs.utilities.Compatibility.attr(refNodes[i], attrib.nodeName);
                var resultAttribVal = ppcJs.utilities.Compatibility.attr(resultNodes[i], attrib.nodeName);
                t.assertEqual(refAttribVal, resultAttribVal);
            }, this);
        }
    }
};