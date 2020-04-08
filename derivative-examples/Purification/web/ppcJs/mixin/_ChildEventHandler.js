// ~/mixin/_ChildEventHandler
// mixin for maintaining a list of handler bindings for child object events

define(['dojo/_base/declare', 'dojo/_base/array'],
function (declare, array) {
    return declare(null,
    {
        _handlerList: null,   // array of .on and aspect handles

        _initializeHandlerList: function () {
            if (!this._handlerList) {
                this._handlerList = new Array();
            }
        },

        // flush event handlers
        _removeHandlers: function () {
            array.forEach(this._handlerList, function (handler) {
                handler.remove();
            });
            this._handlerList.length = 0;
        }
    });
});