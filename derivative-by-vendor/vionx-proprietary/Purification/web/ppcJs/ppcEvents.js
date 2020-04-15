
// ppcEvents.js

// This module supports the common events database display.


function ppcEvents()
{

	this._begin = parseInt($.cookie("EVENTS-BEGIN_TIME")); //
	this._end = parseInt($.cookie("EVENTS-END_TIME")); //0;	
	
	if(isNaN(this._begin))	this._begin = -(300 * 60000); // Last 5hrs
	if(isNaN(this._end))	this._end = 0;

	this._firstRowId = -1;
	this._lastRowId = -1;
	
	
	this._real_time_mode = (0 != parseInt($.cookie("EVENTS-REAL_TIME_MODE")));

	if(GetUrlParameter("RealTime")==1)	// Linked pages will likely default to real-time.
		this._real_time_mode = true;
	
	this._live_updates = this._real_time_mode;

	if(this._real_time_mode) {
		val = parseInt($.cookie("EVENTS-RT_MINUTES"));
		if(isNaN(val)) val = 300;
		this._begin = -(val * 60000);
		this._end = 0;
		this._real_time_mode = true;
	}

	var _eList = new Array();

	var _displayOnly = GetUrlParameter("DisplayOnly");

	var _numResources=0;
	var _resourceList = new Array();

	this.resetData = function()
	{
		this._firstRowId = -1;
		this._lastRowId = -1;
		_eList = new Array();
	};
	
	this.addResource = function(rsc)
	{
		_resourceList[_numResources++] = rsc;
	};

	this.setTimeWindow = function()
	{
		var val = document.getElementById('in_time_range').value;
		
		this._end = 0;
		this._begin = -(val * 60000);
		this._real_time_mode = true;
		this._live_updates = true;
		
		$.cookie("EVENTS-RT_MINUTES", val);
		$.cookie("EVENTS-REAL_TIME_MODE", 1);
		

		reloadTheData();
	};

	this.setTimeRange = function ()
	{
		var bt = new Date(document.getElementById('begin_date').value 
							+ " " + document.getElementById('begin_time').value);
							
		var et = new Date(document.getElementById('end_date').value
							+ " " + document.getElementById('end_time').value);

		if(bt >= et) {
			alert("Invalid time range.  The begin time is after the end time.");
			return;
		}

		this._end = et.getTime();
		this._begin = bt.getTime();
		this._live_updates = false;
		this._real_time_mode = false;
		document.getElementById("rt_start_stop").value = "Start Updates";
		
		$.cookie("EVENTS-BEGIN_TIME", this._begin);
		$.cookie("EVENTS-END_TIME", this._end);
		$.cookie("EVENTS-REAL_TIME_MODE", 0);

		reloadTheData();
	};

	this.updateBeginDate = function(date) {
		var bd = new Date(document.getElementById('begin_date').value);
		var ed = new Date(document.getElementById('end_date').value);

		if(isNaN(ed))
			document.getElementById('end_date').value = (1+bd.getMonth()) + '/' + bd.getDate() + '/' + bd.getFullYear();
			
		else if(bd > ed)
			document.getElementById('end_date').value = (1+bd.getMonth()) + '/' + bd.getDate() + '/' + bd.getFullYear();
	};

	this.updateEndDate = function(date) {
		var bd = new Date(document.getElementById('begin_date').value);
		var ed = new Date(document.getElementById('end_date').value);

		if(isNaN(bd)) 
			document.getElementById('begin_date').value = (1+ed.getMonth()) + '/' + ed.getDate() + '/' + ed.getFullYear();
			
		else if(bd > ed)
			document.getElementById('begin_date').value = (1+ed.getMonth()) + '/' + ed.getDate() + '/' + ed.getFullYear();
	};

	this.fillInTheTimeDisplays = function()
	{
		var d = new Date();
		var bt = new Date(); bt.setTime(this._begin); 
		var et = new Date(); et.setTime(this._end); 
		
		if( bt.getFullYear()>2000 & et.getFullYear()>2000)	// If date seems valid, display it
		{
			hrs = (bt.getHours() < 10 ? ('0'+bt.getHours()) : bt.getHours());
			mns = (bt.getMinutes() < 10 ? ('0'+bt.getMinutes()) : bt.getMinutes());
			document.getElementById('begin_time').value = hrs + ':' + mns;
			
			hrs = (et.getHours() < 10 ? ('0'+et.getHours()) : et.getHours());
			mns = (et.getMinutes() < 10 ? ('0'+et.getMinutes()) : et.getMinutes());
			document.getElementById('end_time').value = hrs + ':' + mns;

			document.getElementById('begin_date').value = (1+bt.getMonth()) + '/' + bt.getDate() + '/' + bt.getFullYear();
			document.getElementById('end_date').value = (1+et.getMonth()) + '/' + et.getDate() + '/' + et.getFullYear();
		}
	};


	this.createControls = function()
	{
		var range = parseInt($.cookie("EVENTS-RT_MINUTES"));
		if(isNaN(range))
			range = (this._end - this._begin) / 60000; 	// Range in Minutes

		html_str = '<table border="1" width="165"><tr>';
		
			// Create the database selections options drop down menus.
			
			// Create the real time search input option
			html_str += '<td><table width="100%" border="0"><tr>';
				html_str +=  "<td>Minutes:</td></tr><tr><td>" ;
				html_str +=  createInputAndButton('in_time_range', range, 'butt_time_range', 'Set', 'eventView.setTimeWindow()', '', 5);
				html_str += '</tr><tr>';
				html_str += '<td align="center">';
				val_str = "Start Updates";
				if(this._live_updates && this._real_time_mode)
					val_str = "Stop Updates";
				html_str += 	'<input id="rt_start_stop" type="button" onClick="toggle_live_mode()" value="'+val_str+'"></input></td>';
			html_str += '</td></tr></table>';	

			html_str += '</td></tr><tr>';
			
			// Create the begin date/time
			html_str += '<td><table width="100%" border="0"><tr>';
				html_str += '<td>Start</td></tr><tr><td>&nbsp Date:<input size="12" type="text" id="begin_date"></td>';
				//html_str += '<img style="width: 22px; height: 20px;" src="images/clearpixel.gif" border="0" /></td>';
				html_str += '</tr><tr>';
				html_str += '<td>&nbsp Time:<input type="text" id="begin_time" size="8"> </td>';

				// Create the end date/time
				html_str += '</tr><tr>';

				html_str += '<td>End</td></tr><tr><td>&nbsp Date:<input  size="12"type="text" id="end_date"></td>';
				//html_str += '<img style="width: 22px; height: 20px;" src="images/clearpixel.gif" border="0" /></td>';
				html_str += '</tr><tr>';
				html_str += '<td>&nbsp Time:<input type="text" id="end_time" size="8"> </td>';

				// Create the query button
				html_str += '</tr><tr><td align="center">';
				html_str += '<input type="button" id="set_time_range_button" value="Query Time Range" onClick="eventView.setTimeRange();"></td>' ;
			html_str += '</tr></table></td>';

			if(_numResources>=1 || _displayOnly!="")	
			{
				html_str += '</td></tr><tr>';
				html_str += '<td><table width="100%" border="0">';
				if(_displayOnly=="")
				{
					for(x=0; x<_numResources; x++)	
					{
						//checked = "";
						//if(_displayOnly==_resourceList[x])
						//	checked = 'checked="checked"';
						checked = 'checked="checked"';
						html_str += '<tr><td><input id="resource_'+_resourceList[x]+'" type="checkbox" '+checked+' onchange="eventView.displayList()">'+_resourceList[x]+'</input></tr></td>';
					}
					html_str += '<tr><td align="center"><input type="button" id="query_single_resource_only_button" value="Display Only" onClick="eventView.displayOnly();"></td>' ;
				}
				else
				{
					checked = 'checked="checked"';
					html_str += '<tr><td><input id="resource_'+_displayOnly+'" type="checkbox" '+checked+' disabled="true" onchange="eventView.displayList()">'+_displayOnly+'</input></tr></td>';

					html_str += '<tr><td align="center"><input type="button" id="query_single_resource_only_button" value="Display All" onClick="eventView.displayAll();"></td>' ;
				}
				
				html_str += '</table>';	
			}
			
		html_str += '</td></tr></table>';

		document.getElementById("time_control").innerHTML = html_str;


		// Setup the date/time search entry fields.
		$('#begin_time').timeEntry({spinnerImage: 'img/spinnerDefault.png', show24Hours: true}); //, defaultTime: bt});
		$('#end_time').timeEntry({spinnerImage: 'img/spinnerDefault.png', show24Hours: true}); //, defaultTime: et});

		$('#begin_date').datepick({onSelect: eventView.updateBeginDate});
		$('#end_date').datepick({onSelect: eventView.updateEndDate});

		this.fillInTheTimeDisplays();
	};


	this.extractList = function(xml_stream)
	{
		var resp_str = xml_stream;

		resp_str = xmlFindTag(resp_str, "EventLog", 1);
		if("" == resp_str) return 0;
		resp_str = xmlExtractElement(resp_str);		// Remove the section tag.
		
		resp_str = xmlFindTag(resp_str, "headers", 1);
		if("" == resp_str) return 0;
		resp_str = xmlExtractElement(resp_str);		// Remove the header tag.

		resp_str = xmlExtractElement(resp_str);		// Get the first row tag.

		var system_utc = new Date();
		while(_tag=="r")
		{
			row_txt = _val;

			row_id = parseInt(row_txt.slice(0, row_txt.indexOf("|")));				//rowid
			row_txt = row_txt.slice(row_txt.indexOf("|")+1);

			if(this._lastRowId > 0 && row_id<this._lastRowId+1)
				alert("Row id mismatch");
			
			time_int = row_txt.slice(0, row_txt.indexOf("|"));						//timestamp
			row_txt = row_txt.slice(row_txt.indexOf("|")+1);
			
			system_utc.setTime(time_int);

			//_eList[row_id] = new Array();
			item = new Array();
			item['row_id'] = row_id;
			item['timestamp'] = (system_utc.getMonth()+1) + "/" 
										 + system_utc.getDate() + "/" 
										 + system_utc.getFullYear() + " " 
										 + system_utc.toLocaleTimeString()	;
			
			item['resource'] = row_txt.slice(0, row_txt.indexOf("|"));	//resource
			row_txt = row_txt.slice(row_txt.indexOf("|")+1);
			
			var x=0;
			for(; x<_numResources; x++) {
				if(_resourceList[x] == item['resource'])
					break;
			}
			if(x==_numResources)
				_resourceList[_numResources++] = item['resource'];

			item['type'] = row_txt.slice(0, row_txt.indexOf("|"));		//type
			row_txt = row_txt.slice(row_txt.indexOf("|")+1);
			
			item['msg'] = row_txt; 										//msg
			row_txt = row_txt.slice(row_txt.indexOf("|")+1);
		
			if(this._firstRowId < 0) this._firstRowId = row_id;
			
			_eList.push(item);

			this._lastRowId = row_id;
			resp_str = xmlExtractElement(resp_str);
		}
		
	};

	this.displayOnly = function()
	{
		var resource_idx = -1;
		for(x=0; resource_idx==-1 && x<_numResources; x++)	
		{
			var show	= $("#resource_"+_resourceList[x])	.attr("checked");
			if(show)
				resource_idx = x;
		}
		if(resource_idx==-1)
		{
			alert("A resource must be checked.");
			return;
		}
		for(x; x<_numResources; x++)	
		{
			var show	= $("#resource_"+_resourceList[x])	.attr("checked");
			if(show)
			{
				alert("Only one resource can be checked.");
				return;
			}
		}		
		// Reopen page with the DisplayOnly set to the text of resource_idx
		window.location = "EventList.html?DisplayOnly=" + _resourceList[resource_idx];
	};

	this.displayAll = function()
	{
		; // Reopen the page with no DisplayOnly link
		window.location = "EventList.html";
	};
	
	this.displayList = function()
	{

//		table_str = '<table cellspacing="0" border="2"  align="center" valign="top">';
		table_str = '<table  id="EventLog" class="display">';
		table_str += '<thead> <tr>';

//		table_str += '<th width="45" align="left">id</th>';
//		table_str += '<th width="175" align="left">TimeStamp</th>';
//		table_str += '<th width="80" align="left">Resource</th>';
//		table_str += '<th width="150" align="left">Type</th>';
//		table_str += '<th width="550" align="left">Event</th>';

		table_str += '<th align="left">id</th>';
		table_str += '<th align="left">TimeStamp</th>';
		table_str += '<th align="left">Resource</th>';
		table_str += '<th align="left">Type</th>';
		table_str += '<th align="left">Event</th>';
		table_str += '</thead> </tr>';
		table_str += '<tbody>';

		if(_eList.length>0)
		{
			rid = _eList[_eList.length-1]['row_id'];
			for(r=_eList.length-1; r>=0 ; r--)
			{
				var show= $("#resource_"+_eList[r]['resource'])	.attr("checked");
							
				if(show) {
					table_str += '</tr><tr>';
					table_str += '<td>' + _eList[r]['row_id'] + '</td>';
					table_str += '<td>' + _eList[r]['timestamp'] + '</td>';
					table_str += '<td>' + _eList[r]['resource'] + '</td>';
					table_str += '<td>' + _eList[r]['type'] + '</td>';
					table_str += '<td>' + _eList[r]['msg'] + '</td>';
				}
			}
		}
		
		table_str += '</tr></tbody>';
		table_str += '</table>';

		document.getElementById('list_table').innerHTML=table_str;
		
		tableOptions = {
							"sPaginationType": "full_numbers"
							, "aaSorting" : [[0, 'desc']]
							, "iDisplayLength": 20
							, "bLengthChange": false
							, "sDom": 'pfitiT'
						};
						
		if(true == this._real_time_mode && true == this._live_updates ) 	// Limit interface control.
			tableOptions["sDom"] = 'iti';

		$('#EventLog').dataTable(tableOptions);	
		
	};


}