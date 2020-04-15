dojo.provide('ppcJs.tests.WatchdogTest');

dojo.require('ppcJs.bizLogic.generic.Watchdog');

doh.register('ppcJs.tests.WatchdogTest',
    [
        function testWatchdogKicked(t) {
            var eventFired = false;
            var intervalMs = 100;
            var sut = new ppcJs.bizLogic.generic.Watchdog(intervalMs);
            dojo.connect(sut, 'timeoutEvent', function (evt) {
                eventFired = true;
                sut.pause();
            });

            setTimeout(function () { sut.kick(); }, 75);

            // quit test before watchdog times out again
            var deferred = new doh.Deferred();
            setTimeout(deferred.getTestCallback(function () {
                doh.assertFalse(eventFired);
                sut.pause();
            }), 125);
            return deferred;
        },

        function testWatchdogNotKicked(t) {
            var eventFired = false;
            var intervalMs = 100;
            var sut = new ppcJs.bizLogic.generic.Watchdog(intervalMs);
            dojo.connect(sut, 'timeoutEvent', function (evt) {
                eventFired = true;
            });

            var deferred = new doh.Deferred();
            setTimeout(deferred.getTestCallback(function () {
                doh.assertTrue(eventFired);
                sut.pause();
            }), 200);
            return deferred;
        }
    ]
);