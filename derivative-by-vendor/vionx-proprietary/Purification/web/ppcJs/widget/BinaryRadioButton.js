// ~/widget/BinaryRadioButton
// binary pair of radio buttons with aggregation logic

define(['dojo/_base/declare',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dijit/form/RadioButton',
        '../Enum', '../utilities/Page', 'dojo/text!./binaryRadioButton/template/binaryRadioButton.html'],
function (declare,
          WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin, RadioButton,
          Enum, Page, template) {
    return declare([WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // configuration properties
        radioALabel: 'radioA',
        radioBLabel: 'radioB',

        // dijit variables
        name: 'Binary Radio Button',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'binaryRadioButton',

        // lifecycle methods
        postCreate: function () {
            this.labelA.innerHTML = this.radioALabel;
            this.labelB.innerHTML = this.radioBLabel;
        },

        // callbacks
        _onLocalChange: function (newValue) {
            this.onChange(this.radioA.checked);
        },

        // public events
        onChange: function (/*bool*/radioAChecked) {
        }

    });
});