<?php
$log_file = "io-cmd.php-LOG";

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);
require_once($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(6);
$log->logData(LOG_INFO, "bms-cmd called.");

$jsonIn = file_get_contents('php://input');

$jsonInCounter = 0;

// writeLog('/tmp/my-apache-log.txt', "\njsonIn ["  . $jsonInCounter++ . "]:\n" . $jsonIn);


$standard_process = true;
try {
    $json = json_decode($jsonIn);
    // writeLog('/tmp/my-apache-log.txt', '\njsonIn ['  . $jsonInCounter++ . ']:\n' . $jsonIn);

    if ($json) {
        foreach ($json as $key => $value) {
            if (gettype($value) == "object") {
                $value = "[object]";
            }

            $log->logData(LOG_INFO, "bms-cmd 9 json loop.  key[" . $key . "]  value:[" . $value . "]");

            if ($key == "COMMAND" && $value == "ModuleIODataCSV") {
                $log->logData(LOG_INFO, "Running a CSV requested command");
                $standard_process = false;
            }

        }
    }
} catch (Exception $e) {
    $standard_process = true;
}

if ($standard_process) {

    require_once($SCRIPT_PATH . "/sui_helper.php");
    require_once($SCRIPT_PATH . "/sui_command.php");

    /*Pass in port num from specified properties file*/
    $req = new SimpleUIRequest($log, "/opt/config/BMSServer.properties", "UnitDataService");
    $req->run();

} else {

    require_once($SCRIPT_PATH . "/sui_helper.php");
    require_once($SCRIPT_PATH . "/sui_csv.php");

    /*Pass in port num from specified properties file*/
    $req = new SimpleUI_CSV_Request($log, "/opt/config/BMSServer.properties", "UnitDataService");
    $req->run();
}

?>
