// Caching version of XmlStore caches xml response; call close() to clear cache.

dojo.provide("ppcJs.data.CachingXmlStore");

dojo.require("dojox.data.XmlStore");
dojo.require("dojox.xml.parser");

dojo.declare("ppcJs.data.CachingXmlStore", [dojox.data.XmlStore],
{
    _fetchItems: function (request, fetchHandler, errorHandler) {
        //	summary:
        //		Fetch items (XML elements) that match to a query
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
            errorHandler(new Error("No URL specified."), request);
            return;
        }
        var localRequest = (!this.sendQuery ? request : {}); // use request for _getItems() 
        var self = this;
        var getArgs = {
            url: url,
            handleAs: "xml",
            preventCache: self.urlPreventCache
        };
        if (!this._xmlData) {
            // Nothing cached yet, fetch it. 
            var getHandler = dojo.xhrGet(getArgs);
            getHandler.addCallback(function (data) {
                // Cache data
                this._xmlData = data;
 
                var items = self._getItems(this._xmlData, localRequest);
                if (items && items.length > 0) {
                    fetchHandler(items, request);
                } else {
                    fetchHandler([], request);
                }
            });
            getHandler.addErrback(function (data) {
                errorHandler(data, request);
            });
        } else {
            // run the handlers on cached xml document. 
            var items = self._getItems(this._xmlData, localRequest);
            if (this._items && this._items.length > 0) {
                fetchHandler(this._items, request);
            } else {
                fetchHandler([], request);
            }
        }
    },

    close: function (/*dojo.data.api.Request || keywordArgs || null */request) {
        // summary: 
        // Over-ridden close function to clear our cache of items so next 
        // store fetch call will requery the server. 
        delete this._xmlData;
    }
}); 