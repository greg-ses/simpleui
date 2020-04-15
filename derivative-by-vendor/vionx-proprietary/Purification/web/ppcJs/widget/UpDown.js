// ~/widget/UpDown
// provides up/down navigation buttons and events

define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
        'dijit/form/Button',
        'dojo/text!./upDown/template/upDown.html'],
function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
        Button,
        template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // public dijit variables
        name: 'Updown',
        templateString: template,
        baseClass: 'upDown',


        // callbacks
        _onUpClick: function () {
            this.onUpClick(this.domNode);
        },

        _onDownClick: function () {
            this.onDownClick(this.domNode);
        },


        // public events
        onUpClick: function (/*DOM node*/domNode) {
        },

        onDownClick: function (/*DOM node*/domNode) {
        }
    });
});