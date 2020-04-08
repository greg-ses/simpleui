// static reflection utilities for object field inspection and manipulation

define(['./DataFormat'], function (DataFormat) {
    return {
        // returns number of fields in an object
        fieldCount: function (objInstance) {
            var numFields = 0;
            for (var property in objInstance) {
                if (objInstance.hasOwnProperty(property)) {
                    ++numFields;
                }
            }

            return numFields;
        },

        // returns object with the keys and values of the original object inverted
        // use case: getting enum property names via an indexable string object -
        //      enumNames = ppcJs.utilities.Reflection.invertObjKeyValues(ppcJs.ScriptEnum.CommandType)
        //      name = enumNames[ppcJs.ScriptEnum.CommandType.Label] = 'Label'
        invertObjKeyValues: function (obj) {
            var invertedObj = {};

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    invertedObj[obj[key]] = key;
                }
            }

            return invertedObj;
        },

        // for any case key, return the value from an enum
        // note: strips spaces from approxKey
        getValueFromApproximateKey: function (/*string*/approxKey, enumObj) {
            var normalizedKey = dojo.trim(approxKey).toLowerCase();
            for (var key in enumObj) {
                var normalizedRefKey = key.toLowerCase();
                if (normalizedKey === normalizedRefKey) {
                    return enumObj[key];
                }
            }
        },

        // returns true if enumValue is in enum enumObj
        validateEnumValue: function (enumValue, enumObj) {
            if (DataFormat.isInt(enumValue)) {
                var intVal = DataFormat.toInt(enumValue);
                var maxEnumVal = this.fieldCount(enumObj) - 1;
                return ((enumValue === intVal) && (enumValue >= 0) && (enumValue <= maxEnumVal));
            }
            else {
                return false;
            }
        }
    };
});