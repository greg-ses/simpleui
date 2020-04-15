// Base Templated Control. Derived Controls programmatically extend.
/* supports:
    - header, home/detail toggle
    - control table
    - data grid
    - extension div
    - AJAX request - use cmd defined by derived Control
    - warn/fault indicator
*/

dojo.provide('ppcJs.BaseControl');

dojo.require('ppcJs._Control');
dojo.require('dijit.form.Button');

dojo.declare('ppcJs.BaseControl', [ppcJs._Control],
{
    // consts
    _naNPlaceHolder: '-',
    _floatPrecision: 1,
    _powerUnitSuffix: ' kW',

    // dijit variables
    name: '',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/BaseControl.html'),

    // css class names/in-line code
    _cssShow: 'bcShow',
    _cssHide: 'bcHide',

    // class variables with defaults, can be overriden by derived classes
    _maxStringLength: 10,

    // public methods
    postCreate: function () {
        this._setName();
        this._setHomeView();
    },


    // protected methods
    // BasePanel wrappers
    _addOnOffRow: function (/*string*/label) {
        return this.puB.addOnOffRow(label, this.indicatorDiv);
    },

    _addIndicatorRow: function (/*string*/label, /*icon class*/cssIcon) {
        return this.puB.addIndicatorRow(label, cssIcon, this.indicatorDiv);
    },

    _addDataRow: function (/*string*/label, /*string*/value) {
        return this.puB.addDataRow(label, value, this.dataDiv);
    },

    _setData: function (node, /* float */value) {
        return this.puB.setData(node, value, this._floatPrecision, this._naNPlaceHolder);
    },

    _setString: function (node, /* string */value) {
        this.puB.setString(node, value, this._maxStringLength);
    },


    // private methods
    _setName: function () {
        this.nameDiv.innerHTML = this.name;
    },

    _setHomeView: function () {
        dojo.replaceClass(this.homeView, this._cssShow, this._cssHide);
        dojo.replaceClass(this.detailView, this._cssHide, this._cssShow);
    },

    _setDetailView: function () {
        dojo.replaceClass(this.homeView, this._cssHide, this._cssShow);
        dojo.replaceClass(this.detailView, this._cssShow, this._cssHide);
    },


    // callbacks
    onToggleChange: function () {
        var view = this.viewToggle.get('checked');
        alert('Detail view = ' + view.toString());
        //var queryObject = eStopVal? this._setEStopOnCmd : this._setEStopOffCmd;
        //dojo.xhrGet(this._assembleXhrArgs(queryObject));
    }
});

