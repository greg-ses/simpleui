// ~/control/ChemistryDataEditor
// Allows viewing and modifying of
//  - subsystem name
//  - battery assignment by slot
// uses APIs:
//  - /Battery

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-style', 'dojo/query', 'dojo/NodeList-dom', 'dojo/keys', 'dojo/aspect', 'dojo/on',
        'dojox/layout/TableContainer', 'dijit/form/NumberTextBox', 'dijit/form/CheckBox', 'dijit/form/SimpleTextarea',
        './chemistryDataEditor/cdeDto',
        './_StoreControl', '../mixin/_ChildEventHandler', 'dojo/text!./chemistryDataEditor/template/chemistryDataEditor.html'],
function (declare, lang, dom, domStyle, query, NodeListDom, keys, aspect, on,
        TableContainer, NumberTextBox, CheckBox, SimpleTextarea,
        cdeDto,
        _StoreControl, _ChildEventHandler, template) {
    return declare([_StoreControl, _ChildEventHandler],
    {
        // css class names/in-line code
        _cssReadOnly: 'cdeReadOnly',

        // private variables
        _isConfigured: false,
        _textAreaPrompt: 'enter notes here',
        _dto: null,

        // dijit variables
        name: 'Chemistry Data Editor',
        templateString: template,
        baseClass: 'chemistryDataEditor',
        widgetsInTemplate: true,

        // properties set in html declaration or constructor
        newDataEntry: false,


        // life cycle methods
        constructor: function () {
            this._initializeHandlerList();
        },

        postCreate: function () {
            this.inherited(arguments);
            this._addChemDataEditorHandlers();
        },


        // Control API
        update: function (dto) {
            this._removeHandlers();
            this.zincMolarConcentration.set('value', dto.zincMolarConcentration);
            this.bromineMolarConcentration.set('value', dto.bromineMolarConcentration);
            this.avgMolarConcentration.set('value', dto.avgMolarConcentration);
            this.zincPh.set('value', dto.zincPh);
            this.brominePh.set('value', dto.brominePh);
            this.avgPh.set('value', dto.avgPh);
            this.indirectBromineInZincTank.set('value', dto.indirectBromineInZincTank);
            this.indirectBromineInBromineTank.set('value', dto.indirectBromineInBromineTank);
            this.avgBromine.set('value', dto.avgBromine);
            this.electrolyteAdded.set('checked', dto.electrolyteAdded);
            this.bromineAdded.set('checked', dto.bromineAdded);
            this.logEntry.set('value', dto.logEntry);
            this._addChemDataEditorHandlers();
        },

        // generic getter
        getValue: function () {
            var zincMolarConcentration = this.zincMolarConcentration.get('value');
            var bromineMolarConcentration = this.bromineMolarConcentration.get('value');
            var zincPh = this.zincPh.get('value');
            var brominePh = this.brominePh.get('value');
            var indirectBromineInZincTank = this.indirectBromineInZincTank.get('value');
            var indirectBromineInBromineTank = this.indirectBromineInBromineTank.get('value');
            var electrolyteAdded = this.electrolyteAdded.get('checked');
            var bromineAdded = this.bromineAdded.get('checked');
            var logEntry = this._getLogEntry();

            var dto = new cdeDto.ChemistryData( zincMolarConcentration,
                                                bromineMolarConcentration,
                                                zincPh,
                                                brominePh,
                                                indirectBromineInZincTank,
                                                indirectBromineInBromineTank,
                                                electrolyteAdded,
                                                bromineAdded,
                                                logEntry
                );

            return dto;
        },


        // protected methods
        _processConfig: function () {
            if (this.newDataEntry) {
                this.logEntry.set('value', this._textAreaPrompt);
            }
            this._setViewFormat();
        },


        // private methods
        // if prompt is still there, return ''
        _getLogEntry: function () {
            var logEntry = this.logEntry.get('value');
            if (logEntry == this._textAreaPrompt) {
                logEntry = '';
            }

            return logEntry;
        },

        // sets view for either new data entry or existing data edit
        _setViewFormat: function () {
            var displayVal = (this.newDataEntry) ? 'none' : 'block';
            query('.' + this._cssReadOnly, this.containerNode).style('display', displayVal);
        },

        _addChemDataEditorHandlers: function () {
            this._handlerList.push(aspect.after(this.zincMolarConcentration, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.bromineMolarConcentration, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.avgMolarConcentration, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.zincPh, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.brominePh, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.indirectBromineInZincTank, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.indirectBromineInBromineTank, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.electrolyteAdded, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.bromineAdded, 'onChange', lang.hitch(this, this._onChange), true));
            this._handlerList.push(aspect.after(this.logEntry, 'onChange', lang.hitch(this, this._onChange), true));
        },

        // callbacks
        _onChange: function (newValue) {
            if (!this.newDataEntry) {
                this.onDataChange(this.getValue());
            }
        },

        _onKeyUp: function (event) {
            var dataEntryTerminated = ((event.keyCode == keys.ENTER) || (event.keyCode == keys.TAB));
            if (dataEntryTerminated) {
                this._onChange();
            }
        },


        // events
        onDataChange: function (dto) {
        }
    });
});