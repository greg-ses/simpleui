// ~/control/Edit
// Edit control - script editor and run status viewer

// Responsibilities:
//  - maintain collection of ScriptEntry controls created by injected factory - instantiate script, clear
//  - decorate entry controls with view/edit mode dependent controls - insert/delete in edit, status/breakpoint in run
//  - return business object collection representing script on request
//  - provides 2-way connection between entry controls and parent layer to respond to user interaction on entry controls

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/query', 'dojo/_base/array', 'dojo/on', 'dojo/aspect',
        'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dojo/mouse',
        'dijit/registry',
        '../Enum', '../utilities/Compatibility', '../utilities/Store', '../utilities/Identity',
        '../script/EntryEnum', '../script/ForLoopBusinessRules', './InsertCommandMenu', './insertCommandMenu/icmDto',
        'dijit/Dialog', "dijit/form/Button", "dijit/form/Form", "dijit/form/NumberTextBox", 'dijit/form/NumberSpinner',
        '../widget/LockedCheckBox', '../widget/UpDown',
        './_Control', '../mixin/_QueueClient', 'dojo/text!./edit/template/edit.html'],
function (declare, lang, query, array, on, aspect,
        dom, construct, domClass, domStyle, mouse,
        registry,
        Enum, Compatibility, Store, Identity,
        EntryEnum, ForLoopBusinessRules, InsertCommandMenu, icmDto,
        Dialog, Button, Form, NumberTextBox, NumberSpinner,
        LockedCheckBox, UpDown,
        _Control, _QueueClient, template) {
    return declare([_Control, _QueueClient],
    {
        // css class names/in-line code
        _cssViewModeStatusBox: 'ecViewModeStatusBox',
        _cssRowBorder: 'ecEntryRow',
        _cssHighlightStopped: 'ecHighlightStopped',
        _cssControlCell: 'ecControlCell',
        _cssStatusBox: 'ecStatusBox',
        _cssBreakPointBox: 'ecBreakPointBox',
        _cssLabelCell: 'ecLabelCell',
        _cssVariableCell: 'ecVariableCell',
        _cssEntryControl: 'scriptEntryControl',
        _cssInsertCommandMenuControl: 'insertCommandMenuControl',
        _cssSelectBorder: '_controlSelectBorder',

        // html/XML labels
        _uuidAttrib: 'uuid',

        // public variables set by EditControlDto.Ctor
        entryControlFactory: '',            // ../script/EntryControlFactory

        // private variables
        _handlerList: null,                 // manage on script lifecycle (remove when clearing script)
        _forLoops: null,                     // ForLoopBusinessRules
        _viewMode: null,                    // obj encapsulating view settings. .View = lock ScriptEntryControls in view only mode, no insert
        _breakPoints: null,                 // collection of breakpoint widgets
        _statusElements: null,              // temporary row decorations created on each status update
        _isEdited: false,                   // true = change to script
        _currentRowNode: null,              // current step when in View state
        _scriptInsertRowIndex: Number.NaN,  // insertion row index when script insertion requested, NaN when no insertion requested
        _entryToUpdate: null,
        _cachedBusinessObjects: null,       // cache set on insert to allow repeating insert operations
        _spinnerVarList: null,              //Holds the dojo display object for a script run variable

        // dijit variables
        name: 'Edit Control',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'editControl',

        // lifecycle methods
        constructor: function (/*control.edit.eDto.Ctor*/) {
            this._initializeScriptState();
            this._viewMode = { state: Enum.ViewState.Edit, limitEditMode: false };
            this._spinnerVarList = new Array();
        },

        postCreate: function () {
            this.inherited(arguments);
            this._disableCollapseExpandAll();
        },


        // public methods
        // overrides _Control.configure to clear or load business objects
        configure: function (/*ppcJs.script.Entry[], optional*/businessObjects) {
            var pendingAction = (this._isInsertingScript() || this._entryToUpdate);
            if (pendingAction) {
                if (businessObjects && Identity.isArray(businessObjects)) {
                    this._cachedBusinessObjects = lang.clone(businessObjects);
                    this.insertMenuControl.globalSettings.enableRepeatMenuItem = true;

                    for (var i = businessObjects.length - 1; i >= 0; --i) {
                        this._insertEntry(businessObjects[i], this._scriptInsertRowIndex);
                    }

                    this._forLoops.linkStartsAndEnds(this._getEntryControls());
                    this._setEditState(true);
                }

                this._scriptInsertRowIndex = Number.NaN;
                this._entryToUpdate = null;
            }
            else {
                this._clearEntries();

                if (businessObjects && Identity.isArray(businessObjects)) {
                    array.forEach(businessObjects, this._insertEntry, this);
                    this._forLoops.linkStartsAndEnds(this._getEntryControls());
                    this._queueCall(this._setViewState, [this._viewMode.state, this._viewMode.limitEditMode], true);
                }

                this._isEdited = false;     // so won't fire onStateChange event
            }

            if (businessObjects) {
                this._enableCollapseExpandAll();
            }
            else {
                this._disableCollapseExpandAll();
            }
        },

        // overrides _Control.update to decorate with script state when in View mode
        update: function (/*script.State*/scriptState) {
            if (this._viewMode.state == Enum.ViewState.View) {
                this._resetStatusElements();
                this._updateCurrentEntryInfo(scriptState);
                this._updateLoopCounts(scriptState);
                this._updateVariableStatuses(scriptState);

                if (scriptState.currentStatus) {
                    this._insertAndRegisterStatusBox(scriptState.currentStatus, this._currentRowNode);
                }

                if (!this._inhibitUpdate) {
                    // only update breakpoints after delay to allow for user action to register server-side
                    this._updateBreakPoints(scriptState);
                }
            }
            else if (this._entryToUpdate) {
                // in Edit mode, update entry requesting data
                this._entryToUpdate.update(scriptState.fileName);
                this._entryToUpdate = null;
            }
        },

        // overrides _Control.getValue. Iterates through container to get business objects
        // returns ppcJs.script.Entry[]
        getValue: function () {
            var businessObjects = new Array();
            array.forEach(this._getEntryControls(), function (entryControl, i) {
                businessObjects.push(entryControl.getValue());
            });


            return businessObjects;
        },

        isEmpty: function () {
            var entryControls = this._getEntryControls();
            return (entryControls.length == 0);
        },

        // when limitEditMode = true, set to edit view with limited capabilities
        setViewState: function (/*ppcJs.Enum.ViewState*/viewState, /*optional, bool*/limitEditMode) {
            var argArray = [viewState, limitEditMode];
            this._setViewState(argArray);
        },

        getIsEdited: function () {
            return this._isEdited;
        },

        clearIsEdited: function () {
            this._setEditState(false);
        },


        // private methods
        _initializeScriptState: function () {
            this._limitEditMode = false;

            if (this._handlerList) {
                array.forEach(this._handlerList, function (handler) {
                    handler.remove();
                });
                this._handlerList.length = 0;
            }
            else {
                this._handlerList = new Array();
            }

            this._resetStatusElements();

            if (this._breakPoints) {
                this._breakPoints.length = 0;
            }
            else {
                this._breakPoints = new Array();
            }

            this._forLoops = new ForLoopBusinessRules();
        },

        _resetStatusElements: function () {
            if (this._statusElements) {
                array.forEach(this._statusElements, function (statusElement) {
                    construct.destroy(statusElement);
                }, this);
                this._statusElements.length = 0;
            }
            else {
                this._statusElements = new Array();
            }
        },

        // iterate through entryContainer children, if id exists, get dijit and destroy
        _clearEntries: function () {
            var preserveEntryContainer = true;
            //this._spinnerVarList = new Array();
            this.puP.destroyRecursive(this.entryContainer, preserveEntryContainer);
            this._initializeScriptState();
            this.entryContainer.innerHTML = '';
            this.variableStatusTable.innerHTML = '';
            dojo.forEach(this._spinnerVarList, function (w) {
                w.destroyRecursive();
            });
            this._spinnerVarList = new Array();
            //Delete runtime variable array
        },

        _updateCurrentEntryInfo: function (/*script.State*/scriptState) {
            this._removeBorder(this._currentRowNode);
            this._currentRowNode = this._getRowByUuid(scriptState.currentUuid);
            this._addBorder(scriptState.state, this._currentRowNode);
        },

        _updateVariableStatuses: function (/*script.State*/scriptState) {
            //this.variableStatusTable.innerHTML = '';
            if (scriptState.variables && (scriptState.variables.length > 0)) {
                domClass.add(this.viewModeStatus, this._cssViewModeStatusBox);
                array.forEach(scriptState.variables, this._displayVariableStatus, this);
            }
            else {
                domClass.remove(this.viewModeStatus, this._cssViewModeStatusBox);
            }
        },

        _updateLoopCounts: function (/*script.State*/scriptState) {
            if (scriptState.loopCounts) {
                array.forEach(scriptState.loopCounts, function (loopCount) {
                    var row = this._getRowByUuid(loopCount.uuid);
                    if (row) {
                        var text = 'Remaining: ' + loopCount.timesRemaining.toString();
                        this._insertAndRegisterStatusBox(text, row);
                    }
                }, this);
            }
        },

        _updateBreakPoints: function (/*script.State*/scriptState) {
            array.forEach(this._breakPoints, function (breakPoint) {
                breakPoint.setValue(false);
                array.some(scriptState.breakPointUuids, function (breakPointUuid) {
                    if (breakPoint.getId() == breakPointUuid) {
                        breakPoint.setValue(true);
                        return true;
                    }
                });
            });
        },

        _handleSelectInsertNewEntry: function (/*EntryEnum.CommandType*/cmdType, /*int or string('last', etc)*/index) {
            var entryControl = this._insertEntry(cmdType, index, null, true);
            if (cmdType == EntryEnum.CommandType.ForLoop) {
                var labelControl = this._insertEntry(EntryEnum.CommandType.Label, index + 1, null, true);
                this._forLoops.addLoop(entryControl, labelControl);
            }

            this._enableCollapseExpandAll();
        },

        // inserts row containing Entry and decoration into container
        // note: 'entries' arg is inserted in a forEach call (not used by method)
        // returns new ScriptEntry control
        _insertEntry: function (/*script.Entry or script.EntryEnum.CommandType*/entry, /*int or string('last', etc)*/index, /*optional, script.Entry[]*/entries, /*optional, bool*/expanded) {
            var isInsertingScript = this._isInsertingScript();
            if (isInsertingScript && Identity.isObject(entry)) {
                // special handling of regenerated UUIDs when inserting a script
                var uuidBefore = entry.uuid;
                var entryControl = this.entryControlFactory.getControl(entry, true);
                this._forLoops.recordUuidChange(uuidBefore, entryControl.getUuid())
            }
            else {
                var entryControl = this.entryControlFactory.getControl(entry, isInsertingScript);
            }
            
            this._handlerList.push(aspect.after(entryControl, 'onValueChange', lang.hitch(this, this._onEntryValueChange), true));
            this._handlerList.push(aspect.after(entryControl, 'onSelectWidget', lang.hitch(this, this._onSelectWidget), true));

            this._queueCall(entryControl.setViewState, [this._viewMode.state], true, entryControl);
            if ((this._viewMode.state == Enum.ViewState.Edit) && !expanded) {
                this._queueCall(entryControl.collapse, null, true, entryControl);
            }

            var uuid = entryControl.getUuid();

            // create 4 cell row structure
            var row = this.puB.createRow();
            domClass.add(row, this._cssRowBorder);
            // assign Entry's uuid to containing row for more efficient querying
            Compatibility.attr(row, this._uuidAttrib, uuid);

            this._insertBreakPointCell(uuid, row);
            this._insertCommandMenuCell(row);
            this._insertEntryCell(entryControl, row);
            this._insertUpDownCell(row);

            construct.place(row, this.entryContainer, index);

            return entryControl;
        },

        _createControlCell: function () {
            var controlCell = this.puB.createCell();
            domClass.add(controlCell, this._cssControlCell);
            return controlCell;
        },

        _insertBreakPointCell: function (uuid, /*DOM node*/row) {
            var checkBox = new LockedCheckBox(uuid);
            this._handlerList.push(aspect.after(checkBox, 'onChange', lang.hitch(this, this._onBreakPointChange), true));
            this._breakPoints.push(checkBox);

            var breakPointCell = this._createControlCell();
            var breakPointDiv = construct.create('div');
            domClass.add(breakPointDiv, this._cssBreakPointBox);
            construct.place(checkBox.domNode, breakPointDiv);
            construct.place(breakPointDiv, breakPointCell);
            construct.place(breakPointCell, row);
            if (this._viewMode.state == Enum.ViewState.Edit) {
                domStyle.set(breakPointDiv, { display: 'none' });
            }
        },

        _insertCommandMenuCell: function (/*DOM node*/row) {
            var ctorObj = new icmDto.Ctor(true);
            var insertCommandMenu = new InsertCommandMenu(ctorObj);
            this._handlerList.push(aspect.after(insertCommandMenu, 'onSelectCommand', lang.hitch(this, this._onInsertEntry), true));
            this._handlerList.push(aspect.after(insertCommandMenu, 'onSelectScript', lang.hitch(this, this._onInsertScript), true));
            this._handlerList.push(aspect.after(insertCommandMenu, 'onRepeatSelectScript', lang.hitch(this, this._onRepeatInsertScript), true));
            this._handlerList.push(aspect.after(insertCommandMenu, 'onDeleteCommand', lang.hitch(this, this._onDeleteEntry), true));

            var controlCell = this._createControlCell();
            construct.place(insertCommandMenu.domNode, controlCell);
            construct.place(controlCell, row);
            domStyle.set(insertCommandMenu.domNode, 'visibility', 'hidden');
            this._addRowHoverBehavior(row, insertCommandMenu.domNode);
        },

        _insertEntryCell: function (/*ScriptEntry*/entryControl, /*DOM node*/row) {
            var entryCell = this._createControlCell();
            this._addRowHoverBehaviorForEntryControl(row, entryControl);
            construct.place(entryControl.domNode, entryCell);
            construct.place(entryCell, row);
        },

        _insertUpDownCell: function (/*DOM node*/row) {
            var upDownCell = this._createControlCell();
            var upDown = new UpDown();
            this._handlerList.push(aspect.after(upDown, 'onUpClick', lang.hitch(this, this._onUpClickEntry), true));
            this._handlerList.push(aspect.after(upDown, 'onDownClick', lang.hitch(this, this._onDownClickEntry), true));

            construct.place(upDown.domNode, upDownCell);
            construct.place(upDownCell, row);
            domStyle.set(upDown.domNode, 'visibility', 'hidden');

            this._addRowHoverBehavior(row, upDown.domNode);
        },

        // insert status box containing text into first column of row
        _insertAndRegisterStatusBox: function (text, row) {
            var statusBox = construct.create('div');
            domClass.add(statusBox, this._cssStatusBox);
            statusBox.innerHTML = text;

            var cellClassSelect = '.' + this.puB._cssCell;
            var decorateCell = query(cellClassSelect, row)[1];
            construct.place(statusBox, decorateCell);

            this._statusElements.push(statusBox);
        },

        _getRowByUuid: function (/*string*/uuid) {
            var rowClassSelect = '.' + this.puB._cssRow;
            var uuidSelect = Store.getCssAttribSelector(this._uuidAttrib, uuid);
            var rows = query(rowClassSelect + uuidSelect, this.entryContainer);

            if (rows.length > 0) {
                return rows[0];
            }
        },

        _getRows: function () {
            var rowClassSelect = '.' + this.puB._cssRow;
            var rows = query(rowClassSelect, this.entryContainer);

            return rows;
        },

        // get row index from parentNode by matching a domNode id within the row's DOM tree
        _getRowIndex: function (/*DOM node*/domNode) {
            var id = Compatibility.attr(domNode, 'id');
            var idSelect = Store.getCssAttribSelector('id', id);

            var rowIndex = 0;
            var rows = this._getRows();
            for (var i = 0; i < rows.length; i++) {
                var entries = query(idSelect, rows[i]);
                if (entries.length > 0) {
                    rowIndex = i;
                    break;
                }
            }

            return rowIndex;
        },
        
        // returns row DOM node containing domNode
        _getRow: function (/*DOM node*/domNode) {
            var id = Compatibility.attr(domNode, 'id');
            var idSelect = Store.getCssAttribSelector('id', id);

            var rowIndex = 0;
            var rows = this._getRows();
            for (var i = 0; i < rows.length; i++) {
                var entries = query(idSelect, rows[i]);
                if (entries.length > 0) {
                    return rows[i];
                }
            }
        },

        // returns DOM element array
        _getBreakPointBoxes: function () {
            return this.puP.getNodesByCssClass(this.entryContainer, this._cssBreakPointBox);
        },

        _getInsertCommandMenuNodes: function () {
            return this.puP.getNodesByCssClass(this.entryContainer, this._cssInsertCommandMenuControl);
        },

        // returns array of ScriptEntry controls in order of DOM nodes in container
        _getEntryControls: function () {
            return this.puP.getWidgetsByCssClass(this.entryContainer, this._cssEntryControl);
        },

        _getEntryControlInRow: function(row) {
            var entryControls = this.puP.getWidgetsByCssClass(row, this._cssEntryControl);
            return entryControls[0];
        },

        // returns true if an insert script operation is pending
        _isInsertingScript: function () {
            return !isNaN(this._scriptInsertRowIndex);
        },

        _addBorder: function (/*Enum.PlayBackState*/state, domNode) {
            if (domNode) {
                var cssClass = (state == Enum.PlayBackState.Running) ? this.puB._cssSelectBorder : this._cssHighlightStopped;
                domClass.add(domNode, cssClass);
            }
        },

        _removeBorder: function (domNode) {
            if (domNode) {
                domClass.remove(domNode, [this.puB._cssSelectBorder, this._cssHighlightStopped]);
            }
        },

        _setEditState: function (/*bool*/isEdited) {
            this._isEdited = isEdited;
            this.onStateChange(isEdited, this.isEmpty());
        },

        // args as an array to allow _queueCall() usage
        // where args[0] is a ppcJs.Enum.ViewState, and args[1] is an optional bool
        _setViewState: function (/*[]*/args) {
            var viewState = args[0];
            var limitEditMode = args[1];
            this._viewMode.state = viewState;
            this._viewMode.limitEditMode = limitEditMode;

            array.forEach(this._getEntryControls(), function (entryControl) {
                entryControl.setViewState(viewState);
            }, this);

            if (viewState == Enum.ViewState.View) {
                this._setViewStateToView();
            }
            else {
                this._setViewStateToEdit(limitEditMode);
            }
        },

        // set decoration (insert Controls, breakpoints) visibility for View mode
        _setViewStateToView: function () {
            domStyle.set(dom.byId(this.viewModeStatus), { display: 'block' });
            domStyle.set(dom.byId(this.editControlBox), { display: 'none' });

            var insertControlNodes = this._getInsertCommandMenuNodes();
            array.forEach(insertControlNodes, function (insertControlNode) {
                domStyle.set(insertControlNode, { display: 'none' });
            });

            var bpBoxes = this._getBreakPointBoxes();
            array.forEach(bpBoxes, function (pauseBox) {
                domStyle.set(pauseBox, { display: 'block' });
            });
        },

        // set decoration (insert Controls, breakpoints) visibility for Edit mode
        _setViewStateToEdit: function (/*bool*/limitEditMode) {
            domStyle.set(dom.byId(this.viewModeStatus), { display: 'none' });
            var editControlDisplayValue = limitEditMode ? 'none' : 'block';
            domStyle.set(dom.byId(this.editControlBox), { display: editControlDisplayValue });

            var insertControlNodes = this._getInsertCommandMenuNodes();
            array.forEach(insertControlNodes, function (insertControlNode) {
                domStyle.set(insertControlNode, { display: editControlDisplayValue });
            });

            var bpBoxes = this._getBreakPointBoxes();
            array.forEach(bpBoxes, function (pauseBox) {
                domStyle.set(pauseBox, { display: 'none' });
            });

            // clear state info
            this._removeBorder(this._currentRowNode);
            this._currentRowNode = null;
            this._resetStatusElements();
        },

        _displayVariableStatus: function ( /*variable*/ currVariable) {
            //Add to the list
            
            var found = false;
            var ctorObj = {
                constraints: { places: 3 },
                value: 0,
                smalldelta: .1,
                id: currVariable.variableId,
                intermediateChanges: true
            };


            //Look for pre-existing entry
            array.forEach(this._spinnerVarList, function(spinnerVar, i) {
                    if (spinnerVar.id == currVariable.variableId) {
                        spinnerVar.set('value', currVariable.value);
                        found = true;
                    }
            }
            );

            if (found == false) {
                //The spinner hasn't been created yet, build it
                var row = this.puB.createRow();
                var labelCell = this.puB.createCell(currVariable.variableId);
                domClass.add(labelCell, [this._cssLabelCell, this.puB._cssLabel]);
                construct.place(labelCell, row);
                var valueCell = this.puB.createCell("test");
                domClass.add(valueCell, [this._cssVariableCell, this.puB._cssInfo]);
                construct.place(valueCell, row);
                construct.place(row, dom.byId(this.variableStatusTable));

                var spinner = new NumberSpinner(ctorObj, dom.byId(valueCell));
                //Register click handler
                on(spinner, 'click', this._varSetHandler);
                spinner.startup();

                this._spinnerVarList.push(spinner);
            }
        },

        _varSetHandler: function (event) {
            var sourceObj = event.currentTarget;
            var myDialog = null;
            //Strip the variable name from the event source ID
            var varName = sourceObj.id.slice(7);
            //Build the query object to pass new variable value to the commander
            var queryObject = { ID: "1" };
            lang.mixin(queryObject, {COMMAND: "SET_VAR"});
            lang.mixin(queryObject, { VAR_NAME: varName });

            var textArea = new NumberTextBox({
                placeHolder: "New Value"
            });

            var form = new Form({
                onSubmit: function (e) {
                    e.preventDefault();
                    e.stopPropagation();                    
                    myDialog.hide();
                    lang.mixin(queryObject, { VALUE: textArea.get("value") });
                    //Send new variable value to server
                    var xhrArgs = {
                        url: "/cgi/cgicmd?CGI=AutoCycleCmd",
                        content: queryObject,
                        handleAs: "xml",
                        error: function (error) {
                            alert("Request Failed!");
                        }
                    };

                    // Call the asynchronous xhrGet
                    var deferred = dojo.xhrGet(xhrArgs);
                    
                }
            });

            textArea.placeAt(form.containerNode);

            new Button({
                label: "Set",
                type: "submit",
                onClick: function(){
                    // produce xhrget request with new variable value:

                }
            }).placeAt(form.containerNode);

            form.startup();
            myDialog = new Dialog({
                content: form,
                title: varName,
                style: "width: 300px"
            });

            myDialog.show();

        },

        // hide/show child on hovering over row in full edit mode
        _addRowHoverBehavior: function (/*DOM node*/row, /*DOM node*/child) {
            var self = this;
            this._handlerList.push(on(row, mouse.enter, function (evt) {
                var fullEditMode = (self._viewMode.state == Enum.ViewState.Edit) && !self._viewMode.limitEditMode;
                if (fullEditMode) {
                    domStyle.set(child, 'visibility', 'visible');
                }
            }));

            this._handlerList.push(on(row, mouse.leave, function (evt) {
                // apply if target does not belong to containing widget (ie, DOM nodes outside row, such as InsertCommandMenu's dropdown menu items. search 2 levels deep)
                var containingWidget = registry.getEnclosingWidget(child);
                var targetWidget = registry.getEnclosingWidget(evt.target);

                if (containingWidget && Identity.isFunction(containingWidget.getAllChildren)) {
                    var containedWidgets = containingWidget.getAllChildren();
                    var isChild = array.some(containedWidgets, function (widget) {
                        return (widget == targetWidget);
                    });
                }
                else {
                    var isChild = false;
                }

                // while get children
                if (!isChild) {
                    domStyle.set(child, 'visibility', 'hidden');
                }
            }));
        },

        _addRowHoverBehaviorForEntryControl: function (/*DOM node*/row, /*ScriptEntry*/entryControl) {
            var self = this;

            this._handlerList.push(on(row, mouse.enter, function (evt) {
                if (self._viewMode.state == Enum.ViewState.Edit) {
                    domClass.add(entryControl.domNode, self._cssSelectBorder);
                    var matchingEntry = self._forLoops.getMatchingEntry(EntryEnum.EventArgType.LinkedEntry, entryControl);
                    if(matchingEntry) {
                        domClass.add(matchingEntry.domNode, self._cssSelectBorder);
                    }
                }
            }));

            this._handlerList.push(on(row, mouse.leave, function (evt) {
                domClass.remove(entryControl.domNode, self._cssSelectBorder);
                var matchingEntry = self._forLoops.getMatchingEntry(EntryEnum.EventArgType.LinkedEntry, entryControl);
                if (matchingEntry) {
                    domClass.remove(matchingEntry.domNode, self._cssSelectBorder);
                }
            }));
        },

        _enableCollapseExpandAll: function () {
            this.puP.enableDijit(this.collapseAllButton);
            this.puP.enableDijit(this.expandAllButton);
        },

        _disableCollapseExpandAll: function () {
            this.puP.disableDijit(this.collapseAllButton);
            this.puP.disableDijit(this.expandAllButton);
        },


        // callbacks
        _onInsertEntryAtStart: function (/*DOM node*/domNode, /*EntryEnum.CommandType*/cmdType) {
            this._handleSelectInsertNewEntry(cmdType, 0);
            this._setEditState(true);
        },

        _onInsertScriptAtStart: function (/*DOM node*/domNode) {
            this._scriptInsertRowIndex = 0;
            this.dataRequest(EntryEnum.EventArgType.ScriptFile);
        },

        _onInsertScript: function (/*DOM node*/domNode) {
            this._scriptInsertRowIndex = this._getRowIndex(domNode) + 1; // +1 to insert after
            this.dataRequest(EntryEnum.EventArgType.ScriptFile);
        },

        _onRepeatInsertScript: function (/*DOM node*/domNode) {
            if (this._cachedBusinessObjects) {
                this._scriptInsertRowIndex = this._getRowIndex(domNode) + 1; // +1 to insert after
                this.configure(this._cachedBusinessObjects);
            }
        },

        _onInsertEntry: function (/*DOM node*/domNode, /*EntryEnum.CommandType*/cmdType) {
            var rowIndex = this._getRowIndex(domNode) + 1;  // +1 to insert after
            this._handleSelectInsertNewEntry(cmdType, rowIndex);
            this._setEditState(true);
        },

        _onDeleteEntry: function (/*DOM node*/domNode) {
            var row = this._getRow(domNode);
            var entryToDelete = this._getEntryControlInRow(row);

            var matchingEntry = this._forLoops.findRemoveMatchingEntry(entryToDelete);
            if (matchingEntry) {
                var matchingRow = this._getRow(matchingEntry.domNode);
                this.puP.destroyRecursive(matchingRow);
            }

            this.puP.destroyRecursive(row);

            this._setEditState(true);
        },

        // if previous row exists, move selected row before it
        _onUpClickEntry: function (/*DOM node*/domNode) {
            var rowIndex = this._getRowIndex(domNode);
            if (rowIndex > 0) {
                var rows = this._getRows();
                var rowToMove = this._getRow(domNode);
                construct.place(rowToMove, rows[rowIndex - 1], 'before');
                this._setEditState(true);
            }
        },

        // if next row exists, move selected row after it
        _onDownClickEntry: function (/*DOM node*/domNode) {
            var rowIndex = this._getRowIndex(domNode);
            var rows = this._getRows();
            var maxRowIndex = rows.length - 1;
            if (rowIndex < maxRowIndex) {
                var rowToMove = this._getRow(domNode);
                construct.place(rowToMove, rows[rowIndex + 1], 'after');
                this._setEditState(true);
            }
        },

        _onEntryValueChange: function (/*EntryEnum.EventArgType*/eventType, /*widget specific type*/newValue, /*ScriptEntry*/eventPublisher) {
            this._setEditState(true);

            // update linked entry if exists
            var matchingEntry = this._forLoops.getMatchingEntry(eventType, eventPublisher);
            if (matchingEntry) {
                matchingEntry.update(newValue);
            }
        },

        _onBreakPointChange: function (/*bool*/checked, id) {
            this._setDebounce();
            this.onBreakPointChange(id, checked);
        },

        _onSelectWidget: function (/*EntryEnum.EventArgType*/eventType, /*dijit*/refToSelf) {
            var isScriptFileEvent = (eventType == EntryEnum.EventArgType.ScriptFile);
            if (isScriptFileEvent) {
                // save ScriptEntry to update later
                this._entryToUpdate = refToSelf;
                this.dataRequest(eventType);
            }
        },

        _onExpandAllClick: function () {
            array.forEach(this._getEntryControls(), function (entryControl) {
                entryControl.expand();
            }, this);
        },

        _onCollapseAllClick: function () {
            array.forEach(this._getEntryControls(), function (entryControl) {
                entryControl.collapse();
            }, this);
        },


        // public events
        onStateChange: function (/*bool*/isEdited, /*bool*/isEmptyScript) {
        },

        // request for data specified by eventType
        dataRequest: function (/*EntryEnum.EventArgType*/eventType) {
        },

        onBreakPointChange: function (/*string*/uuid, /*bool*/enable) {
        }
    });
});
