// ~/script/schema/Extension
// schema object representing an arg extension:
// - block of sub-items for given reference keyword
// - a dynamic item that can be invoked when an option that references the extension is selected

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        keyword: '',
        extensionItems: null,

        constructor: function (/*string*/keyword, /*Object[]*/extensionItems) {
            this.keyword = keyword;
            this.extensionItems = extensionItems;
        }
    });
});