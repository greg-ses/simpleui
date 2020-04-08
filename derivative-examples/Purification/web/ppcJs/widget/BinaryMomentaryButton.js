// ~/widget/BinaryMomentaryButton
// binary pair of buttons to add from a dynamic option list with aggregation logic
// clicking on Add fires the onGetOptions event with a callback arg to set the menu of options to add

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/on',
        'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dijit/form/Button',
        '../utilities/BasePanel', '../utilities/Page',
        'dojo/text!./binaryMomentaryButton/template/binaryMomentaryButton.html'],
function (declare, lang, array, on,
        dom, construct, domClass,
        WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin, Button,
        BasePanel, Page,
        template) {
    return declare([WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // state machine
        stateEnum: {
            Removed: 0,
            ShowAddOptions: 1,
            Added: 2
        },

        // private variables
        _handlerList: null,
        _state: 0,

        // css classes
        _cssOptionLink: 'bmbOptionLink',
        _cssOptionLinkHover: 'bmbOptionLinkHover',

        // configuration properties
        initializeAdded: true,

        // dijit variables
        name: 'Binary Momentary Button',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'binaryMomentaryButton',


        // lifecycle methods
        constructor: function () {
            this._handlerList = new Array();
        },

        postCreate: function () {
            state = this.initializeAdded ? this.stateEnum.Added : this.stateEnum.Removed;
            this._setToggleState(state);
        },

        uninitialize: function () {
            this._clearHandlers();
        },


        // private methods
        _clearHandlers: function () {
            array.forEach(this._handlerList, function (handler) {
                handler.remove();
            });
            this._handlerList.length = 0;
            dom.byId(this.optionMenuDiv).innerHTML = '';
        },

        _setToggleState: function (/*stateEnum*/state) {
            switch (state)
            {
                case (this.stateEnum.Removed):
                    Page.hideDomNode(this.removeButtonDiv);
                    Page.showDomNode(this.addButtonDiv);
                    Page.hideDomNode(this.optionMenuDiv);
                    domClass.remove(this.addButtonDiv, BasePanel._cssSelectBorder);
                    break;

                case (this.stateEnum.ShowAddOptions):
                    Page.showDomNode(this.addButtonDiv);
                    Page.hideDomNode(this.removeButtonDiv);
                    Page.showDomNode(this.optionMenuDiv);
                    domClass.add(this.addButtonDiv, BasePanel._cssSelectBorder);
                    break;

                case (this.stateEnum.Added):
                default:
                    Page.hideDomNode(this.addButtonDiv);
                    Page.showDomNode(this.removeButtonDiv);
                    Page.hideDomNode(this.optionMenuDiv);
                    domClass.remove(this.addButtonDiv, BasePanel._cssSelectBorder);
                    break;
            }

            this._state = state;
        },

        _addBatteryOption: function (option) {
            var optionLink = construct.create('span');
            domClass.add(optionLink, this._cssOptionLink);
            Page.addHoverBehavior(this._handlerList, optionLink, this._cssOptionLinkHover);
            optionLink.innerHTML = option;
            this._handlerList.push(on(optionLink, 'click', lang.hitch(this, this._onOptionSelect)));
            construct.place(optionLink, dom.byId(this.optionMenuDiv));
        },
        

        // callbacks
        _onGetOptionsClick: function () {
            if (this._state == this.stateEnum.Removed) {
                this._setToggleState(this.stateEnum.ShowAddOptions);
                this.onGetOptions(lang.hitch(this, this._optionsReceiver));
            }
            else {
                this._setToggleState(this.stateEnum.Removed);
            }
        },

        _onRemoveClick: function () {
            this._setToggleState(this.stateEnum.Removed);
            this.onRemove();
        },

        _onOptionSelect: function (evt) {
            var option = evt.target.innerHTML;
            this.onAdd(option);
            this._setToggleState(this.stateEnum.Added);
        },
        

        // callback to process options passed in via onGetOptions event
        _optionsReceiver: function (/*string[]*/options) {
            this._clearHandlers();
            array.forEach(options, function (option) {
                this._addBatteryOption(option);
            }, this);
        },


        // public events
        onGetOptions: function (/*callback(options)*/optionsReceiver) {
        },

        // add item "option"
        onAdd: function (/*string*/option) {
        },

        // remove prior selection (not recorded by this widget)
        onRemove: function () {
        }
    });
});