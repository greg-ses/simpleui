// ~/control/DiagramBlock
// resource block widget used in system diagrams

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/query', 'dojo/on',
        'dojo/dom', 'dojo/dom-class', 'dojo/dom-construct', 'dojo/dom-style',
        'dojox/collections/Dictionary', 'dojox/string/Builder',
        '../Enum', '../utilities/DataFormat', '../utilities/Identity',
        './_Control', '../mixin/_CookieClient', '../mixin/_ToolTipClient', './diagramBlock/dbDto',
        'dojo/text!./diagramBlock/template/diagramBlock.html'],
function (declare, lang, array, query, on,
        dom, domClass, construct, domStyle,
        Dictionary, Builder,
        Enum, DataFormat, Identity,
        _Control, _CookieClient, _ToolTipClient, dbDto,
        template) {
    return declare([_Control, _CookieClient, _ToolTipClient],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 1,

        // public dijit/class variables (set by dbDto.Ctor)
        widgetsInTemplate: true,
        name: '',
        templateString: template,
        baseClass: 'diagramBlockControl',

        isMaster: false,
        dataConfigs: null,
        type: '',

        // private fields
        _idDataItemMap: null,   // dictionary returning DOM node for data item id
        _isExpanded: true,
        _toolTipText: '',       // holder for construction time config text until able to reference DOM
        _modeNode: null,
        _id: '',
        _justSelected: false,   // momentary flag to indicate if was recently selected before any toggling action

        // icon css class names, in-line styles
        _cssDbcLabel: 'dbcLabel',

        _cssUnselect: 'domainObjectUnselect',

        _cssNoPower: 'dbcNoPowerIcon',
        _cssPowerIn: 'dbcPowerInIcon',
        _cssPowerOut: 'dbcPowerOutIcon',

        _cssLocked: 'dbcLocked',
        _cssUnlocked: 'dbcUnlocked',

        _cssAuto: 'dbcAuto',
        _cssManual: 'dbcManual',

        // mode
        _cssCharge: 'dbcCharge',
        _cssDischarge: 'dbcDischarge',
        _cssOffline: 'dbcOffline',
        _cssStandby: 'dbcStandby',

        // cookies
        _cookieExpandState: 'dbExpandState',    // array of dbDto.CookieObjects

        // lifecycle methods
        constructor: function (/*dbDto.Ctor*/dto) {
            this._id = dto.serverId;
            this._idDataItemMap = new Dictionary();
            this._initializeToolTips();

            this._createLegend(dto);
        },

        postCreate: function () {
            this.nameDiv.innerHTML = this.name;
            this._insertModeItem();
            this._createDataItems(this.dataConfigs);

            this.unselect();
            if (!this._getItemFromCookieList(this._cookieExpandState, this._id)) {
                this._toggleView();
            }
            this._addToolTip(this.domNode, this._toolTipText);
            delete this._toolTipText;
        },


        // public methods
        configure: function () {
            // delayed to configure() to allow parent to control domNode event handler registration order
            on(this.domNode, 'click', lang.hitch(this, this._onClick));
        },

        update: function (/*DiagramBlockStatus*/status) {
            if (status.linkDisabled) {
                domStyle.set(this.disabledBody, { display: 'block' });
                domStyle.set(this.enabledBody, { display: 'none' });
                domStyle.set(this.powerDirDiv, { visibility: 'hidden' });
            }
            else {
                domStyle.set(this.disabledBody, { display: 'none' });
                domStyle.set(this.enabledBody, { display: 'block' });
                domStyle.set(this.powerDirDiv, { visibility: 'visible' });

                this._modeNode.innerHTML = status.mode;
                this._updatePowerDirIcon(status.powerDir);
                this.puB.updateErrorIcon(this.errorDiv, status.errorStatus);

                array.forEach(status.dataValues, function (/*dbDto.DataValue*/dataValue) {
                    var valueType = null;
                    array.some(this.dataConfigs, function (dataConfig) {
                        if (dataConfig.id == dataValue.id) {
                            valueType = dataConfig.valueType;
                            return true;
                        }
                    });

                    if (valueType != null) {
                        switch (valueType) {
                            case (Enum.ValueType.Float):
                                var valueStr = DataFormat.getFloatAsString(dataValue.value, this._floatPrecision, this._naNPlaceHolder);
                                break;
                            default:
                                var valueStr = dataValue.value;
                                break;
                        }
                        var infoBox = this._idDataItemMap.item(dataValue.id);
                        infoBox.innerHTML = valueStr;
                    }
                }, this);
            }
        },

        select: function () {
            this._justSelected = true;
            domClass.replace(this.blockDiv, this.puB._cssSelectBorder, this._cssUnselect);
        },

        unselect: function () {
            this._justSelected = false;
            domClass.replace(this.blockDiv, this._cssUnselect, this.puB._cssSelectBorder);
        },


        // private methods
        _createLegend: function (/*dbDto.Ctor*/dto) {
            var legend = new Builder('ID: ');
            legend.append(dto.serverId);
            legend.append('<br/>');
            legend.append('Type: ');
            legend.append(dto.type);
            legend.append('<br/><br/>');
            legend.append('<b>Legend</b><br/>');

            array.forEach(dto.dataConfigs, function (dataConfig) {
                legend.append(dataConfig.label);
                legend.append(': ');
                legend.append(dataConfig.description);
                legend.append('<br/>');
            });

            this._toolTipText = legend.toString();
        },

        _toggleView: function () {
            if (this._isExpanded && !this._justSelected) {
                var selectAllRows = '>*';
                query(selectAllRows, dom.byId(this.dataTable)).forEach(function (row, i) {
                    domStyle.set(row, { display: 'none' });
                });
                this._isExpanded = false;
            }
            else {
                // display all data item rows
                var selectAllRows = '>*';
                query(selectAllRows, dom.byId(this.dataTable)).forEach(function (row) {
                    domStyle.set(row, { display: 'inherit' });
                });
                this._isExpanded = true;
            }

            this._justSelected = false;
            this._updateCookieList(this._cookieExpandState, this._id, this._isExpanded);
        },

        _createDataItems: function (/*dbDto.DataConfig[]*/dataConfigs) {
            array.forEach(dataConfigs, this._insertDataItem, this);
        },

        _insertDataItem: function (/*dbDto.DataConfig*/dataConfig) {
            var row = this.puB.createRow();

            var labelCell = this.puB.createCell(dataConfig.label);
            domClass.add(labelCell, [this.puB._cssLabel, this._cssDbcLabel]);
            construct.place(labelCell, row);

            var valueCell = this.puB.createCell();
            domClass.add(valueCell, this.puB._cssInfo);
            construct.place(valueCell, row);
            this._idDataItemMap.add(dataConfig.id, valueCell);

            construct.place(row, dom.byId(this.dataTable));
        },

        _insertModeItem: function () {
            var row = this.puB.createRow();
            this._modeNode = this.puB.createCell();
            domClass.add(this._modeNode, this.puB._cssInfo);
            construct.place(this._modeNode, row);
            construct.place(row, dom.byId(this.dataTable));
        },

        _updatePowerDirIcon: function (/*PowerDirEnum*/powerDir) {
            switch (powerDir) {
                case (dbDto.PowerDirEnum.None):
                    domClass.replace(this.powerDirDiv, this._cssNoPower, [this._cssPowerIn, this._cssPowerOut]);
                    break;

                case (dbDto.PowerDirEnum.In):
                    domClass.replace(this.powerDirDiv, this._cssPowerIn, [this._cssNoPower, this._cssPowerOut]);
                    break;

                case (dbDto.PowerDirEnum.Out):
                    domClass.replace(this.powerDirDiv, this._cssPowerOut, [this._cssNoPower, this._cssPowerIn]);
                    break;

                default:
                    break;
            }
        },


        // callbacks
        _onClick: function () {
            this._toggleView();
        }
    });
});

