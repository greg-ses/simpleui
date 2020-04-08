dojo.provide('ppcJs.tests.ParamTreeNodeTest');
dojo.require('ppcJs.ParamTreeNode');
//dojo.require('dojox.xml.parser');
//dojo.require('dojox.data.XmlStore');
dojo.require('ppcJs.tests.ParamControlTestUtilities');


doh.register('ppcJs.tests.ParamTreeNodeTest',
    [
        function testConstruct(t) {

            var item = ppcJs.tests.ParamControlTestUtilities.getIntXmlItem();
            var sut = new ppcJs.ParamTreeNode({ item: item });
            t.assertTrue(true);
        }
    ]
);