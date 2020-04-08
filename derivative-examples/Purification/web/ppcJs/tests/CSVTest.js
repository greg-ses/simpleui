dojo.provide('ppcJs.tests.CSVTest');
dojo.require('ppcJs.utilities.CSV');

doh.register('ppcJs.tests.CSVTest',
    [
        function testValidArrayToRow(t) {
            var input = [1, ' 2 ', 3, 4, 5, 6, 7, 8, 9];
            var refOut = '1,2,3,4,5,6,7,8,9\r\n';

            var result = ppcJs.utilities.CSV.arrayToRow(input);

            t.assertEqual(refOut, result);
        },

        function testEmptyArrayToRow(t) {
            var input = new Array();
            var refOut = '';

            var result = ppcJs.utilities.CSV.arrayToRow(input);

            t.assertEqual(refOut, result);
        },

        function testInvalidArrayToRow(t) {
            var input = 10;
            var refOut = '';

            var result = ppcJs.utilities.CSV.arrayToRow(input);

            t.assertEqual(refOut, result);
        },

        function testNullArrayToRow(t) {
            var refOut = '';

            var result = ppcJs.utilities.CSV.arrayToRow();

            t.assertEqual(refOut, result);
        },

    ]
);