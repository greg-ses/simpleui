// ~/script/schema/ArgTemplate
// arg UI and value map template, where: 
// configObj = ScriptTemplate.Constraint or string[]: usage-
//              - select options
//              - min/max
//              - extension reference names
// extension = ScriptTemplate.Extension[] with extensions mapped to corresponding indices in configObj (if configObj[i] should reference an Extension),
//              where each Extension is a reference to an Extension in the _extensionTemplates dictionary

define(['dojo/_base/declare', '../EntryEnum'], 
function (declare, EntryEnum) {
    return declare(null,
    {
        id: '',
        name: '',
        label: '',
        valueType: null,
        configObj: null,
        extensions: null,
        initialValue: null,
        changeEventType: EntryEnum.EventArgType.None,

        constructor: function (id,
                                name,
                                valueType,
                                /*optional*/configObj,
                                /*optional Extension[]*/extensions,
                                /*optional*/initialValue, 
                                /*optional*/changeEventType,
                                /*optional*/label) {
            this.id = id;
            this.name = name;
            this.valueType = valueType;
            if (configObj) {
                this.configObj = configObj;
            }

            if (extensions) {
                this.extensions = extensions;
            }

            if (initialValue) {
                this.initialValue = initialValue;
            }

            if(changeEventType) {
                this.changeEventType = changeEventType;
            }

            this.label = label ? label : name;
        }
    });
});