dojo.provide('ppcJs.tests.AccessControlTest');
dojo.require('ppcJs.utilities.AccessControl');

doh.register('ppcJs.tests.AccessControlTest',
    [
        function testIsAuthorized(t) {
            var userAuths = [ppcJs.utilities.AccessControl.Task.GeneralView, ppcJs.utilities.AccessControl.Task.SystemControl];
            var auth = ppcJs.utilities.AccessControl.isAuthorized(ppcJs.utilities.AccessControl.Task.SystemControl, userAuths);

            t.assertTrue(auth);
        },

        function testIsNotAuthorized(t) {
            var userAuths = [ppcJs.utilities.AccessControl.Task.GeneralView];
            var auth = ppcJs.utilities.AccessControl.isAuthorized(ppcJs.utilities.AccessControl.Task.SystemControl, userAuths);

            t.assertFalse(auth);
        }
    ]
);