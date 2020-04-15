// ~/panel/BatteryTestRunConnector
// Excel task-pane panel for connecting a document to the BatteryTrackerService and EfficiencyService
// for the purpose of fetching extended battery test run data by battery serial number
// requests

// REST API: https://docs.google.com/a/premiumpower.com/spreadsheet/ccc?key=0Ary3LPbE9ib5dEY4NUM5cXlfMkdVZ0VtWFRuMElwUmc&usp=sharing
//  get list of batteries:                      GET ~baseUrl/battery
//  get data battery test runs for a battery:   GET ~baseUrl/battery/{batteryId}/test-run


define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/query', 'dojo/aspect', 'dojo/_base/array',
        'dojo/store/Memory', 'dijit/form/Button', 'dijit/form/FilteringSelect',
        '../utilities/DateString', '../utilities/Page', 'ppcJs/widget/FadeoutAlertBox',
        './_ExcelConnector', '../mixin/_QueueClient', 'dojo/text!./batteryTestRunConnector/template/batteryTestRunConnector.html'],
function (declare, lang, dom, query, aspect, array,
        Memory, Button, FilteringSelect,
        DateString, Page, FadeoutAlertBox,
        _ExcelConnector, _QueueClient, template) {

    // private variables
    var _batteriesResource = 'battery';
    var _testRunResource = 'test-run';

    return declare([_ExcelConnector, _QueueClient],
    {
        // protected overrides
        _headers: [['Date/Time', 'System', 'Subsystem', 'Test Type', 'Run Count', 'Stack Number', 'Charge Level', 'Disch Rate', 'Max Volts',
                    'Time, Constant Power', 'Constant Power Efficiency', 'Constant Power Discharge',
                    'Time, Full Discharge', 'Full Discharge Power Efficiency', 'Coulombic Efficiency', 'Full Discharge Energy', 'Charge Energy',
                    'Chart URL'
        ]],

        // dijit variables
        name: 'Battery Test Run Connector Panel',
        templateString: template,
        baseClass: 'batteryTestRunConnectorPanel',

        // life cycle methods
        constructor: function () {
            this.inherited(arguments);

            this._restResources = [{ name: _batteriesResource, testFile: '../../../../BatteryTrackerService/BatteryTrackerServiceTest/resources/readBatteriesData.json' }];
        },

        // public methods
        load: function (baseUrl, /*not used*/resourceId, /*Office*/office) {
            this.inherited(arguments);
            this._getBatteries();
        },

        unload: function () {
            this.inherited(arguments);
        },


        // private methods
        _getBatteries: function () {
            var batteryStore = this._getStore(_batteriesResource);
            batteryStore.query().then(lang.hitch(this, this._onFetchBatteries));
        },

        // creates one results row for one battery from DTO
        // DTO consists of a summary object and DOM TestData array
        // ref: 
        // - getBatteryTestRuns.json
        // - svn::\web\Server\BatteryTrackerService\BatteryTrackerService\BatteryTracker\resources\dto\ExtendedBatteryTestRunDTO
        _createResultRow: function (extendedBatteryTestRunDTO) {
            row = new Array();

            var summary = extendedBatteryTestRunDTO.summary;
            var testData = extendedBatteryTestRunDTO.testData;

            var dateTime = DateString.toDateTime(summary.timeStamp * 1000);
            row.push(dateTime);
            row.push(summary.systemName);
            row.push(summary.subsystemName);
            var testTypeVal = summary.testType ? summary.testType : ' ';
            row.push(testTypeVal);
            row.push(summary.cycleCount);

            row.push(testData.slot.toString());
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
            row.push(summary.chartURL);

            return row;
        },

        // returns an in-memory story for real-time filtered queries
        _createbatteryInMemStore: function (/*jsonobject[]*/items) {
            var data = new Array();
            array.forEach(items, function (item) {
                data.push({ name: item.serialNumber, id: item.id });
            });

            var batteryInMemStore = new Memory({
                data: data
            });

            return batteryInMemStore;
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
        // ref: readBatteriesData.json
        // - svn::\web\Server\BatteryTrackerService\BatteryTrackerService\BatteryTracker\resources\dto\BatteryDTO
        _onFetchBatteries: function (/*jsonobject[]*/items, request) {
            var batteryInMemStore = this._createbatteryInMemStore(items);
            var batterySelect = new FilteringSelect({
                name: 'Battery',
                store: batteryInMemStore,
                required: true
            });
            this._handlerList.push(aspect.after(batterySelect, 'onChange', lang.hitch(this, this._onBatterySelectChange), true));

            batterySelect.placeAt(dom.byId(this.batterySelect));
        },

        _onCreateTableClick: function () {
            this._createTable();
        },

        _onBatterySelectChange: function (batteryId) {
            var url = this._baseUrl + _batteriesResource + '/' + batteryId + '/' + _testRunResource;
            var restResource = { name: _testRunResource, testFile: '../../../../BatteryTrackerService/BatteryTrackerServiceTest/resources/getBatteryTestRuns.json' };
            var testRunStore = this._createStoreFromUrl(restResource, url);
            testRunStore.query().then(lang.hitch(this, this.onFetchData));
        },

        // ref JSON DTO: ~/trunk/web/Server/ppcJs/tests/getBatteryTestRuns.json
        onFetchData: function (/*json object*/dto, request) {
            // rearrange in matrix for insertion in spreadsheet
            var rows = new Array();
            array.forEach(dto, function (dtoItem) {
                rows.push(this._createResultRow(dtoItem));
            }, this);

            if (rows.length > 0) {
                this._tableBinding.addRowsAsync(rows, { coercionType: 'table' }, function (result) {
                    var error = result.error;
                    if (result.status === 'failed') {
                        console.log(error.name + ': ' + error.message);
                    }
                });
            }
            else {
                this.fadeoutAlertBox.show('There are no test runs for this battery.');
            }
        }
    });
});
