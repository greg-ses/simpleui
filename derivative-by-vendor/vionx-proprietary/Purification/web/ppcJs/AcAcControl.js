// AC/AC Control, derived from BaseControl

dojo.provide('ppcJs.AcAcControl');
dojo.provide('ppcJs.AcAcDTO');

dojo.require('ppcJs.BaseControl');
dojo.require('ppcJs.DataFormat');

dojo.declare('ppcJs.AcAcControl', ppcJs.BaseControl,
{
    _acInIconCell: '',
    _contactIconCell: '',
    _rectifierIconCell: '',
    _inverterIconCell: '',
    _temperatureIconCell: '',

    _internalPowerCell: '',
    _busVoltageCell: '',

    // dijit variables
    name: 'AC/AC',

    // css class names/in-line code
    _cssContainerNode: 'acAcControl',

    // public methods
    constructor: function () {
    },

    postCreate: function () {
        this.inherited(arguments);
        this._acInIconCell = this._addOnOffRow('AC in');
        this._contactIconCell = this._addOnOffRow('Contactor');
        this._rectifierIconCell = this._addOnOffRow('Rectifier');
        this._inverterIconCell = this._addOnOffRow('Inverter');
        this._temperatureIconCell = this._addIndicatorRow('Temperature', this._cssNokIcon);

        this._internalPowerCell = this._addDataRow('Internal Power (kW)', '0');
        this._busVoltageCell = this._addDataRow('Bus Voltage', '0');
        dojo.addClass(this.containerNode, this._cssContainerNode);
    },


    // override methods
    update: function (/*AcAcDTO*/dto) {
        this.puB.setOn(this._acInIconCell, dto.acInOk);
        this.puB.setOn(this._contactIconCell, dto.contactClosed);
        this.puB.setOn(this._rectifierIconCell, dto.rectifierOn);
        this.puB.setOn(this._inverterIconCell, dto.inverterOn);
        this.puB.setOk(this._temperatureIconCell, dto.temperatureOk);
        this._setData(this._internalPowerCell, dto.internalPower);
        this._setData(this._busVoltageCell, dto.busVoltage);
    }
});

// data transfer object to update AcAcControl
dojo.declare('ppcJs.AcAcDTO', null,
{
    acInOk: '',       // (AC Input status): bool, true = ok
    contactClosed: '',    // (contactor closed): bool, true = closed
    rectifierOn: '',       // (rectifier on): bool, true = on
    inverterOn: '',        // (inverter on): bool, true = on
    temperatureOk: '',       // (temperature status): bool, true = ok
    internalPower: '',     // (internal power, kW): float
    busVoltage: '',       // (avg bus voltage, V): float

    constructor: function (acInOk, contactClosed, rectifierOn, inverterOn, temperatureOk, internalPower, busVoltage) {
        this.acInOk = acInOk;
        this.contactClosed = contactClosed;
        this.rectifierOn = rectifierOn;
        this.inverterOn = inverterOn;
        this.temperatureOk = temperatureOk;
        this.internalPower = internalPower;
        this.busVoltage = busVoltage;
    }
});