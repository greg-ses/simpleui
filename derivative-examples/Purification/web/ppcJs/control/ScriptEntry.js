// ~/control/ScriptEntry
// ScriptEntryControl - generic script entry element control

// Responsibilities:
//  - maintain business object Script.Entry
//  - provide UI to set/get business object
//  - expanded/collapsed views, view locking

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/query', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/aspect', 'dojo/on',
        'dijit/registry', 'dijit/form/NumberSpinner', 'dijit/form/TextBox', 'dijit/form/NumberTextBox',
        'dojox/collections/Dictionary', 'dojox/layout/TableContainer', 'dojox/string/Builder',
        '../Enum', '../utilities/Identity', '../utilities/DateString', '../script/EntryEnum', '../script/Arg', '../script/_ScriptEnumMap',
        '../widget/CollapseToggle', '../widget/ExtendedSelect', '../widget/extendedSelect/esDto', './DateTime', './TimeOfDay', './TimeSpan',
        './_Control', './scriptEntry/seDto', 'dojo/text!./scriptEntry/template/scriptEntry.html'],
function (declare, lang, array, query, dom, construct, domClass, aspect, on,
        registry, NumberSpinner, TextBox, NumberTextBox,
        Dictionary, TableContainer, Builder,
        Enum, Identity, DateString, EntryEnum, Arg, _ScriptEnumMap,
        CollapseToggle, ExtendedSelect, esDto, DateTime, TimeOfDay, TimeSpan,
        _Control, seDto, template) {

    return declare([_Control, _ScriptEnumMap],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 2,

        // dijit variables
        name: 'Script Entry Control',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'scriptEntryControl',

        // css class names/in-line code
        _cssSelect: 'width: 100px',     // selects require in-line style
        _cssSpinner: 'width: 100px',    // spinners require in-line style
        _cssExpanded: 'secExpanded',
        _cssCollapsed: 'secCollapsed',

        // private variables
        _viewState: Enum.ViewState.Edit,
        _collapsed: false,
        _businessObject: '',
        _idWidgetMap: '',        // dictionary, key=arg.id, value=widget
        _refWidgetsMap: '',        // dictionary of ref to widget array
        _substitutionRef: '',      // substitution ref keyword to link extension widgets to given BO arg (max one ref keyword)
        _handlerList: '',   // event handlers
        _widgetToUpdate: null,     // widget with EntryEnum.EventArgType value that fired latest onClick event (waiting on data)

        // lifecycle methods
        constructor: function () {
            this.inherited(arguments);
            this._handlerList = new Array();
            this._idWidgetMap = new Dictionary();
            this._refWidgetsMap = new Dictionary();
        },

        // public methods
        // overrides _Control.configure
        configure: function (/*script.Entry*/businessObject) {
            this._updateBusinessObject(businessObject);
            this.controlTable.startup();
            this.expand(true);
            this._setWidgetToUpdate();
            this._applyDomSettings();
        },

        update: function (newValue) {
            if (Identity.isObject(newValue)) {
                this._updateBusinessObject(newValue);
            }
            else {
                this._updateWidgetValue(newValue);
            }
        },

        // overrides _Control.configure
        // returns script.Entry
        getValue: function () {
            var enableValueChangeEvent = false;
            array.forEach(this._businessObject.args, function (arg, i) {
                this._updateBoArg(arg, i, enableValueChangeEvent);
            }, this);
            return this._businessObject;
        },

        // returns string
        getUuid: function () {
            return this._businessObject.uuid;
        },

        // widget add functions, if ref is included, adds a widget linked by the ref (i.e., add an extension widget invoked by the linked parent widget)
        // where arg.configObj = script/schema/Constraint
        addSelect: function (/*script/schema/ArgTemplate*/arg, /*optional string[]*/extensionRefs, /*optional string*/ref) {
            // build options
            var optionsObj = new Array();
            var options = arg.configObj.options;
            for (var i = 0; i < options.length; i++) {
                optionsObj.push({ value: options[i], label: options[i] });
            }

            var ctorObj = {
                options: optionsObj,
                style: this._cssSelect,
                title: arg.name,
                eventType: arg.changeEventType
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.Select, ref));

            if (extensionRefs) {
                lang.mixin(ctorObj, new esDto.Ctor(extensionRefs));
            }

            var select = new ExtendedSelect(ctorObj);

            if (extensionRefs) {
                this._handlerList.push(aspect.after(select, 'onExtendedChange', lang.hitch(this, this._onSelectChange), true));
            }

            this._registerWidget(arg, select, ref);
        },

        // where arg.configObj = script/schema/Constraint
        addFloat: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
            var min = arg.configObj ? arg.configObj.min : null;
            var max = arg.configObj ? arg.configObj.max : null;
            var pattern = this._assembleFloatPattern(max);

            var ctorObj = {
                constraints: { places: 3 },
                value: 0,
                smalldelta: .1,
                style: this._cssSpinner,
                title: arg.name,
                eventType: arg.changeEventType,
                intermediateChanges:true
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.Float, ref));

            var spinner = new NumberSpinner(ctorObj);
            // add special update handler
            lang.mixin(spinner, { update: function (newValue) {
                    this.set('value', Number(newValue));
                }
            });

            this._registerWidget(arg, spinner, ref);
        },

        // where arg.configObj = script/schema/Constraint
        addInt: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
            var min = arg.configObj ? arg.configObj.min : null;
            var max = arg.configObj ? arg.configObj.max : null;

            var ctorObj = {
                constraints: { min: min, max: max, places: 0 },
                value: 0,
                smalldelta: 1,
                style: this._cssSpinner,
                title: arg.name,
                eventType: arg.changeEventType
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.Int, ref));

            var spinner = new NumberSpinner(ctorObj);

            this._registerWidget(arg, spinner, ref);
        },

        // where arg.configObj = script/schema/Constraint
        addString: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
            var container = construct.create('div');
            var ctorObj = {
                title: arg.name,
                value: '' /* no or empty value! */,
                eventType: arg.changeEventType,
                intermediateChanges: true
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.String, ref));

            var stringEntry = new TextBox(ctorObj, container);

            this._registerWidget(arg, stringEntry, ref);
        },

        // adds substitution mapping between extensionRef items and BO
        addSubstitution: function (/*script/schema/ArgTemplate*/arg, extensionRef, /*optional string*/ref) {
            this._substitutionRef = extensionRef;
        },

        addBool: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
        },

        // where arg.configObj = script/schema/Constraint
        addTimeSpan: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
            var ctorObj = {
                title: arg.name,
                eventType: arg.changeEventType
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.TimeSpan, ref));

            var time = new TimeSpan(ctorObj);
            this._registerWidget(arg, time, ref);
        },

        // where arg.configObj = script/schema/Constraint
        addTimeStamp: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
            var ctorObj = {
                title: arg.name,
                eventType: arg.changeEventType
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.TimeStamp, ref));

            var time = new DateTime(ctorObj);
            this._registerWidget(arg, time, ref);
        },

        // where arg.configObj = script/schema/Constraint
        addTimeOfDay: function (/*script/schema/ArgTemplate*/arg, /*optional string*/ref) {
            var ctorObj = {
                title: arg.name,
                eventType: arg.changeEventType
            };
            lang.mixin(ctorObj, new seDto.ComponentCtor(arg.id, EntryEnum.ValueType.TimeOfDay, ref));

            var time = new TimeOfDay(ctorObj);
            this._registerWidget(arg, time, ref);
        },

        setViewState: function (/*Enum.ViewState or Enum.ViewState[]*/viewState) {
            this._viewState = Identity.isArray(viewState)? viewState[0] : viewState;
            if (this._viewState == Enum.ViewState.View) {
                this.puP.hideDijit(this.collapseToggle);
                this.collapse();
            }
            else {
                this.puP.showDijit(this.collapseToggle);
            }
        },

        // forceExpand will override view state
        expand: function (/*optional, bool*/forceExpand) {
            var canExpand = (this._collapsed && (this._viewState == Enum.ViewState.Edit));
            if (canExpand || forceExpand) {
                this._idWidgetMap.forEach(function (widgetMapEntry) {
                    var widget = widgetMapEntry.value;
                    if (!Identity.isString(widget) &&  !widget.get('hide')) {
                        if (!widget.ref) {
                            this.puP.showDijit(widget);
                        }

                        this._showLinkedExtensionWidgetsIfSelect(widget);
                    }
                }, this);

                // always show substitution extension widgets
                var subWidgets = this._refWidgetsMap.item(this._substitutionRef);
                array.forEach(subWidgets, function (widget) {
                    this.puP.showDijit(widget);
                }, this);

                this.puP.showDijit(this.controlTable);

                this._collapsed = false;
                this.collapseToggle.setExpanded(true);
                domClass.replace(this.containerNode, this._cssExpanded, this._cssCollapsed);
            }
        },

        collapse: function () {
            if (!this._collapsed) {
                this._idWidgetMap.forEach(function (widgetMapEntry) {
                    if (!Identity.isString(widgetMapEntry.value)) {
                        this.puP.hideDijit(widgetMapEntry.value);
                    }
                }, this);
                this.puP.hideDijit(this.controlTable);

                this._collapsed = true;
                this.collapseToggle.setExpanded(false);
                domClass.replace(this.containerNode, this._cssCollapsed, this._cssExpanded);
            }
        },


        // private methods

        _updateBusinessObject: function (/*script.Entry*/businessObject) {
            this._businessObject = lang.clone(businessObject);
            array.forEach(this._businessObject.args, this._updateWidget, this);
            this._updateInfoBox();
        },

        _updateWidgetValue: function (newValue) {
            var valueType = null;
            this._idWidgetMap.forEach(function (item) {
                if (item.value == this._widgetToUpdate) {
                    array.some(this._businessObject.args, function (arg) {
                        var argFound = (arg.id == item.key);
                        if (argFound) {
                            valueType = arg.valueType;
                        }

                        return argFound;
                    }, this);
                }
            }, this);

            if (valueType && EntryEnum.isOfType(newValue, valueType)) {
                this._setWidgetValue(this._widgetToUpdate, newValue);
                this._setWidgetToUpdate();
            }
        },

        // unhide linked select's extension widgets via _onSelectChange event handler
        _showLinkedExtensionWidgetsIfSelect: function (widget) {
            if (widget.valueType == EntryEnum.ValueType.Select) {
                widget.triggerExtendedChangeEvent();
            }
        },

        _setWidgetToUpdate: function () {
            if (this._businessObject.updateSequence.length > 0) {
                if (this._widgetToUpdate) {
                    if (this._businessObject.updateSequence[0].once) {
                        this._businessObject.updateSequence.splice(0, 1);
                        this._widgetToUpdate = this._idWidgetMap.item(this._businessObject.updateSequence[0].updateArgId);
                    }
                }
                else {
                    this._widgetToUpdate = this._idWidgetMap.item(this._businessObject.updateSequence[0].updateArgId);
                }
            }
        },

        // called after DOM created to apply settings to nodes
        _applyDomSettings: function () {
            this._idWidgetMap.forEach(function (item) {
                var widget = item.value;
                if (!Identity.isString(widget) && widget.get('hide')) {
                    this.puP.hideDijit(widget);
                }
            }, this);
        },

        _registerWidget: function (/*script/schema/ArgTemplate*/arg, widget, /*optional, string*/ref) {
            this.controlTable.addChild(widget);
            this._idWidgetMap.add(arg.id, widget);

            if (ref) {
                this._addWidgetToRefMap(ref, widget);
            }

            if (widget.eventType) {
                this._handlerList.push(on(widget, 'click', lang.hitch(this, this._onWidgetClick)));
            }
            this._handlerList.push(aspect.after(widget, 'onChange', lang.hitch(this, this._onWidgetChange), true));

            widget.set('infoBoxLabel', arg.label);
            if (arg.configObj) {
                if (arg.configObj.readOnly) {
                    widget.set('readOnly', true);
                }

                if (arg.configObj.hide) {
                    widget.set('hide', true);
                }

                if (arg.configObj.hideLabel) {
                    widget.set('hideLabel', true);
                }
            }
        },

        _addWidgetToRefMap: function (ref, widget) {
            if (this._refWidgetsMap.containsKey(ref)) {
                var widgets = this._refWidgetsMap.item(ref);
                widgets.push(widget);
            }
            else {
                var widgets = new Array(widget);
                this._refWidgetsMap.add(ref, widgets);
            }
        },

        _updateInfoBox: function () {
            var typeName = this._cmdTypeKeyMap[this._businessObject.commandType].name;
            var typeFieldLength = 30;
            var fillerChars = typeFieldLength - typeName.length - 4;   // brackets add 4 chars

            var headline = new Builder('[ ');
            headline.append(typeName);
            headline.append(' ]');

            // justify arg info
            for (var i = 0; i < fillerChars; i++) {
                headline.append('.');
            }

            var fieldNumber = 0;
            array.forEach(this._businessObject.args, function (arg) {
                if (this._verifyWidgetIsNotHidden(arg)) {
                    if (this._verifyShowWidgetLabel(arg)) {
                        if (fieldNumber > 0) {
                            headline.append(', ');
                        }
                        var label = this._getWidgetInfoBoxLabel(arg);
                        headline.append(label);
                        headline.append(': ');
                    }
                    else if (fieldNumber > 0) {
                        headline.append(' ');
                    }

                    var value = this._formatForInfoBox(arg);
                    headline.append(value);
                    ++fieldNumber;
                }
            }, this);

            dom.byId(this.infoBox).innerHTML = headline.toString();
        },

        // returns true if widget is either visible or virtual
        _verifyWidgetIsNotHidden: function (/*/script/Arg*/arg) {
            var widget = this._idWidgetMap.item(arg.id);
            return (!widget || !widget.get('hide'));
        },

        _verifyShowWidgetLabel: function (/*/script/Arg*/arg) {
            var widget = this._idWidgetMap.item(arg.id);
            if (widget) {
                return !widget.get('hideLabel');
            }
            else {
                return true;
            }
        },

        // get label assigned to widget if widget exists for arg (not the case for substitution args)
        _getWidgetInfoBoxLabel: function (/*/script/Arg*/arg) {
            var widget = this._idWidgetMap.item(arg.id);
            return widget? widget.get('infoBoxLabel') : arg.name;
        },

        _updateWidget: function (/*Script.Arg*/arg, i) {
            try {
                var widget = this._idWidgetMap.item(arg.id);

                if (widget) {
                    this._setWidgetValue(widget, arg.value);
                }
                else {
                    this._setSubstitutionWidgetValues(arg, i);
                }
            }
            catch (err) { }
        },

        _updateBoArg: function (/*Script.Arg*/arg, i,  /*bool*/enableValueChangeEvent) {
            try {
                if (arg.name) {
                    var widget = this._idWidgetMap.item(arg.id);
                    if (widget) {
                        this._getWidgetValue(widget, arg, enableValueChangeEvent);
                    }
                    else {
                        this._getSubstitutionWidgetValues(arg, enableValueChangeEvent);
                    }
                }
                else {
                    this._getSubstitutionWidgetValues(arg, enableValueChangeEvent);
                }
            }
            catch (err) { }
        },

        _setWidgetValue: function (widget, newValue) {
            if (Identity.isFunction(widget.update)) {
                widget.update(newValue);
            }
            else {
                widget.set('value', newValue);
            }
        },

        _getWidgetValue: function (widget, arg, /*bool*/enableValueChangeEvent) {
            if (Identity.isFunction(widget.getValue)) {
                var newValue = widget.getValue();
            }
            else {
                var newValue = widget.get('value');
            }

            if (arg.value != newValue) {
                arg.value = newValue;
                if (enableValueChangeEvent) {
                    var eventType = widget.eventType ? widget.eventType : EntryEnum.EventArgType.None;
                    this.onValueChange(eventType, newValue, this);
                }
            }
        },

        _getNameWidgetValue: function (widget, arg, /*bool*/enableValueChangeEvent) {
            if (Identity.isFunction(widget.getValue)) {
                var newValue = widget.getValue();
            }
            else {
                var newValue = widget.get('value');
            }

            if (newValue && (arg.name != newValue)) {
                arg.name = newValue;
                if (enableValueChangeEvent) {
                    var eventType = widget.eventType ? widget.eventType : EntryEnum.EventArgType.None;
                    this.onValueChange(eventType, newValue, this);
                }
            }
        },

        // updates single arg mapped to substitution widgets
        _getSubstitutionWidgetValues: function (/*Script.Arg*/arg, /*bool*/enableValueChangeEvent) {
            var subWidgets = this._refWidgetsMap.item(this._substitutionRef);

            array.forEach(subWidgets, function (widget) {
                if (widget.title == 'name') {
                    this._getNameWidgetValue(widget, arg, enableValueChangeEvent);
                }
                else if (widget.title == 'value') {
                    this._getWidgetValue(widget, arg, enableValueChangeEvent);
                }
            }, this);
        },

        // updates substitution widgets mapped to single arg
        _setSubstitutionWidgetValues: function (/*Script.Arg*/arg) {
            var subWidgets = this._refWidgetsMap.item(this._substitutionRef);

            array.forEach(subWidgets, function (widget) {
                if (widget.title == 'name') {
                    this._setWidgetValue(widget, arg.name);
                }
                else if (widget.title == 'value') {
                    this._setWidgetValue(widget, arg.value);
                }
            }, this);
        },

        _activateWidgets: function (ref) {
            var activeWidgets = this._refWidgetsMap.item(ref);
            array.forEach(activeWidgets, function (widget) {
                this.puP.showDijit(widget);

                // add arg to BO if doesn't already exist
                if (this._businessObject) {
                    for (var i = 0; i < this._businessObject.args.length; i++) {
                        if (this._businessObject.args[i].id == widget.argId) {
                            return;
                        }
                    }

                    // arg not found
                    var value = EntryEnum.getDefaultValue(widget.valueType);
                    var arg = new Arg(widget.argId, widget.title, value, widget.valueType);
                    this._businessObject.args.push(arg);
                }
            }, this);
        },

        // deactivate extension widgets that aren't substitution mapped widgets
        _deactivateWidgets: function (ref) {
            if (ref != this._substitutionRef) {
                var widgets = this._refWidgetsMap.item(ref);
                array.forEach(widgets, function (widget) {
                    this.puP.hideDijit(widget);

                    // remove arg from BO if exists
                    if (this._businessObject) {
                        for (var i = 0; i < this._businessObject.args.length; i++) {
                            if (this._businessObject.args[i].id == widget.argId) {
                                this._businessObject.args.splice(i, 1);
                                return;
                            }
                        }
                    }
                }, this);
            }
        },

        // sized by number of digits in max value
        _assembleFloatPattern: function (/*number*/max) {
            var pattern = new Builder();

            var maxRounded = parseInt(max);
            var numDigits = maxRounded.toString().length;
            this._fillPatternField('0', numDigits, pattern);
            pattern.append('.');
            this._fillPatternField('#', this._floatPrecision, pattern);

            return pattern.toString();
        },

        _fillPatternField: function (/*char*/fillChar, /*int*/numPlaces, /*dojox.string.Builder*/builder) {
            for (var i = 0; i < numPlaces; i++) {
                builder.append(fillChar);
            }
        },

        _formatForInfoBox: function (arg) {
            var value = '';
            switch (arg.valueType) {
                case (EntryEnum.ValueType.TimeSpan):
                    value = DateString.prettyPrintTimespan(arg.value);
                    break;

                case (EntryEnum.ValueType.TimeOfDay):
                    var time = new Date();
                    time.setSeconds(0);
                    time.setMinutes(0);
                    time.setHours(0);
                    time.setSeconds(arg.value);

                    value = time.toLocaleTimeString() + ' ' + DateString.toDate(time);
                    break;

                case (EntryEnum.ValueType.TimeStamp):
                    var date = new Date(arg.value * 1000);
                    value = date.toLocaleTimeString() + ' ' + DateString.toDate(date);
                    break;

                case (EntryEnum.ValueType.Select):
                case (EntryEnum.ValueType.String):
//                    value = '"' + arg.value + '"';
//                    break
//
                default:
                    value = arg.value;
                    break;
            }

            return '<span class="secInfoBoxValue">' + value + '</span>';
        },

        // callbacks
        _onSelectChange: function (/*string*/newValue, index, /*optional, string[]*/refs) {
            if (refs) {
                if (refs[index]) {
                    this._activateWidgets(refs[index]);
                }

                // deactivate widgets for other ref options of select
                array.forEach(refs, function (ref, i) {
                    if (ref && (i != index)) {
                        this._deactivateWidgets(ref);
                    }
                }, this);

                this.controlTable.startup();
            }
        },

        _onToggleChange: function () {
            if (this._collapsed) {
                this.expand();
            }
            else {
                this.collapse();
            }
        },

        _onWidgetClick: function (evt) {
            var widget = registry.getEnclosingWidget(evt.target);

            if (widget.eventType) {
                this._widgetToUpdate = widget;
                this.onSelectWidget(widget.eventType, this);
            }
        },

        _onWidgetChange: function (newValue) {
            var enableValueChangeEvent = true;
            array.forEach(this._businessObject.args, function (arg, i) {
                this._updateBoArg(arg, i, enableValueChangeEvent);
            }, this);
            this._updateInfoBox();
        },

        // toggle collapse/expand on double-click
        //This is currently disabled as it was found to be annoying for users, accidently collapsing windows
        _onDblClick: function (evt) {
            /*
            var nextExpandedState = this._collapsed;
            if (nextExpandedState) {
                this.expand();
            }
            else {
                this.collapse();
            }
            this.collapseToggle.setExpanded(nextExpandedState);
            */
        },

        // public events
        onValueChange: function (/*EntryEnum.EventArgType*/eventType, /*widget specific type*/newValue, /*ScriptEntry*/eventPublisher) {
        },

        onSelectWidget: function (/*EntryEnum.EventArgType*/eventType, /*dijit*/refToSelf) {
        }
    });
});
