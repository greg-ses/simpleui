// ~/utilities/DataFormat
// standard data utilities, enums

define(['dojo/json'], function (JSON) {
    return {
        getFloatAsString: function (/*string*/value, /*int*/precision, /*string*/naNPlaceHolder) {
            return this._getFloatAsString(value, precision, naNPlaceHolder, 1);
        },

        getPercentAsString: function (/*string*/value, /*int*/precision, /*string*/naNPlaceHolder) {
            return this._getFloatAsString(value, precision, naNPlaceHolder, 100);
        },

        isEven: function (n) {
            return this.isInt(n) && (n % 2 == 0);
        },

        isOdd: function (n) {
            return this.isInt(n) && (n % 2 == 1);
        },

        isInt: function (n) {
            return !isNaN(parseInt(n)) && isFinite(n);
        },

        toInt: function (n) {
            return Math.round(Number(n));
        },

        // returns string of n of width digits, padded with leading zeros
        pad: function (n, digits) {
            var str = '' + n;
            while (str.length < digits) {
                str = '0' + str;
            }

            return str;
        },

        // returns n rounded down to nearest modulus
        roundDown: function (n, modulus) {
            if (!isNaN(n)) {
                var multiple = parseInt(n / modulus);
                return multiple * modulus;
            }
            else {
                return 0;
            }
        },

        toBool: function (/*string*/n) {
            if (isNaN(n)) {
                return (n.toLowerCase() === 'true');
            }
            else {
                return (n > 0);
            }
        },

        boolToI: function (boolVal) {
            if (boolVal) {
                return 1;
            }
            else {
                return 0;
            }
        },

        // returns string containing comma separated values as an array
        toArray: function (/*string*/csv) {
            var jsonStr = '{"data":[' + csv + ']}';
            var jsObj = JSON.parse(jsonStr);
            return jsObj.data;
        },

        _getFloatAsString: function (/*string*/value, /*int*/precision, /*string*/naNPlaceHolder, scaler) {
            var floatVal = parseFloat(value);
            var resultStr = '';

            if (isNaN(floatVal) || isNaN(precision)) {
                resultStr = naNPlaceHolder;
            }
            else {
                floatVal *= scaler;
                var truncatedFloat = floatVal.toFixed(precision);
                resultStr = truncatedFloat.toString();
            }

            return resultStr;
        },

        // returns string with lower case first char
        firstCharToLowerCase: function (pascalCaseStr) {
            return pascalCaseStr.charAt(0).toLowerCase() + pascalCaseStr.slice(1);
        },

        // returns string with upper case first char
        firstCharToUpperCase: function (camelCaseStr) {
            return camelCaseStr.charAt(0).toUpperCase() + camelCaseStr.slice(1);
        },

        // returns true if first char is upper case
        isFirstCharUpperCase: function (str) {
            var firstChar = str.charAt(0);
            return (firstChar === firstChar.toUpperCase());
        },

        sizeOf: function ( object ) {
            var objectList = [];
            var stack = [ object ];
            var bytes = 0;

            while ( stack.length ) {
                var value = stack.pop();

                if ( typeof value === 'boolean' ) {
                    bytes += 4;
                }
                else if ( typeof value === 'string' ) {
                    bytes += value.length * 2;
                }
                else if ( typeof value === 'number' ) {
                    bytes += 8;
                }
                else if
                (
                    typeof value === 'object'
                    && objectList.indexOf( value ) === -1
                )
                {
                    objectList.push( value );

                    for( var i in value ) {
                        stack.push( value[ i ] );
                    }
                }
            }
            return bytes;
        }
    };
});