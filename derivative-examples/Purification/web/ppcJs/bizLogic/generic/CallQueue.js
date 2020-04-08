// ~/bizLogic/generic/CallQueue
// general business logic class: method call queuer:
// - calls passed method and args asynchronously after fixed delay if semaphoreGetter returns true
// - calls passed method and args synchronously if semaphoreGetter returns false
// - used particularly for post-render actions (ex: do something after collapsing a widget), debouncing

define(['dojo/_base/declare', 'dojo/Deferred', 'dojo/_base/lang'],
function (declare, Deferred, lang) {
    return declare(null,
    {
        _delayMs: 500,
        _context: null,
        _callTarget: null,
        _semaphoreGetter: null, // returns true if processing another async event
        _semaphoreSetter: null,

        // usage examples: 
        //  - new CallQueue(this, this.semaphoreGetter, this._setSemaphore).push(this.aMethod, arguments);
        //  - new CallQueue(this, this.semaphoreGetter, this._setSemaphore, childObj, this._queueDelayMs).push(childObj.someMethod, arguments);
        constructor: function (context,
                            /*returns bool*/semaphoreGetter,
                            /*function(bool)*/semaphoreSetter,
                            /*optional, call target if different from this._context*/callContext, 
                            /*optional, ms*/delayMs) {
            this._context = context;
            this._callTarget = (callContext) ? callContext : this._context;
            this._semaphoreGetter = lang.hitch(this._context, semaphoreGetter);
            this._semaphoreSetter = lang.hitch(this._context, semaphoreSetter);
            if (delayMs) {
                this._delayMs = delayMs;
            }
        },

        // returns Promise
        push: function (method, /*obj[]*/args) {
            var methodWrapper = function (argArray) {
                this._semaphoreSetter(true);
                var queuedMethod = lang.hitch(this._callTarget, method);
                queuedMethod(argArray);
                this._semaphoreSetter(false);
            };

            var deferred = new Deferred();
            deferred.then(lang.hitch(this, methodWrapper));

            if (this._semaphoreGetter()) {
                setTimeout(lang.hitch(this, function () {
                    deferred.resolve(args);
                }), this._delayMs);
            }
            else {
                deferred.resolve(args);
            }

            return deferred.promise;
        }
    });
});