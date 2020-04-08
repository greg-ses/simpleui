// ~/control/SubsystemConfigurator
// Allows viewing and modifying of
//  - subsystem name
//  - battery assignment by slot
// uses APIs:
//  - /Battery

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-style', 'dojo/dom-construct',
        'dojo/query', 'dojo/_base/array', 'dojo/aspect', 'dojo/keys',
        'dijit/form/TextBox',
        './DateTime', '../widget/BinaryMomentaryButton', '../widget/Comment', '../bizLogic/configurator/ConfigTypeDef', '../utilities/DataFormat',
        './_StoreControl', '../mixin/_QueueClient', 'dojo/text!./subsystemConfigurator/template/subsystemConfigurator.html'],
function (declare, lang, dom, domStyle, domConstruct,
        query, array, aspect, keys,
        TextBox,
        DateTime, BinaryMomentaryButton, Comment, ConfigTypeDef, DataFormat,
        _StoreControl, _QueueClient, template) {
    return declare([_StoreControl, _QueueClient],
    {
        // css class names, in-line styles
        _cssSlot: 'sscSlot',
        _cssSerialNum: 'sscSerialNum',
        _cssAddRemove: 'sscAddRemove',
        _cssLogEntry: 'sccLogEntriesChild sscLogEntry',
        _cssGridRowOdd: 'basePanelGridRowOdd',


        // private variables
        _isConfigured: false,
        _dto: null,
        _batteryOptions: [],    // static so any SubsystemConfigurator action will update for all controls
        _batteryResource: 'battery',
        _subsystemResource: 'subsystem',
        _logEntryResource: 'log-entry',

        // dijit variables
        name: 'Subsystem Configurator Control',
        templateString: template,
        baseClass: 'subsystemConfiguratorControl',
        widgetsInTemplate: true,

        // protected methods
        _processConfig: function (/*sscDto.Ctor*/dto) {
            this._dto = dto;
            this._addLogStoreToMap(dto);

            if (dto.name) {
                this.nameTextBox.set('value', dto.name);
            }
            this.timeStamp.update(dto.timeStamp);

            array.forEach(dto.batterySerialNumbers, this._addBatterySlot, this);
            this._getBatteryOptions();

            array.forEach(dto.logEntries, this._listLogEntry, this);
        },

        // private methods
        // add store for endpoint /subsystem/{subsystemId}/log-entry to resource map
        _addLogStoreToMap: function (/*sscDto.Ctor*/dto) {
            var url = dto.baseUrl + this._subsystemResource + '/' + dto.id + '/' + this._logEntryResource;
            // workaround to object coupling bug: make key unique
            this._logEntryResource = this._logEntryResource + dto.id.toString();
            var restResource = { name: this._logEntryResource, testFile: '' };
            var logStore = this._createStoreFromUrl(restResource, url);
            this._restResourceMap.add(this._logEntryResource, logStore);
        },

        _addBatterySlot: function (batterySerialNumber, index) {
            var cssSlot = DataFormat.isOdd(index) ? this._cssSlot + ' ' + this._cssGridRowOdd : this._cssSlot;
            var slot = domConstruct.create('div', { class: cssSlot }, this.batteriesDiv);
            var serialNumSpacer = domConstruct.create('div', { class: this._cssSerialNum }, slot);
            var serialNum = domConstruct.create('span', { innerHTML: batterySerialNumber }, serialNumSpacer);
            var initializeAdded = batterySerialNumber ? true : false;
            var addRemove = domConstruct.create('div', { class: this._cssAddRemove }, slot);
            var button = new BinaryMomentaryButton({ initializeAdded: initializeAdded });
            button.placeAt(addRemove);

            aspect.after(button, 'onGetOptions', lang.hitch(this, function (callback) {
                callback(this._batteryOptions);
            }), true);

            aspect.after(button, 'onAdd', lang.hitch(this, function (option) {
                this._dto.batterySerialNumbers[index] = option;
                serialNum.innerHTML = option;
                this._setNewTimeStamp();
                this._updateResource();
                this._queueCall(this._getBatteryOptions, null, true);
            }), true);

            aspect.after(button, 'onRemove', lang.hitch(this, function () {
                this._dto.batterySerialNumbers[index] = '';
                serialNum.innerHTML = '';
                this._setNewTimeStamp();
                this._updateResource();
                this._queueCall(this._getBatteryOptions, null, true);
            }), true);
        },

        _setNewTimeStamp: function () {
            var date = new Date();
            this._dto.timeStamp = parseInt(date.getTime() / 1000);
            this.timeStamp.update(this._dto.timeStamp);
        },
        
        _updateResource: function () {
            var store = this._getStore(this._subsystemResource);
            store.put(this._dto, { id: this._dto.id });
        },

        _getBatteryOptions: function () {
            var battStore = this._getStore(this._batteryResource);
            var queryObj = { lifeCycleState: ConfigTypeDef.BatteryStateEnum.Inventory };
            battStore.query(queryObj).then(lang.hitch(this, this._onFetchBatteries));
        },

        _listLogEntry: function (logEntry) {
            var logDiv = domConstruct.create('div', { class: this._cssLogEntry }, this.logEntriesDiv);
            logDiv.innerHTML = '"' + logEntry + '"';
        },

        _saveLogEntry: function (logEntry) {
            if (logEntry != '') {
                var store = this._getStore(this._logEntryResource);
                store.add({ logEntry: logEntry });
                this._queueCall(this._getLogEntries, null, true);
            }
        },

        _getLogEntries: function () {
            var store = this._getStore(this._logEntryResource);
            store.query().then(lang.hitch(this, this._onFetchLogEntries));
        },


        // callbacks
        _onNameChange: function (newValue) {
            if (this._isConfigured) {
                this._dto.name = newValue;
                this._updateResource();
            }
        },

        _onFetchBatteries: function (/*jsonobject[]*/items, request) {
            this._isConfigured = true;
            this._batteryOptions.length = 0;

            array.forEach(items, function (item, index) {
                this._batteryOptions[index] = item.serialNumber;
            }, this);
        },

        _onFetchLogEntries: function (/*jsonobject*/item, request) {
            domConstruct.empty(this.logEntriesDiv);
            array.forEach(item.logEntries, this._listLogEntry, this);
        },

        _onDateTimeChange: function (/*sec since epoch*/timeStamp) {
            this._dto.timeStamp = timeStamp;
            this._updateResource();
        },

        _onLogEntrySave: function (logEntry) {
            this._saveLogEntry(logEntry);
        }
    });
});