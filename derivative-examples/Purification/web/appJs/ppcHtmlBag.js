// This file is a bag of HTML help functions

// This function retries a name/value pair from the pages URL
function GetUrlParameter( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function MkLocalTime( utc_time )
{
	// Get client side time, use for timezone correction.
	d = new Date(Number(utc_time));		// UTC date/time

	// To convert the utc value to local time
	return (utc_time - (d.getTimezoneOffset() * 60000));
}

function MkUtcTime( local_time )
{
	// Get client side time, use for timezone correction.
	d = new Date(Number(local_time));		// UTC date/time

	// To convert the utc value to local time
	return (local_time + (d.getTimezoneOffset() * 60000));
}

// Creates a blue seperator bar.
function seperatorBar() {
	//return '<tr><td colspan="4" valign="bottom">'
			//	+
	return '<table BORDER=2 CELLPADDING=0 CELLSPACING=0 width=100%>'
				+ '<TR><TD bgcolor="#000099" align="center" valign="bottom">'
				+ '<table BORDER=0 CELLPADDING=0 CELLSPACING=3 width=100%>'
				+ '<TR><TD></TD></TR></table>'
				+ '</TD></TR></table>';
}

function enableInputButton(button_id) {
	document.getElementById(button_id).disabled = false;
	enable_backspace = true;
}

function createInputAndButton(input_id, input_val, button_id, button_txt, button_func, disabled, text_width)
{
	// Create input box
	var ret_string 	= '<input type="text" size="' + text_width + '" id="' + input_id + '"'
				+ ' name="' + input_id + '" value="' + input_val + '"'
				+ ' onfocus="enableInputButton(\'' + button_id + '\')"'
				+ ' onBlur="enable_backspace=false"/>';

	// Create button
	ret_string  += '&nbsp <input'
				+ ' type="button" id="' + button_id + '" name="' + button_id + '"'
				+ ' value="' + button_txt + '"'
				+ disabled
				+ ' onClick="' + button_func + '"'
				+ ' onDblClick="' + button_func + '"'
				+ ' />';

	return ret_string;
}

function createIdValAndButtonInput(id_id, id_val, input_id, input_val, button_id, button_txt, button_func, disabled, text_width)
{
	// Create id box
	var ret_string 	= '<input type="text" size="' + 5 + '" id="' + id_id + '"'
				+ ' name="' + id_id + '" value="' + id_val + '"'
				+ ' onfocus="enableInputButton(\'' + button_id + '\')"'
				+ ' onBlur="enable_backspace=false"/>';

	// Create input box
	ret_string 	+= '<input type="text" size="' + text_width + '" id="' + input_id + '"'
				+ ' name="' + input_id + '" value="' + input_val + '"'
				+ ' onfocus="enableInputButton(\'' + button_id + '\')"'
				+ ' onBlur="enable_backspace=false"/>';

	// Create button
	ret_string  += '&nbsp <input'
				+ ' type="button" id="' + button_id + '" name="' + button_id + '"'
				+ ' value="' + button_txt + '"'
				+ ' disabled="disabled"' //disabled
				+ ' onClick="' + button_func + '"'
				+ ' onDblClick="' + button_func + '"'
				+ ' />';

	return ret_string;
}

var _text_dialog;

function HtmlEncode(s)
{
	return s.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function CgiGetTextInputValue(form)
{
	var tval 		= form.text_val.value;
	var max			= parseInt(form.max.value);
	var button_id 	= form.button_id.value;
	var cmd 		= form.cmd.value;
	var idnum 		= form.idnum.value;
	var cgi_handler	= form.cgi_handler.value;

	_text_dialog.close();

	//SendCgiCommand(button_id, cmd, idnum, cgi_handler, 0, 0, HtmlEncode(tval));

	if(cgi_handler != "")
		sendAjax = new ppcAjaxQue(cgi_handler, createTables);
	else
		sendAjax = ajaxCmd;

		//Handle an externally defined URL parameter
	var AjaxCmdString = "COMMAND=" + cmd +"&IDNUM=" + idnum
		+ "&INCID=" + "1" + "&VALUE=\"" + tval + "\"&INCDETAILVAL=" + "1"
		+ "&SYSDETAILS=" + "1" + "&QUADSTATUS=" + "1" ;

	sendAjax.sendCommand(AjaxCmdString);
}

function CgiTextInputDialog(button_id, cmd, idnum, cgi_handler, description, maxNumChars, ExtraParm, ExtraParmVal)
{
	var msg = '<br/><table valign="middle" cellspacing="5" border="0" with="100%"><tr>';
	msg += '<td align="right">Enter text:</td>';
	msg += '<td align="left"><input name="text_val" style="width: 300px" value="" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/></td>';
	msg += '</tr><tr><td> &nbsp </td>';
	msg += '</tr><tr>';
	msg += '<td colspan="2" align="center"><input type="button" value="Submit" onclick="CgiGetTextInputValue(this.form)"/></td>';
	msg += '</tr></table>';
	msg += '<input type="hidden" name="button_id" value="'+button_id+'"/>';
	msg += '<input type="hidden" name="cmd" value="'+cmd+'"/>';
	msg += '<input type="hidden" name="idnum" value="'+idnum+'"/>';
	msg += '<input type="hidden" name="cgi_handler" value="'+cgi_handler+'"/>';
	msg += '<input type="hidden" name="max" value="'+maxNumChars+'"/>';

	//Handle an externally defined URL parameter
	if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
	{
	  	msg += '<input type="hidden" name="' + ExtraParm + '" value="'+ExtraParmVal+'"/>';
	}

	_text_dialog = new DialogWindow(msg, {title: description
										, hideOkCancelButtons: true
										, top: 0
										, modal: 'parent'
										}
								);

	_text_dialog.el.style.width = '500px';
	//_hiddenMenu.beforeShow(function() { alert('beforeShow'); });
	//_hiddenMenu.show(function() { alert('showing'); });
	//_hiddenMenu.apply(function() { alert('applying: ' + _hiddenMenu.serialize(true)); });
	//_hiddenMenu.apply(menuUpdate);
	_text_dialog.show();
}

var _float_dialog;

function CgiGetFloatInputValue(form)
{
	var fval 		= parseFloat(form.float_val.value);
  var fval2 = 0;
  if(form.float_val2 != null)
  {
    fval2   = parseFloat(form.float_val2.value);
	}
  else { fval2 = 0;
  }

  var dcdcNum		= parseFloat(form.dcdc.value);
	var acacNum		= parseFloat(form.acac.value);
	var min 		= parseFloat(form.min.value);
	var max			= parseFloat(form.max.value);
	var button_id 	= form.button_id.value;
	var cmd 		= form.cmd.value;
	var idnum 		= form.idnum.value;
	var cgi_handler	= form.cgi_handler.value;

	if(fval >= min && fval <= max && fval2 >= min && fval2 <= max)
	{
		_float_dialog.close();
		SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, fval, "VALUE2", fval2);

		//alert("Will be sending "+cmd+" with value "+fval+" to "+cgi_handler+".");
	}
	else
		alert("Value not between "+min+" and "+max+".");
}

function CgiFloatInputDialog(button_id, cmd, idnum, cgi_handler, description, value, min, max, dcdcNum, acacNum, inputDesc, ExtraParm, ExtraParmVal)
{
	var msg = '<br/><table valign="middle" cellspacing="5" border="0" with="100%"><tr>';
	msg += '<td align="right">' + inputDesc + '</td>';
	msg += '<td align="left"><input name="float_val" style="width: 75px" value="'+value+'" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/></td>';
	msg += '</tr><tr><td> &nbsp </td>';
	msg += '</tr><tr>';
	msg += '<td colspan="2" align="center"><input type="button" value="Submit" onclick="CgiGetFloatInputValue(this.form)"/></td>';
	msg += '</tr></table>';
	msg += '<input type="hidden" name="button_id" value="'+button_id+'"/>';
	msg += '<input type="hidden" name="cmd" value="'+cmd+'"/>';
	msg += '<input type="hidden" name="idnum" value="'+idnum+'"/>';
	msg += '<input type="hidden" name="cgi_handler" value="'+cgi_handler+'"/>';
	msg += '<input type="hidden" name="min" value="'+min+'"/>';
	msg += '<input type="hidden" name="max" value="'+max+'"/>';
	msg += '<input type="hidden" name="dcdc" value="'+dcdcNum+'"/>';
	msg += '<input type="hidden" name="acac" value="'+acacNum+'"/>';

	//Handle an externally defined URL parameter
	if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
	{
	  	msg += '<input type="hidden" name="' + ExtraParm + '" value="'+ExtraParmVal+'"/>';
	}

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

function CgiMultiFloatInputDialog(button_id, cmd, idnum, cgi_handler, description, value, min, max, dcdcNum, acacNum, inputDesc1, inputDesc2, value2)
{
	var msg = '<br/><table valign="middle" cellspacing="5" border="0" with="100%"><tr>';
	msg += '<td align="right">' + inputDesc1 + ':</td>';
	msg += '<td align="left"><input name="float_val" style="width: 75px" value="'+value+'" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/></td>';
	msg += '</tr><tr>'
  msg += '<td align="right">' + inputDesc2 + ':</td>';
	msg += '<td align="left"><input name="float_val2" style="width: 75px" value="'+value2+'" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/></td>';
	msg += '</tr><tr><td> &nbsp </td>';
	msg += '</tr><tr>';
	msg += '<td colspan="2" align="center"><input type="button" value="Submit" onclick="CgiGetFloatInputValue(this.form)"/></td>';
	msg += '</tr></table>';
	msg += '<input type="hidden" name="button_id" value="'+button_id+'"/>';
	msg += '<input type="hidden" name="cmd" value="'+cmd+'"/>';
	msg += '<input type="hidden" name="idnum" value="'+idnum+'"/>';
	msg += '<input type="hidden" name="cgi_handler" value="'+cgi_handler+'"/>';
	msg += '<input type="hidden" name="min" value="'+min+'"/>';
	msg += '<input type="hidden" name="max" value="'+max+'"/>';
	msg += '<input type="hidden" name="dcdc" value="'+dcdcNum+'"/>';
	msg += '<input type="hidden" name="acac" value="'+acacNum+'"/>';

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

function CgiConfirmBeforeSend(question_text, button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, ExtraParm, ExtraParmVal, callback_fn)
{
	document.getElementById(button_id).disabled = true;

	if(confirm(question_text))
 	{
		if(typeof callback_fn != 'undefined')
			{
				window[callback_fn](button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, '', ExtraParm, ExtraParmVal);
			}
		else if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
			{
				SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, '', ExtraParm, ExtraParmVal);
			}
		else
			{
				SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum);
			}
	}
	else {
		document.getElementById(button_id).disabled = false;
	}
}

// If cgi_handler is set it will create a new ajax commander to send these commands
function SendCgiCommand(button_id, cmd, idnum, cgi_handler, dcdcNum, acacNum, aValue, ExtraParm, ExtraParmVal)
{
	document.getElementById(button_id).disabled = true;

	if(typeof cgi_handler == 'undefined')	cgi_handler = '';
	if(typeof aValue == 'undefined')	aValue = '';
	if(typeof dcdcNum == 'undefined')	dcdcNum = 0;
	if(typeof acacNum == 'undefined')	acacNum = 0;

	if(cgi_handler != "")
		sendAjax = new ppcAjaxQue(cgi_handler, createTables);
	else
		sendAjax = ajaxCmd;

		//Handle an externally defined URL parameter
	if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
	{
		var AjaxCmdString = "COMMAND=" + cmd +"&IDNUM=" + idnum + "&DETAILLEVEL=" + page_detail_level
			+ "&INCID=" + "1" + "&VALUE=" + aValue + "&DCDC=" + dcdcNum + "&ACAC=" + acacNum + "&INCDETAILVAL=" + "1"
			+ "&SYSDETAILS=" + "1" + "&QUADSTATUS=" + "1" + "&" + ExtraParm + "=" + ExtraParmVal;

		sendAjax.sendCommand(AjaxCmdString);
	}else
	{
		sendAjax.sendCommand({COMMAND	: cmd
						, IDNUM		: idnum
						, DETAILLEVEL	: page_detail_level
						, INCID : 1
						, VALUE : aValue
						, DCDC : dcdcNum
						, ACAC : acacNum
						, INCDETAILVAL : 1
						, SYSDETAILS : 1
						, QUADSTATUS : 1
						});
	}

	createTheTables = true;
}

var cgi_section_tag = "";

// Assumes the xml element has been set and that
// it contains the desired command
//	 - _tag is assumed to be the command
// 	 - _val is the text on the button.
//   - Supports the attributes
//		- shmidnum: shared memory ID number.
//		- idnum={arbritary int}
//		- disabled={true, false}
//		- confirm=true
//		- cgi_handler=the cgi application responding to the command
//							otherwise the standard ajax object will be used.
//		- section	=string, creates column of section tables.
//					="" creates row of buttons
//      - inputDesc Array of inputDescriptions
function buildCgiCommandButton(ExtraParm, ExtraParmVal, callback_fn, inputDesc)
{
	button_id = _tag + _u_id;

	var __min = 0.0;
	var __max = 0.0;
	var __value = 0.0;
  var __value2 = 0.0;
	var __dcdcNum = 0;
	var __acacNum = 0;
	var cmd_type = '';
	var disabled = '';
	var confirm = 'false';
	var cgi_handler = "";

    //Create a default for inputDesc in case none exists
    if (typeof inputDesc == 'undefined' || inputDesc.length == 0) {
    	inputDesc = new Array();
        inputDesc.push("Enter Value:");
    }

	var idnum = GetUrlParameter("idnum");

	if(idnum == "")
		idnum = GetUrlParameter("quad");

	if(idnum == "")
		idnum = GetUrlParameter("CANNETNO");

	for(x=0; x<_num_attributes; x++)
	{
		if(disable_commands || (_attr_type[x] == 'disabled' && _attr_val[x] == 'true') )
			disabled = 'disabled="disabled"';

		if(_attr_type[x] == 'idnum') 		idnum = _attr_val[x];
		if(_attr_type[x] == 'confirm') 		confirm = _attr_val[x];
		if(_attr_type[x] == 'cgi_handler') 	cgi_handler = _attr_val[x];
		if(_attr_type[x] == 'section') 		cgi_section_tag = _attr_val[x];
		if(_attr_type[x] == 'TYPE') 		cmd_type = _attr_val[x];
		if(_attr_type[x] == 'MIN') 			__min = _attr_val[x];
		if(_attr_type[x] == 'MAX') 			__max = _attr_val[x];
		if(_attr_type[x] == 'VALUE')		__value = _attr_val[x];
		if(_attr_type[x] == 'VALUE2')		__value2 = _attr_val[x];
		if(_attr_type[x] == 'DCDC')			__dcdcNum = parseInt(_attr_val[x]);
		if(_attr_type[x] == 'ACAC')			__acacNum = parseInt(_attr_val[x]);
	}

	var ret_str = "";

	if(cmd_type == 'float')	// Need to create dailog and accept a float value.
	{
		__description = _val;
		if(_hint_text != "") __description = _hint_text;

		var ajax_cmd_func = 'CgiFloatInputDialog('
							+ '\''  + button_id + '\'' 	// Button Name
							+ ',\'' + _tag + '\''		// Command for CGI
							+ ',\'' + idnum + '\''
							+ ',\'' + cgi_handler + '\''
							+ ',\'' + __description + '\''	// Description text
							+ ',\'' + __value + '\''		// Current value
							+ ',\'' + __min + '\''			// Min value
							+ ',\'' + __max + '\''			// Max value
							+ ',\'' + __dcdcNum+ '\''		// The dcdc number, 0 if not exhistent
							+ ',\'' + __acacNum+ '\''		// The acac number, 0 if not exhistent
							+ ',\'' + inputDesc[0] + '\'';
							//Handle an externally defined URL parameter
							if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
							{
								ajax_cmd_func += ',\'' + ExtraParm + '\'' + ',\'' + ExtraParmVal + '\'';
							}

							ajax_cmd_func += ');';
	}
	else 	if(cmd_type == 'float2')	// Need to create dailog and accept a float value.
	{
		__description = _val;
		if(_hint_text != "") __description = _hint_text;

		var ajax_cmd_func = 'CgiMultiFloatInputDialog('
							+ '\''  + button_id + '\'' 	// Button Name
							+ ',\'' + _tag + '\''		// Command for CGI
							+ ',\'' + idnum + '\''
							+ ',\'' + cgi_handler + '\''
							+ ',\'' + __description + '\''	// Description text
							+ ',\'' + __value + '\''		// Input value
							+ ',\'' + __min + '\''			// Min value
							+ ',\'' + __max + '\''			// Max value
							+ ',\'' + __dcdcNum+ '\''		// The dcdc number, 0 if not exhistent
							+ ',\'' + __acacNum + '\''		// The acac number, 0 if not exhistent
                            + ',\'' + inputDesc[0] + '\''   // Input description 1
                            + ',\'' + inputDesc[1] + '\''   // Input description 2
							+ ',\'' + __value2 + '\'';		// Extra float value
							ajax_cmd_func += ');';
	}
	else
	if(cmd_type == 'text')	// Need to create dailog and accept a float value.
	{
		__description = _val;
		if(_hint_text != "") __description = _hint_text;

		var ajax_cmd_func = 'CgiTextInputDialog('
							+ '\''  + button_id + '\'' 	// Button Name
							+ ',\'' + _tag + '\''		// Command for CGI
							+ ',\'' + idnum + '\''
							+ ',\'' + cgi_handler + '\''
							+ ',\'' + __description + '\''	// Description text
							+ ',\'' + __max + '\''			// Max number of characters

							//Handle an externally defined URL parameter
							if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
							{
								ajax_cmd_func += ',\'' + ExtraParm + '\'' + ',\'' + ExtraParmVal + '\'';
							}

							ajax_cmd_func += ');';
	}
	else
	{
		var ajax_cmd_func = '';

		if(typeof callback_fn != 'undefined')
			ajax_cmd_func =  callback_fn + '(';
		else
			ajax_cmd_func =  'SendCgiCommand(';

		ajax_cmd_func +=  '\''  + button_id + '\'' 	// Button Name
							+ ',\'' + _tag + '\''		// Command for CGI
							+ ',\'' + idnum + '\''
							+ ',\'' + cgi_handler + '\''
							+ ',\'' + __dcdcNum+ '\''		// The dcdc number, 0 if not exhistent
							+ ',\'' + __acacNum+ '\''		// The acac number, 0 if not exhistent
														//Handle an externally defined URL parameter
							if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
							{
								ajax_cmd_func += ',\'\'' + ',\'' + ExtraParm + '\'' + ',\'' + ExtraParmVal + '\'';
							}

							ajax_cmd_func += ');';

		if(confirm=='true' || confirm=='1')
		{
			ajax_cmd_func  = 'CgiConfirmBeforeSend('
							+ '\'Are you sure you want to ' + _val + '??\''	// Confirmation text
							+ ',\''  + button_id + '\'' 	// Button Name
							+ ',\'' + _tag + '\''		// Command for CGI
							+ ',\'' + idnum + '\''
							+ ',\'' + cgi_handler + '\''
							+ ',\'' + __dcdcNum+ '\''		// The dcdc number, 0 if not exhistent
							+ ',\'' + __acacNum+ '\''		// The acac number, 0 if not exhistent
							//Handle an externally defined URL parameter
							if(typeof ExtraParm != 'undefined' && typeof ExtraParmVal != 'undefined')
							{
								ajax_cmd_func += ',\'' + ExtraParm + '\'' + ',\'' + ExtraParmVal + '\'';

								if(typeof callback_fn != 'undefined')
									ajax_cmd_func += ',\'' + callback_fn + '\''
							}

							ajax_cmd_func += ');';
		}
	}
	ret_str = '<input'
				+ ' type="button" id="' + button_id + '" name="' + button_id + '"'
				+ ' value="' + _val + '"'
				+ ' ' + disabled
				+ ' onClick="' + ajax_cmd_func + '"'
				+ ' onDblClick="' + ajax_cmd_func + '"'
				+ ' />';

	return ret_str;
}

function closeTheWindow()
{
	window.close();
}

var page_detail_level = 4;

var enable_backspace = false;

// The common header bar.
// This class maintains a list of links or button text and puts them
// together as a command bar, then adds the seperator.
function ppcPageWrapper(default_detail_level)
{
	/*************************************************************************
		Variables.
	 *************************************************************************/

	var that = this;	// Required for private member access to public vars.
						//  - this appears to be a workaroudn for a bug in the language

	var _num_links = 0;				// The links at the front portion of the bar
	var _links = new Array();

	var _emerg_links = "";
	var _service_links = "";
	var _hw_links = "";

	var _hiddenMenu;							// The settings dialog.
	var thepage = window.location.href;

	var _no_header = false;

	page_detail_level = parseInt($.cookie(window.location.path + "-PAGE_DETAIL"));
	if(isNaN(page_detail_level))
		page_detail_level = default_detail_level;

	/*************************************************************************
		Public Functions
	 *************************************************************************/

	// The common page layout with id tags for js
	this.PageLayout = function(the_page_title, quick_links)
	{
		document.onkeydown = ppcPage.myKeyDownHandler;

		if(GetUrlParameter("noheader") == 1)
		{
			_no_header = true;
			document.write(
				'<table align="center" width="98%" CELLPADDING="0" CELLSPACING="3" border="0">'
				+'<tr><td>'
				+	'<table style="font-size: 20px; border: 2px solid #ccc; background: #EEE;" width="100%">'
				+	'<tr>'
				+		'<th rowspan="2" style="font-size: 24px; font-weight: bold;" align="left">'+_machine_name+' '+the_page_title+'</th>'
				+		'<td valign="top" align="right">'
				+		'<var style="font-size: 10px; color: #244797;" id="curr_ts"></var>'
				+		'</td>'
				+	'</tr>'
				+	'</table>'
				+'</td></tr>'
				+'<tr><td>'
				+	'<div id="cmd_bar"></div>'
				+	'<div id="errorString"></div>'
				+'</td></tr>'
				+'<tr><td align="center">'
				+	'<table align="center" width="98%" border="0"><tr>'
				+	'<td valign="top" align="left"><div id="service_buttons"></div></td>'
				+	'<td><div id="data"></div></td>'
				+	'</tr></table>'
				+'</td></tr>'
				+'</table>'		);
			return;
		}
		if(typeof quick_links == 'undefined')	quick_links = '';

		document.write(
			'<table align="center" width="98%" CELLPADDING="0" CELLSPACING="3" border="0">'
			+'<tr><td>'
			+	'<table style="font-size: 20px; border: 2px solid #ccc; background: #EEE;" width="100%">'
			+	'<tr>'
			+		'<th rowspan="2" style="font-size: 24px; font-weight: bold;" align="left">'+_machine_name+' '+the_page_title+'</th>'
			+		'<td valign="top" align="right">'
			+		'<var id="hidden_button"></var> &nbsp '
			+		'<var style="font-size: 10px; color: #244797;" id="curr_ts"></var>'
			//+		'<var style="font-size: 12px; font-weight: bold; color: #244797;" id="curr_ts"></var>'
			+		'&nbsp <var id="ajax_status"></var> &nbsp '
			+       '<a style="font-size: 12px;" href="index.html"><img style="width: 20px; height: 20px;" alt="Home" src="images/home.jpeg" border="0" /></a>'
			+		'</td>'
			+	'</tr><tr>'
			+		'<td align="right" valign="bottom"><div id="quick_links">' + quick_links + '</div></td>'
			+	'</tr>'
			+	'</table>'
			+'</td></tr>'
			+'<tr><td>'
			+	'<div id="cmd_bar"></div>'
			+	'<div id="errorString"></div>'
			+'</td></tr>'
			+'<tr><td align="center">'
			+	'<table align="center" width="98%" border="0"><tr>'
			+	'<td valign="top" align="left"><div id="service_buttons"></div></td>'
			+	'<td><div id="data"></div></td>'
			+	'</tr></table>'
			+'</td></tr>'
			+'</table>'		);

		document.getElementById("hidden_button").innerHTML
			= '<input type="image" style="width: 10px; height: 10px;" src="images/clearpixel.gif" alt="hb" onclick="ppcPage.hiddenMenu()" />';
	};

    // The common page layout with id tags for js
	this.PageLayout_2 = function (the_page_title, quick_links) {
	    document.onkeydown = ppcPage.myKeyDownHandler;

	    if (typeof quick_links == 'undefined') quick_links = '';

	    document.write(
			'<table align="center" width="98%" CELLPADDING="0" CELLSPACING="3" border="0">'
			+ '<tr><td>'
			+ '<table style="font-size: 20px; border: 2px solid #ccc; background: #EEE;" width="100%">'
			+ '<tr>'
			+ '<th rowspan="2" style="font-size: 24px; font-weight: bold;" align="left">' + _machine_name + ' ' + the_page_title + '</th>'
			+ '<td valign="top" align="right">'
			+ '<var id="hidden_button"></var> &nbsp '
			+ '<var style="font-size: 10px; color: #244797;" id="curr_ts"></var>'
			//+		'<var style="font-size: 12px; font-weight: bold; color: #244797;" id="curr_ts"></var>'
			+ '&nbsp <var id="ajax_status"></var> &nbsp '
			+ '<a style="font-size: 12px;" href="index.html"><img style="width: 20px; height: 20px;" alt="Home" src="images/home.jpeg" border="0" /></a>'
			+ '</td>'
			+ '</tr><tr>'
			+ '<td align="right" valign="bottom"><div id="quick_links">' + quick_links + '</div></td>'
			+ '</tr>'
			+ '</table>'
			+ '</td></tr>'
			+ '<tr><td>'
			+ '<div id="cmd_bar"></div>'
			+ '<div id="errorString"></div>'
			+ '</td></tr>'
			+ '<tr><td align="center">'
			+ '<table align="left" width="300px" border="0">'
			+ '<tr><td><div id="data"></div></td></tr>'
			+ '<tr><td valign="top" align="left"><div id="service_buttons"></div></td></tr>'
			+ '</table>'
			+ '</td></tr>'
			+ '</table>');

	    document.getElementById("hidden_button").innerHTML
			= '<input type="image" style="width: 10px; height: 10px;" src="images/clearpixel.gif" alt="hb" onclick="ppcPage.hiddenMenu()" />';
	};

	this.addLink = function(link_txt)	{
		_links[_num_links++] = link_txt;
	};

	this.addEmergencyButtons = function(link_txt)	{
		_emerg_links = link_txt;
	};

	this.addServiceButtons = function(link_txt)	{
		_service_links = link_txt;
	};

	this.addHardwareLinks = function(link_txt)	{
		_hw_links = link_txt;
	};

	this.createMenuBar = function()
	{
		var ret_str = '<table border="0" width="100%"><tr>';

		var sep = "";

		if(_emerg_links != "")
		{
			ret_str += '<td align="left" width="170">';
			ret_str += _emerg_links;

			// The stop update button.
			if(0) // Create a flag.
			{
				button_text = "Stop Update";
				if(false == ajaxCmd.autoUpdate)
				{
					disable_commands = true;
					button_text = "Start Update";
				}
				ret_str += ' &nbsp <input type="button" id="toggle_button" name="toggle_button"'
							 + ' value="' + button_text + '" onClick="toggle();" onDblClick="toggle(); " />';
			}

			ret_str += '</td>';
		}

		if(_num_links > 0)
		{
			ret_str += '<td align="left">';
			for (i=0; i<_num_links; i++) {
				ret_str += sep + _links[i];
				sep = ' &nbsp ';
			}
			ret_str += '</td>';
		}

		if(_hw_links != "")
		{
			ret_str += '<td align="right">';
			ret_str += _hw_links;
			ret_str += '</td>';
		}

		ret_str += '</tr></table>';

		ret_str += seperatorBar();

		if(_service_links != "")
		{
			ret_str += '<table border="0" width="100%"><tr><td align="left">';
			ret_str += _service_links;
			ret_str += '</td></tr></table>';
			ret_str += seperatorBar();
		}

		_links.length = 0;
		_num_links = 0;

		return ret_str;
	};

	this.menuUpdate = function(form)
	{
		if(_no_header) return;

		pageDetailLevel = parseInt(form.pageDetailLevel.value);

		$.cookie(window.location.path + "-PAGE_DETAIL", pageDetailLevel);

		window.location.href = thepage;
		window.location.reload();
	};

	this.hiddenMenu = function()
	{
		var msg = '<br/><table valign="middle" cellspacing="5" border="0" with="100%"><tr>';
		msg += '<td align="right">Enter detail level</td>';
		msg += '<td align="left"><input name="pageDetailLevel" style="width: 75px" value="'+page_detail_level+'" onFocus="enable_backspace=true" onBlur="enable_backspace=false"/></td>';
		msg += '</tr><tr><td> &nbsp </td>';
		msg += '</tr><tr>';
		msg += '<td colspan="2" align="center"><input type="button" value="Submit" onclick="ppcPage.menuUpdate(this.form)"/></td>';
		msg += '</tr></table>';

		_hiddenMenu = new DialogWindow(msg, {title: 'Page settings'
											, hideOkCancelButtons: true
											, top: 0
											, modal: 'parent'
											}
									);

		_hiddenMenu.el.style.width = '300px';
		//_hiddenMenu.beforeShow(function() { alert('beforeShow'); });
		//_hiddenMenu.show(function() { alert('showing'); });
		//_hiddenMenu.apply(function() { alert('applying: ' + _hiddenMenu.serialize(true)); });
		//_hiddenMenu.apply(menuUpdate);
		_hiddenMenu.show();
	};

	// Ths function needs to capture the backspace button and stop it from executing a page back command!!
	// ** The backspace_enable flag should be enabled whenever an input field is in focus (onFocus) and
	//    disabled whenever it goes out of focus (onBlur).
	this.myKeyDownHandler = function(e)
	{
		if (!e) var e = window.event;

		if(typeof e == 'undefined')
			alert("The click key event object was not passed.");

		if(window.event) // IE
			keynum = e.keyCode;
		else if(e.which) // Netscape/Firefox/Opera
			keynum = e.which;

		if(keynum == 8) {	// The backspace charecter.
			if(enable_backspace)
				return true;
			else
				return false;
		}

		return true;
	};
}