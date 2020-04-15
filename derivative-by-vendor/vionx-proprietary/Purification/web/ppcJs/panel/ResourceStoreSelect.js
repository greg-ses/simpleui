// ~/panel/ResourceSelect
// stripped down resource selector using common AutoCycleCmd resource list API
// Responsibilities:
//  - get resource list
//
// Pub/sub list:
// [pub] ppcJs.PubSub.selectResource

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom', 'dojo/dom-class', 'dojo/query', 'dojo/aspect', 'dojo/topic', 'dojo/on',
         'dijit/registry', 'dojox/collections/Dictionary', 'dojox/xml/parser', 'dijit/form/Select',
        '../Enum', '../PubSub', '../utilities/Compatibility',
        './_StorePanel', 'dojo/text!./resourceSelect/template/resourceSelect.html'],
function (declare, lang, array, dom, domClass, query, aspect, topic, on,
        registry, Dictionary, parser, Select,
        Enum, PubSub, Compatibility,
        _StorePanel, template) {
    return declare([_StorePanel],
    {
        // ajax request command constants
        _resourceListCmd: { GET: 'RESOURCE_SELECT_LIST' },

        // resource names
        _templateResource: 'template',

        // ajax response tags
        _rootTemplateTag: 'scriptResources',
        _resourceNameTag: 'resourceName',
        _resourceIdTag: 'resourceId',

        // private class variables
        _currentResourceId: '',

        // dijit variables
        name: 'Resource Selector',
        templateString: template,
        baseClass: 'resourceSelect',

        // lifecycle methods
        constructor: function () {
            this.inherited(arguments);
//            this._resourceIdMap = new Dictionary();  TODO: Reomve, if not required.
//            this._refreshInterval = 2000;
//            this._queueDelayMs = 2000;
            this._restResources = [ { name: this._templateResource, testFile: '../../ppcJs/tests/bmResourcesResponse.json' }];
        },

        // public methods
        load: function (baseUrl, /*optional*/resourceId) {
            this.inherited(arguments);
            this._currentResourceId = resourceId;
            this._fetchTemplate();
        },

        // private methods
        _fetchTemplate: function () {
            var store = this._getStore(this._templateResource);
            store.query().then(lang.hitch(this, this.onFetchTemplate));
        },

        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            
            var options = new Array();
            array.forEach(items[this._rootTemplateTag], function(bmResource){
            	var id = bmResource[this._resourceIdTag];
            	var resourceName = bmResource[this._resourceNameTag];
            	options.push({ value: id, label: resourceName });
				}, this);

            this.resourceSelect.set('options', options);
            this.resourceSelect.set('value', this._currentResourceId);
        },

        _onSelectChange: function (newValue) {
            var select = registry.byId(this.resourceSelect);
            var resourceName = '';

            array.some(select.options, function (option) {
                if (option.selected) {
                    resourceName = option.label;
                    return true;
                }
            });

            topic.publish(PubSub.selectResource, newValue, resourceName, false, false);
        }
    });
});