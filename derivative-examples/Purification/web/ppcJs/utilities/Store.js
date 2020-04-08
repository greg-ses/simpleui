// ~/utilities/Store
// static utilities for interacting with a Data Store's data item (XmlItem)

define(['dojo/_base/lang', 'dojo/query', 'dojo/io-query', 'dojo/json', 'dojox/xml/parser'],
function (lang, query, ioQuery, json, parser) {
    return {
        // returns:
        //  urlInfo[0] = relative url, excluding query string (prepended with '../' because /cgi isn't under doc root)
        //  urlInfo[1] = "server process" (from 'CGI={server process}' query command pair)
        // - if serverProcess is included, assigns it to url[1] in the returned array
        // - otherwise, extract server process from query string
        getUrlInfo: function (fullUrl, /*string, optional*/serverProcess) {
            var url = fullUrl.split('?');
            var queryStringExists = (url.length > 1);

            // create relative url '../{cgi directory}/{document}' - NOTE: only supports 1 directory depth
            var parsedUrl = url[0].split('/');
            var lastIndex = parsedUrl.length - 1;
            var urlInfo = ['../' + parsedUrl[lastIndex - 1] + '/' + parsedUrl[lastIndex]];

            if (serverProcess) {
                urlInfo.push(serverProcess);
            }
            else if (queryStringExists) {
                urlInfo.push(this._getQueryCommandValue(url[1], 'CGI'));
            }
            else {
                urlInfo.push('');   // null placeholder for CGI process
            }

            return urlInfo;
        },

        // returns url + query string (ex: 'url?CGI=sqreader&COMMAND=Chart') where:
        //  urlInfo = url array returned by getUrlInfo()
        //  partialQueryObj = object containing items representing query string variable pairs (less CGI var)
        getFullUrl: function (/*array*/urlInfo, partialQueryObj, testUrl) {
            var fullUrl = '';

            // substitute path to local test file if testing on localhost
            var ipAddress = window.location.host.split('.');
            /* Deprecated
            if ((ipAddress[0] === '127') || (window.location.hostname === 'localhost')) {
                urlInfo[0] = testUrl;
            }
            */

            // append control data query command
            var queryObject = { CGI: urlInfo[1] };
            lang.mixin(queryObject, partialQueryObj);
            var queryStr = ioQuery.objectToQuery(queryObject);
            fullUrl = urlInfo[0] + '?' + queryStr;

            return fullUrl;
        },

        // returns first XmlElement where:
        //  elementName = xml element name
        //  parentElement = xml element
        getElement: function (elementName, parentElement) {
            if (parentElement) {
                var elems = query(elementName, parentElement);
                if (elems.length > 0) {
                    return elems[0];
                }
                else {
                    return '';
                }
            }
            else {
                return '';
            }
        },

        // returns text content of xml element as string where:
        //  elementName = xml element name
        //  parentElement = xml element
        getElementText: function (elementName, parentElement) {
            if (parentElement) {
                var elems = query(elementName, parentElement);
                if (elems.length > 0) {
                    return parser.textContent(elems[0]);
                }
                else {
                    return '';
                }
            }
            else {
                return '';
            }
        },

        // returns content of xml element as JS object where:
        //  elementName = xml element name
        //  parentElement = xml element
        getElementObject: function (elementName, parentElement) {
            return json.parse(this.getElementText(elementName, parentElement));
        },

        // returns CSS3 selector when selecting by attribute value
        getCssAttribSelector: function (attribName, attribVal) {
            return ('[' + attribName + '="' + attribVal.toString() + '"]');
        },

        // summary: Function to convert an item into a JSON format.
        // store:
        //    The datastore the item came from.
        // item:
        //    The item in question.
        itemToJSON: function (store, item) {
            var result = {};
            if (item && store) {
                //Determine the attributes we need to process.
                var attributes = store.getAttributes(item);
                if (attributes && attributes.length > 0) {
                    var i;
                    for (i = 0; i < attributes.length; i++) {
                        var values = store.getValues(item, attributes[i]);
                        if (values) {
                            //Handle multivalued and single-valued attributes.
                            if (values.length > 1) {
                                var j;
                                result[attributes[i]] = [];
                                for (j = 0; j < values.length; j++) {
                                    var value = values[j];
                                    //Check that the value isn't another item. If it is, process it as an item.
                                    if (store.isItem(value)) {
                                        result[attributes[i]].push(json.parse(itemToJSON(store, value)));
                                    } else {
                                        result[attributes[i]].push(value);
                                    }
                                }
                            } else {
                                if (store.isItem(values[0])) {
                                    result[attributes[i]] = json.parse(itemToJSON(store, values[0]));
                                } else {
                                    result[attributes[i]] = values[0];
                                }
                            }
                        }
                    }
                }
            }
            return json.stringify(result);
        },


        // returns query command value for 'commandName' from 'queryString'
        //   ex: 'PBsqreader'
        _getQueryCommandValue: function (queryString, commandName) {
            var queryCommand = '';

            var queryParams = queryString.split('&');

            for (var i = 0; i < queryParams.length; i++) {
                var commandPair = queryParams[i].split('=');
                if (commandPair[0] === commandName) {
                    queryCommand = commandPair[1];
                    break;
                }
            }

            return queryCommand;
        }
    };
});