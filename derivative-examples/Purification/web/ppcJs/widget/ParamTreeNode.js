// ~/widget/ParamTreeNode
// Custom TreeNode creates control for displaying/handling user input for a parameter
//

define(['dojo/_base/declare', 'dojo/dom-construct', 'dojo/dom-style', 'dijit/Tree',
        '../utilities/Store', '../control/_control/_cDto', '../control/Param'],
function (declare, construct, domStyle, Tree,
          Store, _cDto, Param) {
    return declare([Tree._TreeNode],
    {
        postCreate: function () {
            var pc = new Param({ _item: this.item });
            var urlInfo = Store.getUrlInfo(this.item['store'].url);
            var dto = new _cDto.Ctor(urlInfo);
            pc.configure(dto);

            var indent = this.get('indent') + 1;
            var pixels = (Math.max(indent, 0) * this.tree._nodePixelIndent) + "px";

            domStyle.set(pc.domNode, { position: 'relative', left: pixels });
            construct.place(pc.domNode, this.domNode, 'last');

            domStyle.set(this.domNode, 'marginBottom', '10px');
        }
    });
});