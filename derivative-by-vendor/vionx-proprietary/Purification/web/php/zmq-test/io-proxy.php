<?php
/*
 *  proxy to client on a different system.
 *
 *  Receives request on tcp://10.0.5.221:6556
 *  Forwards request to  tcp://localhost:5556
 *  Responds with the return from the forwarded request.
 * @author Jim Scarsdale
 */

define("ZMQ_CONNECT_CLIENT", "tcp://127.0.0.1:5556");
define("ZMQ_CONNECT_SERVER", "tcp://192.168.1.11:6556");

define("REQUEST_TIMEOUT", 3000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 3); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");

define("XML_REQUEST_TEMPLATE", "<request cmd=\"%s\" valueName=\"%s\"/>");    // arg1 - cmd, arg2 - valueName
define("XML_WARNING_RESPONSE", "%s\n<warning>%s</warning>\n");             // arg1 - XML_HEADER, arg2 - warning message
define("XML_ERROR_RESPONSE", "%s\n<error>%s</error>\n");            // arg1 - XML_HEADER, arg2 - error message

function client_socket(ZMQContext $context, $zmqConnect)
{
/*    echo "I: connecting to server…", PHP_EOL; */
    $client = new ZMQSocket($context, ZMQ::SOCKET_REQ);
    $client->connect($zmqConnect);

    //  Configure socket to not wait at close time
    $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);

    return $client;
}


function isValidResponse($xml, $rootName)
{
    $tagStart = sprintf("/<%s[ \/>]/", $rootName);
    // printf("tagStart: '%s'\n", $tagStart);
    return (preg_match($tagStart, $xml, $matches, PREG_OFFSET_CAPTURE));
    // return (0 == strncmp($xml, $tagStart, strlen($tagStart)));
}


function isCmd($xml, $cmd)
{
    $cmdPattern = sprintf("/cmd=\"%s\"/", $cmd);
    // printf("cmdPattern: '%s'\n", $cmdPattern);
    return (preg_match($cmdPattern, $xml, $matches, PREG_OFFSET_CAPTURE));
    // return (0 == strncmp($xml, $tagStart, strlen($tagStart)));
}

printf("isValidResponse(): %d", isValidResponse("<ioTemplate>xxx", "ioTemplate"));

$context = new ZMQContext();

/*  Socket to talk to server on localhost */
echo "Connecting to proxy server...\n";
printf("  Receives request on %s\n", ZMQ_CONNECT_SERVER);
printf("  Forwards request to %s\n", ZMQ_CONNECT_CLIENT);
echo "  Responds with the return from the forwarded request\n";

//  Server socket to talk to clients
$responder = new ZMQSocket($context, ZMQ::SOCKET_REP);
$responder->bind(ZMQ_CONNECT_SERVER);
$nthReq = 0;
$simulateRequests = false;

while (true) {
    //  Wait for next request from client
    $request = $responder->recv();
    $nthReq++;
    printf ("\nReceived request #%d: [%s]\n", $nthReq, $request);

    //  Do some 'work'
    sleep (1);


    if ($simulateRequests) {
        if (isCmd($request, "ioTemplate")) {
        $reply = '<ioTemplate><item id="I1_DI_1" type="bool" write="false">...</item><item id="I1_DO_1" type="bool" write="true">...</item><item id="I1_AI_1" type="float" write="false">...</item><item id="I1_AI_2" type="float" write="false">...</item></ioTemplate>';
        } else {
        $reply = "<ioData>some junk</ioData>";
        }
    } else {
        // real requests

        // Forward the request to the local service
        //   Socket to talk to server
        // $context = new ZMQContext();

        printf("\nForward request...<br/>");

        // $ret = $requester->send($request);
        // $reply = $requester->recv();

        $client = client_socket($context, ZMQ_CONNECT_CLIENT);
        $retries_left = REQUEST_RETRIES;
        $read = $write = array();

        $reply = "no answer";
        while ($retries_left) {
            //  We send a request, then we work to get a reply
            $ret = $client->send($request);

            $expect_reply = true;
            while ($expect_reply) {
                //  Poll socket for a reply, with timeout
                $poll = new ZMQPoll();
                $poll->add($client, ZMQ::POLL_IN);
                $events = $poll->poll($read, $write, REQUEST_TIMEOUT);

                //  If we got a reply, process it
                if ($events > 0) {
                    $reply = $client->recv();
                    if (isValidResponse($reply, "ioTemplate")) {
                        echo $reply;
                        $retries_left = 0;
                        $expect_reply = false;
                    } elseif (isValidResponse($reply, "ioData")) {
                        echo $reply;
                        $retries_left = 0;
                        $expect_reply = false;
                    } else {
                        $errMsg = sprintf("malformed reply from server:\n%s\n" + $reply);
                        printf(XML_ERROR_RESPONSE, XML_HEADER, $errMsg);
                        $retries_left = 0;
                        $expect_reply = false;
                    }
                } elseif (--$retries_left == 0) {
                    $expect_reply = false;
                    $reply = sprintf(XML_ERROR_RESPONSE, XML_HEADER, "server seems to be offline, abandoning");
                    printf("E: server seems to be offline, abandoning\n");
                } else {
                    printf("W: No response from server, retrying…\n");

                    //  Old socket will be confused; close it and open a new one
                    $client = client_socket($context, ZMQ_CONNECT_CLIENT);
                    //  Send request again, on new socket
                    $client->send($request);
                }
          }
        }
        printf("\nReply from forwarded request:\n%s\n", $reply);
    }

    //  Send reply back to client
    $responder->send($reply);
}
?>

