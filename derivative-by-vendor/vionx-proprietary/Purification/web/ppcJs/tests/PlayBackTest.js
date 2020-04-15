dojo.provide('ppcJs.tests.PlayBackTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.PlayBackTest', dojo.moduleUrl('ppcJs', 'tests/PlayBackTest.html'), 20000);
}