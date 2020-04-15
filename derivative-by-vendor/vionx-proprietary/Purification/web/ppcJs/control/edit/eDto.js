// ~/control/edit/eDto

define([], function () {
    return {
        // constructor object for setting EditControl public fields
        Ctor: function (/*EntryControlFactory*/entryControlFactory) {
            this.entryControlFactory = entryControlFactory;
        }
    };
});