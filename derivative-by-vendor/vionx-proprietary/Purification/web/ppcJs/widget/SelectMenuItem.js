// ~/widget/SelectMenuItem
// menu item dijit with additional properties to support nested selection

define(['dojo/_base/declare', 'dijit/MenuItem'],
function (declare, MenuItem) {
    return declare([MenuItem], 
    {
        // configurable custom attributes
        majorSelect: '',
        majorSelectName: '',
        minorSelect: '',

        // lifecycle methods
        postMixInProperties: function () {
            this.inherited(arguments);
        },

        buildRendering: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
        },

        startup: function () {
            this.inherited(arguments);
        },

        destroy: function () {
            this.inherited(arguments);
        }
    });
});