<?php
$log_file = "pump-command.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_command.php");

$pumpIndex = "0";

if (array_key_exists("index", $_REQUEST)) {
    $pumpIndex = $_REQUEST["index"];
}


require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LOG_INFO, "Test log message");

$svcName = "PumpService.$pumpIndex";
/*Pass in port num from specified properties file*/
$req = new SimpleUIRequest($log, "/opt/config/PurificationServer.properties", $svcName);
$req->run();

?>
