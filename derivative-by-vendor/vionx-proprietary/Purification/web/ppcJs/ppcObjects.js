


// *****  Process Pump helper functions.
function ppcProcPumps(instance_name)
{
	var _instance_name = instance_name;
	
	var NUM_ROWS = 5;
	
	this.cmd_speed = new Array(NUM_ROWS);
	this.cmd_offset = new Array(NUM_ROWS);
	for(ridx=0; ridx<NUM_ROWS; ridx++) {
		this.cmd_speed[ridx] = -1;
		this.cmd_offset[ridx] = -1
	}

	// Takes the original command button xml_stream.
	this.createRowSpeedCtrlItems = function (xml_stream, rnum)
	{
		var xml_str = xml_stream;
		
		xml_str = xmlExtractElement(xml_str);	// remove section-tag row_spd_cmd
		
		if(_tag != "row_spd_cmd")
			return "";
			
		xml_str = xmlExtractElement(xml_str);	// get zn speed
		this.cmd_speed[rnum-1] = parseFloat(_val);

		xml_str = xmlExtractElement(xml_str);	// get br offset
		this.cmd_offset[rnum-1] = parseFloat(_val);
			
		var max_speed = 70.0;
		var cgi_handler = "";
		
		xml_str = xmlExtractElement(xml_str);	// Command button.
		for(x=0; x<_num_attributes; x++) {
			if(_attr_type[x] == 'MAX_SPEED') 	max_speed = _attr_val[x];
			if(_attr_type[x] == 'cgi_handler') 	cgi_handler = _attr_val[x];
		}
					
		var table_str = ppumps.createRowSpeedCtrls(r, this.cmd_speed[rnum-1]
															, (this.cmd_speed[rnum-1] + this.cmd_offset[rnum-1])
															, 0, max_speed, cgi_handler);
		return table_str;
	}

	// Creates the Sp and Offset with button.
	this.createRowSpeedCtrls = function (rnum, znSpd, brSpd, minSpd, maxSpd, cgi)
	{
		if(typeof cgi  == 'undefined') cgi = "";
		
		var spd_button_id = "speedButton"+(rnum);

		var table_str = '';
		
		this.cmd_speed[rnum-1] = znSpd;
		var zn_in_id = "znSpd"+(rnum);
		table_str 	+= 'Zn spd: <input type="text" size="5" id="' + zn_in_id + '"'
					+ ' name="' + zn_in_id + '" value="' + this.cmd_speed[rnum-1].toFixed(1) + '"'
					+ ' onfocus="enableInputButton(\'' + spd_button_id + '\')" onBlur="enable_backspace=false"/><br />';

		this.cmd_offset[rnum-1] = brSpd - znSpd;
		var br_in_id = "brOffseet"+(rnum);
		table_str 	+= 'Br offset: <input type="text" size="5" id="' + br_in_id + '"'
					+ ' name="' + br_in_id + '" value="' + this.cmd_offset[rnum-1].toFixed(1) + '"'
					+ ' onfocus="enableInputButton(\'' + spd_button_id + '\')" onBlur="enable_backspace=false"/><br />';
			
		var button_func = buildRowSpdCmdBtn(rnum, spd_button_id, zn_in_id, br_in_id, maxSpd, cgi);
		table_str  += '&nbsp <input'
					+ ' type="button" id="' + spd_button_id + '" name="' + spd_button_id + '"'
					+ ' value="Set"'
					+ ' disabled="disabled"' //disabled
					+ ' onClick="' + button_func + '"'
					+ ' onDblClick="' + button_func + '"'
					+ ' />';	
					
		return table_str;
	}

	// Builds the command button.
	function buildRowSpdCmdBtn(rnum, button_id, zn_spd_input,br_offset_input, max_speed, cgi)
	{
		ajax_cmd_func = _instance_name + '.SendRowSpdCmd(\'' + button_id + '\'' ;	// Button Name
		ajax_cmd_func += 		',\'' + _tag + '\'';		// Command for CGI
		ajax_cmd_func += 		',\'' + rnum + '\'';		
		ajax_cmd_func += 		',\'' + zn_spd_input + '\'';	// Input field for return val.
		ajax_cmd_func += 		',\'' + br_offset_input + '\'';	// Input field for return val.
		ajax_cmd_func += 		',\'' + max_speed + '\'';	
		ajax_cmd_func += 		',\'' + cgi + '\'';	
		ajax_cmd_func += ');';
		
		return ajax_cmd_func;
	}

	// Handles the button press and sends the command.
	this.SendRowSpdCmd = function(button_id, cmd, row_num
									, zn_spd_input, br_offset_input, max_zn_speed
									, cgi_handler) 
	{
		document.getElementById(button_id).disabled = true;

		var speed = parseFloat(document.getElementById(zn_spd_input).value);
		var offset = parseFloat(document.getElementById(br_offset_input).value);
		
		var br_speed = speed+offset;
		
		if(speed > max_zn_speed)
		{
			alert('Zn speed cannot be greater then ' + max_zn_speed + '.');
		}
		else if(br_speed > max_zn_speed)
		{
			alert('Command results in Br speed of '+br_speed+'.  The speed cannot be greater then ' + max_zn_speed + '.');
		}
		else
		{
			if(cgi_handler != "") {
				//console.log("Creating a new ajaxQue.");
				sendAjax = new ppcAjaxQue(cgi_handler, createTables);
			}
			else
				sendAjax = ajaxCmd;

			this.cmd_speed[row_num-1] = speed;
			this.cmd_offset[row_num-1] = offset;
			
			sendAjax.sendCommand({COMMAND	: cmd
								, IDNUM		: GetUrlParameter("quad")
								, ROW_NUM	: row_num
								, ZN_SPD	: this.cmd_speed[row_num-1]
								, BR_OFFSET	: this.cmd_offset[row_num-1]
								});

			//createTheTables = true;
		}
	}
	
	
	
	// Functions for handling a single motor speed 
	this.createSpeedCtrlItem = function (xml_stream, rnum)
	{
		var xml_str = xml_stream;
		
		xml_str = xmlExtractElement(xml_str);	// remove section-tag row_spd_cmd
		
		if(_tag != "row_spd_cmd")
			return "";
			
		xml_str = xmlExtractElement(xml_str);	// get speed
		this.cmd_speed[rnum-1] = parseFloat(_val);

		var max_speed = 70.0;
		var cgi_handler = "";
		var pump_num = 0;
		
		xml_str = xmlExtractElement(xml_str);	// Command button.
		for(x=0; x<_num_attributes; x++) {
			if(_attr_type[x] == 'MAX_SPEED') 	max_speed = _attr_val[x];
			if(_attr_type[x] == 'cgi_handler') 	cgi_handler = _attr_val[x];
			if(_attr_type[x] == 'PUMP_NUM') 	pump_num = _attr_val[x];
		}
					
		var table_str = ppumps.createSpeedCtrls(rnum, pump_num, this.cmd_speed[rnum-1]
															, 0, max_speed, cgi_handler);
		return table_str;
	}

	// Creates the Sp and Offset with button.
	this.createSpeedCtrls = function (rnum, pnum, Spd, minSpd, maxSpd, cgi)
	{
		if(typeof cgi  == 'undefined') cgi = "";
		
		var spd_button_id = "speedButton"+(rnum);

		var table_str = '';
		
		this.cmd_speed[rnum-1] = Spd;
		var input_id = "Spd"+(rnum);
		table_str 	+= 'Speed: <input type="text" size="5" id="' + input_id + '"'
					+ ' name="' + input_id + '" value="' + this.cmd_speed[rnum-1].toFixed(1) + '"'
					+ ' onfocus="enableInputButton(\'' + spd_button_id + '\')" onBlur="enable_backspace=false"/><br />';
			
		var button_func = buildSpdCmdBtn(rnum, pnum, spd_button_id, input_id, maxSpd, cgi);
		table_str  += '&nbsp <input'
					+ ' type="button" id="' + spd_button_id + '" name="' + spd_button_id + '"'
					+ ' value="Set"'
					+ ' disabled="disabled"' //disabled
					+ ' onClick="' + button_func + '"'
					+ ' onDblClick="' + button_func + '"'
					+ ' />';	
					
		return table_str;
	}

	// Builds the command button.
	function buildSpdCmdBtn(rnum, pnum, button_id, spd_input, max_speed, cgi)
	{
		ajax_cmd_func = _instance_name + '.SendSpdCmd(\'' + button_id + '\'' ;	// Button Name
		ajax_cmd_func += 		',\'' + _tag + '\'';		// Command for CGI
		ajax_cmd_func += 		',\'' + rnum + '\'';		
		ajax_cmd_func += 		',\'' + pnum + '\'';		
		ajax_cmd_func += 		',\'' + spd_input + '\'';	// Input field for return val.
		ajax_cmd_func += 		',\'' + max_speed + '\'';	
		ajax_cmd_func += 		',\'' + cgi + '\'';	
		ajax_cmd_func += ');';
		
		return ajax_cmd_func;
	}

	// Handles the button press and sends the command.
	this.SendSpdCmd = function(button_id, cmd, row_num, pump_num
									, spd_input, max_speed
									, cgi_handler) 
	{
		document.getElementById(button_id).disabled = true;

		var speed = parseFloat(document.getElementById(spd_input).value);
		
		if(speed > max_speed)
		{
			alert('Zn speed cannot be greater then ' + max_speed + '.');
		}
		else
		{
			if(cgi_handler != "") {
				//console.log("Creating a new ajaxQue.");
				sendAjax = new ppcAjaxQue(cgi_handler, createTables);
			}
			else
				sendAjax = ajaxCmd;

			this.cmd_speed[row_num-1] = speed;
			
			sendAjax.sendCommand({COMMAND	: cmd
								, IDNUM		: GetUrlParameter("quad")
								, PUMP_NUM	: pump_num
								, VALUE	: this.cmd_speed[row_num-1]
								});

			//createTheTables = true;
		}
	}
	
}