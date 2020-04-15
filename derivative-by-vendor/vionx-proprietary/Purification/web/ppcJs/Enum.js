// ~/Enum
// standard enums

define([], function () {
    return {
        WindowData: {
            Moving: 0,
            Fixed: 1
        },

        Error: {
            None: 0,
            Warn: 1,
            Fault: 2
        },

        Soc: {
            Discharged: 0,
            Low: 1,
            Normal: 2
        },

        TriggerType: {
            I: 0,
            V: 1,
            W: 2
        },

        ViewState: {
            Edit: false,
            View: true
        },

        AccessRight: {
            ReadOnly: false,
            ReadWrite: true
        },

        PlayBackState: {
            Stopped: 0,
            Paused: 1,
            Running: 2
        },

        ValueType: {
            Integer: 0,
            Float: 1,
            TimeStamp: 2
        }
    };
});