// ~/control/TimeOfDay
// calendar time entry widget

define(['dojo/_base/declare', './_Control', 'dijit/form/TimeTextBox', 'dojo/text!./timeOfDay/template/timeOfDay.html'],
function (declare, _Control, TimeTextBox, template) {
    return declare([_Control], 
    {
        // dijit variables
        name: 'TimeOfDayControl',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'timeOfDayControl',

        // overrides
        update: function (/*sec since midnight*/newValue) {
            var time = new Date();
            time.setSeconds(0);
            time.setMinutes(0);
            time.setHours(0);
            time.setSeconds(newValue);
            this.time.set('value', time, false);
        },

        // returns sec since midnight
        getValue: function () {
            var time = this.time.get('value');
            var sec = time.getSeconds();
            var min = time.getMinutes();
            var hrs = time.getHours();
            var secSinceMidnight = ((hrs * 60) + min) * 60 + sec;
            return secSinceMidnight;
        },

        // callbacks
        _onDateTimeSelectChange: function (newValue) {
            this.onChange(newValue);
        },

        // public events
        onChange: function (newValue) {
        }
    });
});