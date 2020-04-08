// ~/control/ScriptRunner
// ScriptRunner - control for running and monitoring a script on a resource
// Responsibilities:
//  - display script status
//  - user selection of active script
//  - user run/pause/stop control of active script
//  - publish events on user inputs

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-class', 'dojo/dom-style', 'dojo/query', 'dojo/_base/array',
        '../widget/PlayBack', '../Enum', '../script/State', '../utilities/File', '../utilities/Page', 'dijit/form/Select',
        './_Control', '../mixin/_QueueClient', '../mixin/_ToolTipClient', '../mixin/_XhrClient', 'dojo/text!./scriptRunner/template/scriptRunner.html'],
function (declare, lang, dom, domClass, domStyle, query, array,
        PlayBack, Enum, State, File, Page, Select,
        _Control, _QueueClient, _ToolTipClient, _XhrClient, template) {
    return declare([_Control, _QueueClient, _ToolTipClient, _XhrClient],
    {
        // ajax request command constants
        _runScriptCmd: { COMMAND: 'RUN_SCRIPT' },
        _pauseScriptCmd: { COMMAND: 'PAUSE_SCRIPT' },
        _stopScriptCmd: { COMMAND: 'STOP_SCRIPT' },
        _setBreakPoint: { COMMAND: 'SET_BREAKPOINT' },
        _clearBreakPoint: { COMMAND: 'CLEAR_BREAKPOINT' },

        // css class names/in-line code
        _cssSelectBorder: '_controlSelectBorder',
        _cssUnselectBorder: '_controlBorder',
        _cssSelectFont: 'srSelectFont',
        _cssViewStateFont: 'srViewStateFont',

        // public variables configured by Ctor DTO
        resourceName: '',
        resourceId: '',

        // private class variables
        _handlerList: null,
        _activeFile: '',
        _viewState: '',
        _selected: false,
        _inhibitUpdate: false,  // on select, inhibits updating until user interacts with widget
        _allowHover: false,     // true = add hover affordance when unselected

        // dijit variables
        name: 'Script Runner',
        templateString: template,
        baseClass: 'scriptRunner _control _controlBorder',

        // lifecycle methods
        constructor: function () {
            this._handlerList = new Array();
            this._queueDelayMs = 1000;
            this._initializeToolTips();
        },

        // public methods
        configure: function (/*control._control._cDto.Ctor*/dto) {
            this.inherited(arguments);
            dom.byId(this.resourceName).innerHTML = dto.resourceName;
            this._allowHover = dto.hoverBehavior;
            this._addHoverBehavior();
        },

        update: function (/*control.scriptRunner.srDto*/dto) {
            dom.byId(this.modeBox).innerHTML = dto.mode;
            dom.byId(this.submodeBox).innerHTML = dto.subMode;

            if (!this._inhibitUpdate) {
                this.playBack.setState(dto.state.state);
                this.setActiveScript(dto.state.fileName);
                this._setSelectEnable();
            }
        },

        setActiveScript: function (fileName) {
            this._activeFile = fileName;
            this.scriptSelect.set('value', this._activeFile);
            this._enablePlayback();
        },

        setViewState: function (/*Enum.ViewState*/viewState) {
            this._viewState = viewState;
            this._setView();
        },

        select: function () {
            this._selected = true;
            this._removeHoverBehavior();
            this._setView();
        },

        unselect: function () {
            this._selected = false;
            this._addHoverBehavior();
            this._setView();
        },

        setFileList: function (/*string[]*/fileNames) {
            var options = new Array();
            options.push({ value: '', label: '' }); // default used when no filename is received in update

            array.forEach(fileNames, function (fileName) {
                var shortFileName = File.removeExtension(fileName);
                options.push({ value: fileName, label: shortFileName });
            });

            this.scriptSelect.set('options', options);
            this.scriptSelect.set('value', this._activeFile);
        },

        changeBreakPoint: function (/*string*/uuid, /*bool*/enable) {
            var queryObj = { ID: this.queryId, STEP_ID: uuid };
            if (enable) {
                lang.mixin(queryObj, this._setBreakPoint);
            }
            else {
                lang.mixin(queryObj, this._clearBreakPoint);
            }

            this._xhrGetWithUpdateBlackout(queryObj);
        },

        // private methods
        _enablePlayback: function () {
            if ((this._viewState == Enum.ViewState.View) && this._activeFile) {
                this.playBack.enable();
            }
            else {
                this.playBack.disable();
            }
        },

        _setView: function () {
            var resourceNameNode = dom.byId(this.resourceName);
            this._setSelectEnable();
            this._enablePlayback();

            if (this._selected && (this._viewState == Enum.ViewState.View)) {
                domClass.add(resourceNameNode, this._cssViewStateFont);

                this._inhibitUpdate = true;
                domClass.add(resourceNameNode, this._cssSelectFont);
                domClass.replace(this.domNode, this._cssSelectBorder, this._cssUnselectBorder);
                domClass.replace(this.domNode, this.puB._cssSelectBg, this.puB._cssHover);
            }
            else if (this._selected && (this._viewState == Enum.ViewState.Edit)) {
                domClass.remove(resourceNameNode, this._cssViewStateFont);

                this._inhibitUpdate = false;
                domClass.add(resourceNameNode, this._cssSelectFont);
                domClass.replace(this.domNode, this._cssSelectBorder, this._cssUnselectBorder);
                domClass.remove(this.domNode, this.puB._cssSelectBg);
            }
            else if (!this._selected && (this._viewState == Enum.ViewState.View)) {
                domClass.add(resourceNameNode, this._cssViewStateFont);

                this._inhibitUpdate = false;
                domClass.remove(resourceNameNode, this._cssSelectFont);
                domClass.replace(this.domNode, this._cssUnselectBorder, this._cssSelectBorder);
                domClass.remove(this.domNode, this.puB._cssSelectBg);
            }
            else /* !this._selected && (this._viewState == Enum.ViewState.Edit) */{
                domClass.remove(resourceNameNode, this._cssViewStateFont);

                this._inhibitUpdate = false;
                domClass.remove(resourceNameNode, this._cssSelectFont);
                domClass.replace(this.domNode, this._cssUnselectBorder, this._cssSelectBorder);
                domClass.remove(this.domNode, this.puB._cssSelectBg);
            }
        },

        _setSelectEnable: function () {
            var playbackState = this.playBack.getState();
            if ((this._viewState == Enum.ViewState.View) && this._selected && (playbackState == Enum.PlayBackState.Stopped)) {
                Page.enableDijit(this.scriptSelect);
            }
            else {
                Page.disableDijit(this.scriptSelect);
            }
        },

        _addHoverBehavior: function () {
            if (this._allowHover) {
                this.puP.addHoverBehavior(this._handlerList, dom.byId(this.containerNode), this.puB._cssHover);
                this._addToolTip(this.containerNode, 'Make this the active resource to select and view a script.');
            }
        },

        _removeHoverBehavior: function () {
            if (this._allowHover) {
                // removing hover behavior so need to explicitly remove hover css
                var hoverNode = dom.byId(this.containerNode);
                domClass.remove(hoverNode, this.puB._cssHover);
                domStyle.set(hoverNode, 'cursor', 'auto');

                array.forEach(this._handlerList, function (handler) {
                    handler.remove();
                });
                this._handlerList.length = 0;
                this._clearToolTips();
            }
        },

        _xhrGetWithUpdateBlackout: function (queryObj) {
            this.xhrGet(queryObj);
            this._setDebounce();
        },

        // callbacks
        _onScriptStateChange: function (/*Enum.PlayBackState*/newState) {
            var queryObj = { ID: this.queryId, FILE_NAME: this._activeFile };

            switch (newState) {
                case (Enum.PlayBackState.Paused):
                    lang.mixin(queryObj, this._pauseScriptCmd);
                    break;

                case (Enum.PlayBackState.Running):
                    lang.mixin(queryObj, this._runScriptCmd);
                    break;

                case (Enum.PlayBackState.Stopped):
                default:
                    lang.mixin(queryObj, this._stopScriptCmd);
                    break;
            }

            this._xhrGetWithUpdateBlackout(queryObj);
            this._setSelectEnable();
            this.onScriptStateChange(this.queryId, newState, this._activeFile);
        },

        _onSelectChange: function (newValue) {
            if (this._viewState == Enum.ViewState.View) {
                var activeScript = this.scriptSelect.get('value');
                if (activeScript) {
                    this.playBack.enable();
                    this._inhibitUpdate = true;     // pending until playback button selected
                    this._activeFile = activeScript;
                    var state = this.playBack.getState();
                    this.onSelectChange(this.queryId, state, this._activeFile);
                }
            }
        },


        // public events
        onScriptStateChange: function (resourceId, /*Enum.PlayBackState*/newState, fileName) {
        },

        onSelectChange: function (resourceId, /*Enum.PlayBackState*/state, newFileName) {
        }
    });
});
