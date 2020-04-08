// ~/script/schema/EntryTemplate
// template container for all args in a script entry for a given command type
// contains static members with references to dynamic extensions

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        args: null,
        updateSequence: null, // {updateArgId: string, once: bool}[], ordered sequence of arg IDs to handle update calls

        constructor: function () {
            this.args = new Array();
            this.updateSequence = new Array();
        }
    });
});