// DC/DC Control, derived from BaseControl

dojo.provide('ppcJs.DcDcControl');
dojo.provide('ppcJs.DcDcDTO');

dojo.require('ppcJs.BaseControl');
dojo.require('ppcJs.DataFormat');

dojo.declare('ppcJs.DcDcControl', ppcJs.BaseControl,
{
    // constants
    //_maxStringLength: 10,

    // indicators, data displays
    _cabinetPwrIconCell: '',
    _temperatureIconCell: '',

    _modeCell: '',
    _busVoltageCell: '',

    // dijit variables
    name: 'DC/DC',

    // css class names/in-line code
    _cssContainerNode: 'dcDcControl',

    // public methods
    constructor: function () {
    },

    postCreate: function () {
        this.inherited(arguments);
        this._cabinetPwrIconCell = this._addOnOffRow('Cabinet Power');
        this._temperatureIconCell = this._addIndicatorRow('Temperature', this._cssNokIcon);

        this._modeCell = this._addDataRow('Mode', '-');
        this._busVoltageCell = this._addDataRow('Bus Voltage', '0');
        dojo.addClass(this.containerNode, this._cssContainerNode);
    },


    // override methods
    update: function (/*DcDcDTO*/dto) {
        this.puB.setOn(this._cabinetPwrIconCell, dto.cabinetPowerOn);
        this.puB.setOk(this._temperatureIconCell, dto.temperatureOk);
        this._setString(this._modeCell, dto.mode);
        this._setData(this._busVoltageCell, dto.busVoltage);
    }
});

// data transfer object to update DcDcControl
dojo.declare('ppcJs.DcDcDTO', null,
{
    cabinetPowerOn: '',     // bool, true = on
    temperatureOk: '',      // (temperature status): bool, true = ok
    mode: '',               // (DC/DC mode), string
    busVoltage: '',         // (avg bus voltage, V): float

    constructor: function (cabinetPowerOn, temperatureOk, mode, busVoltage) {
        this.cabinetPowerOn = cabinetPowerOn;
        this.temperatureOk = temperatureOk;
        this.mode = mode;
        this.busVoltage = busVoltage;
    }
});