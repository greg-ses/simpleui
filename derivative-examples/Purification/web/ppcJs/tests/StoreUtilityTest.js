dojo.provide('ppcJs.tests.StoreUtilityTest');
dojo.require('ppcJs.utilities.Store');
dojo.require('ppcJs.tests.ParamControlTestUtilities');

doh.register('ppcJs.tests.StoreUtilityTest',
    [
        function testGetLocalUrlInfo(t) {
            var refUrl = ppcJs.tests.ParamControlTestUtilities.getMockStoreUrl() + '?' + ppcJs.tests.ParamControlTestUtilities.exportParamDataQuery;
            var urlInfo = ppcJs.utilities.Store.getUrlInfo(refUrl);

            t.assertEqual('../mockService/mockService.html', urlInfo[0]);
            t.assertEqual('PBsqreader', urlInfo[1]);
        },

        function testGetLocalUrlInfoSpecifyServerProcess(t) {
            var refUrl = ppcJs.tests.ParamControlTestUtilities.getMockStoreUrl() + '?' + ppcJs.tests.ParamControlTestUtilities.exportParamDataQuery;
            var serverProcess = 'dummyProcess';
            var urlInfo = ppcJs.utilities.Store.getUrlInfo(refUrl, serverProcess);

            t.assertEqual('../mockService/mockService.html', urlInfo[0]);
            t.assertEqual(serverProcess, urlInfo[1]);
        },

        function testGetIncompleteUrlInfo(t) {
            var refUrl = '../tests/PB150DbConfigResponseTreeModel.xml';
            var urlInfo = ppcJs.utilities.Store.getUrlInfo(refUrl);
            t.assertEqual(refUrl, urlInfo[0]);
            t.assertEqual('', urlInfo[1]);
        },

        function testGetUrlInfoWithServerProcessArg(t) {
            var refUrl = '../tests/PB150DbConfigResponseTreeModel.xml';
            var serverProcess = 'testProcess';
            var urlInfo = ppcJs.utilities.Store.getUrlInfo(refUrl, serverProcess);
            t.assertEqual(refUrl, urlInfo[0]);
            t.assertEqual(serverProcess, urlInfo[1]);
        },

        function testGetNonexistentElementTextReturnsNullString(t) {
            var xmlString = '<testData><item>1</item></testData>';
            var doc = dojox.xml.parser.parse(xmlString);
            var xmlElement = dojo.query('testData', doc)[0];

            var result = ppcJs.utilities.Store.getElementText('nonExistent', xmlElement);
            t.assertEqual('', result, 'xmlElement with nonexistent sub-element failed');

            result = ppcJs.utilities.Store.getElementText('nonExistent', null);
            t.assertEqual('', result, 'null xmlElement failed');
        },

        function testGetCssAttribSelector(t) {
            var refCss = '[attributeA="1"]';
            var attribName = 'attributeA';
            var attribVal = 1;

            var result = ppcJs.utilities.Store.getCssAttribSelector(attribName, attribVal);

            t.assertEqual(refCss, result);
        }
    ]
);