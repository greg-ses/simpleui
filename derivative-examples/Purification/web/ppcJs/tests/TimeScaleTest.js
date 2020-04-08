dojo.provide('ppcJs.tests.TimeScaleTest');
dojo.require('ppcJs.bizLogic.movingWindow.enums');
dojo.require('ppcJs.bizLogic.movingWindow.TimeScale');

doh.register('ppcJs.tests.TimeScaleTest',
    [
        function testGetOneMinuteMarkers(t) {
            var windowLengthSec = 300;
            var lastTimeStamp = 1327838490001; // 1/29/12 12:01:30:001 UTC, ms
            var refTimeScale = [
                '11:56',
                '11:57',     // 1/29/12 11:57:00 UTC
                '11:58',     // 1/29/12 11:58:00 UTC
                '11:59',     // 1/29/12 11:59:00 UTC
                '12:00',     // 1/29/12 12:00:00 UTC
            	'12:01',     // 1/29/12 12:01:00 UTC
                '12:02'      // 1/29/12 12:02:00 UTC
            ];
            var refOffset = 1327838160000;      // 1/29/12 11:56:00 UTC, ms
            var refLastMarker = 1327838520000;  // 1/29/12 12:02:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.OneMinute);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(60000, markers.MarkerInterval);       // 1 minute
            t.assertEqual(1/12, markers.MarkerSubInterval);   // 5 sec
            t.assertEqual(refOffset, markers.Offset);
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i]);
            }

            // verify timestamp of latest marker
            t.assertEqual(refLastMarker, sut._lastMarkerMs);
        },

        function testRepeatGetOneMinuteMarkers(t) {
            var windowLengthSec = 300;
            var initialTimeStamp = 1327838490001;   // 1/29/12 12:01:30:001 UTC, ms
            var refLastMarker = 1327838520000;      // 1/29/12 12:02:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.OneMinute);
            sut.getMarkers(initialTimeStamp);

            // increment past last marker
            var nextTimeStamp = refLastMarker + 1;
            var markers = sut.getMarkers(nextTimeStamp);

            var refTimeScale = [
                '11:57',
                '11:58',     // 1/29/12 11:58:00 UTC
                '11:59',     // 1/29/12 11:59:00 UTC
                '12:00',     // 1/29/12 12:00:00 UTC
            	'12:01',     // 1/29/12 12:01:00 UTC
                '12:02',     // 1/29/12 12:02:00 UTC
                '12:03'      // 1/29/12 12:03:00 UTC
            ];
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i]);
            }
        },

        function testGet5MinMarkers25MinWindow(t) {
            var windowLengthSec = 25 * 60;        // 25 min
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '11:35',
                '11:40',    // 1/29/12 11:40:00 UTC
                '11:45',    // 1/29/12 11:45:00 UTC
                '11:50',    // 1/29/12 11:50:00 UTC
                '11:55',    // 1/29/12 11:55:00 UTC
            	'12:00',    // 1/29/12 12:00:00 UTC
                '12:05'     // 1/29/12 12:05:00 UTC
            ];
            var refOffset = 1327836900000;  // 1/29/12 11:35:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.FiveMinutes);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(5 * 60000, markers.MarkerInterval, 'incorrect interval');   // 5 minutes
            t.assertEqual(1/5, markers.MarkerSubInterval, 'incorrect subinterval');    // 1 minute
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i]);
            }
        },

        function testGet5MinMarkers60MinWindow(t) {
            var windowLengthSec = 60 * 60;        // 1 hour
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '11:00',
                '11:05',
                '11:10',
                '11:15',
                '11:20',
                '11:25',
                '11:30',
                '11:35',
                '11:40',    // 1/29/12 11:40:00 UTC
                '11:45',    // 1/29/12 11:45:00 UTC
                '11:50',    // 1/29/12 11:50:00 UTC
                '11:55',    // 1/29/12 11:55:00 UTC
                '12:00',    // 1/29/12 12:00:00 UTC
                '12:05'     // 1/29/12 12:05:00 UTC
            ];
            var refOffset = 1327834800000;  // 1/29/12 11:00:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.FiveMinutes);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(5 * 60000, markers.MarkerInterval, 'incorrect interval');   // 5 minutes
            t.assertEqual(1/5, markers.MarkerSubInterval, 'incorrect subinterval');    // 1 minute
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i]);
            }
        },

        function testGet1HourMarkers6HourWindow(t) {
            var windowLengthSec = 6 * 60 * 60;        // 6 hours
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '1/29-6:00',
                '1/29-7:00',
                '1/29-8:00',
                '1/29-9:00',
                '1/29-10:00',
                '1/29-11:00',
                '1/29-12:00',
                '1/29-13:00'     // 1/29/12 13:00:00 UTC
            ];
            var refOffset = 1327816800000;  // 1/29/12 6:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.OneHour);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 1 hour
            t.assertEqual(1/4, markers.MarkerSubInterval, 'incorrect subinterval');    // 15 minutes
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i]);
            }
        },

        function testGet2HourMarkers6HourWindow(t) {
            var windowLengthSec = 6 * 60 * 60;        // 6 hours
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '1/29-6:00',
                '1/29-8:00',
                '1/29-10:00',
                '1/29-12:00',
                '1/29-14:00'     // 1/29/12 14:00:00 UTC
            ];
            var refOffset = 1327816800000;  // 1/29/12 6:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.TwoHours);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(120 * 60000, markers.MarkerInterval, 'incorrect interval');     // 1 hour
            t.assertEqual(1/4, markers.MarkerSubInterval, 'incorrect subinterval');    // 30 minutes
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i], 'incorrect label');
            }
        },

        function testGet4HourMarkers2DayWindow(t) {
            var windowLengthSec = 2 * 24 * 60 * 60;
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '1/27-12:00',
                '1/27-16:00',
                '1/27-20:00',
                '1/28-0:00',
                '1/28-4:00',
                '1/28-8:00',
                '1/28-12:00',
                '1/28-16:00',
                '1/28-20:00',
                '1/29-0:00',
                '1/29-4:00',
                '1/29-8:00',
                '1/29-12:00',
                '1/29-16:00'     // 1/29/12 16:00:00 UTC
            ];
            var refOffset = 1327665600000;  // 1/27/12 12:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.FourHours);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(4 * 60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 4 hours
            t.assertEqual(1/4, markers.MarkerSubInterval, 'incorrect subinterval');    // 1 hour
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i], 'incorrect label');
            }
        },

        function testGet24HourMarkers5DayWindow(t) {
            var windowLengthSec = 5 * 24 * 60 * 60;
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '1/24',
                '1/25',
                '1/26',
                '1/27',
                '1/28',
                '1/29',
                '1/30'
            ];
            var refOffset = 1327363200000;  // 1/24/12 00:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.OneDay);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(24 * 60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 24 hours
            t.assertEqual(1/6, markers.MarkerSubInterval, 'incorrect subinterval');    // 6 hour
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i], 'incorrect label');
            }
        },

        function testGet2DayMarkers30DayWindow(t) {
            var windowLengthSec = 30 * 24 * 60 * 60;
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '12/30',
                '1/1',
                '1/3',
                '1/5',
                '1/7',
                '1/9',
                '1/11',
                '1/13',
                '1/15',
                '1/17',
                '1/19',
                '1/21',
                '1/23',
                '1/25',
                '1/27',
                '1/29',
                '1/31'
            ];
            var refOffset = 1325203200000;  // 12/30/11 00:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.TwoDays);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(48 * 60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 48 hours
            t.assertEqual(1 / 2, markers.MarkerSubInterval, 'incorrect subinterval');    // 1 day
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i], 'incorrect label');
            }
        },

        function testGet7DayMarkers91DayWindow(t) {
            var windowLengthSec = 91 * 24 * 60 * 60;
            var lastTimeStamp = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '10/30',
                '11/6',
                '11/13',
                '11/20',
                '11/27',
                '12/4',
                '12/11',
                '12/18',
                '12/25',
                '1/1',
                '1/8',
                '1/15',
                '1/22',
                '1/29',
                '2/5'
            ];
            var refOffset = 1319932800000;  // 10/30/11 00:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.SevenDays);
            var markers = sut.getMarkers(lastTimeStamp);
            t.assertEqual(7 * 24 * 60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 7 days
            t.assertEqual(1 / 7, markers.MarkerSubInterval, 'incorrect subinterval');    // 1 day
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i], 'incorrect label');
            }
        },

        function testGet7DayMarkers91DayWindow2Passes(t) {
            var windowLengthSec = 91 * 24 * 60 * 60;
            var lastTimeStamp1 = 1325376000000;  // 1/1/12 12:01:30 UTC, ms
            var lastTimeStamp2 = 1327838490000;  // 1/29/12 12:01:30 UTC, ms
            var refTimeScale = [
                '10/30',
                '11/6',
                '11/13',
                '11/20',
                '11/27',
                '12/4',
                '12/11',
                '12/18',
                '12/25',
                '1/1',
                '1/8',
                '1/15',
                '1/22',
                '1/29',
                '2/5'
            ];
            var refOffset = 1319932800000;  // 10/30/11 00:00 UTC, ms

            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.SevenDays);
            var markers1 = sut.getMarkers(lastTimeStamp1);
            var markers = sut.getMarkers(lastTimeStamp2);
            t.assertEqual(7 * 24 * 60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 7 days
            t.assertEqual(1 / 7, markers.MarkerSubInterval, 'incorrect subinterval');    // 1 day
            t.assertEqual(refOffset, markers.Offset, 'incorrect offset');
            for (var i = 0; i < refTimeScale.length; i++) {
                t.assertEqual(refTimeScale[i], markers.Labels[i], 'incorrect label');
            }
        },

        function testGetControlCase(t) {
            var windowLengthSec = 67500.00000000001;
            var sut = new ppcJs.bizLogic.movingWindow.TimeScale(windowLengthSec, ppcJs.bizLogic.movingWindow.enums.Interval.TwoHours);
            sut.setLocalTime(true);
            var markers = sut.getMarkers(1362413930000);    //  Monday, March 04, 2013 11:18:50 AM GMT-5
            t.assertEqual(2 * 60 * 60000, markers.MarkerInterval, 'incorrect interval');     // 2 hours
            var refOffset = 1362346500000;  // Sunday, March 03, 2013 4:35:00 PM
            t.assertTrue(refOffset > markers.Offset);

        }
    ]
);