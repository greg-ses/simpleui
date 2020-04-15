// ~/panel/DcServer
// DC Panel - template configured list of AO, DI, DO signals
// AI controls not implemented (see 'AI' comments for extension points)

// Pub/sub list:
// [pub] ppcJs.PubSub.timeUpdate
// [pub] ppcJs.PubSub.commTimeout
// [pub] ppcJs.PubSub.commFault

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dojo/query', 'dojo/on', 'dojo/topic', 'dojo/mouse',
        'dijit/_Container', 'dijit/registry',
        'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'dijit/form/Button', 'dijit/form/NumberTextBox', 'dojox/layout/TableContainer',
        'dojox/collections/Dictionary', '../utilities/Compatibility', '../utilities/DataFormat', '../PubSub', '../control/DcServerData',
        '../control/DcServerDetail', './_WatchdogStorePanel', '../mixin/_QueueClient', '../control/dcServerData/dsdDto', './dcServer/dsDto', 'dojo/text!./dcServer/template/dcServer.html', 'dojox/xml/parser'],
function (declare, lang, array, dom, construct, domClass, domStyle, query, on, topic, mouse,
        _Container, registry,
        BorderContainer, ContentPane, Button, NumberTextBox, TableContainer,
        Dictionary, Compatibility, DataFormat, PubSub, DcServerData,
        DcServerDetail, _WatchdogStorePanel, _QueueClient, dsdDto, dsDto, template, parser) {
    return declare([_WatchdogStorePanel, _QueueClient, _Container],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 2,
        _DCDCId: 0,
        // ajax request command constants
        _getTemplateCmd: { GET: 'DCSERVER_TEMPLATE' },
        _getDataCmd: { GET: 'DCSERVER_DATA' },
        _setDataCmd: { SET: 'DCSERVER_DATA' },
        _serviceOfflineCmd: { id: 'DC_OFFLINE' },
        _serviceSetup1Cmd: { id: 'DC_SETUP1_VALS' },
        _serviceSetup2Cmd: { id: 'DC_SETUP2_VALS' },
        _serviceDefaultSetup1: {id: 'DC_DEFSETUP1'},
        _serviceDefaultSetup2: {id: 'DC_DEFSETUP2'},        
        _serviceOnlineCmd: { id: 'DC_STANDBY' },
        _serviceStaticICmd: { id: 'DC_CHARGE' },
        _serviceVBusCmd: { id: 'DC_VBUS' },

        // ajax request interval (ms)
        _refreshInterval: 2000,
        _refreshIntervalId: '',

        // ajax response tags
        _timeStampTag: 'timeStamp',
        _rootTemplateTag: 'DCServerTemplate',
        _rootDataTag: 'DCServerData',
        _rootDetailTag: 'DCServerData',
        _DCsTag: 'DCDCs',
        _idAttrib: 'id',
        _DCTag: 'DCDC',

        _itemTag: 'item',

        _idBattCurrent: 'Batt_Current',
        _idBattVoltage: 'Batt_Voltage',
        _idDCBusVoltage: 'DCBus_Voltage',
        _idBusCurrent: 'Bus_Current',
        _idAmpHours: 'Amp_Hours',
        _idHeatsinkTemp: 'Heatsink_Temperature',
        _idDCOutSense: 'DC_OutSense',
        _idDCStatus: 'Status',
        _idDCFaultStatus: 'Fault_Status',
        _idSFVersion: 'SF_Version',
        _idFaultInfo: 'Fault_Info',
        _idStatusInfo: 'Status_Info',
        _idModeInfo: 'Mode_Info',
        _legendTag: 'Legend',
        _timeTag: 'timestamp',
        _itemTypeAttrib: 'type',
        _writeAttrib: 'write',


        // css classes
        _cssControlRow: 'ioControlRow',

        // class variables
        _resourceIdMap: '', // 2-way dictionary: key/value = resource's 'id' attribute, value/key = dijit id
        _dcDataTable: '', //Hold dojox table for dcServerData DTO
        _dcDetailTable: '', //Hold dojox table for detail dcServerData
        // resource names
        _dataResource: 'dcdc/data',
        _templateResource: 'dcdc/template',
        _dataSetup1: 'dcdc/setup/setup1',
        _dataSetup2: 'dcdc/setup/setup2',	

        //array of dto objects
        _dtoList: '',
        _detailResource: '',
        _highlightedDTO: 1,
        // dijit variables
        name: 'DCServer Panel',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'dcServerPanel',

        
        // public methods

        // lifecycle methods
        constructor: function () {
            this.inherited(arguments);
            this._resourceIdMap = new Dictionary();
            this._refreshInterval = 2000;
            this._queueDelayMs = 2000;
            this._restResources = [ { name: this._dataResource,     testFile: '../../ppcJs/tests/DCServerDataResponse.json' },
                                    { name: this._dataSetup1,     testFile: '../../ppcJs/tests/DCServerSetup1Response.json' },
                                    { name: this._dataSetup2,     testFile: '../../ppcJs/tests/DCServerSetup1Response.json' },                                    
                                    { name: this._templateResource, testFile: '../../ppcJs/tests/DCServerTemplateResponse.json' }];
        },

        postCreate: function () {
            this.inherited(arguments);
            _dtoList = new Array();
        },

        startup: function () {
            this.inherited(arguments);
            this.borderContainer.resize();

            if(this._dcDataTable === '')
            	{
            	this._dcDataTable = new TableContainer({cols:3, spacing:0}, "_dcDataTable");
        		this._dcDetailTable = new TableContainer({cols:2, spacing:0, customClass:"dcDetailData"}, "_dcDetailTable");
            	}
        },

        load: function (baseUrl, /*optional*/resourceId) {
            
            this._queryId = resourceId;
            this.inherited(arguments);
		if(!this._dcDataTable)
			{
				this._dcDataTable = new TableContainer(
				{
				  cols: 3,
				  "labelWidth": "100",
				}, dojo.byId("_dcDataTable"));
			}
            this._fetchTemplate();
            
            this.startup();
        },

        unload: function () {
            this.inherited(arguments);
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                this._refreshIntervalId = '';
            }

            //this._dcDataTable.destroyDescendants();
		if(this._dcDataTable)
			{
				var children = this._dcDataTable.getChildren();
				array.forEach(children, function (child) {
					this._dcDataTable.removeChild(child);
				}, this);
			}
            this._dcDetailTable.destroyDescendants();
            //this._dcDataTable = '';

            this._resourceIdMap.clear();
        },

        // private methods

        //Assemble a DCDC DTO from incoming data
        _addResourceCell: function (/*object*/DCElement, /*bool*/bShowLabels) {
            //Create the DTO item and place it on the page
        	 
            var name = DCElement.name; //this.puS.getElementText('name', DCElement);
            var dto = new dsdDto.Ctor(name, 2000, bShowLabels);
            var resource = new DcServerData(dto);
            _dtoList.push(dto);
            // add 2-way dictionary entry so can select by either resourceId or serverId
            //This is a DOM id from the created DTO
            var resourceId = resource.get('id');
            //This would be 'DCDC1' for example
            var serverId = dto.name; //  Compatibility.attr(DCElement.name, 'id');
            this._resourceIdMap.add(serverId, resourceId);
            this._resourceIdMap.add(resourceId, serverId);

            //console.log("_addResourceCell [" +Boolean(bShowLabels)+ " : "+dto.showLabels+"] : " + dto.name + " : " + resourceId + " : " + serverId);

            this._dcDataTable.addChild(resource);            
            //Add event handler which is called when this resource is clicked on
            var boundFunction = dojo.hitch(this, this._setHighlightedDTO);
            on(resource.controlName, "click", boundFunction);
            on(resource.controlName, mouse.enter, function(evt){
                domStyle.set(resource.controlName, "color", "red");
            });
            on(resource.controlName, mouse.leave, function(evt){
            	domStyle.set(resource.controlName, "color", "black");
            });

        },

        _setHighlightedDTO: function(event) {
          //Set the DTO id number or name or both
        	var id = event.target.innerHTML;	
        	this._highlightedDTO = this._getIDFromStr(id);
        	//dom.byId(this.detailData1).innerHTML = this._highlightedDTO;
        },
        
        _handleDefaultSetup1: function () {
            this._handleServiceButton(this._serviceDefaultSetup1);
        	
        },

        _handleDefaultSetup2: function () {
            this._handleServiceButton(this._serviceDefaultSetup2);
        	
        },

        _handleIDNum: function (/*Event Info*/keyEvent) {
        	
            //If the source event is a key press check for a return key
            if (keyEvent.keyCode && keyEvent.keyCode != 13) {
                return;
            }

        	this._DCDCId = this.txtDCDCID.get("value");
        	
        },
        
        _handleServiceOffline: function () {

            //Create a DC command with the appropriate command tag
            this._handleServiceButton(this._serviceOfflineCmd);
        },

        
        _handleSetup1: function () {

            //Push a command with all setup 1 params
        	var setup1Params = {MAX_BUSV: this.txtMaxBusV.get("value")};
        	lang.mixin(setup1Params, {MIN_BUSV: this.txtMinBusV.get("value")});
        	lang.mixin(setup1Params, {BUSV_SENSE_OFFSET: this.txtBusVSenseOffset.get("value")});
        	lang.mixin(setup1Params, {DC_BUS_TARGET: this.txtDCBusTarget.get("value")});

            var serverId = this._queryId;
            var commandObject = {id: "DC_SETUP1"};
            var idObject = { ID: serverId };
            var queryObject = idObject;

            var DCDCNumber = { DCDCNUM: this._DCDCId };

            //var optionsObj = { VALUE : "0" };
            //lang.mixin(queryObject, commandObject);
            //lang.mixin(setup1Params, moreOpts );
            lang.mixin(setup1Params, DCDCNumber);
            var store = this._getStore(this._dataSetup1);
            store.put(setup1Params, commandObject);
            
            //console.log('serverId=' + serverId);
        	
        	//this._handleServiceButton(this._serviceSetup1Cmd, setup1Params);
        },

        _handleSetup2: function () {

            //Push a command with all setup 1 params
        	var setup2Params = {BATT_I_CHARGE_LIM: this.txtBattIChargeLimit.get("value")};
        	lang.mixin(setup2Params, {BATT_I_DISCHARGE_LIM: this.txtBattIDischargeLimit.get("value")});
        	lang.mixin(setup2Params, {BATT_V_MAX: this.txtBattVChargeLimit.get("value")});
        	lang.mixin(setup2Params, {BATT_V_SENS_OFFSET: this.txtBattVSensorOffset.get("value")});
        	lang.mixin(setup2Params, {BATT_V_TARGET: this.txtBattVTarget.get("value")});

            var serverId = this._queryId;
            var commandObject = {id: "DC_SETUP2"};
            var idObject = { ID: serverId };
            var queryObject = idObject;

            var DCDCNumber = { DCDCNUM: this._DCDCId };

            lang.mixin(setup2Params, DCDCNumber);
            var store = this._getStore(this._dataSetup2);
            store.put(setup2Params, commandObject);
            
            //console.log('serverId=' + serverId);
        	
        },

        _handleServiceOnline: function () {

            //Create a DC command with the appropriate command tag
            this._handleServiceButton(this._serviceOnlineCmd);
        },

        _handleCharge: function (/*Event Info*/keyEvent) {

            //If the source event is a key press check for a return key
            if (keyEvent.keyCode && keyEvent.keyCode != 13) {
                return;
            }

            //Read the charge value
            var valCharge = this.txtCharge.get("value"); //10.0.4.170:5015/cgi-bin/cgicmd?COMMAND=DC_CHARGE&IDNUM=&DETAILLEVEL=1&INCID=1&VALUE=-10&DCDC=0&ACAC=NaN&INCDETAILVAL=1&SYSDETAILS=1&QUADSTATUS=1&CGI=pbcmd&tstamp=1340215400471

            var chargeValue = { VALUE: valCharge };
            var DCDCNumber = { DCDC: 0 };
            this._handleServiceButton(this._serviceStaticICmd, chargeValue, DCDCNumber);
        },


        _handlePower: function (/*Event Info*/keyEvent) {
            //If the source event is a key press check for a return key
            if (keyEvent.keyCode && keyEvent.keyCode != 13) {
                return;
            }

            //Read the charge value
            var valCharge = this.txtStrip.get("value"); 

            var chargeValue = { VALUE: valCharge };
            var DCDCNumber = { DCDC: 0 };
            this._handleServiceButton(this._serviceStaticICmd, chargeValue, DCDCNumber);
        },

        _handleVBus: function () {

            //Create a DC command with the appropriate command tag
            this._handleServiceButton(this._serviceVBusCmd);
        },

        _handleZeroAH: function () {

            //Create a DC command with the appropriate command tag
            this._handleServiceButton(this._serviceOfflineCmd);
        },

        _handleServiceButton: function (/*command string*/dcCmd, /*optional param*/dcOpt1,
        /*optional param*/dcOpt2) {
            // Do something:
            dom.byId(this.btnResult).innerHTML += "Button Pressed.";

            //10.0.4.170:5015/cgi-bin/cgicmd?COMMAND=DC_OFFLINE&IDNUM=&DETAILLEVEL=1&INCID=1&VALUE=&DCDC=0&ACAC=0&INCDETAILVAL=1&SYSDETAILS=1&QUADSTATUS=1&CGI=pbcmd&tstamp=1340199830473

            var serverId = this._queryId;
            //var commandObject = dcCmd;
            //var idObject = { ID: serverId };

            //dojo.xhrGet(this._assembleXhrArgs(queryObject));
/*
            var controlPoint = this._resourceIdMap.item(slider.get('id'));
            var newVal = slider.get('value');
            var valueObj = { VALUE: newVal };
            var optionsObj = { id: controlPoint };
            var store = this._getStore(this._dataResource);
            store.put(valueObj, optionsObj);
*/
            var DCDCNumber = { DCDCNUM: this._DCDCId };

            var optionsObj = DCDCNumber;
            //dcCmd = { id : "DC_CHARGE"};
            var moreOpts = { TESTOPT : "TestVal"};
            lang.mixin(optionsObj, moreOpts );
            lang.mixin(optionsObj, DCDCNumber);
            if (dcOpt1) {
                lang.mixin(optionsObj, dcOpt1);
            }

            if (dcOpt2) {
                lang.mixin(optionsObj, dcOpt2);
            }            
            var store = this._getStore(this._dataResource);
            store.put(optionsObj, dcCmd);
            
            console.log('serverId=' + serverId);
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
            var queryObj = {c: "1"};//this._useLocalTestFile() ? null : { c: this._counter++ };
            var store = this._getStore(this._dataResource);
            store.query(queryObj).then(lang.hitch(this, this.onFetchData));
        },


        _createLegendItems: function (/*XmlElement[]*/elements) {
            for (var i = 0; i < elements.length; i++) {
                var item = new dsDto.ConfigLegend(elements[i]);
                /*var LegendItem = this._addLegendItem(item, this.leftPane.domNode);

                var LegendItemId = Compatibility.attr(elements[i], this._idAttrib);
                this._addToolTip(LegendItemId, item.desc);*/
            }
        },

        _createDCItems: function (/*Objects*/elements) {
        	
        	console.log("G1DCserver.js::_createDCItems() " );
            console.log(elements);

            //Create new row every n DC-DCs
            var elementsPerRow = this._dcDataTable.cols;
            var bFirstColumn = false;
            var i = 0;
            
            for (var item_name in elements) {
            	//console.log(i + ":" + elements[item_name].name + " : " + elements[item_name].desc);
            	
                if ((i % elementsPerRow) == 0) 
                    bFirstColumn = true;
                else 
                    bFirstColumn = false;
                ++i;

            	console.log("FC:" + bFirstColumn + ":" + i + ":" + elements[item_name].name + " : " + elements[item_name].desc);

                this._addResourceCell(elements[item_name], true); // bFirstColumn);
            }
            
            if( i > 0 )
            {
            	//Create detailed data object, default set to first dto
            	//var child = _dcDataTable.children[0];
            	//var detailResource = new DcServerDetail(_dcDataTable.children[0]);
            	this._detailResource = new DcServerDetail(_dtoList[0]);
            	this._dcDetailTable.addChild(this._detailResource);
                //var resourceId = resource.get('id');
                //var serverId = dto.name; 
                //this._resourceIdMap.add(serverId, resourceId);
                //this._resourceIdMap.add(resourceId, serverId);            	
            }
            
            //Start the dojox table
            this._dcDataTable.startup();            
            this._dcDataTable.layout();
            
            this._dcDetailTable.startup();
            this._dcDetailTable.layout();
        },

        // returns reference to Legend display item
        _addLegendItem: function (/*panel.dcServer.dsDto.Config*/item, parentNode) {
            var row = this.puB.createRow();
            var labelCell = this.puB.createCell(item.name);
            domClass.add(labelCell, [this.puB._cssIndicatorLabel, this._cssControlRow]);
            construct.place(labelCell, row);

            construct.place(row, parentNode);

            return labelCell;
        },

        _addDCItem: function (/*dcServer/dsDto.Config*/item, parentNode) {
            //Each data component for the DC will reside on
            for (var itemCount = 0; itemCount < item.dcDataElements.length; itemCount++) {
                var row = this.puB.createRow();
                //create a data cell for each data item
                var dataCell = this.puB.addDataRow(item.name, '-', this.centerPane.domNode);

                var labelCell = this.puB.createCell(dcDataElement.name);
                domClass.add(labelCell, [this.puB._cssIndicatorLabel, this._cssControlRow]);
                construct.place(labelCell, row);
            }

            construct.place(row, parentNode);

            return labelCell;
        },

        // returns text content of xml element as string where:
        //  elementName = xml element name
        //  parentElement = xml element
        _getElementTextFromId: function (elementName, idValue, parentElement) {
            var idSelect = this.puS.getCssAttribSelector('id', idValue);
            var itemSelect = elementName + idSelect;
			
            var nodeList = query("[id=" + idValue +"]", parentElement);
			var elementText;
			if( nodeList.length <= 0 )
			{
				elementText = "-";
			}
			else
			{
				elementText = parser.textContent(nodeList[0]);
			}
            return elementText;
        },

        _updateItem: function (/*dcServer/dsDto.Data*/dto) {
            var itemMap = this._resourceIdMap.item(dto.id);

            switch (itemMap.type) {
                case (dsDto.TypeEnum.DCData):
                    this.puB.setData(itemMap.item, dto.rawVal, this._floatPrecision, this._naNPlaceHolder);
                    break;

                case (dsDto.TypeEnum.AI):
                    // RW Analog (AI) case not implemented
                default:
                    break;
            }
        },


        //utility
        _getIDFromStr: function (strID) {
        	var idVal = strID.substring(4);

        	return(idVal);
        },
        
        // callbacks

        onFetchTemplate: function (/*jsonobject[]*/items, request) {
            this.inherited(arguments);

            console.log("G1DcServer.js : onFetchTemplate() starting.");
            console.log(items);

            //Load the Legend information
            /*
            var LegendSelect = this._legendTag;
            var ItemSelect = this._itemTag;
            var LegendItems = query(ItemSelect, rootElem.children.Legend);
            this._createLegendItems(LegendItems); */

            var dcdcs = items[this._rootTemplateTag][this._DCsTag];
            //console.log(dcdcs);

            this._createDCItems(dcdcs); //[this._rootTemplateTag][this._DCsTag]);
            
            console.log("G1DcServer.js : onFetchTemplate() initiation data request.");

            // Enable this to begin requesting data
            this._initiateDataRequests();

            console.log("G1DcServer.js : onFetchTemplate() end.");
        },

        onFetchData: function (/*jsonobject[]*/items, request) {
            this.inherited(arguments);

            console.log("G1DcServer.js : onFetchData() start ");
            
            var dcdc_data = items[this._rootDataTag]

            //console.log(dcdc_data);

            for (var dcd in dcdc_data)
            {
            	var BattCurrent = dcdc_data[dcd][this._idBattCurrent];
                var BattVoltage = dcdc_data[dcd][this._idBattVoltage];
                var DCBusVoltage = dcdc_data[dcd][this._idDCBusVoltage];
                var DCBusCurrent = dcdc_data[dcd][this._idBusCurrent];
                var AmpHours = dcdc_data[dcd][this._idAmpHours];
                var HeatSinkTemp = dcdc_data[dcd][this._idHeatsinkTemp];
                var OutSense = dcdc_data[dcd][this._idDCOutSense];
                var DCStatus = dcdc_data[dcd][this._idDCStatus];
                var DCFaultStatus = dcdc_data[dcd][this._idDCFaultStatus];
                var SFVersion = dcdc_data[dcd][this._idSFVersion];
                var FaultInfo = dcdc_data[dcd][this._idFaultInfo];
                var StatusInfo = dcdc_data[dcd][this._idStatusInfo];
                var ModeInfo = dcdc_data[dcd][this._idModeInfo];
                
                var timestamp = parseInt(items[this._timeStampTag]);
                topic.publish(PubSub.timeUpdate, timestamp, this.name);
                
                console.log("ts:" + timestamp + "; " + dcd + " : " + " BC: " + BattCurrent + " BV:" + BattVoltage + " AH:" + AmpHours);
             
                //This is the DOM ID, used to locate the resource on the page
                var dijitId = this._resourceIdMap.item(dcd);
                //This gets the resource planted on the page
                var resource = registry.byId(dijitId);
                
                var newState = new dsdDto.Status(
                        BattCurrent, //Batt_Current
      							    BattVoltage, //Batt_Voltage
      							    DCBusVoltage, //DCBus_Voltage
      							    DCBusCurrent, //Bus_Current
      							    AmpHours, //Amp_Hours
      							    HeatSinkTemp, //Heatsink_Temperature
      							    OutSense, //DC_OutSense
      							    DCStatus, //DCStatus
      							    DCFaultStatus, //DCFault_Status
      							    SFVersion, //SF_Version
      							    FaultInfo, //Fault_Info
      							    StatusInfo, //Status_Info
      							    ModeInfo, //Mode_Info
      							    timestamp);

                      resource.update(newState);
                      if(this._highlightedDTO == this._getIDFromStr(dcd))
                    	  {
                    	  	this._detailResource.update(newState, this._highlightedDTO);
                    	  }
            }
            
        }
    });
});


