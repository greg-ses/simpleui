<?php
$log_file = "heaters-command.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_command.php");
require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LOG_INFO, "heaters-command called.");

/*Pass in port num from specified properties file*/
$req = new SimpleUIRequest($log, "/opt/config/ChillersAndHeaters.properties", "Heaters");
$req->run();

?>
