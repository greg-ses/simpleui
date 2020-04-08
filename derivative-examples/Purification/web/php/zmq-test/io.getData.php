<?php
$zmqConnect = "tcp://127.0.0.1:5556";
$request = '<request cmd="getData" valueName="IO"/>';

/*   Socket to talk to server */
$context = new ZMQContext();
$requester = new ZMQSocket($context, ZMQ::SOCKET_REQ);
$requester->connect($zmqConnect);

/* #printf("start sending requests...<br/>") */

$ret = $requester->send($request);
$reply = $requester->recv();
echo $reply;

?>

