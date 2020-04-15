// ~/panel/scriptRunnerList/StateRegister
// helper class for ScriptRunnerList that manages collection of script.States. Provides:
// - selected resource's state
// - other active script names

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojox/collections/Dictionary', '../../Enum'],
function (declare, lang, Dictionary, Enum) {
    return declare(null,
    {
        _selectId: '',
        _states: null,      // dictionary, key=resourceId, value=script.State

        // lifecycle methods
        constructor: function () {
            this._states = new Dictionary();
        },

        // public methods
        select: function (id) {
            this._selectId = id;
        },

        getSelectId: function () {
            return this._selectId;
        },

        update: function (state) {
            if (state.resourceId) {
                this._states.add(state.resourceId, state);
            }
        },

        // returns (null arg) selected or (resourceId) script.State with .otherActiveScripts populated
        getState: function (/*optional*/resourceId) {
            var id = resourceId ? resourceId : this._selectId;
            if (id) {
                var state = lang.clone(this._states.item(id))
                this._states.forEach(function (entry) {
                    var isOtherResource = (entry.value.resourceId != id);
                    var activeFile = (entry.value.fileName && (entry.value.state != Enum.PlayBackState.Stopped));
                    if (isOtherResource && activeFile) {
                        state.otherActiveScripts.push(entry.value.fileName);
                    }
                }, this);

                return state;
            }
        },

        clear: function () {
            this._states.length = 0;
        }
    });
});