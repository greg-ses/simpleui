// ~/mixin/_StoreContainer
// Base mixin for classes using dojo Object Stores. Provides
// - common REST resource initialization mechanism
// - common store methods and AJAX comm fault handling
// - returns passed testUrl if URL is localhost:80

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/topic', 'dojox/collections/Dictionary',
        'dojo/store/JsonRest', 'dojo/store/Observable', 'dojo/store/util/SimpleQueryEngine',
        '../PubSub'],
function (declare, lang, topic, Dictionary,
        JsonRestStore, Observable, SimpleQueryEngine,
        PubSub) {
    return declare(null,
    {
        // protected variables
        _restResourceMap: null,

        // lifecycle methods
        constructor: function (restResourceMap) {
            if (restResourceMap) {
                this._restResourceMap = lang.clone(restResourceMap);
            }
            else {
                this._restResourceMap = new Dictionary();
            }
        },

        // protected methods
        // returns an observable store if restResource.notObservable is null or false
        _createStoreFromUrl: function (/*{name:, testFile: }*/restResource, url) {
            if (this._useLocalTestFile() && restResource.testFile) {
                var configObj = { target: restResource.testFile };
            }
            else {
                var configObj = { target: url, queryEngine: SimpleQueryEngine };
            }

            var store = new JsonRestStore(configObj);
            return (restResource.notObservable) ? store : new Observable(store);
        },

        // returns JsonRestStore by resource (with a const resource tree, ie, no variable embedded IDs)
        _getStore: function (/*string*/resource) {
            return this._restResourceMap.item(resource);
        },

        // returns true if localhost on standard port
        _useLocalTestFile: function () {
            var ipAddress = window.location.host.split('.');
            return ((ipAddress[0] === '127') || (window.location.hostname === 'localhost')) && !window.location.port;
        },

        _verifyResponseNotNull: function (/*JSON object*/object) {
            if (!object) {
                topic.publish(PubSub.commFault, this.name);
                return false;
            }
            else {
                return true;
            }
        }
    });
});