// ~/panel/SystemConfigurator
// SystemConfigurator

// REST resources - ref responses:
//  ~/system  -  ~\trunk\web\Server\ppcJs\tests\getSystems.json
//  ~/battery  -  ~\trunk\web\Server\ppcJs\tests\readBatteriesData.json
//  ~/system/{systemId}/subsystem

// ... stores passed to SubsystemConfigurators:
//  ~/battery - to get available batteries
//  ~/subsystem - to update subsystem data

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-style', 'dojo/query', 'dojo/_base/array',
        'dojox/collections/Dictionary',
        'dojox/layout/TableContainer', 'dijit/form/Select', 'dijit/form/Button', 'dijit/form/TextBox', 'dijit/form/NumberSpinner',
        './systemConfigurator/scDto', '../control/SubsystemConfigurator', '../control/subsystemConfigurator/sscDto',
        './_StorePanel', '../mixin/_QueueClient', 'dojo/text!./systemConfigurator/template/systemConfigurator.html'],
function (declare, lang, dom, domStyle, query, array,
        Dictionary,
        TableContainer, Select, Button, TextBox, NumberSpinner,
        scDto, SubsystemConfigurator, sscDto,
        _StorePanel, _QueueClient, template) {
    return declare([_StorePanel, _QueueClient],
    {
        // enums and maps
        displayStateEnum: {
            None: 0,
            NewSystem: 1,
            Subsystems: 2
        },

        // private variables
        _batteryResource: 'battery',
        _systemResource: 'system',
        _subsystemResource: 'subsystem',
        _noSystemValue: 0,
        _newSystemValue: -1,
        _subsystems: null,

        // dijit variables
        name: 'System Configurator Panel',
        templateString: template,
        baseClass: 'systemConfiguratorPanel',

        // life cycle methods
        constructor: function () {
            this._restResources = [{ name: this._systemResource, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/getSystems.json' },
                                    { name: this._batteryResource, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/readBatteriesData.json' },
                                    { name: this._subsystemResource, testFile: '' }];   // POST/PUT/DELETE only
            this._subsystems = new Array();
        },

        // public methods
        load: function (baseUrl, /*optional*/resourceId) {
            this.inherited(arguments);

            this._setComponentVisibility(this.displayStateEnum.None);
            this._fetchSystems();
        },

        unload: function () {
            this.inherited(arguments);
            this._clearSubsystems();
        },


        // private methods
        _setComponentVisibility: function (/*displayStateEnum*/displayState) {
            switch (displayState)
            {
                case (this.displayStateEnum.NewSystem):
                    domStyle.set(dom.byId(this.newSystemDialog), { display: 'block' });
                    domStyle.set(dom.byId(this.subsystemDiv), { display: 'none' });
                    break;
                case (this.displayStateEnum.Subsystems):
                    domStyle.set(dom.byId(this.newSystemDialog), { display: 'none' });
                    domStyle.set(dom.byId(this.subsystemDiv), { display: 'block' });
                    break;

                case (this.displayStateEnum.None):
                default:
                    domStyle.set(dom.byId(this.newSystemDialog), { display: 'none' });
                    domStyle.set(dom.byId(this.subsystemDiv), { display: 'none' });
                    break;
            }
        },

        _fetchSystems: function () {
            var store = this._getStore(this._systemResource);
            store.query().then(lang.hitch(this, this._onFetchSystems));
        },

        _fetchSubsystems: function (/*string[] - size 1*/systemIds) {
            var store = this._createChildSubsystemStore(systemIds[0]);
            store.query().then(lang.hitch(this, this._onFetchSubsystems));
        },

        _clearSubsystems: function () {
            array.forEach(this._subsystems, function (subsystem) {
                subsystem.destroyRecursive();
            });
            this._subsystems.length = 0;
            this.subsystemControlsDiv.innerHTML = '';
        },

        // create subsystem store (~baseUrl/system/{systemId}/subsystem)
        _createChildSubsystemStore: function (systemId) {
            var endPoint = this._restResources[0].name + '/' + systemId + '/subsystem';
            var restResource = { name: endPoint, testFile: 'BatteryTrackerService/BatteryTrackerServiceTest/resources/getSubsystems.json' };
            return this._createStore(restResource);
        },


        // callbacks
        // ref: ~/tests/getSystems.json
        _onFetchSystems: function (/*jsonobject[]*/items, request) {
            var options = new Array();
            options.push({ value: this._noSystemValue, label: '' });
            array.forEach(items, function (item) {
                options.push({ value: item.id, label: item.name });
            }, this);
            options.push({ value: this._newSystemValue, label: '<i>create a new system<i>' });

            this.systemSelect.set('options', options);
            this.systemSelect.set('value', this._noSystemValue);
        },

        _onFetchSubsystems: function (/*jsonobject[]*/items, request) {
            this._clearSubsystems();

            array.forEach(items, function (subsystemItem) {
                var subsystemControl = new SubsystemConfigurator( this._restResourceMap );

                lang.mixin(subsystemItem, { baseUrl: this._url });  // so control can create stores off this base url
                var dto = new sscDto.Ctor(subsystemItem);
                subsystemControl.configure(dto);

                this._subsystems.push(subsystemControl);
                subsystemControl.placeAt(this.subsystemControlsDiv);
            }, this);
        },

        _onSelectChange: function (systemId) {
            if (systemId != this._noSystemValue) {
                if (systemId == this._newSystemValue) {
                    this._setComponentVisibility(this.displayStateEnum.NewSystem);
                }
                else {
                    this._setComponentVisibility(this.displayStateEnum.Subsystems);
                    this._fetchSubsystems([systemId]);
                }
            }
        },

        _onSaveClick: function () {
            var name = this.newSystemName.get('value');
            var numSubsystems = this.numSubsystems.get('value');
            var numBatteries = this.numBatteries.get('value');
            var dto = new scDto.NewSystem(name, numSubsystems, numBatteries);

            var store = this._getStore(this._systemResource);
            store.add(dto);

            this._setComponentVisibility(this.displayStateEnum.None);
            this._queueCall(this._fetchSystems, null, true);
        },

        _onCancelClick: function () {
            this._setComponentVisibility(this.displayStateEnum.None);
            this.systemSelect.set('value', this._noSystemValue);
        },

        _onNewSubsystemClick: function () {
            var systemId = this.systemSelect.get('value');
            var store = this._createChildSubsystemStore(systemId);
            store.add({});
            this._queueCall(this._fetchSubsystems, [systemId], true);
        }
    });
});
