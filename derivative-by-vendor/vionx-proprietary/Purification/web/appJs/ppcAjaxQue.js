// ppcAjaxQue.js
//
// This class is a communications wrapper for the JQeary.ajaxq function.
// It uses the ajaxq function to serialize  an update timer with
// asynchronous command requests.
//
// At this point in time it only supports a single callback which is
// defined by the options sent to beginUpdates function.
//
// *** Important notes:
//		- String data with special characters like a space can easily get
//		  messed up.  In these cases build the queary string manually and
//		  pass the pre-built query to the sendCommand object.  jqueary.ajax
//		  handles this string better then building it itself from an options
//		  variable.

//	- cgicmd	: The final destination for the cgi interpreter.
//	- cb_func	: The call back function

var _ajax_name_idx = 0;

function ppcAjaxQue(cgicmd, cb_func, err_cb_func) {
    /*************************************************************************
		Variables.
	 *************************************************************************/

    // Public variables.
    this.autoUpdate = false;

    var that = this;	// Required for private member access to public vars.
    //  - this appears to be a workaroudn for a bug in the language

    // Private variables.
    var _queName = "ppcAjaxQue-" + _ajax_name_idx++;

    if (typeof (_ajax_handler) == 'undefined')
        alert("The config.js file has not been configured!!");

    var _url = _ajax_handler;	// The cgi url

    var _cgicmd = cgicmd;		// The final cgi destination.  Gets added to the called url

    if (_url == "standard")	// Use the cgicmd as the url.
    {
        _url = cgicmd;
        _cgicmd = ""
    }

    var _CBFunction = cb_func;	// The update function to call

    var _ErrCBFunction = err_cb_func;

    var _reqOptions = {};		// Holds the ajax.options for the update requests.

    var _interval = "";			// The interval update timer.

    var _ajaxQueReset = false;

    var _dynamic_keyword; 		// The url keyword for the dynamic value.
    var _CB_dynamic_value;		// The call back function for the dynamic value

    //console.log("Creating ajaxq: %s", _queName);

    $.ajaxq.initQue(_queName)		// Make sure the name is initialized.

    /*************************************************************************
		Public Functions
	 *************************************************************************/

    this.reset = function () {	// This will stop any pending requests from ANY named ques.
        _ajaxQueReset = true;
        //console.log("ppcAjaxQue.reset called for %s.", _queName);
        $.ajaxq(_queName);
    }

    var _stat_timer = setInterval(statusDisplayUpdate, 500);
    var _spin_step = 0;
    function statusDisplayUpdate() {
        if (null == document.getElementById('ajax_status'))
            return;

        if (typeof document.ajaxq == "undefined")
            return;

        if (!$.ajaxq.emptyQue(_queName)) {
            if (_spin_step >= 0) {
                document.getElementById('ajax_status').innerHTML =
					'<img style="width: 15px; height: 15px;" alt="-" src="images/roller.gif" border="0" />';
                _spin_step = -1;
            }
            _spin_step--;
        }
        else {
            if (_spin_step < 0) {
                document.getElementById('ajax_status').innerHTML =
					'<img style="width: 15px; height: 15px;" alt=":" src="images/clearpixel.gif" border="0" />';
                _spin_step = 0
            }
            _spin_step++;
        }
    }
    // Start the actual update timer.
    //  - milliSeconds	: The update timer rate.
    //	- cmdData		: The data required by the JQeary.ajax function
    this.beginUpdates = function (milliSeconds, cmdData, dynamic_key, dynamic_callback) {
        // Retain the cmdData as the reqOptions which will be used by the interval callback.
        _reqOptions = cmdData;

        // Support for a dynamic parameter.
        _dynamic_keyword = dynamic_key;
        _CB_dynamic_value = dynamic_callback;

        // Make sure the timer is cleared.
        if (_interval != "") clearInterval(_interval);

        // Start the interval timer.
        _interval = setInterval(requestUpdate, milliSeconds);
        this.autoUpdate = true;

        // Begin an imediate update
        requestUpdate();
    }

    // This function is called by an interval timer.
    // no update will happen if a command is in process.
    function requestUpdate() {
        // If there is a command in que, there is no need to add the update request.
        if (!$.ajaxq.emptyQue(_queName))
            return;

        that.sendCommand(_reqOptions);
    }

    // Stop the update timer.
    this.stopUpdates = function () {
        clearInterval(_interval);
        _interval = "";

        requestUpdate();	// Allow the GUI to updates status.
        this.autoUpdate = false;
    }

    // No more updates will be done.
    this.haltUpdates = function () {
        clearInterval(_interval);
        _interval = "";
        this.autoUpdate = false;
    }

    //	- cmdData		: The data required by the JQeary.ajax function
    this.sendCommand = function (cmdData) {
        if (typeof cmdData == "string") {
            var dataString = cmdData;

            if (typeof _CB_dynamic_value == 'function')
                dataString += '&' + _dynamic_keyword + '=' + _CB_dynamic_value();

            // Add the final cgi destination.
            if (_cgicmd != "")
                dataString += '&CGI=' + _cgicmd;

            // Need to add a changing value to the command so IE doesn't cache the request
            dataString += '&tstamp=' + new Date().getTime();

            // Create the options variable
            var opts = {
                url: _url,
                type: "GET",
                data: dataString,
                dataType: "text",
                success: ajaxCallBack,
                error: ajaxOnError
            };
        }
        else {
            if (typeof _CB_dynamic_value == 'function')
                cmdData[_dynamic_keyword] = _CB_dynamic_value();

            // Need to add the final command destination.
            if (_cgicmd != "")
                cmdData["CGI"] = _cgicmd;

            // Need to add a changing value to the command so IE doesn't cache the request
            cmdData["tstamp"] = new Date().getTime();

            // Create the options variable
            var opts = {
                url: _url,
                type: "GET",
                data: cmdData,
                dataType: "text",
                success: ajaxCallBack,
                error: ajaxOnError
            };
        }

        $.ajaxq(_queName, opts);

        statusDisplayUpdate();
    }

    /*************************************************************************
		Private Functions
	 *************************************************************************/

    function ajaxCallBack(responseStr, status) {
        // Just in case there had been an error.
        var e = document.getElementById('errorString').innerHTML = "";

        // Don't call the actaul callback if this is not the last command in the que.
        if (!$.ajaxq.lastQuedCmd(_queName)) {
            return
        }

        err_resp = xmlFindTag(responseStr, "response_error", 1);		// Look for and report errors.
        if ("" != err_resp) {
            err_resp = xmlExtractElement(err_resp);

            var e = document.getElementById('errorString');

            if (e != null)	// Make sure the element exists.
            {
                // This error produced specifically by ppc.
                e.innerHTML = "<p>Error " + _val + "</p>";
            }
        }

        // Update the gui.
        statusDisplayUpdate();
        _CBFunction(responseStr, status);
    }

    function ajaxOnError(XMLHttpRequest, textStatus, errorThrown) {
        if (_ajaxQueReset == true) {
            _ajaxQueReset = false;
            return;
        }

        if (XMLHttpRequest.status == '0') return;	// Don't display this status error

        if (typeof _ErrCBFunction == 'function') {
            _ErrCBFunction(XMLHttpRequest);
            return;
        }

        var e = document.getElementById('errorString');

        if (XMLHttpRequest.status == '503') {	// This error produced specifically by ppc.  Recovery may be possible
            e.innerHTML = "<p>Error " + XMLHttpRequest.status
						+ ' : ' + XMLHttpRequest.statusText + "</p>";
        }
        else {
            e.innerHTML = "<p>Error " + XMLHttpRequest.status
						+ ' : ' + XMLHttpRequest.statusText + "</p>"
						+ "<p> Halting update requests!</p>";
            that.stopUpdates();
        }
    }
}