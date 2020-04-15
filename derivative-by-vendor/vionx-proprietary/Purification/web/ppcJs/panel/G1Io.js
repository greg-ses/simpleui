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
        './_WatchdogStorePanel', '../mixin/_QueueClient', './io/ioDto', 'dojo/text!./io/template/io.html'],
function (declare, lang, construct, domClass, domStyle, query, aspect, array,
        Dictionary, registry, _Container, BorderContainer, ContentPane,
        DataFormat, Page, iPhoneButton,
        _WatchdogStorePanel, _QueueClient, ioDto, template) {
    return declare([_WatchdogStorePanel, _QueueClient, _Container],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 2,

        // json response tags
        _rootTemplateTag: 'ioTemplate',
        _rootDataTag: 'ioData',
        _enableInputTag: 'enableUserInput',
        _dout: 'DOUT',
        _din: 'DIN',
        _ain: 'AIN',

        // css classes
        _cssControlRow: 'ioControlRow',

        // private class variables
        _refreshIntervalId: '', // ajax refresh timer handle
        _resourceIdMap: '',     // 2-way dictionary: key/value = resource's 'id' attribute, value/key = dijit id
        _inhibitUpdate: false,  // true= inhibits updating
        _counter: 0,

        // resource names
        _dataResource: 'io/data',
        _templateResource: 'io/template',

        // dijit variables
        name: 'IO Panel',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'ioPanel',
        
        // lifecycle methods
        constructor: function () {
            this.inherited(arguments);
            this._resourceIdMap = new Dictionary();
            this._refreshInterval = 2000;
            this._queueDelayMs = 2000;
            this._restResources = [ { name: this._dataResource,     testFile: '../../ppcJs/tests/ioPanelDataResponse.json' },
                                    { name: this._templateResource, testFile: '../../ppcJs/tests/ioPanelTemplateResponse.json' }];
        },

        startup: function () {
            this.inherited(arguments);
            this.borderContainer.resize();
        },


        // public methods
        load: function (baseUrl, /*optional*/resourceId) {
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


        // private methods
        _fetchTemplate: function () {
            var store = this._getStore(this._templateResource);
            store.query().then(lang.hitch(this, this.onFetchTemplate));
        },

        _initiateDataRequests: function () {
            if (!this._refreshIntervalId) {
                this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchData), this._refreshInterval);
                
                this._refetchData();	// Get started immediatly.
            }
        },

        _refetchData: function () {
            var queryObj = this._useLocalTestFile() ? null : { c: this._counter++ };
            var store = this._getStore(this._dataResource);
            store.query(queryObj).then(lang.hitch(this, this.onFetchData));
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

        _createRwDigitalItems: function (/*Object[]*/elements, parentDijit) {
            array.forEach(elements, function (element) {
                var item = new ioDto.objConfig(element);
                //console.log("rwditem:" + item.id);
                var slider = this._addControlRow(item, parentDijit.domNode);
                var itemMap = new ioDto.Map(slider, ioDto.TypeEnum.DI);
                this._addResourceIdMapItem(item.id, itemMap);
                // add 2nd dictionary entry so can select by either dijit ID or server ID
                var sliderId = slider.get('id');
                this._addToolTip(sliderId, item.desc);
                this._resourceIdMap.add(sliderId, item.id);
            }, this);
        },

        _createRoDigitalItems: function (/*Object[]*/elements, parentDijit) {
            array.forEach(elements, function (element) {
                var item = new ioDto.objConfig(element);
                //console.log("roditem:" + item.id);
                var iconCell = this.puB.addOnOffRow(item.name, parentDijit.domNode);
                var itemMap = new ioDto.Map(iconCell, ioDto.TypeEnum.DO);
                this._addToolTip(iconCell, item.desc);
                this._addResourceIdMapItem(item.id, itemMap);
            }, this);
        },

        _createRoAnalogItems: function (/*Object[]*/elements, parentDijit) {
            array.forEach(elements, function (element) {
                var item = new ioDto.objConfig(element);
                //console.log("roaitem:" + item.id);
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
        	//console.log("dtoname: " + dto.id + " dtovalue: " +dto.rawVal);
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
        onFetchTemplate: function (/*jsonobject[]*/items, request) {
            this.inherited(arguments);
            
            //console.log("G1Io.js : onFetchTemplate()");
            //console.log(items);
            
            var dout_items = items[this._rootTemplateTag][this._dout];
            var din_items = items[this._rootTemplateTag][this._din];
            var ain_items = items[this._rootTemplateTag][this._ain];
            //array.forEach(dout_items, function(ele) { console.log("ele: " + ele.name + " desc: " +ele.description); } );

            this._createRwDigitalItems(dout_items, this.leftDiPane);
            this._createRoDigitalItems(dout_items, this.leftDoPane);

            this._createRoDigitalItems(din_items, this.centerPane);

            this._createRoAnalogItems(ain_items, this.rightPane);

            this._initiateDataRequests();
        },

        onFetchData: function (/*jsonobject[]*/items, request) {
            //console.log("G1Io.js : onFetchData() start ");
            this.inherited(arguments);

            //console.log(items);

            if (!this._inhibitUpdate) 
            {
                var enableUserInput = items[this._enableInputTag]; 

                //console.log("G1Io.js : onFetchData() enableUserInput:" + enableUserInput);

                if (enableUserInput) {
                    domStyle.set(registry.byId(this.leftDiPane).domNode, { display: 'block' });
                    domStyle.set(registry.byId(this.leftDoPane).domNode, { display: 'none' });
                }
                else {
                    domStyle.set(registry.byId(this.leftDiPane).domNode, { display: 'none' });
                    domStyle.set(registry.byId(this.leftDoPane).domNode, { display: 'block' });
                }

                var dout_items = items[this._rootDataTag][this._dout];
                var din_items = items[this._rootDataTag][this._din];
                var ain_items = items[this._rootDataTag][this._ain];

                array.forEach(dout_items, function(ele)
                		{
		                    var dto = new ioDto.objData(ele);
		                    this._updateItem(dto);
                		}, this);

                array.forEach(din_items, function(ele)
                		{
		                    var dto = new ioDto.objData(ele);
		                    this._updateItem(dto);
                		}, this);

                array.forEach(ain_items, function(ele)
                		{
		                    var dto = new ioDto.objData(ele);
		                    this._updateItem(dto);
                		}, this);
            }
        },

        onControlChange: function (slider) {
            var controlPoint = this._resourceIdMap.item(slider.get('id'));
            var newVal = slider.get('value');
            var valueObj = { VALUE: newVal };
            var optionsObj = { id: controlPoint };
            var store = this._getStore(this._dataResource);
            store.put(valueObj, optionsObj);
            
            this._setDebounce();
        }
    });
});
