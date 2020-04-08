// ~/control/diagramBlock/dbDto
// DiagramBlock DTOs (POJSOs to avoid Dijit construction mixin conflicts - otherwise Dijit becomes DTO class type)

define([], function () {
    return {
        // enums
        ResourceModeEnum: {
            Null: 0,
            Charge: 1,
            Discharge: 2,
            OffLine: 3,
            Standby: 4
        },

        PowerDirEnum: {
            None: 0,
            In: 1,
            Out: 2
        },

        // configuration for a data item
        DataConfig: function (id, label, description, /*Enum*/valueType) {
            this.id = id;
            this.label = label;
            this.description = description;
            this.valueType = valueType;
        },

        // data item update
        DataValue: function (id, value) {
            this.id = id;
            this.value = value;
        },

        // constructor object for setting DiagramBlockControl public fields
        Ctor: function (serverId, name, /*bool*/isMaster, /*DataConfig[]*/dataConfigs, /*string*/resourceType) {
            this.serverId = serverId;
            this.isMaster = isMaster;
            this.name = name;
            this.dataConfigs = dataConfigs;
            this.type = resourceType;
        },

        // update object
        Status: function ( /*PowerDirEnum*/powerDir,
        /*string*/mode,
        /*DataValue[]*/dataValues,
        /*ErrorEnum*/errorStatus,
        /*nullable int, ms since epoch*/timestamp,
        /*bool, optional*/linkDisabled
                        ) {
            this.powerDir = powerDir;
            this.mode = mode;
            this.dataValues = dataValues;
            this.errorStatus = errorStatus;
            this.timestamp = timestamp;
            this.linkDisabled = linkDisabled ? true : false;
        }
    };
});