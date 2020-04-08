// test suite for ~/panel/scriptRunnerList/StateRegister

dojo.provide('ppcJs.tests.StateRegisterTest');

dojo.require('ppcJs.panel.scriptRunnerList.StateRegister');
dojo.require('ppcJs.Enum');
dojo.require('ppcJs.script.State');

doh.register('ppcJs.tests.StateRegisterTest',
    [
        function testUpdateAndGetSelectedState(t) {
            var selectId = 'id0';
            var selectId2 = 'id2';
            var uuid2 = 'uuid2';
            var stateId0 = new ppcJs.script.State('id0File', 'uuid0', ppcJs.Enum.PlayBackState.Stopped, selectId);
            var stateId1 = new ppcJs.script.State('id1File', 'uuid1', ppcJs.Enum.PlayBackState.Stopped, 'id1');
            var stateId2 = new ppcJs.script.State('id2File', uuid2, ppcJs.Enum.PlayBackState.Running, selectId2);

            var sut = new ppcJs.panel.scriptRunnerList.StateRegister();
            sut.select(selectId);
            sut.update(stateId1);
            sut.update(stateId0);
            sut.update(stateId2);

            stateId0.state = ppcJs.Enum.PlayBackState.Running;
            sut.update(stateId0);

            // get selected state
            var result = sut.getState();

            var refOut = dojo.clone(stateId0);
            refOut.otherActiveScripts = ['id2File'];

            t.assertEqual(refOut.fileName, result.fileName, 'incorrect filename');
            t.assertEqual(refOut.currentUuid, result.currentUuid, 'incorrect uuid');
            t.assertEqual(refOut.state, result.state, 'incorrect playback state');
            t.assertEqual(refOut.otherActiveScripts, result.otherActiveScripts, 'incorrect active script list');

            // get another state
            var result2 = sut.getState(selectId2);
            t.assertEqual(uuid2, result2.currentUuid, 'incorrect uuid2');
        }
    ]
);