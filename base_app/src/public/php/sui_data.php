<?php
/*
*  Client backend to request template data from the module server for dashboard.html.
*/

header("Access-Control-Allow-Origin: *");
if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
    header("Content-Type: application/xml; charset=UTF-8");
} else {
    header("Content-Type: application/json; charset=UTF-8");
}

$log_file = "sui-data.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sLogger.php");
$log->setLevel(LOG_INFO);

$log->logData(LOG_VERBOSE, "sui_data.php Started.");

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/xml-diff-tool.php");


define("REQUEST_TIMEOUT", 2000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 0); //  Before we abandon

define("THE_GET_REQUEST_TEMPLATE", "<request COMMAND=\"%s\" valueName=\"%s\"/>");    // arg1 - cmd, arg2 - valueName


/*
 * create_client_socket()
 * Helper function that returns a new configured socket to zmqRequest.
 */

function create_client_socket(ZMQContext $context, $zmqConnect)
{
    // echo "I: connecting to server…", PHP_EOL;
    $client = new ZMQSocket($context, ZMQ::SOCKET_REQ);
    $client->connect($zmqConnect);

    //  Configure socket to not wait at close time
    $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);

    return $client;
}

function addStatusAndErrors($statusValue, $xmlIn, $errorList)
{
    global $log;

    $tailElements = "";
    if (count($errorList) > 0) {
        $log->logData(LOG_DEBUG, "Errors handled: " . count($errorList));

        $tailElements .= "<errors>\n<!--\n";
        foreach ($errorList as $error) {
	        $tailElements .= var_export($error, true);
            #$tailElements .= $error;
        }
        $tailElements .= "\n-->\n</errors>";
    }
    $tailElements .= "<status>" . $statusValue . "</status></Data_Summary>";

    return str_replace("</Data_Summary>", $tailElements, $xmlIn);
}

function zmqRequest($props, $DataPortPrefix, $cmd, $valueName, $expectedResponseRoot, $requestType, $newValue=NULL)
{
    global $log;
    $log->setLevel(LOG_INFO);

    $errorList = [];
    $replyReceived = "<Data_Summary></Data_Summary>";
    $statusValue = 5; // no response

    if ($requestType != "get") {
        $errorMsg = sprintf("COMMAND=\"%s\" id=\"%s\" requestType=\"set\" is NOT_IMPLEMENTED\"", $cmd, $valueName);
        $log->logData(LOG_WARNING, $errorMsg);

        return ("<request>" . $errorMsg . "<status>1</status></request>");
    }

    try {
        $context = new ZMQContext();
        $zmqConnect = sprintf("tcp://svcmachineapps:%s", propOrDefault($props, $DataPortPrefix . ".data.port", "5560"));

        $log->logData(LOG_VERBOSE, "ZMQ Connect: %s", $zmqConnect);
        $client = new ZMQSocket($context, ZMQ::SOCKET_REQ);

        $log->logData(LOG_VERBOSE, "before \$client->connect(\$zmqConnect)");
        $client->connect($zmqConnect);

        $log->logData(LOG_VERBOSE, "before \$client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0)");
        $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);  //  Configure socket to not wait at close time

        $xmlRequest = sprintf(THE_GET_REQUEST_TEMPLATE, $cmd, $valueName);
        $log->logData(LOG_VERBOSE, "Request:\n" . $xmlRequest);

        $read = $write = array();

        //  We send a request, then we work to get a reply
        $log->logData(LOG_VERBOSE, "Before \$client->send(\$xmlRequest)");
        $ret = $client->send($xmlRequest);

        //  Poll socket for a reply, with timeout
        $log->logData(LOG_VERBOSE, "Before new ZMQPoll()");
        $poll = new ZMQPoll();
        $log->logData(LOG_VERBOSE, "Before \$poll->add(\$client, ZMQ::POLL_IN)");
        $poll->add($client, ZMQ::POLL_IN);

        $log->logData(LOG_VERBOSE, "Before \$poll->poll(\$read, \$write, REQUEST_TIMEOUT)");
        $events = $poll->poll($read, $write, REQUEST_TIMEOUT);

        //  If we got a reply, process it
        if ($events > 0) {
            $log->logData(LOG_VERBOSE, "Before \$client->recv()");
            $replyReceived = $client->recv();
            $log->logData(LOG_VERBOSE, "\$client->recv(): " . strlen($replyReceived) . "bytes");
            if (isValidResponse($replyReceived, $expectedResponseRoot)) {
                $statusValue = 0; // Success
                $statusMsg = "" . strlen($replyReceived) . " bytes";
                $statusMsg = "Valid response from server:\n" . $statusMsg;
                $log->logData(LOG_VERBOSE, $statusMsg);
            } else {
                $statusValue = 4;
                $statusMsg = "malformed reply from server:\n" . $replyReceived;
                $log->logData(LOG_INFO, $statusMsg);
            }
        } else {
            $statusValue = 5;
            $statusMsg = "No Response.";
            $log->logData(LOG_INFO, $statusMsg);
        }
    } catch (Exception $e) {
        array_push($errorList, sprintf("<error>%d: %s</error>", $e->getCode(), $e->getMessage() ) );
	    $replyReceived = "<Data_Summary></Data_Summary>";
    }

  $client->disconnect($zmqConnect);
  unset($context);

  return (addStatusAndErrors($statusValue, $replyReceived, $errorList));
}

function zmqRequestPortExplicit($log, $ExplicitPort, $cmd, $valueName, $expectedResponseRoot, $requestType, $newValue = NULL)
{
    // global $log;
    $errorList = [];
    $replyReceived = "<Data_Summary></Data_Summary>";
    $statusValue = 5; // no response

    if ($requestType != "get") {
        $errorMsg = sprintf("COMMAND=\"%s\" id=\"%s\" requestType=\"set\" is NOT_IMPLEMENTED\"", $cmd, $valueName);
        $log->logData(LOG_WARNING, $errorMsg);

        return ("<request>" . $errorMsg . "<status>1</status></request>");
    }

    try {
        $context = new ZMQContext();
        $zmqConnect = "tcp://127.0.0.1:" . $ExplicitPort;

        $log->logData(LOG_DEBUG, "ZMQ Port explicit Connect: " . $zmqConnect);
        $client = new ZMQSocket($context, ZMQ::SOCKET_REQ);

        $log->logData(LOG_DEBUG, "before \$client->connect(\$zmqConnect)");
        $client->connect($zmqConnect);

        $log->logData(LOG_DEBUG, "before \$client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0)");
        $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);  //  Configure socket to not wait at close time

        $xmlRequest = sprintf(THE_GET_REQUEST_TEMPLATE, $cmd, $valueName);
        $log->logData(LOG_DEBUG, "Request:\n" . $xmlRequest);

        $read = $write = array();

        //  We send a request, then we work to get a reply
        $log->logData(LOG_DEBUG, "Before \$client->send(\$xmlRequest)");
        $ret = $client->send($xmlRequest);

        //  Poll socket for a reply, with timeout
        $log->logData(LOG_DEBUG, "Before new ZMQPoll()");
        $poll = new ZMQPoll();
        $log->logData(LOG_DEBUG, "Before \$poll->add(\$client, ZMQ::POLL_IN)");
        $poll->add($client, ZMQ::POLL_IN);

        $log->logData(LOG_DEBUG, "Before \$poll->poll(\$read, \$write, REQUEST_TIMEOUT)");
        $events = $poll->poll($read, $write, REQUEST_TIMEOUT);

        //  If we got a reply, process it
        if ($events > 0) {
            $log->logData(LOG_DEBUG, "Before \$client->recv()");
            $replyReceived = $client->recv();
            $log->logData(LOG_DEBUG, "\$client->recv(): " . strlen($replyReceived) . "bytes");
            if (isValidResponse($replyReceived, $expectedResponseRoot)) {
                $statusValue = 0; // Success
                $statusMsg = "" . strlen($replyReceived) . " bytes";
                $statusMsg = "Valid response from server:\n" . $statusMsg;
                $log->logData(LOG_DEBUG, $statusMsg);
            } else {
                $statusValue = 4;
                $statusMsg = "malformed reply from server:\n" . $replyReceived;
                $log->logData(LOG_INFO, $statusMsg);
            }
        } else {
            $statusValue = 5;
            $statusMsg = "No Response.";
            $log->logData(LOG_INFO, $statusMsg);
        }
    } catch (Exception $e) {
        array_push($errorList, sprintf("<error>%d: %s</error>", $e->getCode(), $e->getMessage()));
        $replyReceived = "<Data_Summary></Data_Summary>";
    }

  $client->disconnect($zmqConnect);
  unset($context);

  return (addStatusAndErrors($statusValue, $replyReceived, $errorList));
}

function isValidResponse($xml, $rootName)
{
    $tagStart = sprintf("/<%s[ \/>]/", $rootName);
    return (preg_match($tagStart, $xml, $matches, PREG_OFFSET_CAPTURE));
}

function suiRequest($slogger, $fileName, $DataPortPrefix, $cmd = "EXPORT_DATA")
{
    $slogger->logData(LOG_VERBOSE, "suiRequest()");

    $props = loadPropsFile($fileName);


    $DataServiceEnabled = propOrDefault($props, $DataPortPrefix . ".enabled", "1");
    if (strcmp("0",  $DataServiceEnabled) == 0) {

        echo('<?xml version="1.0" encoding="UTF-8"?>');
        echo("<Data_Summary>");
        echo(errorToXml("1005", "suiRequest"));
        echo("</Data_Summary>");
        return;
    }

    $slogger->logData(LOG_VERBOSE, "Before zmqRequest()");

    $expectedResponseRoot = 'Data_Summary';
    $response = zmqRequest($props, $DataPortPrefix, $cmd, $valueName, $expectedResponseRoot, "get");

    $slogger->logData(LOG_VERBOSE, "Before isXMLrequest()");

    if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
        // Nothing to do -- already have XML
    } else {
        // Default is to return JSON
        $response = XmlDiffTool::xmlToJSON($response, "");
    }

    echo $response;

    $slogger->logData(LOG_VERBOSE, "sui_data.php Finished.\n");
}

//Port is explicitly defined
function suiRequestPortExplicit($slogger, $explicitPort, $cmd = "EXPORT_DATA", $valueName = "")
{
    $slogger->logData(LOG_VERBOSE, "suiRequestPortExplicit()");
    $slogger->logData(LOG_DEBUG, "Port number is " . $explicitPort);

    if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
        echo '<?xml version="1.0" encoding="UTF-8"?>';
    }


    $slogger->logData(LOG_VERBOSE, "Before zmqRequest()");

    $expectedResponseRoot = 'Data_Summary';
    $response = zmqRequestPortExplicit($slogger, $explicitPort, $cmd, $valueName, $expectedResponseRoot, "get");

    $slogger->logData(LOG_VERBOSE, "Before isXMLrequest()");

    if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
        // Nothing to do -- already have XML
    } else {
        // Default is to return JSON
        $response = XmlDiffTool::xmlToJSON($response, "");
    }


  echo $response;

    $slogger->logData(LOG_VERBOSE, "sui_data.php Finished.\n");
}
