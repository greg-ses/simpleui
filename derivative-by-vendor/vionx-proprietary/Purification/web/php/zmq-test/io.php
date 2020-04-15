<?php
/*
 *  Simulated io client backend for io.html.
 *  Connects REQ socket to tcp://VionxMR1:5556
 * @author Jim Scarsdale (based on lazy-pirate.php)
 */

// Parameters (TODO)
// define("cmd", "getTemplate");
// define("valueName", "IO");
define("cmd", "getData");
define("valueName", "IO");
define("expectedResponseRoot", "ioData");

//define("zmqConnect", "tcp://127.0.0.1:5556");
define("zmqConnect", "tcp://10.0.5.167:5557"); // TODO: remove temporary request to io-proxy.php on module server
define("REQUEST_TIMEOUT", 5000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 3); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");

define("XML_REQUEST_TEMPLATE", "<request cmd=\"%s\" valueName=\"%s\"/>");       // arg1 - cmd, arg2 - valueName
define("XML_WARNING_RESPONSE", "%s\n<warning>%s</warning>\n");                  // arg1 - XML_HEADER, arg2 - warning message
define("XML_ERROR_RESPONSE", "%s\n<error>%s</error>\n");                        // arg1 - XML_HEADER, arg2 - error message

/*
* Helper function that returns a new configured socket
* connected to the Hello World server
*/
function client_socket(ZMQContext $context, $zmqConnect)
{
/*    echo "I: connecting to server…", PHP_EOL; */
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
    // return (0 == strncmp($xml, $tagStart, strlen($tagStart)));
}

$context = new ZMQContext();
$client = client_socket($context, zmqConnect);

$retries_left = REQUEST_RETRIES;
$read = $write = array();

while ($retries_left) {
    //  We send a request, then we work to get a reply
    $xmlRequest = sprintf(XML_REQUEST_TEMPLATE, cmd, valueName);
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
            if (isValidResponse($reply, expectedResponseRoot)) {
                printf("%s%s\n", XML_HEADER, $reply);
                $retries_left = 0;
                $expect_reply = false;
            } else {
                $errMsg = sprintf("malformed reply from server:\n%s\n" + $reply);
                printf(XML_ERROR_RESPONSE, XML_HEADER, $errMsg);
            }
        } elseif (--$retries_left == 0) {
            // printf(XML_ERROR_RESPONSE, XML_HEADER, "server seems to be offline, abandoning");
            printf("E: server seems to be offline, abandoning\n");
            break;
        } else {
            // printf(XML_WARNING_RESPONSE, XML_HEADER, "No response from server, retrying…");
            printf("W: No response from server, retrying…\n");

            //  Old socket will be confused; close it and open a new one
            $client = client_socket($context, zmqConnect);
            //  Send request again, on new socket
            printf("Resending xmlRequest: %s\n", $xmlRequest);
            $client->send($xmlRequest);
        }
    }
}
?>

