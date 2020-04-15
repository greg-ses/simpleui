// ~/panel/Log
// log panel consumes syndicated event log feed
// integrates DownloadPanel to export to csv file

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/topic',
        'dojox/string/Builder', 'dojox/layout/TableContainer', 'dijit/form/TextBox',
        '../Enum', '../PubSub', '../data/SyndicatingXmlStore', '../utilities/Compatibility', '../utilities/DateString',
        '../widget/dataGrid/CustomCSVWriter', '../widget/DataGrid', '../control/WindowSelect', './Download',
        './_MovingWindowClient', 'dojo/text!./log/template/log.html'],
function (declare, lang, construct, topic,
        Builder, TableContainer, TextBox,
        Enum, PubSub, SyndicatingXmlStore, Compatibility, DateString,
        CSVWriter, DataGrid, WindowSelect, Download,
        _MovingWindowClient, template) {
    return declare([_MovingWindowClient],
    {
        // ajax request command constants
        _getDataCmd: { GET: 'LOG_DATA' },

        // ajax template response tags
        _rootTag: 'log',
        _rowTag: 'r',
        _resourceTag: 'rs',
        _typeTag: 'tp',
        _messageTag: 'm',
        _idAttr: 'id',

        // ajax request interval constants (ms)
        _gridInterval: 5000,
        _refreshIntervalId: '',

        // dijit variables
        name: 'LogPanel',
        templateString: template,
        baseClass: 'logPanel',

        // private variables
        _grid: '',
        _formatters: null,  // no template so persistent
        _lastId: 0,
        _exportContent: '',
        _resourceName: '',


        // lifecycle methods
        constructor: function () {
            topic.subscribe(PubSub.resourceName, lang.hitch(this, this.onResourceName));
            this._setUpFormatters();
        },

        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);

            var contentCallback = lang.hitch(this, this.getExportContent);
            var filenameCallback = lang.hitch(this, this.getExportFilename);
            this.downloadPanel.load(urlVal, resourceId, serverProcess, contentCallback, filenameCallback);
            this.windowSelector.configure();
            var windowLengthMs = 1000 * this.windowSelector.getWindowLength();

            if (this.windowSelector.isMovingWindow()) {
                this._selectedWindowType = Enum.WindowData.Moving;
                this._setStartTime();
            }
            else {
                this._selectedWindowType = Enum.WindowData.Fixed;
                this._setStartTime(this.windowSelector.getStartTime());
            }
            this.windowSelector.setAsSubmitted();
            this._loadGrid(windowLengthMs);
        },

        unload: function () {
            this.inherited(arguments);
            this._stopRecurringRequests();
            this.downloadPanel.unload();
        },

        startup: function () {
            this.inherited(arguments);
            this.logDiv.startup();
            this.logDiv.resize();
            this.borderContainer.startup();
            this.borderContainer.resize();
            this.windowSelector.startup();
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
            filename.append('_log_');

            var date = (this._startTime) ? this._startTime : new Date();
            filename.append(DateString.toFilenameDate(date));
            filename.append('.csv');

            return filename.toString();
        },

        // private methods
        _setUpFormatters: function () {
            this._formatters = new Array();
            // special formatting for timestamp column only
            this._formatters[1] = function (item) {
                return DateString.toDateTime(item);
            };
        },

        _urlUpdater: function (/*XmlItem[]*/items) {
            // update lastId
            for (var i = 0; i < items.length; i++) {
                var id = Compatibility.attr(items[i]['element'], this._idAttr);
                if (id > this._lastId) {
                    this._lastId = id;
                }
            }

            return this._updateRTDataUrl(this._lastId);
        },

        _loadGrid: function (/*int, ms*/windowLengthMs) {
            // remove old grid:
            if (this._grid !== '') {
                this._grid.destroy();
            }

            this._createGrid(windowLengthMs);
            this.startup();
        },

        _setCustomDataQueryObj: function (/*int, ms*/windowLengthMs) {
            this._lastId = 0;
            this._setDataQueryObj(windowLengthMs, this._lastId, lang.clone(this._getDataCmd));
        },

        _initiateDataRequests: function (/*int, ms*/windowLengthMs) {
            var testUrl = '../../ppcJs/tests/logPageResponse.xml';

            this._setCustomDataQueryObj(windowLengthMs);

            attribMap = { 'r.id': '@id', 'r.time': '@time', 'r.err': '@err' };
            var configObj = { attributeMap: attribMap,
                maxItems: 500,
                urlUpdater: dojo.hitch(this, this._urlUpdater)
            };
            this._initStore(testUrl, this._queryObject, this._rowTag, null, configObj);

            if (this._isMovingWindow()) {
                this._startRecurringRequests();
            }
            else {
                this._stopRecurringRequests();
            }
        },

        // overrides _Panel implementation (removed _Panel._handlerList management)
        _initStore: function (testUrl, queryObj, rootTag, handler, /*optional store config*/optionsObj) {
            if (this._xmlStore) {
                delete this._xmlStore;
            }

            this._testUrl = testUrl;
            this._handlerList = new Array();
            var fullUrl = this.puS.getFullUrl(this._urlInfo, queryObj, testUrl);
            var configObj = { url: fullUrl, rootItem: rootTag, maxItems: 1000 };
            dojo.mixin(configObj, optionsObj);
            this._xmlStore = new SyndicatingXmlStore(configObj);

            //no explicit fetch so handler not used: grid automatically triggers fetch
        },

        _createGrid: function (/*int, ms*/windowLengthMs) {
            this._initiateDataRequests(windowLengthMs);

            // set the layout structure:
            var gridLayout = [[
                {
                    field: 'id',
                    name: 'Row',
                    width: '75px',
                    formatter: function (item) {
                        return item.toString();
                    }
                },

                {
                    field: 'time',
                    name: 'Time',
                    width: '120px',
                    formatter: function (item) {
                        return DateString.toDateTime(item);
                    }
                },

                {
                    field: this._resourceTag,
                    name: 'Resource',
                    width: '120px',
                    formatter: function (item) {
                        return item.toString();
                    }
                },

                {
                    field: this._typeTag,
                    name: 'Type',
                    width: '120px',
                    formatter: function (item) {
                        return item.toString();
                    }
                },

                {
                    field: this._messageTag,
                    name: 'Event',
                    width: '400px',
                    formatter: function (item) {
                        return item.toString();
                    }
                }/*,

                {
                    field: 'err',
                    name: 'Severity',
                    width: '30px',
                    formatter: lang.hitch(this, this.puB.formatErrorImage)
                }*/
            ]];

            var configObj = {
                query: {},
                store: this._xmlStore,
                structure: gridLayout,
                columnReordering: true,
                plugins: {
                    exporter: true
                }
            };
            this._grid = new DataGrid(configObj, construct.create('div'));
            this._grid.sortInfo = -1;   // ID, descending order

            // add to DOM and call startup (in order to render the grid)
            this.logDiv.addChild(this._grid);
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

        // event handlers

        // update store with new window length
        onSelectWindowLength: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
            if (this._validateTimeInputs(startTime)) {
                var windowLengthMs = 1000 * windowLength;
                this._initiateDataRequests(windowLengthMs);
                this._reloadGrid();

                if (this._isMovingWindow()) {
                    // slave the toggle state to reduce panel state permutations and make operation 1 touch
                    this.windowSelector.setAsSubmitted();
                }
            }
        },

        onFilterChange: function () {
            // stop moving window for now to ensure robustness
            this.windowSelector.setRTEnable(false);
            this._stopRecurringRequests();

            var query = {};

            Object.defineProperty(query, this._resourceTag, {
                value: '*' + this.filterResource.get('value') + '*',
                enumerable: true
            });
            Object.defineProperty(query, this._typeTag, {
                value: '*' + this.filterType.get('value') + '*',
                enumerable: true
            });
            Object.defineProperty(query, this._messageTag, {
                value: '*' + this.filterEvent.get('value') + '*',
                enumerable: true
            });

            this._grid.setQuery(query, {ignoreCase: true, deep:true});
        },

        onRealTimeToggleChange: function (/*bool*/enable) {
            if (enable && this._isMovingWindow()) {
                this._startRecurringRequests();
            }
            else {
                this._stopRecurringRequests();
            }
        },

        onGetFixedWindow: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
            this.onSelectWindowLength(windowLength, startTime);
        },

        onSwitchWindow: function (/*Enum.WindowData*/windowType) {
            this._setWindowType(windowType);
            if (this._isMovingWindow()) {
                var windowLength = this.windowSelector.getWindowLength();
                this.onSelectWindowLength(windowLength, null);
            }
            else {
                this._stopRecurringRequests();
            }
        },

        onResourceName: function (name) {
            this._resourceName = name;
        }
    });
});