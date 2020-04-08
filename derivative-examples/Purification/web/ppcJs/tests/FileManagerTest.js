dojo.provide('ppcJs.tests.FileManagerTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.FileManagerTest', dojo.moduleUrl('ppcJs', 'tests/FileManagerTest.html'), 20000);
}