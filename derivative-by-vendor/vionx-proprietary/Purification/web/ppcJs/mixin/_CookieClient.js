// ~/mixin/_CookieClient
// provides cookie access using unified cookie policies
// if disabled, maintains object in memory instead of reading/writing to cookie 

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/cookie',
        '../utilities/DataFormat', '../utilities/Identity', '../utilities/Json'],
function (declare, lang, array, cookie,
        DataFormat, Identity, Json) {

    // private static variables
    var _maxCookieSize = 2000;

    return declare(null,
    {
        // cookies
        _cookieDisable: 'ccDisable',
        _disableCookieObj: {},
        _localCookieObj: {},    // static so same "in-memory cookies" accessible to all instances 

        _policy: {expires: 30},    // static policy

        // wrapper for dojo/cookie(), injects static policy and applies serialization as needed
        _cookie: function (/*string*/name, /*string or object, optional*/value, /*object, optional*/customProps) {
            var props = lang.clone(this._policy);

            if (value) {
                if (Identity.isObject(customProps)) {
                    props = lang.mixin(props, customProps);
                }

                if (DataFormat.sizeOf(value) < _maxCookieSize) {
                    if (this._isEnabled()) {
                        cookie(name, Json.serialize(value), props);
                    }
                    else {
                        this._localCookieObj[name] = value;
                    }
                }
            }
            else {
                var readFromCookie = this._isEnabled() || !this._localCookieObj[name];
                if (readFromCookie) {
                    var result = cookie(name);
                    return Json.deserialize(result);
                }
                else {
                    return this._localCookieObj[name];
                }
            }
        },

        _addDisableCookiesProperty: function (/*object*/obj)
        {
            if (obj) {
                obj[this._cookieDisable] = 'true';
            }
        },

        // mixin new property {cookieName: cookieValue} into obj
        _addCookieAsStringProperty: function (/*object*/obj, /*string*/name, id) {
            var value = id? this._getItemFromCookieList(name, id) : this._cookie(name);
            obj[name] = Json.serialize(value);
        },

        _isEnabled: function () {
            return (!this._disableCookieObj[this._cookieDisable]);
        },

        // where cookie is array of {id:, item: }
        _updateCookieList: function (cookieName, id, item) {
            var cookieObj = null;
            var objList = this._isEnabled() ? this._cookie(cookieName) : this._localCookieObj[cookieName];

            if (objList) {
                if (Identity.isArray(objList)) {
                    array.some(objList, function (/*CookieObject*/obj) {
                        if (obj.id == id) {
                            cookieObj = obj;
                            return true;
                        }
                    }, this);
                }
                else {
                    objList = new Array();
                }
            }
            else {
                var objList = new Array();
            }

            // update existing cookie object if it exists. otherwise create a new cookie object
            if (cookieObj) {
                cookieObj.item = item;
            }
            else {
                objList.push({ id: id, item: item });
            }

            this._cookie(cookieName, objList);
        },

        // where cookie is array of {id:, item: }
        // if onlyVerifyExists set, returns true if the cookie exists
        _getItemFromCookieList: function (cookieName, id, /*optional*/onlyVerifyExists) {
            var item = false;

            var objList = this._cookie(cookieName);
            if (objList) {
                if (Identity.isArray(objList)) {
                    array.some(objList, function (/*CookieObject*/obj) {
                        if (obj.id == id) {
                            item = onlyVerifyExists? true : obj.item;
                            return true;
                        }
                    }, this);
                }
            }

            return item;
        },

        // replace specified cookie with query string object on first load
        _updateCookieFromQuery: function (cookieName, queryObj, /*optional, if using cookie list*/id) {
            if (queryObj) {
                var disable = queryObj[this._cookieDisable];
                if (disable) {
                    // singleton to create property as defined by _cookieDisable
                    this._disableCookieObj[this._cookieDisable] = disable;
                }

                var cookieVal = queryObj[cookieName];
                if (cookieVal) {
                    if (id) {
                        cookieVal = Json.deserialize(cookieVal);
                        this._updateCookieList(cookieName, id, cookieVal);
                    }
                    else {
                        this._cookie(cookieName, cookieVal);
                    }

                    delete queryObj[cookieName];
                }
            }
        }
    });
});