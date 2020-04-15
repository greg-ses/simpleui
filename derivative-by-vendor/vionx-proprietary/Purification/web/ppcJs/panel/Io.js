// ~/panel/Io
// IO Panel - template configured list of AO, DI, DO signals
// AI controls not implemented (see 'AI' comments for extension points)

// Pub/sub list:
// [pub] ppcJs.PubSub.timeUpdate
// [pub] ppcJs.PubSub.commTimeout
// [pub] ppcJs.PubSub.commFault

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dojo/query', 'dojo/aspect', 'dojo/_base/array',
        'dojox/collections/Dictionary', 'dijit/registry', 'dijit/_Container', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
        '../utilities/DataFormat', '../utilities/Page', '../widget/iPhoneButton',
        './_WatchdogPanel', '../mixin/_QueueClient', './io/ioDto', 'dojo/text!./io/template/io.html'],
function (declare, lang, construct, domClass, domStyle, query, aspect, array,
        Dictionary, registry, _Container, BorderContainer, ContentPane,
        DataFormat, Page, iPhoneButton,
        _WatchdogPanel, _QueueClient, ioDto, template) {
    return declare([_WatchdogPanel, _QueueClient, _Container],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 3,

        // ajax request command constants
        _getTemplateCmd: { GET: 'IO_TEMPLATE' },
        _getDataCmd: { GET: 'IO_DATA' },
        _setDataCmd: { SET: 'IO_DATA' },

        // ajax response tags
        _rootTemplateTag: 'ioTemplate',
        _rootDataTag: 'ioData',
        _itemTag: 'item',
        _timeTag: 'timestamp',
        _enableInputTag: 'enableUserInput',
        _itemTypeAttrib: 'type',
        _writeAttrib: 'write',

        // css classes
        _cssControlRow: 'ioControlRow',

        // private class variables
        _refreshIntervalId: '', // ajax refresh timer handle
        _resourceIdMap: '',     // 2-way dictionary: key/value = resource's 'id' attribute, value/key = dijit id
        _inhibitUpdate: false,  // true= inhibits updating

        // dijit variables
        name: 'IO Panel',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'ioPanel',

        // lifecycle methods
        constructor: function () {
            this._resourceIdMap = new Dictionary();
            this._refreshInterval = 2000;
            this._queueDelayMs = 2000;
        },


        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);

            this._fetchTemplate();
            this.startup();
        },

        unload: function () {
            this.inherited(arguments);
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                this._refreshIntervalId = '';
            }

            this.leftDiPane.destroyDescendants();
            this.leftDoPane.destroyDescendants();
            this.centerPane.destroyDescendants();
            this.rightPane.destroyDescendants();
            this._resourceIdMap.clear();
        },

        startup: function () {
            this.inherited(arguments);
            this.borderContainer.resize();
        },

        // private methods
        _fetchTemplate: function () {
            var testUrl = '../../ppcJs/tests/ioPanelTemplateResponse.xml';
            var queryObj = { ID: this._queryId };
            lang.mixin(queryObj, this._getTemplateCmd);
            this._initStore(testUrl, queryObj, this._rootTemplateTag, this.onFetchTemplate);
        },

        _initiateDataRequests: function () {
            var testUrl = '../../ppcJs/tests/ioPanelDataResponse.xml';
            var queryObj = { ID: this._queryId };
            lang.mixin(queryObj, this._getDataCmd);
            this._initStore(testUrl, queryObj, this._rootDataTag, this.onFetchData);
            if (!this._refreshIntervalId) {
                this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchData), this._refreshInterval);
            }
        },

        _refetchData: function () {
            this._xmlStore.close();
            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onFetchData) });
        },

        _addResourceIdMapItem: function (serverId, /*ioDto.Map*/itemMap) {
            if (this._resourceIdMap.containsKey(serverId)) {
                this._resourceIdMap.item(serverId).push(itemMap);
            }
            else {
                var itemMaps = new Array(itemMap);
                this._resourceIdMap.add(serverId, itemMaps);
            }
        },

        _createRwDigitalItems: function (/*XmlElement[]*/elements, parentDijit) {
            array.forEach(elements, function (element) {
                var item = new ioDto.Config(element);
		if (item.name == "") { item.name = item.id; }
		if (item.desc == "") { item.desc = item.name; }
                var slider = this._addControlRow(item, parentDijit.domNode);
                var itemMap = new ioDto.Map(slider, ioDto.TypeEnum.DI);
                this._addResourceIdMapItem(item.id, itemMap);
                // add 2nd dictionary entry so can select by either dijit ID or server ID
                var sliderId = slider.get('id');
                this._addToolTip(sliderId, item.desc);
                this._resourceIdMap.add(sliderId, item.id);
            }, this);
        },

        _createRoDigitalItems: function (/*XmlElement[]*/elements, parentDijit) {
            array.forEach(elements, function (element) {
                var item = new ioDto.Config(element);
		if (item.name == "") { item.name = item.id; }
		if (item.desc == "") { item.desc = item.name; }
                var iconCell = this.puB.addOnOffRow(item.name, parentDijit.domNode);
                var itemMap = new ioDto.Map(iconCell, ioDto.TypeEnum.DO);
                this._addToolTip(iconCell, item.desc);
                this._addResourceIdMapItem(item.id, itemMap);
            }, this);
        },

        _createRoAnalogItems: function (/*XmlElement[]*/elements, parentDijit) {
            array.forEach(elements, function (element) {
                var item = new ioDto.Config(element);
		if (item.name == "") { item.name = item.id; }
		if (item.desc == "") { item.desc = item.name; }
                var dataCell = this.puB.addDataRow(item.name, '-', parentDijit.domNode);
                var itemMap = new ioDto.Map(dataCell, ioDto.TypeEnum.AO);
                this._addToolTip(dataCell, item.desc);
                this._addResourceIdMapItem(item.id, itemMap);
            }, this);
        },

        _createRwAnalogItems: function (/*XmlElement[]*/elements, parentDijit) {
            // RW Analog (AI) case not implemented
        },

        // returns reference to slider
        _addControlRow: function (/*ioDto.Config*/item, parentNode) {
            var row = this.puB.createRow();
            var labelCell = this.puB.createCell(item.name);
            domClass.add(labelCell, [this.puB._cssIndicatorLabel, this._cssControlRow]);
            construct.place(labelCell, row);

            var controlCell = this.puB.createCell();
            domClass.add(controlCell, this._cssControlRow);
            var slider = new iPhoneButton({
                onText: 'ON',
                offText: 'OFF',
                width: 100,
                animateSpeed: 200,
                startOn: false
            });

            construct.place(slider.domNode, controlCell);
            this._handlerList.push(aspect.after(slider, 'onChange', lang.hitch(this, this.onControlChange), true));

            construct.place(controlCell, row);
            construct.place(row, parentNode);

            return slider;
        },

        _updateItem: function (/*ioDto.Data*/dto) {
            var itemMaps = this._resourceIdMap.item(dto.id);
            array.forEach(itemMaps, function (itemMap) {
                switch (itemMap.type) {
                    case (ioDto.TypeEnum.AO):
                        this.puB.setData(itemMap.item, dto.rawVal, this._floatPrecision, this._naNPlaceHolder);
                        break;

                    case (ioDto.TypeEnum.DI):
                        var dataVal = DataFormat.toBool(dto.rawVal);
                        itemMap.item.setValue(dataVal);
                        break;

                    case (ioDto.TypeEnum.DO):
                        var dataVal = DataFormat.toBool(dto.rawVal);
                        this.puB.setOn(itemMap.item, dataVal);
                        break;

                    case (ioDto.TypeEnum.AI):
                        // RW Analog (AI) case not implemented
                    default:
                        break;
                }
            }, this);
        },


        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);

            var rootElem = items[0]['element'];

            var digitalSelect = this.puS.getCssAttribSelector(this._itemTypeAttrib, 'bool');
            var analogSelect = this.puS.getCssAttribSelector(this._itemTypeAttrib, 'float');
            var rwSelect = this.puS.getCssAttribSelector(this._writeAttrib, 'true');
            var roSelect = this.puS.getCssAttribSelector(this._writeAttrib, 'false');

            var rwDigitalSelect = this._itemTag + digitalSelect + rwSelect;
            var rwDigitalItems = query(rwDigitalSelect, rootElem);
            // alternate panes: enableUserInput value determines which is displayed
            this._createRwDigitalItems(rwDigitalItems, this.leftDiPane);
            this._createRoDigitalItems(rwDigitalItems, this.leftDoPane);

            var roDigitalSelect = this._itemTag + digitalSelect + roSelect;
            var roDigitalItems = query(roDigitalSelect, rootElem);
            this._createRoDigitalItems(roDigitalItems, this.centerPane);

            var roAnalogSelect = this._itemTag + analogSelect + roSelect;
            var roAnalogItems = query(roAnalogSelect, rootElem);
            this._createRoAnalogItems(roAnalogItems, this.rightPane);

            //var rwAnalogSelect = this._itemTag + analogSelect + rwSelect;
            //var rwAnalogItems = query(rwAnalogSelect, rootElem);
            //this._createRwAnalogItems(rwAnalogItems);

            this._initiateDataRequests();
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);

            if (!this._inhibitUpdate) {
                var rootElem = items[0]['element'];
                var enableUserInput = DataFormat.toBool(this.puS.getElementText(this._enableInputTag, rootElem));

                if (enableUserInput) {
                    domStyle.set(registry.byId(this.leftDiPane).domNode, { display: 'block' });
                    domStyle.set(registry.byId(this.leftDoPane).domNode, { display: 'none' });
                }
                else {
                    domStyle.set(registry.byId(this.leftDiPane).domNode, { display: 'none' });
                    domStyle.set(registry.byId(this.leftDoPane).domNode, { display: 'block' });
                }

                query(this._itemTag, rootElem).forEach(function (/*XmlElement*/element) {
                    var dto = new ioDto.Data(element);
                    this._updateItem(dto);
                }, this);
            }
        },

        onControlChange: function (slider) {
            var serverId = this._queryId;
            var controlPoint = this._resourceIdMap.item(slider.get('id'));
            var newVal = slider.get('value');
            var controlObject = { CTRL_POINT: controlPoint, VALUE: newVal };
            var idObject = { ID: serverId };
            var queryObj = idObject;
            var setObject = this._setDataCmd;
            lang.mixin(queryObj, setObject);
            lang.mixin(queryObj, controlObject);
            this.xhrGet(queryObj);

            this._setDebounce();
        }
    });
});
