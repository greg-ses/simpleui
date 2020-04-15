dojo.provide('ppcJs.tests.ScriptRunnerTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.ScriptRunnerTest', dojo.moduleUrl('ppcJs', 'tests/ScriptRunnerTest.html'), 20000);
}