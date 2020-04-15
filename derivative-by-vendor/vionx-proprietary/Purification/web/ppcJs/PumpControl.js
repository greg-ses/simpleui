// Pump Control, derived from BaseControl

dojo.provide('ppcJs.PumpControl');
dojo.provide('ppcJs.PumpDTO');

dojo.require('ppcJs.BaseControl');
dojo.require('ppcJs.DataFormat');

dojo.declare('ppcJs.PumpControl', ppcJs.BaseControl,
{
    // constants
    //_maxStringLength: 10,

    // indicators, data displays
    _pumpsIconCell: '',
    _leakIconCell: '',
    _valve12IconCell: '',
    _valve34IconCell: '',
    _temperatureIconCell: '',
    _pressureIconCell: '',

    // dijit variables
    name: 'Pumps',

    // css class names/in-line code
    _cssContainerNode: 'pumpControl',

    // public methods
    constructor: function () {
    },

    postCreate: function () {
        this.inherited(arguments);
        this._pumpsIconCell = this._addOnOffRow('Pumps');
        this._leakIconCell = this._addIndicatorRow('Leakage', this._cssNokIcon);
        this._valve12IconCell = this._addOnOffRow('Neut Valves 1 & 2');
        this._valve34IconCell = this._addOnOffRow('Neut Valves 3 & 4');
        this._temperatureIconCell = this._addIndicatorRow('Temperature', this._cssNokIcon);
        this._pressureIconCell = this._addIndicatorRow('Pressure', this._cssNokIcon);

        dojo.addClass(this.containerNode, this._cssContainerNode);
    },


    // override methods
    update: function (/*BatteryDTO*/dto) {
        this.puB.setOn(this._pumpsIconCell, dto.pumpsOn);
        this.puB.setOk(this._leakIconCell, dto.leakOk);
        this.puB.setOn(this._valve12IconCell, dto.valve12Closed);
        this.puB.setOn(this._valve34IconCell, dto.valve34Closed);
        this.puB.setOk(this._temperatureIconCell, dto.temperatureOk);
        this.puB.setOk(this._pressureIconCell, dto.pressureOk);
    }

    // private methods
});

// data transfer object to update PumpControl
dojo.declare('ppcJs.PumpDTO', null,
{
    pumpsOn: false,
    leakOk: false,
    valve12Closed: false,
    valve34Closed: false,
    temperatureOk: false,
    pressureOk: false,

    constructor: function (pumpsOn, leakOk, valve12Closed, valve34Closed, tempOk, pressureOk) {
        this.pumpsOn = pumpsOn;
        this.leakOk = leakOk;
        this.valve12Closed = valve12Closed;
        this.valve34Closed = valve34Closed;
        this.temperatureOk = tempOk;
        this.pressureOk = pressureOk;
    }
});