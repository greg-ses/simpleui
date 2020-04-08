// main quad panel - quad overview and control

// Pub/sub list:
// [sub] ppcJs.PubSub.authorizations

dojo.provide('ppcJs.MainBlockPanel');

dojo.require('ppcJs._Panel');
dojo.require('dijit._Container');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.MenuBar');
dojo.require('dijit.MenuBarItem');
dojo.require('dojox.collections.Dictionary');
dojo.require('dojox.data.dom');
dojo.require('dojox.charting.Chart2D');
dojo.require("dojox.charting.action2d.Tooltip");
dojo.require('dojox.charting.widget.SelectableLegend');
dojo.require('dojox.charting.themes.PlotKit.blue');
dojo.require('dojox.string.Builder');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.utilities.AccessControl');
dojo.require('ppcJs.utilities.Compatibility');
dojo.require('ppcJs.MainPanelControl');
dojo.require('ppcJs.LogControl');
dojo.require('ppcJs.AcAcControl');
dojo.require('ppcJs.DcDcControl');
dojo.require('ppcJs.BatteryControl');
dojo.require('ppcJs.PumpControl');

dojo.declare('ppcJs.MainBlockPanel', [ppcJs._Panel, dijit._Container],
{
    // ajax request command constants
    _getTemplateCmd: { GET: 'MAIN_SYSTEM_TEMPLATE' },
    _getDataCmd: { GET: 'MAIN_BLOCK_DATA' },
    _loadChartCmd: { GET: 'BLOCK_CHART' },

    // ajax request interval (ms)
    _refreshInterval: 2000,
    _chartInterval: 5000,
    _refreshIntervalIds: '',

    // ajax template response tags
    _rootTemplateTag: 'mainSystemTemplate',
    _numBlocksTag: 'numChildren',
    _modesTag: 'modes',
    _modeItemTag: 'item',
    _itemValueTag: 'value',
    _itemDescTag: 'desc',

    // ajax data response tags
    _rootDataTag: 'mainBlockData',

    // - control data tags
    _mainPanelControlTag: 'mpc',
    _modeTag: 'mode',
    _rateTag: 'rate',
    _estopTag: 'estop',
    _autoTag: 'auto',
    _lockTag: 'lock',

    // - LogControl
    _entryDataTag: 'entry',

    // - AcAcControl
    _acAcControlTag: 'acAc',
    _acInTag: 'acIn',
    _contactTag: 'contact',
    _rectifierTag: 'rect',
    _inverterTag: 'inv',
    _tempOkTag: 'temp',
    _intPowerTag: 'intPwr',
    _vBusTag: 'vBus',

    // - DcDcControl
    _dcDcControlTag: 'dcDc',
    _cabinetPwrTag: '',
    _OutSenseTag: 'mode',

    // - BatteryControl
    _batteryControlTag: 'batt',
    _socTag: 'soc',
    _totITag: 'totI',
    _avgITag: 'avgI',
    _totAhTag: 'totAh',
    _avgAhTag: 'avgAh',
    _powerTag: 'pwr',
    _avgVTag: 'avgV',

    // - PumpControl
    _pumpControlTag: 'pump',
    _pumpsOnTag: 'on',
    _leakTag: 'leak',
    _valve12Tag: 'valve12',
    _valve34Tag: 'valve34',
    _pressureTag: 'press',

    // - Chart
    _seriesTag: 'series',
    _toolTipsTag: 'toolTips',
    _dataTag: 'd',
    _nameAttr: 'desc',

    // dijit variables
    name: 'MainBlockPanel',
    templatePath: dojo.moduleUrl('ppcJs', 'templates/MainBlockPanel.html'),

    // enums and maps
    chartTypeEnum: {
        Battery: 0,
        Pump: 1
    },
    chartTypeLabels: '',
    _mapChartTypeLabels: function () {
        this.chartTypeLabels = new Array();
        this.chartTypeLabels[this.chartTypeEnum.Battery] = 'Batteries';
        this.chartTypeLabels[this.chartTypeEnum.Pump] = 'Pumps';
    },

    // class variables
    _controlLocked: '',
    _chart: '',
    _chartStore: '',
    _chartToolTips: '',
    _chartLegend: '',
    _mainControl: '',
    _isFirstLoad: true,
    _mainControlConfig: {
        authReceived: false,
        templateReceived: false,
        dto: ''
    },


    // public methods

    constructor: function () {
        this._mapChartTypeLabels();
        this._mainControlConfig.dto = new ppcJs.MpcDto.Ctor(0, 0, 0, 0, 0);
        dojo.subscribe(ppcJs.PubSub.authorizations, this, '_processAuths');
    },

    load: function (urlVal, /*string*/resourceId, serverProcess, /*bool*/controlLocked) {
        if (!dojo.isObject(this._refreshIntervalIds)) {
            this._refreshIntervalIds = new Array();
        }
        this._queryId = resourceId;
        this._controlLocked = controlLocked;
        this._mainControlConfig.dto.queryId = resourceId;

        if (this._isFirstLoad) {
            this.inherited(arguments);
            this._isFirstLoad = false;
        }

        this._fetchTemplate();
        this.onSelectBattChart();
        console.log('load complete');
    },

    unload: function () {
        this.inherited(arguments);

        // stop periodic ajax requests
        if (dojo.isObject(this._refreshIntervalIds)) {
            for (var i = 0; i < this._refreshIntervalIds.length; i++) {
                clearInterval(this._refreshIntervalIds[i]);
            }
            delete this._refreshIntervalIds;
        }

        this._clearMainPanelControl();
        this._clearChart();
    },


    // private methods
    _processAuths: function (/*ppcJs.utilities.AccessControl.Task[]*/tasks) {
        this._mainControlConfig.dto.authTasks = tasks;
        this._mainControlConfig.authReceived = true;
        if (this._mainControlConfig.templateReceived) {
            this._createMainPanelControl();
        }
    },

    _createMainPanelControl: function () {
        if (this._controlLocked) {
            // override authorizations to lock out control
            this._mainControlConfig.dto.authTasks = [ppcJs.utilities.AccessControl.Task.GeneralView];
        }
        this._mainControl = new ppcJs.MainPanelControl(this._mainControlConfig.dto);
        dojo.place(this._mainControl.domNode, this.controlDiv);
        this.startup();

        this._initiateDataRequests();
    },

    _clearMainPanelControl: function () {
        if (this._mainControl) {
            dojo.destroy(this._mainControl.attr('id'));
            this._mainControl.destroyRecursive();
            delete this._mainControl;
        }
    },

    _fetchTemplate: function () {
        var testUrl = '../../ppcJs/tests/mainSystemTemplateNoChildrenResponse.xml';
        var queryObj = { ID: this._queryId };
        dojo.mixin(queryObj, this._getTemplateCmd);
        this._initStore(testUrl, queryObj, this._rootTemplateTag, this.onFetchTemplate);
    },

    _initiateDataRequests: function () {
        var testUrl = '../../ppcJs/tests/mainBlockDataResponse.xml';
        var queryObj = { ID: this._queryId };
        dojo.mixin(queryObj, this._getDataCmd);
        this._initStore(testUrl, queryObj, this._rootDataTag, this.onFetchData);

        this._refreshIntervalIds.push(setInterval(dojo.hitch(this, this._refetchData), this._refreshInterval));
    },

    _refetchData: function () {
        this._xmlStore.close();
        var request = this._xmlStore.fetch({ onComplete: dojo.hitch(this, this.onFetchData) });
    },

    _updateMainControl: function (/*XmlElement*/xmlElement) {
        var mode = parseInt(this.puS.getElementText(this._modeTag, xmlElement));
        var rate = parseInt(this.puS.getElementText(this._rateTag, xmlElement));
        var estop = ppcJs.DataFormat.toBool(this.puS.getElementText(this._estopTag, xmlElement));
        var auto = ppcJs.DataFormat.toBool(this.puS.getElementText(this._autoTag, xmlElement));
        var lock = ppcJs.DataFormat.toBool(this.puS.getElementText(this._lockTag, xmlElement));
        var dto = new ppcJs.MpcDto.Update(mode, rate, estop, auto, lock);

        this._mainControl.update(dto);
    },

    _updateLogControl: function (/*XmlElement*/xmlElement) {
        var dto = ppcJs.LogData.parseXml(xmlElement);
        this.logControl.update(dto);
    },

    _updateAcAcControl: function (/*XmlElement*/xmlElement) {
        var acInOk = ppcJs.DataFormat.toBool(this.puS.getElementText(this._acInTag, xmlElement));
        var contactClosed = ppcJs.DataFormat.toBool(this.puS.getElementText(this._contactTag, xmlElement));
        var rectifierOn = ppcJs.DataFormat.toBool(this.puS.getElementText(this._rectifierTag, xmlElement));
        var inverterOn = ppcJs.DataFormat.toBool(this.puS.getElementText(this._inverterTag, xmlElement));
        var temperatureOk = ppcJs.DataFormat.toBool(this.puS.getElementText(this._tempOkTag, xmlElement));
        var internalPower = this.puS.getElementText(this._intPowerTag, xmlElement);
        var busVoltage = this.puS.getElementText(this._vBusTag, xmlElement);

        var dto = new ppcJs.AcAcDTO(acInOk, contactClosed, rectifierOn, inverterOn, temperatureOk, internalPower, busVoltage);
        this.acAcControl.update(dto);
    },

    _updateDcDcControl: function (/*XmlElement*/xmlElement) {
        var cabinetPowerOn = ppcJs.DataFormat.toBool(this.puS.getElementText(this._cabinetPwrTag, xmlElement));
        var temperatureOk = ppcJs.DataFormat.toBool(this.puS.getElementText(this._tempOkTag, xmlElement));
        var mode = this.puS.getElementText(this._OutSenseTag, xmlElement);
        var busVoltage = this.puS.getElementText(this._vBusTag, xmlElement);

        var dto = new ppcJs.DcDcDTO(cabinetPowerOn, temperatureOk, mode, busVoltage);
        this.dcDcControl.update(dto);
    },

    _updateBatteryControl: function (/*XmlElement*/xmlElement) {
        var soc = parseInt(this.puS.getElementText(this._socTag, xmlElement));
        var totCurrent = this.puS.getElementText(this._totITag, xmlElement);
        var avgCurrent = this.puS.getElementText(this._avgITag, xmlElement);
        var totAmpHr = this.puS.getElementText(this._totAhTag, xmlElement);
        var avgAmpHr = this.puS.getElementText(this._avgAhTag, xmlElement);
        var power = this.puS.getElementText(this._powerTag, xmlElement);
        var avgVolt = this.puS.getElementText(this._avgVTag, xmlElement);

        var dto = new ppcJs.BatteryDTO(soc, totCurrent, avgCurrent, totAmpHr, avgAmpHr, power, avgVolt);
        this.batteryControl.update(dto);
    },

    _updatePumpControl: function (/*XmlElement*/xmlElement) {
        var pumpsOn = ppcJs.DataFormat.toBool(this.puS.getElementText(this._pumpsOnTag, xmlElement));
        var leakOk = ppcJs.DataFormat.toBool(this.puS.getElementText(this._leakTag, xmlElement));
        var valve12Closed = ppcJs.DataFormat.toBool(this.puS.getElementText(this._valve12Tag, xmlElement));
        var valve34Closed = ppcJs.DataFormat.toBool(this.puS.getElementText(this._valve34Tag, xmlElement));
        var tempOk = ppcJs.DataFormat.toBool(this.puS.getElementText(this._tempOkTag, xmlElement));
        var pressureOk = ppcJs.DataFormat.toBool(this.puS.getElementText(this._pressureTag, xmlElement));

        var dto = new ppcJs.PumpDTO(pumpsOn, leakOk, valve12Closed, valve34Closed, tempOk, pressureOk);
        this.pumpControl.update(dto);
    },

    _loadChart: function (chartType) {
        this._clearChart();

        var loadChartQuery = { CHART_TYPE: chartType };
        dojo.mixin(loadChartQuery, this._loadChartCmd);
        var testUrl = '../../ppcJs/tests/blockBatteryChartResponse.xml';
        var fullUrl = this.puS.getFullUrl(this._urlInfo, loadChartQuery, testUrl);

        this._chartStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'chart', urlPreventCache: true });
        var chartRequest = this._chartStore.fetch({ onComplete: dojo.hitch(this, this.onFetchChart) });

        this._refreshIntervalIds.push(setInterval(dojo.hitch(this, this._reloadChart), this._chartInterval));
    },

    _createChart: function (/*Xmlelement*/parentElem) {
        var xAxisName = this.puS.getElementText('xAxisName', parentElem);

        var titleAttrib = {
            title: this._chartTitle,
            titlePos: "top",
            titleGap: 20,
            titleFont: "normal normal normal 15pt Arial"
        };
        this._chart = new dojox.charting.Chart2D(this.chartDiv, titleAttrib);
        this._chart.addPlot('default', { type: 'ClusteredColumns', gap: 5, minBarSize: 1, maxBarSize: 10 });
        this._chart.addPlot("Grid", { type: "Grid",
            hMajorLines: true,
            hMinorLines: true,
            vMajorLines: false,
            vMinorLines: false
        });
        this._chart.addAxis('x', { htmlLabels: false, fixUpper: 'major', minorTicks: true, microTicks: false, includeZero: false, title: xAxisName, titleOrientation: 'away' });
        this._chart.addAxis('y', { vertical: true, fixUpper: 'major', includeZero: true });
        var toolTip = new dojox.charting.action2d.Tooltip(this._chart, 'default', { text: dojo.hitch(this, this._getToolTip) });
        this._chart.setTheme(dojox.charting.themes.PlotKit.blue);

        var legendDiv = dojo.byId(this.legendDiv);
        var disposableDiv = dojo.create('div', null, legendDiv, 'first');    // Legend assumes disposableDiv
        this._chartLegend = new dojox.charting.widget.SelectableLegend({ chart: this._chart, outline: true }, disposableDiv);
    },

    /* tooltip action object [o] fields:
    chart: [the dojox.charting.Chart object]
    hAxis: 'x'
    vAxis: 'y'
    index: 7 - 0-based index of what point you moused over
    plot: [in this case, the dojox.charting.plot2d.Columns object]
    x: 2.5 - the value on the x axis
    y: 60 - the value on the y axis
    */
    _getToolTip: function (/*tooltip action object*/o) {
        var toolTip = new dojox.string.Builder();

        // adds 'desc: value <br/>' for each tooltip
        for (tip = 0; tip < this._chartToolTips.length; tip++) {
            toolTip.append(this._chartToolTips[tip].desc);
            toolTip.append(': ');
            toolTip.append(this._chartToolTips[tip].values[o.index]);
            toolTip.append('<br />');
        }

        return toolTip.toString();
    },

    _reloadChart: function () {
        this._chartStore.close();
        var request = this._chartStore.fetch({ onComplete: dojo.hitch(this, this.onRefetchChart) });
    },

    _fillChart: function (/*Xmlelement*/parentElem, /*bool*/isRefill) {
        this._chartToolTips = new Array();
        var seriesElem = this.puS.getElement(this._seriesTag, parentElem);
        var dataSets = dojo.query(this._dataTag, seriesElem);

        for (var i = 0; i < dataSets.length; i++) {
            var name = ppcJs.utilities.Compatibility.attr(dataSets[i], this._nameAttr);
            var dataSet = ppcJs.DataFormat.toArray(dojox.data.dom.textContent(dataSets[i]));
            if (isRefill) {
                this._chart.updateSeries(name, dataSet);
            }
            else {
                this._chart.addSeries(name, dataSet);
            }
        }

        // populate tooltips collection
        var toolTipsElem = this.puS.getElement(this._toolTipsTag, parentElem);
        var toolTips = dojo.query(this._dataTag, toolTipsElem);
        for (var tip = 0; tip < toolTips.length; tip++) {
            var name = ppcJs.utilities.Compatibility.attr(toolTips[tip], this._nameAttr);
            var values = ppcJs.DataFormat.toArray(dojox.data.dom.textContent(toolTips[tip]));
            this._chartToolTips.push(new ppcJs.ToolTip(name, values));
        }

        this._chart.render();
        this._chartLegend.refresh();
    },

    _clearChart: function () {
        if (this._chart) {
            this._chart.destroy();
            this._chartLegend.destroy();
            delete this._chart;
            delete this._chartLegend;
            delete this._chartToolTips;
        }
    },

    // callbacks

    onFetchTemplate: function (/*XmlItem[]*/items, request) {
        var rootElem = items[0]['element'];

        var numResourceBlocksStr = this.puS.getElementText(this._numBlocksTag, rootElem);
        var numResourceBlocks = ppcJs.DataFormat.isInt(numResourceBlocksStr) ? ppcJs.DataFormat.toInt(numResourceBlocksStr) : 0;
        this._mainControlConfig.dto.isMaster = (numResourceBlocks > 0);

        var modes = dojo.query(this._modeItemTag, rootElem);
        this._mainControlConfig.dto.modeMap = new dojox.collections.Dictionary();
        for (var i = 0; i < modes.length; i++) {
            var modeVal = parseInt(this.puS.getElementText(this._itemValueTag, modes[i]));
            var modeDesc = this.puS.getElementText(this._itemDescTag, modes[i])
            this._mainControlConfig.dto.modeMap.add(modeVal, modeDesc);
        }

        this._mainControlConfig.templateReceived = true;
        this._mainControlConfig.dto.urlInfo = dojo.clone(this._urlInfo);
        if (this._mainControlConfig.authReceived) {
            this._createMainPanelControl();
        }
    },

    onFetchData: function (/*XmlItem[]*/items, request) {
        var xmlElement = items[0]['element'];
        this._updateMainControl(this.puS.getElement(this._mainPanelControlTag, xmlElement));
        this._updateLogControl(xmlElement);
        this._updateAcAcControl(this.puS.getElement(this._acAcControlTag, xmlElement));
        this._updateDcDcControl(this.puS.getElement(this._dcDcControlTag, xmlElement));
        this._updateBatteryControl(this.puS.getElement(this._batteryControlTag, xmlElement));
        this._updatePumpControl(this.puS.getElement(this._pumpControlTag, xmlElement));
    },

    onFetchChart: function (/*XmlItem[]*/items, request) {
        var parentElem = items[0]['element'];
        this._createChart(parentElem);
        this._fillChart(parentElem, false);
    },

    onRefetchChart: function (/*XmlItem[]*/items, request) {
        var parentElem = items[0]['element'];
        this._fillChart(parentElem, true);
    },

    onSelectBattChart: function () {
        this._chartTitle = this.chartTypeLabels[this.chartTypeEnum.Battery];
        this._loadChart(this.chartTypeEnum.Battery);
    },

    onSelectPumpChart: function () {
        this._chartTitle = this.chartTypeLabels[this.chartTypeEnum.Pump];
        this._loadChart(this.chartTypeEnum.Pump);
    }
});

// tooltip dictionary
dojo.declare('ppcJs.ToolTip', null,
{
    desc: '',
    values: '',  // array values for this tip (1 value per series entry)

    constructor: function (/*string*/desc, /*Array*/values) {
        this.desc = desc;
        this.values = values;
    }
});