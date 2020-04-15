// ~/panel/Parameter
// top level widget containing a parameter tree panel
// note: switches to local test file if running on localhost
// requires that dojo & ppcJs resources have already been linked and djConfig has been configured

define(['dojo/_base/declare', 'dojo/dom-construct',
        'dijit/tree/TreeStoreModel', 'dijit/form/Button', 'ppcJs/widget/ParameterTree',
        './_Panel', 'dojo/text!./parameter/template/parameter.html'],
function (declare, construct,
        TreeStoreModel, Button, ParameterTree,
        _Panel, template) {
    return declare([_Panel],
    {
        // ajax request command constants
        _getDataCmd: { COMMAND: 'EXPORT_PARAM_DATA_XML' },
        _saveAllCmd: { COMMAND: 'PARAM_SAVE_ALL' },
        _revertDefaultCmd: { COMMAND: 'PARAM_REVERT_DEF' },
        _revertSavedCmd: { COMMAND: 'PARAM_REVERT_SAVED' },

        name: 'ParameterPanel',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'parameterPanel',

        _parameterTree: '',
        _rootDataTag: '',

        // loads parameter tree:
        //   resourceId = the root XML element type
        load: function (urlVal, resourceId, serverProcess) {
            // save for reloading
            this._rootDataTag = resourceId

            this.inherited(arguments);
            this._loadTree();
        },

        // private methods

        _loadTree: function () {
            var testUrl = '../../ppcJs/tests/PB150DbConfigResponseTreeModel.xml';
            this._initStore(testUrl, this._getDataCmd, this._rootDataTag, function () { }, { label: 'name' });

            var treeModel = new TreeStoreModel({
                store: this._xmlStore,
                rootId: this._rootDataTag,
                childrenAttrs: ['treeNode']
            });

            var paramTreeId = this.id + '_parameterTree';
            this._parameterTree = new ParameterTree({ model: treeModel, showRoot: false }, paramTreeId);
            construct.place(this._parameterTree.domNode, this.treeDiv, 'first');
        },

        // repeat ajax call to replace existing parameter tree
        _reload: function () {
            this._parameterTree.destroy();
            delete this._xmlStore;
            this._loadTree();
        },

        // callbacks
        onSaveAllButtonClick: function () {
            this.puB.setVisible((this.saveAllButton).domNode, false);
            dojo.xhrGet(this._assembleXhrArgs(this._saveAllCmd, this.handleError, this.handleLoad));
        },

        onDefaultButtonClick: function () {
            this.puB.setVisible((this.revertDefaultButton).domNode, false);
            dojo.xhrGet(this._assembleXhrArgs(this._revertDefaultCmd, this.handleError, this.handleLoad));
        },

        onSavedButtonClick: function () {
            this.puB.setVisible((this.revertSavedButton).domNode, false);
            dojo.xhrGet(this._assembleXhrArgs(this._revertSavedCmd, this.handleError, this.handleLoad));
        },

        // 2xx ajax response handler
        handleLoad: function (response, ioArgs) {
            this.puB.setVisible((this.saveAllButton).domNode, true);
            this.puB.setVisible((this.revertDefaultButton).domNode, true);
            this.puB.setVisible((this.revertSavedButton).domNode, true);
            this._reload();
        },

        // 4xx ajax response handler
        handleError: function (response, ioArgs) {
            this.puB.setVisible((this.saveAllButton).domNode, true);
            this.puB.setVisible((this.revertDefaultButton).domNode, true);
            this.puB.setVisible((this.revertSavedButton).domNode, true);
            console.log('Request to server failed: no action taken', response, ioArgs);
        }
    });
});

