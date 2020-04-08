// ~/script/_ScriptEnumMap
// script enumeration mapping behavior: generates static reverse enum map

define(['dojo/_base/declare', 'dojo/_base/lang', './EntryEnum'],
function (declare, lang, EntryEnum) {
    return declare(null,
    {
        // reverse map to index EntryEnum.CommandType names by value, initialized to object so static field
        _cmdTypeKeyMap: {},        

        // public methods
        constructor: function () {
            if (!this._cmdTypeKeyMap[0]) {
                for (var key in EntryEnum.CommandType) {
                    if (EntryEnum.CommandType.hasOwnProperty(key)) {
                        this._cmdTypeKeyMap[EntryEnum.CommandType[key]] = { name: key, category: '' };
                    }
                }
            }
        }
    });
});