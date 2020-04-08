// ~/panel/BatteryTrackerConnector
// Excel task-pane panel for connecting a document to the BatteryTrackerService and EfficiencyService
// requests

// REST API: https://docs.google.com/a/premiumpower.com/spreadsheet/ccc?key=0Ary3LPbE9ib5dEY4NUM5cXlfMkdVZ0VtWFRuMElwUmc&usp=sharing
//  get list of test runs:          GET ~baseUrl/test-run-summary
//  get data from all test runs:    GET ~baseUrl/test-run
//  get data from one test run:     GET ~baseUrl/test-run/{resourceTestRunId}
//  erase test run:                 DELETE ~baseUrl/test-run/{resourceTestRunId}

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-class', 'dojo/dom-style', 'dijit/registry',
        'dojo/query', 'dojo/on', 'dojo/_base/array', 'dojox/string/Builder', 'dojox/collections/Dictionary',
        'dijit/form/Button', 'ppcJs/control/TestRunFilteringSelect',
        '../utilities/Identity', '../utilities/DateString', '../utilities/Page',
        './_ExcelConnector', '../mixin/_QueueClient', 'dojo/text!./batteryTrackerConnector/template/batteryTrackerConnector.html'],
function (declare, lang, dom, domClass, domStyle, registry,
        query, on, array, Builder, Dictionary,
        Button, TestRunFilteringSelect,
        Identity, DateString, Page,
        _ExcelConnector, _QueueClient, template) {

    // private variables
    var _testRunSummaryResource = 'test-run-summary';
    var _testRunResource = 'test-run';
    var _testRunMap = null;  // key: test run ID, value: test run summary object
    var _nullId = 0;
    //var _selectedTestRun = '';

    return declare([_ExcelConnector, _QueueClient],
    {
        // protected overrides
        _headers: [['Date/Time', 'System', 'Subsystem', 'Run Count', 'Stack Number', 'Serial Number', 'Charge Level', 'Disch Rate', 'Max Volts',
                    'Time, Constant Power', 'Constant Power Efficiency', 'Constant Power Discharge',
                    'Time, Full Discharge', 'Full Discharge Power Efficiency', 'Coulombic Efficiency', 'Full Discharge Energy', 'Charge Energy', 'Test Type'
        ]],

        // dijit variables
        name: 'Battery Tracker Connector Panel',
        templateString: template,
        baseClass: 'batteryTrackerConnectorPanel',

        // life cycle methods
        constructor: function () {
            this.inherited(arguments);

            _testRunMap = new Dictionary();
            this._restResources = [{ name: _testRunSummaryResource, testFile: '../../../../BatteryTrackerService/BatteryTrackerServiceTest/resources/getTestRunSummaries.json' },
                                    { name: _testRunResource, testFile: '../../../../BatteryTrackerService/BatteryTrackerServiceTest/resources/getEfficiencyTestRun.json' }];
        },

        // public methods
        load: function (baseUrl, /*not used*/resourceId, /*Office*/office) {
            Page.displayLoadOverlay(this.loadingOverlay);

            this.inherited(arguments);
            this._getTestRuns();
        },

        unload: function () {
            this.inherited(arguments);
        },


        // _ExcelConnector overrides
        _onDataChange: function (eventArgs) {
            var self = this;
            this._tableBinding.getDataAsync(function (asyncResult) {
                if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                    console.log('Action failed. Error: ' + asyncResult.error.message);
                } else {
                    var testRunId = self.testRunSelect.getValue();
                    //_selectedTestRun = _testRunMap.item(testRunId);
                    var store = self._getStore(_testRunResource);
                    var dto = { cycleCount: asyncResult.value.rows[0][3] };
                    store.put(dto, { id: testRunId });
                }
            });
        },


        // private methods
        _getTestRuns: function () {
            var store = this._getStore(_testRunSummaryResource);
            store.query().then(lang.hitch(this, this.onFetchTestRuns));
        },

        // creates one results row for one battery from DTO
        // DTO consists of a summary object and DOM TestData array
        // ref: getEfficiencyTestRun.json
        _createResultRow: function (testData, summary) {
            row = new Array();

            var dateTime = DateString.toDateTime(summary.timeStamp * 1000);
            row.push(dateTime);
            row.push(summary.systemName);
            row.push(summary.subsystemName);
            row.push(summary.cycleCount);

            row.push(testData.slot.toString());
            row.push(testData.serialNumber.toString());
            row.push(testData.chargeAmpHours.toString());
            row.push(testData.dischargeRate.toString());
            row.push(testData.maxVolts.toString());

            row.push(testData.constantPowerMinutes.toString());
            row.push(testData.constantPowerEff.toString());
            row.push(testData.constantPowerDischargeEnergy.toString());

            row.push(testData.fullDischargeMinutes.toString());
            row.push(testData.fullDischargePowerEff.toString());
            row.push(testData.fullDischargeCoulombicEff.toString());
            row.push(testData.fullDischargeEnergy.toString());

            row.push(testData.chargeEnergy.toString());
            var testTypeVal = summary.testType ? summary.testType : ' ';
            row.push(testTypeVal);

            return row;
        },

        _createSummaryRow: function (summary) {
            row = new Array();

            var dateTime = DateString.toDateTime(summary.timeStamp * 1000);
            row.push(dateTime);
            row.push(summary.systemName);
            row.push(summary.subsystemName);
            row.push(summary.cycleCount);
            row.push(summary.chartURL);

            if (summary.logEntries) {
                var logEntries = new Builder();

                array.forEach(summary.logEntries, function (logEntry) {
                    logEntries.append(logEntry + '\n');
                });

                row.push(logEntries.toString());
            }

            var columnsToFill = this._tableBinding.columnCount - row.length;
            for (var i = 0; i < columnsToFill; i++) {
                row.push(' ');
            }

            return row;
        },

        // creates matrix consisting of one results row for each battery from DTO
        // DTO consists of a summary object and DOM TestData array 
        _createTestRunResultRows: function (/*array*/rows, dto)
        {
            rows.push(this._createSummaryRow(dto.summary));
            array.forEach(dto.batteries, function (battery) {
                rows.push(this._createResultRow(battery, dto.summary));
            }, this);
        },

        // adds tooltip for test run select menu item to help describe the test run
        _setTestRunToolTip: function (/*dijit/MenuItem*/menuItem) {
            var option = menuItem.get('option');
            if (option) {
                var selectedTestRun = _testRunMap.item(option.value);
                var logEntries = selectedTestRun.logEntries;
                var lastEntry = (logEntries.length > 0) ? ', "' + logEntries[logEntries.length - 1] + '"' : '';

                menuItem.set('title', 'Cycle Count: ' + selectedTestRun.cycleCount + lastEntry);
                menuItem.set('tooltip', 'true');
            }
        },

        // overrides base
        _setTableControlsVisibility: function (isVisible) {
            if (isVisible) {
                Page.showDomNode(this.tableControls);
            }
            else {
                Page.hideDomNode(this.tableControls);
            }
        },


        // callbacks
        onFetchTestRuns: function (/*jsonobject[]*/items, request) {
            _testRunMap.clear();
            this.testRunSelect.configure(items, _testRunMap);
            Page.hideLoadOverlay(this.loadingOverlay, true);
        },

        // ref JSON DTO: ~/trunk/web/Server/ppcJs/tests/getEfficiencyTestRun.json
        onFetchData: function (/*json object*/dto, request) {
            if (this._tableBinding) {
                // rearrange in matrix for insertion in spreadsheet
                var rows = new Array();

                if (Identity.isArray(dto)) {
                    array.forEach(dto, function (dtoItem) {
                        this._createTestRunResultRows(rows, dtoItem);
                    }, this);
                }
                else {
                    this._createTestRunResultRows(rows, dto);
                }

                // get page binding from selection
                this._tableBinding.addRowsAsync(rows, { coercionType: 'table' }, function (result) {
                    var error = result.error;
                    if (result.status === 'failed') {
                        document.write(error.name + ': ' + error.message);
                    }
                });
            }
        },

        _onCreateTableClick: function () {
            this._createTable();
        },

        _onGetAllClick: function ()
        {
            var store = this._getStore(_testRunResource);
            store.query().then(lang.hitch(this, this.onFetchData));
        },

        _onEraseClick: function ()
        {
            var testRunId = this.testRunSelect.getValue();
            if (testRunId != _nullId) {
                var store = this._getStore(_testRunResource);
                store.remove(testRunId);
                this._queueCall(this._getTestRuns, null, true);
            }
        },

        _onSelectFocus: function (event) {
            // now that menuItems have been instanced, connect tooltips to them on first time in focus
            if (this._handlerList.length == 0) {
                var dropDown = this.testRunSelect.dropDown;
                var menuItems = dropDown.getChildren();

                array.forEach(menuItems, function (menuItem) {
                    this._setTestRunToolTip(menuItem);
                }, this);
            }
        },

        _onSelectChange: function (testRunId) {
            if (testRunId != _nullId) {
                //_selectedTestRun = _testRunMap.item(testRunId);
                var store = this._getStore(_testRunResource);
                store.get(testRunId).then(lang.hitch(this, this.onFetchData));
            }
        }
    });
});
