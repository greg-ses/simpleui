<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 2017/08/04
 * Time: 02:18 PM
 *
 * Read the .css file stored in /var/www/APPNAME/overlay-N/image-overlays.css, which
 * must be merged from a simple_ui derivative which includes an external overlays.tgz file.
 */

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);
$APP_DIR = dirname($SCRIPT_PATH); // assume it's the parent of the php folder
$CSS_FILE_NAME = $APP_DIR . "/overlay-" . $_REQUEST['nthOverlay'] ."/image-overlays.css";

$SERVER_ERRORS = array(
    "1001" => "Empty filename",
    "1002" => "Invalid error code (%d)",
    "1003" => "Invalid file (%s) in request.",
    "1005" => "No response from server."
);

function errorToJSON($statusCode, $errorContext, $subElem = "") {
    global $SERVER_ERRORS;
    return errorToJSON5($statusCode, $statusCode, $SERVER_ERRORS[$statusCode], $errorContext, $subElem);
}

function errorToJSON5($statusCode, $errorCode, $errorMsg, $errorContext, $subElem = "") {
    $outXML =
        "{'status': {" .
        "  'value': '$statusCode'," .
        "  'error': {'code': '$errorCode', 'context': '$errorContext', 'msg': '$errorMsg' }," .
        "  'subElem': '$subElem'" .
        "'}";
    return $outXML;
}

/* Load .css file */
function loadElemNamesFromCssFile($cssFileName)
{
    $cssElemDefs = array();
    $elemNameRegEx = "/[ \t]*#([0-9a-zA-Z.≪≫_-]+)[ \t]*\{[ \t]*([^\}]*)[ \t]*\}/";
    $matches = null;

    $inFile = fopen("$cssFileName", "r") or die(printf('{"CSS_Elements": [ "%s" ]}', $cssFileName));
    while ( ($line = fgets($inFile, 4096)) !== false) {
        if ($line[0] != "\n") {
            $numMatches = preg_match($elemNameRegEx, $line, $matches);
            if ($numMatches == 1) {
                $cssElemDefs[$matches[1]] = trim($matches[2]);
            }
        }
    }
    fclose($inFile);

    //sort($cssElemDefs);

    return $cssElemDefs;
}

function main()
{
    global $CSS_FILE_NAME;
    $cssElemDefs = loadElemNamesFromCssFile($CSS_FILE_NAME);

    echo '{ "CSS_Elements": ' . json_encode($cssElemDefs) . '}';
}

main();

