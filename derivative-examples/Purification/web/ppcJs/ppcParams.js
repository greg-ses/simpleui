
// This JavaScript is used to display and update Parameter values.

// It assumes a very specific set of xml data and commands.


// TODO: gmgmgm: Add limit checking on float and int value entries!!!

var _MAX_NUM_PARAMS = 1000;

var _num_save_buttons = 0;

// This function creates a table of command buttons 
//	- xml_string 	- The stream to pull the data from
//	- cmd_tag		- The tag name for the commands section
//	- feedback_tag	- The tag name for the feedback/output section
//	- cb_ParamUpdateCmdBuilder	- A call back function used to build the parameter update command
//	- cb_ParamSaveCmdBuilder	- A call back function used to build the parameter update command
//  ** Expects 'Serialized_ParamData' and 'Active_ParamData' as xml tags.
function createParemeterEditTable(xml_string, display_level, cb_ParamUpdateCmdBuilder, cb_ParamSaveCmdBuilder)
{
	var error_shown = false;
	
	_num_save_buttons = 0;

	if(_xml_failed) return null;
	ret_str = "";
	style_str = "";	// TODO: Use this to grey out the outputs.
	
	var valid_file_read = 0;
	var valid_str = xmlFindTag(xml_string, "ValidFileRead", 1);
	if(""!=valid_str) {
		xmlExtractElement(valid_str);
		valid_file_read = _val; 
	}
	
	
	var saved_strs = xml_string;
	saved_strs = xmlFindTag(saved_strs, "Serialized_ParamData", 1);
	saved_strs = saved_strs.slice(saved_strs.indexOf("<", 1));	// Move to the beginning of a new tag.
	
	var active_strs = xml_string;
	active_strs = xmlFindTag(active_strs, "Active_ParamData", 1);
	if(""!=active_strs)
		active_strs = active_strs.slice(active_strs.indexOf("<", 1));	// Move to the beginning of a new tag.
	
	func_name = 'createOutputCmdsAndFeedackTable';
	
	end_str = "</Serialized_ParamData>";
	loops = _MAX_NUM_PARAMS;
	endOfTag = saved_strs.substring(saved_strs.indexOf("<"), saved_strs.indexOf(">")+1);

	cmd_column_width = 65;
	while(loops>0 
			&& end_str != endOfTag 
			//&& !isParentNode(saved_strs)  
			&& !_xml_failed)
	{
		if(saved_strs.charAt(1) == '/') {			// Remove end tag if found here.
			saved_strs = saved_strs.slice(saved_strs.indexOf(">"));				// Romove current end maker
			saved_strs = saved_strs.slice(saved_strs.indexOf("<"));				// Get to the next valid tag marker
		}
		if(active_strs.charAt(1) == '/') {			// Remove end tag if found here.
			active_strs = active_strs.slice(active_strs.indexOf(">"));				// Romove current end maker
			active_strs = active_strs.slice(active_strs.indexOf("<"));				// Get to the next valid tag marker
		}

		if(saved_strs.charAt(1) == '/') {			// If there is still an close tag, check to see if it is the end tag.
			endOfTag = saved_strs.substring(saved_strs.indexOf("<"), saved_strs.indexOf(">")+1);
			if(end_str == endOfTag)
				break;
		}
		
		if(isParentNode(saved_strs)) 
		{
			if (_MAX_NUM_PARAMS != loops) 	// End the table on all loops but the first.
				ret_str += "</table>";
			
			saved_strs = xmlExtractElement(saved_strs);		// Remove the parent node.

			if(""!=active_strs) 
				active_strs = xmlExtractElement(active_strs);	// Remove the parent node.

			//ret_str += '<h2><span>' + _tag + '</span></h2>';
			//ret_str += '<table border="1" align="center">';
			//ret_str += '<td></td> <th>Active</th> <th>Saved</th> <th>Update</th> <th>Save</th>';

			ret_str += '<br /><table border="1" align="center">';
			ret_str += '<tr><th><h2>' + _tag + '</h2></th> <th>Active</th> <th>Saved</th> <th>Update</th> <th>Save</th></tr>';
		}
		else if (_MAX_NUM_PARAMS == loops) 	// First loop.  Create header.
		{
			ret_str += '<br /><table border="1" align="center">';
			ret_str += '<td></td> <th>Active</th> <th>Saved</th> <th>Update</th> <th>Save</th>';
		}
		
		// Get the next cmd element
		saved_strs = xmlExtractElement(saved_strs);	// Extract element and move to next.
		
		// Don't display higher levels, but must increment and set loop pointers.
		if(_detail_lev > display_level) 
		{
			if(""!=active_strs) 
				active_strs = xmlExtractElement(active_strs);	// Extract feedback element
		
			endOfTag = saved_strs.substring(saved_strs.indexOf("<"), saved_strs.indexOf(">")+1);
			loops--;
			continue;
		}
		
		if("" == _data_type)	// No data for this block.  Skip it
		{
			if(""!=active_strs) 
				active_strs = xmlExtractElement(active_strs);	// Extract feedback element
		
			endOfTag = saved_strs.substring(saved_strs.indexOf("<"), saved_strs.indexOf(">")+1);
			loops--;
			continue;
		}
			

		// Build the button html
		row_name = _tag;
		disabled = '';
		button_name = 'cmd_' + loops;	// Create a unique button id.
		for(x=0; x<_num_attributes; x++) 
		{
			if(_attr_type[x] == 'disabled' && _attr_val[x] == 'true') {
				disabled = 'disabled="disabled"';
				style_str = 'style="color: #BABABA;"';
			}
		}
		
		// Create the first column, the row/parameter name.
		ret_str += '<tr><th align="right" width="350"><span title="'+_hint_text+'">' + row_name + '</span></th>';

		// Create the third column string, the saved data from the cmd values
		third_col_str = '<td>';
		if(valid_file_read==1)
			third_col_str += '<var id="'+_u_id+'" '+style_str+'>' + _val + '</var>';
		else
			third_col_str += '<var id="'+_u_id+'" '+style_str+'>---</var>';
		third_col_str += '</td>';
		
		saved_value = _val;  

		if(""!=active_strs) 
			active_strs = xmlExtractElement(active_strs);	// Extract feedback element

		button_str = "-----";
		save_button_str = "-----";

		if("bool" == _data_type) {
			// The following function uses the results from the previous xmlExtractElement!!
			ajax_cmd_func = cb_ParamUpdateCmdBuilder(button_name);
			
			btext = "Set";
			if('1'==_val)
				btext = "Reset";

			// Input type will need to be dependent on command type.
			button_str  = '<input'
						+ ' type="button" id="' + button_name + '" name="' + button_name + '"'
						+ ' value="' + btext + '"'
						+ ' ' + disabled
						+ ' onClick="' + ajax_cmd_func + '"'
						+ ' onDblClick="' + ajax_cmd_func + '"'
						+ ' />';	
		}
		else if ("int" == _data_type || "float" == _data_type) {
			input_name = button_name + '_text';
			// The following function uses the results from the previous xmlExtractElement!!
			ajax_cmd_func = cb_ParamUpdateCmdBuilder(button_name, input_name);
			
			button_str = '<input type="text" size="10" id="' + input_name + '" name = "' + input_name + '" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/>';
				
			// Create button
			button_str  += '&nbsp <input'
						+ ' type="button" id="' + button_name + '" name="' + button_name + '"'
						+ ' value="Set"'
						+ ' ' + disabled
						+ ' onClick="' + ajax_cmd_func + '"'
						+ ' onDblClick="' + ajax_cmd_func + '"'
						+ ' />';	
			cmd_column_width = 175;
		}
		else if ("string" == _data_type) {
			input_name = button_name + '_text';
			// The following function uses the results from the previous xmlExtractElement!!
			ajax_cmd_func = cb_ParamUpdateCmdBuilder(button_name, input_name);
			
			button_str = '<input type="text" size="20" id="' + input_name + '" name = "' + input_name + '" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/>';
				
			// Create button
			button_str  += '&nbsp <input'
						+ ' type="button" id="' + button_name + '" name="' + button_name + '"'
						+ ' value="Set"'
						+ ' ' + disabled
						+ ' onClick="' + ajax_cmd_func + '"'
						+ ' onDblClick="' + ajax_cmd_func + '"'
						+ ' />';	
			cmd_column_width = 215;
		}
		else {
			alert("Unrecognized command type = "+_data_type+"!!" + "  - _tag:"+_tag+", _val:"+_val+", _u_id:"+_u_id);
			return "";
		}
				
		// Create the second column (active data) from the feedback.
		if(""!=active_strs) {
			//active_strs = xmlExtractElement(active_strs);	// Extract feedback element
			if("" != active_strs)
			{
				ret_str += '<td>';
				ret_str += '<var id="'+_u_id+'" '+style_str+'>' + _val + '</var>';
				ret_str += '</td>';
				add_text_field_id(_u_id);
			}			

			// Verify that the commands and feedback streams are in sync.
			if(!error_shown && _tag != row_name) {
				alert('createOutputCmdsAndFeedackTable() : command('+row_name+') does not match output('+_tag+')');
				error_shown = true;
			}
			
			button_name = 'save_cmd_' + loops;	// Create a unique button id.
			ajax_cmd_func = cb_ParamSaveCmdBuilder(button_name);
			if(_val != saved_value && valid_file_read==1) 
			{
				_num_save_buttons++;
				
				save_button_str  = '<input'
									+ ' type="button" id="' + button_name + '" name="' + button_name + '"'
									+ ' value="Save"'
									+ ' ' + disabled
									+ ' onClick="' + ajax_cmd_func + '"'
									+ ' onDblClick="' + ajax_cmd_func + '"'
									+ ' />';	
			}
			
		}
		else
		{
			ret_str += '<td>----</td>';		// No feedback available
		}
		
		// Add the third column, Saved data set
		ret_str += third_col_str;
		
		// Add the update input column
		ret_str += '<td align="left" width="'+cmd_column_width+'">' + button_str + '</td>';
		
		// Add the save button column if the active is different from the saved value.
		ret_str += '<td align="center" width="'+30+'">' + save_button_str + '</td>';
		
		ret_str += '</tr>';
		
		endOfTag = saved_strs.substring(saved_strs.indexOf("<"), saved_strs.indexOf(">")+1);
		loops--;
	}	
	
	ret_str += "</table>";
	
	//alert('createOutputCmdsAndFeedackTable() : '+ ret_str);
		
	return ret_str;
}


function SaveAllParamsCmd()
{
	document.getElementById("save_all_button").disabled = true;

	createTheTables = true;
	
	idnum = GetUrlParameter("idnum");
	if("" == idnum)
		idnum = GetUrlParameter("quad");
	if("" == idnum)
		idnum = 0;

	var agree=confirm("Are you sure you wish save all the parameters?");
	if (agree) 
	{
		ajaxCmd.sendCommand({COMMAND	: "PARAM_SAVE_ALL"
							, IDNUM		: idnum
							, DETAILLEVEL : page_detail_level
							});
	}
	else
		document.getElementById("revert_all_to_def_button").disabled = false;
}


function RevertAllParamsToSaved()
{
	document.getElementById("revert_to_saved_button").disabled = true;

	createTheTables = true;

	idnum = GetUrlParameter("idnum");
	if("" == idnum)
		idnum = GetUrlParameter("quad");
	if("" == idnum)
		idnum = 0;

	var agree=confirm("Are you sure you wish revert all the parameters to their saved values?");
	if (agree) 
	{
		ajaxCmd.sendCommand({COMMAND	: "PARAM_REVERT_SAVED"
							, IDNUM		: idnum
							, DETAILLEVEL : page_detail_level
							});
	}
	else
		document.getElementById("revert_to_saved_button").disabled = false;
}


function RevertAllParamsToDef()
{
	document.getElementById("revert_all_to_def_button").disabled = true;

	createTheTables = true;

	idnum = GetUrlParameter("idnum");
	if("" == idnum)
		idnum = GetUrlParameter("quad");
	if("" == idnum)
		idnum = 0;

	var agree=confirm("Are you sure you wish revert all the parameters back to their defaults?");
	if (agree) 
	{
		ajaxCmd.sendCommand({COMMAND	: "PARAM_REVERT_DEF"
							, IDNUM		: idnum
							, DETAILLEVEL : page_detail_level
							});
	}
	else
		document.getElementById("revert_all_to_def_button").disabled = false;
}


function createGlobalParamCommandButtons()
{
	// Revert all to def button
	var ret_str = '&nbsp <input type="button" id="revert_all_to_def_button" name="revert_all_to_def_button"';
	ret_str += ' value="' + 'Revert All to Default' + '" onClick="RevertAllParamsToDef();" onDblClick="RevertAllParamsToDef(); " />';
	
	if(_num_save_buttons>0) 
	{
		// Revert all to saved button
		ret_str += '&nbsp <input type="button" id="revert_to_saved_button" name="revert_to_saved_button"';
		ret_str += ' value="' + 'Revert All to Saved' + '" onClick="RevertAllParamsToSaved();" onDblClick="RevertAllParamsToSaved(); " />';
	}
	
	if(_num_save_buttons>1) 
	{
		// Save all button
		ret_str += '&nbsp <input type="button" id="save_all_button" name="save_all_button"';
		ret_str += ' value="' + 'Save All' + '" onClick="SaveAllParamsCmd();" onDblClick="SaveAllParamsCmd(); " />';
	}
	
	return ret_str;
}

// Make sure the xml variables are set before calling this func!!!!
//	- button_id - The id text for the button which will be created.
//	- input_id	- The id text for the html input field.
function ajaxCmdBuilder_update_param(button_id, input_id)
{
	if(typeof input_id == 'undefined')
		input_id = '';
	
	idx = -1;
	for(x=0; x<_num_attributes; x++) 
	{
		if(_attr_type[x] == 'pidx') 
			idx = _attr_val[x];	
	}	

	ajax_cmd_func = 'SendParamUpdateIndexed(\'' + button_id + '\'' ;	// Button Name
	ajax_cmd_func += 		',\'' + idx + '\'';			// Index into parameter list
	ajax_cmd_func += 		',\'' + _data_type + '\'';		// Parameter type
	ajax_cmd_func += 		',\'' + input_id + '\'';	// Input field for return val.
	ajax_cmd_func += ');';
	
	return ajax_cmd_func;
}


function SendParamUpdateIndexed(button_id, pidx, ptype,  input_id) 
{
	document.getElementById(button_id).disabled = true;

	if(typeof input_id == 'undefined' || ''==input_id)
		val = '';
	else {
		val = document.getElementById(input_id).value
	}
	
	idnum = GetUrlParameter("idnum");
	if("" == idnum)
		idnum = GetUrlParameter("quad");
	if("" == idnum)
		idnum = 0;

	// Need to send the data as a string in order to 
	// preserve spaces and special chars.
	data_str = "COMMAND=PARAM_UPDATE"
				+ "&PIDX=" + pidx
				+ "&PTYPE=" + ptype
				+ "&VALUE=" + val
				+ "&IDNUM=" + idnum
				+ "&DETAILLEVEL=" + page_detail_level;
				
	ajaxCmd.sendCommand(data_str);

	createTheTables = true;
}

// Make sure the xml variables are set before calling this func!!!!
//	- button_id - The id text for the button which will be created.
function ajaxCmdBuilder_save_param(button_id, input_id)
{
	if(typeof input_id == 'undefined')
		input_id = '';
	
	idx = -1;
	for(x=0; x<_num_attributes; x++) 
	{
		if(_attr_type[x] == 'pidx') 
			idx = _attr_val[x];	
	}	

	ajax_cmd_func = 'SendSaveCGI(\'' + button_id + '\'' ;	// Button Name
	ajax_cmd_func += 		',\'' + idx + '\'';			// Index into parameter list
	ajax_cmd_func += 		',\'' + _data_type + '\'';		// Parameter type
	ajax_cmd_func += ');';
	
	return ajax_cmd_func;
}


function SendSaveCGI(button_id, pidx, ptype) 
{
	document.getElementById(button_id).disabled = true;

	idnum = GetUrlParameter("idnum");
	if("" == idnum)
		idnum = GetUrlParameter("quad");
	if("" == idnum)
		idnum = 0;

	ajaxCmd.sendCommand({COMMAND	: "PARAM_SAVE"
						, PIDX		: pidx
						, PTYPE		: ptype
						, IDNUM		: idnum
						, DETAILLEVEL : page_detail_level
						});

	createTheTables = true;
}



function SendParamUpdateString(pstr, ptype,  val) 
{
	idnum = GetUrlParameter("idnum");
	if("" == idnum)
		idnum = GetUrlParameter("quad");
	if("" == idnum)
		idnum = 0;

	// Need to send the data as a string in order to 
	// preserve spaces and special chars.
	data_str = "COMMAND=PARAM_UPDATE"
				+ "&PSTR=" + pstr
				+ "&PTYPE=" + ptype
				+ "&VALUE=" + val
				+ "&IDNUM=" + idnum
				+ "&DETAILLEVEL=" + page_detail_level;
				
	ajaxCmd.sendCommand(data_str);

	createTheTables = true;
}


function ParamGetFloatInputValue(form)
{
	var fval 		= parseFloat(form.float_val.value);
	var min 		= parseFloat(form.min.value);
	var max			= parseFloat(form.max.value);
	var pstr 		= form.pstr.value;
	var idnum 		= form.idnum.value;
	var cgi_handler	= form.cgi_handler.value;
	
	if(fval >= min && fval <= max)
	{
		_float_dialog.close();
		SendParamUpdateString(pstr, "float", fval);
		//alert("Will be sending "+cmd+" with value "+fval+" to "+cgi_handler+".");
	}
	else
		alert("Value not between "+min+" and "+max+".");
}


function ParamFloatInputDialog(param_str, idnum, cgi_handler, description, value, min, max)
{
	var msg = '<br/><table valign="middle" cellspacing="5" border="0" with="100%"><tr>';
	msg += '<td align="right">Enter value:</td>';
	msg += '<td align="left"><input name="float_val" style="width: 75px" value="'+value+'" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/></td>';
	msg += '</tr><tr><td> &nbsp </td>';
	msg += '</tr><tr>';
	msg += '<td colspan="2" align="center"><input type="button" value="Submit" onclick="ParamGetFloatInputValue(this.form)"/></td>';
	msg += '</tr></table>';
	msg += '<input type="hidden" name="pstr" value="'+param_str+'"/>';
	msg += '<input type="hidden" name="idnum" value="'+idnum+'"/>';					// Mostly used as quad.
	msg += '<input type="hidden" name="cgi_handler" value="'+cgi_handler+'"/>';
	msg += '<input type="hidden" name="min" value="'+min+'"/>';
	msg += '<input type="hidden" name="max" value="'+max+'"/>';

	_float_dialog = new DialogWindow(msg, {title: description
										, hideOkCancelButtons: true
										, top: 0
										, modal: 'parent'
										}
								);
	
	_float_dialog.el.style.width = '300px';
	//_hiddenMenu.beforeShow(function() { alert('beforeShow'); });
	//_hiddenMenu.show(function() { alert('showing'); });
	//_hiddenMenu.apply(function() { alert('applying: ' + _hiddenMenu.serialize(true)); });
	//_hiddenMenu.apply(menuUpdate);
	_float_dialog.show();
	
}

function BuildParamFloatPopupButton(label_text, param_str, idnum, cgi_handler, description, value, min, max, link)
{
	if(typeof link == 'undefined')	link = true;

	var ajax_cmd_func = 'ParamFloatInputDialog('
		+ '\''  + param_str + '\''				
		+ ',\'' + idnum + '\''		
		+ ',\'' + cgi_handler + '\''	
		+ ',\'' + description + '\''	// Description text
		+ ',\'' + value + '\''		// Current value
		+ ',\'' + min + '\''			// Min value
		+ ',\'' + max + '\''			// Max value
		+ ');';

	if(link) {
		ret_str = '<a class="ppcHw" '
			+ ' href="#top"' 
			+ ' value="' + value + '"'
			+ ' onClick="' + ajax_cmd_func + '"'
			+ ' onDblClick="' + ajax_cmd_func + '"'
			+ ' >' + label_text + '</a>';	
	}
	else {
		ret_str = '<input'
			+ ' type="button" id="' + button_id + '" name="' + button_id + '"'
			+ ' value="' + label_text + '"'
			+ ' onClick="' + ajax_cmd_func + '"'
			+ ' onDblClick="' + ajax_cmd_func + '"'
			+ ' ></input>';	
	}
	
return ret_str;

}