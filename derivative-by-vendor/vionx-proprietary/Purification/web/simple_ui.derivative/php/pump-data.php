<?php
$log_file = "pump-data.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_data.php");

$pumpIndex = "0";

if (array_key_exists("index", $_REQUEST)) {
    $pumpIndex = $_REQUEST["index"];
}

require_once (dirname(__FILE__) . "/sLogger.php");
$log->setLevel(6);

$svcName = "PumpService.$pumpIndex";
/*Pass in port num from specified properties file*/
suiRequest($log, "/opt/config/PurificationServer.properties", $svcName);

?>