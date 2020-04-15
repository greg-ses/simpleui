// ~/panel/Auth
/* non-visible panel to get and publish authorizations for current user. Sample usage:
    <span id="auth" data-dojo-type="ppcJs/panel/Auth"></span>
    '
    '
    var auth = registry.byId('auth');
    auth.load(baseAjaxUrl, SelectedServerId, AuthServer);

 Pub/sub list:
 [pub] ppcJs.PubSub.authorizations
*/

define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/query', 'dojo/topic', 'dojox/xml/parser',
        '../Enum', '../PubSub', '../utilities/AccessControl', './_Panel'],
function (declare, array, query, topic, parser,
        Enum, PubSub, AccessControl, _Panel) {
    return declare([_Panel],
    {
        // ajax request command constants
        _getTemplateCmd: { GET: 'AUTHORIZATIONS' },

        // ajax response tags
        _rootTemplateTag: 'authorizations',
        _taskTag: 'task',

        // dijit variables
        name: 'auth Panel',
        widgetsInTemplate: false,
        templateString: '<span></span>',    // invisible DOM element to allow declaration in html

        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            // ignore resourceID
            this.inherited(arguments);

            var testUrl = '../../ppcJs/tests/authTemplateResponse.xml';
            this._initStore(testUrl, this._getTemplateCmd, this._rootTemplateTag, this.onFetchTemplate);
        },

        // private methods
        _publishAuthorizations: function (/*XmlElement*/rootElem) {
            var taskElems = query(this._taskTag, rootElem);
            var userAuths = new Array();

            array.forEach(taskElems, function (taskElem) {
                var task = parseInt(parser.textContent(taskElem));
                userAuths.push(task);
                console.info('authorized /utilities/AccessControl.Task: ' + task.toString());
            });

            topic.publish(PubSub.authorizations, userAuths);
        },

        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            if (items && items.length > 0) {
                var rootElem = items[0]['element'];
                this._publishAuthorizations(rootElem);
            }
        }
    });
});