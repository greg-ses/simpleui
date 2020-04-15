// ~/bizLogic/generic/Watchdog
// general business logic class: watchdog timer

define(['dojo/_base/declare', 'dojo/_base/lang'],
function (declare, lang) {
    return declare(null,
    {
        _interval: '',
        _watchdogId: '',
        _kicked: false,

        // public methods
        constructor: function (/*int, ms*/interval) {
            this._interval = interval;
            this._startTimer();
        },

        kick: function () {
            this._kicked = true;
        },

        pause: function () {
            clearInterval(this._watchdogId);
        },

        resume: function () {
            if (!this._watchdogId) {
                this._startTimer();
            }
        },

        // usage: aspect.after(this._watchdog, 'timeoutEvent', lang.hitch(this, this._onTimeout));
        timeoutEvent: function () {
        },


        // private methods
        _startTimer: function () {
            this._watchdogId = setInterval(lang.hitch(this, this._timeoutEvent), this._interval);
        },

        _timeoutEvent: function () {
            if (!this._kicked) {
                this.timeoutEvent();
            }
            else {
                this._kicked = false;
            }
        }
    });
});