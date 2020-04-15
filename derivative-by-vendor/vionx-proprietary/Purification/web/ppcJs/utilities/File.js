// ~/utilities/File
// file processing utilities

define(['dojox/xml/parser'], function (parser) {
    return {
        minChars: 1,
        maxQnxChars: 40,

        // returns true if meets following criteria
        // 1 - 40 characters
        // valid characters: 'A'..'Z', 'a'..'z', '0'..'9', ' ', '_', '-'
        verifyQnxFileName: function (/*string*/fileName) {
            var pattern = new RegExp('[^A-Za-z0-9 _-]');
            var validMinLength = (fileName.length >= this.minChars);
            var validMaxLength = (fileName.length <= this.maxQnxChars);
            var invalidCharFound = pattern.test(fileName);

            return validMinLength && validMaxLength && !invalidCharFound;
        },

        // returns file extension (less dot)
        getExtension: function (/*string*/fileName) {
            var terms = fileName.split('.', 2);
            if (terms.length > 1) {
                return terms[1];
            }
        },

        // returns file name with '.xxx' removed
        removeExtension: function (/*string*/fileName) {
            var terms = fileName.split('.', 1);
            return terms[0];
        },

        // returns string
        // applies custom namespace to nullify default xhtml display styling so nodelist will display in browsers
        serializeXml: function (/*XmlElement*/xmlElement) {
            var xmlString = parser.innerXML(xmlElement);
            // change to custom namespace
            var customNsXmlStr = xmlString.replace('w3.org/1999/xhtml', 'premiumpower.com');

            return customNsXmlStr;
        }
    };
});