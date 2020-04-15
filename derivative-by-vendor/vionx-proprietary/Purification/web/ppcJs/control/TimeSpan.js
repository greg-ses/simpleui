// ~/control/TimeSpan
// timespan entry control

define(['dojo/_base/declare', './_Control', 'dijit/form/NumberSpinner', 'dojox/layout/TableContainer', 'dojo/text!./timeSpan/template/timeSpan.html'],
function (declare, _Control, NumberSpinner, TableContainer, template) {
    return declare([_Control], 
    {
        // public consts
        secPerHour: 3600,
        secPerMin: 60,

        // private variables
        _handlerList: '',

        // dijit variables
        name: 'TimeSpan Control',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'timeSpanControl',

        // public methods

        constructor: function () {
            this._handlerList = new Array();
        },

        postCreate: function () {
            this.inherited(arguments);
            this.controlTable.startup();
        },

        update: function (/*int, sec*/time) {
            var hours = Math.floor(time / this.secPerHour);
            var hoursRemainder = time % this.secPerHour;
            var minutes = Math.floor(hoursRemainder / this.secPerMin);
            var sec = hoursRemainder % this.secPerMin;
            this.hoursSpinnner.set('value', hours);
            this.minutesSpinnner.set('value', minutes);
            this.secondsSpinnner.set('value', sec);
        },

        // returns timespan in seconds
        getValue: function () {
            var hours = this.hoursSpinnner.get('value');
            var minutes = this.minutesSpinnner.get('value');
            var sec = this.secondsSpinnner.get('value');

            return ((hours * this.secPerHour) + (minutes * this.secPerMin) + sec);
        },


        // callbacks
        _onSpinnerChange: function () {
            this.onChange(this.getValue());
        },


        // public events
        onChange: function (newValue) {
        }
        
        
    });
});