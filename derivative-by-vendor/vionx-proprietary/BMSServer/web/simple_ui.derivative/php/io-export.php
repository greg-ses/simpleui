<?php
$log_file = "io-export.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once($SCRIPT_PATH . "/sui_helper.php");
//require_once($SCRIPT_PATH . "/sui_command.php");
require_once($SCRIPT_PATH . "/sui_csv.php");

require_once($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LOG_INFO, "io-export called.");


    /*Pass in port num from specified properties file*/
$req = new SimpleUI_CSV_Request($log, "/opt/config/BMSServer.properties", "UnitDataService");

$req->run('<?xml version="1.0" encoding="UTF-8"?>
<request COMMAND="ModuleIODataCSV" cmd="ModuleIODataCSV" desc="Export contianer IO to CSV" dest="1" disabled="false" idnum="0" label="Export to CSV"></request>');

?>
