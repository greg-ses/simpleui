<?php
$log_file = "test-runner.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sui_command.php");
require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LOG_INFO, "test-runner called.");

/*Pass in port num from specified properties file*/
$simpleUIRequest = new SimpleUIRequest($log, "/opt/config/BMSServer.properties", "BMSDataService");

$xml = $simpleUIRequest->getXmlFromJsonArgs();
// $xml = "<hello>world</hello>";
header("Content-Type: application/xml; charset=UTF-8");
echo $xml;

