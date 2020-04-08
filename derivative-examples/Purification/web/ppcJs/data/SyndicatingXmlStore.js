// ~/data/SyndicatingXmlStore
// Caching and Syndicating version of XmlStore
//  -   appends results of each ajax request to results set; call close() to clear results set.
//  -   returns result from cached data without ajax refresh if request contains either
//      (a) noFetch or (b) isRender is not true
//      to facilitate dynamic queries (search while typing)
// configure maxItems in constructor options object

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom-construct',
        'dojox/data/XmlStore', 'dojox/xml/parser'],
function (declare, lang, array, construct,
        XmlStore, parser) {
    return declare([XmlStore],
    {
        // constructor parameters
        urlUpdater: '',    // optional function ref passed in construction: string function(/*XmlItem[]*items/) to return new URL
        maxItems: 100,  // default max entries in FIFO list

        // private variables
        _cachedDoc: '',
        _cachedDocXmlStr: '<log></log>',

        constructor: function (/* object */args) {
            this.inherited(arguments);
            if (args) {
                this.maxItems = args.maxItems;
                this.urlUpdater = args.urlUpdater;
            }

            this._cachedDoc = parser.parse(this._cachedDocXmlStr);
        },

        _fetchItems: function (request, fetchHandler, errorHandler) {
            //	summary:
            //		Fetch items (XML elements) that match to a query, query _cachedDoc when request.isRender undefined
            //      (on mouse event triggered instead of via fetch call)
            //	description:
            //		If 'sendQuery' is true, an XML document is loaded from
            //		'url' with a query string.
            //		Otherwise, an XML document is loaded and list XML elements that
            //		match to a query (set of element names and their text attribute
            //		values that the items to contain).
            //		A wildcard, "*" can be used to query values to match all
            //		occurrences.
            //		If 'rootItem' is specified, it is used to fetch items.
            //	request:
            //		A request object
            //	fetchHandler:
            //		A function to call for fetched items
            //	errorHandler:
            //		A function to call on error
            var url = this._getFetchUrl(request);

            if (!url) {
                errorHandler(new Error('No URL specified.'));
                return;
            }
            var localRequest = (!this.sendQuery ? request : {}); // use request for _getItems()

            var self = this;
            var getArgs = {
                url: url,
                handleAs: 'xml',
                preventCache: self.urlPreventCache
            };

            if (request.isRender && !request.noFetch) {
                var getHandler = dojo.xhrGet(getArgs);
                getHandler.addCallback(function (data) {
                    // update cache with new data
                    var items = self._getItems(data, localRequest);
                    if (items && items.length > 0) {
                        self._cacheItems(items);
                    }

                    var doc = self._cloneCachedDoc();
                    var items = self._getItems(doc, localRequest);
                    if (items && items.length > 0) {
                        fetchHandler(items, request);
                    } else {
                        fetchHandler([], request);
                    }
                });
                getHandler.addErrback(function (data) {
                    errorHandler(data, request);
                });
            }
            else {
                var doc = self._cloneCachedDoc();
                var items = self._getItems(doc, localRequest);
                if (items && items.length > 0) {
                    fetchHandler(items, request);
                } else {
                    fetchHandler([], request);
                }
            }
        },

        // appends items from list into cached xml document and trims to maxItems
        _cacheItems: function (/*XmlItem[]*/items) {
            var rootNode = this._cachedDoc.documentElement;
            array.forEach(items, function (item) {
                construct.place(item.element, rootNode);
            }, this);

            var excessItems = rootNode.childNodes.length - this.maxItems;
            if (excessItems > 0) {
                for (i = 0; i < excessItems; i++) {
                    construct.destroy(rootNode.childNodes[i]);
                }
            }

            // apply any per-request changes to the URL
            if (this.urlUpdater) {
                this.url = this.urlUpdater(items);
            }
        },

        // workaround for lang.clone() bug (doesn't work on document object)
        _cloneCachedDoc: function () {
            var cacheCopy = parser.parse(this._cachedDocXmlStr);
            var copyRoot = cacheCopy.documentElement;
            var rootNode = this._cachedDoc.documentElement;

            array.forEach(rootNode.childNodes, function (child) {
                construct.place(lang.clone(child), copyRoot);
            }, this);

            return cacheCopy;
        },

        close: function (/*dojo.data.api.Request || keywordArgs || null */request) {
            // summary: 
            // Over-ridden close function to clear cache of items so next 
            // store fetch call will requery the server. 
            delete this._cachedDoc;
        }
    });
}); 