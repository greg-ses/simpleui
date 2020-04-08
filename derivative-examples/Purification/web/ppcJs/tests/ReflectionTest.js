dojo.provide('ppcJs.tests.ReflectionTest');
dojo.require('ppcJs.utilities.Reflection');

doh.register('ppcJs.tests.ReflectionTest',
    [
        function testFieldCount(t) {
            var testObj1 = { a: 0, b: 'two', c: Boolean };
            var result1 = ppcJs.utilities.Reflection.fieldCount(testObj1);

            t.assertEqual(3, result1);

            var testObj2 = {};
            var result2 = ppcJs.utilities.Reflection.fieldCount(testObj2);

            t.assertEqual(0, result2);
        },

        function testInvertObjKeyValues(t) {
            var testObj = { aa: 0, bb: 1, cc: 3 };

            var result = ppcJs.utilities.Reflection.invertObjKeyValues(testObj);
            t.assertEqual('aa', result[0]);
            t.assertEqual('cc', result[3]);
        },

        function testGetValueFromApproximateKey(t) {
            var testObj = { aa: 0, bb: 1, cc: 3 };
            var reverseMap = { 0: 'aa', 1: 'bb', 3: 'cc' };

            var result = ppcJs.utilities.Reflection.getValueFromApproximateKey(' Bb', testObj)
            t.assertEqual(testObj.bb, result);
        },

        function testValidateEnumValues(t) {
            var testObj = { aa: 0, bb: 1, cc: 2 };
            t.assertTrue(ppcJs.utilities.Reflection.validateEnumValue(0, testObj), 'valid enum value returned false');
            t.assertTrue( ppcJs.utilities.Reflection.validateEnumValue(2, testObj), 'valid enum value returned false');
            t.assertFalse( ppcJs.utilities.Reflection.validateEnumValue(null, testObj), 'null enum value returned true');
            t.assertFalse( ppcJs.utilities.Reflection.validateEnumValue('1', testObj), 'invalid enum type returned true');
            t.assertFalse( ppcJs.utilities.Reflection.validateEnumValue(-1, testObj), 'negative enum value returned true');
            t.assertFalse( ppcJs.utilities.Reflection.validateEnumValue(4, testObj), 'invalid enum value returned true');
        }
    ]
);