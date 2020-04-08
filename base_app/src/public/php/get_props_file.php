<?php
/*
*  Client backend to read the file simple_ui.properties into a javascript structure.
*/

header("Access-Control-Allow-Origin: *");
if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
    header("Content-Type: application/xml; charset=UTF-8");
} else {
    header("Content-Type: application/json; charset=UTF-8");
}

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);
$APP_DIR = dirname($SCRIPT_PATH); // assume it's the parent of the php folder

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/xml-diff-tool.php");

function main($appDir)
{
    // new stuff
    if (array_key_exists("uiProp", $_GET)) {
        $uiProp = trim($_GET["uiProp"]);
    } else {
        $uiProp = "ui";
    }

    $UIProps = loadPropsFile($appDir . "/" . $uiProp . ".properties");
    $UIMacroProps = extractMacros($UIProps);
    replaceMacros($UIProps, $UIMacroProps);


    $response = "<props>\n"
                . UIPropsToXml($UIProps)
                . "</props>\n";

    // Arbitrary change

    if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
        // nothing to do -- already have XML
    } else {
        // Default is to return JSON
        $versionString = "V.xxx";
        if (array_key_exists("version", $_REQUEST)) {
            $versionString = $_REQUEST["version"];
        }
        $response = XmlDiffTool::xmlToJSON($response, "props", $versionString);
    }

    echo $response;
}

main($APP_DIR);

?>
