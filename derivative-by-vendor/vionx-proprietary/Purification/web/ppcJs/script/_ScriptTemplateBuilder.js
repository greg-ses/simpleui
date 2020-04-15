// ~/script/_ScriptTemplateBuilder
// base XML script template parser class

/* builds two template structures from ctorObj XmlElement
Templates indexed by EntryEnum.CommandType
    _commandTemplates : ScriptTemplate.Entry[]
        [i] : ScriptTemplate.Entry
                .args : ScriptTemplate.Arg[]
                    [i] : ScriptTemplate.Arg
                        .name : string
                        .configObj : ScriptTemplate.Constraint or other (min, max, options)
                        .extensions : ScriptTemplate.Extension[] - for selects, references by index

Dictionary of extensions where each extension can be referenced from a command template arg or recursively from another extension
    _extensionTemplates: ScriptTemplate.Extension[]
        [i] : ScriptTemplate.Extension
                .keyword : string
                .extensionItems : ScriptTemplate.ExtensionItem[]
                    [i] : ScriptTemplate.ExtensionItem
                        .ref : to recursive extension
                        .value : string | ScriptTemplate.Arg
*/

define(['dojo/_base/declare', 'dojo/query', 'dojo/_base/array', 'dojox/xml/parser',
        '../utilities/Compatibility', '../utilities/DataFormat', '../utilities/Identity', '../utilities/Reflection', '../utilities/Store',
        './EntryEnum', './_ScriptEnumMap',
        './schema/ArgTemplate', './schema/Constraint', './schema/EntryTemplate', './schema/Extension', './schema/ExtensionItem'],
function (declare, query, array, parser,
        Compatibility, DataFormat, Identity, Reflection, Store,
        EntryEnum, _ScriptEnumMap,
        ArgTemplate, Constraint, EntryTemplate, Extension, ExtensionItem) {

    return declare([_ScriptEnumMap],
    {
        // aliases
        puC: Compatibility,
        puS: Store,

        // template xml tags
        _commandTag: 'cmd',
        _cmdTypeAttrib: 'cmdtype',
        _cmdCategoryAttrib: 'category',
        _uuidAttrib: 'uuid',

        _argTag: 'arg',
        _argIdAttrib: 'id',
        _argNameTag: 'name',
        _argValueTag: 'value',
        _argOptionTag: 'argOption',
        _argValueTypeAttrib: 'valuetype',
        _argInitialValueAttrib: 'initialvalue',
        _argChangeEventTypeAttrib: 'changeeventtype',
        _argRefAttrib: 'ref',
        _argMinAttrib: 'min',
        _argMaxAttrib: 'max',
        _argReadOnlyAttrib: 'read',
        _argHideAttrib: 'hide',
        _argLabelAttrib: 'label',
        _argHideLabelAttrib: 'hidelabel',

        _updateSequenceTag: 'updateSequence',
        _updateArgIdTag: 'updateArgId',
        _updateOnceAttrib: 'once',

        _refsTag: 'refs',

        // static protected variables
        _commandTemplates: {},
        _extensionTemplates: {},

        _numValueTypes: 0,

        constructor: function (/*XmlElement*/commandTemplates) {
            var staticsNeedInit = !Identity.isArray(this._commandTemplates);
            if (staticsNeedInit) {
                this._createExtensionTemplates(commandTemplates);
                this._createCommandTemplates(commandTemplates);
            }
            this._numValueTypes = Reflection.fieldCount(EntryEnum.ValueType);
        },

        // protected methods
        _createCommandTemplates: function (/*XmlElement*/commandTemplates) {
            var numCommands = Reflection.fieldCount(EntryEnum.CommandType);
            this._commandTemplates = new Array(numCommands);

            // parse into template objects:
            //  - by command type. TODO: refactor to cmdTypes>cmd and remove !isNaN test from _addCommandTemplate
            query(this._commandTag, commandTemplates).forEach(this._addCommandTemplate, this);
        },

        _createExtensionTemplates: function (/*XmlElement*/commandTemplates) {
            this._extensionTemplates = new Array();
            var refsBlock = Store.getElement(this._refsTag, commandTemplates);
            var extensions = query('>*', refsBlock);

            array.forEach(extensions, function (extension, i) {
                // create ScriptTemplate.Extension
                var name = extension.tagName;
                var extensionItems = new Array();

                var extensionChildren = query('>*', extension);
                array.forEach(extensionChildren, function (extensionChild, i) {
                    var ref = Compatibility.attr(extensionChild, this._argRefAttrib);
                    switch (extensionChild.tagName) {
                        case (this._argOptionTag):
                            extensionItems.push(new ExtensionItem(parser.textContent(extensionChild), ref));
                            break;
                        case (this._argTag):
                            var argTemplate = this._createArgTemplate(extensionChild);
                            extensionItems.push(new ExtensionItem(argTemplate, ref));
                            break;
                        default:
                            break;
                    }
                }, this);

                // second pass for ref links in extensions
                var extensionTemplate = new Extension(name, extensionItems);
                this._extensionTemplates.push(extensionTemplate);
            }, this);
        },

        _addCommandTemplate: function (/*XmlElement*/commandTemplate) {
            var cmdType = this._getCommandType(commandTemplate);
            if (!isNaN(cmdType)) {
                var entryTemplate = new EntryTemplate();
                var args = query(this._argTag, commandTemplate);
                array.forEach(args, function (arg) {
                    var argTemplate = this._createArgTemplate(arg);
                    entryTemplate.args.push(argTemplate);
                }, this);

                this._populateUpdateSequenceFromXmlElement(commandTemplate, entryTemplate.updateSequence);

                this._commandTemplates[cmdType] = entryTemplate;
                this._cmdTypeKeyMap[cmdType].category = this._getCommandCategory(commandTemplate);
            }
        },

        _populateUpdateSequenceFromXmlElement: function (/*XmlElement*/parent, /*{updateArgId: string, once: bool}[]*/updateSequence) {
            var updateElements = query(this._updateArgIdTag, parent);
            array.forEach(updateElements, function (updateArgId) {
                var once = Compatibility.attr(updateArgId, this._updateOnceAttrib);
                updateSequence.push({ updateArgId: parser.textContent(updateArgId), once: DataFormat.toBool(once) });
            }, this);
        },

        _getCommandType: function (/*XmlElement*/commandTemplate) {
            return parseInt(Compatibility.attr(commandTemplate, this._cmdTypeAttrib));
        },

        _getCommandCategory: function (/*XmlElement*/commandTemplate) {
            return Compatibility.attr(commandTemplate, this._cmdCategoryAttrib);
        },

        _createArgTemplate: function (/*XmlElement*/argXml) {
            var id = Compatibility.attr(argXml, this._argIdAttrib);
            var name = Compatibility.attr(argXml, this._argNameTag);
            var label = Compatibility.attr(argXml, this._argLabelAttrib);

            var valueTypeStr = Compatibility.attr(argXml, this._argValueTypeAttrib);
            var valueType = Reflection.getValueFromApproximateKey(valueTypeStr, EntryEnum.ValueType);

            var intialValue = Compatibility.attr(argXml, this._argInitialValueAttrib);
            var typedInitialValue = EntryEnum.isOfType(intialValue, valueType) ? intialValue : null;

            var changeEventType = parseInt(Compatibility.attr(argXml, this._argChangeEventTypeAttrib));
            if (!Reflection.validateEnumValue(changeEventType, EntryEnum.EventArgType)) {
                changeEventType = EntryEnum.EventArgType.None;
            }

            var min = Compatibility.attr(argXml, this._argMinAttrib);
            var max = Compatibility.attr(argXml, this._argMaxAttrib);
            var readOnlyStr = Compatibility.attr(argXml, this._argReadOnlyAttrib);
            var readOnly = DataFormat.toBool(readOnlyStr);
            var hide = DataFormat.toBool(Compatibility.attr(argXml, this._argHideAttrib));
            var hideLabel = DataFormat.toBool(Compatibility.attr(argXml, this._argHideLabelAttrib));
            
            //if ((min && max) || readOnly || hide || hideLabel) {
                var configObj = new Constraint(min, max, readOnly, hide, hideLabel);
            //}

            // certain valueType require special handling to get options and extensions
            switch (valueType) {
                case (EntryEnum.ValueType.Select):
                    configObj.options = new Array();
                    var ref = Compatibility.attr(argXml, this._argRefAttrib);
                    if (ref) {
                        // get options from ref block
                        var extensionItems = this._getExtension(ref).extensionItems;
                        var optionExtensions = new Array(extensionItems.length);
                        array.forEach(extensionItems, function (item, i) {
                            configObj.options.push(item.value);

                            // if recursive extension exists, add to corresponding index
                            if (item.ref) {
                                optionExtensions[i] = this._getExtension(item.ref);
                            }
                        }, this);
                    }
                    else {
                        // options embedded
                        var argOptions = query(this._argOptionTag, argXml);
                        array.forEach(argOptions, function (argOption) {
                            configObj.options.push(parser.textContent(argOption));
                        });
                    }
                    break;

                case (EntryEnum.ValueType.Substitution):
                    var ref = Compatibility.attr(argXml, this._argRefAttrib);
                    if (ref) {
                        var optionExtensions = new Array();
                        optionExtensions.push(this._getExtension(ref));
                    }
                    break;

                default:
                    break;
            }

            return new ArgTemplate(id, name, valueType, configObj, optionExtensions, typedInitialValue, changeEventType, label);
        },

        _getExtension: function (/*string*/refTag) {
            for (var i = 0; i < this._extensionTemplates.length; i++) {
                if (this._extensionTemplates[i].keyword === refTag) {
                    return this._extensionTemplates[i];
                }
            }
        },

        _isArg: function (item) {

            if (item && item.name) {
                var validValueType = ((item.valueType >= 0) && (item.valueType < this._numValueTypes));
                return validValueType;
            }
            else {
                return false;
            }
        }
    });
});
