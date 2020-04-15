<?php
/*
 *  io client backend for io.html.
 *  Connects REQ socket to ZMQ tcp://127.0.0.1:5556
 * @author Jim Scarsdale (based on lazy-pirate.php)
 */


require_once "Commander.php";
require_once "modules/xmlHelper.php";
require_once "php_config/config.php";
require_once "modules/sLogger.php";


define("zmqConnect", "tcp://127.0.0.1:5556");
//define("zmqConnect", "tcp://10.0.5.167:5557"); // Replace previous line with this one and run io-proxy.php on the module server to develop using a remote module server. 
define("REQUEST_TIMEOUT", 5000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 3); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");

define("XML_GET_REQUEST_TEMPLATE", "<request cmd=\"%s\" valueName=\"%s\"/>");    // arg1 - cmd, arg2 - valueName
define("XML_SET_REQUEST_TEMPLATE", "<request cmd=\"%s\" valueName=\"IO\" id=\"%s\" value=\"%s\"/>");    // arg1 - cmd, arg2 - id, arg3 - new value
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


class io extends Commander
{
    public $zmqRequest = 'zmqRequest';

    function __construct($slogger)
    {
        parent::__construct($slogger, get_class());

        $this->gets["IO_TEMPLATE"] = new CmdInfo("cmd_IO_TEMPLATE", "GET=IO_TEMPLATE", "IO template stream");
        $this->gets["IO_DATA"] = new CmdInfo("cmd_GET_IO_DATA", "GET=IO_DATA", "IO data stream");

        $this->sets["IO_DATA"] = new CmdInfo("cmd_SET_IO_DATA", "SET=IO_DATA", "IO data stream");
    }

    function zmqRequest($cmd, $valueName, $expectedResponseRoot, $requestType, $newValue=NULL)
    {
        $context = new ZMQContext();
        $client = client_socket($context, zmqConnect);

        $retries_left = REQUEST_RETRIES;
        $read = $write = array();

	$xmlRequest = "none";
	if ($requestType == "get") {
            $xmlRequest = sprintf(XML_GET_REQUEST_TEMPLATE, $cmd, $valueName);
        } elseif ($requestType == "set") {
            $xmlRequest = sprintf(XML_SET_REQUEST_TEMPLATE, $cmd, $valueName, $newValue);
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
                        $errMsg = sprintf("malformed reply from server:\n%s\n" + $reply);
                        $reply = sprintf(XML_ERROR_RESPONSE, XML_HEADER, $errMsg);
                    }
                } elseif (--$retries_left == 0) {
                    $expect_reply = false;
                    $reply = "No Response.";
                } else {
                     $this->log->logData(LOG_VERBOSE, "W: No response from server, retrying…");

                    //  Old socket will be confused; close it and open a new one
                    $client = client_socket($context, zmqConnect);

                   //  Send request again, on new socket
                   $this->log->logData(LOG_VERBOSE, "Resending xmlRequest: %s\n", $xmlRequest);
                   $client->send($xmlRequest);
                }

            }
        }
        return ($reply);
    }
    
    /* Support cgicmd.php   ?CGI=io&ID=1   &GET=IO_TEMPLATE   &dojo.preventCache=1234567890123 */
    function cmd_IO_TEMPLATE()
    {
        $this->log->logData(LOG_VERBOSE, "cmd_IO_TEMPLATE()");

        $cmd = 'getTemplate';
        $valueName = 'IO';
        $expectedResponseRoot = 'ioTemplate';

        $response = $this->zmqRequest($cmd, $valueName, $expectedResponseRoot, "get");
        header('Content-type: application/xml');

        echo $response;
    }
    
    /* Support cgicmd.php   ?CGI=io&ID=1   &GET=IO_DATA   &dojo.preventCache=1234567890123 */
    function cmd_GET_IO_DATA()
    {
        $this->log->logData(LOG_VERBOSE, "cmd_GET_IO_DATA()");

        $cmd = 'getData';
        $valueName = 'IO';
        $expectedResponseRoot = 'ioData';

        $response = $this->zmqRequest($cmd, $valueName, $expectedResponseRoot, "get");
        header('Content-type: application/xml');

        echo $response;
    }
    
    /* Support cgicmd.php   ?CGI=io   &ID=1   &SET=IO_DATA&CTRL_POINT=I1_Process_Pumps_Enable   &VALUE=true   &dojo.preventCache=1234567890123 */
    function cmd_SET_IO_DATA()
    {
        $this->log->logData(LOG_VERBOSE, "cmd_SET_IO_DATA()");

        $cmd = 'setValue';
        $id = $_REQUEST["CTRL_POINT"];
        $expectedResponseRoot = 'ioData';
	$newValue = $_REQUEST["VALUE"];
	if ( (0 == strcasecmp($newValue, "false"))
	  || ($newValue == "0") ) {
            $newValue = "0";
	} else {
	    $newValue = "1";
	}

        $response = $this->zmqRequest($cmd, $id, $expectedResponseRoot, "set", $newValue);
        header('Content-type: application/xml');

        echo $response;
    }
}

?>

