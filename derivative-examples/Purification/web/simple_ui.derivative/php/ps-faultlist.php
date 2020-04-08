<?php
$log_file = "ps-faultlist.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_data.php");
require_once (dirname(__FILE__) . "/sLogger.php");
$log->setLevel(6);

/*Pass in port num from specified properties file*/
suiRequest($log, "/opt/config/PurificationServer.properties", "PurificationDataService", "FaultList");

?>
