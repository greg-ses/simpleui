// ~/script/schema/ExtensionItem
// schema object representing extension block sub-item with optional link for recursive extensions
// value = string | ScriptTemplate.Arg

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        value: '',
        ref: '',

        constructor: function (value, /*optional*/ref) {
            this.value = value;
            this.ref = ref? ref : '';
        }
    });
});