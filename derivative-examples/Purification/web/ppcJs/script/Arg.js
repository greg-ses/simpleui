// ~/script/Arg
// business object representing a script entry <arg> element

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        id: '',
        name: '',
        value: '',
        valueType: '',

        constructor: function (id, name, value, /*script/EntryEnum.ValueType*/valueType) {
            this.id = id;
            this.name = name;
            this.value = value;
            this.valueType = valueType;
        }
    });
});