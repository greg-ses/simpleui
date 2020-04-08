<?php
/*
 * xml-diff-tool.php - support for XML to JSON conversion.
 *
 * J. Scarsdale
 * 2017-02-07
 *
 */
$log_file = "xml-diff-tool.php-LOG";
$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sLogger.php");
$log->setLevel(LOG_DEBUG);


class XmlDiffTool {

    private $prevDom, $currDom, $changeSet, $fullUpdateRequired;

    function __construct($currXmlIn, $sessionId, $sessionCount = 0)
    {
        $this->currDom = new DOMDocument();
        $this->currDom->loadXML($currXmlIn);
        $this->currDom->normalize(); // TODO: Is this necessary?

        XmlDiffTool::normalizeNodeValue($this->currDom);

        // Write normalized currXml to file
        $this->currDom->save($currFn);

        /*
        if ($sessionCount > -1) {
            // Using Sessions
            $apacheTempFolder = XmlDiffTool::getApacheTempFolder();
            $currFn = sprintf($apacheTempFolder . "%s-%d.xml", $sessionId, $sessionCount);

            $this->changeSet = null;
            if ($sessionCount > 1) {
                // Not the first - compare with previous

                // Read prevXml written by last call
                $prevFn = sprintf($apacheTempFolder . "%s-%d.xml", $sessionId, $sessionCount-1);
                $this->prevDom = DomDocument::load($prevFn);

                //TODO: Verify that this is not necessary:  $this->prevDom->normalize();

                $this->changeSet = XmlDiffTool::diffPrevWithCurrXml($this->prevDom, $this->currDom, $this->changeSet);

                if (strpos($prevFn, ".xml") && file_exists($prevFn)) {
                    unlink($prevFn);
                }
            }
        */
    }

    private function isPartialUpdate() {
        return ($this->changeSet != null);
    }

    private static function normalizeNodeValue($domNode) {
        // For each leaf node with attributes, convert the "nodeValue" property into a "value" attribute.
        foreach ($domNode->childNodes as $node) {
            if ($node->hasChildNodes()) {
                XmlDiffTool::normalizeNodeValue($node);
            } else {
                if($domNode->hasAttributes() && strlen($domNode->nodeValue)){
                    $domNode->setAttribute("value", trim($node->textContent));
                    $node->nodeValue = "";
                }
            }
        }
    }

    private static function diffAttributes($prevDomNode, $currDomNode) {

        if (! ( ksort($prevDomNode->attributes) && ksort($currDomNode->attributes) ) ) {
            // Failed to sort arrays
            return null;
        }

        $missingFromCurr = array_diff_key($prevDomNode->attributes, $currDomNode->attributes);
        $missingFromPrev = array_diff_key($currDomNode->attributes, $prevDomNode->attributes);

        $changeSet = array();
        foreach ($missingFromCurr as $deletedAttribute) {
            $changeSet = array_merge($changeSet, array("add-attr", $currDomNode->getAttribute($deletedAttribute)));
        }

        foreach ($missingFromPrev as $newAttribute) {
            $changeSet = array_merge($changeSet, array("del-attr", $currDomNode->getAttribute($newAttribute)));
        }

        return $changeSet;
    }

    private static function isSameNodeStructure($node1, $node2) {

        if ($node1 == NULL || $node2 == NULL) {
            return false;
        }

        if ($node1->nodeName != $node2->nodeName) {
            return false;
        }

        if ($node1->hasAttributes() && !$node2->hasAttributes()) {
            return false;
        }

        if (!$node1->hasAttributes() && $node2->hasAttributes()) {
            return false;
        }

        if ($node1->hasAttributes()) {
            if ($node1->getAttribute("u_id") != $node2->getAttribute("u_id")) {
                return false;
            }
        }
        return true;
    }

    private static function diffPrevWithCurrXml($prevDomNode, $currDomNode, &$changeSet, $depth = 0) {
        // Compare each node from $prevDomNode with $currDomNode.
        // If only For each leaf node with attributes, convert the "nodeValue" property into a "value" attribute.

        if ( ! XmlDiffTool::isSameNodeStructure($prevDomNode, $currDomNode)) {
            return null;
        }

        $sortedPrevNodeChildNodes = $prevDomNode->childNodes;
        $sortedCurrNodeChildNodes = $currDomNode->childNodes;
        if ($depth == 0) {

        }

        $nextPrevNode = $prevDomNode->firstChild;
        $nextCurrNode = $currDomNode->firstChild;
        while ($nextPrevNode != NULL && $nextCurrNode != NULL) {
            if ( ! XmlDiffTool::isSameNodeStructure($nextPrevNode, $nextCurrNode)) {
                return null;
            }

            if ($nextPrevNode->hasChildNodes()) {
                return XmlDiffTool::diffPrevWithCurrXml($nextPrevNode, $nextCurrNode, $changeSet, $depth+1);
            } else {
                $changeSet = array_merge($changeSet, XmlDiffTool::diffAttributes($nextPrevNode, $nextCurrNode));
            }

            $nextPrevNode = $prevDomNode->firstChild;
            $nextCurrNode = $currDomNode->firstChild;
        }
        return $changeSet;
    }

    public function getXmlResponse()
    {
        if ($this->isPartialUpdate()) {

            // Partial response - just return the changeSet, which is an associative array (JSON)
            return $this->changeSet;
        }

        // Full Update
        return $this->currDom->saveXML(LIBXML_NOEMPTYTAG);
    }

    public function getResponse()
    {
        if ($this->isPartialUpdate()) {

            // Partial response - just return the changeSet, which is an associative array (JSON)
            return $this->changeSet;

        }

        if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
            // Nothing to do -- already XML
        } else {
            return XmlDiffTool::xmlToJSON($this->currDom->saveXML(), "Data_Summary");
        }

        // Full Update
        $retVal = "";
        try {
            $retVal = $this->currDom->saveXML();
        } catch (Exception $e) {
            printf("<!-- Exception %d: %s -->", $e->getCode(), $e->getMessage());
        }

        return $retVal;
    }

    public static function json_prepare_xml($domNode) {
        foreach($domNode->childNodes as $node) {
            if($node->hasChildNodes()) {
                XmlDiffTool::json_prepare_xml($node);
            } else {
                if($domNode->hasAttributes() && strlen($domNode->nodeValue)){
                    $domNode->setAttribute("value", $node->textContent);
                    $node->nodeValue = "";
                }
            }
        }
    }

    public static function write_props_file($propsFile, $uiProp) {

        $appName = basename(dirname(dirname($_SERVER["SCRIPT_NAME"])));
        $url = "http://localhost/${appName}/php/get_props_file.php?uiProp=${uiProp}";

        $propsJson = file_get_contents($url);

        $f_props = fopen($propsFile, "w");
        if ($f_props) {
            fwrite($f_props, $propsJson);
            fclose($f_props);
        }
    }

    public static function getApacheTempFolder() {

        $apacheTempFolder = "/var/volatile/tmp/apache2/";

         if (!file_exists($apacheTempFolder)) {
            $apacheTempFolder = "/tmp/";
        }

        return $apacheTempFolder;
    }

    public static function getUiPropStubs(&$uiProp, &$tabIndex, &$hash, &$todayStub, &$yesterdayStub) {

        // Handle specialized request containing "/device/vec/data/VEC-NAME/"
        // that are set up by derived apps using .htaccess and vecproxy.php

        $uiProp = "ui";
        try {
            if (preg_match("/\/device\/vec\/data\/([^\/]+)\//", $_SERVER["REQUEST_URI"], $matches)) {
                $uiProp = $matches[1];
            }
        } catch(Exception $exception) {
            $uiProp = "ui";
        }

        $tabIndex = '0';
        try {
            if (array_key_exists("ti", $_REQUEST) ) {
                $tabIndex = $_REQUEST["ti"];
            }
        } catch(Exception $exception) {
            $tabIndex = '0';
        }

        $hash = '00000';
        try {
            if (array_key_exists("hash", $_REQUEST) ) {
                $hash = $_REQUEST["hash"];
            }
        } catch(Exception $exception) {
            $hash = '00000';
        }

        try {
            $dtNow = new DateTime();
            $todayStub = $dtNow->format("Y-m-d");
            $yesterdayStub = $dtNow->modify("-1 day")->format("Y-m-d");

        } catch(Exception $exception) {
            $todayStub = "YYYY-MM-01";
            $yesterdayStub = "YYYY-MM-00";
        }
    }

    public static function normalize_data_summary_json(&$jsonInOut, $keepTempFile = false) {
        global $log;

        try {
            $mt = microtime();
            $microSec = substr($mt, 19, 2) . substr($mt, 1, 9);
        } catch (Exception $exception) {
            $microSec = "00000000";
        }

        XmlDiffTool::getUiPropStubs($uiProp, $tabIndex, $hash,$todayStub, $yesterdayStub);

        $js_script = dirname(dirname($_SERVER["SCRIPT_FILENAME"])) . "/nodejs/json-normalizer.js";

        $apacheTempFolder = XmlDiffTool::getApacheTempFolder();

        $appName = basename(dirname(dirname($_SERVER["SCRIPT_NAME"])));
        $temp_data_in_file_name       = "${apacheTempFolder}${appName}.${uiProp}.${tabIndex}.${hash}.${microSec}.in.json";
        $temp_data_out_file_name      = "${apacheTempFolder}${appName}.${uiProp}.${tabIndex}.${hash}.${microSec}.out.json";
        $today_props_in_file_name     = "${apacheTempFolder}${appName}.${uiProp}.properties.${todayStub}.in.json";
        $yesterday_props_in_file_name = "${apacheTempFolder}${appName}.${uiProp}.properties.${yesterdayStub}.in.json";

        $f_data = fopen($temp_data_in_file_name, "w");
        if ($f_data) {
            fwrite($f_data, "{ \"Data_Summary\": " . $jsonInOut . " }");
            fclose($f_data);
        }

        if (!file_exists($today_props_in_file_name)) {

            if (file_exists($yesterday_props_in_file_name)) {
                unlink($yesterday_props_in_file_name);
            }

            XmlDiffTool::write_props_file($today_props_in_file_name, $uiProp);
        }

        // Read and rewrite $temp_data_in_file_name
        $node_command = "/usr/bin/node "
            . $js_script . " "
            . $temp_data_in_file_name . " "
            . $temp_data_out_file_name . " "
            . $today_props_in_file_name;
        // $log->logData(LOG_DEBUG, "node_command: " . $node_command);

        $handle = popen($node_command, 'r');
        if ($handle) {
            pclose($handle);
        }

        $f_size = filesize($temp_data_out_file_name);
        $f_data = fopen($temp_data_out_file_name, "r");
        if ($f_data) {
            $jsonInOut = fread($f_data, $f_size);
            fclose($f_data);
        }

        $keepIntermediateFile = $keepTempFile || array_key_exists("keepTempFile", $_REQUEST);
        if ($keepIntermediateFile) {
            $log->logData(LOG_DEBUG, "keepIntermediateFile: " . ($keepIntermediateFile ? "true" : "false") . ", inFile:" . $temp_data_in_file_name . ", outFile:" . $temp_data_out_file_name);
        } else {
            unlink($temp_data_in_file_name);
            unlink($temp_data_out_file_name);
        }

        return $jsonInOut;
    }

    public static function getPhpJsonShim($inXmlFile, $outJSONFile, $keepTempFile = false, $DocRootName = "", $versionString = "V.xxx") {
        global $log;

        // writeLog($log_file, "\n--------------------------------\nXmlDiffTool::xmlToJSON - 1\n");

        $xmlString = "<error>File ${inXmlFile} was not found.</error>";

        $f_size = filesize($inXmlFile);
        $f_xml = fopen($inXmlFile, "r");
        if ($f_xml) {
            $xmlString = fread($f_xml, $f_size);
            fclose($f_xml);
        }

        if ("$DocRootName" == "") {
            if (preg_match("/<([^ ?>]+)/", $xmlString, $matches)) {
                $DocRootName = $matches[1];
            } else {
                $DocRootName = 'root';
            }
        }


        // writeLog($log_file, "XmlDiffTool::xmlToJSON - 2\n\$xmlString: " . substr($xmlString, 0, 50) . "\n");
        $dom = new DOMDocument();
        $dom->loadXML( $xmlString );
        XmlDiffTool::json_prepare_xml($dom);
        $xmlOut = simplexml_load_string( $dom->saveXML() );
        $json = json_encode( $xmlOut );

        // Support legacy {{index}} in ui.properties by replacing with ((index)), which is what is now consumed by javascript.
        $json = preg_replace("/{{index}}/", "((index))", $json);

        // Remove php-specific "@attribute:{ value="somevalue" }"  wrapper around attributes, leaving just the "value="somevalue"" portion.
        $json = preg_replace("/\"@attributes\":\{([^}]*)\}/", "$1", $json);

        // Remove value attributes that only contain whitespace
        $json = preg_replace("/(\"value\":[ \t]*\"(\\\\t|\\\\n| |\t)+\",)/", "", $json);

        // Put the JSON inside the top-level $DocRootName
        $json = "{\"" . $DocRootName . "\": " . $json . "}";

        // Write the un-normalized JSON to an output file
        $f_outJSON = fopen($outJSONFile, "w");
        if ($f_outJSON) {
            fwrite($f_outJSON, $json);
            fclose($f_outJSON);
        }
    }

    public static function xmlToJSON($xmlString, $DocRootName = "", $versionString = "V.xxx") {
        global $log;

        // writeLog($log_file, "\n--------------------------------\nXmlDiffTool::xmlToJSON - 1\n");

        if ("$DocRootName" == "") {
            if (preg_match("/<([^ >]+)/", $xmlString, $matches)) {
                $DocRootName = $matches[1];
            } else {
                $DocRootName = 'root';
            }
        }

        // writeLog($log_file, "XmlDiffTool::xmlToJSON - 2\n\$xmlString: " . substr($xmlString, 0, 50) . "\n");
        $dom = new DOMDocument();
        $dom->loadXML( $xmlString );
        XmlDiffTool::json_prepare_xml($dom);
        $xmlOut = simplexml_load_string( $dom->saveXML() );
        $json = json_encode( $xmlOut );

        // Support legacy {{index}} in ui.properties by replacing with ((index)), which is what is now consumed by javascript.
        $json = preg_replace("/{{index}}/", "((index))", $json);

        // Remove php-specific "@attribute:{ value="somevalue" }"  wrapper around attributes, leaving just the "value="somevalue"" portion.
        $json = preg_replace("/\"@attributes\":\{([^}]*)\}/", "$1", $json);

        // Remove value attributes that only contain whitespace
        $json = preg_replace("/(\"value\":[ \t]*\"(\\\\t|\\\\n| |\t)+\",)/", "", $json);
        if ($DocRootName == "Data_Summary") {
            XmlDiffTool::normalize_data_summary_json($json);
        } else {
            $json = "{\"" . $DocRootName . "\": " . $json . "}";
        }

        return $json;
    }
}
