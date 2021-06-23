<?php
/*
 *  Server client backend support requests from the simple_ui app.
 *  Connects REQ socket to ZMQ tcp://127.0.0.1:5561
 * @author Jim Scarsdale
 */

header("Access-Control-Allow-Origin: *");

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sLogger.php");
require_once ($SCRIPT_PATH . "/xml-diff-tool.php");

define("REQUEST_TIMEOUT", 2000); //  msecs, (> 1000!)
define("REQUEST_RETRIES", 0); //  Before we abandon
define("XML_HEADER", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");
define("COMMA", ",");
define("SIMPLE_TYPES", array("boolean", "float", "integer", "string"));

define("TRIVIAL_CMD", "/\<cmd[ \t]+name=\"([a-zA-Z0-9_]+)\"><\/cmd>/");
define("REQUEST_WITH_CMD_ATTR_TEMPLATE", "/\<request[ \\t][^>]*cmd=\"TOKEN\"/");
define("RAM_DISK_APACHE_FOLDER", "/var/volatile/tmp/apache2/");

function writeLog($logFile, $msg) {
    $fo = fopen($logFile, "a");
    fwrite($fo, $msg);
    fclose($fo);
}

class JsonToXml {
    public $_log;
    protected $dom = null;

    public function __construct($slogger, $jsonRaw)
    {
        $this->_log = $slogger;

        $json = json_decode($jsonRaw, true);
        $slogger->logData(LOG_DEBUG, "decoded json: \n" . $json);

        $this->serialize($json);
    }

    public function serialize( $array)
    {
        $this->dom = new DOMDocument('1.0', 'utf-8');
        $element = $this->dom->createElement('array');
        $this->dom->appendChild($element);
        $this->addData( $element, $array);
    }

    protected function addData( DOMElement &$element, $array)
    {
        foreach($array as $k => $v) {
            $e = null;
            if( is_array( $v)){
                // Add recursive data
                $e = $this->dom->createElement( 'array', $v);
                $e->setAttribute( 'name', $k);
                $this->addData( $e, $v);

            } else {
                // Add linear data
                $e = $this->dom->createElement( 'data', $v);
                $e->setAttribute( 'name', $k);
            }

            $element->appendChild($e);
        }

    }

    public function get_xml()
    {
        return $this->dom->saveXML();
    }
}

class SimpleUIRequest
{
    public $_log;
    public $requestMethod = "";
    public $commandName = "unknown";
    public $commandArgc = -5;
    public $statusValue = 0;
    public $statusMsg = "";
    public $replyReceived = "";
    public $fileName = "";
    public $DataPortPrefix = "";

    function __construct($slogger, $fileName, $DataPortPrefix = null)
    {
        $this->_log = $slogger;
        $this->fileName = $fileName;
        $this->DataPortPrefix = $DataPortPrefix;

        $this->_props = loadPropsFile($this->fileName);
    }

    function createJSONResponse()
    {
        // $msg = sprintf("==> Inside createJSONResponse()\nstatusMsg: %s\n", $this->statusMsg);
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);

        $replyReceived = (gettype($this->replyReceived) == "string") ? XmlDiffTool::xmlToJSON($this->replyReceived) : '"empty"';
        $resp = sprintf(
            '{"response": {' .
            '  "SERVER_REQUEST_METHOD": "%s",' .
            '  "COMMAND": {"name": "%s", "argc": "%d"},' .
            '  "status": {"value": "%d", "result": %s}' .
            '}}',
            (gettype($this->requestMethod) == "string") ? $this->requestMethod : "unknown request method",
            (gettype($this->commandName) == "string") ? $this->commandName : "unknown command name",
            (gettype($this->commandArgc) == "integer") ? $this->commandArgc : -3,
            (gettype($this->statusValue) == "integer") ? $this->statusValue : -4,
            $replyReceived);

        // $msg = sprintf("\$resp: " . $resp . "\n");
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);

        return $resp;
    }

    function createXmlResponse()
    {
        $cdata = htmlspecialchars((gettype($this->statusMsg) == "string") ? $this->statusMsg : "empty statusMsg");
        $resp = sprintf(
            "<response>\n" .
            "  <SERVER REQUEST_METHOD=\"%s\" />" .
            "  <command name=\"%s\" argc=\"%d\"></command>\n" .
            "  <status value=\"%d\">\n<![CDATA[%s]]>\n</status>\n" .
            "</response>\n",
            (gettype($this->requestMethod) == "string") ? $this->requestMethod : "unknown request method",
            (gettype($this->commandName) == "string") ? $this->commandName : "unknown command name",
            (gettype($this->commandArgc) == "integer") ? $this->commandArgc : -3,
            (gettype($this->statusValue) == "integer") ? $this->statusValue : -4,
            (gettype($cdata) == "string") ? $cdata : "empty cdata");
        return $resp;
    }

    function getXmlFromUrlArgs()
    {
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "Inside getXmlFromUrlArgs()\n");
        $this->commandName = (array_key_exists("cmd", $_REQUEST)) ? $_REQUEST['cmd'] : "unknown command name";

        $this->_log->logData(LOG_DEBUG, "getXmlFromUrlArgs\n");


        $xml = '<request COMMAND="' . $this->commandName . '" ';

        foreach ($_REQUEST as $key => $value) {
            if ($key !== 'cmd') {
                $xml .= ' ' . $key . '="' . $value . '"';
            }
        }

        $xml .= '>';

        /*
        if (array_key_exists("value", $_REQUEST)) {
            if (gettype($_REQUEST['value']) == "string") {
                $xml .= '<value>' . $_REQUEST['value'] . '</value>';
            } else if (gettype($_REQUEST['value']) == "array") {
                foreach ($_REQUEST['value'] as $key => $value) {
                    $xml .= '<value name="' . $key . '">' . $value . '</value>';
                }
            }
        }
        */

        $xml .= '</request>';
        return ($xml);
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
                        $itemTag = $this->getItemTag($key);
                        foreach ($value as $k => $v) {
                            $childrenXml .= $this->jsonToXml($v, $itemTag, "", $depth + 1);
                        }
                        break;
                    }
                case "object":
                    {
                        $childrenXml .= $this->jsonToXml($value, $key, "", $depth + 1);
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
            $xml = $this->removeNestedTrivialCmd($xml);

            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.xml", $xml . "\n");
        }

        return ($xml);
    }

    function merge_singleton_cmd($json_params) {
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

    function getXmlFromJsonArgs() {
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\n==> Inside getXmlFromJsonArgs()\n");

        $raw_json_params = file_get_contents("php://input");

        $msg = sprintf("\n==> raw_json_params: \n\t%s\n", $raw_json_params);
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);
        if (strlen($raw_json_params) == 0) {
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\nEmpty JSON in request:\n");
            $this->_log->logData(LOG_DEBUG, "Empty JSON in request:\n");
            return "{}";
        }

        $json_params = null;
        if ($this->isValidJSON($raw_json_params)) {
            // $msg =  sprintf("\$raw_json_params: %s\n", "$raw_json_params");
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt");
            $json_params = json_decode($raw_json_params);
            $json_params = $this->merge_singleton_cmd($json_params);
        } else {
            $this->_log->logData(LOG_DEBUG, "Invalid JSON in request:\n" . $raw_json_params . "\n");
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\n==> Invalid JSON in request\n");
            return "{}";
        }

        if ($json_params == null) {
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "json_params IS NULL\n");
            return "{}";
        } else {
            // $msg = sprintf("json_params is NOT null, type: %s", gettype($json_params));
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);
        }

        $this->commandName = "unknown_command_name";
        if ( array_key_exists("cmd", $json_params)) {
            if (gettype($json_params->cmd) == "string") {
                $this->commandName = $json_params->cmd;
            }
        }

        // $msg = sprintf("commandName: %s\n", $this->commandName);
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);

        $this->_log->logData(LOG_DEBUG, "getXmlFromJsonArgs\n");

        $extraDocRootAttrs = 'COMMAND="' . $this->commandName . '" cmd="' . $this->commandName . '"';
        $xml = $this->jsonToXml($json_params, 'request', $extraDocRootAttrs);
        $xml = str_replace("_input", "value", $xml);

        $msg = sprintf("\noutput xml: %s\n", $xml);
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);

        return $xml;
    }

    function run($portNum = null)
    {
        $xmlIn = "";

        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\n\n==========\nrun() - 1a\n");

        $this->requestMethod = $_SERVER["REQUEST_METHOD"];
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "run() - 2\n");
        // $this->_log->logData(LOG_DEBUG, "Method:" . $this->requestMethod);
        if ($this->requestMethod == "GET") {
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "requestMethod: GET\n");
            //$this->_log->logData(LOG_DEBUG, "GET requestMethod\n");

            header("Content-Type: application/json; charset=UTF-8");
            // echo '{"document":{"body": "This is a response"}}\n';
            $xmlIn = $this->getXmlFromUrlArgs();
            // $this->_log->logData(LOG_DEBUG, "xml constructed from URL Params:\n" . $xmlIn);

            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $xmlIn);


        } else if (($this->requestMethod == "POST") && isset($_SERVER["CONTENT_TYPE"]) ) {
            // $msg = sprintf("\n==> requestMethod: POST, _SERVER['CONTENT_TYPE'] is: %s", $_SERVER["CONTENT_TYPE"]);
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);

            if (strpos($_SERVER["CONTENT_TYPE"], "application/xml") !== false) {
                // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "Incoming CONTENT_TYPE is application/xml\n");

                header("Content-Type: application/xml; charset=UTF-8");

                try {
                    $this->_log->logData(LOG_DEBUG, "Getting XML stream from php://input \n");
                    $xmlIn = file_get_contents('php://input');
                } catch (Exception $e) {
                    $this->statusValue = 1;
                    $this->statusMsg = "Exception while building XML request: " . $e;
                }

            } else if (strpos($_SERVER["CONTENT_TYPE"], "application/x-www-form-urlencoded") !== false) {
                // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "Incoming CONTENT_TYPE is application/x-www-form-urlencoded\n");

                try {
                    header("Content-Type: application/json; charset=UTF-8");
                    // echo '{"document":{"body": "This is a response"}}\n';
                    $xmlIn = $this->getXmlFromUrlArgs();
                    // $msg = sprintf("Xml Command: %s\n", $xmlIn);
                    // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);
                    // $this->_log->logData(LOG_DEBUG, $msg);
                } catch (Exception $e) {
                    $this->statusValue = 1;
                    $this->statusMsg = "Exception while building JSON request: " . $e;
                    // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $this->statusMsg);
                }

            } else if (strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false) {
                // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "Incoming CONTENT_TYPE is application/json\n");

                try {
                    header("Content-Type: application/json; charset=UTF-8");
                    // echo '{"document":{"body": "This is a response"}}\n';
                    // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "Xml Command:\n" . $xmlIn);
                    $xmlIn = $this->getXmlFromJsonArgs();
                    // $this->_log->logData(LOG_DEBUG, "xml constructed from URL Params:\n" . $xmlIn);
                } catch (Exception $e) {
                    $this->statusValue = 1;
                    $this->statusMsg = "Exception while building JSON request: " . $e;
                    // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $this->statusMsg);
                }
            } else if (!defined($this->requestMethod)) /* Look for a file as input. */ {
                // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "requestMethod is not defined\n");
                $options = getopt("f:");
                $xmlIn = file_get_contents($options["f"]);

                //$xmlIn = file_get_contents('./test_stream.xml');  Greg - Start here, at least it appears to get through.
            } else {
                $this->statusValue = 2;
                // $this->_log->logData(LOG_INFO, "Unexpected content type in request");
                // $msg = sprintf("Unexpected content type in request: %s\n", $this->requestMethod);
                // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);
            }
        }

        // $msg = sprintf("\nBefore zmqRequest - \$xmlIn:\n %s\n", "$xmlIn");
        //writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", $msg);
        $this->zmqRequest($xmlIn, $portNum);
        //writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "After zmqRequest\n");

        if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
            $response = $this->createXmlResponse();
        } else {
            // Default is to return JSON
            // $response = XmlDiffTool::xmlToJSON($response, "");
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "call createJSONResponse()\n");
            $response = $this->createJSONResponse();
            // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\ngot response from createJSONResponse");
        }

        // $this->_log->logData(LOG_DEBUG, "Response sent:\n" . $response);
        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "\nSending Response from createJSONResponse\n");

        echo $response;
    }

    function isValidResponse($reply, $expectedResponseRoot)
    {
        return true;
    }

    function zmqRequest($xmlRequest, $portNum = null)
    {

        if ($xmlRequest == "none") {
            $this->_log->logData(LOG_DEBUG, "Empty Request.");
            $this->statusMsg = "xmlRequest must not be empty.";
            // return $this->createXmlResponse();
            return $this->createJSONResponse();
        }

        try
        {
            $context = new ZMQContext();
            if ($portNum === null) {
                $zmqConnect = sprintf("tcp://svcmachineapps:%d", propOrDefault($this->_props, $this->DataPortPrefix . ".data.port", "5560"));
            } else {
                $zmqConnect = "tcp://svcmachineapps:" . $portNum;
            }

            $this->_log->logData(LOG_DEBUG, "ZMQ Connect: " . $zmqConnect);
            $client = new ZMQSocket($context,ZMQ::SOCKET_REQ);

            $this->_log->logData(LOG_DEBUG, "before \$client->connect(\$zmqConnect)");
            $client->connect($zmqConnect);

            $this->_log->logData(LOG_DEBUG, "before \$client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0)");
            $client->setSockOpt(ZMQ::SOCKOPT_LINGER, 0);  //  Configure socket to not wait at close time


            $this->_log->logData(LOG_DEBUG, "Request:\n" . $xmlRequest);


            $read = $write = array();

            $this->statusValue = 1;
            $this->statusMsg = "NO RESPONSE";
            //  We send a request, then we work to get a reply
            $this->_log->logData(LOG_DEBUG, "Before \$client->send(\$xmlRequest)");
            $ret = $client->send($xmlRequest);

            //  Poll socket for a reply, with timeout
            $this->_log->logData(LOG_DEBUG, "Before new ZMQPoll()");
            $poll = new ZMQPoll();
            $this->_log->logData(LOG_DEBUG, "Before \$poll->add(\$client, ZMQ::POLL_IN)");
            try {
                $poll->add($client, ZMQ::POLL_IN);
            } catch (ZMQPollException $e) {
                $this->_log->logData(LOG_DEBUG, "ZMQPollException on \$poll->add(). Code:" . sprintf("%d: %s", $e->getCode(), $e->getMessage()));
                return "";
            }

            $this->_log->logData(LOG_DEBUG, "Before \$poll->poll(\$read, \$write, REQUEST_TIMEOUT)");
            try {
                $events = $poll->poll($read, $write, REQUEST_TIMEOUT);
            } catch (ZMQPollException $e) {
                $this->_log->logData(LOG_DEBUG, "ZMQPollException " . sprintf("%d: %s", $e->getCode(), $e->getMessage()));
                return "";
            }


            //  If we got a reply, process it
            if ($events > 0) {
                $this->_log->logData(LOG_DEBUG, "Before \$client->recv()");
                $this->replyReceived = $client->recv();
                $this->_log->logData(LOG_DEBUG, "client->recv(): " . $this->replyReceived);
                if ($this->isValidResponse($this->replyReceived, "TODO")) {
                    $this->statusValue = 0; // Success
                    $this->statusMsg = "Valid response from server:\n" . $this->replyReceived;
                    $this->_log->logData(LOG_DEBUG, $this->statusMsg);
                } else {
                    $this->statusValue = 4;
                    $this->statusMsg = "malformed reply from server:\n" . $this->replyReceived;
                    $this->_log->logData(LOG_INFO, $this->statusMsg);
                }
            } else {
                $this->statusValue = 5;
                $this->statusMsg = "No Response.";
                $this->_log->logData(LOG_INFO, $this->statusMsg);
            }
        }
        catch (ZMQSocketException $e)
        {
            //$this->_log->logData(LOG_DEBUG, "ZMQSocketException " . sprintf("%d: %s", $e->getCode(), $e->getMessage()) );
            printf("ZMQSocketException " . sprintf("%d: %s", $e->getCode(), $e->getMessage()) );
        }

        // writeLog(RAM_DISK_APACHE_FOLDER . "my-apache-log.txt", "Finished zmqRequest.\n");

        return ("");
    }
}


?>
