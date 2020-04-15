// test suite for /mixin/_CookieClient
// for timeout = 1.0 sec

dojo.provide('ppcJs.tests._CookieClientTest');
dojo.require('ppcJs.mixin._CookieClient');
dojo.require('dojo.cookie');
dojo.require('dojo.json');

doh.register('ppcJs.tests._CookieClientTest',
    [
        function testSaveObjToCookieAndGetReturnsObj(t) {
            var testCookieName = 'testCookie1';
            dojo.cookie(testCookieName, null, { expires: -1 }); // clear any existing testCookie1

            var value1 = 11;
            var obj = { item1: value1 };

            var sut = new ppcJs.mixin._CookieClient();
            sut._cookie(testCookieName, obj);

            var result = sut._cookie(testCookieName);
            t.assertEqual(value1, result.item1);
        },

        function testAddCookieToObjAsStringProperty(t) {
            var testCookieName = 'testCookie7';
            dojo.cookie(testCookieName, null, { expires: -1 }); // clear any existing testCookie1

            var value1 = 11;
            var obj = { item1: value1 };

            var sut = new ppcJs.mixin._CookieClient();
            sut._disableCookieObj = {};    // clear static disable field
            sut._cookie(testCookieName, obj);

            var resultObj = {};
            sut._addCookieAsStringProperty(resultObj, testCookieName);

            var refStr = dojo.json.stringify(obj);
            t.assertEqual(refStr, resultObj.testCookie7);
        },

        function testAddCookieFromListToObjAsStringProperty(t) {
            var testCookieName = 'testCookie8';
            dojo.cookie(testCookieName, null, { expires: -1 }); // clear any existing testCookie1

            var sut = new ppcJs.mixin._CookieClient();
            sut._disableCookieObj = {};    // clear static disable field

            var id1 = 'item1';
            var value1 = 11;
            var obj = { item1: value1 };

            sut._updateCookieList(testCookieName, id1, obj);
            var resultObj = {};
            sut._addCookieAsStringProperty(resultObj, testCookieName, id1);

            var refStr = dojo.json.stringify(obj);
            t.assertEqual(refStr, resultObj.testCookie8);
        },

        // read _localCookieObj instead of _cookie() to verify stored in memory
        function testUpdateFromQueryObjWhenDisabledReturnsResultFromMemory(t) {
            var testCookieName = 'testCookie2';
            var sut1 = new ppcJs.mixin._CookieClient();
            // verify default state
            t.assertTrue(sut1._isEnabled());

            // create query object with disable cookie
            var value1 = 'value1';
            var queryObj = { testCookie2: { item1: value1 } };
            sut1._addDisableCookiesProperty(queryObj);

            sut1._updateCookieFromQuery(testCookieName, queryObj);
            t.assertEqual(value1, sut1._localCookieObj.testCookie2.item1);

            var value2 = false;
            sut1._cookie(testCookieName, { item1: value2 });
            t.assertFalse(sut1._localCookieObj.testCookie2.item1);

            // verify singleton (all instances disabled, all instances same share "in-memory cookie")
            var sut2 = new ppcJs.mixin._CookieClient();
            sut2._cookie(testCookieName, { item1: value1 });
            var result = sut2._cookie(testCookieName);
            t.assertEqual(value1, result.item1);
            t.assertEqual(value1, sut1._localCookieObj.testCookie2.item1);
            t.assertEqual(value1, sut2._localCookieObj.testCookie2.item1);
        },

        // query object with JSON value
        function testUpdateFromQueryStringToCookieListStoresObj(t) {
            var testCookieName = 'testCookie9';
            dojo.cookie(testCookieName, null, { expires: -1 }); // clear any existing testCookie9
            var sut = new ppcJs.mixin._CookieClient();

            // create query object with disable cookie
            var value1 = 'value1';
            var queryObj = { testCookie9: '{ "item1": "value1" }' };
            var id = 'id1';
            sut._updateCookieFromQuery(testCookieName, queryObj, id);
            var result = sut._getItemFromCookieList(testCookieName, id);
            t.assertEqual(value1, result.item1);
        },


        function testUpdateCookieNullQueryKeepsObjectInMemory(t) {
            var testCookieName = 'testCookie3';
            var sut1 = new ppcJs.mixin._CookieClient();

            // create query object with disable cookie
            var value1 = 'value1';
            var queryObj = { testCookie3: { item1: value1 } };
            sut1._addDisableCookiesProperty(queryObj);

            sut1._updateCookieFromQuery(testCookieName, queryObj);
            sut1._updateCookieFromQuery(testCookieName);

            // verify queryObj still stored in memory
            t.assertEqual(value1, sut1._localCookieObj.testCookie2.item1);
        },

        // verify handling of item when cookie contains list of items
        function testUpdateAndGetItemFromCookieList(t) {
            var testCookieName = 'testCookie4';
            dojo.cookie(testCookieName, null, { expires: -1 }); // clear any existing testCookie4

            var sut1 = new ppcJs.mixin._CookieClient();
            sut1._disableCookieObj = {};    // clear static disable field

            var id1 = 'item1';
            var item1 = { testCookie: id1 };
            var id2 = 'item2';
            var item2 = true;
            var id3 = 'item3';

            sut1._updateCookieList(testCookieName, id1, item1);
            sut1._updateCookieList(testCookieName, id2, item2);
            sut1._updateCookieList(testCookieName, id3, false);

            var result1 = sut1._getItemFromCookieList(testCookieName, id1);
            t.assertEqual(id1, result1.testCookie);

            var result2 = sut1._getItemFromCookieList(testCookieName, id2);
            t.assertTrue(result2);

            var onlyVerifyExists = true;
            t.assertTrue( sut1._getItemFromCookieList(testCookieName, id3, onlyVerifyExists) );
        },

        function testUpdateCookieListFromQueryObjAndRetrieveCookie(t) {
            var testCookieName = 'testCookie5';
            dojo.cookie(testCookieName, null, { expires: -1 }); // clear any existing testCookie5

            var sut1 = new ppcJs.mixin._CookieClient();
            sut1._disableCookieObj = {};    // clear static disable field

            var id1 = 'id1';
            var value1 = 'value1';
            var queryObj = { testCookie5: { item1: value1 } };

            sut1._updateCookieFromQuery(testCookieName, queryObj, id1);

            var result = sut1._getItemFromCookieList(testCookieName, id1);
            t.assertEqual(value1, result.item1);
        },

        function testUpdateAndGetItemFromLocalCookieList(t) {
            var testCookieName = 'testCookie6';
            var sut1 = new ppcJs.mixin._CookieClient();

            var queryObj1 = { testCookie: 'true' };
            sut1._addDisableCookiesProperty(queryObj1);

            var id1 = 'item1';
            var item1 = { testCookie: id1 };

            sut1._updateCookieList(testCookieName, id1, item1);

            var result1 = sut1._getItemFromCookieList(testCookieName, id1);
            t.assertEqual(id1, result1.testCookie);
        }
    ]
);