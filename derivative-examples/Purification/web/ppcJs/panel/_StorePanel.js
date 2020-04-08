// ~/panel/_StorePanel
// Base mixin class for a parent Panel using JsonRest object stores. A parent Panel represents a collection
// of REST resources (a parent in the REST resource hierarchy) and therefore the resourceId, if any, passed to the Panel on load() is embedded in the base URL.
// This simplifies parent level requests (GET collection or child resource) but disallows PUT and DELETE of the resource collection
// represented by the Panel.

// provides:
// - default Panel API implementation
// - common store methods and AJAX comm fault handling
// - lifecycle management of common variables, tooltips
// - basePanel css class names (derived class css must import basePanel.css)
// - REST resource/test file pairs can be defined in parent html (restResources, for configurable panels) or in constructor (_restResources)
//      ex: this._restResources = [{name: 'resource1', testFile: 'testFile1'}, {name: 'resource2', testFile: ''}]; where
//          'testFile1' is the file name/path from ~/web/Server (ex: 'ppcJs/tests/readBatteriesData.json')

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojox/collections/Dictionary',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
         '../mixin/_StoreContainer', '../mixin/_ChildEventHandler', '../mixin/_ToolTipClient', '../utilities/BasePanel'],
function (declare, lang, array, Dictionary,
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
        _StoreContainer, _ChildEventHandler, _ToolTipClient, BasePanel) {
    return declare([_StoreContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ChildEventHandler, _ToolTipClient],
    {
        // aliases
        puB: BasePanel,

        // public variables - declare in html
        restResources: null,

        // protected variables
        _restResources: null,    // declare in derived constructor 
        _toolTips: null,

        _refreshInterval: 2000, // AJAX requery interval, ms
        _refreshIntervalId: '',

        // private variables
        _isLoaded: false,
        _baseUrl: '',       // endpoint set by parent page
        _url: '',           // endpoint containing resourceId

        // dijit variables
        widgetsInTemplate: true,

        // lifecycle methods
        // called after _StoreContainer to override setting of _restResourceMap
        constructor: function () {
            this._restResourceMap = new Dictionary();
        },

        // public default Panel API implementations
        load: function (baseUrl, /*optional*/resourceId) {
            if (!this._isLoaded) {
                this._initializeHandlerList();

                this._baseUrl = baseUrl + '/';
                this._url = (resourceId) ? this._baseUrl + resourceId + '/' : this._baseUrl;

                this._initializeToolTips();
                var resourceList = this.restResources ? this.restResources : this._restResources;
                this._createResourceMapFromList(resourceList, this._restResourceMap);

                this._isLoaded = true;
            }
        },

        unload: function () {
            if (this._isLoaded) {
                this._removeHandlers();
                this._clearRefresh();
                this._restResourceMap.clear();
                this._clearToolTips();
                this._isLoaded = false;
            }
        },

        // protected methods
        // creates and maps JSON stores
        _createResourceMapFromList: function (/*{ name:, testFile:}[]*/resourceList, /*Dictionary*/resourceMap) {
            array.forEach(resourceList, function (restResource) {
                var observableStore = this._createStore(restResource);
                resourceMap.add(restResource.name, observableStore);
            }, this);
        },

        _createStore: function (/*{name:, testFile: }*/restResource) {
            var url = this._url + restResource.name + '/';
            return this._createStoreFromUrl(restResource, url);
        },

        // start recurring AJAX queries
        _initiateDataRequests: function () {
            this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchData), this._refreshInterval);
        },

        _refetchData: function () {
            // derived Panels using refresh should override this
        },


        // private methods
        _clearRefresh: function () {
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                this._refreshIntervalId = '';
            }
        }
    });
});