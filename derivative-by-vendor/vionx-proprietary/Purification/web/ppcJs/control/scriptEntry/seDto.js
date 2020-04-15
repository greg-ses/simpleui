// ~/control/scriptEntry/seDto

define([], function () {
    return {
        // adds widget metadata to facilitate sorting/filtering
        ComponentCtor: function (/*string*/argId, /*ScriptEnum.ValueType*/valueType, /*optional, string*/ref) {
            this.argId = argId;
            this.valueType = valueType;
            if (ref) {
                this.ref = ref;
            }
        }
    };
});