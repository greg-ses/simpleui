// ~/script/ViewStateTransitionProvider
// viewState transition matrix parser: ref svn://10.0.4.30/ppc_repo/trunk/web/Server/documentation/viewState transition matrix.xls

define(['dojo/_base/declare', 'dojo/_base/lang', '../Enum', './TransitionEnum', '../utilities/DataFormat'],
function (declare, lang, Enum, TransitionEnum, DataFormat) {
    return declare(null,
    {
        // private class fields
        _matrix: '',    // consolidated action matrix - multidimensional array of transitionDto.Action objects

        // Enum.ViewState.Edit
        _editActionMatrix:
        [
            [ // !editOnPause
                [ // !resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ],

                        [ // isLoaded
                             [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ]
                    ]
                ],

                [ // resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.PromptResourceConflict },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: true, actionType: TransitionEnum.ActionType.PromptResourceConflict },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                {valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ]
                    ]
                ]
            ],

            [ // editOnPause
                [ // !resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile, limitEditMode: true },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.None, limitEditMode: true },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ],

                        [ // isLoaded
                             [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                             ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ]
                    ]
                ],

                [ // resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.PromptResourceConflict },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.None }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.PromptResourceConflict },
                                { valid: true, actionType: TransitionEnum.ActionType.PromptResourceConflict },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptLiveEdits }
                            ]
                        ]
                    ]
                ]
            ]
        ],


        // Enum.ViewState.View
        _viewActionMatrix:
        [
            [ // !editOnPause
                [ // !resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ]
                    ]
                ],

                [ // resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ]
                    ]
                ]
            ],

            [ // editOnPause
                [ // !resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.None },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ]
                    ]
                ],

                [ // resourceConflict
                    [ // !isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: true, actionType: TransitionEnum.ActionType.QuietClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.QuietClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: true, actionType: TransitionEnum.ActionType.RunSourceFileManager },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile },
                                { valid: true, actionType: TransitionEnum.ActionType.LoadRunFile }
                            ]
                        ]
                    ],

                    [ // isEdited
                        [ // !isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ],

                        [ // isLoaded
                            [ // !activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ],

                            [ // activeFileNamed, [playBackState.Stopped/Paused/Running]
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl },
                                { valid: false, actionType: TransitionEnum.ActionType.PromptClearEditControl }
                            ]
                        ]
                    ]
                ]
            ]
        ],


        // public methods
        constructor: function () {
            this._matrix = new Array(2);
            var editIndex = DataFormat.boolToI(Enum.ViewState.Edit);
            var viewIndex = DataFormat.boolToI(Enum.ViewState.View);
            this._matrix[editIndex] = this._editActionMatrix;
            this._matrix[viewIndex] = this._viewActionMatrix;
        },

        // returns script.transitionDto.Action object
        getAction: function (/*transitionDto.Conditions*/conditions) {
            var viewStateIndex = DataFormat.boolToI(conditions.newState);
            var editOnPauseIndex = DataFormat.boolToI(conditions.editOnPause);
            var resourceConflict = DataFormat.boolToI(conditions.resourceConflict);
            var isEditedIndex = DataFormat.boolToI(conditions.isEdited);
            var isLoadedIndex = DataFormat.boolToI(conditions.isLoaded);
            var activeFileNamedIndex = DataFormat.boolToI(conditions.activeFileNamed);

            var actionObj = { newViewState: conditions.newState };
            lang.mixin(actionObj, this._matrix[viewStateIndex][editOnPauseIndex][resourceConflict][isEditedIndex][isLoadedIndex][activeFileNamedIndex][conditions.playBackState]);
            return actionObj;
        }
    });
});
