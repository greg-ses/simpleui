// ~/panel/multimodeChart/mmcDto
// data transfer objects for MultimmodeChart panel

define([], function () {
    return {
        State: function (/*string*/majorSelector, /*string*/majorSelectName, /*string*/minorSelector, /*string*/minorSelectName) {
            this.majorSelector = majorSelector;
            this.majorSelectName = majorSelectName;
            this.minorSelector = minorSelector;
            this.minorSelectName = minorSelectName;
        }
    };
});