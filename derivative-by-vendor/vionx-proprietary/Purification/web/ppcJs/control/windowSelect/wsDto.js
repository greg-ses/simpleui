// ~/control/windowSelect/wsDto
// data transfer objects for the WindowSelect control

define([], function () {
    return {
        State: function (/*Enum.WindowData*/window,
                        /*int, optional*/windowLengthSec,
                        /*int, ms since epoch, optional*/startTimeMs,
                        /*int, ms since epoch, optional*/endTimeMs,
                        /*Trigger, optional*/trigger) {
            this.window = window;
            this.windowLengthSec = windowLengthSec;
            this.startTime = startTimeMs;
            this.endTime = endTimeMs;
            this.trigger = trigger;
        },

        Trigger: function (/*int, ms since epoch*/time, /*int*/type, /*int*/value) {
            this.time = time;
            this.type = type;
            this.value = value;
        }
    };
});