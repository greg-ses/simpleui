<?php
/*
 *  Pump client backend support requests from Pumps.html.
 *  Connects REQ socket to ZMQ tcp://127.0.0.1:5556
 * @author Jim Scarsdale (cloned from io.php)
 */


require_once "Commander.php";
require_once "modules/xmlHelper.php";
require_once "php_config/config.php";
require_once "modules/sLogger.php";


define("zmqConnect", "tcp://127.0.0.1:5557");
//define("zmqConnect", "tcp://10.0.5.167:6557"); // Replace previous line with this one and run Pumps-proxy.php on the module server to develop using a QNX/Cerl module server. 
define("REQUEST_TIMEOUT", 5000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 3); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");

define("XML_ENABLE_CLUSTER_REQ",  "<request COMMAND=\"ENABLE_CLUSTER\"   CGI=\"Pump\" IDNUM=\"%s\" ROW_NUM=\"%s\"  />");
define("XML_DISABLE_CLUSTER_REQ", "<request COMMAND=\"DISABLE_CLUSTER\"  CGI=\"Pump\" IDNUM=\"%s\" ROW_NUM=\"%s\"  />");
define("XML_SET_SPEED_REQ",       "<request COMMAND=\"PUMP_SPEED\"       CGI=\"Pump\" IDNUM=\"%s\" PUMP_NUM=\"%s\" VALUE=\"%s\"/>");
define("XML_START_REQ",           "<request COMMAND=\"START_PUMP\"       CGI=\"Pump\" IDNUM=\"%s\" PUMP_NUM=\"%s\"  />");
define("XML_STOP_REQ",            "<request COMMAND=\"STOP_PUMP\"        CGI=\"Pump\" IDNUM=\"%s\" PUMP_NUM=\"%s\"  />");
define("XML_ENABLE_PUMP_REQ",     "<request COMMAND=\"ENABLE_PUMP\"      CGI=\"Pump\" IDNUM=\"%s\" PUMP_NUM=\"%s\"  />");
define("XML_DISABLE_PUMP_REQ",    "<request COMMAND=\"DISABLE_PUMP\"     CGI=\"Pump\" IDNUM=\"%s\" PUMP_NUM=\"%s\"  />");
define("XML_DATA_REQ",            "<request COMMAND=\"EXPORT_PUMP_CTRL\" CGI=\"Pump\" IDNUM=\"%s\" />");

define("XML_CTRL_RUN_PUMPS_REQ",      "<request COMMAND=\"Run_Pumps\" CGI=\"Pump\" />");
define("XML_CTRL_STOP_PUMPS_REQ",     "<request COMMAND=\"Stop_Pumps\" CGI=\"Pump\" />");
define("XML_CTRL_MANUAL_PUMPS_REQ",   "<request COMMAND=\"Manual_Pumps\" CGI=\"Pump\" />");
define("XML_CTRL_AUTO_PUMPS_REQ",   "<request COMMAND=\"Auto_Pumps\" CGI=\"Pump\" />");

define("XML_WARNING_RESPONSE", "%s<warning>%s</warning>");                       // arg1 - XML_HEADER, arg2 - warning message
define("XML_ERROR_RESPONSE", "%s<error>%s</error>");                             // arg1 - XML_HEADER, arg2 - error message


/*
 * Helper function that returns a new configured socket
 * connected to the Hello World server
 */

function client_socket(ZMQContext $context, $zmqConnect)
{
    // echo "I: connecting to server…", PHP_EOL;
    $client = new ZMQSocket($context,ZMQ::SOCKET_REQ);
    $client->connect($zmqConnect);

    //  Configure socket to not wait at close time
    $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);

    return $client;
}

function isValidResponse($xml, $rootName)
{
    $tagStart = sprintf("/<%s[ \/>]/", $rootName);
    return (preg_match($tagStart, $xml, $matches, PREG_OFFSET_CAPTURE));
}


class Pump extends Commander
{
    public $zmqRequest = 'zmqRequest';
    public $expectedResponseRoot = 'TF2000_PUMP_SUMMARY';

    function __construct($slogger)
    {
        parent::__construct($slogger, get_class());

        $this->commands["ENABLE_CLUSTER"  ] = new CmdInfo('COMMAND__ENABLE_CLUSTER',   "COMMAND=ENABLE_CLUSTER",   "ENABLE_CLUSTER Command");
        $this->commands["DISABLE_CLUSTER" ] = new CmdInfo('COMMAND__DISABLE_CLUSTER',  "COMMAND=DISABLE_CLUSTER",  "DISABLE_CLUSTER Command");
        $this->commands["PUMP_SPEED"      ] = new CmdInfo('COMMAND__PUMP_SPEED',       "COMMAND=PUMP_SPEED",       "PUMP_SPEED Command");
        $this->commands["START_PUMP"      ] = new CmdInfo('COMMAND__START_PUMP',       "COMMAND=START_PUMP",       "START_PUMP Command");
        $this->commands["STOP_PUMP"       ] = new CmdInfo('COMMAND__STOP_PUMP',        "COMMAND=STOP_PUMP",        "STOP_PUMP Command");
        $this->commands["ENABLE_PUMP"     ] = new CmdInfo('COMMAND__ENABLE_PUMP',      "COMMAND=ENABLE_PUMP",      "ENABLE_PUMP Command");
        $this->commands["DISABLE_PUMP"    ] = new CmdInfo('COMMAND__DISABLE_PUMP',     "COMMAND=DISABLE_PUMP",     "DISABLE_PUMP Command");
        $this->commands["Stop_Pumps"      ] = new CmdInfo('COMMAND__Stop_Pumps',       "COMMAND=Stop_Pumps",       "Stop_Pumps Command");
        $this->commands["Run_Pumps"       ] = new CmdInfo('COMMAND__Run_Pumps',        "COMMAND=Run_Pumps",        "Run_Pumps Command");
        $this->commands["Auto_Pumps"      ] = new CmdInfo('COMMAND__Auto_Pumps',       "COMMAND=Auto_Pumps",       "Pumps_Auto Command");
        $this->commands["Manual_Pumps"    ] = new CmdInfo('COMMAND__Manual_Pumps',     "COMMAND=Manual_Pumps",     "Manual_Pumps Command");
        $this->commands["EXPORT_PUMP_CTRL"] = new CmdInfo('COMMAND__EXPORT_PUMP_CTRL', "COMMAND=EXPORT_PUMP_CTRL", "EXPORT_PUMP_CTRL Command");
    }

    function zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest)
    {
        $context = new ZMQContext();
        $client = client_socket($context, zmqConnect);

        $retries_left = REQUEST_RETRIES;
        $read = $write = array();

        if ($xmlRequest == "none") {
            $errMsg = sprintf("xmlRequest should not be empty. [requestName: %s]", $requestName);
            $reply = sprintf(XML_ERROR_RESPONSE, XML_HEADER, $errMsg);
             return($reply);
        }


        $reply = "NO RESPONSE";
        while ($retries_left) {
            //  We send a request, then we work to get a reply
            // printf("xmlRequest: %s\n", $xmlRequest);
            $ret = $client->send($xmlRequest);

            $expect_reply = true;
            while ($expect_reply) {
                //  Poll socket for a reply, with timeout
                $poll = new ZMQPoll();
                $poll->add($client, ZMQ::POLL_IN);
                $events = $poll->poll($read, $write, REQUEST_TIMEOUT);

                //  If we got a reply, process it
                if ($events > 0) {
                    $reply = $client->recv();
                    if (isValidResponse($reply, $expectedResponseRoot)) {
                        $retries_left = 0;
                        $expect_reply = false;
                    } else {
                        $errMsg = sprintf("malformed reply from server [for requestName %s]:\n%s\n", $requestName, $reply);
                        $reply = sprintf(XML_ERROR_RESPONSE, XML_HEADER, $errMsg);
                    }
                } elseif (--$retries_left == 0) {
                    $expect_reply = false;
                    $reply = "No Response.";
                } else {
                     $this->log->logData(LOG_VERBOSE, "W: No response from server, retrying requestName %s …", $requestName);

                    //  Old socket will be confused; close it and open a new one
                    $client = client_socket($context, zmqConnect);

                   //  Send request again, on new socket
                   $this->log->logData(LOG_VERBOSE, "Resending xmlRequest [requestName %s]: %s\n", $requestName, $xmlRequest);
                   $client->send($xmlRequest);
                }

            }
        }
        return ($reply);
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=ENABLE_CLUSTER   &IDNUM=1  &ROW_NUM=1 &tstamp=1234567890123 */
    function COMMAND__ENABLE_CLUSTER()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__ENABLE_CLUSTER()");

        $requestName = 'XML_ENABLE_CLUSTER_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_ENABLE_CLUSTER_REQ, $_REQUEST["IDNUM"], $_REQUEST["ROW_NUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=DISABLE_CLUSTER  &IDNUM=1  &ROW_NUM=1 &tstamp=1234567890123 */
    function COMMAND__DISABLE_CLUSTER()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__DISABLE_CLUSTER()");

        $requestName = 'XML_DISABLE_CLUSTER';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_DISABLE_CLUSTER_REQ, $_REQUEST["IDNUM"], $_REQUEST["ROW_NUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }


    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=PUMP_SPEED       &IDNUM=1  &PUMP_NUM=1  &VALUE=25.0  &tstamp=1234567890123 */
    function COMMAND__PUMP_SPEED()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__PUMP_SPEED()");

        $requestName = 'XML_SET_SPEED_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_SET_SPEED_REQ, $_REQUEST["IDNUM"], $_REQUEST["PUMP_NUM"], $_REQUEST["VALUE"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=START_PUMP       &IDNUM=1  &PUMP_NUM=1  &tstamp=1234567890123 */
    function COMMAND__START_PUMP()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__START_PUMP()");

        $requestName = 'XML_START_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_START_REQ, $_REQUEST["IDNUM"], $_REQUEST["PUMP_NUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=STOP_PUMP        &IDNUM=1  &PUMP_NUM=1  &tstamp=1234567890123 */
    function COMMAND__STOP_PUMP()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__STOP_PUMP()");

        $requestName = 'XML_STOP_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_STOP_REQ, $_REQUEST["IDNUM"], $_REQUEST["PUMP_NUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=ENABLE_PUMP      &IDNUM=1  &PUMP_NUM=1  &tstamp=1234567890123 */
    function COMMAND__ENABLE_PUMP()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__ENABLE_PUMP()");

        $requestName = 'XML_ENABLE_PUMP_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_ENABLE_PUMP_REQ, $_REQUEST["IDNUM"], $_REQUEST["PUMP_NUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=DISABLE_PUMP     &IDNUM=1  &PUMP_NUM=1  &tstamp=1234567890123 */
    function COMMAND__DISABLE_PUMP()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__DISABLE_PUMP()");

        $requestName = 'XML_DISABLE_PUMP_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_DISABLE_PUMP_REQ, $_REQUEST["IDNUM"], $_REQUEST["PUMP_NUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Routed to the control system */
    function COMMAND__Stop_Pumps()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__Stop_Pumps()");

        $requestName = 'XML_CTRL_STOP_PUMPS_REQ';
        $valueName = 'Pump';
		$xmlRequest = XML_CTRL_STOP_PUMPS_REQ;
        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Routed to control system */
    function COMMAND__Run_Pumps()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__Run_Pumps()");

        $requestName = 'XML_CTRL_RUN_PUMPS_REQ';
        $valueName = 'Pump';
		$xmlRequest = XML_CTRL_RUN_PUMPS_REQ;
        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Routed to control system */
    function COMMAND__Auto_Pumps()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__Auto_Pumps()");

        $requestName = 'XML_CTRL_AUTO_PUMPS_REQ';
        $valueName = 'Pump';
		$xmlRequest = XML_CTRL_AUTO_PUMPS_REQ;
        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Routed to control system */
    function COMMAND__Manual_Pumps()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__Manual_Pumps()");

        $requestName = 'XML_CTRL_MANUAL_PUMPS_REQ';
        $valueName = 'Pump';
		$xmlRequest = XML_CTRL_MANUAL_PUMPS_REQ;
		
        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }

    /* Support cgicmd.php  ?CGI=Pump  &COMMAND=EXPORT_PUMP_CTRL &IDNUM=1  &tstamp=1234567890123 */
    function COMMAND__EXPORT_PUMP_CTRL()
    {
        $this->log->logData(LOG_VERBOSE, "COMMAND__EXPORT_PUMP_CTRL()");

        $requestName = 'XML_DATA_REQ';
        $valueName = 'Pump';
        $xmlRequest = sprintf(XML_DATA_REQ, $_REQUEST["IDNUM"]);

        $response = $this->zmqRequest($requestName, $valueName, $expectedResponseRoot, $xmlRequest);
        header('Content-type: application/xml');

        echo $response;
    }
}

?>

