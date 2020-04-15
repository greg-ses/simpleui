// ~/script/ScriptObjectRelMap
// Object Relationship Map for script XML to business objects

define(['dojo/_base/declare', 'dojo/query', 'dojo/_base/array', 'dojox/xml/parser',
        './_ScriptTemplateBuilder', '../utilities/DataFormat', '../utilities/XmlDomConstruct',
        './EntryEnum', './Arg', './Entry'],
function (declare, query, array, parser,
        _ScriptTemplateBuilder, DataFormat, Construct,
        EntryEnum, Arg, Entry) {

    return declare([_ScriptTemplateBuilder],
    {
        // script xml attributes/tags
        _cmdNameAttrib: 'cmdName',

        // public methods
        // returns /script/Entry from XML DOM
        toBusinessObject: function (/*XmlElement*/cmdXml) {
            var commandType = this._getCommandType(cmdXml);
            var uuid = this.puC.attr(cmdXml, this._uuidAttrib);

            var args = new Array();
            var argsXml = query(this._argTag, cmdXml);
            array.forEach(argsXml, function (argXml) {
                var id = this.puC.attr(argXml, this._argIdAttrib);
                var name = this.puS.getElementText(this._argNameTag, argXml);
                var valueType = this._getValueTypeFromTemplate(name, commandType);
                var value = this._getTypedValue(argXml, valueType);

                var arg = new Arg(id, name, value, valueType);
                args.push(arg);
            }, this);
            this._addMissingArgsToBusinessObject(args, commandType);

            var updateSequence = new Array();
            this._populateUpdateSequenceFromXmlElement(cmdXml, updateSequence);

            var entry = new Entry(uuid, commandType, args, updateSequence);
            return entry;
        },

        // converts business object into XML DOM
        // returns XmlElement
        toXmlElement: function (/*Entry*/entry) {
            var cmdXml = Construct.create(this._commandTag);
            this.puC.attr(cmdXml, this._cmdNameAttrib, this._cmdTypeKeyMap[entry.commandType].name);
            this.puC.attr(cmdXml, this._cmdTypeAttrib, entry.commandType.toString());
            this.puC.attr(cmdXml, this._uuidAttrib, entry.uuid);

            array.forEach(entry.args, function (arg) {
                this._insertArg(cmdXml, arg);
            }, this);

            this._insertUpdateSequence(cmdXml, entry.updateSequence);

            return cmdXml;
        },

        // private methods
        // adds xml representation for Arg to cmdElement
        _insertArg: function (/*XmlElement*/cmdElement, /*Arg*/arg) {
            var argElement = Construct.create(this._argTag);
            this.puC.attr(argElement, this._argIdAttrib, arg.id);

            var nameElement = Construct.create(this._argNameTag);
            parser.textContent(nameElement, arg.name);
            Construct.place(nameElement, argElement);

            var valueElement = Construct.create(this._argValueTag);
            parser.textContent(valueElement, arg.value);
            Construct.place(valueElement, argElement);

            Construct.place(argElement, cmdElement);
        },

        // adds xml representation for updateSequence to cmdElement
        _insertUpdateSequence: function (/*XmlElement*/cmdElement, /*{updateArgId: string, once: bool}[]*/updateSequence) {
            var updateSequenceElement = Construct.create(this._updateSequenceTag);
            array.forEach(updateSequence, function (update) {
                this._insertUpdate(updateSequenceElement, update);
            }, this);

            Construct.place(updateSequenceElement, cmdElement);
        },

        _insertUpdate: function (/*XmlElement*/updateSequenceElement, /*{updateArgId: string, once: bool}*/update) {
            var updateElement = Construct.create(this._updateArgIdTag);
            parser.textContent(updateElement, update.updateArgId);
            this.puC.attr(updateElement, this._updateOnceAttrib, update.once);
            Construct.place(updateElement, updateSequenceElement);
        },

        // augments args with any missing Args from the template
        _addMissingArgsToBusinessObject: function (/*Arg[]*/args, /*EntryEnum.CommandType*/commandType) {
            array.forEach(this._commandTemplates[commandType].args, function (templateArg) {
                var argExists = array.some(args, function(arg) {
                    return (arg.id == templateArg.id);
                });

                if (!argExists) {
                    var value = templateArg.initialValue ? templateArg.initialValue : 0;
                    var arg = new Arg(templateArg.id, templateArg.name, value, templateArg.valueType);
                    args.push(arg);
                }
            });
        },

        // returns valueType for <arg> with given name for given commandType
        // '*' is wildcard that will always apply (note: '*' overrides any named args in command)
        _getValueTypeFromTemplate: function (/*string*/name, /*EntryEnum.CommandType*/commandType) {
            var templateArgs = this._commandTemplates[commandType].args;
            for (var i = 0; i < templateArgs.length; i++) {
                if (name == templateArgs[i].name) {
                    return templateArgs[i].valueType;
                }
                else if (templateArgs[i].name == '*') {
                    return EntryEnum.ValueType.String;
                }
            }

            // not in basic template: look in extensions
            for (var j = 0; j < this._extensionTemplates.length; j++) {
                for (var k = 0; k < this._extensionTemplates[j].extensionItems.length; k++) {
                    var extensionTemplateArg = this._extensionTemplates[j].extensionItems[k].value;
                    if (name == extensionTemplateArg.name) {
                        return extensionTemplateArg.valueType;
                    }
                }
            }
        },

        _getTypedValue: function (/*XmlElement*/arg, /*EntryEnum.ValueType*/valueType) {
            var valueStr = this.puS.getElementText(this._argValueTag, arg);
            switch (valueType) {
                case (EntryEnum.ValueType.Select):
                case (EntryEnum.ValueType.String):
                    return valueStr;

                case (EntryEnum.ValueType.Float):
                    return Number(valueStr);

                case (EntryEnum.ValueType.Bool):
                    return DataFormat.toBool(valueStr);

                case (EntryEnum.ValueType.Int):
                case (EntryEnum.ValueType.TimeOfDay):
                case (EntryEnum.ValueType.TimeSpan):
                case (EntryEnum.ValueType.TimeStamp):
                    return parseInt(valueStr);

                default:
                    break;
            }
        }
    });
});

