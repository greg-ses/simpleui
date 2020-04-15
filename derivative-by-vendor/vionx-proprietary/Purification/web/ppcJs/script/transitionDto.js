// ~script/transitionDto

define(['../Enum'], function (Enum) {
    return {
        Action: function (/*bool*/valid, /*TransitionEnum.ActionType*/actionType, /*Enum.ViewState*/newViewState) {
            this.valid = valid;
            this.actionType = actionType;
            this.newViewState = newViewState;
            this.limitEditMode = false;
        },

        Conditions: function (/*Enum.ViewState*/newState) {
            this.newState = newState;
            this.isEdited = false;                                  // bool, true if any unsaved edit action has occurred
            this.isLoaded = false;                                  // bool, true if script was loaded from server
            this.activeFileNamed = false;                           // bool, true if selected resource provided an active script file: running/paused(/stopped?)
            this.resourceConflict = false;                          // bool, true if file is active on one or more resources other than selected
            this.editOnPause = false;                               // bool, true if ScriptManager is configured to enable editing of paused scripts
            this.playBackState = Enum.PlayBackState.Stopped;        // Enum.PlayBackState, state of active script on server
        }
    };
});