// ~/mixin/_ToolTipClient
// behavior for managing tooltips through parent lifecycle

define(['dojo/_base/declare', 'dojo/_base/array', 'dijit/Tooltip'],
function (declare, array, Tooltip) {
    return declare(null,
    {
        // private class variables
        _toolTips: null,


        // protected methods
        _initializeToolTips: function () {
            if (!this._toolTips) {
                this._toolTips = [];
            }
        },

        _clearToolTips: function () {
            if (this._toolTips) {
                array.forEach(this._toolTips, function (toolTip, i) {
                    toolTip.destroy();
                });
                this._toolTips.length = 0;
            }
        },

        // Note: must add resource (that id references) to DOM before calling this
        _addToolTip: function (id, text) {
            var toolTip = new Tooltip({ connectId: [id], label: text });
            this._toolTips.push(toolTip);
        }
    });
});