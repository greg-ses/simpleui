dojo.provide('ppcJs.tests.EntryControlFactoryTest');

dojo.require('ppcJs.script.EntryEnum');
dojo.require('ppcJs.script.EntryControlFactory');
dojo.require('ppcJs.tests.ScriptTestUtilities');
dojo.require('ppcJs.tests.EntryControlFactoryTestUtilities');

doh.register('ppcJs.tests.EntryControlFactoryTest',
    [
        function testGetDefaultLabelEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.Label);
            var name = control.get('name');
            var bo = control.getValue();
            t.assertEqual('Script Entry Control', name, 'incorrect Control name');
            t.assertTrue(dojo.isString(bo.uuid), 'invalid uuid');
            t.assertEqual('1', bo.args[0].id, 'incorrect arg0 id');
            t.assertEqual('label', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual('', bo.args[0].value, 'incorrect arg0 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, bo.args[0].valueType, 'incorrect arg0 valueType');
        },

        function testGetLabelEntryControlFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getLabelBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));
            var name = control.get('name');
            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetLabelEntryControlFromBoAndReplaceUuid(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getLabelBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo), true);
            var name = control.get('name');
            var resultBo = control.getValue();

            t.assertNotEqual(refBo.uuid, resultBo.uuid);
        },

        function testGetDefaultWaitRelativeEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.WaitRelative);
            var bo = control.getValue();
            t.assertEqual('time', bo.args[0].name, 'invalid arg0 name');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.TimeSpan, bo.args[0].valueType, 'incorrect arg0 valueType');
        },

        function testGetDefaultGoToEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.GoTo);
            var bo = control.getValue();
            t.assertTrue(dojo.isString(bo.uuid), 'invalid uuid');
            t.assertEqual('label', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual('', bo.args[0].value, 'incorrect arg0 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('count', bo.args[1].name, 'incorrect arg1 name');
            t.assertEqual(0, bo.args[1].value, 'incorrect arg1 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Int, bo.args[1].valueType, 'incorrect arg1 valueType');
        },

        function testGetRelWaitFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getRelWaitBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultStateWaitEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.WaitState);
            var bo = control.getValue();

            t.assertEqual('mode', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual('Charge', bo.args[0].value, 'incorrect arg0 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Select, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('submode', bo.args[1].name, 'incorrect arg1 name');
            t.assertEqual('', bo.args[1].value, 'incorrect arg1 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Select, bo.args[1].valueType, 'incorrect arg1 valueType');
        },

        function testGetStateWaitFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getStateWaitBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultWaitLessThanEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.WaitLessThan);
            var bo = control.getValue();

            t.assertTrue(dojo.isString(bo.uuid), 'invalid uuid');
            t.assertEqual('units', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual('Avg_Batt_AH', bo.args[0].value, 'incorrect arg0 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Select, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('threshold', bo.args[1].name, 'incorrect arg1 name');
            t.assertEqual(0, bo.args[1].value, 'incorrect arg1 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Float, bo.args[1].valueType, 'incorrect arg1 valueType');
        },

        function testGetWaitLessThanFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getLessThanWaitBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultWaitGreaterThanEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.WaitGreaterThan);
            var bo = control.getValue();

            t.assertTrue(dojo.isString(bo.uuid), 'invalid uuid');
            t.assertEqual('units', bo.args[0].name, 'incorrect arg0 name');
            t.assertEqual('Avg_Batt_AH', bo.args[0].value, 'incorrect arg0 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Select, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('threshold', bo.args[1].name, 'incorrect arg1 name');
            t.assertEqual(0, bo.args[1].value, 'incorrect arg1 value');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.Float, bo.args[1].valueType, 'incorrect arg1 valueType');
        },

        function testGetWaitGreaterThanFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getGreaterThanWaitBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultWaitDateTimeEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var currentTime = new Date();
            currentTime.setSeconds(0);          // control zeroes seconds
            var refTimeStampMs = currentTime.getTime();
            var refTimeStampSec = parseInt(refTimeStampMs / 1000);

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.WaitDateTime);
            var bo = control.getValue();

            t.assertTrue(dojo.isString(bo.uuid), 'invalid uuid');
            t.assertEqual('time', bo.args[0].name, 'incorrect arg0 name');
            t.assertTrue((bo.args[0].value >= refTimeStampSec), 'incorrect timestamp');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.TimeStamp, bo.args[0].valueType, 'incorrect arg0 valueType');
        },

        function testGetWaitDateTimeFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getDateTimeWaitBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultWaitTimeOfDayEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);

            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.WaitTimeOfDay);
            var bo = control.getValue();
            t.assertEqual('time', bo.args[0].name, 'invalid arg0 name');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.TimeOfDay, bo.args[0].valueType, 'incorrect arg0 valueType');
        },

        function testGetWaitTimeOfDayFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getTimeOfDayWaitBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultCustomActionEntryControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);

            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.CustomAction);
            var bo = control.getValue();
            t.assertEqual('', bo.args[0].name, 'invalid arg0 name');
            t.assertEqual(ppcJs.script.EntryEnum.ValueType.String, bo.args[0].valueType, 'incorrect arg0 valueType');
            t.assertEqual('', bo.args[0].value, 'incorrect arg0 value');
        },

        function testCustomActionFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getTemplate();
            var refBo = ppcJs.tests.ScriptTestUtilities.getCustomActionBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            ppcJs.tests.ScriptTestUtilities.assertBoEqual(t, refBo, resultBo);
        },

        function testGetDefaultLabelWithInitialValue(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithInitialValue();
            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);

            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.Label);
            var bo = control.getValue();
            t.assertEqual('test label', bo.args[0].value, 'incorrect initial value');
        },

        function testGetDefaultForLoopControl(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();
            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);

            var control = sut.getControl(ppcJs.script.EntryEnum.CommandType.ForLoop);
            var bo = control.getValue();
            t.assertEqual('8', bo.updateSequence[0].updateArgId);
            t.assertTrue(bo.updateSequence[0].once);
            t.assertEqual('7', bo.updateSequence[1].updateArgId);
            t.assertFalse(bo.updateSequence[1].once);
        },

        function testGetForLoopControlFromBo(t) {
            var commandTemplate = ppcJs.tests.ScriptTestUtilities.getSingleCmdTemplateWithUpdateSequence();
            var refBo = ppcJs.tests.ScriptTestUtilities.getForLoopBo();

            var sut = new ppcJs.script.EntryControlFactory(commandTemplate);
            var control = sut.getControl(dojo.clone(refBo));

            var resultBo = control.getValue();

            t.assertEqual('7', resultBo.updateSequence[0].updateArgId);
            t.assertFalse(resultBo.updateSequence[0].once);
        }
    ]
);
