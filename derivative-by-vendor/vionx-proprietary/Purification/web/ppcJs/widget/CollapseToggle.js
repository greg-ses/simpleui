// ~/widget/CollapseToggle
// optimized textless button using internal standard icons
// shows [+] icon when checked = false, [-] icon when checked = true

define(['dojo/_base/declare', 'dojo/query', 'dojo/dom-class', 'dojo/on',
        'dijit/form/ToggleButton'],
function (declare, query, domClass, on,
        ToggleButton) {

    return declare([ToggleButton],
    {
        // ToggleButton configuration variables
        showlabel: false,
        checked: false,

        // css class names/in-line code
        _cssDijitButtonText: 'dijitButtonText',
        _cssButtonText: 'ctButtonText',
        _cssExpandIcon: 'ctExpandIcon',
        _cssCollapseIcon: 'ctCollapseIcon',

        // lifecycle methods
        postCreate: function () {
            this.inherited(arguments);

            // initialize state and adjust internal css
            this.set('iconClass', this._cssExpandIcon);

            var buttonTextClassSelect = '.' + this._cssDijitButtonText;
            query(buttonTextClassSelect, this.domNode).forEach(function (node) {
                domClass.replace(node, this._cssButtonText, this._cssDijitButtonText);
            }, this);

            this._onToggleChange(); // to account for checked being set on construction
            on(this, 'change', this._onToggleChange);
        },

        setExpanded: function (/*bool*/newValue) {
            if (this.checked != newValue) {
                this.checked = newValue;
                this._onToggleChange();
            }
        },

        // callbacks
        _onToggleChange: function () {
            if(this.checked) {
                this.set('iconClass', this._cssCollapseIcon);
            }
            else {
                this.set('iconClass', this._cssExpandIcon);
            }
        }
    });
});
