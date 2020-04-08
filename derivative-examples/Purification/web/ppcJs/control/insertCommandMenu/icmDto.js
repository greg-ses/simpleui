// ~/control/insertCommandMenu/icmDto

define([], function () {
    return {
        // constructor object for setting InsertCommandMenu public fields
        Ctor: function (/*bool*/enableDelete) {
            this.enableDelete = enableDelete;
        }
    };
});