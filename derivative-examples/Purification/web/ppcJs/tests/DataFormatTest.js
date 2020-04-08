dojo.provide('ppcJs.tests.DataFormatTest');
dojo.require('ppcJs.utilities.DataFormat');

doh.register('ppcJs.tests.DataFormatTest',
    [
        function testGetValidFloat(t) {
            var refInput = '123.45678';
            var refOutput = '123.46';
            var result = ppcJs.utilities.DataFormat.getFloatAsString(refInput, 2, '-');

            t.assertEqual(refOutput, result);
        },

        function testGetInvalidFloat(t) {
            var refInput = 'a123.45678';
            var refOutput = 'X';
            var result = ppcJs.utilities.DataFormat.getFloatAsString(refInput, 2, refOutput);

            t.assertEqual(refOutput, result);
        },

        function testFloatToInt(t) {
            var result = ppcJs.utilities.DataFormat.toInt(123.456);
            t.assertEqual(123, result, 'rounding down failed');

            result = ppcJs.utilities.DataFormat.toInt(123.567);
            t.assertEqual(124, result, 'rounding up failed');
        },

        function testGetPercent(t) {
            var refInput = '0.773';
            var refOutput = '77.3';
            var result = ppcJs.utilities.DataFormat.getPercentAsString(refInput, 1, '-');
            t.assertEqual(refOutput, result);
        },

        function testRoundDownBy5(t) {
            var refNumber = 47;
            var result = ppcJs.utilities.DataFormat.roundDown(refNumber, 5);
            t.assertEqual(45, result);
        },

        function testRoundDownNaNReturns0(t) {
            var refNumber = 'NaN';
            var result = ppcJs.utilities.DataFormat.roundDown(refNumber, 5);
            t.assertEqual(0, result);
        },

        function testTrueStringToBoolReturnsTrue(t) {
            var refString = 'True';

            t.assertTrue(ppcJs.utilities.DataFormat.toBool(refString));
        },

        function testNumberToBoolReturnsTrue(t) {
            var refVal = 255;

            t.assertTrue(ppcJs.utilities.DataFormat.toBool(refVal));
        },

        function testNullToBoolReturnsFalse(t) {
            t.assertFalse(ppcJs.utilities.DataFormat.toBool(null));
        },

        function testCsvToArrayReturnsArray(t) {
            var csv = '10,20,30,40';
            var result = ppcJs.utilities.DataFormat.toArray(csv);
            t.assertEqual(10, result[0]);
            t.assertEqual(40, result[3]);
        },
    ]
);