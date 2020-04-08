<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 5/25/16
 * Time: 17:51 PM
 */

$ModSvrErrors = array(
    "1001" => "Empty filename",
    "1002" => "Invalid error code (%d)",
    "1003" => "Invalid file (%s) in request.",
    "1004" => "In ModuleServer.properties, BMCDataService.enabled is set to false.",
    "1005" => "Invalid response from server."
);

function getRandomNthFilenameVersion($fn, $numVersions = 0) {
    /* Return $fn, randoming adding one of .0  .1  .2  .3  etc before the file extension*/

    if ($numVersions <= 0) {
        /* No (or invalid) versions */
        return $fn;
    }

    /* Multiple file versions exist - choose one. */
    $v = time() % $numVersions;  // randomly get a version
    $pi = pathinfo($fn);
    $bn = $pi["basename"];
    $ext = "." . $pi["extension"];
    $newExt = "." . $v . $ext;
    $newBn = str_replace($ext, $newExt, $bn);
    $newFn = str_replace($bn, $newBn, $fn);

    if (file_exists($newFn)) {
        return $newFn;
    }

    return $fn;
}

function getXmlErrorMessages(&$outErrMsg, $errorsToIgnore = array()) {
    $outErrCode = 0;
    $outErrMsg = "";
    foreach (libxml_get_errors() as $error) {
        if (in_array($errCode, $errorsToIgnore)) {
            continue;
        }
        $outErrMsg .= "\nLibxml error ({$error->code}): {$error->message}";
        if ($errCode == 0) {
            $errCode = "{$error->code}";
        }
    }
    return $outErrCode;
}

function validateAndEchoXmlFile($fileName, $caller) {
    // $outErrorXml = "<status value=\"0\"></status>";   // Default XML status is success unless changed inline below.
    $isValid = true;
    $errCode = 0;

    if (empty($fileName)) {
        echo(errorToXml5("1001", "1001", "Empty filename", $caller));
        $isValid = false;
    } else {
        // Protect against hacker browsing outside test folder
        $fileName = basename($fileName);
        if ((substr($fileName, strlen($fileName)-4, 4) == ".xml") && file_exists($fileName)) {

            libxml_use_internal_errors(true);

            $xml = simplexml_load_file($fileName);
            if ($xml) {
                echo $xml->asXML();
            } else {
                $xmlErrors = "";
                $xmlErrorsToIgnore = array();
                $errCode = getXmlErrorMessages($xmlErrors, $xmlErrorsToIgnore);
                $errMsg = sprintf("Invalid content in file %s.", $fileName);
                $errMsg .= $xmlErrors;
                echo(errorToXml5($errCode, $errCode, $errMsg, $caller));
            }


            libxml_use_internal_errors(false);
        } else {
            $errMsg = sprintf("Invalid file (%s) in request.", $fileName);
            echo(errorToXml5("1003", "1003", $errMsg, $caller));
            $isValid = false;
        }
    }

    return $isValid;
}

function errorToXml($statusCode, $errorContext, $subElem = "") {
    global $ModSvrErrors;
    return errorToXml5($statusCode, $statusCode, $ModSvrErrors[$statusCode], $errorContext, $subElem);
}

function errorToXml5($statusCode, $errorCode, $errorMsg, $errorContext, $subElem = "") {
    $outXML =
        "<status value=\"$statusCode\">\n" .
        "  <error code=\"$errorCode\" context=\"$errorContext\">\n" .
        "    <msg>\n" .
        "      $errorMsg\n" .
        "    </msg>\n" .
        "    $subElem\n" .
        "  </error>\n" .
        "</status>\n";
    return $outXML;
}


/* Properties file access functions */
function getModSvrProp($prop, $default = "") {
    global $ModuleServerProperties;
    if (array_key_exists($prop, $ModuleServerProperties)) {
        $val = $ModuleServerProperties[$prop];
    } else {
        $val = $default;
    }
    return $val;
}

/* Load Module Properties file */
function loadModSvrProps()
{
    global $ModuleServerProperties;
    $inFile = fopen("/opt/config/ModuleServer.properties", "r") or die("Unable to open file /opt/config/ModuleServer.properties!");
    $allProps = "";
    while (($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "#") {
            $allProps .= $line .= "\n";
        }
    }
    fclose($inFile);

    $ModuleServerProperties = parse_ini_string($allProps);

    // Example:
    // $ControlsParamTable = getModSvrProp("Controls.param.table", "Parameter");
}


loadModSvrProps();


