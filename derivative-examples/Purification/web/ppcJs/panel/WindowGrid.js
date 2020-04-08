// ~/panel/WindowGrid
// moving and fixed time window data grid display
// - select moving window
// - select fixed historical window
// - download CSV file to client

// Pub/sub list:
// [sub] ppcJs.PubSub.resourceName
// [pub] ppcJs.PubSub.exportLink

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/query', 'dojo/io-query', 'dojo/_base/array', 'dojo/on', 'dojo/dom-construct', 'dojo/topic',
        'dojox/string/Builder', 'dojox/xml/parser',
        'dijit/registry', 'dijit/form/Button', 'dijit/Dialog', 'dijit/InlineEditBox', 'dijit/form/Textarea',
        'dojox/layout/TableContainer', 'dojox/grid/EnhancedGrid', '../widget/dataGrid/CustomCSVWriter',
        '../Enum', '../PubSub',
        '../utilities/Compatibility', '../utilities/DataFormat', '../utilities/DateString', '../utilities/Identity',
        '../control/WindowSelect', './Download', '../widget/FadeoutAlertBox',
        './_MovingWindowClient', 'dojo/text!./windowGrid/template/windowGrid.html'],
function (declare, lang, query, ioQuery, array, on, construct, topic,
        Builder, parser,
        registry, Button, Dialog, InlineEditBox, Textarea,
        TableContainer, EnhancedGrid, CSVWriter,
        Enum, PubSub,
        Compatibility, DataFormat, DateString, Identity,
        WindowSelect, Download, FadeoutAlertBox,
        _MovingWindowClient, template) {
    return declare([_MovingWindowClient],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 2,

        // ajax request command constants
        _getTemplateCmd: { GET: 'WINDOW_GRID_TEMPLATE' },
        _getDataCmd: { GET: 'WINDOW_GRID_DATA' },
        // public configuration variables for setting commands
        getTemplateCmd: '',
        getDataCmd: '',
        name: '',

        // ajax response tags
        _rootTemplateTag: 'gridTemplate',   // template is collection of item elements
        _templateItemTag: 'item',
        _rowTag: 'row',

        // ajax request interval constants (ms)
        _gridInterval: 5000,
        _refreshIntervalId: '',

        // dijit variables
        name: 'Windowed Grid Panel',
        templateString: template,
        baseClass: 'windowGridPanel',

        // private variables
        _grid: null,
        _formatters: null,
        _lastId: 0,
        _exportContent: '',
        _url: '',


        //lifecycle methods
        constructor: function () {
            topic.subscribe(PubSub.resourceName, lang.hitch(this, this._onResourceName));
        },

        postCreate: function () {
            if (this.getTemplateCmd) {
                this._getTemplateCmd.GET = this.getTemplateCmd;
            }
            if (this.getDataCmd) {
                this._getDataCmd.GET = this.getDataCmd;
            }
        },

        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);  // calls _MovingWindow, _MovingWindowClient implementations

            if (!this._formatters) {
                this._formatters = new Array();
            }

            var contentCallback = lang.hitch(this, this.getExportContent);
            var filenameCallback = lang.hitch(this, this.getExportFilename);
            this.downloadPanel.load(urlVal, resourceId, serverProcess, contentCallback, filenameCallback);

            this.windowSelector.configure();
            if (this.windowSelector.isMovingWindow()) {
                this._setStartTime();
                var windowLengthMs = 1000 * this.windowSelector.getWindowLength();
                this._loadGrid(windowLengthMs);
            }
            else {
                this._setStartTime(this.windowSelector.getStartTime());
            }

            var testUrl = '../../ppcJs/tests/efficiencyTemplateResponse.xml';
            this._initStore(testUrl, this._getTemplateCmd, this._rootTemplateTag, this.onFetchTemplate);
        },

        unload: function () {
            this.inherited(arguments);
            this._stopRecurringRequests();
            this.downloadPanel.unload();

            if (this._formatters) {
                this._formatters.length = 0;
            }
        },

        startup: function () {
            this.inherited(arguments);
            this.gridDiv.startup();
            this.gridDiv.resize();
            this.borderContainer.startup();
            this.borderContainer.resize();
            this.windowSelector.startup();
            this.windowSelector.setAsSubmitted();
        },


        // public methods
        createExportContent: function () {
            this._grid.exportGrid('customcsv', { writerArgs: { separator: ',', formatters: this._formatters } }, lang.hitch(this, this._setExportContent));
        },

        getExportContent: function () {
            return this._exportContent;
        },

        // filename format: {resource name}_log_{date}.csv
        getExportFilename: function () {
            var filename = new Builder();
            filename.append(this._resourceName);
            filename.append('_');
            filename.append(this.name);
            filename.append('_');

            var date = (this._startTime) ? this._startTime : new Date();
            filename.append(DateString.toFilenameDate(date));
            filename.append('.csv');

            return filename.toString();
        },


        // private methods

        _setCustomDataQueryObj: function (/*int, ms*/windowLengthMs) {
            this._lastId = 0;
            var customQueryObj = {};

            if (!this._isMovingWindow()) {
                var trigger = this.windowSelector.getTrigger();
                lang.mixin(customQueryObj, { START_END: trigger.time, END_VAR: trigger.type, END_VAL: trigger.value });
            }

            lang.mixin(customQueryObj, this._getDataCmd);
            this._setDataQueryObj(windowLengthMs, this._lastId, customQueryObj);
        },

        _initiateDataRequests: function (/*int, ms*/windowLengthMs) {
            var testUrl = '../../ppcJs/tests/efficiencyDataResponse.xml';

            this._setCustomDataQueryObj(windowLengthMs);

            var configObj = { attributeMap: {},
                maxItems: 500
                //, urlUpdater: lang.hitch(this, this._urlUpdater)  - left in for when using SyndicatingXmlStore
            };
            this._initStore(testUrl, this._queryObject, this._rowTag, this.onFetchData, configObj);

            if (this._isMovingWindow()) {
                this._startRecurringRequests();
            }
            else {
                this._stopRecurringRequests();
            }
        },

        _loadGrid: function (/*int, ms*/windowLengthMs, /*[]*/columns) {
            // remove old grid:
            if (this._grid) {
                this._grid.destroy();
            }

            // TODO: get grid template to build gridLayout array
            this._createGrid(windowLengthMs, columns);
            this.startup();
        },

        _createGrid: function (/*int, ms*/windowLengthMs, /*[]*/columns) {
            this._initiateDataRequests(windowLengthMs);

            // set the layout structure:
            var gridLayout = [columns];

            var configObj = {
                query: {},
                store: this._xmlStore,
                structure: gridLayout,
                columnReordering: true,
                plugins: {
                    exporter: true
                }
            };
            this._grid = new EnhancedGrid(configObj, document.createElement('div'));

            // add to DOM and call startup (in order to render the grid)
            construct.place(this._grid.domNode, this.gridDiv.domNode);
            this._grid.startup();
        },

        _reloadGrid: function () {
            this._grid.setStore(this._xmlStore);
        },

        _startRecurringRequests: function () {
            if (!this._refreshIntervalId) {
                this._refreshIntervalId = setInterval(lang.hitch(this, this._reloadGrid), this._gridInterval);
            }
        },

        _stopRecurringRequests: function () {
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                delete this._refreshIntervalId;
            }
        },

        _setExportContent: function (content) {
            this._exportContent = content;
        },


        // callbacks
        _onSaveBatteryTrackerClick: function () {
            topic.publish(PubSub.exportLink, lang.hitch(this, this.onExportLink));
            this.logEntry.set('value', '');
            this.registerDialog.show();
        },

        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            var rootElem = items[0]['element'];

            // build grid config object from template response
            var columns = new Array();

            query(this._templateItemTag, rootElem).forEach(function (/*XmlElement*/dataSetElem, /*int*/i) {
                // create grid column config object
                var field = Compatibility.attr(dataSetElem, 'id');
                var type = Compatibility.attr(dataSetElem, 'type');
                type = Identity.isString(type) ? type.toUpperCase() : '';
                var name = parser.textContent(dataSetElem);

                var width = '0px';
                var formatter = function (item) {
                    return item.toString();
                };

                switch (type) {
                    case ('FLOAT'):
                        width = '50px';
                        formatter = function (item) {
                            return DataFormat.getFloatAsString(item, 2, '');
                        };
                        break;
                    case ('INTEGER'):
                        width = '50px';
                        break;
                    case ('PERCENT'):
                        width = '50px';
                        formatter = function (item) {
                            return DataFormat.getPercentAsString(item, 1, '');
                        };
                        break;
                    case ('TIMESTAMP'):
                        width = '90px';
                        formatter = function (item) {
                            return DateString.toDateTime(item);
                        };
                        break;
                    case ('STRING'):
                        width = '50px';
                        break;
                    default:
                        break;
                }

                var column = {
                    field: field,
                    name: name,
                    width: width,
                    formatter: formatter
                };
                columns.push(column);
                this._formatters.push(formatter);
            }, this);

            var windowLengthMs = 1000 * this.windowSelector.getWindowLength();
            this._loadGrid(windowLengthMs, columns);
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            // no action: grid automatically handles fetch
        },

        onRegisterRun: function (/*XmlItem[]*/items, request) {
            this.fadeoutAlertBox.show('This test run has been registered with the BatteryTracker. You can import this into Excel using the Viewer add-in.');
        },

        // update store with new window length
        onSelectWindowLength: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
            if (this._isLoaded && this._validateTimeInputs(startTime)) {
                var windowLengthMs = 1000 * windowLength;
                this._initiateDataRequests(windowLengthMs);
                this._reloadGrid();

                if (this._isMovingWindow()) {
                    // slave the toggle state to reduce panel state permutations and make operation 1 touch
                    this.windowSelector.setAsSubmitted();
                }
            }
        },

        onRealTimeToggleChange: function (/*bool*/enable) {
            if (this._isLoaded) {
                if (enable && this._isMovingWindow()) {
                    this._startRecurringRequests();
                }
                else {
                    this._stopRecurringRequests();
                }
            }
        },

        onGetFixedWindow: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
            this.onSelectWindowLength(windowLength, startTime);
        },

        onSwitchWindow: function (/*ppcJs.Enum.WindowData*/windowType) {
            this._setWindowType(windowType);
            if (this._isMovingWindow()) {
                var windowLength = this.windowSelector.getWindowLength();
                this.onSelectWindowLength(windowLength, null);
            }
            else {
                this._stopRecurringRequests();
            }
        },

        _onResourceName: function (name) {
            this._resourceName = name;
        },

        // callback passed as PubSub.exportLink topic arg
        onExportLink: function (fullURL) {
            this._url = fullURL;
        },

        _onSubmitRegisterClick: function () {
            // append 'save' query command to URL to register test run with BatteryTracker
            var queryObj = { save: true, logEntry: this.logEntry.get('value'), chartURL: this._url };
            var queryStr = ioQuery.objectToQuery(queryObj);
            var prevUrl = this._xmlStore.url;
            this._xmlStore.url = this._fullUrl + '&' + queryStr;
            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onRegisterRun) });

            //reset query to fetch w/o save info
            this._xmlStore.url = prevUrl;
        },

        _onCancelRegisterClick: function () {
            this.registerDialog.hide();
        }
    });
});