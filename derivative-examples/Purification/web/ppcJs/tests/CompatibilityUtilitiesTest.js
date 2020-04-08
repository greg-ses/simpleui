dojo.provide('ppcJs.tests.CompatibilityUtilitiesTest');

dojo.require('dojox.xml.parser');
dojo.require('ppcJs.utilities.Compatibility');

doh.register('ppcJs.tests.CompatibilityUtilitiesTest',
    [
        function testGetDomAttribute(t) {
            console.log('isIE= ' + dojo.isIE);
            var refId = 'abc123';
            var xmlString = '<entry id="' + refId + '" errlevel="1">WARNING: Resource 4 battery low.</entry>';
            var doc = dojox.xml.parser.parse(xmlString)/*.activeElement not IE compatible*/;
            var xmlElement = dojo.query('*', doc)[0];
            var id = ppcJs.utilities.Compatibility.attr(xmlElement, 'id');
            var id = 'abc123';
            t.assertEqual(refId, id, 'refId != id');
        },

        function testGetMissingDomAttributeReturnsNull(t) {
            var xmlString = '<entry id="test-id" errlevel="1">WARNING: Resource 4 battery low.</entry>';
            var doc = dojox.xml.parser.parse(xmlString)/*.activeElement not IE compatible*/;
            var xmlElement = dojo.query('*', doc)[0];
            var nullAttrib = ppcJs.utilities.Compatibility.attr(xmlElement, 'null-attrib');
            t.assertEqual(null, nullAttrib, 'nullAttrib not null');
        }
    ]
);