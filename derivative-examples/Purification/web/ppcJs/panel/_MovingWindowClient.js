// ~/panel/_MovingWindowClient
// mixin class for moving window clients making AJAX calls: handles common boiler-plate

define(['dojo/_base/declare', 'dojo/_base/lang', './_MovingWindow'],
function (declare, lang, _MovingWindow) {
    return declare([_MovingWindow],
    {
        // private class variables
        _maxDataPoints: 1000,    // optimized for typical chart width in 800-1000px range
        _resourceIdObj: '',
        _queryObject: '',
        _testUrl: '',


        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);
            this._resourceIdObj = { ID: resourceId };
        },

        setMaxDataPoints: function (/*int*/maxPoints) {
            if (!isNaN(maxPoints)) {
                this._maxDataPoints = parseInt(maxPoints);
            }
        },

        // protected methods
        _initStore: function (testUrl, queryObj, rootTag, handler, /*optional store config*/optionsObj) {
            this._testUrl = testUrl;
            this.inherited(arguments);
        },

        // assembles boiler-plate moving window data request query object
        _setDataQueryObj: function (windowMs, lastId, customQueryObj) {
            if (this._isMovingWindow()) {
                var rtWindowQueryObject = { BEGIN: -windowMs, END: 0 };
            }
            else {
                var rtWindowQueryObject = this._getRtWindowQueryObject(windowMs);
            }

            this._queryObject = { MAXNUMPTS: this._maxDataPoints, LASTID: lastId };
            lang.mixin(this._queryObject, this._resourceIdObj);
            lang.mixin(this._queryObject, rtWindowQueryObject);
            if (customQueryObj) {
                lang.mixin(this._queryObject, customQueryObj);
            }
        },

        _getRtWindowQueryObject: function (windowMs)
        {
            var startTimeMs = this._startTime.getTime();
            var endTimeMs = startTimeMs + windowMs;
            return { BEGIN: startTimeMs, END: endTimeMs };
        },

        _getDataUrl: function (windowMs, lastId, customQueryObj, /*string*/testUrl) {
            this._testUrl = testUrl;
            if (this._isMovingWindow()) {
                var rtWindowQueryObject = { BEGIN: -windowMs, END: 0 };
            }
            else {
                var startTimeMs = this._startTime.getTime();
                var endTimeMs = startTimeMs + windowMs;
                var rtWindowQueryObject = { BEGIN: startTimeMs, END: endTimeMs };
            }

            this._queryObject = { MAXNUMPTS: this._maxDataPoints, LASTID: lastId };
            lang.mixin(this._queryObject, this._resourceIdObj);
            lang.mixin(this._queryObject, rtWindowQueryObject);
            lang.mixin(this._queryObject, customQueryObj);

            var fullUrl = this.puS.getFullUrl(this._urlInfo, this._queryObject, this._testUrl);
            return fullUrl;
        },

        _updateRTDataUrl: function (lastId) {
            this._queryObject.LASTID = lastId;

            var fullUrl = this.puS.getFullUrl(this._urlInfo, this._queryObject, this._testUrl);
            return fullUrl;
        }
    });
});