// ~/script/EntryControlFactory
// template based factory for ScriptEntryControls

define(['dojo/_base/declare', 'dojo/_base/array', 'dojox/uuid/generateRandomUuid',
        './_ScriptTemplateBuilder', '../utilities/DataFormat', '../utilities/Identity',
        './Arg', './Entry', '../script/EntryEnum', '../control/ScriptEntry'],
function (declare, array, generateRandomUuid,
        _ScriptTemplateBuilder, DataFormat, Identity,
        Arg, Entry, EntryEnum, ScriptEntry) {

    return declare([_ScriptTemplateBuilder],
    {
        // private variables
        _templateReference: '',

        // public methods
        constructor: function (/*XmlElement*/commandTemplates) {
            this._processTemplateRefs(commandTemplates);
            this.inherited(arguments);
        },

        // returns blank ScriptEntryControl if passed commandType or configured ScriptEntryControl if passed Entry
        getControl: function (/*script.Entry OR EntryEnum.CommandType*/scriptEntry, /*bool*/replaceUuid) {
            var entryControl = new ScriptEntry();

            if (Identity.isObject(scriptEntry)) {
                this._populateEntryControl(scriptEntry.commandType, entryControl);
                if (replaceUuid) {
                    scriptEntry.uuid = dojox.uuid.generateRandomUuid();
                }
                entryControl.configure(scriptEntry);
            }
            else if (DataFormat.isInt(scriptEntry)) {
                var defaultEntry = this._generateDefaultEntry(scriptEntry);
                this._populateEntryControl(scriptEntry, entryControl);
                entryControl.configure(defaultEntry);
            }

            return entryControl;
        },

        // private methods
        _processTemplateRefs: function (/*XmlElement*/commandTemplates) {
        },

        _populateEntryControl: function (/*EntryEnum.CommandType*/cmdType, /*ScriptEntry*/entryControl) {
            var entryTemplate = this._commandTemplates[cmdType];
            array.forEach(entryTemplate.args, function (arg, i) {
                this._addWidget(arg, entryControl);
            }, this);
        },

        _addWidget: function (/*script/schema/ArgTemplate*/arg, /*ScriptEntry*/entryControl, /*optional, ScriptTemplate.Extension.keyword*/reference) {
            if (this._isArg(arg)) {
                switch (arg.valueType) {
                    case (EntryEnum.ValueType.Select):
                        // get select options based on keyword, compile extension refs
                        var extensionRefs = this._getExtensionRefs(arg.extensions);
                        entryControl.addSelect(arg, extensionRefs, reference);
                        this._addExtensionWidgets(arg.extensions, entryControl);
                        break;

                    case (EntryEnum.ValueType.Float):
                        entryControl.addFloat(arg, reference);
                        break;

                    case (EntryEnum.ValueType.Int):
                        entryControl.addInt(arg, reference);
                        break;

                    case (EntryEnum.ValueType.String):
                        entryControl.addString(arg, reference);
                        break;

                    case (EntryEnum.ValueType.Substitution):
                        var extensionRefs = this._getExtensionRefs(arg.extensions);
                        entryControl.addSubstitution(arg, extensionRefs, reference);
                        this._addExtensionWidgets(arg.extensions, entryControl);
                        break;

                    case (EntryEnum.ValueType.TimeOfDay):
                        entryControl.addTimeOfDay(arg, reference);
                        break;

                    case (EntryEnum.ValueType.TimeSpan):
                        entryControl.addTimeSpan(arg, reference);
                        break;

                    case (EntryEnum.ValueType.TimeStamp):
                        entryControl.addTimeStamp(arg, reference);
                        break;

                    default:
                        break;
                }
            }
        },

        _generateDefaultEntry: function (/*ScriptEnum.CommandType*/cmdType) {
            var id = dojox.uuid.generateRandomUuid();
            var args = new Array();
            var refArgs = this._commandTemplates[cmdType].args;

            array.forEach(refArgs, function (refArg) {
                var defaultVal = refArg.initialValue ? refArg.initialValue : EntryEnum.getDefaultValue(refArg.valueType);

                // valueType specific arg configuration
                switch (refArg.valueType) {
                    case (EntryEnum.ValueType.Select):
                        var name = refArg.name;
                        var valueType = refArg.valueType;
                        defaultVal = refArg.configObj.options[0];
                        break;

                    case (EntryEnum.ValueType.Substitution):
                        var name = '';
                        var valueType = EntryEnum.ValueType.String;
                        defaultVal = EntryEnum.getDefaultValue(EntryEnum.ValueType.String);
                        break;

                    default:
                        var name = refArg.name;
                        var valueType = refArg.valueType;
                        break;
                }

                args.push(new Arg(refArg.id, name, defaultVal, valueType));
            }, this);

            return new Entry(id, cmdType, args, this._commandTemplates[cmdType].updateSequence);
        },

        // extracts keyword strings from extensions into a separate string array
        _getExtensionRefs: function (/*ScriptTemplate.Extension[]*/extensions) {
            if (extensions) {
                var extensionRefs = new Array(extensions.length);
                array.forEach(extensions, function (extension, i) {
                    if (extension) {
                        extensionRefs[i] = extension.keyword;
                    }
                });

                return extensionRefs;
            }
        },

        // iterate through entryTemplate.args for refs, if ref block(s) contain Args, add them to entryControl
        _addExtensionWidgets: function (/*ScriptTemplate.Extension[]*/extensions, /*ScriptEntry*/entryControl) {
            array.forEach(extensions, function (extension, i) {
                if (extension) {
                    array.forEach(extension.extensionItems, function (extensionItem, i) {
                        this._addWidget(extensionItem.value, entryControl, extension.keyword);
                    }, this);
                }
            }, this);
        }
    });
});
