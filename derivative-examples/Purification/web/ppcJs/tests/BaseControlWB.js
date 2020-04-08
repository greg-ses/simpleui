// test instance for BaseControl

dojo.provide('ppcJs.tests.BaseControlWB');
dojo.require('ppcJs.BaseControl');

dojo.declare('ppcJs.tests.BaseControlWB', ppcJs.BaseControl,
{
    // constants
    //_maxStringLength: 10,

    _onIconCell: '',
    _okIconCell: '',
    _dataCell: '',
    _stringCell: '',

    constructor: function () {
        this.name = 'BaseControlWB';
    },

    postCreate: function () {
        this.inherited(arguments);
        this._onIconCell = this._addIndicatorRow('test on/off', this.puB._cssOffIcon);
        this._okIconCell = this._addIndicatorRow('test ok', this.puB._cssNokIcon);
        this._dataCell = this._addDataRow('test data', '10.1');
        this._stringCell = this._addDataRow('test string', '0');
    },


    // override methods
    update: function (/*bool*/on, /*bool*/ok, /*float*/dataVal, stringVal) {
        this.puB.setOn(this._onIconCell, on);
        this.puB.setOk(this._okIconCell, ok);
        this.puB.setData(this._dataCell, dataVal, 2, '-');
        this._setString(this._stringCell, stringVal);
    }
});