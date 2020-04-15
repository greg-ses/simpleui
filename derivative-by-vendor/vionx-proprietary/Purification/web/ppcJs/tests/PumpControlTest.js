dojo.provide('ppcJs.tests.PumpControlTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.PumpControlTest', dojo.moduleUrl('ppcJs', 'tests/PumpControlTest.html'), 20000);
}