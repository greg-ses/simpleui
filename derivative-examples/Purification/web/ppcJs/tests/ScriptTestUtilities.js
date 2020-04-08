// ~/tests/ScriptTestUtilities
// test utilities for Script processing classes

define(['dojo/_base/lang', 'dojo/_base/array', 'dojo/query',
    'dojox/xml/parser', 'ppcJs/tests/ParamControlTestUtilities',
    'ppcJs/utilities/Store', 'ppcJs/script/EntryEnum', 'ppcJs/script/Arg', 'ppcJs/script/Entry'],
function (lang, array, query,
        parser, ParamControlTestUtilities,
        Store, EntryEnum, Arg, Entry) {
    return {
        getTemplate: function () {
            var xmlString =
            '<autoCycleTemplate>' +
              '<fileExtensions>' +
                '<fileExtension filetype="0">xml</fileExtension>' +
                '<fileExtension filetype="1">csv</fileExtension>' +
              '</fileExtensions>' +
              '<editOnPause>0</editOnPause>' +
                '<cmdTypes>' +
                '<cmd cmdtype="0">' +
                    '<arg id="1" name="label" valuetype="string" changeeventtype="3">' +
                    '</arg>' +
                '</cmd>' +
                '<cmd cmdtype="1">' +
                    '<arg id="1" name="time" valuetype="timespan"></arg>' +
                    '<arg id="2" name="monitor" valuetype="select" initialvalue="off" ref="fault_monitor"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="2">' +
                    '<arg id="1" name="time" valuetype="timestamp"></arg>' +
                    '<arg id="2" name="monitor" valuetype="select" ref="fault_monitor"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="3">' +
                    '<arg id="1" name="label" valuetype="string">' +
                    '</arg>' +
                    '<arg id="2" name="count" valuetype="int" min="0" max="100">' +
                    '</arg>' +
                '</cmd>' +
                '<cmd cmdtype="4">' +
                    '<arg id="1" name="units" valuetype="select">' +
                        '<argOption valuetype="string">Avg_Batt_AH</argOption>' +
                    '</arg>' +
                    '<arg id="2" name="threshold" valuetype="float"></arg>' +
                    '<arg id="3" name="monitor" valuetype="select" ref="fault_monitor"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="5">' +
                    '<arg id="1" name="units" valuetype="select">' +
                        '<argOption valuetype="string">Avg_Batt_AH</argOption>' +
                    '</arg>' +
                    '<arg id="2" name="threshold" valuetype="float" min="0" max="100000"></arg>' +
                    '<arg id="3" name="monitor" valuetype="select" ref="fault_monitor"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="6">' +
                    '<arg id="1" name="mode" valuetype="select" ref="mode">' +
                    '</arg>' +
                    '<arg id="2" name="submode" valuetype="select">' +
                        '<argOption valuetype="string"></argOption>' +
                        '<argOption valuetype="string">Strip Complete</argOption>' +
                    '</arg>' +
                    '<arg id="3" name="monitor" valuetype="select" ref="fault_monitor"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="7">' +
                    '<arg id="1" name="time" valuetype="timeofday"></arg>' +
                    '<arg id="2" name="monitor" valuetype="select" ref="fault_monitor"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="8">' +
                '</cmd>' +
                '<cmd cmdtype="9">' +
                    '<arg id="1" name="COMMAND" valuetype="select" ref="cmd">' +
                    '</arg>' +
                '</cmd>' +
                '<cmd cmdtype="10">' +
                    '<arg id="1" name="*" valuetype="substitution" ref="customCmd">' +
                    '</arg>' +
                    '<!--arg id="2" name="name2" valuetype="substitution" ref="customCmd">' +
                    '</arg>' +
                    '<arg id="3" name="name3" valuetype="substitution" ref="customCmd">' +
                    '</arg-->' +
                '</cmd>' +
                 '<cmd cmdtype="11">' +
                  '<arg id="1" name="time" valuetype="timestamp"></arg>' +
                  '<arg id="2" name="label" valuetype="string"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="12">' +
                  '<arg id="1" name="text" valuetype="string"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="13">' +
                  '<arg id="1" name="command" valuetype="string"></arg>' +
                  '<arg id="2" name="arguments" valuetype="string"></arg>' +
                  '<arg id="3" name="timeout" valuetype="timespan" initialvalue="5"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="14">' +
                  '<arg id="1" name="file" valuetype="string" changeeventtype="1"></arg>' +
                  '<arg id="2" name="timeout" valuetype="timespan" initialvalue="36000"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="15">' +
                  '<arg id="1" name="variable" valuetype="string"></arg>' +
                  '<arg id="2" name="function" valuetype="select">' +
                    '<argOption valuetype="string">=</argOption>' +
                    '<argOption valuetype="string">+=</argOption>' +
                    '<argOption valuetype="string">-=</argOption>' +
                  '</arg>' +
                  '<arg id="3" name="value" valuetype="float" initialvalue="0"></arg>' +
                '</cmd>' +
                '<cmd cmdtype="16">' +
                  '<arg id="1" name="variable" valuetype="string" initialvalue="indexA"></arg>' +
                  '<arg id="2" name="initial_value" valuetype="float" initialvalue="0" min="0" max="100000"></arg>' +
                  '<arg id="3" name="incrementer" valuetype="select">' +
                    '<argOption valuetype="string">+=</argOption>' +
                    '<argOption valuetype="string">-=</argOption>' +
                  '</arg>' +
                  '<arg id="4" name="increment" valuetype="float" initialvalue="1"></arg>' +
                  '<arg id="5" name="while" valuetype="select">' +
                    '<argOption valuetype="string">&gt;</argOption>' +
                    '<argOption valuetype="string">&gt;=</argOption>' +
                    '<argOption valuetype="string">&lt;</argOption>' +
                    '<argOption valuetype="string">&lt;=</argOption>' +
                  '</arg>' +
                  '<arg id="6" name="threshold" valuetype="float" min="0" max="100000"></arg>' +
                  '<arg id="7" name="end_label" valuetype="string" read="true"></arg>' +
                  '<arg id="8" name="label_uuid" valuetype="string" hide="true"></arg>' +
                  '<updateSequence>' +
                    '<updateArgId once="true">8</updateArgId>' +
                    '<updateArgId>7</updateArgId>' +
                  '</updateSequence>' +
                '</cmd>' +
            '</cmdTypes>' +

            '<refs>' +
                '<cmd>' +
                    '<argOption valuetype="string">charge</argOption>' +
                    '<argOption valuetype="string">strip</argOption>' +
                    '<argOption valuetype="string" ref="discharge">Set_Discharge_Rate</argOption>' +
                    '<argOption valuetype="string" ref="param">PARAM_UPDATE</argOption>' +
                    '<argOption valuetype="string" ref="param_save">PARAM_SAVE</argOption>' +
                '</cmd>' +
                '<mode>' +
                  '<argOption valuetype="string">Charge</argOption>' +
                  '<argOption valuetype="string">Discharge</argOption>' +
                  '<argOption valuetype="string">Float</argOption>' +
                  '<argOption valuetype="string">Standby</argOption>' +
                  '<argOption valuetype="string">UPS</argOption>' +
                '</mode>' +
                '<param>' +
                    '<arg id="r1" name="PSTR" valuetype="string"></arg>' +
                    '<arg id="r2" name="VALUE" valuetype="string"></arg>' +
                '</param>' +
                '<param_save>' +
                  '<arg id="r3" name="PSTR" valuetype="string"></arg>' +
                '</param_save>' +
                '<customCmd>' +
                  '<arg id="r4" name="name" valuetype="string"></arg>' +
                  '<arg id="r5" name="value" valuetype="string"></arg>' +
                '</customCmd>' +
                '<discharge>' +
                    '<arg id="r10" name="VALUE" valuetype="float"></arg>' +
                '</discharge>' +
                '<fault_monitor>' +
                    '<argOption valuetype="string">off</argOption>' +
                    '<argOption valuetype="string" ref="monitor_data">on</argOption>' +
                '</fault_monitor>' +
                '<monitor_data>' +
                    '<arg id="r11" name="fault_mode" valuetype="select" ref="mode"></arg>' +
                    '<arg id="r12" name="fault_period" valuetype="timespan"></arg>' +
                    '<arg id="r13" name="fault_label" valuetype="string"></arg>' +
                '</monitor_data>' +
            '</refs>' +
        '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getSingleCmdTemplateWithInitialValue: function () {
            var xmlString = '<autoCycleTemplate>' +
                                '<cmdTypes>' +
                                    '<cmd cmdtype="0">' +
                                        '<arg id="1" name="label" valuetype="string" initialvalue="test label">' +
                                        '</arg>' +
                                    '</cmd>' +
                                '</cmdTypes>' +
                            '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getSingleCmdTemplateWithEvent: function () {
            var xmlString = '<autoCycleTemplate>' +
                                '<cmdTypes>' +
                                    '<cmd cmdtype="0">' +
                                        '<arg id="1" name="label" valuetype="string" changeeventtype="1">' +
                                        '</arg>' +
                                    '</cmd>' +
                                '</cmdTypes>' +
                            '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getSingleCmdTemplateWithLabel: function (labelStr) {
            var xmlString = '<autoCycleTemplate>' +
                                '<cmdTypes>' +
                                    '<cmd cmdtype="0">' +
                                        '<arg id="1" name="name" valuetype="string" initialvalue="initial value" label="' + labelStr + '">' +
                                        '</arg>' +
                                    '</cmd>' +
                                '</cmdTypes>' +
                            '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getSingleCmdTemplateWithHideLabel: function () {
            var xmlString = '<autoCycleTemplate>' +
                                '<cmdTypes>' +
                                    '<cmd cmdtype="0">' +
                                        '<arg id="1" name="name" valuetype="string" initialvalue="initial value" hidelabel="true">' +
                                        '</arg>' +
                                    '</cmd>' +
                                '</cmdTypes>' +
                            '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getSingleCmdTemplateWithCategory: function (categoryStr) {
            var xmlString = '<autoCycleTemplate>' +
                                '<cmdTypes>' +
                                    '<cmd cmdtype="0" category="' + categoryStr + '">' +
                                        '<arg id="1" name="name" valuetype="string">' +
                                        '</arg>' +
                                    '</cmd>' +
                                '</cmdTypes>' +
                            '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getSingleCmdTemplateWithUpdateSequence: function () {
            var xmlString = '<autoCycleTemplate>' +
                                '<cmdTypes>' +
                                    '<cmd cmdtype="16">' +
                                      '<arg id="1" name="variable" valuetype="string" initialvalue="indexA"></arg>' +
                                      '<arg id="2" name="initial_value" valuetype="float" initialvalue="0" min="0" max="100000"></arg>' +
                                      '<arg id="3" name="incrementer" valuetype="select">' +
                                        '<argOption valuetype="string">+=</argOption>' +
                                        '<argOption valuetype="string">-=</argOption>' +
                                      '</arg>' +
                                      '<arg id="4" name="increment" valuetype="float" initialvalue="1"></arg>' +
                                      '<arg id="5" name="while" valuetype="select">' +
                                        '<argOption valuetype="string">&gt;</argOption>' +
                                        '<argOption valuetype="string">&gt;=</argOption>' +
                                        '<argOption valuetype="string">&lt;</argOption>' +
                                        '<argOption valuetype="string">&lt;=</argOption>' +
                                      '</arg>' +
                                      '<arg id="6" name="threshold" valuetype="float" min="0" max="100000"></arg>' +
                                      '<arg id="7" name="end_label" valuetype="string" read="true"></arg>' +
                                      '<arg id="8" name="label_uuid" valuetype="string" hide="true"></arg>' +
                                      '<updateSequence>' +
                                        '<updateArgId once="true">8</updateArgId>' +
                                        '<updateArgId once="false">7</updateArgId>' +
                                      '</updateSequence>' +
                                    '</cmd>' +
                                '</cmdTypes>' +
                            '</autoCycleTemplate>';

            return this._toXml(xmlString);
        },

        getLabelBo: function () {
            var uuid = 'a8e21a25-d040-11e1-9b23-0800200c9a66';
            var cmdtype = EntryEnum.CommandType.Label;
            var arg0 = new Arg('1', 'label', 'AA', EntryEnum.ValueType.String);
            var bo = new Entry(uuid, cmdtype, [arg0]);

            return bo;
        },

        getRelWaitBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'time', 1, EntryEnum.ValueType.TimeSpan);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitRelative, [arg0]);

            return bo;
        },

        getStateWaitBo: function () {
            var uuid = 'a8e21a21-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'mode', 'Discharge', EntryEnum.ValueType.Select);
            var arg1 = new Arg('2', 'submode', 'Strip Complete', EntryEnum.ValueType.Select);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitState, [arg0, arg1]);

            return bo;
        },

        getStateWaitDefaultBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'mode', 'Charge', EntryEnum.ValueType.String);
            var arg1 = new Arg('2', 'submode', '', EntryEnum.ValueType.String);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitTimeOfDay, [arg0, arg1]);

            return bo;
        },

        getActionParamBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'COMMAND', 'PARAM_UPDATE', EntryEnum.ValueType.Select);
            var arg1 = new Arg('r1', 'PSTR', 'MAX_CHARGECURRENT_A', EntryEnum.ValueType.String);
            var arg2 = new Arg('r2', 'VALUE', '7.0', EntryEnum.ValueType.String);
            var bo = new Entry(uuid, EntryEnum.CommandType.Action, [arg0, arg1, arg2]);

            return bo;
        },

        getLessThanWaitBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'units', 'Avg_Batt_AH', EntryEnum.ValueType.Select);
            var arg1 = new Arg('2', 'threshold', 11.23, EntryEnum.ValueType.Float);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitLessThan, [arg0, arg1]);

            return bo;
        },

        getGreaterThanWaitBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'units', 'Avg_Batt_AH', EntryEnum.ValueType.Select);
            var arg1 = new Arg('2', 'threshold', 11.23, EntryEnum.ValueType.Float);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitGreaterThan, [arg0, arg1]);

            return bo;
        },

        getDateTimeWaitBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            // 1976278809 = Monday, August 16, 2032 10:20:00 AM EDT (GMT - 4), NOTE: seconds are zeroed (not used)
            var arg0 = new Arg('1', 'time', 1976278800, EntryEnum.ValueType.TimeStamp);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitDateTime, [arg0]);

            return bo;
        },

        getTimeOfDayWaitBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            // 48660 = 13hr, 31 min = 1:31 PM (US)
            var arg0 = new Arg('1', 'time', 48660, EntryEnum.ValueType.TimeOfDay);
            var bo = new Entry(uuid, EntryEnum.CommandType.WaitTimeOfDay, [arg0]);

            return bo;
        },

        getCustomActionBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';

            var arg0 = new Arg('1', 'customAction1', 'customValue1', EntryEnum.ValueType.String);
            //var arg1 = new Arg('customAction2', 'customValue2', EntryEnum.ValueType.String);
            //var arg2 = new Arg('customAction3', 'customValue3', EntryEnum.ValueType.String);
            var bo = new Entry(uuid, EntryEnum.CommandType.CustomAction, [arg0/*, arg1, arg2*/]);

            return bo;
        },

        getForLoopBo: function () {
            var uuid = 'a8e21a26-d040-11e1-9b23-0800200c9a66';
            var arg0 = new Arg('1', 'variable', 'loopIndex', EntryEnum.ValueType.String);
            var arg1 = new Arg('2', 'initial_value', 1.1, EntryEnum.ValueType.Float);
            var arg2 = new Arg('3', 'incrementer', '+=', EntryEnum.ValueType.Select);
            var arg3 = new Arg('4', 'increment', 0.1, EntryEnum.ValueType.Float);
            var arg4 = new Arg('5', 'while', '<', EntryEnum.ValueType.Select);
            var arg5 = new Arg('6', 'threshold', 1.2, EntryEnum.ValueType.Float);
            var arg6 = new Arg('7', 'end_label', 'AA', EntryEnum.ValueType.String);
            var arg7 = new Arg('8', 'label_uuid', 'a8e21a25-d040-11e1-9b23-0800200c9a66', EntryEnum.ValueType.String);
            var updateSequence = [{ updateArgId: '7', once: false }];
            var bo = new Entry(uuid, EntryEnum.CommandType.ForLoop, [arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7], updateSequence);

            return bo;
        },

        getModeOptions: function () {
            //var modeOptions = ['Charge', 'Discharge', 'Float', 'Standby', 'UPS'];
            var templateElement = this.getTemplate();
            var cmdType6Select = Store.getCssAttribSelector('cmdtype', 6);
            var cmdStateElement = query('cmd' + cmdType6Select, templateElement)[0];

            var modeSelect = Store.getCssAttribSelector('name', 'mode');
            var modeArg = query('arg' + modeSelect, cmdStateElement)[0];
            var argOptions = query('>*', modeArg);

            var modeOptions = new Array();
            array.forEach(argOptions, function (argOption) {
                modeOptions.push(parser.textContent(argOption));
            });

            return modeOptions;
        },

        assertBoEqual: function (t, refBo, resultBo) {
            t.assertEqual(refBo.uuid, resultBo.uuid, 'incorrect uuid');
            t.assertEqual(refBo.commandType, resultBo.commandType, 'incorrect commandType');
            // note: length may be unequal due to args autogenerated from template
            for (var i = 0; i < refBo.args.length; i++) {
                t.assertEqual(refBo.args[i].id, resultBo.args[i].id, 'incorrect arg[' + i.toString() + '].id');
                t.assertEqual(refBo.args[i].name, resultBo.args[i].name, 'incorrect arg[' + i.toString() + '].name');
                t.assertEqual(refBo.args[i].value, resultBo.args[i].value, 'incorrect arg[' + i.toString() + '].value');
                t.assertEqual(refBo.args[i].valueType, resultBo.args[i].valueType, 'incorrect arg[' + i.toString() + '].valueType');
            }

            if (refBo.updateSequence.length > 0) {
                t.assertEqual(refBo.updateSequence[0].updateArgId, resultBo.updateSequence[0].updateArgId);
                t.assertEqual(refBo.updateSequence[0].once, resultBo.updateSequence[0].once);
            }
        },

        _toXml: function (xmlStr) {
            var xmlDoc = parser.parse(xmlStr, 'text/xml');
            return xmlDoc.firstChild;
        }
    };
});