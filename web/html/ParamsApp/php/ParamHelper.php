<?php

require_once "config.php";

$SvrErrors = array(
    "1001" => "Empty filename",
    "1002" => "Invalid error code (%d)",
    "1003" => "Invalid file (%s) in request.",
    "1004" => "Invalid response from server."
);

function propOrDefault($props, $prop, $default) {
    if (array_key_exists($prop, $props)) {
        $val = $props[$prop];
    } else {
        $val = $default;
    }
    return $val;
}

function writeError($statusCode, $errorCode, $errorMsg, $errorContext) {
	echo("{\n\"status\": \"$statusCode\",");
	echo("\n  \"error\": {");
	echo("\n    \"code\": \"$errorCode\",");
	echo("\n    \"msg\": \"$errorMsg\",");
	echo("\n    \"context\": \"$errorContext\"");
	echo("\n  }\n}\n");
}

function loadConfigPropsFromFile($inFile)
{
    $inFile = fopen($inFile, "r") or die("Unable to open file $inFile!");
    $allProps = "";
    while (($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "#") {
            $allProps .= $line .= "\n";
        }
    }
    fclose($inFile);
    return parse_ini_string($allProps, true, INI_SCANNER_RAW);
}

function loadAppProperties()
{
    // See config.php
    global $CONFIG_PROPS_FILENAME;

    // If the CONFIG_PROPS_FILENAME hasn't been set we need to grab it from the environment
    if (empty($CONFIG_PROPS_FILENAME)) {
        $CONFIG_PROPS_FILENAME = getenv("PARAMSAPP_PROPERTIES_FILENAME", true);
        // If it's still not defined then throw an error
        if (empty($CONFIG_PROPS_FILENAME)) {
            die("PARAMSAPP_PROPERTIES_FILENAME not defined");
        }
    }

    $ConfigProperties = loadConfigPropsFromFile($CONFIG_PROPS_FILENAME);

    $ControlsParamTable = $GLOBALS["ControlsParamTable"] = propOrDefault($ConfigProperties, "Controls.param.table", "Parameter");
    $ControlsParamAbstractPrefix = $GLOBALS["ControlsParamAbstractPrefix"] = propOrDefault($ConfigProperties, "Controls.param.abstract_prefix", "Abstract");
    $ControlsParamDataPrefix =  $GLOBALS["ControlsParamDataPrefix"] = propOrDefault($ConfigProperties, "Controls.param.data_prefix", "Data");

    $GLOBALS["DataParameterTable"] = "$ControlsParamDataPrefix$ControlsParamTable";
    $GLOBALS["AbstractParameterTable"] = "$ControlsParamAbstractPrefix$ControlsParamTable";

    $GLOBALS['MYSQL_USER'] = $ConfigProperties["DatabaseMgr.MYSQL_USER"];
    $GLOBALS['MYSQL_PWD'] = $ConfigProperties["DatabaseMgr.MYSQL_PWD"];
    $GLOBALS['MYSQL_HOST'] = $ConfigProperties["DatabaseMgr.MYSQL_HOST"];

    // dbName override from simpleui CLI
    if (! empty($_GET['database'])) {
        $GLOBALS['MYSQL_DB'] = $_GET['database'];
    } else {
        $GLOBALS['MYSQL_DB'] = $ConfigProperties["DatabaseMgr.MYSQL_DB"];
    }
}

loadAppProperties();
