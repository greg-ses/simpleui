// ~/panel/_ExcelConnector
// base class for Excel task-pane panels. Switches _tableBinding on a worksheet-wide matrix binding selected event to support multi-sheet and multiple tables per sheet.
// Persists binding IDs to doc settings and restores binding handlers on load to support opening existing workbooks.
//
// firing order of events when no cell has been selected yet on a worksheet (ie, only worksheet tab selected):
//  1) EventType.DocumentSelectionChanged

// firing order of events when selecting a cell on a worksheet:
//  1) (sheet binding) EventType.BindingSelectionChanged
//  2) (table binding) EventType.BindingSelectionChanged
//  3) EventType.DocumentSelectionChanged

// Implementation:
//  set _sheetSelected = true on EventType.BindingSelectionChanged. Then on EventType.DocumentSelectionChanged...
// if             | then set
// -------------------------------------------------------------
// _sheetSelected | _pendingDocumentSelectChange  _sheetSelected
// =============================================================
// false          | true                          false
// true           | false                         false

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojox/uuid/generateRandomUuid',
    '../utilities/Identity', '../utilities/Json', './_StorePanel'],
function (declare, lang, array, generateRandomUuid,
    Identity, Json, _StorePanel) {

    // private variables
    var _sheetTableBindingMapName = 'sheetTableMap';    // for persisting sheet/tables binding map {'sheetBindingId': ['tableBindingIds']}
    var _activeTableBindingIdName = 'activeTableBindingId';
    var _sheetSelected = false;     // set true by sheet binding handler, cleared by doc selection event handler

    return declare([_StorePanel],
    {
        // protected variables
        _office: null,
        _tableBinding: null,
        _headers: [[]],     // header row names: derived class to define
        _pendingDocumentSelectChange: false,   // to inhibit table binding handling on tab switch until a selection in a sheet is made

        // public methods
        load: function (baseUrl, /*not used*/resourceId, /*Office*/office) {
            this.inherited(arguments);
            this._office = office;

            var tableBindingMap = this._getTableBindingMap();
            if (Identity.isObject(tableBindingMap)) {
                for (var sheetBindingId in tableBindingMap) {
                    this._addSheetBindingHandlerById(sheetBindingId);
                    array.forEach(tableBindingMap[sheetBindingId], function (tableBindingId, i) {
                        this._addTableBindingHandlerById(tableBindingId);
                    }, this);
                }

                this._restoreCurrentTableBinding();
            }
            else {
                this._office.context.document.settings.set(_sheetTableBindingMapName, '{}');
                this._office.context.document.settings.saveAsync();
            }

            this._addDocumentSelectChangeHandler();
            this._setTableControlsVisibility(false);
        },

        unload: function () {
            this.inherited(arguments);
        },
        

        // virtual callbacks/methods to override
        _setTableControlsVisibility: function (isVisible) {
        },

        _onDataChange: function (eventArgs) {
        },


        // private methods
        _restoreCurrentTableBinding: function () {
            var activetableBindingId = this._office.context.document.settings.get(_activeTableBindingIdName);
            var self = this;
            this._office.context.document.bindings.getByIdAsync(activetableBindingId, function (result) {
                self._tableBinding = result.value;
            });
        },

        _addDocumentSelectChangeHandler: function () {
            this._pendingDocumentSelectChange = false;
            this._office.context.document.addHandlerAsync(this._office.EventType.DocumentSelectionChanged, lang.hitch(this, this._onDocumentSelectChange));
        },

        _persistCurrentTableBindingId: function (tableDataBindingId) {
            this._office.context.document.settings.set(_activeTableBindingIdName, tableDataBindingId);
            this._office.context.document.settings.saveAsync();
        },

        _addSheetBindingHandler: function (sheetBinding) {
            var bindingSelectionChanged = this._office.EventType.BindingSelectionChanged;
            var onSelectionChange = lang.hitch(this, this._onSheetSelectionChange);
            sheetBinding.addHandlerAsync(bindingSelectionChanged, onSelectionChange);
        },

        _addSheetBindingHandlerById: function (sheetBindingId) {
            var self = this;
            this._office.context.document.bindings.getByIdAsync(sheetBindingId, function (result) {
                var sheetBinding = result.value;
                self._addSheetBindingHandler(sheetBinding);
            });
        },

        _addTableBindingHandler: function (tableBinding) {
            var onDataChange = lang.hitch(this, this._onDataChange);
            var bindingDataChanged = this._office.EventType.BindingDataChanged;
            tableBinding.addHandlerAsync(bindingDataChanged, onDataChange);

            var bindingSelectionChanged = this._office.EventType.BindingSelectionChanged;
            var onSelectionChange = lang.hitch(this, this._onTableSelectionChange);
            tableBinding.addHandlerAsync(bindingSelectionChanged, onSelectionChange);
        },

        _addTableBindingHandlerById: function (tableBindingId) {
            var self = this;
            this._office.context.document.bindings.getByIdAsync(tableBindingId, function (result) {
                var tableBinding = result.value;
                self._addTableBindingHandler(tableBinding);
            });
        },

        _getTableBindingMap: function () {
            var settingStr = this._office.context.document.settings.get(_sheetTableBindingMapName);
            return Json.deserialize(settingStr);
        },

        _addSheetToTableBindingMap: function (sheetBindingId, tableBindingId) {
            var tableBindingMap = this._getTableBindingMap();
            if (tableBindingMap[sheetBindingId]) {
                tableBindingMap[sheetBindingId].push(tableBindingId);
            }
            else {
                tableBindingMap[sheetBindingId] = [tableBindingId];
            }

            this._office.context.document.settings.set(_sheetTableBindingMapName, Json.serialize(tableBindingMap));
            this._office.context.document.settings.saveAsync();
        },

        _getFirstTableBindingId: function (sheetBindingId) {
            var tableBindingMap = this._getTableBindingMap();
            return tableBindingMap[sheetBindingId][0];
        },

        // creates new range binding, maps range binding id to table id in dictionary
        _createTable: function () {
            var sheetBindingId = dojox.uuid.generateRandomUuid();
            var self = this;
            this._office.context.document.bindings.addFromNamedItemAsync('A1:BB100', this._office.BindingType.Matrix, { id: sheetBindingId }, function (result) {
                var sheetBinding = result.value;
                self._addSheetBindingHandler(sheetBinding);

                self._createTableHeader();
                self._addTableBinding(sheetBindingId);
            });
        },

        _createTableHeader: function () {
            var resultTable = new this._office.TableData();
            resultTable.headers = this._headers;
            this._office.context.document.setSelectedDataAsync(resultTable, { coercionType: "table" },
            function (result) {
                var error = result.error;
                if (result.status === "failed") {
                    console.log(error.name + ": " + error.message);
                }
            });
        },

        _addTableBinding: function (sheetBindingId) {
            var tableDataBindingId = dojox.uuid.generateRandomUuid();
            this._addSheetToTableBindingMap(sheetBindingId, tableDataBindingId);
            this._persistCurrentTableBindingId(tableDataBindingId);

            var self = this;
            this._office.context.document.bindings.addFromSelectionAsync(this._office.BindingType.Table, { id: tableDataBindingId }, function (result) {
                self._tableBinding = result.value;
                self._addTableBindingHandler(self._tableBinding);
            });
        },


        // private callbacks
        _onDocumentSelectChange: function (eventArgs) {
            this._pendingDocumentSelectChange = !_sheetSelected;
            _sheetSelected = false;

            var isVisible = !this._pendingDocumentSelectChange;
            this._setTableControlsVisibility(isVisible);
        },

        // sets current table binding on worksheet selection and reenables table binding lockout mechanism (setting _pendingDocumentSelectChange)
        _onSheetSelectionChange: function (eventArgs) {
            _sheetSelected = true;
            // only set current table binding to default [0] on selecting cell on sheet the first time
            if (this._pendingDocumentSelectChange) {
                var sheetBindingId = eventArgs.binding.id;
                var tableDataBindingId = this._getFirstTableBindingId(sheetBindingId);
                this._persistCurrentTableBindingId(tableDataBindingId);
                var self = this;
                this._office.context.document.bindings.getByIdAsync(tableDataBindingId, function (result) {
                    self._tableBinding = result.value;
                });
            }
        },

        _onTableSelectionChange: function (eventArgs) {
            var tableDataBindingId = eventArgs.binding.id;
            this._persistCurrentTableBindingId(tableDataBindingId);
            var self = this;
            this._office.context.document.bindings.getByIdAsync(tableDataBindingId, function (result) {
                self._tableBinding = result.value;
            });
        }
    });
});