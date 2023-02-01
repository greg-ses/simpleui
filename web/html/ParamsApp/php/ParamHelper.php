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
    $response = array(
        status => $statusCode,
        error => array(
            code => $errorCode,
            msg => $errorMsg,
            context => $errorContext
        )
    );
    echo json_encode($response, JSON_PRETTY_PRINT);
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


/**
 * checks if a string is a bool
 * @param string $txt
 * @return bool
 */
function is_string_bool(string $txt): bool {
    return (strtolower($txt) === 'true') || (strtolower($txt) === 'false');
}

/**
 * checks if a string is a integer
 * @param string $txt
 * @return bool
 */
function is_string_int(string $txt): bool {
    return is_numeric($txt) && intval($txt) == $txt && !strpos($txt, '.');
}

/**
 * checks if string is a float. Also needs to allow ints
 * @param string $txt
 * @return bool
 */
function is_string_float(string $txt): bool {
    return (is_numeric($txt) && strpos($txt, '.')) || is_string_int($txt);
}

/**
 * checks if string is a float
 * @param string $txt
 * @return bool
 */
function is_string_double(string $txt): bool {
    return is_string_float($txt);
}

/**
 * Checks if the $user_input is of type $allowed_type and
 * is between $minimum_value and maximum_value if applicable
 * @param string $user_input
 * @param string $allowed_type
 * @param $minimum_value
 * @param $maximum_value
 * @return bool
 */
function is_user_input_valid(string $user_input, string $allowed_type, $minimum_value = null, $maximum_value = null): bool {
    switch ($allowed_type) {
        case 'bool':
            return is_string_bool($user_input);
        case 'int':
            $correct_type = is_string_int($user_input);
            break;
        case 'float':
            $correct_type = is_string_float($user_input);
            break;
        case 'double':
            $correct_type = is_string_double($user_input);
            break;
        case 'string':
            return true;
        default:
            return false;
    }
    if(isset($minimum_value) && isset($maximum_value)) {
        $above_minimum = $user_input >= $minimum_value;
        $below_maximum = $user_input <= $maximum_value;
        return $correct_type && $above_minimum && $below_maximum;
    } else {
        return $correct_type;
    }
}

loadAppProperties();
