dojo.provide('ppcJs.tests.ScriptManagerTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.ScriptManagerTest', dojo.moduleUrl('ppcJs', 'tests/ScriptManagerTest.html'), 20000);
}