// ~/utilities/XmlDomConstruct
// Wrapper for XML parser to parallel dojo/dom-construct methods

define(['dojox/xml/parser'], function (parser) {
    return {
        create: function (nodeName) {
            var xmlStr = '<' + nodeName + '/>';
            var xmlDoc = parser.parse(xmlStr, 'text/xml');
            return xmlDoc.firstChild;
        },

        place: function (node, refNode) {
            refNode.appendChild(node);
        }
    };
});