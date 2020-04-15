<?php
/*
*  Hello World client
*  Connects REQ socket to tcp://localhost:5555
*  Sends "Hello" to server, expects "World" back
* @author Ian Barber <ian(dot)barber(at)gmail(dot)com>
*/
echo "<html>
<body>
Starting ZMQ Example<br/>";

$context = new ZMQContext();

//  Socket to talk to server
echo "Connecting to hello world server v 12...<br/>";
$requester = new ZMQSocket($context, ZMQ::SOCKET_REQ);
//$requester->connect("tcp://10.0.5.251:5556");
$requester->connect("tcp://10.0.5.171:5556");

printf("start sending requests...<br/>");

$request_nbr = 1;
printf ("Sending request %d<br/>", $request_nbr);
$ret = $requester->send("Hello");
$reply = $requester->recv();
printf ("Received reply %d: [%s]<br/>", $request_nbr, $reply);

$request_nbr = 2;
printf ("Sending request %d<br/>", $request_nbr);
$requester->send("G'day!");

$reply = $requester->recv();
printf ("Received reply %d: [%s]<br/>", $request_nbr, $reply);


echo "</body>
</html>";
?>

