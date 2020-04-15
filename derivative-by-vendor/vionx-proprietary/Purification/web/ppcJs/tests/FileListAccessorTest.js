dojo.provide('ppcJs.tests.FileListAccessorTest');
dojo.require('ppcJs.panel.fileManager.FileListAccessor');
dojo.require('ppcJs.panel.fileManager.fmDto');
dojo.require('ppcJs.utilities.Identity');

var dto = ppcJs.panel.fileManager.fmDto;
var fileList = new Array();
fileList.push(new dto.FileIdentifier('script1.xml', 'script1', dto.FileType.Script));
fileList.push(new dto.FileIdentifier('script2.xml', 'script2', dto.FileType.Script));
fileList.push(new dto.FileIdentifier('data1.csv', 'data1', dto.FileType.Data));
fileList.push(new dto.FileIdentifier('data2.csv', 'data2', dto.FileType.Data));

doh.register('ppcJs.tests.FileListAccessorTest',
    [
        function testClearOnUpdate(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            sut.update(fileList);
            sut.update();
            t.assertEqual([], sut._fileList);
        },

        function testGetLongFileName(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            t.assertEqual('', sut.getLongFileName('script2'), 'incorrect result before initialized');

            sut.update(fileList);

            t.assertEqual('script2.xml', sut.getLongFileName('script2'));
        },

        function testGetShortFileName(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            sut.update(fileList);

            t.assertEqual('data1', sut.getShortFileName('data1.csv'));
        },

        function testGetFileType(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            t.assertEqual(null, sut.getFileType('script2.xml'), 'incorrect result before initialized');

            sut.update(fileList);

            t.assertEqual(dto.FileType.Script, sut.getFileType('script2.xml'));
            t.assertEqual(dto.FileType.Data, sut.getFileType('data2.csv'));
        },

        function testGetShortFileNamesNoFilter(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            t.assertEqual([], sut.getFileNames(false), 'incorrect result before initialized');

            sut.update(fileList);

            var result = sut.getFileNames(false);
            var refArray = ['script1', 'script2', 'data1', 'data2'];
            var testResult = ppcJs.utilities.Identity.areEqualArrays(refArray, result);
            t.assertTrue(testResult);
        },

        function testGetLongFileNamesNoFilter(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            sut.update(fileList);

            var result = sut.getFileNames(true);
            var refArray = ['script1.xml', 'script2.xml', 'data1.csv', 'data2.csv'];
            var testResult = ppcJs.utilities.Identity.areEqualArrays(refArray, result);
            t.assertTrue(testResult);
        },

        function testGetShortFileNamesFilterByData(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            sut.update(fileList);

            var result = sut.getFileNames(false, { fileType: dto.FileType.Data });
            var refArray = ['data1', 'data2'];
            var testResult = ppcJs.utilities.Identity.areEqualArrays(refArray, result);
            t.assertTrue(testResult);
        },

        function testUpdateChangedFileListReturnsTrue(t) {
            var sut = new ppcJs.panel.fileManager.FileListAccessor();
            var result1 = sut.update(fileList);
            t.assertTrue(result1, 'initial update returned false');

            var result2 = sut.update(fileList);
            t.assertFalse(result2, 'subsequent update with unchanged file list returned true');

            var newFileList = dojo.clone(fileList);
            newFileList.push(new dto.FileIdentifier('script3.xml', 'script3', dto.FileType.Script));
            var result3 = sut.update(newFileList);
            t.assertTrue(result3, 'subsequent update with changed file list returned false');

            var resultList = sut.getFileNames(false);
            t.assertEqual(5, resultList.length, 'file list not updated to changed list');
        },
    ]
);