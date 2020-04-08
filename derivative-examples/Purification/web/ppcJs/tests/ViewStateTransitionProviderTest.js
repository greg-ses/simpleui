dojo.provide('ppcJs.tests.ViewStateTransitionProviderTest');
dojo.require('ppcJs.Enum');
dojo.require('ppcJs.script.ViewStateTransitionProvider');
dojo.require('ppcJs.script.TransitionEnum');
dojo.require('ppcJs.script.transitionDto');

doh.register('ppcJs.tests.ViewStateTransitionProviderTest',
    [
// svn://10.0.4.30/ppc_repo/trunk/web/Server/documentation/viewState transition matrix.xls, Edit>>View case 8
        function testEditToViewTransitionAction(t) {
            var sut = new ppcJs.script.ViewStateTransitionProvider();

            var newState = ppcJs.Enum.ViewState.Edit;
            var conditions = new ppcJs.script.transitionDto.Conditions(newState);
            conditions.isEdited = false;
            conditions.isLoaded = true;
            conditions.activeFileNamed = true;
            conditions.resourceConflict = true;
            conditions.playBackState = ppcJs.Enum.PlayBackState.Running;

            var actionObj = sut.getAction(conditions);

            t.assertTrue(actionObj.valid);
            t.assertEqual(ppcJs.script.TransitionEnum.ActionType.QuietClearEditControl, actionObj.actionType);
            t.assertEqual(newState, actionObj.newViewState);
        },

// svn://10.0.4.30/ppc_repo/trunk/web/Server/documentation/viewState transition matrix.xls, View>>Edit case 8
        function testViewToEditTransitionAction(t) {
            var sut = new ppcJs.script.ViewStateTransitionProvider();

            var newState = ppcJs.Enum.ViewState.View;
            var conditions = new ppcJs.script.transitionDto.Conditions(newState);
            conditions.isEdited = false;
            conditions.isLoaded = true;
            conditions.activeFileNamed = true;
            conditions.resourceConflict = false;
            conditions.playBackState = ppcJs.Enum.PlayBackState.Running;

            var actionObj = sut.getAction(conditions);

            t.assertTrue(actionObj.valid);
            t.assertEqual(ppcJs.script.TransitionEnum.ActionType.LoadRunFile, actionObj.actionType);
            t.assertEqual(newState, actionObj.newViewState);
        },

        function testViewToEditResourceConflictTransitionAction(t) {
            var sut = new ppcJs.script.ViewStateTransitionProvider();

            var conditions = new ppcJs.script.transitionDto.Conditions(ppcJs.Enum.ViewState.Edit);
            conditions.isEdited = false;
            conditions.isLoaded = true;
            conditions.activeFileNamed = true;
            conditions.resourceConflict = true;
            conditions.playBackState = ppcJs.Enum.PlayBackState.Stopped;

            var actionObj = sut.getAction(conditions);

            t.assertTrue(actionObj.valid);
            t.assertEqual(ppcJs.script.TransitionEnum.ActionType.PromptResourceConflict, actionObj.actionType);
        }

    ]
);