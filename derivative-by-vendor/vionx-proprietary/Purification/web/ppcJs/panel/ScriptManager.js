// ~/panel/ScriptManager
// Script Manager Panel - mediates between FileManager, ScriptRunnerList, and Edit control to manage:
//  * server-side script file management: load, save, save as, delete
//  * script runners: run/pause/stop
//  * script viewer/editor: view status when running, edit when not

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array',
        'dojo/dom', 'dojo/dom-construct', 'dojo/dom-style', 'dojo/query', 'dojo/aspect', 'dojox/xml/parser',
        'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'dijit/Dialog',
        '../Enum', '../utilities/Compatibility', '../utilities/DataFormat', '../utilities/File', '../utilities/Page', '../script/TransitionEnum', '../script/transitionDto',
        '../script/EntryEnum', '../script/State', '../script/ScriptObjectRelMap', '../script/EntryControlFactory', '../script/ViewStateTransitionProvider',
        './FileManager', './fileManager/fmDto', './ScriptRunnerList', '../control/Edit', '../control/edit/eDto',
        '../widget/FadeoutAlertBox', '../widget/iPhoneButton', './Download',
        './_Panel', 'dojo/text!./scriptManager/template/scriptManager.html'],
function (declare, lang, array,
        dom, construct, domStyle, query, aspect, parser,
        BorderContainer, ContentPane, Dialog,
        Enum, Compatibility, DataFormat, File, Page, TransitionEnum, transitionDto,
        EntryEnum, State, ScriptObjectRelMap, EntryControlFactory, ViewStateTransitionProvider,
        FileManager, fmDto, ScriptRunnerList, Edit, eDto,
        FadeoutAlertBox, iPhoneButton, Download,
        _Panel, template) {
    return declare([_Panel],
    {
        // ajax request command constants
        _getTemplateCmd: { COMMAND: 'SCRIPT_TEMPLATE' },

        // ajax response tags
        _rootTemplateTag: 'autoCycleTemplate',
        _fileExtensionTag: 'fileExtension',
        _fileTypeAttrib: 'filetype',
        _editOnPauseTag: 'editOnPause',
        _rootScriptTag: 'cmds',
        _cmdTag: 'cmd',

        // private variables
        _scriptOrm: null,
        _editControl: null,
        _editOnPause: false,    // true = allow editing of paused scripts
        _viewState: Enum.ViewState.Edit,
        _viewStateTransitionProvider: null,
        _scriptState: null,
        _asyncEventInProcess: EntryEnum.EventArgType.None,  // special async processing required

        // dijit variables
        name: 'Script Manager Panel',
        templateString: template,
        baseClass: 'scriptManagerPanel',

        // lifecycle methods
        constructor: function () {
            this.inherited(arguments);
            this._viewStateTransitionProvider = new ViewStateTransitionProvider();
        },

        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);
            this.fileManager.load(urlVal, resourceId, serverProcess);
            this.scriptRunnerList.load(urlVal, resourceId, serverProcess);

            var contentCallback = lang.hitch(this, this._getScriptStr);
            var filenameCallback = lang.hitch(this, this._getCurrentFileName);
            this.download.load(urlVal, resourceId, serverProcess, contentCallback, filenameCallback);
            Page.hideDomNode(this.alertDiv);
            this._fetchTemplate();
            this.startup();
        },

        unload: function () {
            this.inherited(arguments);
            this.download.unload();
            this.scriptRunnerList.unload();
            this.fileManager.unload();
            this._editControl.destroyRecursive();
        },

        startup: function () {
            this.inherited(arguments);
            this.borderContainer.resize();
        },

        // private methods
        _fetchTemplate: function () {
            var testUrl = '../../ppcJs/tests/autoCycleTemplateResponse.xml';
            var queryObj = {};
            lang.mixin(queryObj, this._getTemplateCmd);
            this._initStore(testUrl, queryObj, this._rootTemplateTag, this.onFetchTemplate);
        },

        _setViewState: function (/*Enum.ViewState*/newState, /*optional*/limitEditMode) {
            this._viewState = newState;
            this._editControl.setViewState(this._viewState, limitEditMode);
            this.scriptRunnerList.setViewState(this._viewState);
            this.editToggle.setValue(this._viewState);

            if (this._viewState == Enum.ViewState.Edit) {
                this._showFileManager();
                domStyle.set(dom.byId(this.rightTopSubPane), { display: 'block' });
            }
            else {
                domStyle.set(dom.byId(this.rightTopSubPane), { display: 'none' });
            }
        },

        _updateScriptState: function (/*script.State*/update) {
            if (update) {
                this._scriptState = update;

                var activeScripts = update.otherActiveScripts;
                var isActive = (update.state == Enum.PlayBackState.Running) || ((update.state == Enum.PlayBackState.Paused) && !this._editOnPause);
                if (isActive) {
                    activeScripts.push(update.fileName);
                }

                this.fileManager.setFileBlackList(activeScripts);

                if (this._viewState == Enum.ViewState.View) {
                    this._editControl.update(update);
                }
            }
        },

        _getTransitionAction: function (/*panel.fileManager.fmDto.FileState*/fileManagerState, /*optional, script.State*/proposedState) {
            var scriptState = proposedState ? proposedState : this._scriptState;
            if (scriptState) {
                var viewStateConditions = new transitionDto.Conditions(this._viewState);
                viewStateConditions.editOnPause = this._editOnPause;

                if (scriptState.fileName) {
                    viewStateConditions.activeFileNamed = true;
                    viewStateConditions.resourceConflict = array.some(scriptState.otherActiveScripts, function (otherActiveScript) {
                        return (otherActiveScript == scriptState.fileName);
                    }, this);
                }
                else {
                    viewStateConditions.activeFileNamed = false;
                    viewStateConditions.resourceConflict = false;
                }

                viewStateConditions.playBackState = scriptState.state;
                viewStateConditions.newState = this._getNextViewState(proposedState);
                viewStateConditions.isEdited = this._editControl.getIsEdited() && !this._editControl.isEmpty();

                // force reload of FileManager if changing to proposed script scriptState
                viewStateConditions.isLoaded = fileManagerState.loaded && !proposedState;

                return this._viewStateTransitionProvider.getAction(viewStateConditions);
            }
            else {
                // inhibit action until first script.State received
                return new transitionDto.Action(false, TransitionEnum.ActionType.None, this._viewState);
            }
        },

        // returns desired next Enum.ViewState. Force to view state only if a script is running: otherwise slave to editToggle value.
        _getNextViewState: function (/*optional, script.State*/proposedState) {
            var forceToViewState = proposedState && (proposedState.state == Enum.PlayBackState.Running);
            var nextViewState = forceToViewState?  Enum.ViewState.View : this.editToggle.get('value');

            return nextViewState;
        },

        _executeTransitionAction: function (/*panel.fileManager.fmDto.FileState*/fileManagerState, /*script.TransitionEnum.ActionType*/actionType) {
            var loadedFileName = fileManagerState.name;

            switch (actionType) {
                case (TransitionEnum.ActionType.LoadRunFile):
                    var fileAlreadyLoaded = (this._scriptState.fileName == loadedFileName);
                    if (this._scriptState.fileName && !fileAlreadyLoaded) {
                        this.fileManager.getFile(this._scriptState.fileName);
                    }
                    break;

                case (TransitionEnum.ActionType.PromptClearEditControl):
                    this.fadeoutAlertBox.show('There are unsaved script changes: [Save] or [New] the script before switching to Run.');
                    break;

                case (TransitionEnum.ActionType.QuietClearEditControl):
                    this.fileManager.clearFileState();
                    this.fileManager.setNewContentOptions(false, true);
                    this._editControl.configure();
                    break;

                case (TransitionEnum.ActionType.PromptLoadFile):
                    this.fadeoutAlertBox.show('No script is currently running on this resource: [Load] a script in Edit mode before switching to Run.');
                    break;

                case (TransitionEnum.ActionType.RunSourceFileManager):
                    this.scriptRunnerList.setActiveScript(loadedFileName);
                    break;

                case (TransitionEnum.ActionType.PromptResourceConflict):
                    this.fileManager.clearFileState();
                    this.fileManager.setNewContentOptions(false, true);
                    this._editControl.configure();
                    this.fadeoutAlertBox.show('This script is active on one or more other resources. You must stop it on all resources before you can edit it.');
                    break;

                case (TransitionEnum.ActionType.PromptLiveEdits):
                    this.fadeoutAlertBox.show('There are unsaved script changes: [Save] or [New] the script before switching away from the current resource\'s edit window.');
                    break;

                default:
                    break;
            }
        },

        _buildScriptXml: function () {
            var cmds = construct.create(this._rootScriptTag);

            if (this._editControl) {
                var businessObjects = this._editControl.getValue();
                array.forEach(businessObjects, function (businessObj) {
                    var cmdXml = this._scriptOrm.toXmlElement(businessObj);
                    construct.place(cmdXml, cmds, 'last');
                }, this);
            }

            return cmds;
        },

        _getScriptStr: function () {
            var scriptXml = this._buildScriptXml();
            return File.serializeXml(scriptXml);
        },

        _getCurrentFileName: function () {
            var fileManagerState = this.fileManager.getFileState();
            return fileManagerState.staticName;
        },

        _showFileManager: function () {
            // convert _asyncEventInProcess to native show option
            switch (this._asyncEventInProcess) {
                case (EntryEnum.EventArgType.DataFile):
                    var showFileOption = fmDto.ShowFileOptionType.LoadDataNoImport;
                    break;

                case (EntryEnum.EventArgType.ScriptFile):
                    var showFileOption = fmDto.ShowFileOptionType.LoadScripts;
                    break;

                case (EntryEnum.EventArgType.None):
                default:
                    var showFileOption = fmDto.ShowFileOptionType.AllScripts;
                    break;
            }

            this.fileManager.show(showFileOption);
        },

        _parseFileExtensionMaps: function (/*XmlElement*/rootElement) {
            var fileExtensionMaps = new Array();

            query(this._fileExtensionTag, rootElement).forEach(function (fileExtElem) {
                var extension = parser.textContent(fileExtElem);
                var fileType = parseInt(Compatibility.attr(fileExtElem, this._fileTypeAttrib));
                fileExtensionMaps.push(new fmDto.FileExtensionMap(extension, fileType));
            }, this);

            return fileExtensionMaps;
        },

        _setEditOnPauseFromTemplate: function (/*XmlElement*/rootElement) {
            var editOnPauseItems = query(this._editOnPauseTag, rootElement);
            if (editOnPauseItems.length > 0) {
                this._editOnPause = DataFormat.toBool( parser.textContent(editOnPauseItems[0]) );
            }
        },

        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            var rootElem = items[0]['element'];
            this._setEditOnPauseFromTemplate(rootElem);

            // configure FileManager
            var fileExtensionMaps = this._parseFileExtensionMaps(rootElem);
            this.fileManager.configure(fileExtensionMaps);

            // create ORM, UI template engines
            this._scriptOrm = new ScriptObjectRelMap(rootElem);

            var editControlCtorObj = new eDto.Ctor(new EntryControlFactory(rootElem));
            this._editControl = new Edit(editControlCtorObj);
            this._editControl.setViewState(this._viewState);
            construct.place(this._editControl.domNode, this.editControlDiv);
            this._handlerList.push(aspect.after(this._editControl, 'onStateChange', lang.hitch(this, this._onEditStateChange), true));
            this._handlerList.push(aspect.after(this._editControl, 'onBreakPointChange', lang.hitch(this, this._onBreakPointChange), true));
            this._handlerList.push(aspect.after(this._editControl, 'dataRequest', lang.hitch(this, this._onDataRequest), true));

            // initialize component view states
            this._setViewState(Enum.ViewState.Edit);
            this.editToggle.setValue(this._viewState);
        },

        _resetInsertDialog: function () {
            this.dataRequestDialog.hide();
            construct.place(this.fileManager.domNode, this.fileManagerDiv);
            if (this._viewState == Enum.ViewState.Edit) {
                this._showFileManager();
            }
        },

        // event handlers
        _onGetFileList: function (/*string[]*/fileNames) {
            this.scriptRunnerList.setFileList(fileNames);
        },

        _onGetFile: function (/*string*/fileName, /*XmlElement*/rootElem) {
            var businessObjects = new Array();

            // if a script DOM tree is passed, always process business objects regardless of _asyncEventInProcess
            if (rootElem) {
                var cmdElements = query(this._cmdTag, rootElem);
                array.forEach(cmdElements, function (cmdElement) {
                    var bo = this._scriptOrm.toBusinessObject(cmdElement);
                    businessObjects.push(bo);
                }, this);

                this._editControl.configure(businessObjects);
                console.log('loaded: ' + fileName);

                if (this._viewState == Enum.ViewState.View) {
                    this.scriptRunnerList.setActiveScript(fileName);
                }
            }
            else if (this._asyncEventInProcess != EntryEnum.EventArgType.None) {
                // special async processing when no business objects
                var state = new State(fileName);
                this._editControl.update(state);
                if (!fileName) {
                    this._asyncEventInProcess = EntryEnum.EventArgType.None;
                    this.fadeoutAlertBox.show('Either the wrong type of file was selected or its transfer to the server failed.');
                }
            }

            this._resetInsertDialog();
            this._asyncEventInProcess = EntryEnum.EventArgType.None;
        },

        _onSaveFile: function (/*callback(XmlElement)*/xmlReceiver) {
            try {
                var cmds = this._buildScriptXml();
                xmlReceiver(cmds);

                this._editControl.clearIsEdited();
            }
            catch (e) {
            }
        },

        _onNewFileRequest: function (/*callback(isEdited)*/editStateReceiver) {
            var isEdited = this._editControl.getIsEdited();
            editStateReceiver(isEdited);
        },

        _onNewFile: function () {
            this._editControl.configure();
        },

        _onRunToggleChange: function () {
            var fileManagerState = this.fileManager.getFileState();
            var actionObj = this._getTransitionAction(fileManagerState);

            if (actionObj.valid) {
                this._setViewState(actionObj.newViewState, actionObj.limitEditMode);
            }
            else {
                // reset toggle
                this.editToggle.setValue(this._viewState);
            }

            this._executeTransitionAction(fileManagerState, actionObj.actionType);
        },

        _onEditStateChange: function (/*bool*/isEdited, /*bool*/isEmptyScript) {
            this.fileManager.setNewContentOptions(isEdited, isEmptyScript);
        },

        _onBreakPointChange: function (/*string*/uuid, /*bool*/enable) {
            // delegate to ScriptRunnerList, which handles all script state interaction with the server
            this.scriptRunnerList.changeBreakPoint(uuid, enable);
        },

        _onDataRequest: function (/*EntryEnum.EventArgType*/eventType) {
            this._asyncEventInProcess = eventType;

            switch (eventType) {
                case (EntryEnum.EventArgType.DataFile):
                    Compatibility.attr(this.dataRequestDialog, 'title', 'Select Data File');
                    this.dataRequestDialog.show();
                    construct.place(this.fileManager.domNode, this.insertDialogFileManagerDiv);
                    this._showFileManager();
                    break;

                case (EntryEnum.EventArgType.ScriptFile):
                    Compatibility.attr(this.dataRequestDialog, 'title', 'Insert Script');
                    this.dataRequestDialog.show();
                    construct.place(this.fileManager.domNode, this.insertDialogFileManagerDiv);
                    this._showFileManager();
                    break;

                default:
                    break;
            }
        },

        _onScriptStateUpdate: function (/*script.State*/update) {
            this._updateScriptState(update);
        },

        _onSelectRunner: function (/*script.State*/update, /*callback(script.State, bool)*/selectValidateHandler) {
            var fileManagerState = this.fileManager.getFileState();

            var actionObj = this._getTransitionAction(fileManagerState, update);
            if (actionObj.valid) {
                this._updateScriptState(update);
                this._setViewState(actionObj.newViewState, actionObj.limitEditMode);
            }
            this._executeTransitionAction(fileManagerState, actionObj.actionType);

            selectValidateHandler(update, actionObj.valid);
        },

        _onCancelInsertClick: function () {
            this._asyncEventInProcess = EntryEnum.EventArgType.None;
            this._editControl.configure();  // cancels pending action on Edit control
            this._resetInsertDialog();
        },

        _onInsertScriptDialogHide: function () {
            this._resetInsertDialog();
        }
    });
});