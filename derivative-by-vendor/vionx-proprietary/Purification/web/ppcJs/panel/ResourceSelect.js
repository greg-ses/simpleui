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
        './_Panel', 'dojo/text!./resourceSelect/template/resourceSelect.html'],
function (declare, lang, array, dom, domClass, query, aspect, topic, on,
        registry, Dictionary, parser, Select,
        Enum, PubSub, Compatibility,
        _Panel, template) {
    return declare([_Panel],
    {
        // ajax request command constants
        _resourceListCmd: { GET: 'RESOURCE_SELECT_LIST' },

        // ajax response tags
        _rootTemplateTag: 'scriptResources',
        _resourceTag: 'scriptResource',
        _resourceNameTag: 'resourceName',
        _resourceIdTag: 'resourceId',

        // private class variables
        _currentResourceId: '',

        // dijit variables
        name: 'Resource Selector',
        templateString: template,
        baseClass: 'resourceSelect',

        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);
            this._currentResourceId = resourceId;
            this._fetchTemplate();
        },

        // private methods
        _fetchTemplate: function () {
            var testUrl = '../../ppcJs/tests/autoCycleResourceListResponse.xml';

            this._initStore(testUrl, this._resourceListCmd, this._rootTemplateTag, this.onFetchTemplate);
        },

        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            var rootElem = items[0]['element'];
            var resources = query(this._resourceTag, rootElem);
            var options = new Array();
            array.forEach(resources, function (resource) {
                var id = this.puS.getElementText(this._resourceIdTag, resource);
                var resourceName = this.puS.getElementText(this._resourceNameTag, resource);
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