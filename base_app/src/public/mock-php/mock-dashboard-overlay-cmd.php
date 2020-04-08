<?php
$log_file = "mock-dashboard-overlay-cmd.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_command.php");

require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LOG_INFO, "Test log message");

/*Pass in port num from specified properties file*/
$req = new SimpleUIRequest($log, "/opt/config/PurificationServer.properties", "PurificationDataService");
$req->run();

?>
