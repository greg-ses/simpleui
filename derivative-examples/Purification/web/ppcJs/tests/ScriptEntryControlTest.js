dojo.provide('ppcJs.tests.ScriptEntryControlTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.ScriptEntryControlTest', dojo.moduleUrl('ppcJs', 'tests/ScriptEntryControlTest.html'), 120000);
}