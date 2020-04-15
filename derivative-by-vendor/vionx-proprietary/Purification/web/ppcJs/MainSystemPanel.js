// main system panel - system overview and control

// Pub/sub list:
// [sub] ppcJs.PubSub.authorizations

dojo.provide('ppcJs.MainSystemPanel');

dojo.require('ppcJs._Panel');
dojo.require('dijit._Container');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.collections.Dictionary');
dojo.require('dojox.data.dom');
dojo.require("dojox.grid.TreeGrid");
dojo.require('ppcJs.utilities.Compatibility');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.MainPanelControl');
dojo.require('ppcJs.BattResourceBlockControl');
dojo.require('ppcJs.LogControl');
dojo.require('ppcJs.SystemDataGridControl');

dojo.declare('ppcJs.MainSystemPanel', [ppcJs._Panel, dijit._Container],
{
    // ajax request command constants
    _getTemplateCmd: { GET: 'MAIN_SYSTEM_TEMPLATE' },
    _getDataCmd: { GET: 'MAIN_SYSTEM_DATA' },

    // ajax request interval (ms)
    _refreshInterval: 2000,
    _refreshIntervalId: '',

    // ajax template response tags
    _rootTemplateTag: 'mainSystemTemplate',
    _numBlocksTag: 'numChildren',
    _modesTag: 'modes',
    _modeItemTag: 'item',
    _itemValueTag: 'value',
    _itemDescTag: 'desc',
    _taskTag: 'task',

    // ajax data response tags
    _rootDataTag: 'mainSystemData',
    // control data tags
    _modeDataTag: 'mode',
    _rateTag: 'rate',
    _estopTag: 'estop',
    _autoTag: 'auto',
    _lockTag: 'lock',
    _entryDataTag: 'entry',

    // resource data tags
    _resourceTag: 'subSys',
    _acInTag: 'acIn',
    _contactorTag: 'contact',
    _socStateTag: 'soc',
    _battPowerTag: 'battPwr',
    _hotelPowerTag: 'hotelPwr',

    // dijit variables
    name: 'MainSystemPanel',
    templatePath: dojo.moduleUrl('ppcJs', 'templates/MainSystemPanel.html'),

    // css class names
    _cssBlockContainer: 'mspResourceBlock',

    // class variables
    _mainControl: '',
    _resourceBlocks: '',
    _isFirstLoad: true,
    _mainControlConfig: {
        authReceived: false,
        templateReceived: false,
        dto: ''
    },

    // public methods

    constructor: function () {
        this._resourceBlocks = new Array();
        this._mainControlConfig.dto = new ppcJs.MpcDto.Ctor(0, 0, 0, 0, 0);
        dojo.subscribe(ppcJs.PubSub.authorizations, this, 'onAuthorizations');
    },

    load: function (urlVal, resourceId, serverProcess) {
        if (this._isFirstLoad) {
            this.inherited(arguments);
            this.dataGridControl.load(dojo.clone(this._urlInfo));
            this._fetchTemplate();
            this._isFirstLoad = false;
        }
        else {
            this._initiateDataRequests();
        }
    },

    unload: function () {
        this.inherited(arguments);
        if (this._refreshIntervalId) {
            clearInterval(this._refreshIntervalId);
            this._refreshIntervalId = '';
        }
    },


    // private methods

    _createMainPanelControl: function () {
        this._mainControl = new ppcJs.MainPanelControl(this._mainControlConfig.dto);
        dojo.place(this._mainControl.domNode, this.controlDiv);
        this.startup();

        this._initiateDataRequests();
    },

    _fetchTemplate: function () {
        var testUrl = '../../ppcJs/tests/mainSystemTemplateResponse.xml';
        this._initStore(testUrl, this._getTemplateCmd, this._rootTemplateTag, this.onFetchTemplate);
    },

    _initiateDataRequests: function () {
        var testUrl = '../../ppcJs/tests/mainSystemDataResponse.xml';
        this._initStore(testUrl, this._getDataCmd, this._rootDataTag, this.onFetchData);

        this._refreshIntervalId = setInterval(dojo.hitch(this, this._refetchData), this._refreshInterval);
    },

    _refetchData: function () {
        this._xmlStore.close();
        var request = this._xmlStore.fetch({ onComplete: dojo.hitch(this, this.onFetchData) });
    },

    _addResourceBlock: function () {
        // container and its css class define spacing around BattResourceBlocks
        var container = dojo.create('div');
        dojo.addClass(container, this._cssBlockContainer);
        var resourceBlock = new ppcJs.BattResourceBlockControl();
        dojo.place(resourceBlock.domNode, container);
        dojo.place(container, this.blocksPane.domNode);
        this._resourceBlocks.push(resourceBlock);
    },

    _updateMainControl: function (/*XmlElement*/xmlElement) {
        if (this._mainControl) {
            var mode = parseInt(this.puS.getElementText(this._modeDataTag, xmlElement));
            var rate = parseInt(this.puS.getElementText(this._rateTag, xmlElement));
            var estop = ppcJs.DataFormat.toBool(this.puS.getElementText(this._estopTag, xmlElement));
            var auto = ppcJs.DataFormat.toBool(this.puS.getElementText(this._autoTag, xmlElement));
            var lock = ppcJs.DataFormat.toBool(this.puS.getElementText(this._lockTag, xmlElement));
            var dto = new ppcJs.MpcDto.Update(mode, rate, estop, auto, lock);

            this._mainControl.update(dto);
        }
    },

    _updateLogControl: function (/*XmlElement*/xmlElement) {
        var dto = ppcJs.LogData.parseXml(xmlElement);
        this.logControl.update(dto);
    },

    _updateResourceBlocks: function (/*XmlElement*/xmlElement) {
        var subSysData = dojo.query(this._resourceTag, xmlElement);

        for (var i = 0; i < subSysData.length; i++) {
            var acIn = ppcJs.DataFormat.toBool(this.puS.getElementText(this._acInTag, subSysData[i]));
            var contact = ppcJs.DataFormat.toBool(this.puS.getElementText(this._contactorTag, subSysData[i]));
            var soc = parseInt(this.puS.getElementText(this._socStateTag, subSysData[i]));
            var battPower = this.puS.getElementText(this._battPowerTag, subSysData[i]);
            var hotelPower = this.puS.getElementText(this._hotelPowerTag, subSysData[i]);

            var dto = new ppcJs.BattResourceBlockDTO(acIn, contact, soc, battPower, hotelPower);
            this._resourceBlocks[i].update(dto);
        }
    },


    // callbacks

    onAuthorizations: function (/*ppcJs.utilities.AccessControl.Task[]*/tasks) {
        this._mainControlConfig.dto.authTasks = tasks;
        this._mainControlConfig.authReceived = true;
        if (this._mainControlConfig.templateReceived) {
            this._createMainPanelControl();
        }
    },

    onFetchTemplate: function (/*XmlItem[]*/items, request) {
        var rootElem = items[0]['element'];

        // populate resource block controls
        var numResourceBlocksStr = this.puS.getElementText(this._numBlocksTag, rootElem);
        var numResourceBlocks = ppcJs.DataFormat.isInt(numResourceBlocksStr) ? ppcJs.DataFormat.toInt(numResourceBlocksStr) : 0;
        for (var l = 0; l < numResourceBlocks; l++) {
            this._addResourceBlock();
        }

        var modes = dojo.query(this._modeItemTag, rootElem);
        this._mainControlConfig.dto.modeMap = new dojox.collections.Dictionary();
        for (var i = 0; i < modes.length; i++) {
            var modeVal = parseInt(this.puS.getElementText(this._itemValueTag, modes[i]));
            var modeDesc = this.puS.getElementText(this._itemDescTag, modes[i])
            this._mainControlConfig.dto.modeMap.add(modeVal, modeDesc);
        }

        this._mainControlConfig.templateReceived = true;
        this._mainControlConfig.dto.urlInfo = dojo.clone(this._urlInfo);
        this._mainControlConfig.dto.isMaster = (numResourceBlocks > 0);
        if (this._mainControlConfig.authReceived) {
            this._createMainPanelControl();
        }
    },

    onFetchData: function (/*XmlItem[]*/items, request) {
        var xmlElement = items[0]['element'];
        this._updateMainControl(xmlElement);
        this._updateResourceBlocks(xmlElement);
        this._updateLogControl(xmlElement);
    }
});