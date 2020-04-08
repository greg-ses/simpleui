<?php
/*
*  Client backend to request template data from the module server for dashboard.html.
*/
$log_file = "get-bsc-template.php-LOG";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");
require_once "php/sLogger.php";
$log->setLevel(7);

require_once "php/BscHelper.php";

define("REQUEST_TIMEOUT", 2000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 2); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");

define("XML_GET_REQUEST_TEMPLATE", "<request COMMAND=\"%s\" valueName=\"%s\"/>");    // arg1 - cmd, arg2 - valueName
define("XML_SET_REQUEST_TEMPLATE", "<request COMMAND=\"%s\" valueName=\"NOT_IMPLEMENTED\" id=\"%s\" value=\"%s\"/>");    // arg1 - cmd, arg2 - id, arg3 - new value
define("XML_WARNING_RESPONSE", "%s<warning>%s</warning>");                       // arg1 - XML_HEADER, arg2 - warning message
define("XML_ERROR_RESPONSE", "%s<error>%s</error>");                             // arg1 - XML_HEADER, arg2 - error message


/*
 * client_socket()
 * Helper function that returns a new configured socket to zmqRequest.
 */

function client_socket(ZMQContext $context, $zmqConnect)
{
    // echo "I: connecting to server…", PHP_EOL;
    $client = new ZMQSocket($context, ZMQ::SOCKET_REQ);
    $client->connect($zmqConnect);

    //  Configure socket to not wait at close time
    $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);

    return $client;
}

function addStatus($xmlIn)
{
    if (!strpos($xmlIn, "<status>")) {
        return str_replace("</Data_Summary>", "<status>0</status></Data_Summary>", $xmlIn);
    }
}


// zmqRequest($props,  cmd = "EXPORT_DATA", valueName = "BMS", expectedResponseRoot = "Data_Summary", response = "get");
// "XML_GET_REQUEST_TEMPLATE", "<request COMMAND=\"%s\" valueName=\"%s\"/>"
// <request COMMAND=\"EXPORT_DATA\" valueName=\"BMS\"/>

function zmqRequest($props, $cmd, $valueName, $expectedResponseRoot, $requestType, $newValue=NULL)
{
    $context = new ZMQContext();

    // $zmqConnect = "tcp://127.0.0.1:5561";
    $zmqConnect = sprintf("tcp://127.0.0.1:%s", propOrDefault($props, "BMSDataService.data.port", "5560"));

    $client = client_socket($context, $zmqConnect);

    $retries_left = REQUEST_RETRIES;
    $read = $write = array();

    $xmlRequest = "none";
    if ($requestType == "get") {
        $xmlRequest = sprintf(XML_GET_REQUEST_TEMPLATE, $cmd, $valueName);
    } elseif ($requestType == "set") {
        $xmlRequest = sprintf(XML_SET_REQUEST_TEMPLATE, $cmd, $valueName, $newValue);
    }

    $reply = "";
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
                    $reply .= "\n    <unexpected-response>\n      " . $reply . "    </unexpected-response>";
                }
            } elseif (--$retries_left == 0) {
                $expect_reply = false;
                $reply =
                    "\n<Data_Summary>\n" .
                        errorToXml("1005", $caller, $reply) .
                    "\n</Data_Summary>\n";
            } else {
                // $this->log->logData(LOG_VERBOSE, "W: No response from server, retrying…");

                //  Old socket will be confused; close it and open a new one
                $client = client_socket($context, $zmqConnect);

                //  Send request again, on new socket
                // $this->log->logData(LOG_VERBOSE, "Resending xmlRequest: %s\n", $xmlRequest);
                $client->send($xmlRequest);
            }

        }
    }
    return (addStatus($reply));
}

function isValidResponse($xml, $rootName)
{
    $tagStart = sprintf("/<%s[ \/>]/", $rootName);
    return (preg_match($tagStart, $xml, $matches, PREG_OFFSET_CAPTURE));
}

function main()
{
    loadBMSProperties($props);

    echo '<?xml version="1.0" encoding="UTF-8"?>';

    $BMCDataServiceEnabled = propOrDefault($props, "BMSDataService.enabled", "1");
    if (strcmp("0",  $BMCDataServiceEnabled) == 0) {
        echo("<Data_Summary>");
        echo(errorToXml("1004", $caller));
        echo("</Data_Summary>");
        return;
    }

    $cmd = "EXPORT_DATA";
    $valueName = "BMS"; // Formerly "BMS"
    $expectedResponseRoot = 'Data_Summary';
    $response = zmqRequest($props, $cmd, $valueName, $expectedResponseRoot, "get");

    echo $response;

    //-

}

main();

?>
