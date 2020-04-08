// ~/script/TransitionEnum

define([], function () {
    return {
        ActionType: {
            None: 0,
            LoadRunFile: 1,
            PromptClearEditControl: 2,
            QuietClearEditControl: 3,
            PromptLoadFile: 4,
            RunSourceFileManager: 5,
            PromptResourceConflict: 6,   // file is active on one or more other resources
            PromptLiveEdits: 7          // about to lose unsave edits
        }
    };
});