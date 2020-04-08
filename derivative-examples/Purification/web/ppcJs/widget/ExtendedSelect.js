// ~/widget/ExtendedSelect
// dijit.form.select with extension to support references

define(['dojo/_base/declare', 'dojo/on', 'dijit/form/Select'],
function (declare, on, Select) {
    return declare([Select],
    {
        // public fields set by constructor object
        extensionRefs: '',

        // public methods
        postCreate: function () {
            this.inherited(arguments);

            // onChange will fire onExtendedChange event
            on(this, 'change', this._onExtendedChange);
        },

        // synchronous get
        triggerExtendedChangeEvent: function () {
            var selectedValue = this.get('value');
            this._onExtendedChange(selectedValue);
        },

        // callbacks
        _onExtendedChange: function (newValue) {
            for (var i = 0; i < this.options.length; i++) {
                if (this.options[i].selected) {
                    break;
                }
            }

            this.onExtendedChange(newValue, i, this.extensionRefs);
        },

        // public events
        onExtendedChange: function (/*string*/newValue, index, /*optional, string[]*/refs) {
        }
    });
});

