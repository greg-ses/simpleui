// top level widget containing project summary panel
// note: switches to local test file if running on localhost
// requires that dojo & ppcJs resources have already been linked and djConfig has been configured

// Pub/sub list:
// topic: 'projectName',    args: [projectName])

dojo.provide('ppcJs.ProjectSummaryPanel');

dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.layout.TableContainer');
dojo.require('dijit.TitlePane');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Container');
dojo.require('dijit.form.Select');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.Menu');
dojo.require('dijit.MenuBar');
dojo.require('dijit.MenuItem');
dojo.require('dijit.PopupMenuBarItem');
dojo.require('dojox.data.XmlStore');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.charting.Chart2D');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.utilities.Store');
dojo.require('ppcJs.LedStack');


dojo.declare('ppcJs.ProjectSummaryPanel', [dijit._Widget, dijit._Templated, dijit._Container],
{
    // ajax request command constants
    _loadIdGridCmd: { GET: 'PROJECT_ID' },
    _loadPanelDataCmd: { GET: 'PROJECT_CTRLDATA' },
    _loadChartCmd: { GET: 'PROJECT_CHART' },
    _setModeCmd: { SET: 'PROJECT_MODE' },
    _setRampRateCmd: { SET: 'PROJECT_RAMP' },
    _setLvrtCmd: { SET: 'PROJECT_LVRT' },

    // ajax request interval constants (ms)
    _panelDataInterval: 2000,
    _chartInterval: 5000,
    _refreshIntervalIds: '',

    // dijit variables
    name: 'ProjectSummaryPanel',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/ProjectSummaryPanel.html'),


    // enums and maps
    chartTypeEnum: {
        MaxEnergyStorage: 0,
        SOC: 1,
        MWChargeDischarge: 2
    },
    chartTypeLabels: '',
    _mapChartTypeLabels: function () {
        this.chartTypeLabels = new Array();
        this.chartTypeLabels[this.chartTypeEnum.MaxEnergyStorage] = 'Maximum Energy Storage Capability';
        this.chartTypeLabels[this.chartTypeEnum.SOC] = 'State of Charge';
        this.chartTypeLabels[this.chartTypeEnum.MWChargeDischarge] = 'MW (Charging/Discharging)';
    },

    durationEnum: {
        FifteenMinutes: 0,
        OneHour: 1,
        TwoHours: 2,
        FourHours: 3
    },
    durationLabels: '',
    _mapDurationLabels: function () {
        this.durationLabels = new Array();
        this.durationLabels[this.durationEnum.FifteenMinutes] = '15 minutes';
        this.durationLabels[this.durationEnum.OneHour] = '1 hour';
        this.durationLabels[this.durationEnum.TwoHours] = '2 hours';
        this.durationLabels[this.durationEnum.FourHours] = '4 hours';
    },

    controlStatusEnum: {
        AGC: 0,
        Frequency: 1,
        Voltage: 2,
        Power: 3
    },
    controlStatusLabels: '',
    _mapControlStatusLabels: function () {
        this.controlStatusLabels = new Array();
        this.controlStatusLabels[this.controlStatusEnum.AGC] = 'AGC';
        this.controlStatusLabels[this.controlStatusEnum.Frequency] = 'Frequency';
        this.controlStatusLabels[this.controlStatusEnum.Voltage] = 'Voltage';
        this.controlStatusLabels[this.controlStatusEnum.Power] = 'Power';
    },


    // custom variables
    _urlInfo: '',
    _controlStore: '',
    _chart: '',
    _chartStore: '',
    _chartTitle: '',
    _idGrid: '',
    _ctrlStatusLedStack: '',


    // public methods

    constructor: function () {
        this._mapChartTypeLabels();
        this._mapDurationLabels();
        this._mapControlStatusLabels();
    },

    load: function (urlVal) {
        if (!dojo.isObject(this._refreshIntervalIds)) {
            this._refreshIntervalIds = new Array();
        }
        this._urlInfo = ppcJs.utilities.Store.getUrlInfo(urlVal);
        this._loadIdGrid();
        this._loadPanelData();
        this.onSelect0Duration0();

        this.borderContainer.resize();
        this.startup();
    },

    unload: function () {
        // stop periodic ajax requests
        if (dojo.isObject(this._refreshIntervalIds)) {
            for (var i = 0; i < this._refreshIntervalIds.length; i++) {
                clearInterval(this._refreshIntervalIds[i]);
            }
            delete this._refreshIntervalIds;
        }
    },

    postCreate: function () {
        this._ctrlStatusLedStack = new ppcJs.LedStack(this.controlStatusLabels);
        dojo.addClass(this._ctrlStatusLedStack.domNode, 'statusDataValue');
        dojo.place(this._ctrlStatusLedStack.domNode, dojo.byId('gridData_controlStatus'), 'last');
    },

    // private methods

    _loadIdGrid: function () {
        var testUrl = '../../ppcJs/tests/projectSummaryIdResponse.xml';
        var fullUrl = ppcJs.utilities.Store.getFullUrl(this._urlInfo, this._loadIdGridCmd, testUrl);
        this._createIdGrid(fullUrl);
    },

    _loadPanelData: function () {
        var testUrl = '../../ppcJs/tests/projectSummaryCtrlResponse.xml';
        var fullUrl = ppcJs.utilities.Store.getFullUrl(this._urlInfo, this._loadPanelDataCmd, testUrl);
        this._controlStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'controlData', urlPreventCache: true });
        var ctrlRequest = this._controlStore.fetch({ onComplete: dojo.hitch(this, this.onFetchCtrl) });

        this._refreshIntervalIds.push(setInterval(dojo.hitch(this, this._reloadPanelData), this._panelDataInterval));
    },

    _loadChart: function (chartType, duration) {
        if (this._chart !== '') {
            this._chart.destroy();
        }

        var loadChartQuery = { CHART_TYPE: chartType, DURATION: duration };
        dojo.mixin(loadChartQuery, this._loadChartCmd);
        var testUrl = '../../ppcJs/tests/projectSummaryChartResponse.xml';
        var fullUrl = ppcJs.utilities.Store.getFullUrl(this._urlInfo, loadChartQuery, testUrl);

        this._chartStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'chart', urlPreventCache: true });
        var chartRequest = this._chartStore.fetch({ onComplete: dojo.hitch(this, this.onFetchChart) });

        this._refreshIntervalIds.push(setInterval(dojo.hitch(this, this._reloadChart), this._chartInterval));
        this._setChartTitle(chartType, duration);
    },

    _reloadPanelData: function () {
        this._controlStore.close();
        var request = this._controlStore.fetch({ onComplete: dojo.hitch(this, this.onFetchCtrl) });
    },

    _reloadChart: function () {
        this._chartStore.close();
        var request = this._chartStore.fetch({ onComplete: dojo.hitch(this, this.onRefetchChart) });
    },

    _setChartTitle: function (chartType, duration) {
        this._chartTitle = this.chartTypeLabels[chartType] + ' - Duration: ' + this.durationLabels[duration];
    },

    _createIdGrid: function (fullUrl) {
        var xmlStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'projectData' });

        // set the layout structure:
        var idGridLayout = [[
            {
                field: 'projectName',
                name: 'Project Name',
                width: '125px',
                formatter: function (item) {
                    var projectName = item.toString();
                    dojo.publish('projectName', [projectName]);
                    return projectName;
                }
            },
            {
                field: 'projectId',
                name: 'Project ID',
                width: '125px',
                formatter: function (item) {
                    return item.toString();
                }
            },
            {
                field: 'udcId',
                name: 'UDC ID',
                width: '125px',
                formatter: function (item) {
                    return item.toString();
                }
            },
            {
                field: 'zoneId',
                name: 'Zone ID',
                width: '125px',
                formatter: function (item) {
                    return item.toString();
                }
            },
            {
                field: 'dmndZone',
                name: 'Demand Zone',
                width: '125px',
                formatter: function (item) {
                    return item.toString();
                }
            },
            {
                field: 'loadGrp',
                name: 'Load Group',
                width: '125px',
                formatter: function (item) {
                    return item.toString();
                }
            },
            {
                field: 'numResources',
                name: 'Number of Resources',
                width: '125px',
                formatter: function (item) {
                    return item.toString();
                }
            }
        ]];

        // create a new grid:
        if (this._idGrid !== '') {
            this._idGrid.destroy();
        }

        this._idGrid = new dojox.grid.DataGrid({
            query: {},
            store: xmlStore,
            structure: idGridLayout
            },
            document.createElement('div'));

        // append the new grid to the placeholder div:
        dojo.place(this._idGrid.domNode, this.idGridDiv);

        // Call startup, in order to render the grid:
        this._idGrid.startup();
    },

    // assemble arg object, wire callbacks for dojo.xhrGet call
    _assembleXhrArgs: function (queryObject) {
        queryObject.CGI = this._urlInfo[1];

        var xhrArgs = { url: this._urlInfo[0], handleAs: 'xml', content: queryObject };
        xhrArgs.load = dojo.hitch(this, this.handleXhrLoad);
        xhrArgs.error = dojo.hitch(this, this.handleXhrError);

        return xhrArgs;
    },


    // callbacks
    onFetchCtrl: function (/*XmlItem[]*/items, request) {
        var parentElem = items[0]['element'];

        // control values
        var newValue = ppcJs.utilities.Store.getElementText('mode', parentElem);
        this.modeSelect.set('value', newValue, false);

        newValue = parseInt(ppcJs.utilities.Store.getElementText('rampRate', parentElem));
        this.rampRateInput.set('value', newValue, false);

        newValue = parseInt(ppcJs.utilities.Store.getElementText('lvrt', parentElem));
        this.lvrtInput.set('value', newValue, false);

        var precision = 2;
        var naNChar = '-';
        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('revenue', parentElem), precision, naNChar);
        dojo.byId('gridData_revenue').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('totalMw', parentElem), precision, naNChar);
        dojo.byId('gridData_totalMw').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('totalMvar', parentElem), precision, naNChar);
        dojo.byId('gridData_totalMvar').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('acTerminalVoltage', parentElem), precision, naNChar);
        dojo.byId('gridData_acTerminalVoltage').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('acCurrent', parentElem), precision, naNChar);
        dojo.byId('gridData_acCurrent').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('frequency', parentElem), precision, naNChar);
        dojo.byId('gridData_frequency').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('maxEnergyCapacity', parentElem), precision, naNChar);
        dojo.byId('gridData_maxEnergyCapacity').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('totalEnergyStored', parentElem), precision, naNChar);
        dojo.byId('gridData_totalEnergyStored').innerHTML = newValue;

        newValue = ppcJs.DataFormat.getFloatAsString(ppcJs.utilities.Store.getElementText('totalEnergyCanStore', parentElem), precision, naNChar);
        dojo.byId('gridData_totalEnergyCanStore').innerHTML = newValue;

        newValue = parseInt(ppcJs.utilities.Store.getElementText('controlStatus', parentElem));
        this._ctrlStatusLedStack.setState(newValue);
    },

    onFetchChart: function (/*XmlItem[]*/items, request) {
        var parentElem = items[0]['element'];

        var xAxisName = ppcJs.utilities.Store.getElementText('xAxisName', parentElem);
        var xScale = ppcJs.utilities.Store.getElementText('xScale', parentElem);
        var yAxisName = ppcJs.utilities.Store.getElementText('yAxisName', parentElem);
        var dataSet = ppcJs.utilities.Store.getElementObject('dataSet', parentElem);

        // TODO: get length of dataSet.data, create labels object array using xScale
        var titleAttrib = {
            title: this._chartTitle,
            titlePos: "top",
            titleGap: 20,
            titleFont: "normal normal normal 15pt Arial"
        };
        this._chart = new dojox.charting.Chart2D('projectSummaryChartDiv', titleAttrib);
        this._chart.addPlot('default', { type: 'Columns', gap: 5, minBarSize: 3, maxBarSize: 20 });
        this._chart.addAxis('x', { fixUpper: 'major', minorTicks: false, microTicks: false, includeZero: true, title: xAxisName, titleOrientation: 'away' });
        this._chart.addAxis('y', { vertical: true, fixUpper: 'major', includeZero: true, title: yAxisName });
        this._chart.addSeries("Series 1", dataSet.data);
        this._chart.render();
    },

    onRefetchChart: function (/*XmlItem[]*/items, request) {
        var parentElem = items[0]['element'];
        var dataSet = ppcJs.utilities.Store.getElementObject('dataSet', parentElem);
        this._chart.updateSeries("Series 1", dataSet.data);
        this._chart.render();
    },


    // chart menu callbacks
    onSelect0Duration0: function () {
        this._loadChart(this.chartTypeEnum.MaxEnergyStorage, this.durationEnum.FifteenMinutes);
    },

    onSelect0Duration1: function () {
        this._loadChart(this.chartTypeEnum.MaxEnergyStorage, this.durationEnum.OneHour);
    },

    onSelect0Duration2: function () {
        this._loadChart(this.chartTypeEnum.MaxEnergyStorage, this.durationEnum.TwoHours);
    },

    onSelect0Duration3: function () {
        this._loadChart(this.chartTypeEnum.MaxEnergyStorage, this.durationEnum.FourHours);
    },

    onSelect1Duration0: function () {
        this._loadChart(this.chartTypeEnum.SOC, this.durationEnum.FifteenMinutes);
    },

    onSelect1Duration1: function () {
        this._loadChart(this.chartTypeEnum.SOC, this.durationEnum.OneHour);
    },

    onSelect1Duration2: function () {
        this._loadChart(this.chartTypeEnum.SOC, this.durationEnum.TwoHours);
    },

    onSelect1Duration3: function () {
        this._loadChart(this.chartTypeEnum.SOC, this.durationEnum.FourHours);
    },

    onSelect2Duration0: function () {
        this._loadChart(this.chartTypeEnum.MWChargeDischarge, this.durationEnum.FifteenMinutes);
    },

    onSelect2Duration1: function () {
        this._loadChart(this.chartTypeEnum.MWChargeDischarge, this.durationEnum.OneHour);
    },

    onSelect2Duration2: function () {
        this._loadChart(this.chartTypeEnum.MWChargeDischarge, this.durationEnum.TwoHours);
    },

    onSelect2Duration3: function () {
        this._loadChart(this.chartTypeEnum.MWChargeDischarge, this.durationEnum.FourHours);
    },

    onModeSelectChange: function () {
        var modeSelected = this.modeSelect.get('value');

        var queryObject = { MODE: modeSelected };
        dojo.mixin(queryObject, this._setModeCmd);
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
    },

    onRampRateChange: function () {
        var rampRate = this.rampRateInput.get('value');

        var queryObject = { RAMP: rampRate };
        dojo.mixin(queryObject, this._setRampRateCmd);
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
    },

    onLvrtChange: function () {
        var lvrt = this.lvrtInput.get('value');

        var queryObject = { LVRT: lvrt };
        dojo.mixin(queryObject, this._setLvrtCmd);
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
    },

    // 2xx ajax response handler
    handleXhrLoad: function (response, ioArgs) {

    },

    // 4xx ajax response handler
    handleXhrError: function (response, ioArgs) {
        console.log('Request to server failed: no action taken', response, ioArgs);
    }
});