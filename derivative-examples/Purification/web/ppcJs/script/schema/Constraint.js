// ~/script/schema/Constraint
// schema object representing constraints on an arg

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        min: null,
        max: null,
        readOnly: false,
        hide: false,
        hideLabel: false,
        options: null,

        constructor: function (/*optional*/min, /*optional*/max, /*optional*/readOnly, /*optional*/hide, /*optional*/hideLabel) {
            this.min = min;
            this.max = max;
            this.readOnly = readOnly ? true : false;
            this.hide = hide ? true : false;
            this.hideLabel = hideLabel ? true : false;
        }
    });
});