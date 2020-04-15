// ~/mixin/_NestedChildren
// adds recursive searching of child and popup widgets
// extended from https://gist.github.com/dylans/7338074#file-_nestedchildren-js, with bug fixes

define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/_base/lang',
        '../utilities/Identity'],
function (declare, array, lang,
        Identity) {

        // private methods
        var _hasDescendants = function (widget) {
            return (Identity.isFunction(widget.getChildren) || widget.popup);
        };

        var _getNestedChildren = function (parent) {
            var children = (parent.popup) ? [parent.popup] : parent.getChildren();
            var nestedChildren = [];
            array.forEach(children, function (child) {
                    if (_hasDescendants(child)) {
                        nestedChildren = nestedChildren.concat(_getNestedChildren(child));
                    }
            }, this);

            return children.concat(nestedChildren);
        };

    return declare(null,
    {
        // public methods
        // returns list of all nested children
        getAllChildren: function () {
            return (_hasDescendants(this)) ? _getNestedChildren(this) : [];
        }
    });
});