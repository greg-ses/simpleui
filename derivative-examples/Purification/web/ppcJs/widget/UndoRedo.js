// ~/widget/UndoRedo
// provides undo/redo buttons returning objects stored with widgets
// state control of buttons based on
//  - presence of objects stored
//  - number of times undo/redo buttons clicked

define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
        'dijit/form/Button',
        'dojo/text!./undoRedo/template/undoRedo.html'],
function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
        Button,
        template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
    {
        _items: null,
        _currentItemIndex: 0,

        // state machine
        viewStateEnum: {
            Initial: 0,
            UndosExist: 1,
            RedosExist: 2,
            UndosRedosExist: 3
        },

        // public dijit variables
        name: 'UndoRedo',
        templateString: template,
        baseClass: 'undoRedo',

        // lifecycle methods
        constructor: function () {
            this._items = new Array();
        },

        postCreate: function () {
            this.inherited(arguments);
            this._setView(this.viewStateEnum.Initial);
        },


        // public methods
        clear: function () {
            this._items.length = 0;
            this._setView(this.viewStateEnum.Initial);
        },

        registerItem: function (item) {
            this._setCurrentItemAsLast();
            this._items.push(item);
            this._currentItemIndex = this._items.length - 1;
            this._updateView();
        },


        // private methods
        _updateView: function () {
            var viewState = this._getViewState();
            this._setView(viewState);
        },

        _getViewState: function () {
            var maxIndex = this._items.length - 1;
            var viewState;
            if (this._currentItemIndex > 0) {
                if (this._currentItemIndex < maxIndex) {
                    viewState = this.viewStateEnum.UndosRedosExist;
                }
                else {
                    viewState = this.viewStateEnum.UndosExist;
                }
            }
            else if (this._currentItemIndex < maxIndex) {
                viewState = this.viewStateEnum.RedosExist;
            }
            else {
                viewState = this.viewStateEnum.Initial;
            }

            return viewState;
        },

        _setView: function (viewState) {
            switch (viewState) {
                case (this.viewStateEnum.UndosExist):
                    this.undoButton.set('disabled', false);
                    this.redoButton.set('disabled', true);
                    break;

                case (this.viewStateEnum.RedosExist):
                    this.undoButton.set('disabled', true);
                    this.redoButton.set('disabled', false);
                    break;

                case (this.viewStateEnum.UndosRedosExist):
                    this.undoButton.set('disabled', false);
                    this.redoButton.set('disabled', false);
                    break;

                case (this.viewStateEnum.Initial):
                default:
                    this.undoButton.set('disabled', true);
                    this.redoButton.set('disabled', true);
                    break;
            }
        },

        _setCurrentItemAsLast: function () {
            while (this._currentItemIndex < this._items.length - 1) {
                this._items.pop();
            };
        },


        // callbacks
        _onUndoClick: function () {
            if (this._currentItemIndex > 0) {
                --this._currentItemIndex;
                var currentItem = this._items[this._currentItemIndex];
                this.onUndo(currentItem);

                this._updateView();
            }
        },

        _onRedoClick: function () {
            if (this._currentItemIndex < this._items.length - 1) {
                ++this._currentItemIndex;
                var currentItem = this._items[this._currentItemIndex];
                this.onRedo(currentItem);

                this._updateView();
            }
        },


        // public events
        onUndo: function (currentItem) {
        },

        onRedo: function (currentItem) {
        }
    });
});
