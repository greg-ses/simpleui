// ~/utilities/Identity
// standard object identity tests

define(['dojo/_base/lang', 'dojo/_base/array'], function (lang, array) {
    return {
        isString: function (candidate) {
            var result = typeof candidate;
            return (result.toLowerCase() == 'string');
        },

        isArray: function (candidate) {
            return (candidate instanceof Array);
        },

        isFunction: function (candidate) {
            var result = typeof candidate;
            return (result.toLowerCase() == 'function');
        },

        isObject: function (candidate) {
            var result = typeof candidate;
            return (candidate && (result.toLowerCase() == 'object'));
        },

        areEqualFloats: function (float1, float2, tolerance) {
            return (Math.abs(float1 - float2) <= tolerance);
        },

        areEqualArrays: function (array1, array2) {
            if (!array1 || !array2 || (array1.length != array2.length)) {
                return false;
            }
            else if (array1.length == 0) {
                return true;
            }
            else if (this.isObject(array1)) {
                return JSON.stringify(array1) == JSON.stringify(array2);
            }
            else
            {
                //sort them first, then join them and just compare the strings
                var arr1 = lang.clone(array1);
                var arr2 = lang.clone(array2);
                return arr1.sort().join() == arr2.sort().join();
            }
        },

        // returns true if array1 contains item
        listIncludes: function (array1, item) {
            result = array.some(array1, function (listItem) {
                return listItem == item;
            });
            return result;
        }
    };
});