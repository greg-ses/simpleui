// ~/utilities/DateString
// static utilities to generate dates and times in abbreviated formats for display, and to check timezone

define(['./DataFormat', 'dojox/string/Builder'], function (DataFormat, Builder) {

    return {
        // returns 'mm/dd/yyyy UTC'
        toUTCDate: function (/*Date obj*/date) {
            var day = date.getUTCDate();
            var month = date.getUTCMonth() + 1;
            var year = date.getUTCFullYear();
            var dateStr = month + '/' + day + '/' + year + ' UTC';
            return dateStr;
        },

        // returns as 'hh:mm:ss' UTC
        toUTCTime: function (/*Date obj*/date) {
            return this._prettyPrint(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        },

        // returns 'mm/dd/yyyy'
        toDate: function (/*Date obj*/date) {
            return this._toDate(date, '/');
        },

        // returns 'mm_dd_yyyy'
        toFilenameDate: function (/*Date obj*/date) {
            return this._toDate(date, '_');
        },

        // returns Excel compatible date/time
        toDateTime: function (timeStampMs) {
            if (DataFormat.isInt(timeStampMs)) {
                var d = new Date(parseInt(timeStampMs));
                return d.toLocaleTimeString() + ' ' + this.toDate(d);
            }
            else {
                return timeStampMs.toString();
            }
        },

        // returns true if local time zone follows UTC (ex: EST = GMT - 5:00)
        isLocalZoneAfterUtc: function () {
            var date = new Date();
            var localMonth = date.getMonth();
            var utcMonth = date.getUTCMonth();
            var localDate = date.getDate();
            var utcDate = date.getUTCDate();
            var localHour = date.getHours();
            var utcHour = date.getUTCHours();

            return ((localMonth < utcMonth) || (localDate < utcDate) || (localHour < utcHour));
        },

        // ex: returns ' (GMT-4)'
        getTimeZoneStr: function (/*Date obj*/date) {
            var timeZoneHrs = -date.getTimezoneOffset() / 60;

            var builder = new Builder(' (GMT');
            if (timeZoneHrs > 0) {
                builder.append('+');
            }
            builder.append(timeZoneHrs);
            builder.append(')');

            return builder.toString();
        },

        // returns timespan in 'hh:mm:ss' format string
        prettyPrintTimespan: function (timespanSec) {
            var secPerMin = 60;
            var secPerHour = 60 * secPerMin;

            var hr = Math.floor(timespanSec / secPerHour);
            var hrRemainder = timespanSec - (hr * secPerHour);
            var min = Math.floor(hrRemainder / secPerMin);
            var sec = hrRemainder - (min * secPerMin);

            return this._prettyPrint(hr, min, sec);
        },

        // returns 'hh:mm:ss' format string
        _prettyPrint: function (hours, minutes, seconds) {
            var hr = DataFormat.pad(hours, 2);
            var min = DataFormat.pad(minutes, 2);
            var sec = DataFormat.pad(seconds, 2);
            var timeStr = hr + ':' + min + ':' + sec;
            return timeStr;
        },

        // ex: returns '12/12/2012'
        _toDate: function (/*Date obj*/date, /*string*/separator) {
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var dateStr = month + separator + day + separator + year;
            return dateStr;
        }
    };
});