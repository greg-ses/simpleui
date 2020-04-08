dojo.provide('ppcJs.tests.ParamControlTest');
dojo.require('ppcJs.control.Param');
//dojo.require('dojox.xml.parser');
//dojo.require('dojox.data.XmlStore');
dojo.require('ppcJs.tests.ParamControlTestUtilities');


doh.register('ppcJs.tests.ParamControlTest',
    [
        function testInitialState(t) {
            var queryString = '';
            var item = ppcJs.tests.ParamControlTestUtilities.getIntXmlItem();
            var sut = new ppcJs.control.Param({ _item: item });
            t.assertTrue(sut._viewState === sut.viewStateEnum.Initial);
        }
    ]
);