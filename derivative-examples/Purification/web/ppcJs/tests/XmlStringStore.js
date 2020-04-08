
// test xml store that takes string instead of url

dojo.provide("ppcJs.tests.XmlStringStore");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.xml.parser");

dojo.declare("ppcJs.tests.XmlStringStore", [dojox.data.XmlStore], {
    constructor: function (args) {
        this.inherited("constructor", arguments);

        this.xmlstring = args.xmlstring;
        this.url = "dummy.xml";
    },
    _fetchItems: function (request, fetchHandler, errorHandler) {
        var url = this._getFetchUrl(request);

        if (!url) {
            errorHandler(new Error("No URL specified."));
            return;
        }
        var localRequest = (!this.sendQuery ? request : {});
        var data = dojox.xml.parser.parse(this.xmlstring);
        var items = this._getItems(data, localRequest);

        if (items && items.length > 0) {
            fetchHandler(items, request);
        } else {
            fetchHandler([], request);
        }
    }
});