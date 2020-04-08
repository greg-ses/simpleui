// ~/utilities/AccessControl
// static utilities to support access control

define([], function () {
    return {
        // task descriptions used in enumerating access the user has been authorized for
        Task: {
            GeneralView: 0,
            SystemControl: 1,
            ComponentControl: 2
        },

        // returns true if task is among userAuths
        isAuthorized: function (/*Task*/task, /*Task[]*/userAuths) {
            for (var i = 0; i < userAuths.length; i++) {
                if (task === userAuths[i]) {
                    return true;
                }
            }

            return false;
        }
    };
});