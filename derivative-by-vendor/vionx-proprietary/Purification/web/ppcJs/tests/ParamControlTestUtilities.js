// ~/tests/ParamControlTestUtilities
// test data utilities for ParamControl tests


// test data utilities for ParamControl tests
define(['dojo/_base/lang', 'dojo/_base/array', 'dojo/query',
    'dojox/xml/parser', 'dojox/data/XmlStore', 'dojox/data/XmlItem',
    'ppcJs/utilities/Store'],
function (lang, array, query,
        parser, XmlStore, XmlItem,
        Store) {
    return {
        exportParamDataQuery: 'COMMAND=EXPORT_PARAM_DATA_XML&CGI=PBsqreader',

        getMockStoreUrl: function () {
            var currentUrl = window.location.protocol + '://' + window.location.host;
            return currentUrl + '/ppcJs/tests/mockService/mockService.html';
        },

        getUrlInfo: function () {
            var hostUrl = this.getMockStoreUrl();
            var cgiPath = 'cgi-bin/cgicmd';
            var serverProcess = 'dbReader';
            var queryString = 'CGI=' + serverProcess;
            var baseUrl = window.location.protocol + '//' + hostUrl + '/' + cgiPath + '?' + queryString;
            var urlInfo = Store.getUrlInfo(baseUrl);
            return urlInfo;
        },

        // create an int parameter dojox.data.XmlItem
        // with url= "http://127.0.0.100/ppcJs/tests/mockService/mockService.html?COMMAND=EXPORT_PARAM_DATA_XML&CGI=PBsqreader"
        getIntXmlItem: function (queryString) {
            var xmlString = '<treeNode type="int" desc="Max database size before attempting clean-ups." min="1" max="200" def="10" id="1">10' +
                                '<name>MAX_DB_SIZE</name>' +
                                '<saved>10</saved>' +
                                '<active>10</active>' +
                            '</treeNode>';

            return this.getXmlItem(queryString, xmlString);
        },

        // create a bool parameter dojox.data.XmlItem
        getBoolXmlItem: function (queryString) {
            var xmlString = '<treeNode type="bool" desc="React to fault condititions in service mode." id="2">1' +
                                '<name>ENABLE_SERVICE_MODE_FAULT_HANDING</name>' +
                                '<saved>1</saved>' +
                                '<active>1</active>' +
                            '</treeNode>';

            return this.getXmlItem(queryString, xmlString);
        },

        getChartXmlItem: function () {
            var xmlString = '<projectSummary>' +
                                '<chart>' +
                                    '<title>chart title</title>' +
                                    '<xAxisName>x axis name</xAxisName>' +
                                    '<xScale>0.1</xScale>' +
                                    '<yAxisName>y axis name</yAxisName>' +
                                    '<dataSet>' +
                                        '{[2, 3, 4, 0, 1]}' +
                                    '</dataSet>' +
                                '</chart>' +
                            '</projectSummary>';

            return this.getXmlItem(queryString, xmlString);
        },

        // helper function to create a dojox.data.XmlItem
        getXmlItem: function (queryString, xmlString) {
            var doc = parser.parse(xmlString);
            var xmlElement = query('*', doc)[0];

            if (queryString == undefined) {
                queryString = this.exportParamDataQuery;
            }

            var fullRequestLocation = this.getMockStoreUrl() + '?' + queryString;
            var store = { url: fullRequestLocation };

            return new XmlItem(xmlElement, store, '');
        }
    };
});