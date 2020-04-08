// ~/widget/UpdatingSelectableLegend
// SelectableLegend with extension to support persisting checkbox states on refresh

define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/query', 'dijit/registry',
     'dojox/lang/functional', 'dojox/charting/widget/SelectableLegend'],
function (declare, array, query, registry,
        df, SelectableLegend) {
    return declare([SelectableLegend],
    {
        _nextCheckedState: false,

        // toggle all checkboxes
        toggleAll: function () {
            array.forEach(this._cbs, function (checkBox, i) {
                if (checkBox.get('checked') != this._nextCheckedState) {
                    checkBox.set('checked', this._nextCheckedState);

                    var legendCheckBox = query(".dijitCheckBox", this.legends[i])[0];
                    legendCheckBox.click();
                }
            }, this);

            this._nextCheckedState = !this._nextCheckedState;
        },

        // override to persist checkbox settings between refreshes
        refresh: function () {
            // copy checkbox states to reuse
            var cbChecked = new Array();
            array.forEach(this._cbs, function (checkbox, i) {
                cbChecked.push(checkbox.get('checked'));
            });

            this.inherited(arguments);

            // workaround because labels get rebuilt on each refresh
            if (cbChecked.length > 0) {
                array.forEach(this.legends, function (legend, i) {
                    if ((i < cbChecked.length) && !cbChecked[i]) {
                        var legendCheckBox = query(".dijitCheckBox", this.legends[i])[0];
                        legendCheckBox.click();             // triggers handler to hide chart series
                        this._cbs[i].set('checked', false); // sets legend select state
                    }
                }, this);
            }
        }
    });
});