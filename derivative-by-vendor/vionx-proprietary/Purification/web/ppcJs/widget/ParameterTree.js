// ~/widget/ParameterTree
// specialized tree for displaying parameters
//
// filters out empty nodes
// inserts Param Controls into treeNodes representing parameters

define(['dojo/_base/declare', 'dijit/Tree', './ParamTreeNode'],
function (declare, Tree, ParamTreeNode) {
    return declare([Tree],
    {
        // override event handlers
        _onKeyPress: function (/*Event*/e) {
            // skip key handling in Tree to unmask ParamControl key handling
        },

        _onClick: function (/*TreeNode*/nodeWidget, /*Event*/e) {
            // summary:
            //		Translates click events into commands for the controller to process
            // description:
            //		the _onClick function is called whenever a 'click' is detected. This
            //		instance of _onClick only handles the click events associated with
            //		the checkbox whos DOM name is INPUT.
            // 
            var domElement = e.target;

            // Only handle checkbox clicks here
            if (domElement.nodeName != 'INPUT') {
                return this.inherited(arguments);
            }
            this._publish("execute", { item: nodeWidget.item, node: nodeWidget });
            // Go tell the model to update the checkbox state

            // update model

            this.focusNode(nodeWidget);
        },

        _createTreeNode: function (args) {
            // if the "type" attribute exists create a ParamControl
            var xmlElement = (args["item"])["element"];
            var paramType = xmlElement.attributes["type"];

            if (typeof paramType === "undefined") {
                return new dijit._TreeNode(args);
            }
            else {
                return new ParamTreeNode(args);
            }
        }
    });
});