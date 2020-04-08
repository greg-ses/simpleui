dojo.provide('ppcJs.tests.CallQueueTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.CallQueueTest', dojo.moduleUrl('ppcJs', 'tests/CallQueueTest.html'), 20000);
}