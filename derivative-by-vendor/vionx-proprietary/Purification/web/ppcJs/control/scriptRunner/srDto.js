// ~/control/scriptRunner/srDto
// base scriptRunner update DTO
// example:
//  var extendedSelect = require('./extendedSelect');
//  var cfgObj = new extendedSelect.Ctor(extensionRefs);

define([], function () {
    return {
        Update: function (/*script.State*/state, /*Enum.Error*/faultLevel, /*string*/mode, /*string, optional*/subMode) {
            this.state = state;
            this.faultLevel = faultLevel;
            this.mode = mode;
            this.subMode = subMode;
        }
    };
});