// resource block widget used in the main system panel

dojo.provide('ppcJs.BattResourceBlockControl');
dojo.provide('ppcJs.BattResourceBlockDTO');

dojo.require('ppcJs._Control');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.Enum');

dojo.declare('ppcJs.BattResourceBlockControl', [ppcJs._Control],
{
    // consts
    _naNPlaceHolder: '-',
    _floatPrecision: 1,
    _powerUnitSuffix: ' kW',

    // dijit variables
    name: '',
    widgetsInTemplate: false,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/BattResourceBlockControl.html'),

    // icon css class names
    _cssAcInOk: 'brbcAcInOk',
    _cssAcInNok: 'brbcAcInNok',

    _cssContactOpen: 'brbcContactOpen',
    _cssContactClosed: 'brbcContactClosed',

    _cssBattOk: 'basePanelBattOk',
    _cssBattLow: 'basePanelBattLow',
    _cssBattDischarged: 'basePanelBattDischarged',


    // public methods

    update: function (/*BattResourceBlockDTO*/dto) {
        this._updateAcInIcon(dto.acIn);
        this._updateContactorIcon(dto.contact);
        this._updateBattChargeIcon(dto.soc);

        var battPowerStr = ppcJs.DataFormat.getFloatAsString(dto.battPower, this._floatPrecision, this._naNPlaceHolder);
        this.battPower.innerHTML = battPowerStr + this._powerUnitSuffix;

        var hotelPowerStr = ppcJs.DataFormat.getFloatAsString(dto.hotelPower, this._floatPrecision, this._naNPlaceHolder);
        this.hotelPower.innerHTML = hotelPowerStr + this._powerUnitSuffix;
    },


    // private methos
    _updateAcInIcon: function (/*bool*/acIn) {
        if (acIn) {
            dojo.replaceClass(this.acInIcon, this._cssAcInOk, this._cssAcInNok);
        }
        else {
            dojo.replaceClass(this.acInIcon, this._cssAcInNok, this._cssAcInOk);
        }
    },

    _updateContactorIcon: function (/*bool*/contactor) {
        if (contactor) {
            dojo.replaceClass(this.contactorIcon, this._cssContactClosed, this._cssContactOpen);
        }
        else {
            dojo.replaceClass(this.contactorIcon, this._cssContactOpen, this._cssContactClosed);
        }
    },

    _updateBattChargeIcon: function (/*ppcJs.Enum.Soc*/soc) {
        switch (soc) {
            case (ppcJs.Enum.Soc.Discharged):
                dojo.replaceClass(this.battChargeIcon, this._cssBattDischarged, [this._cssBattLow, this._cssBattOk]);
                break;

            case (ppcJs.Enum.Soc.Low):
                dojo.replaceClass(this.battChargeIcon, this._cssBattLow, [this._cssBattDischarged, this._cssBattOk]);
                break;

            case (ppcJs.Enum.Soc.Normal):
                dojo.replaceClass(this.battChargeIcon, this._cssBattOk, [this._cssBattDischarged, this._cssBattLow]);
                break;

            default:
                break;
        }
    }
});

// data transfer object to update BattResourceBlockControl
dojo.declare('ppcJs.BattResourceBlockDTO', null,
{
    acIn: '',       // bool, true = ok
    contact: '',    // bool, true = closed
    soc: '',        // ppcJs.Enum.Soc
    battPower: '',  // float, kW
    hotelPower: '', // float, kW

    constructor: function (acIn, contact, soc, battPower, hotelPower) {
        this.acIn = acIn;
        this.contact = contact;
        this.soc = soc;
        this.battPower = battPower;
        this.hotelPower = hotelPower;
    }
});