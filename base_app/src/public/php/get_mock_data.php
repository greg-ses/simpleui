<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 5/17/16
 * Time: 10:14 AM
 */

session_start();

header("Access-Control-Allow-Origin: *");
if ( array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST) ) {
    header("Content-Type: application/xml; charset=UTF-8");
} else {
    header("Content-Type: application/json; charset=UTF-8");
}

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);
$DEFAULT_TEST_FOLDER = dirname($SCRIPT_PATH) . '/mock-data/';
// echo "TEST_FOLDER: $DEFAULT_TEST_FOLDER";

$log_file = "get_mock_data.php-LOG";

require_once ($SCRIPT_PATH . "/sLogger.php");
$log->setLevel(7);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/xml-diff-tool.php");

function createErrorData_Summary($statusCode, $errorCode, $errorMsg, $errorContext, $subElem = "") {
    $outXML =
        "<Data_Summary u_id='1'>\n" .
        "  <status value=\"0\">\n" .
        "  </status>\n" .
        "  <Section name='Setup Error' u_id='2'>\n" .
        "    <DataSets name='Setup Error' u_id='2'>\n" .
        "        <Errors><error code=\"$errorCode\" context=\"$errorContext\">$errorMsg</error></Errors>\n" .
        "    </DataSets>\n" .
        "  </Section>\n" .
        "</Data_Summary>\n";
    return $outXML;
}

function isXmlDataFile($dataFileName)
{
    $retVal = preg_match('/.*\.xml/', $dataFileName, $matches, PREG_OFFSET_CAPTURE);
    return $retVal;
}

function getNextFileName() {
    global $DEFAULT_TEST_FOLDER;

    // Return $fn, adding one of .0  .1  .2  .3  etc before the file extension.
    $fn = $_REQUEST["file"];

    if (array_key_exists("file", $_REQUEST)) {
        if (array_key_exists("versions", $_REQUEST)) {
            // continue
        } else {
            // No "versions" key - return $fn without injecting version
            return $fn;
        }
    } else {
        // No "file" in url search
        return "";
    }

    $versions = $_REQUEST["versions"];

    if ($versions <= 1) {
        // $versions is <= 1 - return $fn without injecting version
        return $fn;
    }

    $mockFilenameVersion = 0;
    if (array_key_exists("ordered", $_REQUEST)) {
        // Choose filenames in order
        if (!array_key_exists("mockFilenameVersion", $_SESSION)) {
            $_SESSION["mockFilenameVersion"] = 0;
            if (array_key_exists("repeat-last", $_REQUEST)) {
                $_SESSION["repeat-last-count"] = 0;
            }
        } else {
            if (   (($_SESSION["mockFilenameVersion"] + 1) == $versions)
                && array_key_exists("repeat-last", $_REQUEST)
                && ($_SESSION["repeat-last-count"] < $_REQUEST["repeat-last"])) {

                // It's the last mockFilenameVersion and there's a repeat-last-count < repeat-last
                $_SESSION["repeat-last-count"] = ($_SESSION["repeat-last-count"] + 1) % $versions;
            } else {
                $_SESSION["mockFilenameVersion"] = ($_SESSION["mockFilenameVersion"] + 1) % $versions;
                $_SESSION["repeat-last-count"] = 0;
            }
        }
        $mockFilenameVersion = $_SESSION["mockFilenameVersion"];
    } else {
        // Choose a random nth-version of the file
        $mockFilenameVersion = time() % $versions;  // randomly get a version
    }

    $pi = pathinfo($fn);
    $fileExt = "." . $pi["extension"];
    $fileExtWithVersion = "." . $mockFilenameVersion . $fileExt;
    $newFn = $DEFAULT_TEST_FOLDER . str_replace($fileExt, $fileExtWithVersion, $fn);

    if (file_exists($newFn)) {
        return $newFn;
    }

    return $DEFAULT_TEST_FOLDER . $fn;
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
function validateAndGetJsonFile($fileName, $caller) {
    global $DEFAULT_TEST_FOLDER;

    if ($fileName == $DEFAULT_TEST_FOLDER) {
        $response = errorToXml5("2001", "2001", "Empty filename", $caller);
        $response = XmlDiffTool::xmlToJSON($response, "Data_Summary");
        return $response;
    } else {

        if ( (substr($fileName, strlen($fileName)-5, 5) == ".json") && file_exists($fileName) ) {

            $inFile = fopen($fileName, "r") or die('{"Missing_file": "' . $fileName . '"}');
            $fileContent = fread($inFile, filesize($fileName));
            fclose($inFile);

            if ($fileContent) {
                $newTime = time() . '000';
                if (0 < preg_match('/"timeStamp":[ \t\n]*\{[ \t\n]*"u_id":[ \t\n]*"[0-9]+",[ \t\n]*"value":[ \t\n]*"([0-9]+)"[ \t\n]*\}/', $fileContent, $matches)) {
                    $newTimestamp = str_replace($matches[1], $newTime, $matches[0]);
                    $fileContent = str_replace($matches[0], $newTimestamp, $fileContent);
                }
                return $fileContent;
            } else {
                $errMsg = sprintf("No content in file %s.", $fileName);
                $response = errorToXml5("2001", "2001", $errMsg, $caller);
                $response = XmlDiffTool::xmlToJSON($response, "Data_Summary");
                return $response;
            }

        } else {
            $errMsg = sprintf("Invalid file (%s) in request.", $fileName);
            $response = errorToXml5("2003", "2003", $errMsg, $caller);
            $response = XmlDiffTool::xmlToJSON($response, "Data_Summary");
            return $response;
        }
    }

    return false;
}

function validateAndGetXmlFile($fileName, $caller) {
    global $DEFAULT_TEST_FOLDER;

    # echo "fileName: " . $fileName;
    // $outErrorXml = "<status value=\"0\"></status>";   // Default XML status is success unless changed inline below.
    $isValid = true;
    $errCode = 0;

    if (empty($fileName)) {
        return(errorToXml5("1001", "1001", "Empty filename", $caller));
        //$isValid = false;
    } else {
        // Protect against hacker browsing outside test folder
        $fileName = $DEFAULT_TEST_FOLDER . basename($fileName);
        if ( (substr($fileName, strlen($fileName)-4, 4) == ".xml") && file_exists($fileName) ) {

            libxml_use_internal_errors(true);

            $xml = simplexml_load_file($fileName);
            if ($xml) {
                return preg_replace("(\d+\x3c\x2f(TimeStamp)\x3e)i", time() . "000</$1>", $xml->asXML(), 1);
            } else {
                $xmlErrors = "";
                $xmlErrorsToIgnore = array();
                $errCode = getXmlErrorMessages($xmlErrors, $xmlErrorsToIgnore);
                $errMsg = sprintf("Invalid content in file %s.", $fileName);
                $errMsg .= $xmlErrors;
                return (errorToXml5($errCode, $errCode, $errMsg, $caller));
            }


            libxml_use_internal_errors(false);
        } else {
            $errMsg = sprintf("Invalid file (%s) in request.", $fileName);
            return (createErrorData_Summary("1003", "1003", $errMsg, $caller));
            // $isValid = false;
        }
    }

    return $isValid;
}

/*
function parseIniString($propsString) {
    $props = array();
}
*/

function main()
{
    global $SCRIPT_PATH, $DEFAULT_TEST_FOLDER;

    // $UiProperties = loadPropsFile($SCRIPT_PATH . "../../ui.properties");

    $dataFileName = getNextFileName();

    if ($dataFileName == $DEFAULT_TEST_FOLDER) {
        $response = createErrorData_Summary("1008", "1008", "Missing / incorrect 'file=' or 'versions=' in URL.", "get_mock_data.php");
    } else {
        if (isXmlDataFile($dataFileName)) {
            $response = validateAndGetXmlFile($dataFileName, "get_mock_data.php");

            if (!isXMLrequest()) {
                $response = XmlDiffTool::xmlToJSON($response, "Data_Summary");
            }

        } else {
            $response = validateAndGetJsonFile($dataFileName, "get_mock_data.php");
        }
    }
    echo $response;
}

main();

?>
