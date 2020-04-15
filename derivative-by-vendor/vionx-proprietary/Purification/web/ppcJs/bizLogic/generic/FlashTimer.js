// ~/bizLogic/generic/FlashTimer
// general business logic class: flashes text green for a period of time (_flashTimeMs)
// Note: requires external linking to ~/ppcJs/bizLogic/generic/flashTimer/css/flashTimer.css

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-class', 'dojox/timing'],
function (declare, lang, domClass, timing) {
    return declare(null, 
    {
        // constants
        _flashTimeMs: 600,

        // private variables
        _node: '',
        _timeFlasher: '',

        // css classes
        _cssUpdatedText: 'flashTimerUpdated',
        _cssFaultText: 'flashTimerFault',

        // public methods
        constructor: function (node) {
            this._node = node;
            this._timeFlasher = new timing.Timer(this._flashTimeMs);
            this._timeFlasher.onTick = lang.hitch(this, this._onTimeFlash);
        },

        flash: function () {
            domClass.replace(this._node, this._cssUpdatedText, this._cssFaultText);
            this._timeFlasher.start();
        },

        setFault: function () {
            domClass.replace(this._node, this._cssFaultText, this._cssUpdatedText);
        },


        // callbacks
        _onTimeFlash: function () {
            domClass.remove(this._node, this._cssUpdatedText);
            if (this._timeFlasher) {
                this._timeFlasher.stop();
            }
        }
    });
});