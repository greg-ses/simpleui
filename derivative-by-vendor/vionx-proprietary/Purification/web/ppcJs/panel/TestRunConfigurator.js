// ~/panel/TestRunConfigurator
// manage test run metadata

// REST API: https://docs.google.com/a/premiumpower.com/spreadsheet/ccc?key=0Ary3LPbE9ib5dEY4NUM5cXlfMkdVZ0VtWFRuMElwUmc&usp=sharing
// REST resource - ref response:
//  ~/test-run-summary  -  ~\trunk\web\Server\ppcJs\tests\getTestRunSummaries.json
//  ~/chemistry-data/{chemistryDataId} -  ~\trunk\web\Server\ppcJs\tests\getChemistryData.json

// ... stores passed to SubsystemConfigurators:
//  ~/test-run-summary - to get test run summaries
//  ~/test-type - to get and create test types
//  ~/test-run - to update test run's test type
//  ~/chemistry-data - to create or update chem logs for test runs

// reference JSON files in svn at /trunk/web/Server/BatteryTrackerService/BatteryTrackerServiceTest/resources/

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-attr', 'dojo/dom-style', 'dojo/query', 'dojo/_base/array', 'dojo/aspect', 'dojo/on',
        'dojo/keys', 'dojox/collections/Dictionary', 'dojox/layout/TableContainer',
        'dijit/form/Button', 'ppcJs/control/TestRunFilteringSelect', 'dijit/form/ComboBox', 'dijit/Dialog', '../control/ChemistryDataEditor',
        '../control/chemistryDataEditor/cdeDto', '../utilities/Identity', '../utilities/DateString', '../utilities/Page',
        './_StorePanel', '../mixin/_QueueClient', 'dojo/text!./testRunConfigurator/template/testRunConfigurator.html'],
function (declare, lang, dom, domAttr, domStyle, query, array, aspect, on,
        keys, Dictionary, TableContainer,
        Button, TestRunFilteringSelect, ComboBox, Dialog, ChemistryDataEditor,
        cdeDto, Identity, DateString, Page,
        _StorePanel, _QueueClient, template) {
    return declare([_StorePanel, _QueueClient],
    {
        // enums and maps
        displayStateEnum: {
            NoTestRunSelected: 0,
            NoChemData: 1,
            NewChemData: 2,
            EditChemData: 3
        },

        // private variables
        _testRunSummaryResource: 'test-run-summary',
        _chemistryDataResource: 'chemistry-data',
        _testRunResource: 'test-run',
        _testTypeResource: 'test-type',
        _testRunMap: null,  // key: test run ID, value: test run summary object
        _nullId: 0,
        _selectedTestRunId: null,

        // dijit variables
        name: 'Test Run Configurator Panel',
        templateString: template,
        baseClass: 'testRunConfiguratorPanel',

        // life cycle methods
        constructor: function () {
            this._testRunMap = new Dictionary();
            this._restResources = [{ name: this._testRunSummaryResource, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/getTestRunSummaries.json' },
                                    { name: this._testRunResource, testFile: '' },
                                    { name: this._testTypeResource, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/getTestTypes.json', notObservable: true },
                                    { name: this._chemistryDataResource, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/getChemistryData.json' }];
        },


        // public methods
        load: function (baseUrl, /*optional*/resourceId) {
            Page.displayLoadOverlay(this.loadingOverlay);

            this.inherited(arguments);

            this.existingChemistryDataEditor.configure();
            this._setComponentVisibility(this.displayStateEnum.NoTestRunSelected);
            this._fetchTestRunSummaries();
            this._fetchTestTypes();
        },

        unload: function () {
            this.inherited(arguments);
        },


        // private methods
        _setComponentVisibility: function (/*displayStateEnum*/displayState) {
            switch (displayState) {
                case (this.displayStateEnum.NoChemData):
                    domStyle.set(dom.byId(this.testRunDiv), { display: 'block' });
                    domStyle.set(dom.byId(this.newChemLogButtonDiv), { display: 'block' });
                    domStyle.set(dom.byId(this.chemDataGrid), { display: 'none' });
                    this.chemDataEntry.hide();
                    break;

                case (this.displayStateEnum.NewChemData):
                    domStyle.set(dom.byId(this.testRunDiv), { display: 'block' });
                    domStyle.set(dom.byId(this.newChemLogButtonDiv), { display: 'none' });
                    domStyle.set(dom.byId(this.chemDataGrid), { display: 'none' });
                    this.chemDataEntry.show();
                    break;

                case (this.displayStateEnum.EditChemData):
                    domStyle.set(dom.byId(this.testRunDiv), { display: 'block' });
                    domStyle.set(dom.byId(this.newChemLogButtonDiv), { display: 'none' });
                    domStyle.set(dom.byId(this.chemDataGrid), { display: 'block' });
                    this.chemDataEntry.hide();
                    break;

                case (this.displayStateEnum.NoTestRunSelected):
                default:
                    domStyle.set(dom.byId(this.testRunDiv), { display: 'none' });
                    domStyle.set(dom.byId(this.newChemLogButtonDiv), { display: 'none' });
                    domStyle.set(dom.byId(this.chemDataGrid), { display: 'none' });
                    this.chemDataEntry.hide();
                    break;
            }
        },

        _fetchTestTypes: function () {
            var store = this._getStore(this._testTypeResource);
            this.testType.set('store', store);
        },

        _fetchTestRunSummaries: function () {
            var store = this._getStore(this._testRunSummaryResource);
            store.query().then(lang.hitch(this, this._onFetchTestRunSummaries));
            this._selectedTestRunId = null;
        },

        // if prompt is still there, return ''
        _getLogEntry: function () {
            var logEntry = this.logEntry.get('value');
            if (logEntry == this._textAreaPrompt) {
                logEntry = '';
            }

            return logEntry;
        },

        // adds tooltip for test run select menu item to help describe the test run
        _setTestRunToolTip: function (/*dijit/MenuItem*/menuItem) {
            var option = menuItem.get('option');
            if (option) {
                var selectedTestRun = this._testRunMap.item(option.value);
                var logEntries = selectedTestRun.logEntries;
                var lastEntry = (logEntries.length > 0)? ', "' + logEntries[logEntries.length - 1] + '"' : '';

                menuItem.set('title', 'Cycle Count: ' + selectedTestRun.cycleCount + lastEntry);
                menuItem.set('tooltip', 'true');
            }
        },

        // note: queue args are passed as an array
        _updateTestRunTestType: function (/*[test type name]*/newValueArray) {
            var testRunId = this.testRunSelect.getValue();
            var store = this._getStore(this._testRunResource);
            store.put({ testType: newValueArray[0] }, { id: testRunId });
        },

        // adds handlers to per-test-run UI elements
        _addTestRunConfiguratorHandlers: function () {
            this._handlerList.push(on(this.testType.domNode, 'keydown', lang.hitch(this, this._onTestTypeKeyPress)));
            this._handlerList.push(aspect.after(this.testType, 'onChange', lang.hitch(this, this._onTestTypeChange), true));
            this._handlerList.push(aspect.after(this.existingChemistryDataEditor, 'onDataChange', lang.hitch(this, this._onDataChange), true));
        },


        // callbacks
        // ref JSON DTO: ~\trunk\web\Server\ppcJs\tests\getChemistryData.json
        onFetchData: function (/*json object*/dto, request) {
            var updateDto = new cdeDto.ChemistryData(dto.zincMolarConcentration,
                                                    dto.bromineMolarConcentration,
                                                    dto.zincPh,
                                                    dto.brominePh,
                                                    dto.indirectBromineInZincTank,
                                                    dto.indirectBromineInBromineTank,
                                                    dto.electrolyteAdded,
                                                    dto.bromineAdded,
                                                    dto.logEntry);
            updateDto.avgMolarConcentration = dto.avgMolarConcentration;
            updateDto.avgPh = dto.avgPh;
            updateDto.avgBromine = dto.avgBromine;

            this.existingChemistryDataEditor.update(updateDto);
        },

        // ref: getTestRunSummaries.json
        _onFetchTestRunSummaries: function (/*jsonobject[]*/items, request) {
            this._testRunMap.clear();
            this.testRunSelect.configure(items, this._testRunMap);

            this._setComponentVisibility(this.displayStateEnum.NoTestRunSelected);
            Page.hideLoadOverlay(this.loadingOverlay, true);
        },
        
        _onSelectFocus: function (event) {
            // now that menuItems have been instanced, connect tooltips to them on first time in focus
            var dropDown = this.testRunSelect.dropDown;
            if ((this._handlerList.length == 0) && dropDown) {
                var menuItems = dropDown.getChildren();
                array.forEach(menuItems, function (item) {
                    this._setTestRunToolTip(item);
                }, this);
            }
        },

        _onSelectChange: function (testRunId) {
            this._removeHandlers();
            if (testRunId != this._nullId) {
                // get extended test run summary
                var store = this._getStore(this._testRunSummaryResource);
                store.get(testRunId).then(lang.hitch(this, this._onFetchExtendedTestRunSummary));

                this._selectedTestRunId = testRunId;
            }
        },

        _onFetchExtendedTestRunSummary: function (item) {
            if (item) {
                // update left pane items
                domAttr.set(this.fleetViewerLink, 'href', item.chartURL);
                this.testType.set('value', item.testType);

                if (item.chemistryDataId > 0) {
                    // get chem data
                    var store = this._getStore(this._chemistryDataResource);
                    store.get(item.chemistryDataId).then(lang.hitch(this, this.onFetchData));
                    this._setComponentVisibility(this.displayStateEnum.EditChemData);
                }
                else {
                    this._setComponentVisibility(this.displayStateEnum.NoChemData);
                }

                this._queueCall(this._addTestRunConfiguratorHandlers, null, true);
            }
        },
        

        _onNewChemLogClick: function () {
            this._setComponentVisibility(this.displayStateEnum.NewChemData);
            this.newChemistryDataEditor.configure();
        },

        _onSubmitNewChemLogClick: function () {
            if (this._selectedTestRunId) {
                var dto = this.newChemistryDataEditor.getValue();
                dto.subsystemTestRunId = this._selectedTestRunId;

                var store = this._getStore(this._chemistryDataResource);
                store.add(dto);

                this._queueCall(this._fetchTestRunSummaries, null, true);
            }
        },

        _onCancelNewChemLogClick: function () {
            this._setComponentVisibility(this.displayStateEnum.NoChemData);
        },

        _onDataChange: function (/*control/chemistryDataEditor/cdeDto.ChemistryData*/dto) {
            dto.subsystemTestRunId = this._selectedTestRunId;
            var selectedTestRun = this._testRunMap.item(this._selectedTestRunId);
            if (selectedTestRun.chemistryDataId > 0) {
                var store = this._getStore(this._chemistryDataResource);
                store.put(dto, { id: selectedTestRun.chemistryDataId });
            }
        },

        _onTestTypeChange: function (newValue) {
            // need to queue in event of new test type
            this._queueCall(this._updateTestRunTestType, [newValue], true);
        },

        _onTestTypeKeyPress: function (event) {
            var dataEntryTerminated = ((event.keyCode == keys.ENTER) || (event.keyCode == keys.TAB));
            if (dataEntryTerminated) {
                var testType = this.testType.get('value');
                if (testType && !this.testType.item) {
                    var dto = { name: testType };
                    var store = this._getStore(this._testTypeResource);
                    store.add(dto);
                }
            }
        }
    });
});
