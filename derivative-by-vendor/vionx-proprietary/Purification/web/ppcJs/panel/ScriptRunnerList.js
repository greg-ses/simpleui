// ~/panel/ScriptRunnerList
// ScriptRunnerList - embedded Panel housing one ScriptRunner for each resource
// Responsibilities:
//  - get resource list and configure ScriptRunners
//  - broker user selection of ScriptRunner and publish selection event
//  - update ScriptRunners
//  - handle ScriptRunner events, decorate, and re-publish
//
// Pub/sub list:
// [pub] ppcJs.PubSub.timeUpdate
// [pub] ppcJs.PubSub.commTimeout

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-class', 'dojo/query', 'dojo/aspect', 'dojo/on',
         'dijit/registry', 'dojox/collections/Dictionary', 'dojox/xml/parser',
        '../Enum', '../utilities/AccessControl', '../utilities/Compatibility', '../utilities/DataFormat', '../utilities/Identity', '../script/State',
        './scriptRunnerList/StateRegister', '../control/ScriptRunner', '../control/_control/_cDto', '../control/scriptRunner/srDto',
        './_WatchdogPanel', 'dijit/_Container', 'dojo/text!./scriptRunnerList/template/scriptRunnerList.html'],
function (declare, lang, dom, domClass, query, aspect, on,
        registry, Dictionary, parser,
        Enum, AccessControl, Compatibility, DataFormat, Identity, State,
        StateRegister, ScriptRunner, _cDto, srDto,
        _WatchdogPanel, _Container, template) {
    return declare([_WatchdogPanel, _Container],
    {
        // ajax request command constants
        _resourceListCmd: { COMMAND: 'RESOURCE_LIST' },
        _scriptStatesCmd: { COMMAND: 'RESOURCE_STATES' },

        // ajax response tags
        _rootTemplateTag: 'scriptResources',
        _resourceTag: 'scriptResource',
        _resourceNameTag: 'resourceName',
        _resourceIdTag: 'resourceId',

        _rootDataTag: 'resourceStates',
        _resourceStateTag: 'resourceState',
        _fileNameTag: 'fileName',
        _scriptStateTag: 'state',
        _faultLevelTag: 'faultLevel',
        _stepIdTag: 'currentStepId',
        _currentEntryStatusTag: 'currentStepStatus',
        _breakPointUuidTag: 'breakPointStepId',
        _timesRemainingTag: 'timesRemaining',
        _variableTag: 'variable',
        _variableIdAttrib: 'variableId',
        _uuidAttrib: 'uuid',
        _noScriptAttrib: 'noscript',
        _modeTag: 'machineMode',
        _submodeTag: 'machineSubmode',

        // ajax request interval (ms)
        _refreshIntervalId: '',

        // dijit variables
        name: 'Script Runner List',
        templateString: template,
        baseClass: 'scriptRunnerList',

        // private variables
        _idWidgetMap: '',        // dictionary: key=arg.id, value=widget
        _selectedRunner: null,
        _stateRegister: null,
        _viewState: '',
        _fileList: null,        // reference to retain script file list until ScriptRunners constructed (from resource list)

        // lifecycle methods
        constructor: function () {
            this._stateRegister = new StateRegister();
        },

        postCreate: function () {
            this.inherited(arguments);
        },

        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);
            this._idWidgetMap = new Dictionary();
            this._fetchTemplate();
        },

        unload: function () {
            this.inherited(arguments);
            this._clearRefresh();
            this._stateRegister.clear();
            this.destroyDescendants();
        },

        setActiveScript: function (fileName) {
            var selectId = this._stateRegister.getSelectId();
            this._stateRegister.getState().fileName = fileName;
            this._idWidgetMap.item(selectId).setActiveScript(fileName);
        },

        setViewState: function (/*Enum.ViewState*/viewState) {
            this._viewState = viewState;
            this._idWidgetMap.forEach(function (item) {
                item.value.setViewState(viewState);
            }, this);
        },

        setFileList: function (/*string[]*/fileNames) {
            this._fileList = fileNames;
            this._setRunnerFileLists();
        },

        changeBreakPoint: function (/*string*/uuid, /*bool*/enable) {
            // delegate to currently selected ScriptRunner, which handles all script state interaction with the server
            var selectedId = this._stateRegister.getSelectId();
            var runner = this._idWidgetMap.item(selectedId);
            runner.changeBreakPoint(uuid, enable);
        },

        // private methods
        _setRunnerFileLists: function () {
            if (this._fileList) {
                this._idWidgetMap.forEach(function (item) {
                    item.value.setFileList(this._fileList);
                }, this);
            }
        },

        _clearRefresh: function () {
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                this._refreshIntervalId = '';
            }
        },

        _fetchTemplate: function () {
            var testUrl = '../../ppcJs/tests/autoCycleResourceListResponse.xml';

            this._initStore(testUrl, this._resourceListCmd, this._rootTemplateTag, this.onFetchTemplate);
        },

        _initiateDataRequests: function () {
            var testUrl = '../../ppcJs/tests/autoCycleStateResponse1.xml';

            var queryObj = {};
            this._initStore(testUrl, this._scriptStatesCmd, this._rootDataTag, this.onFetchData);

            this._clearRefresh();
            this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchData), this._refreshInterval);
        },

        _refetchData: function () {
            this._xmlStore.close();
            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onFetchData) });
        },

        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            var rootElem = items[0]['element'];
            var resources = query(this._resourceTag, rootElem);
            var hoverBehavior = (resources.length > 1);

            for (var i = 0; i < resources.length; i++) {
                var noScriptStr = Compatibility.attr(resources[i], this._noScriptAttrib);
                if (!DataFormat.toBool(noScriptStr)) {
                    var id = this.puS.getElementText(this._resourceIdTag, resources[i]);
                    var dto = new _cDto.Ctor(this._urlInfo, [AccessControl.Task.SystemControl], id);
                    var resourceName = this.puS.getElementText(this._resourceNameTag, resources[i]);

                    lang.mixin(dto, { resourceName: resourceName, hoverBehavior: hoverBehavior });

                    var runner = new ScriptRunner();
                    runner.configure(dto);

                    this.addChild(runner);
                    this._idWidgetMap.add(id, runner);
                    this._handlerList.push(aspect.after(runner, 'onScriptStateChange', lang.hitch(this, this._onScriptStateChange), true));
                    this._handlerList.push(aspect.after(runner, 'onSelectChange', lang.hitch(this, this._onSelectChange), true));
                    this._handlerList.push(on(runner.domNode, 'click', lang.hitch(this, this._handleResourceClick)));

                    // set first runner as default selection
                    if (this._idWidgetMap.count == 1) {
                        this._stateRegister.select(id);
                        runner.select();
                    }
                }
            }

            this._setRunnerFileLists();
            this._initiateDataRequests();
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            var rootElem = items[0]['element'];

            query(this._resourceStateTag, rootElem).forEach(function (stateElem) {
                var resourceId = Compatibility.attr(stateElem, this._resourceIdTag);
                var runner = this._idWidgetMap.item(resourceId);
                if (runner) {
                    var activeFile = this.puS.getElementText(this._fileNameTag, stateElem);
                    var uuid = this.puS.getElementText(this._stepIdTag, stateElem);
                    var state = parseInt(this.puS.getElementText(this._scriptStateTag, stateElem));

                    var currentStatus = this.puS.getElementText(this._currentEntryStatusTag, stateElem);

                    var loopCounts = new Array();   // {uuid: string, timesRemaining: int}[]
                    query(this._timesRemainingTag, stateElem).forEach(function (loopCount) {
                        var loopCountId = Compatibility.attr(loopCount, this._uuidAttrib);
                        var count = parseInt(parser.textContent(loopCount));
                        loopCounts.push({ uuid: loopCountId, timesRemaining: count });
                    }, this);

                    var breakPoints = new Array();
                    query(this._breakPointUuidTag, stateElem).forEach(function (breakPointElem) {
                        var breakPointUuid = parser.textContent(breakPointElem);
                        breakPoints.push(breakPointUuid);
                    }, this);

                    var variables = new Array();    // {variableId: string, value: float}[]
                    query(this._variableTag, stateElem).forEach(function (variableElem) {
                        var variableId = Compatibility.attr(variableElem, this._variableIdAttrib);
                        var value = parseFloat(parser.textContent(variableElem));
                        var floatValue = isNaN(value) ? 0 : value;
                        variables.push({ variableId: variableId, value: floatValue });
                    }, this);

                    var scriptState = new State(activeFile, uuid, state, resourceId, loopCounts, currentStatus, breakPoints, variables);
                    this._stateRegister.update(scriptState);

                    var faultLevel = this.puS.getElementText(this._faultLevelTag, stateElem);
                    var mode = this.puS.getElementText(this._modeTag, stateElem);
                    var submode = this.puS.getElementText(this._submodeTag, stateElem);
                    var dto = new srDto.Update(scriptState, faultLevel, mode, submode);

                    runner.update(dto);
                }
            }, this);

            var scriptState = lang.clone(this._stateRegister.getState());
            this.onScriptStateUpdate(scriptState);
        },

        validateHandlerStub: function (/*script.State*/update, /*bool*/selectApproved) {
        },

        selectValidateHandler: function (/*script.State*/update, /*bool*/selectApproved) {
            if (selectApproved) {
                var newSelectId = update.resourceId;
                var prevSelectedId = this._stateRegister.getSelectId();
                this._idWidgetMap.item(prevSelectedId).unselect();
                this._stateRegister.select(newSelectId);
                this._idWidgetMap.item(newSelectId).select();
            }
        },

        _onScriptStateChange: function (resourceId, /*Enum.PlayBackState*/newState, fileName) {
            var scriptState = this._stateRegister.getState();
            if (resourceId == scriptState.resourceId) {
                scriptState.state = newState;
                scriptState.fileName = fileName;
                this.onScriptStateUpdate(lang.clone(scriptState));
            }
        },

        _onSelectChange: function (resourceId, /*Enum.PlayBackState*/state, newFileName) {
            // update corresponding state
            var scriptState = this._stateRegister.getState();
            scriptState.fileName = newFileName;
            this.onSelectRunner(lang.clone(scriptState), lang.hitch(this, this.validateHandlerStub));
        },

        _handleResourceClick: function (evt) {
            var runner = registry.getEnclosingWidget(evt.target);
            if (runner.queryId) {
                var newId = runner.queryId;
                var selectedId = this._stateRegister.getSelectId();

                if (newId != selectedId) {
                    var proposedState = lang.clone(this._stateRegister.getState(newId));
                    this.onSelectRunner(proposedState, lang.hitch(this, this.selectValidateHandler));
                }
            }
        },

        // public events
        onScriptStateUpdate: function (/*script.State*/update) {
        },

        onSelectRunner: function (/*script.State*/update, /*callback(script.State, bool)*/selectValidateHandler) {
        }
    });
});