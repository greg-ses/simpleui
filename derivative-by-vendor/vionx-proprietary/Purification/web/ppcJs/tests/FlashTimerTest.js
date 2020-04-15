dojo.provide('ppcJs.tests.FlashTimerTest');

if (dojo.isBrowser) {
    //Define the HTML file/module URL to import as a 'remote' test.
    doh.registerUrl('ppcJs.tests.FlashTimerTest', dojo.moduleUrl('ppcJs', 'tests/FlashTimerTest.html'), 20000);
}