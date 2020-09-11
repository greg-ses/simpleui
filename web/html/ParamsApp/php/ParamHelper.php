<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 4/11/16
 * Time: 2:04 PM
 */

$PROPS_FILE_REDIRECTOR="/var/www/bsc/html/ParamsApp/Parameters.properties";
$PROPS_FILE_DEFAULT="/opt/config/BSCServer.properties";

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
    /* Load the Config Properties file into the global variable $ConfigProperties */
    global $ConfigProperties;
    $inFile = fopen($inFile, "r") or die("Unable to open file $inFile!");
    $allProps = "";
    while (($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "#") {
            $allProps .= $line .= "\n";
        }
    }
    fclose($inFile);

    $ConfigProperties = parse_ini_string($allProps, true, INI_SCANNER_RAW);
}

function loadBSCProperties()
{
    /* Load the Base Config Properties file, which contains only a reference
     * to the actual config file whose properties will be used.
     */
    global $PROPS_FILE_REDIRECTOR;
    global $PROPS_FILE_DEFAULT;
    global $ConfigProperties;

    loadConfigPropsFromFile($PROPS_FILE_REDIRECTOR);
    $actualPropsFile = propOrDefault($ConfigProperties, "Properties.filename", $PROPS_FILE_DEFAULT);

    loadConfigPropsFromFile($actualPropsFile);

    $ControlsParamTable = $GLOBALS["ControlsParamTable"] = propOrDefault($ConfigProperties, "Controls.param.table", "Parameter");
    $ControlsParamAbstractPrefix = $GLOBALS["ControlsParamAbstractPrefix"] = propOrDefault($ConfigProperties, "Controls.param.abstract_prefix", "Abstract");
    $ControlsParamDataPrefix =  $GLOBALS["ControlsParamDataPrefix"] = propOrDefault($ConfigProperties, "Controls.param.data_prefix", "Data");

    $GLOBALS["AbstractParameterTable"] = "$ControlsParamAbstractPrefix$ControlsParamTable";
    $GLOBALS["DataParameterTable"] = "$ControlsParamDataPrefix$ControlsParamTable";
    $GLOBALS['MYSQL_DB'] = $ConfigProperties["DatabaseMgr.MYSQL_DB"];
    $GLOBALS['MYSQL_USER'] = $ConfigProperties["DatabaseMgr.MYSQL_USER"];
    $GLOBALS['MYSQL_PWD'] = $ConfigProperties["DatabaseMgr.MYSQL_PWD"];
    $GLOBALS['MYSQL_HOST'] = $ConfigProperties["DatabaseMgr.MYSQL_HOST"];
}
loadBSCProperties();

/*
echo "\nControlsParamTable: " . $ControlsParamTable;
echo "\nAbstractParameterTable: " . $AbstractParameterTable;
echo "\nDataParameterTable: " . $DataParameterTable;
echo "\nMYSQL_DB: '" . $MYSQL_DB . "'";
echo "\nMYSQL_USER: '" . $MYSQL_USER . "'";
echo "\nMYSQL_PWD: '" . $MYSQL_PWD . "'";
echo "\nMYSQL_HOST: '" . $MYSQL_HOST . "'";
*/