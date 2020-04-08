// ~/panel/_WatchdogPanel
// Panel base class that manages care and feeding of a Watchdog

// Pub/sub list:
// [pub] ppcJs.PubSub.timeUpdate
// [pub] ppcJs.PubSub.commTimeout

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/topic',
        './_StorePanel', '../PubSub', '../bizLogic/generic/Watchdog'],
function (declare, lang, topic,
        _StorePanel, PubSub, Watchdog) {
    return declare([_StorePanel],
    {
        // ajax response tags
        _timeStampTag: 'timeStamp',

        // private class variables
        _watchdog: '',

        // lifecycle methods
        postCreate: function () {
            this.inherited(arguments);
            var timeout = 2 * this._refreshInterval;
            this._watchdog = new Watchdog(timeout);
            this._watchdog.timeoutEvent = lang.hitch(this, this._onTimeout);
        },

        // public methods
        load: function (baseUrl, /*optional*/resourceId) {
            this.inherited(arguments);
            this._watchdog.resume();
        },

        unload: function () {
            this.inherited(arguments);
            this._watchdog.pause();
        },

        // standard protected callbacks
        onFetchTemplate: function (/*Object*/items, request) {
            this.inherited(arguments);
            this._watchdog.kick();
        },

        onFetchData: function (/*Object*/items, request) {
            this.inherited(arguments);
            
            var timestampMs = parseInt(items[this._timeStampTag]);
            if (!timestampMs || isNaN(timestampMs)) {
                var date = new Date();
            }
            else {
                var date = new Date(timestampMs);
            }

            var timestamp = date.getTime();
            topic.publish(PubSub.timeUpdate, timestamp, this.name);
            this._watchdog.kick();
        },

        // private callbacks
        _onTimeout: function () {
            topic.publish(PubSub.commTimeout, this.name);
        }
    });
});