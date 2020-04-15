// ~/script/Entry
// business object representing a script entry <cmd> element

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        uuid: '',
        commandType: null,
        args: null,
        updateSequence: null,

        constructor: function (uuid,
            /*script/EntryEnum.CommandType*/commandType,
            /*script/Arg[]*/args,
            /*optional, {updateArgId: string, once: bool}[]*/updateSequence) {
            this.uuid = uuid;               // assigned by Factory
            this.commandType = commandType; // assigned by Factory
            this.args = dojo.clone(args);
            this.updateSequence = updateSequence? dojo.clone(updateSequence) : new Array();
        }
    });
});