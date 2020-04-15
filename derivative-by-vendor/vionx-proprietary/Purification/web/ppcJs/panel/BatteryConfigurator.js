// ~/panel/BatteryConfigurator
// BatteryConfigurator

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dijit/registry',
        'dojo/query', 'dojo/on', 'dojo/_base/array', 'dojox/string/Builder', 'dojo/store/JsonRest', 'dojo/store/Memory',
        'dojox/layout/TableContainer', 'dijit/form/Button', 'dijit/form/TextBox', 'dgrid/OnDemandGrid', 'dgrid/editor',
        '../bizLogic/configurator/ConfigTypeDef', '../utilities/Identity', '../utilities/Reflection',
        './_StorePanel', '../mixin/_QueueClient', 'dojo/text!./batteryConfigurator/template/batteryConfigurator.html'],
function (declare, lang, dom, construct, domClass, domStyle, registry,
        query, on, array, Builder, JsonRest, Memory,
        TableContainer, Button, TextBox, Grid, editor,
        ConfigTypeDef, Identity, Reflection,
        _StorePanel, _QueueClient, template) {
    return declare([_StorePanel, _QueueClient],
    {
        // private variables
        _batteryResource: 'battery',
        _grid: null,
        _lifeCycleStateNames: null,
        _inMemStore: null,

        // css classes
        _cssGrid: 'bcGrid',

        // dijit variables
        name: 'Battery Configurator Panel',
        templateString: template,
        baseClass: 'batteryConfiguratorPanel',

        // life cycle methods
        constructor: function () {
            this._restResources = [{ name: this._batteryResource, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/readBatteriesData.json' }];
            this._lifeCycleStateNames = Reflection.invertObjKeyValues(ConfigTypeDef.BatteryStateEnum);
        },

        // public methods
        load: function (baseUrl, /*optional*/resourceId) {
            this.inherited(arguments);
            domStyle.set(dom.byId(this.newBatteryTable), { display: 'none' });

            this._inMemStore = new Memory({
                data: []
            });

            this._grid = new Grid({
                store: this._inMemStore,
                getBeforePut: false,
                columns: [
                    {
                        id: 'serialNumber',
                        label: 'Serial Number',
                        field: 'serialNumber'
                    },
                    {
                        id: 'partNumber',
                        label: 'Part Number',
                        field: 'partNumber'
                    },
                    {
                        id: 'lifeCycleStateValue',
                        label: 'Disposition',
                        field: 'lifeCycleState',
                        renderCell: lang.hitch(this, this._renderLifeCycleState)
                    },
                    {
                        id: 'lifeCycleStateButton',
                        label: ' ',
                        field: 'lifeCycleState',
                        sortable: false,
                        renderCell: lang.hitch(this, this._renderButton)
                    },
                    {
                        label: 'Location',
                        field: 'location',
                        renderCell: lang.hitch(this, this._renderLocation)
                    }
                ]
            }, this.gridDiv);

            this._readBatteries();
        },

        unload: function () {
            this.inherited(arguments);
        },


        // private methods
        _readBatteries: function () {
            var store = this._getStore(this._batteryResource);
            store.query().then(lang.hitch(this, this._onFetchData));
        },

        _createBattery: function (/*string*/serialNumber, /*string*/partNumber) {
            var store = this._getStore(this._batteryResource);
            store.add({ serialNumber: serialNumber, partNumber: partNumber });
        },

        _renderLifeCycleState: function (object, data, node, options) {
            var cell = construct.create('div');
            cell.innerHTML = this._lifeCycleStateNames[parseInt(data)];
            node.appendChild(cell);
        },

        _renderLocation: function (object, data, node, options) {
            if (data) {
                var cell = construct.create('div');
                var fieldSeparator = '-';
                cell.innerHTML = data.systemName + ' - ' + data.subsystemName + ' - slot ' + +data.slot;
                node.appendChild(cell);
            }
        },

        _renderButton: function (object, data, node, options) {
            var batteryState = parseInt(data);
            switch (batteryState) {
                case (ConfigTypeDef.BatteryStateEnum.Inventory):
                    this._createStateChangeButton(object, node, 'Retire', ConfigTypeDef.BatteryStateEnum.Retired);
                    break;

                case (ConfigTypeDef.BatteryStateEnum.Retired):
                    this._createStateChangeButton(object, node, 'To Inventory', ConfigTypeDef.BatteryStateEnum.Inventory);
                    break;

                default:
                    break;
            }
        },

        _createStateChangeButton: function (/*DTO*/object, node, label, newLifeCycleState) {
            var stateChangeButton = new Button({
                label: label,
                onClick: lang.hitch(this, function () {
                    object.lifeCycleState = newLifeCycleState;
                    var store = this._getStore(this._batteryResource);
                    store.put(object);
                })
            });

            stateChangeButton._destroyOnRemove = true;
            stateChangeButton.placeAt(node);
        },

        // callbacks
        // ref: readBatteriesData.json
        // - svn::\web\Server\BatteryTrackerService\BatteryTrackerService\BatteryTracker\resources\dto\BatteryDTO
        _onFetchData: function (/*jsonobject[]*/items, request) {
            if (Identity.isArray(items)) {
                this._inMemStore.data = items;
                this._grid.refresh();
            }
        },

        _onNewRowClick: function () {
            domStyle.set(dom.byId(this.newBatteryButtonDiv), { display: 'none' });
            domStyle.set(dom.byId(this.newBatteryTable), { display: 'block' });
        },

        _onSaveClick: function () {
            var store = this._getStore(this._batteryResource);
            var serialNumber = this.newSerialNumber.get('value');
            var partNumber = this.newPartNumber.get('value');
            this.newSerialNumber.set('value', '');

            if(serialNumber && partNumber) {
                store.add({ serialNumber: serialNumber, partNumber: partNumber });
                domStyle.set(dom.byId(this.newBatteryButtonDiv), { display: 'block' });
                domStyle.set(dom.byId(this.newBatteryTable), { display: 'none' });
                this._queueCall(this._readBatteries, null, true);
            }
        },

        _onCancelClick: function () {
            this.newSerialNumber.set('value', '');
            this.newPartNumber.set('value', '');
            domStyle.set(dom.byId(this.newBatteryButtonDiv), { display: 'block' });
            domStyle.set(dom.byId(this.newBatteryTable), { display: 'none' });
        }
    });
});
