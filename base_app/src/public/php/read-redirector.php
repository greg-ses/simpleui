<?php

/*
 * read-redirector.php
 *
 * Description:
 *   Processes the PartialURL passed via
 *         $_REQUEST["sui-data-query"]
 *         $_REQUEST["sui-cmd-query"]
 *     or  argv[1]                            (command-line invocation)
 *   The full URL is constructed with the expression "http://localhost:8080" + PartialURL.
 *
 * Usage:
 *
 *   Browser request:   http://hostname/bms/php/read-redirector.php?sui-data-query=/bms/php/bms-data.php?json
 *   PHP commandline:   php /var/www/bms/php/read-redirector.php  /bms/php/bms-data.php?json
 *
 *   Both of the above examples will return the results of the query http://localhost:8080/bms/php/bms-data.php?json
 */

$log_file = "command.php-log";
$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);
require_once($SCRIPT_PATH . "/sLogger.php");
$log->setLevel(7);



define("REQUEST_TIMEOUT", 2000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 0); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");
define("COMMA", ",");
define("SIMPLE_TYPES", array("boolean", "float", "integer", "string"));

define("TRIVIAL_CMD", "/\<cmd[ \t]+name=\"([a-zA-Z0-9_]+)\"><\/cmd>/");
define("REQUEST_WITH_CMD_ATTR_TEMPLATE", "/\<request[ \\t][^>]*cmd=\"TOKEN\"/");
define("RAM_DISK_APACHE_FOLDER", "/var/volatile/tmp/apache2/");


function parseRequest() {
    global $argv;

    $partialUrl  = "";
    $requestType = "";
    if (array_key_exists("sui-data-query", $_REQUEST)) {
        // Require any web request to contain and redirect to sui-data-query for security
        $partialUrl  = $_REQUEST["sui-data-query"];
        $requestType = "web.get";
    } elseif (array_key_exists("sui-cmd-query", $_REQUEST)) {
        // Require any web request to contain and redirect to sui-cmd-query for security
        $partialUrl  = $_REQUEST["sui-cmd-query"];
        $requestType = "web.post";
    } elseif (count($argv) > 1) {
        $partialUrl  = $argv[1];
        $requestType = "command";
    }

    if ("" == $partialUrl) {
        return false;
    }

    $url = "http://localhost:8080" . $partialUrl;

    // Determine the returnType
    $returnType = "json";
    $xmlArg_RegEx = "/[?&][xX][mM][lL]/";
    if (preg_match($xmlArg_RegEx, $partialUrl)) {
        $returnType = "xml";
    }

    $request = array(
        "requestType" => $requestType,
        "returnType" => $returnType,
        "url" => $url
    );

    return $request;
}

function forwardGetRequest($request) {
    if ($request["returnType"] == "xml") {
        // header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/xml; charset=UTF-8");
    } else {
        header("Content-Type: application/json; charset=UTF-8");
    }

    $f_data = fopen($request["url"], 'r');
    if ($f_data) {
        $json = "";
        $offset = 0;
        while (true) {
            $fragment = stream_get_contents($f_data, -1, $offset);
            if (!$fragment) {
                break;
            }
            $offset += strlen($fragment);
            $json .= $fragment;
        }
        fclose($f_data);
        echo $json;
    }
}

function forwardPostRequest($request) {
    global $log;

    $log->logData(LOG_DEBUG, "1. forwardPostRequest() - _SERVER[CONTENT_TYPE]: " . $_SERVER["CONTENT_TYPE"]);

    if (strpos($_SERVER["CONTENT_TYPE"], "application/xml") !== false) {
        $log->logData(LOG_DEBUG, "2x. forwardPostRequest()");

        try {
            $log->logData(LOG_DEBUG, "3x. forwardPostRequest()");
            $xmlIn = file_get_contents('php://input');
        } catch (Exception $e) {
            $statusValue = 1;
            $statusMsg = "Exception while building XML request: " . $e;
            $log->logData(LOG_ERROR, "Exception in forwardPostRequest(): " . $e);
        }


        if ($request["returnType"] == "xml") {
            $log->logData(LOG_DEBUG, "4x. forwardPostRequest()");
            // header("Access-Control-Allow-Origin: *");
            header("Content-Type: application/xml; charset=UTF-8");
        } else {
            $log->logData(LOG_DEBUG, "5x. forwardPostRequest()");
            header("Content-Type: application/json; charset=UTF-8");
        }

        $log->logData(LOG_DEBUG, "6x. forwardPostRequest()");
        $post_data = http_build_query( $xmlIn );

        $log->logData(LOG_DEBUG, "7x. forwardPostRequest()");
        $opts = array('http' =>
            array(
                'method' => 'POST',
                'header' => 'Content-Type: application/xml; charset=UTF-8',
                'content' => $post_data
            )
        );

        $log->logData(LOG_DEBUG, "8x. forwardPostRequest()");
        $context = stream_context_create($opts);

        $log->logData(LOG_DEBUG, "9x. forwardPostRequest()");
        $result = file_get_contents($request["url"], false, $context);

        $log->logData(LOG_DEBUG, "10x. forwardPostRequest(): $result");

        echo $result;
    } else if (strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false) {
        $log->logData(LOG_DEBUG, "2j.1 forwardPostRequest()");

        try {
            header("Content-Type: application/json; charset=UTF-8");
            $xmlIn = getXmlFromJsonArgs();
            $log->logData(LOG_DEBUG, "2j.2 xml constructed from URL Params:\n" . $xmlIn);
        } catch (Exception $e) {
            $statusValue = 1;
            $statusMsg = "2j.3 Exception while building JSON request: " . $e;
            $log->logData(LOG_DEBUG, $statusMsg);
        }

        if ($request["returnType"] == "xml") {
            $log->logData(LOG_DEBUG, "4j. forwardPostRequest()");
            // header("Access-Control-Allow-Origin: *");
            header("Content-Type: application/xml; charset=UTF-8");
        } else {
            $log->logData(LOG_DEBUG, "5j. forwardPostRequest()");
            header("Content-Type: application/json; charset=UTF-8");
        }

        $log->logData(LOG_DEBUG, "6j. forwardPostRequest()");
        $post_data = http_build_query( $xmlIn );

        $log->logData(LOG_DEBUG, "7j. forwardPostRequest()");
        $opts = array('http' =>
            array(
                'method' => 'POST',
                'header' => 'Content-Type: application/xml; charset=UTF-8',
                'content' => $post_data
            )
        );

        $log->logData(LOG_DEBUG, "8j. forwardPostRequest()");
        $context = stream_context_create($opts);

        $log->logData(LOG_DEBUG, "9j. forwardPostRequest() - request[url]: " . $request["url"]);
        $result = file_get_contents($request["url"], false, $context);

        $log->logData(LOG_DEBUG, "10j. forwardPostRequest(): $result");

        echo $result;
    }
}


function merge_singleton_cmd($json_params) {
    global $log;

    if ( array_key_exists("cmd", $json_params)) {
        $innerCmd = null;
        if (is_object($json_params->cmd)) {
            $innerCmd = $json_params->cmd;
            unset($json_params->cmd);
        } else if (is_array($json_params->cmd) && (count($json_params->cmd) == 1)) {
            $innerCmd = $json_params->cmd[0];
            unset($json_params->cmd);
        } else {
            return $json_params;
        }

        // Walk $cmd and merge all attributes to the parent
        foreach ($innerCmd as $key => $value) {
            if ( ! array_key_exists($key, $json_params) ) {
                $json_params->$key = $value;
            }
        }

        // Add "cmd" attribute as a string
        if (array_key_exists("name", $json_params)) {
            if (is_string($json_params->name)) {
                $json_params->cmd = $json_params->name;
            }
        }

    }
    return $json_params;
}


function isValidJSON($str)
{
    json_decode($str);
    return json_last_error() == JSON_ERROR_NONE;
}

function getItemTag($listName)
{
    // Create an itemTag from $listName that strips the trailing 's' if it exists,
    // or appends '_item' if the trailing 's' does NOT exist
    $itemTag = $listName . "_item";
    $len = strlen($listName);
    if ($len > 1) {
        $end = $len - 1;
        if (substr($listName, $end, 1) == 's') {
            $itemTag = substr($listName, 0, $len-1);
        }
    }
    return $itemTag;
}

function jsonToXml($json, $docRoot, $extraDocRootAttrs="", $depth=0)
{
    $xml = '<' . $docRoot . ' ';
    if ($extraDocRootAttrs !== '') {
        $xml .= $extraDocRootAttrs . ' ';
    }

    $childrenXml = '';
    // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\n");

    foreach ($json as $key => $value)
    {
        $displayKey = $key;
        if (!in_array(gettype($key), SIMPLE_TYPES)) {
            $displayKey = "[KEY]";
        }

        $displayValue = $value;
        if (!in_array(gettype($value), SIMPLE_TYPES)) {
            $displayValue = "[VALUE]";
        }

        // $msg = sprintf("\n[" . %d . "] key: %s, value: %s\n", $depth, $displayKey, $displayValue);
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);

        switch (gettype($json->$key)) {
            case "array":
                {
                    $itemTag = getItemTag($key);
                    foreach ($value as $k => $v) {
                        $childrenXml .= jsonToXml($v, $itemTag, "", $depth + 1);
                    }
                    break;
                }
            case "object":
                {
                    $childrenXml .= jsonToXml($value, $key, "", $depth + 1);
                    break;
                }
            default: {
                if ($key !== 'cmd') {
                    $xml .= ' ' . $key . '="' . ((gettype($value) == "string") ? rtrim($value) : $value)  . '"';
                }
                break;
            }
        }
    }
    $xml .= '>' . $childrenXml . '</' . $docRoot . '>';

    if ($depth == 0) {
        // Remove trivial embedded command with same name as "cmd" attribute
        $xml = removeNestedTrivialCmd($xml);

        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.xml", $xml . "\n");
    }

    return ($xml);
}

function removeNestedTrivialCmd($xml)
{
    if (preg_match(TRIVIAL_CMD, $xml,$matches) && count($matches) == 2) {
        $requestWithCmdAttr = str_replace("TOKEN", "$matches[1]", REQUEST_WITH_CMD_ATTR_TEMPLATE);
        if (preg_match($requestWithCmdAttr, $xml)) {
            $xml = str_replace($matches[0], "", $xml);
        }
    }
    return $xml;
}

function getXmlFromJsonArgs() {
    global $log;

    // $log->logData(LOG_DEBUG, "\n==> Inside getXmlFromJsonArgs()\n");

    $raw_json_params = file_get_contents("php://input");

    $msg = sprintf("\n==> raw_json_params: \n\t%s\n", $raw_json_params);
    // $log->logData(LOG_DEBUG, $msg);
    if (strlen($raw_json_params) == 0) {
        // $log->logData(LOG_DEBUG, "\nEmpty JSON in request:\n");
        $log->logData(LOG_DEBUG, "Empty JSON in request:\n");
        return "{}";
    }

    $json_params = null;
    if (isValidJSON($raw_json_params)) {
        // $msg =  sprintf("\$raw_json_params: %s\n", "$raw_json_params");
        // $log->logData(LOG_DEBUG);
        $json_params = json_decode($raw_json_params);
        $json_params = merge_singleton_cmd($json_params);
    } else {
        $log->logData(LOG_DEBUG, "Invalid JSON in request:\n" . $raw_json_params . "\n");
        // $log->logData(LOG_DEBUG, "\n==> Invalid JSON in request\n");
        return "{}";
    }

    if ($json_params == null) {
        // $log->logData(LOG_DEBUG, "json_params IS NULL\n");
        return "{}";
    } else {
        // $msg = sprintf("json_params is NOT null, type: %s", gettype($json_params));
        // $log->logData(LOG_DEBUG, $msg);
    }

    $commandName = "unknown_command_name";
    if ( array_key_exists("cmd", $json_params)) {
        if (gettype($json_params->cmd) == "string") {
            $commandName = $json_params->cmd;
        }
    }

    // $msg = sprintf("commandName: %s\n", $commandName);
    // $log->logData(LOG_DEBUG, $msg);

    $log->logData(LOG_DEBUG, "getXmlFromJsonArgs\n");

    $extraDocRootAttrs = 'COMMAND="' . $commandName . '" cmd="' . $commandName . '"';
    $xml = jsonToXml($json_params, 'request', $extraDocRootAttrs);
    $xml = str_replace("_input", "value", $xml);

    $msg = sprintf("\noutput xml: %s\n", $xml);
    // $log->logData(LOG_DEBUG, $msg);

    return $xml;
}

function main()
{
    $request = parseRequest();
    if (false === $request) {
        echo "Invalid request - 'sui-data-query' key missing from URL or missing path in command arguments.\n";
        return 1;
    }

    if ($request["requestType"] == "web.get") {
        forwardGetRequest($request);
    } else if ($request["requestType"] == "web.post") {
        if ($request["returnType"] == "xml") {
            // header("Access-Control-Allow-Origin: *");
            header("Content-Type: application/xml; charset=UTF-8");
        } else {
            header("Content-Type: application/json; charset=UTF-8");
        }
        forwardPostRequest($request);
    }

    return 0;
}

return main();
?>
