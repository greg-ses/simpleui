
// These functions support a strictly formated XML stream.

// Rules
// - Handles upto 8 attributes.
// - Looks specifcially for the display attribute when creating tables.
// 	- Use this attribute to detrming what to actually put in the table.
// It specifically supports attribute markers for:
//		- _detail_lev	:	A display level to control which points get displayed.
//		- _u_id			:	An xml ID tag used to update values after the html is created
//		- _hint_text	:	Added as a pop-up hint for the user

var _MAX_NUM_ATTRIBS = 8;

var _MAX_NUM_LOOPS = 100;
	
var _xml_failed = false;	// Indicates a xml parse failure.  All functions exit.
var _tag = ""; 				// The last parsed tag
var _val = ""; 				// The last parsed value
var _tag_name = "";			// The tag with all underscores (_) replaced by spaces.
var _detail_lev = 0; 		// The display value set by the attribute display="x"
var _u_id = "";
var _hint_text = "";
var _data_type = "";

var _num_attributes = 0;
var _attr_str = new Array(_MAX_NUM_ATTRIBS);
var _attr_type = new Array(_MAX_NUM_ATTRIBS);
var _attr_val = new Array(_MAX_NUM_ATTRIBS);

for(a=0; a<_MAX_NUM_ATTRIBS; a++)	// Clear the atributes.
{
	_attr_str[a] = "";
	_attr_type[a] = "";
	_attr_val[a] = "";
}

function xmlAlert(alert_str) 
{
	_xml_failed = true;
	msg_str = alert_str + " -- " + Date();
	alert(alert_str);
}

var _single_alert = 0;

// This function will find the next valid start tag marker
// It will set the variablse  _tag, _val, and upto 6 _attributes 
// In addition it supports for the attribute markers for:
//		- _detail_lev, _u_id, _hint_text, & _data_type
// -> It returns a str pointed to the next xml < marker.
// -> It ruturns NULL on failure
function xmlExtractElement(xml_str)
{
	if(_xml_failed || xml_str == null) return null;
	
	str = xml_str;
	
	_tag = ""; 
	_tag_name = "";
	_val = ""; 
	_num_attributes = 0;
	_detail_lev = 0;
	_u_id = "";
	_hint_text = "";
	_data_type = "";
	
	if(str.charAt(0) != "<")
		str = str.substr(str.indexOf("<"));

	var loops = 20;
	while(loops>0 && str.charAt(1) == '/') {			// Walk through any end tags
		str = str.slice(str.indexOf(">"));				// Romove current end maker
		str = str.slice(str.indexOf("<"));				// Get to the next valid tag marker
		loops--;
	}
		
	// See if there is attribute data and parse it.
	if(str.indexOf(" ") <  str.indexOf(">")) 
	{
		_tag = str.substring(str.indexOf("<")+1, str.indexOf(" "));
		_tag_name = _tag.replace(/_/g, " ");
		text = str.slice(str.indexOf(" "));

		while(text.indexOf(" ") == 0 && _num_attributes < _MAX_NUM_ATTRIBS && text.indexOf('="', 1) <  text.indexOf(">"))
		{
			_attr_str[_num_attributes] = ""; 
			_attr_type[_num_attributes] = ""; 
			_attr_val[_num_attributes] = "";
			attribute_string = "";
			
			// Find the end of the attribute by looking for the end quote.
			end_attr_idx = text.indexOf('="', 1) + 2;
			end_attr_idx = text.indexOf('"', end_attr_idx) + 1;
			attribute_string = text.substring(1, end_attr_idx);
			
			_attr_str[_num_attributes]	= attribute_string;
			_attr_type[_num_attributes]	= attribute_string.substring(0, text.indexOf("=")-1);
			_attr_val[_num_attributes]	= attribute_string.substring(text.indexOf('=')+1, attribute_string.length-1);
				
			if(_attr_type[_num_attributes] == "detail")
				_detail_lev = _attr_val[_num_attributes];

			if(_attr_type[_num_attributes] == 'u_id') 
				_u_id = _attr_val[_num_attributes];		// Name for the row, sync validation also.

			if(_attr_type[_num_attributes] == 'HINT' || _attr_type[_num_attributes] == 'desc') 
				_hint_text = _attr_val[_num_attributes];				// Possible hint text used for mouse hover info.
			
			if(_attr_type[_num_attributes] == 'TYPE' || _attr_type[_num_attributes] == 'METATYPE' ) 
				_data_type = _attr_val[_num_attributes];
				
			text = text.slice( end_attr_idx );
			//text = text.slice( Math.min( text.indexOf(" ", 1), text.indexOf(">") ) );
			
			_num_attributes++;
		}
	}
	else 
	{
		_tag = str.substring(str.indexOf("<")+1, str.indexOf(">"));
		_attr_str = "";
	}

	if(_tag != "")
	{
		str = str.slice(str.indexOf(">")+1);
		_val = str.substring(0, str.indexOf("<"));	

		str = str.slice(str.indexOf("<"));	// Move to next tag marker.
			
		if(str.charAt(1) == '/') {			// Remove end tag, if there are no sub nodes.
			str = str.slice(str.indexOf(">"));
			str = str.slice(str.indexOf("<"));
		}

		return str;
	}
	else
	{
		//xmlAlert("xmlExtractElement(" + str.substr(0, 50) + ") - Failed");
		return null;
	}
}

// Return a str which points to the instance of the requested tag
// Returns empty string if tag is not found.
function xmlFindTag(xml_string, tag, instance) 
{
	if(_xml_failed) return null;
	
	var str = xml_string;
	found = true;

	for(i=0; found && i<instance; i++)
	{
		// Try a complete tag.
		beg_str = "<" + tag + ">";
		found = (str.indexOf(beg_str) >= 0);
		
		if(!found) // Try a tag with attribute data.
		{
			beg_str = "<" + tag + " ";
			found = (str.indexOf(beg_str) >= 0);
		}

		if(found) {
			str = str.slice(str.indexOf(beg_str)); 
			
			if(i<instance-1)	
				str = str.slice(beg_str.length);	// Move past tag for next search.
		}
	}
	if(!found)
	{
		//xmlAlert("xmlFindTag(" + xml_string.substr(0, 45) + "... , " 
		//			+ tag + ", " + instance + ") - Failed, i:" + i + ", str:" + str.substr(3, 35));
		return "";
	}
	else
		return str;
}

// Input an xml string pointing to the beginning of an element.
// This function will return true if the element is actually a parent node.
function isParentNode(xml_string)
{
	if(_xml_failed) return null;
	
	str = xml_string;
	
	if(str.charAt(1)=="/")	// We are pointing at an end tag.
		return false;
	
	str = str.slice(str.indexOf(">"));	// Move past tag.
	
		// If the next tag is a closing tag, it is simply an element
	if(str.charAt(str.indexOf("<")+1) == "/")	
		return false;
	else
		return true;
}

var _num_fields = 0;
var _text_ids = new Array();

var _num_button_ids = 0;
var _button_ids = new Array();

function clear_text_fields()
{
	_num_fields = 0;
	_text_ids = new Array();

	_num_button_ids = 0;
	_button_ids = new Array();
}

function add_text_field_id(text_id)
{
	if(text_id=='')
		return;
	
	_text_ids[_num_fields] = text_id;
	_num_fields++;
}


function update_text_fields(xml_string)
{
	for(idx=0; idx<_num_fields; idx++)
	{
		str = xml_string.slice(xml_string.indexOf(_text_ids[idx])); 
		
		if(str != "")
		{
			b = str.indexOf(">")+1;
			e = str.indexOf("<");
			
			var nval = str.substring(b, e);
			if(b > e) {
				// TODO: gmgmgm This error should be logged to the server.
				//xmlAlert('Uid read error for element "' + _text_ids[idx] + '" result string ' + nval);
				return;
			}
				
			var element = document.getElementById(_text_ids[idx]);
			
			if(element != null)
			{
				
				element.innerHTML = nval;

				//alert("setting " + _text_ids[idx] + " from " +element.innerHTML+ " to " + nval);
			}
			//else
			//	xmlAlert("Could not find element for " + _text_ids[idx]);

			//xmlAlert("4 - stopping loop after 1 iteration for debug purposes.");
		}
		//else 
		//	xmlAlert("Could not find " + _text_ids[idx]);
	}
}

function add_button_field_id(button_id)
{
	if(button_id=='')
		return;
	
	_button_ids[_num_button_ids] = button_id;
	_num_button_ids++;
}


function update_button_fields(xml_string)
{
	for(idx=0; idx<_num_button_ids; idx++)
	{
		str = xml_string.slice(xml_string.indexOf(_button_ids[idx])); 
		
		if(str != "")
		{
			b = str.indexOf(">")+1;
			e = str.indexOf("<");
			
			var nval = str.substring(b, e);
			if(b > e) {
				// TODO: gmgmgm This error should be logged to the server.
				//xmlAlert('Uid read error for element "' + _button_ids[idx] + '" result string ' + nval);
				return;
			}
				
			var element = document.getElementById(_button_ids[idx]);
			
			if(element != null)
			{
				if(element.innerHTML != nval)
					element.innerHTML = nval;

				//alert("setting " + _button_ids[idx] + " from " +element.innerHTML+ " to " + nval);
			}
			//else
			//	xmlAlert("Could not find element for " + _button_ids[idx]);

			//xmlAlert("4 - stopping loop after 1 iteration for debug purposes.");
		}
		//else 
		//	xmlAlert("Could not find " + _button_ids[idx]);
	}
}

function update_time_display(element_id, xml_string)
{
	// Pull the UTC time from the timestamp and display it in the element
	var tstr = xmlFindTag(xml_string, "TimeStamp", 1);
	tstr = xmlExtractElement(tstr);
	
	htmlElement = document.getElementById(element_id);
	if(_tag == "TimeStamp" && htmlElement!=null)
	{
		var system_utc = new Date();
		system_utc.setTime(_val);
		//document.getElementById(element_id).innerHTML= system_utc.toLocaleString();
		document.getElementById(element_id).innerHTML= system_utc.toDateString()
														+ ", " + system_utc.toLocaleTimeString();
	}
}


// Creates a table of all the children of specified instance of tag.
// The table creation stops at the end of tag or if it encounters a parent node.
// Parameters:	- display_level : defines the max level to display found in the 
//				                  attribute value display
//				- style_str 	: used to pass in a style 
//				- dynamic_table : Set this variable if the table will be fully re-painted.
//				                  It is defaulted to false.
//				- table_title	: Used as the title for the table, allows caller to pass a link title.
//								  It is defaulted to "" which will pull the title from the xml stream.
//				- table_width	: The width value for the table.
function xmlTagTable(xml_string, tag, instance, display_level, style_str, dynamic_table, table_title, table_width) 
{
	if(_xml_failed) return null;
	
	if(typeof dynamic_table == 'undefined')	dynamic_table = false;
	if(typeof table_title == 'undefined')	table_title = '';
	if(typeof table_width == 'undefined')	table_width='100%';
		
	var str = xml_string;
	end_str = "</" + tag + ">";
	
	str = xmlFindTag(str, tag, instance);
	if(str == "")
	{
		xmlAlert("xmlTagTable(" + xml_string.substr(0,45) + "..., " + tag + ", " + instance + ") - xmlFindTag returned failure");
		return "";
	}
	
	titled = '';				// Used to indicate the creation of a title as well as part of the unique id

	str = str.slice(str.indexOf("<", 1));	// Move to the beginning of the new tag.
	
	loops = _MAX_NUM_LOOPS;
	tbltxt = '<table border="1" align="center" width="' + table_width + '">';
	endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
	while(loops>0 
			&& end_str != endOfTag 
			&& !isParentNode(str)  
			&& !_xml_failed)
	{
		str = xmlExtractElement(str);	// Extract element and move to next.
				
		if(_detail_lev <= display_level)
		{
			if(titled=='' && _tag=="Title")
			{
				if(_val!="none" || table_title!='') 
				{
					tbltxt += '<tr><th colspan="2" align="center">';
					if(table_title == '')	tbltxt += _val;
					else					tbltxt += table_title;
					tbltxt += '</th></tr>';
				}
				titled = tag+instance;
			}
			else
			{
				if(table_title=='none')
					titled = tag;
				else 
				if(titled=='') {	// Title with the search tag value.
					tbltxt += '<tr><th colspan="2" align="center">';
					if(table_title == '')	tbltxt += tag;
					else					tbltxt += table_title;
					tbltxt += '</th></tr>';
					titled = tag+instance;
				}
				
				if(_tag=="STATUS_TEXT") {
					tbltxt += '<tr><td colspan="2" align="right">';
					tbltxt += '<var id="'+_u_id+'" '+style_str+'>' + _val + '</var>';
					tbltxt += '</td></tr>';
				}
				else {
					tbltxt += '<tr><th align="right"><span title="'+_hint_text+'">' + _tag_name + '</span></th>';

					tbltxt += '<td>';
					tbltxt += '<var id="'+_u_id+'" '+style_str+'>' + _val + '</var>';
					tbltxt += '</td></tr>';
					
					// Add the field id to list to be updated, unless it is a dynamically created table.
					if(!dynamic_table)
						add_text_field_id(_u_id);
				}
			}
			
		}
		
		endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
		loops--;
	}
	
	tbltxt += '</table>';
	return tbltxt;
}


// This function creates a grid table where the first column is the array of tags 
// Then each of the next columns is the value for each instance of the specified tag 
// within this branch of xml stream
//		- xml_string 	- Should be pointing to the begning of a valid xml structure
//		- tag			- A string defining the tag to create a table for.
//		- display_level	- A interger value compared against the meta tag display used for filtering
//		- style_str		- A style for the output text.
//		- title_cb		- Optional parameter.  Called to create title headers if passed in.
//							- Must take in a index value starting at 0 as the defined column
//		- num_instances	- Stops creating columns after the num_instances has been displayed.
//		- table_width	- The overall table width.
function xmlTagArrayTable(xml_string, tag, display_level, style_str, title_cb, num_instances, table_width)
{
	if(_xml_failed) return null;
	
	var str = xml_string;
	titled = false;
	end_str = "</" + tag + ">";

	str = xmlFindTag(str, tag, 1);	// Find the first instance of the tag
	if(str == "")
		return null;

	str = str.slice(str.indexOf("<", 1));	// Move to the beginning of the next tag.

	titled = '';				// Used to indicate the creation of a title as well as part of the unique id
		
	// Detirmine the number of columns and column titles from the xml stream.
	var column_title = new Array();
	count_str = str;
	
	if(typeof table_width == 'undefined')	table_width='100%';
	
	if(typeof num_instances == 'undefined')	{
		num_instances = 0;

		do {
			// Create a title string for the column
			column_title[num_instances] = tag + ' ' + num_instances;
			xmlExtractElement(count_str);	// Look for a Title tag.
			if(_tag=="Title") {
				column_title[num_instances] = _val;		// Get the xml defined title.
			}
			if(typeof title_cb != 'undefined'
				&& title_cb != null)			{
				column_title[num_instances] = title_cb(num_instances);	// Use the call back function for title
			}
			num_instances++;
			
			// Attempt to move to the next instance of tag.
			count_str = count_str.slice(count_str.indexOf(end_str) + end_str.length);	// Move to end of first tag.
			count_str = xmlExtractElement(count_str);
		}
		while(_tag == tag); // If the extracted element is the desired tag loop again.	
	}
	else {
		for(i=0; i<num_instances; i++) {
			if(typeof title_cb != 'undefined')	{
				column_title[i] = title_cb(i);	// Use the call back function for title
			}
		}
	}
	
	loops = _MAX_NUM_LOOPS;
	tbltxt = '<table border="1" align="center" width="' + table_width + '">';
	endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
	str = xmlExtractElement(str);	// Extract element and move to next.
	
	// For each of the elements within the first instance of tag
	while(loops>0 
			&& end_str != endOfTag 
			&& !_xml_failed)
	{
		// If this is a subtree, title it, and move to the first sub item
		if(isParentNode(str))
		{
			//alert("Caught parent node :" + str.substr(0, 35));
			str = xmlExtractElement(str);	// Extract parent element and move to next.
			title_name = _tag;
			str = xmlExtractElement(str);	// Extract the next (first?, title?) element.
			if(_tag=="Title") {
				str = xmlExtractElement(str);	// Extract title element val and move to next.
				title_name = _val;				// Get the defined title.
			}
			if(titled!='')	// If there are previous rows, add a row visual effect.
				tbltxt += '<tr></tr>';
			tbltxt += '<tr><td></td>';
			tbltxt += '<th colspan="' +num_instances+ '" align="center">' + title_name + '</th></tr>';
			titled = '';
		}
		else
			str = xmlExtractElement(str);	// Extract element and move to next.
		
		if(_detail_lev <= display_level	&& _tag!="Title")
		{
			if(titled=='')	// Add column headers.
			{
				tbltxt += '<tr><td></td>';
				for(inst=0; inst<num_instances && !_xml_failed; inst++)	{
					tbltxt += '<th align="center">' + column_title[inst] + '</th>';
				}
				tbltxt += '</tr>';
				titled = tag;
			}

			tstr = str;						// Used to traverse the instances
			tbltxt += '<tr><th align="right">' + _tag + '</th>';
			for(inst=0; inst<num_instances && !_xml_failed; inst++)
			{
				tbltxt += '<td><var id="'+_u_id+'" '+style_str+'>' + _val + '</var></td>';
				add_text_field_id(_u_id);

				tstr = xmlFindTag(tstr, _tag, 1);		// Find next intance of current element _tag
				if("" != tstr) {
					tstr = xmlExtractElement(tstr);	
				}
			}
			tbltxt += '</tr>';			
		}
		
		// Move past end nodes of sub trees.
		endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
		if(endOfTag.charAt(1) == '/' && end_str != endOfTag)
		{
			//alert("Caught end tag :" + str.substr(0, 35));
			str = str.substr(str.indexOf(">")); 			// remove < character.
			str = str.substr(str.indexOf("<")); 

			// Read the new potential end string.
			endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
		}

		loops--;
	}
	
	tbltxt += '</table>';
	return tbltxt;
}


// Creates a list of command buttons based on the xml_string and the final tag.
// Call this function with the xml_string pointing to the parent element for the list.
//  - Supports the attributes "idnum"{arbitrary int} and "disabled"{true, false}
//	attribute usage.
//  - The _tag is the command sent to the CGI app.
//	- The _val is what is displayed on the button.
//	- section	=string, creates column of section tables. 
//				="" creates row of buttons
function createCgiButtons(xml_string, tag, disable_commands, enable_sections, num_buttons_in_row, ExtraParm, ExtraParmVal, callback_fn)
{
	if(_xml_failed) return null;
	ret_str = "";

	if(typeof enable_sections == 'undefined')	enable_sections = true;
	if(typeof num_buttons_in_row == 'undefined')	num_buttons_in_row = 0;

	var sep = "";	
	var str = xml_string;
	end_str = "</" + tag + ">";
	
	str = xmlFindTag(str, tag, 1);
	if(str == "")
	{
		//xmlAlert("createCgiButtons(" + xml_string.substr(0,45) + "..., " + tag + ", " + disable_commands + ") - xmlFindTag returned failure");
		return "";
	}
	
	str = str.slice(str.indexOf("<", 1));	// Move to the beginning of a new tag.
	loops = _MAX_NUM_LOOPS;
	endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
	
	var section_tag = "";
	cgi_section_tag = "";	// Global variable declared in ppcHtmlBag.
	var row_button_cnt = 0;

    var inputDesc = new Array();

	while(loops>0 
			&& end_str != endOfTag 
			&& !isParentNode(str)  
			&& !_xml_failed)
	{
		str = xmlExtractElement(str);	// Extract element and move to next.
		
	    //Fill input box field description array if present
	    for (x = 0; x < _num_attributes; x++) {
	        if (_attr_type[x] == 'INPUTDESC1' || _attr_type[x] == 'INPUTDESC2') {
	            inputDesc.push(_attr_val[x]);
	        }
	    }

	    // Handle an externally defined URL parameter with dynamic values in the xml stream.
		if(typeof ExtraParmVal != 'undefined' && ExtraParmVal == 'find_the_parameter_values')
		{
			for(x=0; x<_num_attributes; x++) 
			{
				if(_attr_type[x] == ExtraParm) 		ExtraParmVal = _attr_val[x];
			}
			cmd_button_str = buildCgiCommandButton(ExtraParm, ExtraParmVal, callback_fn, inputDesc);
			ExtraParmVal = 'find_the_parameter_values';	// Make sure we look for each command.
		}
		else
			cmd_button_str = buildCgiCommandButton(ExtraParm, ExtraParmVal, callback_fn, inputDesc);
			
		if(enable_sections && section_tag != cgi_section_tag)	// If section tag exhists. create a table with each sections buttons in the cell
		{
			if(section_tag == "") 
				ret_str += '<table cellspacing="10" border="0" align="left" width="100%"><tr><td valign="top">';
			else 
				ret_str += '</td></tr></table></td></tr><tr><td>';
			
			section_tag = cgi_section_tag;
			
			ret_str += ' <table border="1" width="100%"><tr><th valign="top" align="center">' + section_tag;
			
			sep = '</td></tr><tr><td align="center">';
		}
		
		if(num_buttons_in_row>0 && row_button_cnt>=num_buttons_in_row)
		{
			//sep = '<p style="text-align:left">'; //'<p />';
			sep = '<br /><br />';
			row_button_cnt = 0; 
		}
		
		ret_str += sep + cmd_button_str;
		
		row_button_cnt++;
		
		if(sep=="" || sep=='<br /><br />') sep = ' &nbsp';	// If no sections exhist simply put a space between the buttons.
		
		endOfTag = str.substring(str.indexOf("<"), str.indexOf(">")+1);
		loops--;
	}	
	
	if(section_tag != "")
		ret_str += '</td></tr></table></td></tr></table>';
		
	return ret_str;
}


// This function creates a table of command buttons 
//	- xml_string 	- The stream to pull the data from
//	- cmd_tag		- The tag name for the commands section
//	- feedback_tag	- The tag name for the feedback/output section
//	- cb_ajaxCmdBuilder	- A call back function used to build the command
function createOutputCmdsAndFeedackTable(xml_string, cmd_tag, feedback_tag, cb_ajaxCmdBuilder, strTitle, strBuilderCGICmd )
{
	error_shown = false;
	
	if(_xml_failed) return null;
	ret_str = "";
	var style_str = "";	// Use this to grey out the outputs.
	
	var cmdstrs = xml_string;
	cmdstrs = xmlFindTag(cmdstrs, cmd_tag, 1);
	cmdstrs = cmdstrs.slice(cmdstrs.indexOf("<", 1));	// Move to the beginning of a new tag.
	
	var outstrs = xml_string;
	outstrs = xmlFindTag(outstrs, feedback_tag, 1);
	outstrs = outstrs.slice(outstrs.indexOf("<", 1));	// Move to the beginning of a new tag.
	
	end_str = "</" + cmd_tag + ">";
	loops = _MAX_NUM_LOOPS;
	endOfTag = cmdstrs.substring(cmdstrs.indexOf("<"), cmdstrs.indexOf(">")+1);

	ret_str += '<table border="1" align="center">';
	//ret_str += '<tr><th>Command</th>';
	if( strTitle == null )
	{
		ret_str += '<th colspan="3">Outputs</th></tr>';
	}
	else
	{
		ret_str += '<th colspan="3">' + strTitle + '</th></tr>';	
	}
	
	cmd_column_width = 65;
	while(loops>0 
			&& end_str != endOfTag 
			&& !isParentNode(cmdstrs)  
			&& !_xml_failed)
	{
		// Get the next cmd element
		cmdstrs = xmlExtractElement(cmdstrs);	// Extract element and move to next.

		if(_detail_lev > 4) 	// Don't display, but we need to move the xml markers forward.
		{
			outstrs = xmlExtractElement(outstrs);	// Extract feedback element
			endOfTag = cmdstrs.substring(cmdstrs.indexOf("<"), cmdstrs.indexOf(">")+1);
			loops--;
			continue;	// Move on to next element.
		}
		
		// Build the button html
		row_name = _tag;
		disabled = '';
		button_name =  _u_id; // 'cmd_' + loops;	// Create a unique button id.
		for(x=0; x<_num_attributes; x++) 
		{
			if(disable_commands || (_attr_type[x] == 'disabled' && _attr_val[x] == 'true') ) {
				disabled = 'disabled="disabled"';
				//style_str = 'style="color: #BABABA;"';
			}
		}
		
		if("bool" == _data_type) {
			// The following function uses the results from the previous xmlExtractElement!!
			if(strBuilderCGICmd == null)
			{
				ajax_cmd_func = cb_ajaxCmdBuilder(button_name);
			}
			else
			{
				ajax_cmd_func = cb_ajaxCmdBuilder(button_name, strBuilderCGICmd );			
			}
			// Input type will need to be dependent on command type.
			button_str  = '<input'
						+ ' type="button" id="' + button_name + '" name="' + button_name + '"'
						+ ' value="' + _val + '"'
						+ ' ' + disabled
						+ ' onClick="' + ajax_cmd_func + '"'
						+ ' onDblClick="' + ajax_cmd_func + '"'
						+ ' />';	
			
			add_button_field_id(button_name);
		}
		else if ("int" == _data_type || "float" == _data_type || "float2" == _data_type) {
		
			input_name = button_name + '_text';
			// The following function uses the results from the previous xmlExtractElement!!
			if( strBuilderCGICmd == null )
			{
				ajax_cmd_func = cb_ajaxCmdBuilder(button_name, input_name);
			}
			else
			{
				ajax_cmd_func = cb_ajaxCmdBuilder(button_name, strBuilderCGICmd);
			}
			
			button_str = createInputAndButton(input_name, "", button_name, _val, ajax_cmd_func, disabled, 10);
	
			cmd_column_width = 145;
			add_button_field_id(button_name);
		}
		else if ("none" == _data_type) {
			button_str = "-----";
		}
		else {
			//console.log("createOutputCmdsAndFeedackTable : Unrecognized command type = %s!!", _data_type);
			//console.log("  - _tag:%s, _val:%s, _u_id:", _tag, _val, _u_id);
			return "";
		}
		
		// Create the first column
		ret_str += '<tr>';
		ret_str += '<th align="right"><span title="'+_hint_text+'">' + row_name + '</span></th>';
		
		// Create the second column from the feedback.
		outstrs = xmlExtractElement(outstrs);	// Extract feedback element

		//ret_str += '<td id="'+_u_id+'" align="center" '+style_str+'>' + _val + '</td>';
		ret_str += '<td>';
		ret_str += '<var id="'+_u_id+'" '+style_str+'>' + _val + '</var>';
		ret_str += '</td>';
		add_text_field_id(_u_id);
		
		// Add the button column
		ret_str += '<td align="left" width="'+cmd_column_width+'">' + button_str + '</td>';
		ret_str += '</tr>';
		
		// Verify that the commands and feedback streams are in sync.
		if(!error_shown && _tag != row_name) {
			alert('createOutputCmdsAndFeedackTable() : command('+row_name+') does not match output('+_tag+')');
			error_shown = true;
		}

		endOfTag = cmdstrs.substring(cmdstrs.indexOf("<"), cmdstrs.indexOf(">")+1);
		loops--;
	}	
	
	ret_str += "</table>";
	
	//alert('createOutputCmdsAndFeedackTable() : '+ ret_str);
		
	return ret_str;
}


