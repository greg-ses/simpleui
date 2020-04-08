// ~/script/EntryEnum
// script enums

define(['../utilities/DataFormat', '../utilities/Identity'], 
function (DataFormat, Identity) {
    return {
        CommandType: {
            Label: 0,
            WaitRelative: 1,
            WaitDateTime: 2,
            GoTo: 3,
            WaitLessThan: 4,
            WaitGreaterThan: 5,
            WaitState: 6,
            WaitTimeOfDay: 7,
            WaitNextDay: 8,
            Action: 9,
            CustomAction: 10,
            IfDateTimeGoto: 11,
            SendPage: 12,
            RunSystemCommand: 13,
            RunDataFile: 14,
            SetVariable: 15,
            ForLoop: 16,
            IfThen: 17
        },

        ValueType: {
            Select: 0,
            Float: 1,
            Int: 2,
            String: 3,
            Substitution: 4,    // substitute with ref block
            Bool: 5,
            TimeOfDay: 6,   // sec, since midnight
            TimeSpan: 7,    // sec, relative
            TimeStamp: 8    // sec, since epoch (1/1/70)
        },

        // for change, etc., events
        EventArgType: {
            None: 0,
            DataFile: 1,
            ScriptFile: 2,
            LinkedEntry: 3  // to trigger action on a linked script entry
        },

        getDefaultValue: function (/*ValueType*/valueType) {
            switch (valueType) {
                case (this.ValueType.Float):
                    return 0.0;
                case (this.ValueType.Int):
                    return 0;
                case (this.ValueType.String):
                    return '';
                case (this.ValueType.Bool):
                    return false;
                case (this.ValueType.TimeSpan):
                    return 0;
                case (this.ValueType.TimeStamp):
                    var currentTime = new Date();
                    var currentTimeSec = currentTime.getTime() / 1000;
                    return currentTimeSec;
                default:
                    return 0;
            }
        },

        // returns true if value is valid for given valueType
        isOfType: function (value, /*ValueType*/valueType) {
            switch (valueType) {
                case (this.ValueType.Float):
                    return !isNaN(value);
                    break;

                case (this.ValueType.Int):
                    return DataFormat.isInt(value);
                    break;

                case (this.ValueType.String):
                    if (Identity.isString(value)) {
                        return true;    // TODO: XML escape validation
                    }
                    else {
                        return false;
                    }
                    break;

                case (this.ValueType.Bool):
                    return (value && (value > 0));
                    break;

                case (this.ValueType.TimeOfDay):
                case (this.ValueType.TimeSpan):
                    return (DataFormat.isInt(value) && (value >= 0));
                    break;

                case (this.ValueType.Select):
                case (this.ValueType.Substitution):
                case (this.ValueType.TimeStamp):
                default:
                    return false;
                    break;
            }
        }
    };
});