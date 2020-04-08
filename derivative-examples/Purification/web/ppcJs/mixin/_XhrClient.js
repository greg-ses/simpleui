// ~/mixin/_XhrClient
// general xhr support with public/private urlInfo field patch

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/request', 'dojo/io-query', 'dojo/topic', 'dojox/string/Builder', 'dojox/timing',
        '../PubSub', '../utilities/Identity'],
function (declare, lang, request, ioQuery, topic, Builder, timing,
        PubSub, Identity) {
    return declare(null,
    {
        // private enums and variables
        _httpVerbType: {
            Delete: 0,
            Get: 1,
            Post: 2,
            Put: 3
        },

        _urlInfo: null,
        _sequentialXhrRequests: true,  // true = sequential XHR requests only, false = allow parallel XHR requests
        _requestPending: false,
        _blockTimer: null,      // times request blocking period after an XHR request
        _blockTimeMs: 1000,
        _cancelBlockOn4xx: true,    // if false, request block continues after 4xx response until timeout

        // lifecycle methods
        constructor: function () {
            this._blockTimer = new timing.Timer(this._blockTimeMs);
            this._blockTimer.onTick = lang.hitch(this, this._onBlockTimeout);
        },

        // protected methods
        xhrDelete: function (/*optional*/queryObject, /*optional*/handleError, /*optional*/handleLoad, /*optional*/endpoint) {
            return this._xhr(this._httpVerbType.Delete, queryObject, handleError, handleLoad, endpoint);
        },

        xhrGet: function (/*optional*/queryObject, /*optional*/handleError, /*optional*/handleLoad, /*optional*/endpoint) {
            return this._xhr(this._httpVerbType.Get, queryObject, handleError, handleLoad, endpoint);
        },

        xhrPost: function (/*optional*/queryObject, /*optional*/handleError, /*optional*/handleLoad, /*optional*/endpoint, /*optional*/data) {
            return this._xhr(this._httpVerbType.Post, queryObject, handleError, handleLoad, endpoint, data);
        },

        xhrPut: function (/*optional*/queryObject, /*optional*/handleError, /*optional*/handleLoad, /*optional*/endpoint, /*optional*/data) {
            return this._xhr(this._httpVerbType.Put, queryObject, handleError, handleLoad, endpoint, data);
        },


        // private methods
        _xhr: function (/*_httpVerbType*/verb, /*optional*/queryObject, /*optional*/handleError, /*optional*/handleLoad, /*optional*/endpoint, /*optional*/data) {
            var allowRequest = !(this._sequentialXhrRequests && this._requestPending);
            if (allowRequest) {
                var url = this._getUrl(endpoint);
                var xhrArgs = { handleAs: 'xml' };

                if (queryObject) {
                    var embedQueryInUrl = (verb == this._httpVerbType.Post) || (verb == this._httpVerbType.Put);
                    if (embedQueryInUrl) {
                        lang.mixin(queryObject, { CGI: this._urlInfo[1] });
                        var queryStr = ioQuery.objectToQuery(queryObject);
                        url.append('?');
                        url.append(queryStr);
                    }
                    else {
                        lang.mixin(queryObject, { CGI: this._urlInfo[1] });
                        lang.mixin(xhrArgs, { query: queryObject });
                    }
                }

                var loadHandler = handleLoad ? lang.hitch(this, handleLoad) : lang.hitch(this, this._handleXhrLoad);
                var errHandler = handleError ? lang.hitch(this, handleError) : lang.hitch(this, this._handleXhrError);
                var urlStr = url.toString();
                switch (verb) {
                    case (this._httpVerbType.Get):
                        lang.mixin(xhrArgs, { preventCache: true });
                        request.get(urlStr, xhrArgs).then(loadHandler, errHandler);
                        break;

                    case (this._httpVerbType.Post):
                        if (data) {
                            lang.mixin(xhrArgs, { data: data });
                        }
                        request.post(urlStr, xhrArgs).then(loadHandler, errHandler);
                        break;

                    case (this._httpVerbType.Put):
                        if (data) {
                            lang.mixin(xhrArgs, { data: data });
                        }
                        request.put(urlStr, xhrArgs).then(loadHandler, errHandler);
                        break;

                    case (this._httpVerbType.Delete):
                        request.del(urlStr, xhrArgs).then(loadHandler, errHandler);
                        break;

                    default:
                        break;
                }

                this._startBlockingRequests();
                return xhrArgs;
            }
            else {
                this._handleXhrError('sent request while previous requesting pending');
            }
        },

        // returns dojox/string/Builder containing url to endpoint
        _getUrl: function (/*optional, string*/endpoint) {
            if (!this._urlInfo) {
                this._urlInfo = this.urlInfo;
            }
            var url = new Builder(this._urlInfo[0]);

            if (Identity.isString(endpoint)) {
                url.append('/');
                url.append(endpoint);
            }

            return url;
        },

        _startBlockingRequests: function () {
            if (this._sequentialXhrRequests) {
                this._blockTimer.start();
                this._requestPending = true;
            }
        },

        _stopBlockingRequests: function () {
            if (this._sequentialXhrRequests) {
                this._blockTimer.stop();
                this._requestPending = false;
            }
        },

        // callbacks

        // default 2xx ajax response handler
        _handleXhrLoad: function (response, ioArgs) {
            this._stopBlockingRequests();
            return response;
        },

        // default 4xx ajax response handler
        _handleXhrError: function (response, ioArgs) {
            if (this._cancelBlockOn4xx) {
                this._stopBlockingRequests();
            }
            console.log(this.name + ': Request to server failed: no action taken', response, ioArgs);
            topic.publish(PubSub.commFault, this.name);
            return response;
        },

        _onBlockTimeout: function () {
            this._stopBlockingRequests();
        }
    });
});