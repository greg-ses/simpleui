dojo.provide('ppcJs.tests.BaseControlTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.BaseControlTest', dojo.moduleUrl('ppcJs', 'tests/BaseControlTest.html'), 20000);
}