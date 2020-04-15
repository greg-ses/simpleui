dojo.provide('ppcJs.tests.FileUtilityTest');
dojo.require('ppcJs.utilities.File');
dojo.require('dojox.string.Builder');

doh.register('ppcJs.tests.FileUtilityTest',
    [
        function testVerifyQnxValidFileName(t) {
            var sut = ppcJs.utilities.File;

            var name = new dojox.string.Builder('aA0 _-');
            for (var i = name.toString().length; i <= sut.minChars; i++) {
                name.append('a');
            }
            t.assertTrue(sut.verifyQnxFileName(name.toString()));

            for (var j = i; j < sut.maxQnxChars; j++) {
                name.append('a');
            }
            t.assertTrue(sut.verifyQnxFileName(name.toString()));
        },

        function testVerifyQnxInvalidLength(t) {
            var sut = ppcJs.utilities.File;

            var name = new dojox.string.Builder();
            for (var i = 0; i < (sut.minChars - 1); i++) {
                name.append('a');
            }
            t.assertFalse(sut.verifyQnxFileName(name.toString()), 'failed minChar test');

            for (var j = i; j <= sut.maxQnxChars; j++) {
                name.append('a');
            }
            t.assertFalse(sut.verifyQnxFileName(name.toString()), 'failed maxChar test');
        },

        function testVerifyQnxInvalidChars(t) {
            var invalidChars = '~`!@#$%^&*()+{}|[]\:";<>?,./';
            var isValid = false;
            for (var i = 0; i < invalidChars.length; i++) {
                var invalidChar = invalidChars.charAt(i);
                // pad to min length as necessary

                if (ppcJs.utilities.File.verifyQnxFileName(invalidChar)) {
                    isValid = true;
                    break;
                }
            }

            t.assertFalse(isValid);
        },

        function testRemoveExtension(t) {
            var refFileName = 'testName';
            var inputFileName = refFileName + '.xml';

            var result1 = ppcJs.utilities.File.removeExtension(inputFileName);
            t.assertEqual(refFileName, result1, 'filename with extension failed');

            var result2 = ppcJs.utilities.File.removeExtension(refFileName);
            t.assertEqual(refFileName, result2, 'filename without extension failed');
        },

        function testGetExtension(t) {
            var refExtension = 'xml';
            var inputFileName = 'testName.' + refExtension;

            var result1 = ppcJs.utilities.File.getExtension(inputFileName);
            t.assertEqual(refExtension, result1, 'get extension failed');

            var result2 = ppcJs.utilities.File.getExtension('testName');
            t.assertEqual(null, result2, 'filename without extension failed');
        }
    ]
);