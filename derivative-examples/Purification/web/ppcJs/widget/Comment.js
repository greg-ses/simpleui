// ~/widget/Comment
// comment entry widget
// hidden textarea shows on [+], hides on submit
// configurable hint clears on click
// *configurable: display hint on open or last edit
// edit state indicator - blue text color

define(['dojo/_base/declare', 'dojo/dom', 'dojo/dom-class',
        'dijit/Dialog', 'dijit/form/SimpleTextarea', 'dijit/form/Button',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
        '../Enum', '../utilities/Page', 'dojo/text!./comment/template/comment.html'],
function (declare, dom, domClass,
        Dialog, SimpleTextarea, Button,
        WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin,
        Enum, Page, template) {
    return declare([WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // css class names/in-line code
        _cssPenIcon: 'cPenIcon',

        // dijit variables
        name: 'Comment',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'comment',

        // public variables
        promptText: '',

        // callbacks
        _onLogEntryUserAction: function () {
            var entry = this.logEntry.get('value');
            if (entry == this.promptText) {
                this.logEntry.set('value', '');
            }
        },

        _onSubmitClick: function () {
            var entry = this.logEntry.get('value');
            this.onSave(entry);
            this.commentDialog.hide();
            Page.showDomNode(this.showButton);
        },

        _onCancelClick: function () {
            this.commentDialog.hide();
            Page.showDomNode(this.showButton);
        },

        _onShowClick: function () {
            Page.hideDomNode(this.showButton);
            this.logEntry.set('value', this.promptText);
            this.commentDialog.show();
        },


        // events
        onSave: function (text) {
        }

    });
});
