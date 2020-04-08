<?php
if ($argc != 2) {
	printf("E: expected one argument but received %d\n", ($argc - 1));
	exit(1);
}

$zmqConnect = "tcp://127.0.0.1:5556";
$request = sprintf('<request cmd="setValue" valueName="IO" id="I1_DO_1" value="%s"/>', $argv[1]);

echo "sending request: $request\n";

/*   Socket to talk to server */
$context = new ZMQContext();
$requester = new ZMQSocket($context, ZMQ::SOCKET_REQ);
$requester->connect($zmqConnect);

$ret = $requester->send($request);
$reply = $requester->recv();
echo $reply;

?>

