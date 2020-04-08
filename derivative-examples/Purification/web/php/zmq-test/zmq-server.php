<?php
/*
*  Hello World server
*  Binds REP socket to tcp://*:5555
*  Expects "Hello" from client, replies with "World"
* @author Ian Barber <ian(dot)barber(at)gmail(dot)com>
*/

$context = new ZMQContext(1);

//  Socket to talk to clients
$responder = new ZMQSocket($context, ZMQ::SOCKET_REP);
$responder->bind("tcp://10.0.5.171:5556");
$nthReq = 0;

while (true) {
    //  Wait for next request from client
    $request = $responder->recv();
    $nthReq++;
    printf ("Received request #%d: [%s]\n", $nthReq, $request);

    //  Do some 'work'
    sleep (1);

    //  Send reply back to client
    $resp = sprintf("%d: World", $nthReq);
    $responder->send($resp);
}
