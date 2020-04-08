// ~/bizLogic/movingWindow/TimeScale
// generates timescale labels from unix timestamps for selected window and marker interval

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojox/collections/Queue',
        '../../utilities/DataFormat', './enums', './Markers'],
function (declare, lang, Queue,
           DataFormat, enums, Markers) {
    return declare(null,
    {
        // private variables
        _markerInterval: '',        // enums.Interval
        _markerIntervalMs: '',
        _queue: '',
        _numberOfSubMarkers: '',    // number per major marker
        _lastMarkerMs: 0,
        _localTime: false,          // true = labels in local time, false = labels in UTC

        // lifecycle methods
        constructor: function (/*int*/windowLengthSec, /*enums.Interval*/markerInterval) {
            this._markerInterval = markerInterval;
            var queueCapacity = this._calcNumMarkers(DataFormat.toInt(windowLengthSec));
            this._queue = new Queue();
            lang.mixin(this._queue, { capacity: queueCapacity });
        },

        // public methods
        setLocalTime: function (/*bool*/setLocal) {
            this._localTime = setLocal;
            this._queue.clear();
        },

        // returns Markers object containing offset timestamp, interval, and labels at marker intervals
        getMarkers: function (/*int, ms*/lastTimeStamp) {
            var newMarkerNeeded = (lastTimeStamp > this._lastMarkerMs);
            var queueEmpty = (this._queue.count === 0);

            if (newMarkerNeeded || queueEmpty) {
                var currentTime = new Date(lastTimeStamp);
                currentTime.setSeconds(0);
                currentTime.setMilliseconds(0);

                var previousLastMarkerMs = this._lastMarkerMs;
                switch (this._markerInterval) {
                    case (enums.Interval.OneMinute):
                        // sets next 1 minute mark
                        this._lastMarkerMs = currentTime.getTime() + 60000;
                        break;

                    case (enums.Interval.FiveMinutes):
                        // sets next 5 minute mark
                        var currentMinutes = currentTime.getMinutes();
                        currentTime.setMinutes(DataFormat.roundDown(currentMinutes, 5));
                        this._lastMarkerMs = currentTime.getTime() + 5 * 60000;
                        break;

                    case (enums.Interval.FifteenMinutes):
                        // sets next 15 minute mark
                        var currentMinutes = currentTime.getMinutes();
                        currentTime.setMinutes(DataFormat.roundDown(currentMinutes, 15));
                        this._lastMarkerMs = currentTime.getTime() + 15 * 60000;
                        break;

                    case (enums.Interval.OneHour):
                        // sets next 1 hour mark
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 60 * 60000;
                        break;

                    case (enums.Interval.TwoHours):
                        // sets next 2 hour mark
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 2 * 60 * 60000;
                        break;

                    case (enums.Interval.FourHours):
                        // sets next 4 hour mark
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 4 * 60 * 60000;
                        break;

                    case (enums.Interval.TwelveHours):
                        // sets next 12 hour mark
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 12 * 60 * 60000;
                        break;

                    case (enums.Interval.OneDay):
                        // sets next 24 hour mark
                        this._setHours(currentTime);
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 24 * 60 * 60000;
                        break;

                    case (enums.Interval.TwoDays):
                        // sets next 48 hour mark
                        this._setHours(currentTime);
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 2 * 24 * 60 * 60000;
                        break;

                    case (enums.Interval.SevenDays):
                        // sets next 7 day mark
                        this._setHours(currentTime);
                        currentTime.setMinutes(0);
                        this._lastMarkerMs = currentTime.getTime() + 7 * 24 * 60 * 60000;
                        break;

                    default:
                        break;
                }

                var normalizedWindowMs = (this._queue.capacity - 1) * this._markerIntervalMs;
                var initialLastMarkerMs = this._lastMarkerMs - normalizedWindowMs;
                var newMarkerMs = queueEmpty ? initialLastMarkerMs : previousLastMarkerMs + this._markerIntervalMs;

                // fill in markers up to and including latest
                while (newMarkerMs <= this._lastMarkerMs) {
                    var marker = { timestamp: newMarkerMs, text: this._getLabel(newMarkerMs) };
                    if (this._queue.count >= this._queue.capacity) {
                        this._queue.dequeue();
                    }
                    this._queue.enqueue(marker);

                    newMarkerMs = newMarkerMs + this._markerIntervalMs;
                }
            }

            var labelArray = this._queue.toArray();     // { timestamp:, text: }[]
            var markers = new Markers(labelArray[0].timestamp, this._markerIntervalMs, 1 / this._numberOfSubMarkers);

            for (var i = 0; i < labelArray.length; i++) {
                markers.Labels.push(labelArray[i].text);
            }
            return markers;
        },


        // private methods
        // returns # markers to queue
        _calcNumMarkers: function (/*int*/windowLengthSec) {
            switch (this._markerInterval) {
                case (enums.Interval.OneMinute):
                    this._markerIntervalMs = 60000;
                    this._numberOfSubMarkers = 12;
                    break;

                case (enums.Interval.FiveMinutes):
                    this._markerIntervalMs = 300000;
                    this._numberOfSubMarkers = 5;
                    break;

                case (enums.Interval.FifteenMinutes):
                    this._markerIntervalMs = 900000;
                    this._numberOfSubMarkers = 3;
                    break;

                case (enums.Interval.OneHour):
                    this._markerIntervalMs = 3600000;
                    this._numberOfSubMarkers = 4;
                    break;

                case (enums.Interval.TwoHours):
                    this._markerIntervalMs = 2 * 3600000;
                    this._numberOfSubMarkers = 4;
                    break;

                case (enums.Interval.FourHours):
                    this._markerIntervalMs = 4 * 3600000;
                    this._numberOfSubMarkers = 4;
                    break;

                case (enums.Interval.TwelveHours):
                    this._markerIntervalMs = 12 * 3600000;
                    this._numberOfSubMarkers = 6;
                    break;

                case (enums.Interval.OneDay):
                    this._markerIntervalMs = 24 * 3600000;
                    this._numberOfSubMarkers = 6;
                    break;

                case (enums.Interval.TwoDays):
                    this._markerIntervalMs = 2 * 24 * 3600000;
                    this._numberOfSubMarkers = 2;
                    break;

                case (enums.Interval.SevenDays):
                    this._markerIntervalMs = 7 * 24 * 3600000;
                    this._numberOfSubMarkers = 7;
                    break;

                default:
                    this._markerIntervalMs = 60000;
                    this._numberOfSubMarkers = 12;
                    break;
            }

            // pad window with preceding and following end markers, add one more when non-integer marker ratio
            var tolerance = 0.00000000001;
            var markersPerWindow = (1000 * windowLengthSec) / this._markerIntervalMs;
            var roundedMarkersPerWindow = DataFormat.toInt(markersPerWindow);
            var needAdditionalMarker = (markersPerWindow > (roundedMarkersPerWindow + tolerance));
            var numMarkers = needAdditionalMarker ? roundedMarkersPerWindow + 3 : roundedMarkersPerWindow + 2;
            return numMarkers;
        },

        _setHours: function (/*Date*/date) {
            if (this._localTime) {
                date.setHours(0);
            }
            else {
                date.setUTCHours(0);
            }
        },

        _getMinutes: function (/*Date*/date) {
            var minutes = (this._localTime) ? date.getMinutes() : date.getUTCMinutes();
            return DataFormat.pad(minutes, 2);
        },

        _getHours: function (/*Date*/date) {
            var hours = (this._localTime) ? date.getHours() : date.getUTCHours();
            return hours.toString();
        },

        _getDate: function (/*Date*/date) {
            var calendarDate = (this._localTime) ? date.getDate() : date.getUTCDate();
            return calendarDate.toString();
        },

        _getCalendarMonth: function (/*Date*/date) {
            var calendarMonth = (this._localTime) ? date.getMonth() + 1 : date.getUTCMonth() + 1;
            return calendarMonth.toString();
        },

        _getLabel: function (/*int, sec*/timeStamp) {
            var markerTime = new Date(timeStamp);
            var label = '';
            var hoursStr = this._getHours(markerTime);
            var minutesStr = this._getMinutes(markerTime);

            switch (this._markerInterval) {
                case (enums.Interval.OneMinute):
                case (enums.Interval.FiveMinutes):
                case (enums.Interval.FifteenMinutes):
                    // 'hh:mm'
                    label = hoursStr + ':' + minutesStr;
                    break;

                case (enums.Interval.OneHour):
                case (enums.Interval.TwoHours):
                case (enums.Interval.FourHours):
                case (enums.Interval.TwelveHours):
                    //  'mm/dd-hh:00'
                    var month = this._getCalendarMonth(markerTime);
                    var date = this._getDate(markerTime);
                    label = month + '/' + date + '-' + hoursStr + ':00';
                    break;

                case (enums.Interval.OneDay):
                case (enums.Interval.TwoDays):
                case (enums.Interval.SevenDays):
                    //  'mm/dd'
                    var month = this._getCalendarMonth(markerTime);
                    var date = this._getDate(markerTime);
                    label = month + '/' + date;
                    break;
                default:
                    break;
            }

            return label;
        }
    });
});


