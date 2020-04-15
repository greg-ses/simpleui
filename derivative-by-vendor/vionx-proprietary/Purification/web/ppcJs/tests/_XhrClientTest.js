// test suite for /mixin/_XhrClient
// for timeout = 1.0 sec

dojo.provide('ppcJs.tests._XhrClientTest');
dojo.require('ppcJs.mixin._XhrClient');

doh.register('ppcJs.tests._XhrClientTest',
    [
        function testInhibitRequestsBeforeTimeoutIfNoResponse(t) {
            var sut = new ppcJs.mixin._XhrClient();
            sut._urlInfo = ['../invalid.html', 'testServerProcess'];

            var xhrArgs1 = sut.xhrGet({ COMMAND: 'test1' });
            t.assertTrue(xhrArgs1, 'no xhrArgs');
            if (!xhrArgs1) {
                t.assertTrue(false, 'no xhrArgs1');
            }

            sut._cancelBlockOn4xx = false;
            var deferred = new t.Deferred();
            setTimeout(deferred.getTestCallback(function () {
                var xhrArgs2 = sut.xhrGet({ COMMAND: 'test2' });
                if (xhrArgs2) {
                    t.assertTrue(false, 'xhrArgs2 exists but should not');
                }
            }), 500);

            return deferred;
        },

        {
            name: 'EnableRequestsAfterTimeoutIfNoResponse',

            setUp: function () {
                this.sut = new ppcJs.mixin._XhrClient();
                this.sut._urlInfo = ['../invalid.html', 'testServerProcess'];
            },

            runTest: function () {
                var xhrArgs1 = this.sut.xhrGet({ COMMAND: 'test1' });
                doh.assertTrue(xhrArgs1, 'no xhrArgs');
                if (!xhrArgs1) {
                    doh.assertTrue(false, 'no xhrArgs1');
                }

                this.sut._cancelBlockOn4xx = false;
                var deferred = new doh.Deferred();
                setTimeout(deferred.getTestCallback(function () {
                    var xhrArgs2 = this.sut.xhrGet({ COMMAND: 'test2' });
                    if (!xhrArgs2) {
                        doh.assertTrue(false, 'no xhrArgs2 after timeout');
                    }
                }, this), 1500);

                return deferred;
            },

            tearDown: function () {
            },

            timeout: 3000
        }
    ]
);