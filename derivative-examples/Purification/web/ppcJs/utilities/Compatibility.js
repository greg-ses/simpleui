// utilties singleton for cross-browser support

define(['dojo/has', 'dojo/sniff', 'dojo/dom-attr'],
function (has, sniff, domAttr) {
    return {
        // get DOM attribute value, works with IE for XML DOMs, which dojo.attr doesn't
        attr: function (/*DOM node*/node, /*string*/attribName, value) {
            if (value) {
                if (has('ie')) {
                    return node.setAttribute(attribName, value);
                }
                else {
                    return domAttr.set(node, attribName, value);
                }
            }
            else {
                if (has('ie')) {
                    return node.getAttribute(attribName);
                }
                else {
                    return domAttr.get(node, attribName);
                }
            }
        },

        // returns true if supports text html5 file API
        hasBasicHtmlFileApiSupport: function () {
            if (window.File && window.FileReader && window.FileList) {
                return true;
            }
            else {
                return false;
            }
        },

        // returns true if supports text and binary html5 file API
        hasCompleteHtmlFileApiSupport: function () {
            if (this.hasBasicHtmlFileApiSupport() && window.Blob) {
                return true;
            }
            else {
                return false;
            }
        }
    };
});