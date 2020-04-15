dojo.provide('ppcJs.tests.ExtensionMapTest');
dojo.require('ppcJs.panel.fileManager.ExtensionMap');
dojo.require('ppcJs.panel.fileManager.fmDto');

doh.register('ppcJs.tests.ExtensionMapTest',
    [
        function testGetExtension(t) {
            var fileMap = [new ppcJs.panel.fileManager.fmDto.FileExtensionMap('xmL', ppcJs.panel.fileManager.fmDto.FileType.Script),
               new ppcJs.panel.fileManager.fmDto.FileExtensionMap('csv', ppcJs.panel.fileManager.fmDto.FileType.Data)];

            var sut = new ppcJs.panel.fileManager.ExtensionMap(fileMap);
            var scriptExt = sut.getExtension(ppcJs.panel.fileManager.fmDto.FileType.Script);
            t.assertEqual('xml', scriptExt, 'incorrect script extension');

            var dataExt = sut.getExtension(ppcJs.panel.fileManager.fmDto.FileType.Data);
            t.assertEqual('csv', dataExt, 'incorrect data extension');
        },

        function testGetType(t) {
            var fileMap = [new ppcJs.panel.fileManager.fmDto.FileExtensionMap('xmL', ppcJs.panel.fileManager.fmDto.FileType.Script),
               new ppcJs.panel.fileManager.fmDto.FileExtensionMap('csv', ppcJs.panel.fileManager.fmDto.FileType.Data)];

            var sut = new ppcJs.panel.fileManager.ExtensionMap(fileMap);
            var scriptType = sut.getType('xml');
            t.assertEqual(ppcJs.panel.fileManager.fmDto.FileType.Script, scriptType, 'incorrect script type');

            var dataType = sut.getType('CSV');
            t.assertEqual(ppcJs.panel.fileManager.fmDto.FileType.Data, dataType, 'incorrect data type (uc)');

            var scriptType = sut.getType('');
            t.assertEqual(ppcJs.panel.fileManager.fmDto.FileType.Script, scriptType, 'null extension failed to return script type');

            var nullType = sut.getType('invalid');
            t.assertEqual(null, nullType, 'invalid extension failed to return null');
        },

        function testTypeValidation(t) {
            var fileMap = [new ppcJs.panel.fileManager.fmDto.FileExtensionMap('xmL', ppcJs.panel.fileManager.fmDto.FileType.Script),
               new ppcJs.panel.fileManager.fmDto.FileExtensionMap('csv', 1000)];

            var sut = new ppcJs.panel.fileManager.ExtensionMap(fileMap);
            var dataType = sut.getType('csv');
            t.assertEqual(null, dataType, 'invalid configuration type returned a value');

            var dataType = sut.getType('invalid');
            t.assertEqual(null, dataType, 'invalid extension requested returned a value');
        },

        function testGetMimeType(t) {
            var refScriptMimeType = 'text/xml';
            var refDataMimeType = 'text/csv';

            var fileMap = [new ppcJs.panel.fileManager.fmDto.FileExtensionMap('xmL', ppcJs.panel.fileManager.fmDto.FileType.Script),
               new ppcJs.panel.fileManager.fmDto.FileExtensionMap('csv', 1000)];

            var sut = new ppcJs.panel.fileManager.ExtensionMap(fileMap);
            t.assertEqual(refScriptMimeType, sut.getMimeTypes(ppcJs.panel.fileManager.fmDto.FileType.Script), 'incorrect script mime type');
            t.assertEqual(refDataMimeType, sut.getMimeTypes(ppcJs.panel.fileManager.fmDto.FileType.Data), 'incorrect data mime type');
            t.assertEqual(refScriptMimeType + ',' + refDataMimeType, sut.getMimeTypes(-1), 'incorrect unfiltered mime types for invalid arg');
            t.assertEqual(refScriptMimeType + ',' + refDataMimeType, sut.getMimeTypes(), 'incorrect unfiltered mime types for null arg');
        }
    ]
);