// ~/panel/MovingWindowChart
/* moving window chart widget: processes streaming sample data in proprietary format
    features:
    - doubleclick chart or click refresh button for snapshot at selected zoom. snapshot refreshes selected extant in fixed window
    - mouse scroll or slide range and snapshot to zoom
    - drag chart or selected slider range to pan
    - export to csv file
    - doubleclick legend box to toggle selection of all signals

main components:
    _chart:         dojox/charting/Chart
    _sampleSet:     ~/bizLogic/movingWindow/SampleSet
    _sampleAdapter: ~/bizLogic/movingWindow/DataSampleToSeriesAdapter
    _timeScale:     ~/bizLogic/movingWindow/TimeScale

summary of operation:
on selecting a chart,
- create a new  SampleSet, Chart, TimeScale
- request the template
- on receiving the template, create the DataSampleToSeriesAdapter using the template
- start requesting data
- on receiving data, _sampleAdapter converts the sample XmlItems to objects to add to _sampleSet
- fill chart: get data series from _sampleSet, get time markers from _timeScale, update _chart
*/

// Pub/sub list:
// [sub] ppcJs.PubSub.resourceName
// [sub] ppcJs.PubSub.exportLink
// [sub] ppcJs.PubSub.windowResize

//dojo.require('dojox.charting.themes.PlotKit.blue'); -- see MainBlockPanel for Dojox xAxis bug fix
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/query',
        'dojo/dom', 'dojo/dom-class', 'dojo/dom-construct', 'dojo/dom-style', 'dojo/dom-geometry',
        'dojo/aspect', 'dojo/on', 'dojo/_base/window', 'dojo/io-query', 'dojo/aspect', 'dojo/topic',
        'dojox/string/Builder', 'dojox/data/XmlStore', 
        'dijit/registry', 'dijit/layout/StackContainer', 'dijit/layout/ContentPane', 'dojox/layout/TableContainer',
        'dijit/MenuBar', 'dijit/Menu', 'dijit/MenuItem',  'dijit/form/Button', 'dijit/form/CheckBox', 'dijit/form/NumberSpinner', 'dijit/form/VerticalSlider', 'dojox/form/RangeSlider',
        'dojox/charting/Chart', 'dojox/charting/themes/Claro',  'dojox/charting/axis2d/Default', 'dojox/charting/plot2d/Lines', 'dojox/charting/plot2d/Grid',
        'dojox/charting/action2d/MouseZoomAndPan', 'dojox/charting/widget/SelectableLegend', 'dojox/charting/action2d/Tooltip', 'dojox/charting/SimpleTheme',
        '../Enum', '../PubSub',
        '../utilities/BasePanel', '../utilities/CSV', '../utilities/DateString', '../utilities/Identity', '../utilities/Page', '../utilities/Store',
        '../bizLogic/movingWindow/enums', '../bizLogic/movingWindow/AmplitudeBasedPlotAssigner',
        '../bizLogic/movingWindow/DataSampleToSeriesAdapter', '../bizLogic/movingWindow/SampleSet', '../bizLogic/movingWindow/SampleTemplate', '../bizLogic/movingWindow/TimeScale',
        '../widget/BinaryRadioButton', '../widget/CollapseToggle', '../widget/FadeoutAlertBox', '../widget/iPhoneButton', '../widget/UndoRedo', '../widget/UpdatingSelectableLegend',
        './_MovingWindowClient', '../mixin/_CookieClient', '../mixin/_QueueClient', './movingWindowChart/mwcDto', 'dojo/text!./movingWindowChart/template/movingWindowChart.html'],
function (declare, lang, array, query,
        dom, domClass, construct, domStyle, domGeom,
        aspect, on, window, ioQuery, aspect, topic,
        Builder, XmlStore, 
        registry, StackContainer, ContentPane, TableContainer,
        MenuBar, Menu, MenuItem, Button, CheckBox, NumberSpinner, VerticalSlider, RangeSlider,
        Chart, theme, Default, Lines, Grid,
        MouseZoomAndPan, SelectableLegend, Tooltip, SimpleTheme,
        Enum, PubSub,
        BasePanel, CSV, DateString, Identity, Page, Store,
        enums, AmplitudeBasedPlotAssigner,
        DataSampleToSeriesAdapter, SampleSet, SampleTemplate, TimeScale,
        BinaryRadioButton, CollapseToggle, FadeoutAlertBox, iPhoneButton, UndoRedo, UpdatingSelectableLegend,
        _MovingWindowClient, _CookieClient, _QueueClient, mwcDto, template) {

    // private static variables
    // constants
    var _maxLabelCharCount = 11;     // max number characters per time axis label when using compressed intervals
    var _maxMarkersWindow = 250;     // max number data points to show markers with
    var _panResolution = 10;       // vertical ticks
    var _primaryPlotName = 'default';
    var _secondPlotName = 'secondary';
    var _firstYAxisName = 'y';
    var _secondYAxisName = 'y2';
    var _lightGrey = '#D3D3D3';
    var _cookieName = 'mwcConfigState';

    // ajax request command constants, vars
    var _getTemplateCmd = { GET: 'CHART_TEMPLATE' };
    var _getDataSetCmd = { GET: 'DATA_SET_RANGE' };
    var _exportDataSetCmd = { GET: 'DATA_SET_EXPORT' };
    var _storeConfig = { urlPreventCache: true };

    // ajax response tags
    var _rootTemplateTag = 'dataTemplate';
    var _rootDataSetTag = 'dataSet';
    var _timeStampTag = 'timeStamp';

    // css class names/in-line code
    var _cssPopUpHide = 'basePanelPopUpHide';
    var _cssPopUpShow = 'basePanelPopUpShow';

    return declare([_MovingWindowClient, _CookieClient, _QueueClient],
    {
        // public dijit variables
        name: 'MovingWindowChart',
        templateString: template,
        baseClass: 'movingWindowChart',

        // private instance variables
        _chartInterval: 5000,
        _refreshIntervalIds: '',
        _chart: null,
        _chartLegend: null,
        _chartTooltip: null,
        _miniMarkerTheme: null,
        _invisibleMarkerTheme: null,
        _sampleSet: null,
        _sampleAdapter: null,
        _plotAssigner: null,
        _seriesMap: null,           // {name: string, plot: enums}[], maps name and plot assignment by series index
        _timeScale: null,
        _currentMarkers: null,      // currently used ~/bizLogic/movingWindow/Markers
        _selectionQueryObj: '',     // query object containing parent specific selection items
        _selectedChartId: '',       // 'MINOR' query variable, unique chart ID
        _configHandlers: null,
        _resourceName: '',
        _timeZoneSelect: '',
        _isLocalTime: true,
        _url: '',
        _isBusyFetchingChart: false,    // flag to inhibit multiple selectChart requests while processing a new chart

        _previousChartHeight: 0,
        _previousChartWidth: 0,
        _yScale: 1,
        _yOffset: 0,

        _manualYConfigTable: null,


        // lifecycle methods
        constructor: function () {
            this._plotAssigner = new AmplitudeBasedPlotAssigner();
            this._configHandlers = [];

            topic.subscribe(PubSub.resourceName, lang.hitch(this, this._onResourceName));
            topic.subscribe(PubSub.exportLink, lang.hitch(this, this._onExportLinkTopic));

            this._createInvisibleMarkerTheme();
            this._createSquareMarkerTheme();
        },

        postCreate: function () {
            this.inherited(arguments);

            // initialize empty cookie if none
            var configSettings = this._cookie(_cookieName);
            if (!configSettings) {
                configSettings = {};
                this._cookie(_cookieName, configSettings);
                console.log(configSettings);
            }
        },

        resizeChart: function () {
            if (this._chart) {
                this._refreshWidthAndResizeChart();
            }
        },


        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);  // calls _MovingWindow, _MovingWindowClient implementations

            // override _Panel._handlerList lifecycle management
            this._handlerList = new Array();
            Page.addHoverBehavior(this._handlerList, this.chartDiv);
            Page.addHoverBehavior(this._handlerList, this.legendDiv);

            Page.hideLoadOverlay(this.loadingOverlay, true);
        },

        unload: function () {
            this.inherited(arguments);
            this._clearChart();
        },

        setWindowType: function (/*ppcJs.Enum.WindowData*/windowType) {
            this._setWindowType(windowType);  // calls _MovingWindow implementation
            this._clearChart();
        },

        selectChart: function (queryObject, /*int*/windowLengthSec, /*string*/chartId, /*string*/chartTitle, /*Date(), optional, for fixed window*/startTime) {
            if (!this._isBusyFetchingChart) {
                this._setWindowLength(windowLengthSec);
                this._setStartTime(startTime);
                this.titleBox.innerHTML = chartTitle;
                this._selectionQueryObj = lang.clone(queryObject);
                this._selectedChartId = chartId;

                this._clearChart();
                this._requestTemplate(queryObject);
                Page.displayLoadOverlay(this.loadingOverlay);
                this._isBusyFetchingChart = true;
            }
        },

        startRecurringRequests: function () {
            if (!this._refreshIntervalIds) {
                this._refreshIntervalIds = new Array();
                this._refreshIntervalIds.push(setInterval(lang.hitch(this, this._requestReloadChart), this._chartInterval));
            }
        },

        stopRecurringRequests: function () {
            if (Identity.isObject(this._refreshIntervalIds)) {
                for (var i = 0; i < this._refreshIntervalIds.length; i++) {
                    clearInterval(this._refreshIntervalIds[i]);
                }

                delete this._refreshIntervalIds;
            }
        },


        // private methods
        _requestTemplate: function (queryObject) {
            var testUrl = '../../ppcJs/tests/movingWindowChartTemplateResponse.xml';
            lang.mixin(queryObject, this._resourceIdObj);
            lang.mixin(queryObject, _getTemplateCmd);
            var fullUrl = this.puS.getFullUrl(this._urlInfo, queryObject, testUrl);
            delete this._xmlStore;
            this._xmlStore = new XmlStore({ url: fullUrl, rootItem: _rootTemplateTag, urlPreventCache: true });
            var templateRequest = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onFetchTemplate) });
        },

        // clear chart but retain template
        _reselectChart: function () {
            this._clearChart();

            // send data request
            this._initiateDataRequests();
            this._isBusyFetchingChart = true;
        },
        
        // overrides _Panel implementation (removed _Panel._handlerList management)
        _initStore: function (testUrl, queryObj, rootTag, handler, /*optional store config*/optionsObj) {
            if (this._xmlStore) {
                delete this._xmlStore;
            }

            var fullUrl = this.puS.getFullUrl(this._urlInfo, queryObj, testUrl);
            var configObj = { url: fullUrl, rootItem: rootTag };
            lang.mixin(configObj, optionsObj);
            this._xmlStore = new XmlStore(configObj);
            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, handler) });

            this.undoRedo.clear();
            if (!this._isMovingWindow()) {
                this._registerForUndo(fullUrl);
            }
        },

        _initiateDataRequests: function () {
            var testUrl = '../../ppcJs/tests/movingWindowChartDataSamplesResponse.xml';

            this._setCustomDataQueryObj();
            this._initStore(testUrl, this._queryObject, _rootDataSetTag, this.onFetchData, _storeConfig);

            if (this._isMovingWindow()) {
                this.startRecurringRequests();
            }
        },

        // start time and window length must be set before reloading
        _requestReloadChart: function (/*bool, optional*/registerUndo) {
            if (this._chart) {
                var testUrl = '../../ppcJs/tests/movingWindowChartEmptyDataSamplesResponse.xml';

                this._xmlStore.close();

                this._setCustomDataQueryObj();
                var fullUrl = this.puS.getFullUrl(this._urlInfo, this._queryObject, testUrl);
                this._xmlStore.url = fullUrl;

                var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onRefetchData) });

                if (registerUndo) {
                    this._registerForUndo(fullUrl);
                }
            }
            else {
                this.stopRecurringRequests();
            }
        },

        _setCustomDataQueryObj: function () {
            var windowMs = this._sampleSet.getWindowLength();
            var customQueryObj = {};
            lang.mixin(customQueryObj, _getDataSetCmd);
            lang.mixin(customQueryObj, this._selectionQueryObj);
            this._setDataQueryObj(windowMs, this._sampleSet.getLastRowId(), customQueryObj);
        },

        _registerForUndo: function (fullUrl) {
            var startTime = this._startTime;
            var windowMs = this._sampleSet.getWindowLength();
            var dto = new mwcDto.ChartState(fullUrl, startTime, windowMs);
            this.undoRedo.registerItem(dto);
        },

        _processSamples: function (/*XmlItem[]*/items) {
            var samples = this._sampleAdapter.convertToSamples(items[0]);
            if (samples.length > 0) {
                this._sampleSet.enqueue(samples);
            }
/* Uncomment to enable faking of live data points
            else if (!this._sampleSet.isEmpty()) {  // excludes case of first request returning no samples
                var timestampMs = parseInt(this.puS.getElementText(_timeStampTag, items[0]['element']) * 1000);
                this._sampleSet.repeatLastSample(timestampMs);
            }
*/
        },

        // note: recreate x axis on per time window basis instead of statically here
        _createChart: function (secondaryPlotRequired) {
            this._chart = new Chart(this.chartDiv);
            this._chart.addPlot('default', { type: 'Lines' });
            this._chart.addPlot('grid', {
                type: 'Grid',
                hMajorLines: true,
                hMinorLines: false,
                vMajorLines: true,
                vMinorLines: false,
                majorHLine: {
                    color: _lightGrey,
                    width: 1,
                    length: 2
                },
                majorVLine: {
                    color: _lightGrey,
                    width: 1,
                    length: 2
                }
            });
            this._chart.addAxis(_firstYAxisName, { vertical: true, includeZero: false, fontColor: '#008209', stroke: _lightGrey });

            if (secondaryPlotRequired) {
                this._chart.addAxis(_secondYAxisName, { vertical: true, leftBottom: false, includeZero: false, stroke: '#A60000', fontColor: '#A60000' });
                this._chart.addPlot(_secondPlotName, { type: 'Lines', vAxis: _secondYAxisName });
            }

            this._chart.action = new MouseZoomAndPan(this._chart, 'default', { axis: 'x', enableDoubleClickZoom: false });
            this._chartTooltip = new Tooltip(this._chart, "default");
            var disposableDiv = construct.create('div', null, this.legendDiv, 'first');    // Legend replaces disposableDiv
            this._chartLegend = new UpdatingSelectableLegend({ chart: this._chart, outline: false, horizontal: 6 }, disposableDiv);

            Page.showDijit(this._timeZoneSelect);
        },

        // applies small cross svg path segments for each type of marker to chart
        _createCrossMarkerTheme: function () {
            this._miniMarkerTheme = new SimpleTheme({
                markers: {
                    CIRCLE: 'm0,-3 l0,6 m-3,-3 l6,0',
                    SQUARE: 'm0,-3 l0,6 m-3,-3 l6,0',
                    DIAMOND: 'm0,-3 l0,6 m-3,-3 l6,0',
                    CROSS: 'm0,-3 l0,6 m-3,-3 l6,0',
                    X: 'm0,-3 l0,6 m-3,-3 l6,0',
                    TRIANGLE: 'm0,-3 l0,6 m-3,-3 l6,0',
                    TRIANGLE_INVERTED: 'm0,-3 l0,6 m-3,-3 l6,0'
                }
            });
        },

        _createSquareMarkerTheme: function () {
            this._miniMarkerTheme = new SimpleTheme({
                markers: {
                    CIRCLE: 'm-2,-2 4,0 0,4 -4,0z',
                    SQUARE: 'm-2,-2 4,0 0,4 -4,0z',
                    DIAMOND: 'm-2,-2 4,0 0,4 -4,0z',
                    CROSS: 'm-2,-2 4,0 0,4 -4,0z',
                    X: 'm-2,-2 4,0 0,4 -4,0z',
                    TRIANGLE: 'm-2,-2 4,0 0,4 -4,0z',
                    TRIANGLE_INVERTED: 'm-2,-2 4,0 0,4 -4,0z'
                }
            });
        },

        _createInvisibleMarkerTheme: function () {
            this._invisibleMarkerTheme = new SimpleTheme({
                
                markers: {
                    CIRCLE: 'm0,-2 l0,4 m-2,-2 l4,0',
                    SQUARE: 'm0,-2 l0,4 m-2,-2 l4,0',
                    DIAMOND: 'm0,-2 l0,4 m-2,-2 l4,0',
                    CROSS: 'm0,-2 l0,4 m-2,-2 l4,0',
                    X: 'm0,-2 l0,4 m-2,-2 l4,0',
                    TRIANGLE: 'm0,-2 l0,4 m-2,-2 l4,0',
                    TRIANGLE_INVERTED: 'm0,-2 l0,4 m-2,-2 l4,0'
                }
            });
        },

        _clearChart: function () {
            if (this._chart) {
                this.stopRecurringRequests();
                try {
                    this._chart.destroy();  // note: firebug throws dojox.gfx exception here
                }
                catch (err) {
                    console.log(err.toString());
                }
                this._chartTooltip.destroy();
                this._chartLegend.destroy();
                delete this._chart;
                delete this._chartTooltip;
                delete this._chartLegend;
            }

            this.chartDiv.innerHTML = '';
            Page.hideDijit(this._timeZoneSelect);
            this._resetZoomPan();
        },

        _fillChart: function () {
            var seriesSet = this._sampleSet.getSeriesSet();

            if (seriesSet.length > 0) {
                this._setCurrentMarkers();

                if (this._isSecondaryPlotEnabled()) {
                    if (this._isSecondaryPlotAuto()) {
                        this._plotAssigner.execute(this._seriesMap, seriesSet);
                    }
                    else {
                        // update series map from cookie
                        var persistence = this._getPersistenceObj();
                        var configSeriesMap = persistence.axisSettings[this._selectedChartId];
                        for (var i = 0; i < this._seriesMap.length; i++) {
                            this._seriesMap[i].plot = configSeriesMap[i];
                        }
                    }

                    var usingTwoPlots = array.some(this._seriesMap, function (item) {
                        return (item.plot == enums.Plot.Secondary);
                    });
                }
                else {
                    var usingTwoPlots = false;
                }

                this._createChart(usingTwoPlots);

                // reverse indexers so can splice off array elements while iterating
                for (var i = this._seriesMap.length - 1; i >= 0; i--) {
                    this._normalizeXValues(seriesSet[i]);
                    var assignSecondaryPlot = (usingTwoPlots && (this._seriesMap[i].plot == enums.Plot.Secondary));
                    var seriesColor = this._getSeriesColor(i, usingTwoPlots, assignSecondaryPlot);
                    var plotName = assignSecondaryPlot ? _secondPlotName : _primaryPlotName;
                    this._chart.addSeries(this._seriesMap[i].name, seriesSet[i], { plot: plotName, stroke: { color: seriesColor, width: 2 } });
                }

                this._renderChart(seriesSet[0].length);
            }
            else {
                this.chartDiv.innerHTML = 'There was no data within this time period.';
            }
        },

        _refillChart: function () {
            var seriesSet = this._sampleSet.getSeriesSet();

            if (seriesSet.length > 0) {
                this._setCurrentMarkers();

                // reverse indexers so can splice off array elements while iterating
                for (var i = this._seriesMap.length - 1; i >= 0; i--) {
                    this._normalizeXValues(seriesSet[i]);
                    this._chart.updateSeries(this._seriesMap[i].name, seriesSet[i]);
                }

                this._renderChart(seriesSet[0].length);
            }
            else {
                this.chartDiv.innerHTML = 'There was no data within this time period.';
            }
        },

        _createSeriesMap: function (seriesNames) {
            var seriesMap = [];
            var defaultPlot = enums.Plot.Primary;
            array.forEach(seriesNames, function (seriesName) {
                seriesMap.push({ name: seriesName, plot: defaultPlot });
            });

            return seriesMap;
        },

        // updates x axis label/scaling object to current time window
        _setCurrentMarkers: function () {
            var lastTimeStamp = this._sampleSet.getLastTimeStamp();
            this._currentMarkers = this._timeScale.getMarkers(lastTimeStamp);
        },

        // returns x axis options object configured for current time window
        _createXAxisConfiguration: function () {
            var markerLabels = new Array();
            for (var labelIndex = 0; labelIndex < this._currentMarkers.Labels.length; labelIndex++) {
                markerLabels.push({ value: labelIndex, text: this._currentMarkers.Labels[labelIndex] });
            }

            var xAxisOptions = {
                includeZero: true,
                majorTickStep: 1,
                minorTicks: true,
                minorTickStep: this._currentMarkers.MarkerSubInterval,
                minorLabels: false,
                microTicks: false,
                labels: markerLabels,
                stroke: _lightGrey
            };

            if (this._currentMarkers.Labels.length > 8) {
                lang.mixin(xAxisOptions, { maxLabelCharCount: _maxLabelCharCount });
            }

            return xAxisOptions;
        },

        // normalizes seriesSet to _currentMarkers scaling
        _normalizeXValues: function (series) {
            for (var dataIndex = series.length - 1; dataIndex >= 0; dataIndex--) {
                // normalize data
                series[dataIndex].x = (series[dataIndex].x - this._currentMarkers.Offset) / this._currentMarkers.MarkerInterval;

                // handle empty/invalid CSV data rows
                if (isNaN(series[dataIndex].y)) {
                    //series.splice(dataIndex, 1);    option 1 - straight line connection between remaining data points
                    series[dataIndex].y = 0;          // option 2 - flatlines over empty/invalid data points
                }
            }
        },

        _renderChart: function (seriesLength) {
            this._setDataPointMarkerIcon(seriesLength, _primaryPlotName);
            this._setDataPointMarkerIcon(seriesLength, _secondPlotName);
            var xAxisOptions = this._createXAxisConfiguration();
            this._chart.addAxis('x', xAxisOptions);
            this._chart.render();
            this._chartLegend.refresh();
        },

        // configures chart to display tooltip marker icons if less than _maxMarkersWindow (else response time degrades with larger windows)
        _setDataPointMarkerIcon: function (seriesLength, plotName) {
            var plot = this._chart.getPlot(plotName);
            if (plot) {
                if (seriesLength < _maxMarkersWindow) {
                    plot.opt.markers = true;
                    this._chart.setTheme(this._miniMarkerTheme);
                }
                else {
                    plot.opt.markers = false;
                }
            }
        },

        // returns chart series color hex code. wrap around if index > color array
        _getSeriesColor: function (index, /*bool*/usingTwoPlots, /*bool*/isSecondaryPlot) {
            // colors when not usingTwoPlots
            // palette generated from soria theme base chart color cornflowerblue, #6495ED (http://cloford.com/resources/colours/500col.htm) by http://www.colorschemer.com/online.html
            var paletteColors = ['#6494ED', '#94ED64', '#EDBD64', '#ED64D8', '#64D8ED', '#2D6EE6', '#1652C0', '#ED6494',
                                '#64EDBD', '#C08416', '#E6A62D', '#ED7864', '#64ED78', '#7864ED', '#D8ED64', '#BD64ED'];

            // primary plot colors when usingTwoPlots. colorschemedesigner.com - analogic/00C90D
            var greenAnalogicColors = ['#00C90D', '#01939A', '#9BED00', '#26972D', '#1D7074', '#84B22D', '#008209', '#006064', '#659A00',
                                    '#39E444', '#34C6CD', '#B6F63E', '#67E46F', '#5DC8CD', '#C7F66F'];
            // secondary plot colors when usingTwoPlots. colorschemedesigner.com - analogic/FF0000
            var redAnalogicColors = ['#FF0000', '#FF7400', '#CD0074', '#BF3030', '#BF7130', '#992667', '#A60000', '#A64B00', '#85004B',
                                    '#FF4040', '#FF9640', '#E6399B', '#FF7373', '#FFB273', '#E667AF'];

            if (usingTwoPlots) {
                return isSecondaryPlot ? redAnalogicColors[index % redAnalogicColors.length] : greenAnalogicColors[index % greenAnalogicColors.length];
            }
            else {
                return paletteColors[index % paletteColors.length];
            }
        },

        _setWindowLength: function (/*int*/windowLengthSec) {
            delete this._sampleSet;
            this._sampleSet = new SampleSet(windowLengthSec);

            delete this._timeScale;
            if (windowLengthSec <= 600) {                   // 5 minutes
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.OneMinute);
            }
            else if (windowLengthSec <= 3600) {             // 1 hour
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.FiveMinutes);
            }
            else if (windowLengthSec <= 6 * 3600) {        // 6 hours
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.FifteenMinutes);
            }
            else if (windowLengthSec <= 12 * 3600) {        // 12 hours
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.OneHour);
            }
            else if (windowLengthSec <= 24 * 3600) {        // 24 hours
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.TwoHours);
            }
            else if (windowLengthSec <= 2 * 24 * 3600) {    // 48 hours
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.FourHours);
            }
            else if (windowLengthSec <= 5 * 24 * 3600) {    // 5 days
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.TwelveHours);
            }
            else if (windowLengthSec <= 15 * 24 * 3600) {    // 15 days
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.OneDay);
            }
            else if (windowLengthSec <= 30 * 24 * 3600) {   // 30 days
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.TwoDays);
            }
            else {
                this._timeScale = new TimeScale(windowLengthSec, enums.Interval.SevenDays);
            }

            this._timeScale.setLocalTime(this._isLocalTime);
        },

        _sliderValueToLabel: function (value) {
            var xWindow = this._chart.getGeometry().x.scaler.bounds;
            var xScale = this._currentMarkers.MarkerInterval;
            var xWindowRange = (xWindow.upper - xWindow.lower) * xScale;
            var timeMs = this._currentMarkers.Offset + value * xWindowRange;
            var d = new Date(timeMs);
            return d.toLocaleTimeString() + ' ' + DateString.toDate(d);
        },

        // refetch zoomed window at higher resolution
        _zoomX: function () {
            if (this._isMovingWindow()) {
                this.stopRecurringRequests();
                this._setWindowType(Enum.WindowData.Fixed);  // calls _MovingWindow implementation
            }

            var xTolerance = 0.01;
            var xSliderRangeMin = 0;
            var xSliderRangeMax = 1.0;

            var xSliderMin = this.rangeSlider.value[0];
            var xSliderMax = this.rangeSlider.value[1];
            var sliderBounded = !Identity.areEqualFloats(xSliderRangeMin, xSliderMin, xTolerance) || !Identity.areEqualFloats(xSliderRangeMax, xSliderMax, xTolerance);

            var xWindow = this._chart.getGeometry().x.scaler.bounds;
            var xScale = this._currentMarkers.MarkerInterval;
            var xWindowRange = (xWindow.upper - xWindow.lower) * xScale;
            var xWindowBounded = !Identity.areEqualFloats(xWindow.lower, xWindow.from, xTolerance) || !Identity.areEqualFloats(xWindow.upper, xWindow.to, xTolerance);

            // mouse zoom (xWindowBounded) takes precedence
            if (!xWindowBounded && sliderBounded) {
                var startTimeMs = this._currentMarkers.Offset + xSliderMin * xWindowRange;
                var windowLengthMs = (xSliderMax - xSliderMin) * xWindowRange;
            }
            else {
                var startTimeMs = this._currentMarkers.Offset + (xWindow.from * xScale);
                var windowLengthMs = (xWindow.to - xWindow.from) * xScale;
            }

            this._setStartTime(new Date(startTimeMs));
            var windowLengthSec = windowLengthMs / 1000;
            this._setWindowLength(windowLengthSec);
            this._requestReloadChart(true);

            var startTimeStamp = new Date(startTimeMs);
            var endTimeStamp = new Date(startTimeMs + windowLengthMs);
            this.onZoomExtant(startTimeStamp, endTimeStamp);

            // reset slider via dijit method to redraw
            this.rangeSlider.attr('value', [xSliderRangeMin, xSliderRangeMax]);
            BasePanel.setVisible(dom.byId(this.sliderReadouts), false);
        },

        _zoomY: function () {
            if (this._chart) {
                this._chart.setAxisWindow(_firstYAxisName, this._yScale, this._yOffset).render();
                this._chart.setAxisWindow(_secondYAxisName, this._yScale, this._yOffset).render();
            }
        },

        _resetZoomPan: function () {
            this._yScale = 1;
            this._yOffset = 0;
        },

        _reloadChartFromChartState: function (/*movingWindowChart/mwcDto/ChartState*/chartState) {
            this._setStartTime(chartState.startTime);
            var windowLengthSec = chartState.windowLengthMs / 1000;
            this._setWindowLength(windowLengthSec);
            this._requestReloadChart();

            var endTimeStamp = new Date(chartState.startTime.getTime() + chartState.windowLengthMs);
            this.onZoomExtant(chartState.startTime, endTimeStamp);

            BasePanel.setVisible(dom.byId(this.sliderReadouts), false);
        },

        _refreshWidthAndResizeChart: function () {
            // refresh DOM node width before getting size
            var chartDiv = dom.byId(this.chartDiv);
            domStyle.set(chartDiv, { width: '100%' });

            this._resizeChart();
        },

        _resizeChart: function () {
            if (this._chart) {
                // get current container height, width
                var configPane = dom.byId(this.configPane);
                var configToggleButtonClearance = 30;
                var configPaneSpacer = domGeom.getContentBox(configPane).w + configToggleButtonClearance;
                var chartSliderBox = dom.byId(this.chartSliderBox);
                var contentBoxWidth = this.configToggle.get('checked') ? domGeom.getContentBox(chartSliderBox).w - configPaneSpacer : domGeom.getContentBox(chartSliderBox).w;

                var containerNode = dom.byId(this.containerNode);
                var totalContentHeight = domGeom.getMarginBox(containerNode).h;

                var controlsStrip = dom.byId(this.controlsStrip);
                var controlsStripHeight = domGeom.getMarginBox(controlsStrip).h;

                var sliderLegendBox = dom.byId(this.sliderLegendBox);
                var sliderLegendBoxHeight = domGeom.getMarginBox(sliderLegendBox).h;
                var chartHeight = totalContentHeight - (controlsStripHeight + sliderLegendBoxHeight);

                var changeChartSize = (contentBoxWidth != this._previousChartWidth) || (chartHeight != this._previousChartHeight);
                if (changeChartSize) {
                    this._chart.resize(contentBoxWidth, chartHeight);

                    this._previousChartHeight = chartHeight;
                    this._previousChartWidth = contentBoxWidth;
                }

                this._chartLegend.refresh();
            }
        },

        // get mwcDto.Persistence object for current resource
        // creates a default new one if doesn't yet exist
        _getPersistenceObj: function () {
            var configSettings = this._cookie(_cookieName);
            if (configSettings[this._queryId]) {
                this._plotAssigner.secondaryPlotRatio = configSettings[this._queryId].secondPlotRatio;
            }
            else {
                configSettings[this._queryId] = new mwcDto.Persistence(true, this._plotAssigner.secondaryPlotRatio, true);
                this._cookie(_cookieName, configSettings);
            }

            return configSettings[this._queryId];
        },

        _setupSecondaryPlotConfig: function (/*{name: string, plot: enums}[]*/seriesMap) {
            var persistence = this._getPersistenceObj();

            this.secondaryPlotRatioSpinner.set('value', persistence.secondPlotRatio);
            this.secondaryPlotEnableCheckBox.set('checked', persistence.enableSecondYAxis);

            if (!persistence.isAuto) {
                this._setUpSecondaryManualConfig(seriesMap);
            }
            this._showHideSecondaryPlotConfigPane(persistence);
        },

        _setUpSecondaryManualConfig: function (/*{name: string, plot: enums}[]*/seriesMap) {
            var persistence = this._getPersistenceObj();
            if (persistence.axisSettings[this._selectedChartId]) {
                var manualSettings = persistence.axisSettings[this._selectedChartId];
                array.forEach(seriesMap, function (seriesItem, i) {
                    seriesItem.plot = manualSettings[i];
                });
            }
            else {
                var configSettings = this._cookie(_cookieName);
                var manualSettings = [];
                array.forEach(seriesMap, function (seriesItem) {
                    manualSettings.push(seriesItem.plot);
                });
                configSettings[this._queryId].axisSettings[this._selectedChartId] = manualSettings;
                this._cookie(_cookieName, configSettings);
            }
            this._populateManualYConfigPane(seriesMap);
        },

        _isSecondaryPlotEnabled: function () {
            return this.secondaryPlotEnableCheckBox.get('checked');
        },

        _isSecondaryPlotAuto: function () {
            return this.secondPlotToggle.value;
        },

        _showHideSecondaryPlotConfigPane: function (/*mwcDto/Persistence*/persistence) {
            if (persistence.enableSecondYAxis) {
               // Page.showDomNode(this.secondPlotConfigPane);
                Page.enableDijit(this.secondPlotToggle);
                Page.enableDijit(this.autoManualConfigStack);
                Page.enableDijit(this.secondaryPlotRatioSpinner);

                this.secondPlotToggle.setValue(persistence.isAuto);
                var activePlotConfigPane = persistence.isAuto ? this.autoYConfigPane : this.manualYConfigPane;
                this.autoManualConfigStack.selectChild(activePlotConfigPane);
            }
            else {
                //Page.hideDomNode(this.secondPlotConfigPane);
                Page.disableDijit(this.secondPlotToggle);
                Page.disableDijit(this.autoManualConfigStack);
                Page.disableDijit(this.secondaryPlotRatioSpinner);
            }
        },

        _populateManualYConfigPane: function (/*{name: string, plot: enums}[]*/seriesMap)
        {
            if (this._manualYConfigTable) {
                this._manualYConfigTable.destroyRecursive();
                delete this._manualYConfigTable;

                // flush chart config event handlers
                array.forEach(this._configHandlers, function (handler) {
                    handler.remove();
                });
                this._configHandlers.length = 0;
            }

            var manualYConfigTableDiv = construct.create('div');
            construct.place(manualYConfigTableDiv, this.manualYConfigPane.containerNode);

            this._manualYConfigTable = new TableContainer(
            {
                cols: 1,
                labelWidth: 170,
                showLabels: true
            }, manualYConfigTableDiv);

            array.forEach(seriesMap, function (mapItem, i) {
                var startOn = (mapItem.plot == enums.Plot.Secondary);
                var slider = new iPhoneButton({
                    onText: '2ND',
                    offText: '1ST',
                    width: 80,
                    animateSpeed: 200,
                    startOn: startOn,
                    mapIndex: i,
                    label: mapItem.name,
                    title: 'assign ' + mapItem.name + ' to a y axis'
                });

                this._configHandlers.push(aspect.after(slider, 'onChange', lang.hitch(this, this._onManualItemAxisChange), true));
                this._manualYConfigTable.addChild(slider);
            }, this);

            this._manualYConfigTable.startup();
        },


        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            var sampleTemplate = new SampleTemplate(items[0]);
            delete this._sampleAdapter;
            this._sampleAdapter = new DataSampleToSeriesAdapter(sampleTemplate);

            delete this._seriesMap;
            this._seriesMap = this._createSeriesMap(this._sampleAdapter.getSeriesNames());
            // load y axis config from cookie
            this._setupSecondaryPlotConfig(this._seriesMap);

            this._initiateDataRequests();
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);

            Page.hideLoadOverlay(this.loadingOverlay);
            this._processSamples(items);
            this._fillChart();
            BasePanel.setVisible(dom.byId(this.sliderReadouts), false);
            this._isBusyFetchingChart = false;

            this._queueCall(this._resizeChart, null, true);
        },

        onRefetchData: function (/*XmlItem[]*/items, request) {
            if (this._chart) {
                this._processSamples(items);
                this._refillChart();
            }
            BasePanel.setVisible(dom.byId(this.sliderReadouts), false);
        },

        _onResourceName: function (name) {
            this._resourceName = name;
        },

        _onZoneChange: function (isLocal) {
            this._isLocalTime = isLocal;
            this._timeScale.setLocalTime(isLocal);
            this._requestReloadChart();
        },

        _onRangeSliderChange: function (newValue) {
            BasePanel.setVisible(dom.byId(this.sliderReadouts), true);
            this.sliderMinTime.innerHTML = this._sliderValueToLabel(newValue[0]);
            this.sliderMaxTime.innerHTML = this._sliderValueToLabel(newValue[1]);
            if (this._isMovingWindow()) {
                this.onWindowRangeChange();
            }
        },

        _onChartClick: function () {
            this._refreshWidthAndResizeChart();
        },

        _onChartDoubleClick: function () {
            this._zoomX();
        },

        _onLegendDoubleClick: function () {
            this._chartLegend.toggleAll();
        },

        _onRefreshClick: function () {
            this._zoomX();
        },

        _onLinkToggleChange: function (evt) {
            if (this.linkToggle.checked) {
                this.onExportLink(lang.hitch(this, this._queryObjReceiver), false);
                domClass.replace(this.linkPane, _cssPopUpShow, _cssPopUpHide);
            }
            else {
                domClass.replace(this.linkPane, _cssPopUpHide, _cssPopUpShow);
            }
        },

        _onCopyWindowClick: function () {
            this.onExportLink(lang.hitch(this, this._queryObjReceiver), true);
        },

        _queryObjReceiver: function (queryObj) {
            var urlStr = window.doc.URL;
            var urlStr = urlStr.split('?')[0];
            this._url = urlStr + '?' + ioQuery.objectToQuery(queryObj);
            this.linkUrl.innerHTML = this._url;
        },

        _onSaveMenuItemClick: function (evt) {
            var testUrl = '../../ppcJs/tests/dataSetExportResponse.csv';

            var menuItem = registry.getEnclosingWidget(evt.target);
            var resolutionSec = menuItem.get('resolution');
            var maxPoints = (resolutionSec >= 10) ? 50000 : 10000;    // currently server limited to 10,000 points @ <10 sec
            var customQueryObj = { RESOLUTION: resolutionSec, MAXNUMPTS: maxPoints, LASTID: 0 };
            lang.mixin(customQueryObj, this._resourceIdObj);
            lang.mixin(customQueryObj, _exportDataSetCmd);
            lang.mixin(customQueryObj, this._selectionQueryObj);

            var windowMs = this._sampleSet.getWindowLength();
            lang.mixin(customQueryObj, this._getRtWindowQueryObject(windowMs));

            if ((windowMs / 1000) > (resolutionSec * maxPoints)) {
                this.fadeoutAlertBox.show('The export file has been truncated. Use a larger sample time period to export the complete window.');
            }

            var fullUrl = Store.getFullUrl(this._urlInfo, customQueryObj, testUrl);
            open(fullUrl);
        },

        _onExportLinkTopic: function (/*callback(string url)*/topicCallback) {
            this.onExportLink(lang.hitch(this, this._queryObjReceiver), false);
            topicCallback(this._url);
        },

        _onUndoRedo: function (currentItem) {
            this._reloadChartFromChartState(currentItem);
        },

        _onVerticalSliderChange: function (zoomValue) {
            this._yScale = zoomValue;
            this._zoomY();
        },

        _onPanUpClick: function () {
            this._yOffset += _panResolution;
            this._zoomY();
        },

        _onPanDownClick: function () {
            this._yOffset -= _panResolution;
            this._zoomY();
        },

        _onConfigToggleChange: function (evt) {
            if (this.configToggle.checked) {
                domClass.replace(this.configPane, _cssPopUpShow, _cssPopUpHide);
            }
            else {
                domClass.replace(this.configPane, _cssPopUpHide, _cssPopUpShow);
            }

            this._resizeChart();
        },

        _onPlotEnableClick: function (evt) {
            var configSettings = this._cookie(_cookieName);
            configSettings[this._queryId].enableSecondYAxis = this.secondaryPlotEnableCheckBox.get('checked');
            this._cookie(_cookieName, configSettings);
            this._showHideSecondaryPlotConfigPane(configSettings[this._queryId]);

            if (this._chart && !this._isBusyFetchingChart) {
                this._reselectChart();
            }
        },

        _onSecondPlotAutoManualChange: function (buttonRef) {
            var configSettings = this._cookie(_cookieName);
            configSettings[this._queryId].isAuto = buttonRef.value;
            this._cookie(_cookieName, configSettings);
            this._showHideSecondaryPlotConfigPane(configSettings[this._queryId]);

            if (!configSettings[this._queryId].isAuto && !this._manualYConfigTable) {
                this._setUpSecondaryManualConfig(this._seriesMap);
            }

            if (this._chart && !this._isBusyFetchingChart) {
                this._reselectChart();
            }
        },

        _onPlotRatioSpinnerChange: function (newValue) {
            this._plotAssigner.secondaryPlotRatio = newValue;
            var configSettings = this._cookie(_cookieName);
            configSettings[this._queryId].secondPlotRatio = newValue;
            this._cookie(_cookieName, configSettings);

            if (this._chart && !this._isBusyFetchingChart) {
                this._reselectChart();
            }
        },

        _onManualItemAxisChange: function (itemConfigSlider) {
            var plot = itemConfigSlider.value ? enums.Plot.Secondary : enums.Plot.Primary;
            var configSettings = this._cookie(_cookieName);
            configSettings[this._queryId].axisSettings[this._selectedChartId][itemConfigSlider.mapIndex] = plot;
            this._cookie(_cookieName, configSettings);

            if (this._chart && !this._isBusyFetchingChart) {
                this._reselectChart();
            }
        },


        // public events
        onZoomExtant: function (/*Date*/startTimeStamp, /*Date*/endTimeStamp) {
        },

        onWindowRangeChange: function () {
        },

        onExportLink: function (/*callback(queryObj)*/queryObjReceiver, /*bool*/disableCookies) {
        }
    });
});