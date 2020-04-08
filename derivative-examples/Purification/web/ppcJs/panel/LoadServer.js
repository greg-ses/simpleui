// ~/panel/LoadServer
// DC Panel - template configured list of AO, DI, DO signals
// AI controls not implemented (see 'AI' comments for extension points)

// Pub/sub list:
// [pub] ppcJs.PubSub.timeUpdate
// [pub] ppcJs.PubSub.commTimeout
// [pub] ppcJs.PubSub.commFault

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dojo/query', 'dojo/on', 'dojo/topic', 'dojo/mouse',
		'dijit/_Container', 'dijit/registry',
		'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'dijit/form/Button', 'dijit/form/NumberTextBox', 'dojox/layout/TableContainer',
		'dojox/collections/Dictionary', '../utilities/Compatibility', '../utilities/DataFormat', '../PubSub', '../control/LoadServerData',
		'../control/LoadServerDetail', './_WatchdogPanel', '../mixin/_QueueClient', '../control/loadServerData/dsdDto', './loadServer/dsDto', 'dojo/text!./loadServer/template/loadServer.html', 'dojox/xml/parser'],
	function (declare, lang, array, dom, construct, domClass, domStyle, query, on, topic, mouse,
		_Container, registry,
		BorderContainer, ContentPane, Button, NumberTextBox, TableContainer,
		Dictionary, Compatibility, DataFormat, PubSub, LoadServerData,
		LoadServerDetail, _WatchdogPanel, _QueueClient, dsdDto, dsDto, template, parser) {
	return declare([_WatchdogPanel, _QueueClient, _Container], {
		// consts
		_naNPlaceHolder : '-',
		_floatPrecision : 2,
		_DCDCId : 0,
		// ajax request command constants
		_getTemplateCmd : {
			GET : 'DCSERVER_TEMPLATE'
		},
		_getDataCmd : {
			GET : 'DCSERVER_DATA'
		},
		_setDataCmd : {
			SET : 'DCSERVER_COMMAND'
		},
		_serviceOfflineCmd : {
			SET : 'LOAD_ACTIVE'
		},
		_serviceOnlineCmd : {
			SET : 'LOAD_ACTIVE'
		},
		_serviceSetup1Cmd : {
			SET : 'DC_SETUP1_VALS'
		},
		_serviceSetup2Cmd : {
			SET : 'DC_SETUP2_VALS'
		},
		_serviceDefaultSetup1 : {
			SET : 'DC_DEFSETUP1'
		},
		_serviceDefaultSetup2 : {
			SET : 'DC_DEFSETUP2'
		},
        _serviceModeSelectCmd : {
            SET : 'LOAD_MODE'
        },
		_serviceStaticICmd : {
			SET : 'LOAD_STATIC_I'
		},
        _serviceStaticPowerCmd : {
            SET : 'LOAD_STATIC_PWR'
        },
		_serviceVoltSetCmd : {
			SET : 'LOAD_STATIC_V'
		},
		_serviceVoltLimitICmd : {
			SET : 'LOAD_VOLT_LIM_I'
		},
		_serviceConstRSetCmd : {
			SET : 'LOAD_STATIC_R'
		},
		_serviceClearSetCmd : {
			SET : 'DC_CLEAR'
		},

		// ajax request interval (ms)
		_refreshInterval : 2000,
		_refreshIntervalId : '',

		// ajax response tags
		_timeStampTag : 'timeStamp',
		_rootTemplateTag : 'DCServerTemplate',
		_rootDataTag : 'DCServerData',
		_rootDetailTag : 'DCServerData',
		_rootDCDCTag : 'DCLoad',
		//_DCsTag: 'DCDCs',
		_idAttrib : 'id',
		_DCTag : 'DCLoad',

		_itemTag : 'item',

		_idLoadCurrent : 'Load_Current',
		_idLoadVoltage : 'Load_Voltage',
		_idLoadPower : 'Load_Power',
		_idLoadResist : 'Load_Resist',
		_idAmpHours : 'Amp_Hours',
		_idOVPSetpoint : 'OVP_Setpoint',
		_idDCOutSense : 'DC_OutSense',
		_idDCStatus : 'Status',
		_idDCFaultStatus : 'Fault_Status',
		_idSFVersion : 'SF_Version',
		_idFaultInfo : 'Fault_Info',
		_idStatusInfo : 'Status_Info',
		_idModeInfo : 'Mode_Info',
		_legendTag : 'Legend',
		_timeTag : 'timestamp',
		_itemTypeAttrib : 'type',
		_writeAttrib : 'write',

		// css classes
		_cssControlRow : 'ioControlRow',

		// class variables
		_resourceIdMap : '', // 2-way dictionary: key/value = resource's 'id' attribute, value/key = dijit id
		_loadDataTable : '', //Hold dojox table for loadServerData DTO
		_loadDetailTable : '', //Hold dojox table for detail loadServerData
		// resource names
		_dataResource : 'dcdc/data',
		_templateResource : 'dcdc/template',
		_dataSetup1 : 'dcdc/setup/setup1',
		_dataSetup2 : 'dcdc/setup/setup2',

		//array of dto objects
		_dtoList : '',
		_detailResource : '',
		_highlightedDTO : 1,
		// dijit variablesSetOVP
		name : 'LoadServer Panel',
		widgetsInTemplate : true,
		templateString : template,
		baseClass : 'loadServerPanel',

		// public methods

		// lifecycle methods
		constructor : function () {
			this.inherited(arguments);
			this._resourceIdMap = new Dictionary();
			this._refreshInterval = 2000;
			this._queueDelayMs = 2000;
			this._restResources = [{
					name : this._dataResource,
					testFile : '../../ppcJs/tests/DCServerDataResponse.json'
				}, {
					name : this._dataSetup1,
					testFile : '../../ppcJs/tests/DCServerSetup1Response.json'
				}, {
					name : this._dataSetup2,
					testFile : '../../ppcJs/tests/DCServerSetup1Response.json'
				}, {
					name : this._templateResource,
					testFile : '../../ppcJs/tests/DCServerTemplateResponse.json'
				}
			];
		},

		postCreate : function () {
			this.inherited(arguments);
			_dtoList = new Array();
		},

		startup : function () {
			this.inherited(arguments);
			this.borderContainer.resize();

			/*
			if(this._loadDataTable === ''){
			this._loadDataTable = new TableContainer({cols:3, spacing:0}, "_loadDataTable");
			this._loadDetailTable = new TableContainer({cols:2, spacing:0, customClass:"loadDetailData"}, "_loadDetailTable");
			} */
		},

		load : function (baseUrl, /*optional*/
			resourceId) {

			this._queryId = resourceId;
			this.inherited(arguments);
			if (!this._loadDataTable) {
				this._loadDataTable = new TableContainer({
						cols : 3,
						"labelWidth" : "100",
					}, dojo.byId("_loadDataTable"));
				this._fetchTemplate();

				this._loadDetailTable = new TableContainer({
						cols : 2,
						spacing : 0,
						customClass : "loadDetailData"
					}, "_loadDetailTable");
			} else {
				// Enable this to begin requesting data
				this._initiateDataRequests();

			}

			this.startup();
		},

		unload : function () {
			this.inherited(arguments);
			if (this._refreshIntervalId) {
				clearInterval(this._refreshIntervalId);
				this._refreshIntervalId = '';
			}

			//this.centerPane.destroyDescendants();

			/*
			if(this._loadDataTable)
		{
			var children = this._loadDataTable.getChildren();
			array.forEach(children, function (child) {
			this._loadDataTable.removeChild(child);
			}, this);

			this._loadDataTable.destroyRecursive();
			}
			if(this._loadDetailTable) {
			this._loadDetailTable.destroyRecursive();
			}
			//this._loadDetailTable.destroyDescendants(); }

			this._loadDataTable = null;
			this._loadDetailTable = null;
			 */
			//delete loadDetailData;
			//delete _loadDataTable;


			//this._resourceIdMap.clear();
		},

		// private methods

		//Assemble a DCDC DTO from incoming data
		_addResourceCell : function (/*XmlElement*/
			DCElement, /*bool*/
			bShowLabels) {
			//Create the DTO item and place it on the page
			var name = this.puS.getElementText('name', DCElement);
			var dto = new dsdDto.Ctor(name, 2000, bShowLabels);
			var resource = new LoadServerData(dto);
			_dtoList.push(dto);
			// add 2-way dictionary entry so can select by either resourceId or serverId
			//This is a DOM id from the created DTO
			var resourceId = resource.get('id');
			//This would be 'DCDC1' for example
			var serverId = Compatibility.attr(DCElement, 'id');
			this._resourceIdMap.add(serverId, resourceId);
			this._resourceIdMap.add(resourceId, serverId);

			//console.log("_addResourceCell [" +Boolean(bShowLabels)+ " : "+dto.showLabels+"] : " + dto.name + " : " + resourceId + " : " + serverId);

			this._loadDataTable.addChild(resource);
			//Add event handler which is called when this resource is clicked on
			var boundFunction = dojo.hitch(this, this._setHighlightedDTO);
			on(resource.controlName, "click", boundFunction);
			on(resource.controlName, mouse.enter, function (evt) {
				domStyle.set(resource.controlName, "color", "red");
			});
			on(resource.controlName, mouse.leave, function (evt) {
				domStyle.set(resource.controlName, "color", "black");
			});

		},

		_setHighlightedDTO : function (event) {
			//Set the DTO id number or name or both
			var id = event.target.innerHTML;
			this._highlightedDTO = this._getIDFromStr(id);
			//dom.byId(this.detailData1).innerHTML = this._highlightedDTO;
		},

		_handleDefaultSetup1 : function () {
			this._handleServiceButton(this._serviceDefaultSetup1);

		},

		_handleDefaultSetup2 : function () {
			this._handleServiceButton(this._serviceDefaultSetup2);

		},

		_handleIDNum : function (/*Event Info*/
			keyEvent) {

			//If the source event is a key press check for a return key
			if (keyEvent.keyCode && keyEvent.keyCode != 13) {
				return;
			}

			this._DCDCId = this.txtDCDCID.get("value");

		},

		_handleServiceOffline : function () {

			var offlineValue = {
				VALUE : "0"
			};
			var DevNumber = {
				DCDCNum : this._DCDCid
			};
			//Create a DC command with the appropriate command tag
			this._handleServiceButton(this._serviceOfflineCmd, offlineValue, DevNumber);
		},

		_handleSetup1 : function () {

			//Push a command with all setup 1 params
			var setup1Params = {
				MAX_BUSV : this.txtMaxBusV.get("value")
			};
			lang.mixin(setup1Params, {
				MIN_BUSV : this.txtMinBusV.get("value")
			});
			lang.mixin(setup1Params, {
				BUSV_SENSE_OFFSET : this.txtBusVSenseOffset.get("value")
			});
			lang.mixin(setup1Params, {
				DC_BUS_TARGET : this.txtDCBusTarget.get("value")
			});

			var serverId = this._queryId;
			var commandObject = {
				id : "DC_SETUP1"
			};
			var idObject = {
				ID : serverId
			};
			var queryObject = idObject;

			var DCDCNumber = {
				DCDCNUM : this._DCDCId
			};

			//var optionsObj = { VALUE : "0" };
			//lang.mixin(queryObject, commandObject);
			//lang.mixin(setup1Params, moreOpts );
			lang.mixin(setup1Params, DCDCNumber);
			var store = this._getStore(this._dataSetup1);
			store.put(setup1Params, commandObject);

			//console.log('serverId=' + serverId);

			//this._handleServiceButton(this._serviceSetup1Cmd, setup1Params);
		},

		_handleSetup2 : function () {

			//Push a command with all setup 1 params
			var setup2Params = {
				BATT_I_CHARGE_LIM : this.txtBattIChargeLimit.get("value")
			};
			lang.mixin(setup2Params, {
				BATT_I_DISCHARGE_LIM : this.txtBattIDischargeLimit.get("value")
			});
			lang.mixin(setup2Params, {
				BATT_V_MAX : this.txtBattVChargeLimit.get("value")
			});
			lang.mixin(setup2Params, {
				BATT_V_SENS_OFFSET : this.txtBattVSensorOffset.get("value")
			});
			lang.mixin(setup2Params, {
				BATT_V_TARGET : this.txtBattVTarget.get("value")
			});

			var serverId = this._queryId;
			var commandObject = {
				id : "DC_SETUP2"
			};
			var idObject = {
				ID : serverId
			};
			var queryObject = idObject;

			var DCDCNumber = {
				DCDCNUM : this._DCDCId
			};

			lang.mixin(setup2Params, DCDCNumber);
			var store = this._getStore(this._dataSetup2);
			store.put(setup2Params, commandObject);

			//console.log('serverId=' + serverId);

		},

		_handleServiceOnline : function () {

			var onlineValue = {
				VALUE : "1"
			};
			var DCDCNumber = {
				DCDCNum : this._DCDCid
			};
			//Create a DC command with the appropriate command tag
			this._handleServiceButton(this._serviceOnlineCmd, onlineValue, DCDCNumber);

		},

        _handleModeSelect : function (/*Event Info*/
                                   keyEvent) {

            if (event.type == "keyup" && event.keyCode != dojo.keys.ENTER)
                return;

            //Read the charge value
            var value = this.txtModeSelect.get("value");

            var valueTag = {
                VALUE : value
            };

            var DevNumber = {
                DCLoad : 0
            };

            this._handleServiceButton(this._serviceModeSelectCmd, valueTag, DevNumber);
        },

		_handleStaticI : function (/*Event Info*/
			keyEvent) {

			if (event.type == "keyup" && event.keyCode != dojo.keys.ENTER)
				return;

			//Read the charge value
			var value = this.txtStaticI.get("value"); 

			var valueTag = {
				VALUE : value
			};
			
            var DevNumber = {
				DCLoad : 0
			};
      
			this._handleServiceButton(this._serviceStaticICmd, valueTag, DevNumber);
		},

		_handlePower : function (/*Event Info*/
			keyEvent) {

			if (event.type == "keyup" && event.keyCode != dojo.keys.ENTER)
				return;

			//Read the charge value
			var devValue = this.txtPower.get("value");

			var tagValue = {
				VALUE : devValue
			};
			var DCDCNumber = {
				DCLoad : 0
			};
			this._handleServiceButton(this._serviceStaticPowerCmd, tagValue, DCDCNumber);
		},

		_handleSetVoltage : function (event) {

			if (event.type == "keyup" && event.keyCode != dojo.keys.ENTER)
				return;
			//Read the voltage set value
			var valVSet = this.txtVSet.get("value");

			var VSetValue = {
				VALUE : valVSet
			};
			var DCDCNumber = {
				DCLoad : 0
			};
			this._handleServiceButton(this._serviceVoltSetCmd, VSetValue, DCDCNumber);

		},

		_handleVoltLimitI : function () {

			if (event.type == "keyup" && event.keyCode != dojo.keys.ENTER)
				return;

			//Read the voltage set value
			var valISet = this.txtVoltLimI.get("value");

			var ISetValue = {
				VALUE : valISet
			};
			var DCDCNumber = {
				DCLoad : 0
			};
			this._handleServiceButton(this._serviceVoltLimitICmd, ISetValue, DCDCNumber);
		},

		_handleSetConstR : function () {
			if (event.type == "keyup" && event.keyCode != dojo.keys.ENTER)
				return;

			var valConstRSet = this.txtConstR.get("value");

			var ConstRSetValue = {
				VALUE : valConstRSet
			};
			var DCDCNumber = {
				DCLoad : 0
			};
			this._handleServiceButton(this._serviceConstRSetCmd, ConstRSetValue, DCDCNumber);

		},

		_handleClear : function () {
			this._handleServiceButton(this._serviceClearSetCmd);
		},

		_handleZeroAH : function () {

			//Create a DC command with the appropriate command tag
			this._handleServiceButton(this._serviceOfflineCmd);
		},

		_handleServiceButton : function (/*command string*/
			dcCmd, /*optional param*/
			dcOpt1,
			/*optional param*/
			dcOpt2) {
			// Do something:
			//dom.byId(this.btnResult).innerHTML += "Button Pressed.";

			//10.0.4.170:5015/cgi-bin/cgicmd?COMMAND=DC_OFFLINE&IDNUM=&DETAILLEVEL=1&INCID=1&VALUE=&DCDC=0&ACAC=0&INCDETAILVAL=1&SYSDETAILS=1&QUADSTATUS=1&CGI=pbcmd&tstamp=1340199830473

			var serverId = this._queryId;
			var commandObject = dcCmd;
			var idObject = {
				ID : serverId
			};
			var queryObject = idObject;
			//dojo.xhrGet(this._assembleXhrArgs(queryObject));
			/*
			var controlPoint = this._resourceIdMap.item(slider.get('id'));
			var newVal = slider.get('value');
			var valueObj = { VALUE: newVal };
			var optionsObj = { id: controlPoint };
			var store = this._getStore(this._dataResource);
			lang.mixin(queryObject, commandObject);
			 */
			lang.mixin(queryObject, commandObject);
			if (dcOpt1) {
				lang.mixin(queryObject, dcOpt1);
			}

			if (dcOpt2) {
				lang.mixin(queryObject, dcOpt2);
			}

			//var controlObject = { CTRL_POINT: controlPoint, VALUE: newVal };
			//var idObject = { ID: serverId };
			//var queryObj = idObject;
			//var setObject = this._setDataCmd;
			//lang.mixin(queryObj, setObject);
			//lang.mixin(queryObj, controlObject);
			//THis is a place holder in case more DCDCs are supported
			var DCNum = {
				DCLoad : 1
			};
			lang.mixin(queryObject, DCNum);
			this.xhrGet(queryObject);

			//dojo.xhrGet(this._assembleXhrArgs(queryObject));
			//dojo.xhrGet(queryObject);
			//store.put(optionsObj, dcCmd);

			console.log('serverId=' + serverId);
		},

		// private methods
		_fetchTemplate : function () {
			//var store = this._getStore(this._templateResource);
			//store.query().then(lang.hitch(this, this.onFetchTemplate));
			var testUrl = '../../ppcJs/tests/DCServerTemplateResponse.xml';
			var queryObj = {
				ID : this._queryId
			};
			lang.mixin(queryObj, this._getTemplateCmd);
			this._initStore(testUrl, queryObj, this._rootTemplateTag, this.onFetchTemplate);
		},

		_initiateDataRequests : function () {
			var testUrl = '../../ppcJs/tests/DCServerDataResponse.xml';
			var queryObj = {
				ID : this._queryId
			};
			lang.mixin(queryObj, this._getDataCmd);
			this._initStore(testUrl, queryObj, this._rootDataTag, this.onFetchData);
			if (!this._refreshIntervalId) {
				this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchData), this._refreshInterval);
			}
		},

		_refetchData : function () {
			this._xmlStore.close();
			var request = this._xmlStore.fetch({
					onComplete : lang.hitch(this, this.onFetchData)
				});

		},

		_createLegendItems : function (/*XmlElement[]*/
			elements) {
			for (var i = 0; i < elements.length; i++) {
				var item = new dsDto.ConfigLegend(elements[i]);
				/*var LegendItem = this._addLegendItem(item, this.leftPane.domNode);

				var LegendItemId = Compatibility.attr(elements[i], this._idAttrib);
				this._addToolTip(LegendItemId, item.desc);*/
			}
		},

		_createDCItems : function (/*Objects*/
			elements) {

			console.log("G1DCserver.js::_createDCItems() ");
			console.log(elements);

			//Create new row every n DC-DCs
			var elementsPerRow = this._loadDataTable.cols;
			var bFirstColumn = false;
			var i = 0;

			//for (var item_name in elements) {
			for (var i = 0; i < elements.length; i++) {
				//console.log(i + ":" + elements[item_name].name + " : " + elements[item_name].desc);

				if ((i % elementsPerRow) == 0)
					bFirstColumn = true;
				else
					bFirstColumn = false;

				console.log("FC:" + bFirstColumn + ":" + i + ":" + elements[i].id);

				this._addResourceCell(elements[i], bFirstColumn);
			}

			if (i > 0) {
				//Create detailed data object, default set to first dto
				//var child = _loadDataTable.children[0];
				//var detailResource = new LoadServerDetail(_loadDataTable.children[0]);
				this._detailResource = new LoadServerDetail(_dtoList[0]);
				this._loadDetailTable.addChild(this._detailResource);
				//var resourceId = resource.get('id');
				//var serverId = dto.name;
				//this._resourceIdMap.add(serverId, resourceId);
				//this._resourceIdMap.add(resourceId, serverId);
			}

			//Start the dojox table
			this._loadDataTable.startup();
			this._loadDataTable.layout();

			this._loadDetailTable.startup();
			this._loadDetailTable.layout();
		},

		// returns reference to Legend display item
		_addLegendItem : function (/*panel.loadServer.dsDto.Config*/
			item, parentNode) {
			var row = this.puB.createRow();
			var labelCell = this.puB.createCell(item.name);
			domClass.add(labelCell, [this.puB._cssIndicatorLabel, this._cssControlRow]);
			construct.place(labelCell, row);

			construct.place(row, parentNode);

			return labelCell;
		},

		_addDCItem : function (/*loadServer/dsDto.Config*/
			item, parentNode) {
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
		_getElementTextFromId : function (elementName, idValue, parentElement) {
			var idSelect = this.puS.getCssAttribSelector('id', idValue);
			var itemSelect = elementName + idSelect;

			var nodeList = query("[id=" + idValue + "]", parentElement);
			var elementText;
			if (nodeList.length <= 0) {
				elementText = "-";
			} else {
				elementText = parser.textContent(nodeList[0]);
			}
			return elementText;
		},

		_updateItem : function (/*loadServer/dsDto.Data*/
			dto) {
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
		_getIDFromStr : function (strID) {
			var idVal = strID.substring(6);

			return (idVal);
		},

		// callbacks

		onFetchTemplate : function (/*jsonobject[]*/
			items, request) {
			this.inherited(arguments);

			console.log("G1LoadServer.js : onFetchTemplate() starting.");
			console.log(items);
			var rootElem = items[0]['element'];

			//Load the Legend information
			/*
			var LegendSelect = this._legendTag;
			var ItemSelect = this._itemTag;
			var LegendItems = query(ItemSelect, rootElem.children.Legend);
			this._createLegendItems(LegendItems); */

			//var dcdcs = items[this._rootTemplateTag][this._DCsTag];
			//console.log(dcdcs);
			//Load the DC-DC template information
			var DCSelect = this._DCTag;
			var DCItems = query(DCSelect, rootElem);
			this._createDCItems(DCItems);
			//this._createDCItems(dcdcs); //[this._rootTemplateTag][this._DCsTag]);

			console.log("G1LoadServer.js : onFetchTemplate() initiation data request.");

			// Enable this to begin requesting data
			this._initiateDataRequests();

			console.log("G1LoadServer.js : onFetchTemplate() end.");
		},

		onFetchData : function (/*XmlItem[]*/
			items, request) {
			this.inherited(arguments);
			var rootElem = items[0]['element'];

			//Get the DCDC elements
			query(this._rootDCDCTag, rootElem).forEach(function (dcDcItem) {
				// get dijit by 'id' XML attribute
				//This is the ID name coming from the server, like DCDC1
				var serverId = Compatibility.attr(dcDcItem, 'id');
				//This is the DOM ID, used to locate the resource on the page
				var dijitId = this._resourceIdMap.item(serverId);
				//This gets the resource planted on the page
				var resource = registry.byId(dijitId);
				var LoadCurrent = this._getElementTextFromId(this._itemTag, this._idLoadCurrent, dcDcItem);
				var LoadVoltage = this._getElementTextFromId(this._itemTag, this._idLoadVoltage, dcDcItem);
				var LoadPower = this._getElementTextFromId(this._itemTag, this._idLoadPower, dcDcItem);
				var LoadResist = this._getElementTextFromId(this._itemTag, this._idLoadResist, dcDcItem);
				var AmpHours = this._getElementTextFromId(this._itemTag, this._idAmpHours, dcDcItem);
				var OVPSetpoint = this._getElementTextFromId(this._itemTag, this._idOVPSetpoint, dcDcItem);
				var OutSense = this._getElementTextFromId(this._itemTag, this._idDCOutSense, dcDcItem);
				var DCStatus = this._getElementTextFromId(this._itemTag, this._idDCStatus, dcDcItem);
				var DCFaultStatus = this._getElementTextFromId(this._itemTag, this._idDCFaultStatus, dcDcItem);
				var SFVersion = this._getElementTextFromId(this._itemTag, this._idSFVersion, dcDcItem);
				var FaultInfo = this._getElementTextFromId(this._itemTag, this._idFaultInfo, dcDcItem);
				var StatusInfo = this._getElementTextFromId(this._itemTag, this._idStatusInfo, dcDcItem);
				var ModeInfo = this._getElementTextFromId(this._itemTag, this._idModeInfo, dcDcItem);

				var timestamp = parseInt(this.puS.getElementText(this._timeTag, rootElem));
				topic.publish(PubSub.timeUpdate, timestamp, this.name);

				//console.log("ts:" + timestamp + "; " + dcd + " : " + " BC: " + BattCurrent + " BV:" + BattVoltage + " AH:" + AmpHours);

				//This is the DOM ID, used to locate the resource on the page
				//var dijitId = this._resourceIdMap.item(dcd);
				//This gets the resource planted on the page
				//var resource = registry.byId(dijitId);

				var newState = new dsdDto.Status(
						LoadCurrent, //Load_Current
						LoadVoltage, //Load_Voltage
						LoadPower, //Load_Power
						LoadResist, //Load_Resist
						AmpHours, //Amp_Hours
						OVPSetpoint, //OVP_Setpoint
						OutSense, //DC_OutSense
						DCStatus, //DCStatus
						DCFaultStatus, //DCFault_Status
						SFVersion, //SF_Version
						FaultInfo, //Fault_Info
						StatusInfo, //Status_Info
						ModeInfo, //Mode_Info
						timestamp);

				resource.update(newState);
				if (this._highlightedDTO == this._getIDFromStr(dcDcItem.id)) {
					this._detailResource.update(newState, this._highlightedDTO);
				}
			}, this);

		}
	});
});
