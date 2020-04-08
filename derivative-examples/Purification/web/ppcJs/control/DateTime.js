// ~/control/DateTime
// combined calendar date/time entry widget

define(['dojo/_base/declare', './_Control', 'dijit/form/DateTextBox', 'dijit/form/TimeTextBox', 'dojo/text!./dateTime/template/dateTime.html'],
function (declare, _Control, DateTextBox, TimeTextBox, template) {
    return declare([_Control], 
    {
        // consts
        _msPerSec: 1000,

        // dijit variables
        name: 'DateTimeControl',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'dateTimeControl',

        // overrides
        update: function (/* sec since epoch*/newValue) {
            var timeMs = newValue * this._msPerSec;
            var dateTime = new Date(timeMs);
            this.time.set('value', dateTime, false);

            dateTime.setSeconds(0);
            dateTime.setMinutes(0);
            dateTime.setHours(0);
            this.date.set('value', dateTime, false);
        },

        // returns sec since epoch
        getValue: function () {
            var time = this.time.get('value');
            var sec = time.getSeconds();
            var min = time.getMinutes();
            var hrs = time.getHours();

            var date = this.date.get('value');
            if (date) {
                date.setSeconds(sec);
                date.setMinutes(min);
                date.setHours(hrs);
            }

            var timeStamp = date.getTime() / this._msPerSec;
            return timeStamp;
        },

        // callbacks
        _onDateTimeSelectChange: function (newValue) {
            console.log(newValue.toString());
            var timeStamp = this.getValue();
            this.onChange(timeStamp);
        },

        // events
        onChange: function (/*sec since epoch*/timeStamp) {
        }
    });
});