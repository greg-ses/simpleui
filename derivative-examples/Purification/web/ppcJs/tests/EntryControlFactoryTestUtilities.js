// EntryControlFactory test utilities

dojo.provide('ppcJs.tests.EntryControlFactoryTestUtilities');

dojo.require('ppcJs.tests.ParamControlTestUtilities');

ppcJs.tests.EntryControlFactoryTestUtilities = {
    getPostData: function () {
        var xmlString = '<cmds>' +
                          '<cmd cmdType="1" uuid="a8e21a20-d040-11e1-9b23-0800200c9a66">' +
                            '<arg id="1">' +
                              '<name>time</name>' +
                              '<value>10</value>' +
                            '</arg>' +
                            '<arg id="2">' +
                              '<name>COMMAND</name>' +
                              '<value>strip</value>' +
                            '</arg>' +
                          '</cmd>' +
                        '</cmds>';
        //var xmlItem = ppcJs.tests.ParamControlTestUtilities.getXmlItem('', xmlString);
        //return xmlItem['element'];
        return xmlString;
    }
};