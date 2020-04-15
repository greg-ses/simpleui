dojo.provide('ppcJs.tests.DateStringUtilityTest');
dojo.require('ppcJs.utilities.DateString');

doh.register('ppcJs.tests.DateStringUtilityTest',
    [
        function testTimeZone(t) {
            t.assertTrue(ppcJs.utilities.DateString.isLocalZoneAfterUtc());
        },

        function testPrettyPrintTimespan(t) {
            var timespanSec = 3661;
            t.assertEqual('01:01:01', ppcJs.utilities.DateString.prettyPrintTimespan(timespanSec));
        },

        function testToDateTime(t) {
            var timeStampMs = 1365525631000;    // Tuesday, April 09, 2013 12:40:31 PM GMT-4
            t.assertEqual('12:40:31 PM 4/9/2013', ppcJs.utilities.DateString.toDateTime(timeStampMs));
        }
    ]
);