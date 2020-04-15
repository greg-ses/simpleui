// Select dijit with additional properties

dojo.provide('ppcJs.FormSelect');
dojo.require('dijit.form.Select');


dojo.declare('ppcJs.FormSelect', [dijit.form.Select],
{
    // custom attributes
    containerId: '',


    constructor: function () {
    },

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