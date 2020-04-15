// Widget for displaying selected enum among range of enumeration values as LED stack where selected state is highlighted


dojo.provide('ppcJs.LedStack');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('ppcJs.LedStack', [dijit._Widget, dijit._Templated],
{
    // dijit variables
    name: 'ParamControl',
    widgetsInTemplate: false,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/LedStack.html'),

    // custom variables
    _labelArray: '',

    // overrides
    constructor: function (labelArray) {
        this._labelArray = labelArray;
    },

    postMixInProperties: function () {
    },

    postCreate: function () {
        // create a div for each item
        var addEnumLedPtr = dojo.hitch(this, this._addEnumLed);

        dojo.forEach(this._labelArray, function (label, i) {
            console.debug(label, "at index", i);
            addEnumLedPtr(label);
        });
    },


    setState: function (stateEnum) {
        var ledList = dojo.query('> div', this.domNode);
        for (var i = 0; i < ledList.length; i++) {
            if (i === stateEnum) {
                dojo.removeClass(ledList[i], 'unselectedLed');
                dojo.addClass(ledList[i], 'selectedLed');
            }
            else {
                dojo.removeClass(ledList[i], 'selectedLed');
                dojo.addClass(ledList[i], 'unselectedLed');
            }
        }
    },

    _addEnumLed: function (label) {
        var led = dojo.create('div', { innerHTML: label }, this.domNode, 'last');
    }
});