// ~/mixin/_QueueClient
// CallQueue wrapper behavior: client only needs to call _queueCall to asynchronously queue a function call
// also provides basic temporary inhibit behavior

define(['dojo/_base/declare', '../bizLogic/generic/CallQueue'],
function (declare, CallQueue) {
    return declare(null,
    {
        _asyncSemaphore: false, // true = processing async event
        _queueDelayMs: 500,
        _inhibitUpdate: false,  // true= inhibits updating

        _getSemaphore: function () {
            return this._asyncSemaphore;
        },

        _setSemaphore: function (newValue) {
            this._asyncSemaphore = newValue;
        },

        // queues call, usage example: this._queueCall(this._onBlur, null, true);
        _queueCall: function (method, /*obj[]*/args, /*optional, bool, to always trigger delay*/setSemaphore, /*optional, object ref*/context) {
            if (setSemaphore) {
                this._setSemaphore(true);
            }

            return new CallQueue(this, this._getSemaphore, this._setSemaphore, context, this._queueDelayMs).push(method, args);
        },

        // sets _inhibitUpdate and clears after _queueDelayMs
        _setDebounce: function () {
            this._inhibitUpdate = true;
            this._queueCall(function () {
                this._inhibitUpdate = false;
            },
            null, true);
        }
    });
});