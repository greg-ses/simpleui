// ~/dto/extendedSelect
// ExtendedSelect config objects
// example:
//  var extendedSelect = require('./extendedSelect');
//  var cfgObj = new extendedSelect.Ctor(extensionRefs);

define([], function () {
    return {
        // widget constructor mix-in to add extension handling
        Ctor: function (extensionRefs) {
            this.extensionRefs = extensionRefs; // indexed array of ref names
        }
    };
});