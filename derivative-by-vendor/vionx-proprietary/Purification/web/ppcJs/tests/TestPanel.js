// ~/tests/TestPanel
// test instance for _Panel

define(['dojo/_base/declare', '../panel/_Panel', 'dojo/text!./template/TestPanel.html'],
function (declare, _Panel, template) {
    return declare([_Panel], 
    {
        // dijit variables
        templateString: template
    });
});