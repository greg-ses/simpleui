<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 2018/02/16
 * Time: 02:27 PM
 *
 * Update /var/www/APPNAME/overlay-N/image-overlays.css with values from the request.
 *
 */
$log_file = 'update_css_file.php-LOG';

define("RAM_DISK_APACHE_FOLDER", "/var/volatile/tmp/apache2/");
$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sLogger.php");

$log->setLevel(7);

$APP_DIR = dirname($SCRIPT_PATH); // assume it's the parent of the php folder

$SERVER_ERRORS = array(
    "1001" => "Empty filename",
    "1002" => "Invalid error code (%d)",
    "1003" => "Invalid file (%s) in request.",
    "1005" => "No response from server."
);

define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");



class CSSUpdateRequest {
    public $_log;
    public $requestMethod = "";
    public $commandName = "unknown";
    public $commandArgc = "-1";
    public $statusValue = 0;
    public $statusMsg = "";
    public $replyReceived = "";
    public $fileName = "";
    public $DataPortPrefix = "";
    public $props;
    public $nthOverlay = -1;
    public $oldCSS = "";
    public $newCSS = "";
    public $newValueCSS = "";
    public $operation = "";

    function __construct($slogger, $fileName)
    {
        $this->_log = $slogger;
        $this->fileName = $fileName;
        $this->props = loadPropsFile($this->fileName);
    }

    function createXmlResponse()
    {
        $resp = sprintf(
            "<response>\n" .
            "  <SERVER REQUEST_METHOD=\"%s\" />"   .
            "  <command name=\"%s\" argc=\"%d\"></command>\n" .
            "  <status value=\"%d\">%s</status>\n" .
            "  <operation>%s</operation>\n" .
            "  <old-css>%s</old-css>\n" .
            "  <new-css>%s</new-css>\n" .
            "  <new-value-css>%s</new-value-css>\n" .
            "</response>\n",
            $this->requestMethod, $this->commandName, $this->commandArgc,
            $this->statusValue, $this->statusMsg, $this->operation, $this->oldCSS, $this->newCSS, $this->newValueCSS);
        return $resp;
    }

    function run() {

        $this->requestMethod = $_SERVER["REQUEST_METHOD"];
        $this->operation = "unknown";

        if (array_key_exists("nth-overlay", $_REQUEST)) {
            $this->nthOverlay = $_REQUEST["nth-overlay"];
        } else {
            die('<error>Request is missing field "nth-overlay".' . '</error>');
        }

        if (array_key_exists("delete-css", $_REQUEST)) {
            $this->operation = "delete-css";
            $this->newCSS = rtrim($_REQUEST["delete-css"]);
        } elseif (array_key_exists("update-css", $_REQUEST)) {
            $this->operation = "update-css";
            $this->newCSS = rtrim($_REQUEST["update-css"]);
        }


        if (array_key_exists("value-css", $_REQUEST)) {
            $this->newValueCSS = $_REQUEST["value-css"];
        }

        $this->_log->logData(LOG_DEBUG, "Method:" . $this->requestMethod);
        if ($this->requestMethod == "GET") {
            $this->applyCssChange();
        } else {
            $this->statusValue = 2;
            $this->statusMsg = sprintf("Unexpected content request type: %s", $this->requestMethod);

            $this->_log->logData(LOG_INFO, "Unexpected content type in request");
        }

        echo XML_HEADER;
        echo $this->createXmlResponse();
    }

    function applyCssChange()
    {
        global $APP_DIR;

        $CSS_FILE_NAME = sprintf("%s/overlay-%d/image-overlays.css", $APP_DIR, $this->nthOverlay);
        $TEMP_CSS_FILE_NAME = sprintf(RAM_DISK_APACHE_FOLDER . "image-overlays-%d.css", $this->nthOverlay);

        $elemNameRegEx = "/[ \t]*#([0-9a-zA-Z.≪≫_-]+)[ \t]*\{[ \t]*([^\}]*)[ \t]*\}/";

        $this->statusValue = -1;

        $this->oldCSS = "[NOT DEFINED]"; // default - updated later

        $numMatches = preg_match($elemNameRegEx, $this->newCSS, $matches);
        if ($numMatches == 1) {
            $cssKey = trim($matches[1]);
        } else {
            $this->statusValue = 1;
            $this->statusMsg = sprintf("Exactly one CSS Key required in request");
            $this->_log->logData(LOG_INFO, $this->statusMsg);
            return;
        }

        $this->_log->logData(LOG_DEBUG, "Operation: %s,\n\tnewCSS: %s\n\toldCSS: %s" . $this->operation, $this->newCSS, $this->oldCSS);

        $inFile = fopen($CSS_FILE_NAME, "r") or die('<error>Missing file: ' . $CSS_FILE_NAME . '</error>');
        $cssFileContent = fread($inFile, filesize($CSS_FILE_NAME));
        fclose($inFile);

        $this->oldCSS = "";
        $currElemRegEx    = "/#(" . $cssKey . ")[ \t]*\{[ \t]*[^\}]*[ \t]*\}/";
        $currValueElemRegEx = "/#(" . $cssKey . "_value)[ \t]*\{[ \t]*[^\}]*[ \t]*\}/";

        $regExArray = array($currElemRegEx, $currValueElemRegEx);
        $replArray  = array($this->newCSS,  $this->newValueCSS);

        $i = 0;
        $lineSpace = "\n";
        foreach($regExArray as $regEx) {
            if ($regEx != "") {
                $numMatches = preg_match($regEx, $cssFileContent, $matches);
                if ($numMatches == 1) {
                    if ($cssKey == $matches[1]) {
                        $this->oldCSS = $matches[0];
                        if ($this->operation == "update-css") {
                            // Update
                            $cssFileContent = str_replace($matches[0], $replArray[$i], $cssFileContent);
                        }
                    } elseif ($this->operation == 'delete-css') {
                        // Delete
                        $cssFileContent = str_replace($matches[0], "", $cssFileContent);
                    }
                } elseif ($numMatches == 0) {
                    // Add
                    if ($this->operation == "update-css") {
                        $cssFileContent = $cssFileContent . $lineSpace . $replArray[$i];
                        $lineSpace = " ";
                    }
                }
            }
            $i++;
        }

        // ReWrite the file, updating $matchedLineNumber
        if (file_exists($TEMP_CSS_FILE_NAME)) {
            unlink($TEMP_CSS_FILE_NAME) or die('<error>Could not delete file : ' . $TEMP_CSS_FILE_NAME . '</error>');
        }

        $outFile = fopen($TEMP_CSS_FILE_NAME, "w") or die('<error>Could not open file: ' . $TEMP_CSS_FILE_NAME . '</error>');
        fwrite($outFile, $cssFileContent);
        fclose($outFile);

        copy($TEMP_CSS_FILE_NAME, $CSS_FILE_NAME) or die ('<error>Could not copy file: ' . $TEMP_CSS_FILE_NAME . ' to ' . $CSS_FILE_NAME . '</error>');

        $this->statusValue = 0;
        $this->statusMsg = sprintf("Operation %s succeeded for Overlay-%d", $this->operation, $this->nthOverlay);
    }
}

function main()
{
    global $log, $APP_DIR;

    $cssUpdateRequest = new CSSUpdateRequest($log, $APP_DIR . '/ui.properties');

    $cssUpdateRequest->run();
}

main();

