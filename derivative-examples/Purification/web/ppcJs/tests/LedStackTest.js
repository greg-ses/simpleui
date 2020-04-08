dojo.provide('ppcJs.tests.LedStackTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.LedStackTest', dojo.moduleUrl('ppcJs', 'tests/LedStackTest.html'), 20000);
}