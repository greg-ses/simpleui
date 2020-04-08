// ~/panel/MultimodeChart
// multimode chart panel - supports real-time and historical windowed data views
// note: switches to local test file if running on localhost
// requires that dojo & ppcJs resources have already been linked and djConfig has been configured

// Pub/sub list:
// [pub] ppcJs.PubSub.windowData
// [sub] ppcJs.PubSub.resourceName

// cookie:
//  mmcpState - ./multimodeChart/mmcDto.State

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/query', 'dojo/_base/array', 'dojo/topic', 'dojo/on',
        'dojo/dom-class', 'dojo/_base/window', 'dojo/io-query',
        'dijit/registry', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
        'dijit/Menu', 'dijit/MenuBar', 'dijit/PopupMenuItem', 'dijit/PopupMenuBarItem',
        '../Enum', '../PubSub', '../utilities/BasePanel', '../utilities/Identity',
        '../widget/FadeoutAlertBox', '../widget/SelectMenuItem', '../control/WindowSelect', '../control/windowSelect/wsDto', './MovingWindowChart',
        './_MovingWindow', '../mixin/_CookieClient', './multimodeChart/mmcDto', 'dojo/text!./multimodeChart/template/multimodeChart.html'],
function (declare, lang, query, array, topic, on,
        domClass, window, ioQuery,
        registry, BorderContainer, ContentPane,
        Menu, MenuBar, PopupMenuItem, PopupMenuBarItem,
        Enum, PubSub, BasePanel, Identity,
        FadeoutAlertBox, SelectMenuItem, WindowSelect, wsDto, MovingWindowChart,
        _MovingWindow, _CookieClient, mmcDto, template) {
    return declare([_MovingWindow, _CookieClient],
    {
        // ajax request command constants
        _getDataSetNamesCmd: { GET: 'DATA_SETS' },

        // ajax response tags
        _rootDataTag: 'dataSets',

        // item css class names, in-line styles
        _cssMenuHeader: 'multimodeMenuHeader',

        // cookies
        _cookieState: 'mmcState',

        // private class variables
        _chartTitle: '',
        _queryObject: null,   // query object containing chart selection
        _initialState: null,
        _defaultState: null,    // used if no or invalid initialState
        _validInitialState: false,
        _resourceName: '',

        // dijit variables
        name: 'MultimodeChartPanel',
        templateString: template,
        baseClass: 'multimodeChartPanel',

        constructor: function () {
            this._handlerList = new Array();
            topic.subscribe(PubSub.resourceName, lang.hitch(this, this._onResourceName));
        },

        postCreate: function () {
            this.inherited(arguments);
            on(this.domNode, 'resize', lang.hitch(this, this.resize));

            this.startup();

            var splitter = this.borderContainer.getSplitter('left');
            var splitterNode = splitter.domNode;
            on(splitterNode, 'mouseup', lang.hitch(this, function () {
                this.movingWindowChart.resizeChart();
            }));

        },

        resize: function () {
            this.inherited(arguments);
            this.borderContainer.resize();
        },

        resizeChart: function () {
            this.movingWindowChart.resizeChart();
        },

        // queryObj contains variable 'mmcpState' with value of cookie contents as string
        load: function (urlVal, resourceId, serverProcess, queryObj) {
            this.inherited(arguments);

            this._updateCookieFromQuery(this._cookieState, queryObj, this._resourceName);
            this._initialState = this._getItemFromCookieList(this._cookieState, this._resourceName);    // wsDto.State
            this._validInitialState = false;
            this.windowSelector.configure(queryObj);
            this.movingWindowChart.load(urlVal, resourceId, serverProcess);
            if (this._isEnabled()) {
                BasePanel.setVisible(this.noCookie, false);
            }
            else {
                BasePanel.setVisible(this.noCookie, true);
            }
            this.borderContainer.resize();

            this._loadMenuItems(resourceId);
            this.startup();
        },

        unload: function () {
            this.inherited(arguments);
            this.movingWindowChart.unload();
            this.menuBar.destroyDescendants();
        },

        startup: function () {
            this.inherited(arguments);
            this.windowSelector.startup();
        },

        // private methods
        _loadMenuItems: function (resourceId) {
            var testUrl = '../../ppcJs/tests/movingWindowDataSetsResponse.xml';
            var queryObj = { ID: resourceId };
            lang.mixin(queryObj, this._getDataSetNamesCmd);
            this._initStore(testUrl, queryObj, this._rootDataTag, this.onFetchMenu);
        },

        // ref: svn://10.0.4.30/ppc_repo/trunk/web/Server/ppcJs/tests/movingWindowDataSetsResponse.xml
        _addPopupMenuBarItem: function (/*XmlElement*/dataSetElem) {
            var majorItems = query('majorItems > item', dataSetElem);
            var minorItems = query('minorItems > *', dataSetElem);

            this.menuBar.addChild(this._createPopupMenuBarItem(majorItems[0], minorItems));
        },

        // returns a populated PopupMenuBarItem
        _createPopupMenuBarItem: function (/*XmlElement*/majorItemElem, /*XmlElement[]*/minorItems) {
            var majorSelector = this.puS.getElementText('value', majorItemElem);
            var majorSelectName = this._resourceName;//this.puS.getElementText('desc', majorItemElem);
            var menu = new Menu();
            var majorMenuItem = new PopupMenuBarItem({ label: majorSelectName + ' Charts', popup: menu });
            domClass.add(majorMenuItem.domNode, 'baseMenuBarItem multimodeMenuHeader');

            for (var minorIdx = 0; minorIdx < minorItems.length; minorIdx++) {
                if (minorItems[minorIdx].nodeName == 'category') {
                    var subMenu = new Menu();
                    var subItems = query('item', minorItems[minorIdx]);
                    for (var i = 0; i < subItems.length; i++) {
                        this._addMenuItem(subItems[i], majorSelector, majorSelectName, subMenu);
                    }

                    var categoryLabel = this.puS.getElementText('desc', minorItems[minorIdx]);
                    var category = new PopupMenuItem({ label: categoryLabel, popup: subMenu });
                    menu.addChild(category);
                }
                else {
                    this._addMenuItem(minorItems[minorIdx], majorSelector, majorSelectName, menu);
                }
            }

            return majorMenuItem;
        },

        _addMenuItem: function (/*XmlElement*/menuItemElem, /*string*/majorSelector, /*string*/majorSelectName, /*PopupMenuBarItem*/parent) {
            var minorSelectName = this.puS.getElementText('desc', menuItemElem);
            var minorSelector = this.puS.getElementText('value', menuItemElem);
            var menuItem = new SelectMenuItem({ label: minorSelectName, majorSelect: majorSelector, majorSelectName: majorSelectName, minorSelect: minorSelector });
            this._handlerList.push(on(menuItem, 'click', lang.hitch(this, this.onSelectChart)));

            parent.addChild(menuItem);

            // create default if saved state is missing or invalid
            if (this._initialState && (this._initialState.majorSelector == majorSelector)) {
                this._validInitialState = true;
            }
            else {
                this._defaultState = new mmcDto.State(majorSelector, majorSelectName, minorSelector, minorSelectName);
            }
        },

        _selectChart: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime,
                /*string, optional*/majorSelector,
                /*string, optional*/majorSelectName,
                /*string, optional*/minorSelector,
                /*string, optional*/minorSelectName) {
            if (this._validateTimeInputs(startTime)) {
                if (majorSelector) {
                    this._queryObject = { MAJOR: majorSelector, MINOR: minorSelector };
                    this._chartTitle = minorSelectName;
                }

                this.movingWindowChart.selectChart(lang.clone(this._queryObject), windowLength, this._queryObject.MINOR, this._chartTitle, startTime);
                this.windowSelector.setAsSubmitted();
            }
        },

        _reselectChart: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime)
        {
            var isChartSelected = Identity.isObject(this._queryObject);
            if (isChartSelected) {
                this._selectChart(windowLength, startTime);
            }
        },

        _saveStateToCookie: function (/*string*/majorSelector, /*string*/majorSelectName, /*string*/minorSelector, /*string*/minorSelectName) {
            var state = new mmcDto.State(majorSelector, majorSelectName, minorSelector, minorSelectName);
            this._updateCookieList(this._cookieState, this._resourceName, state);
        },

        // override _MovingWindow to use a FadeoutAlertBox
        _alert: function (message) {
            this.fadeoutAlertBox.show(message);
        },

        // callbacks
        onFetchMenu: function (/*XmlItem[]*/items, request) {
            var parentElem = items[0]['element'];

            // assemble menus
            var dataSetElems = query('dataSet', parentElem);
            this._addPopupMenuBarItem(dataSetElems[0]);

            // load default or previously selected chart
            var windowLength = this.windowSelector.getWindowLength();
            var startTime = this.windowSelector.getStartTime();
            var initialState = this._validInitialState? this._initialState : this._defaultState;
            this._selectChart(windowLength, startTime,
                initialState.majorSelector,
                initialState.majorSelectName,
                initialState.minorSelector,
                initialState.minorSelectName);
        },

        onSelectChart: function (evt) {
            var startTime = this.windowSelector.getStartTime();
            if (this._validateTimeInputs(startTime)) {
                var menuItem = registry.getEnclosingWidget(evt.target);
                var majorSelector = menuItem.get('majorSelect');
                var majorSelectName = menuItem.get('majorSelectName');
                var minorSelector = menuItem.get('minorSelect');
                var minorSelectName = menuItem.get('label');
                this._saveStateToCookie(majorSelector, majorSelectName, minorSelector, minorSelectName);
                this._selectChart(this.windowSelector.getWindowLength(), startTime, majorSelector, majorSelectName, minorSelector, minorSelectName);
            }
        },

        onSelectWindowLength: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
            this._reselectChart(windowLength, startTime);
        },

        onRealTimeToggleChange: function (/*bool*/enable) {
            if (enable) {
                this.movingWindowChart.startRecurringRequests();
            }
            else {
                this.movingWindowChart.stopRecurringRequests();
            }
        },

        onGetFixedWindow: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
            this._reselectChart(windowLength, startTime);
        },

        onSwitchWindow: function (/*Enum.WindowData*/windowType) {
            this._setWindowType(windowType);
            this.movingWindowChart.setWindowType(windowType);
            this._reselectChart(this.windowSelector.getWindowLength(), this.windowSelector.getStartTime());
        },

        _onZoomExtant: function (/*Date*/startTimeStamp, /*Date*/endTimeStamp) {
            var dto = new wsDto.State(Enum.WindowData.Fixed, 0, startTimeStamp.getTime(), endTimeStamp.getTime());
            this.windowSelector.setState(dto);
        },

        _onWindowRangeChange: function () {
            this.windowSelector.setRTEnable(false);
            this.onRealTimeToggleChange(false); // programmatically setting slider won't fire event so call handler directly
        },

        _onExportLink: function (/*callback(queryObj)*/queryObjReceiver, /*bool*/disableCookies) {
            queryObj = {};

            this.windowSelector.addCookieAsProperty(queryObj);
            this._addCookieAsStringProperty(queryObj, this._cookieState, this._resourceName);
            // TODO: refactor to get cookie name externally
             queryObj['serverId'] = this._queryId;

            if (disableCookies) {
                // copy view to new window with cookies disabled
                this._addDisableCookiesProperty(queryObj);
                var urlStr = window.doc.URL;
                var urlStr = urlStr.split('?')[0];
                var fullUrl = urlStr + '?' + ioQuery.objectToQuery(queryObj);
                open(fullUrl);
            }
            else {
                queryObjReceiver(queryObj);
            }
        },

        _onResourceName: function (name) {
            this._resourceName = name;
            this.windowSelector.setResource(name);
        }
    });
});