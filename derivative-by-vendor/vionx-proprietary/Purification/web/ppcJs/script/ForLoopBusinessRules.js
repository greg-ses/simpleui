// ~/script/ForLoopBusinessRules
// business rules for linking ForLoops and end Labels

define(['dojo/_base/declare', 'dojo/query', 'dojo/_base/array',
        'dojox/collections/Dictionary', './EntryEnum'],
function (declare, query, array,
        Dictionary, EntryEnum) {
    return declare(null,
    {
        _loopStartEndMap: null, // two-way dictionary (ScriptEntry, ScriptEntry) associating ForLoop and end Label entries (remove when clearing script)
        _changedUuidMap: null,  // for relinking of inserted scripts. key: uuidBefore, value: uuidAfter

        // lifecycle methods
        constructor: function () {
            this._loopStartEndMap = new Dictionary();
            this._changedUuidMap = new Dictionary();
        },

        // public methods
        // create a new loop
        addLoop: function (/*control/ScriptEntry*/entryControl, /*control/ScriptEntry*/labelControl) {
            var labelUuid = labelControl.getUuid();
            entryControl.update(labelUuid);
            this._loopStartEndMap.add(entryControl, labelControl);
            this._loopStartEndMap.add(labelControl, entryControl);
        },

        // returns matching of ForLoop/Label pair and removes link
        findRemoveMatchingEntry: function (deletedEntry) {
            if (this._loopStartEndMap.containsKey(deletedEntry)) {
                var matchingEntry = this._loopStartEndMap.item(deletedEntry);
                this._loopStartEndMap.remove(deletedEntry);
                this._loopStartEndMap.remove(matchingEntry);
                return matchingEntry;
            }
            else {
                return null;
            }
        },

        // register when changing UUID in order to later link starts and ends
        recordUuidChange: function (uuidBefore, uuidAfter) {
            this._changedUuidMap.add(uuidBefore, uuidAfter);
        },
        
        // link the ForLoops and Labels in the passed array
        linkStartsAndEnds: function (/*control/ScriptEntry[]*/entryControls) {
            var uuidsChanged = (this._changedUuidMap.count > 0);

            array.forEach(entryControls, function (entryControl) {
                var businessObj = entryControl.getValue();
                if (businessObj.commandType == EntryEnum.CommandType.ForLoop) {
                    var labelUuidArgId = '8';
                    var labelControl = null;

                    array.some(businessObj.args, function (arg) {
                        var argFound = (arg.id == labelUuidArgId);
                        if (argFound) {
                            if (uuidsChanged) {
                                arg.value = this._changedUuidMap.item(arg.value);
                            }
                            var labelUuid = arg.value;

                            array.some(entryControls, function (labelControl) {
                                var labelControlFound = (labelUuid == labelControl.getUuid());
                                if (labelControlFound) {
                                    this._loopStartEndMap.add(entryControl, labelControl);
                                    this._loopStartEndMap.add(labelControl, entryControl);
                                }

                                return labelControlFound;
                            }, this);
                        }

                        return argFound;
                    }, this);

                    entryControl.update(businessObj);
                }
            }, this);

            if (uuidsChanged) {
                this._changedUuidMap.clear();
            }
        },

        // returns linked entry if linked pair and corresponding event type, otherwise returns null
        getMatchingEntry: function (/*EntryEnum.EventArgType*/eventType, /*control/ScriptEntry*/eventPublisher) {
            var foundMatch = (eventType == EntryEnum.EventArgType.LinkedEntry && this._loopStartEndMap.containsKey(eventPublisher));
            var matchingEntry = foundMatch ? this._loopStartEndMap.item(eventPublisher) : null;

            return matchingEntry;
        }
    });
});