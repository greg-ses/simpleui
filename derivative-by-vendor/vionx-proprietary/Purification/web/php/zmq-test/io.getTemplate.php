<?php
/*
*  Simulated io client backend for io.html.
*  Connects REQ socket to tcp://VionxMR1:5556
*  Sends "Hello" to server, expects "World" back
* @author Ian Barber <ian(dot)barber(at)gmail(dot)com>
*/
$zmqConnect = "tcp://10.0.5.167:5557";

$XML_TEMPLATE_REQ = "<request cmd=\"getTemplate\" valueName=\"IO\" />";

$XML_DATA_REQ = "<request cmd=\"getData\" valueName=\"IO\" />";

/*   Socket to talk to server */
$context = new ZMQContext();
$requester = new ZMQSocket($context, ZMQ::SOCKET_REQ);
$requester->connect($zmqConnect);

$ret = $requester->send($XML_TEMPLATE_REQ);
//$ret = $requester->send($XML_DATA_REQ);
$reply = $requester->recv();
echo $reply;

?>

