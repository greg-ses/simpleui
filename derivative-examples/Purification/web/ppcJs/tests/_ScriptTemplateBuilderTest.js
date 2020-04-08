dojo.provide('ppcJs.tests._ScriptTemplateBuilderTest');

dojo.require('ppcJs.tests.ScriptTestUtilities');
dojo.require('ppcJs.script._ScriptTemplateBuilder');
dojo.require('ppcJs.script.EntryEnum');

doh.register('ppcJs.tests._ScriptTemplateBuilderTest',
    [
        function testVerifyActionSelectHasRecursiveExtension(t) {
            // old style invocation
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script._ScriptTemplateBuilder(commandTemplate);

            var actionSelectTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.Action].args[0];

            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Select, actionSelectTemplate.valueType, 'not a select. template changed?');

            // verify a select option is the same as corresponding extension value
            var refSelectOption0 = 'charge';
            t.assertEqual(refSelectOption0, actionSelectTemplate.configObj.options[0], 'invalid configObj.options[0]');
            t.assertEqual(refSelectOption0, sut._extensionTemplates[0].extensionItems[0].value, 'invalid cmd extension[0] value');

            // verify PARAM select option ([2]) has extension
            var paramExtension = actionSelectTemplate.extensions[3];
            t.assertEqual('param', paramExtension.keyword);

            t.assertEqual(2, paramExtension.extensionItems.length);
            var paramArg0 = paramExtension.extensionItems[0].value;
            t.assertEqual('r1', paramArg0.id);
            t.assertEqual('PSTR', paramArg0.name);
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, paramArg0.valueType);

            var paramArg1 = paramExtension.extensionItems[1].value;
            t.assertEqual('r2', paramArg1.id);
            t.assertEqual('VALUE', paramArg1.name);
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, paramArg1.valueType);
        },

        function testVerifyStateWaitSelectHasNonrecursiveOptions(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new _ScriptTemplateBuilder(commandTemplate);

            var stateWaitModeSelectTemplate = sut._commandTemplates[EntryEnum.CommandType.WaitState].args[0];

            t.assertEqual(EntryEnum.ValueType.Select, stateWaitModeSelectTemplate.valueType, 'not a select. template changed?');

            // verify options
            var refModeOptions = ppcJs.tests.ScriptTestUtilities.getModeOptions();

            dojo.forEach(refModeOptions, function (modeOption, i) {
                t.assertEqual(modeOption, stateWaitModeSelectTemplate.configObj.options[i]);
            });
        },

        function testVerifySubstitutionValueTypeHasExtension(t) {
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new _ScriptTemplateBuilder(commandTemplate);

            var customActionSubstitutionTemplate = sut._commandTemplates[EntryEnum.CommandType.CustomAction].args[0];

            // verify customCmd extension
            var cmdExtension = customActionSubstitutionTemplate.extensions[0];
            t.assertEqual('customCmd', cmdExtension.keyword);

            t.assertEqual(2, cmdExtension.extensionItems.length);
            var cmdArg0 = cmdExtension.extensionItems[0].value;
            t.assertEqual('name', cmdArg0.name);
            t.assertEqual(EntryEnum.ValueType.String, cmdArg0.valueType);

            var cmdArg1 = cmdExtension.extensionItems[1].value;
            t.assertEqual('value', cmdArg1.name);
            t.assertEqual(EntryEnum.ValueType.String, cmdArg1.valueType);
        },

        function testIsArg(t) {
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');
            var ArgTemplate = require('ppcJs/script/schema/ArgTemplate');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new _ScriptTemplateBuilder(commandTemplate);

            var falseArg = 'not an arg';
            t.assertFalse(sut._isArg(falseArg), 'falseArg returned true');

            var trueArg = new ArgTemplate('id1', 'trueArg', EntryEnum.ValueType.Select);
            t.assertTrue(sut._isArg(trueArg), 'trueArg returned false');
        },

        function testLoadArgInitialValue(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithInitialValue();

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var argTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.Label].args[0];
            t.assertEqual('test label', argTemplate.initialValue);
        },

        function testLoadArgWithEvent(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithEvent();

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var argTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.Label].args[0];
            t.assertTrue(EntryEnum.EventArgType.DataFile === argTemplate.changeEventType, 'incorrect argTemplate.changeEventType');
        },

        function testLoadArgWithLabel(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');
            var refLabelStr = 'test label';

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithLabel(refLabelStr);

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var argTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.Label].args[0];
            t.assertTrue(argTemplate.label == refLabelStr, 'incorrect argTemplate.label');
        },

        function testLoadCommandWithUpdateSequence(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var updateSequence = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.ForLoop].updateSequence;
            t.assertEqual(8, updateSequence[0].updateArgId);
            t.assertTrue(updateSequence[0].once);
            t.assertEqual(7, updateSequence[1].updateArgId);
            t.assertFalse(updateSequence[1].once);
        },

        function testLoadReadOnlyArgSetsFlagInTemplate(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var argTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.ForLoop].args[6];
            t.assertTrue(argTemplate.configObj.readOnly, 'readOnly not set');
        },

        function testLoadHideArgSetsFlagInTemplate(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var argTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.ForLoop].args[7];
            t.assertTrue(argTemplate.configObj.hide, 'hide not set');
        },

        function testLoadHideLabelArgSetsFlagInTemplate(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithHideLabel();

            var sut = new _ScriptTemplateBuilder(commandTemplate);
            var argTemplate = sut._commandTemplates[ppcJs.script.EntryEnum.CommandType.Label].args[0];
            t.assertTrue(argTemplate.configObj.hideLabel, 'hideLabel not set');
        },

        function testVerifyCommandCategoryReadFromTemplate(t) {
            // AMD invocation
            var _ScriptTemplateBuilder = require('ppcJs/script/_ScriptTemplateBuilder');
            var EntryEnum = require('ppcJs/script/EntryEnum');

            var refStr = 'testCategory';
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithCategory(refStr);

            var sut = new _ScriptTemplateBuilder(commandTemplate);

            t.assertEqual(refStr, sut._cmdTypeKeyMap[0].category, 'incorrect category string');
        }
    ]
);