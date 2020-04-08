// ~/panel/_Panel
// base mixin class for Panels. provides
// - default API implementation
// - common store methods and AJAX comm fault handling
// - lifecycle management of common variables, tooltips
// - basePanel css class names (derived class css must import basePanel.css)

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/topic',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dojox/data/XmlStore',
         '../PubSub', '../mixin/_ToolTipClient', '../mixin/_XhrClient', '../utilities/BasePanel', '../utilities/Store'],
function (declare, lang, array, topic,
        _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, XmlStore,
        PubSub, _ToolTipClient, _XhrClient, BasePanel, Store) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ToolTipClient, _XhrClient],
    {
        // aliases
        puS: Store,
        puB: BasePanel,

        // protected class variables
        _isLoaded: false,
        _queryId: '',
        _urlInfo: '',
        _fullUrl: '',
        _xmlStore: null,
        _handlerList: null,   // array of .on handles
        _toolTips: null,
        _xmlString: '',

        // dijit variables
        widgetsInTemplate: true,

        // default Panel API implementations
        load: function (urlVal, resourceId, serverProcess) {
            if (!this._isLoaded) {
                if (!this._handlerList) {
                    this._handlerList = new Array();
                }

                this._initializeToolTips();

                this._queryId = resourceId;
                this._urlInfo = Store.getUrlInfo(urlVal, serverProcess);
                this._isLoaded = true;
            }
        },

        unload: function () {
            if (this._isLoaded) {
                delete this._xmlStore;

                // flush event handlers
                array.forEach(this._handlerList, function (handler) {
                    handler.remove();
                });
                this._handlerList.length = 0;

                this._clearToolTips();
                this._isLoaded = false;
            }
        },

        // protected methods
        _initStore: function (testUrl, queryObj, rootTag, handler, /*optional store config*/optionsObj) {
            if (this._xmlStore) {
                delete this._xmlStore;
            }

            this._fullUrl = Store.getFullUrl(this._urlInfo, queryObj, testUrl);
            var configObj = { url: this._fullUrl, rootItem: rootTag };
            lang.mixin(configObj, optionsObj);
            this._xmlStore = new XmlStore(configObj);

            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, handler) });
        },

        // callback aspects
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            if (items.length == 0) {
                topic.publish(PubSub.commFault, this.name);
                return;
            }
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            if (items.length == 0) {
                topic.publish(PubSub.commFault, this.name);
                return;
            }
        }
    });
});