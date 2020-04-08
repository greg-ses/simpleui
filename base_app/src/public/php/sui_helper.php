<?php
/**
 * Created by PhpStorm.
 * User: gmorehead
 * Date: 8/29/16
 * Time: 11:38 AM
 */

$SERVER_ERRORS = array(
    "1001" => "Empty filename",
    "1002" => "Invalid error code (%d)",
    "1003" => "Invalid file (%s) in request.",
    "1004" => "In properties file, enabled flag is set to false.",
    "1005" => "No response from server."
);


function isXMLrequest()
{
    return (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST));
}

function errorToXml($statusCode, $errorContext, $subElem = "") {
    global $SERVER_ERRORS;
    return errorToXml5($statusCode, $statusCode, $SERVER_ERRORS[$statusCode], $errorContext, $subElem);
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


function getSoftwareVersionStrings($versionFile, &$uiVersionLong, &$uiVersionShort)
{
    $userRegEx = "/define[ \t]+GIT_USER[ \t]+\"([^\"]*)\"/";
    $revRevstrShortRegEx = "/define[ \t]+GIT_REVSTR_SHORT[ \t]+\"([^\"]*)\"/";
    $revSummaryRegEx = "/define[ \t]+GIT_REV_SUMMARY[ \t]+\"([^\"]*)\"/";

    $user = "user";
    $uiVersionLong = "UI Version Long";
    $uiVersionShort = "UI Version Short";

    if (is_readable($versionFile)) {
        $inFile = fopen("$versionFile", "r");
        while ( ($line = fgets($inFile, 4096)) !== false) {
            if (preg_match($userRegEx, $line, $matches) == 1) {
                $user = $matches[1];
            }
            if (preg_match($revRevstrShortRegEx, $line, $matches) == 1) {
                $uiVersionShort = $matches[1];
            }
            if (preg_match($revSummaryRegEx, $line, $matches) == 1) {
                $uiVersionLong = $matches[1];
            }
        }
        fclose($inFile);
    }

    $uiVersionLong .= " (" . $user . ")";
    return $uiVersionLong . " (" . $user . ")";
}


/* Load ui.properties file */
function loadPropsFile($propsFileName)
{
    $props = array();
    if ($propsFileName != "self") {
        $props['uiProp'] = str_replace(".properties", "", basename($propsFileName));
        $versionFile = dirname($propsFileName) . "/version.txt";
        getSoftwareVersionStrings($versionFile, $uiVersionLong, $uiVersionShort);
        $props['uiVersionLong'] = $uiVersionLong;
        $props['uiVersionShort'] = $uiVersionShort;
        $props['fullAppUrl'] = dirname($_SERVER['SERVER_PROTOCOL']) . "://" . $_SERVER['SERVER_NAME'] . dirname(dirname($_SERVER['PHP_SELF'])) . "/";
        $props['selectedIndex'] = '0';
        $oneLineMacroRegEx = "/@MACRO\W+([0-9a-zA-Z._-]+)\W*=\W*[$]?\(([^ \t]+)\W+FROM[ \t]+([^\)]+)\W*\)/";
        $propRegEx = "/[ \t]*([0-9a-zA-Z._-]+)[ \t]*=[ \t]*([^\n]*)/";
        $matches = null;
        $macroIndex = 0;

        $inFile = fopen("$propsFileName", "r") or die("Unable to open file $propsFileName!");
        while ( ($line = fgets($inFile, 4096)) !== false) {
            $line = trim($line);
            if ((strlen($line) > 0) && $line[0] != "#" && $line[0] != "\n") {
                if (preg_match($oneLineMacroRegEx, $line, $macroParts)) {
                    $props["macro.${macroIndex}.token"] = $macroParts[1];
                    $props["macro.${macroIndex}.source"] = $macroParts[3];
                    $props["macro.${macroIndex}.property"] = $macroParts[2];

                    $macroIndex++;

                } else {
                    if (preg_match($propRegEx, $line, $matches) == 1) {

                        $k = $matches[1];
                        $v = trim($matches[2]);

                        $props[$k] = $v;
                    }
                }
            }
        }
        fclose($inFile);
    }
    // sort($props);
    return $props;
}

function getAppName()
{
    // Returns a URL prefix that supports both direct and proxy http queries.

    $appName = "/" . explode("/", $_SERVER["REQUEST_URI"])[1] . "/";

    // Check for query through a gateway/BMS machine (192.168.*.1), assumed to be a proxy request
    $clientIP = $_SERVER["REMOTE_ADDR"];
    if (preg_match("/192\.168\.[0-9]+\.1;/", "${clientIP};")) {
        // Query was via a proxy - must inject this hostname back into the URL
        $appName = $_SERVER["REQUEST_SCHEME"] . "://" . $_SERVER['HTTP_HOST'] . "/" . gethostname() . "/device/";
    }
    return $appName;
}

function get_prop_from_base_ui_props($key)
{
    // Returns the property defined by $key in /appname/ui.properties

    $baseUiPropsFile = "/var/www" . getAppName() . "ui.properties";
    $baseUiProps = loadPropsFile($baseUiPropsFile);

    $retVal = "";
    if (array_key_exists($key, $baseUiProps)) {
        $retVal = $baseUiProps[$key];
    }

    return $retVal;
}

function extractMacros($props) {
    /* Support macros of the following type:
     *
     **********************************************************************************
     * Type 1: Replacement by way of a value fetched from a cross-reference
     *         properties file.
     *
     *      macro.2.token    = BSC_MYSQL_HOST
     *      macro.2.source   = /opt/config/ModuleServer.properties
     *      macro.2.property = DatabaseMgr.MYSQL_HOST
     *
     *  All instances of ${BSC_MYSQL_HOST} inside other property values are
     *  replaced with the value of macro.2.property ("DatabaseMgr.MYSQL_HOST")
     *  that is fetched from the properties file macro.2.source
     * ("/opt/config/ModuleServer.properties").
     **********************************************************************************
     * Rules:
     *    1. Macro properties must be defined in the order shown for Type 1 or Type 2.
     *    2. The last replacement wins.
     *    3. If no replacement is defined, any macro usages will be replaced with "".
     *    4. Macros are replaced in the order defined.  Recursive replacement will only
     *       occur when a later macro replaces a value inserted as part of the replacement
     *       made by an earlier macro.
     *    4. Macro replacement within macros is NOT SUPPORTED.
     *    5. The behavior of macro replacement of macros embedded within a value
     *       retrieved as a replacement from a Cross Ref props files is undefined
     *       and not supported.
     **********************************************************************************
     */
    $macroProps = array();
    $CrossRefPropsFiles = array();

    $macroRegEx = "/macro.([0-9]+).(token|source|property|replacement)/";
    $matches = null;
    $index = "0";

    foreach ($props as $propKey => $propValue) {
        if ( preg_match($macroRegEx, $propKey, $matches) == 1 ) {
            $index = $matches[1];
            $field = $matches[2];
            if (!array_key_exists($index, $macroProps)) {
                $macroProps[$index] = array();
                $macroProps[$index]["replacement"] = "";
            }
            if (strcmp($field, "source") == 0) {
                $CrossRefPropsFile = $propValue;

                // Only read a given $CrossRefPropsFile once
                if (!array_key_exists($CrossRefPropsFile, $CrossRefPropsFiles)) {
                    $CrossRefPropsFiles[$CrossRefPropsFile] = loadPropsFile($CrossRefPropsFile);
                }
                $macroProps[$index]["source"] = $CrossRefPropsFile;

            } elseif (strcmp($field, "property") == 0) {
                $replacement = "";
                if (array_key_exists("source", $macroProps[$index])) {
                    if ($macroProps[$index]["source"] == "self") {
                        $localKey = $propValue;
                        $replacement = $props[$localKey];
                    } else {
                        $CrossRefPropsFile = $macroProps[$index]["source"];
                        $replacement = $CrossRefPropsFiles[$CrossRefPropsFile][$propValue];
                    }
                }
                $macroProps[$index]["replacement"] = $replacement;
            } else {
                $macroProps[$index][$field] = $propValue;
            }
        }
    }

    // Add PREDEFINED macros
    $CrossRefPropsFiles["PREDEFINED"] = array();
    $nodeJsPort = get_prop_from_base_ui_props("nodejsPort");
    $appName = getAppName();
    $urlPrefix = "http://" . gethostname() . ":" . $nodeJsPort . $appName . $props['uiProp'];

    $index += 1;
    $macroProps[$index] = array();
    $macroProps[$index]["token"] = "APP_DIR";
    $macroProps[$index]["source"] = "PREDEFINED";
    $macroProps[$index]["replacement"] = $appName;
    $CrossRefPropsFiles["PREDEFINED"]["APP_DIR"] = $appName;

    $index += 1;
    $macroProps[$index] = array();
    $macroProps[$index]['token'] = 'URL_PREFIX';
    $macroProps[$index]['source'] = 'PREDEFINED';
    $macroProps[$index]['replacement'] = $urlPrefix;
    $CrossRefPropsFiles["PREDEFINED"]["URL_PREFIX"] = $urlPrefix;

    $index += 1;
    $macroProps[$index] = array();
    $macroProps[$index]["token"] = "HOSTNAME";
    $macroProps[$index]["source"] = "PREDEFINED";
    $macroProps[$index]["replacement"] = gethostname();
    $CrossRefPropsFiles["PREDEFINED"]["HOSTNAME"] = gethostname();

    $index += 1;
    $macroProps[$index] = array();
    $macroProps[$index]["token"] = "IP_ADDR";
    $macroProps[$index]["source"] = "PREDEFINED";
    $macroProps[$index]["replacement"] = $_SERVER['SERVER_ADDR'];
    $CrossRefPropsFiles["PREDEFINED"]["IP_ADDR"] = $_SERVER['SERVER_ADDR'];;

    $index += 1;
    $macroProps[$index] = array();
    $macroProps[$index]["token"] = "NODEJS_PORT";
    $macroProps[$index]["source"] = "PREDEFINED";
    $macroProps[$index]["replacement"] = $nodeJsPort;
    $CrossRefPropsFiles["PREDEFINED"]["NODEJS_PORT"] = $nodeJsPort;

    return $macroProps;
}

function replaceMacros(&$props, $macroProps) {
    foreach ($props as $propKey => $propValue) {
        $newValue = $propValue;
        foreach ($macroProps as $macroKey => $macro) {
            $token = "\${" . $macro["token"] . "}";
                $newValue = str_replace($token, $macro["replacement"], $newValue);
            }
        $props[$propKey] = $newValue;
    }
}

function aggregateProps($UIProps) {
    $propArr = array(); // return value

    $digitRegEx = "/([0-9]+)/";

    foreach ($UIProps as $propKey => $propValue) {

        // Decide whether the property is an indexed array or a single record
        $keyArr = explode(".", $propKey);
        $n = count($keyArr);
        if ($n > 2 && (preg_match($digitRegEx, $keyArr[$n-2]) == 1) ) {
            // Indexed Array
            $propName = implode(".", array_slice($keyArr, 0, $n-2));
            $propIndex = $keyArr[$n-2];
            $propField = $keyArr[$n-1];

            if (!array_key_exists($propName, $propArr)) {
                $propArr[$propName] = array();
            }

            if (!array_key_exists($propIndex, $propArr[$propName])) {
                $propArr[$propName][$propIndex] = array();
            }
            $propArr[$propName][$propIndex][$propField] = $propValue;

        } else if ($n > 1) {
            // Single Record with fields
            $propName = implode(".", array_slice($keyArr, 0, $n-1));
            $propField = $keyArr[$n-1];

            if (!array_key_exists($propName, $propArr)) {
                $propArr[$propName] = array();
            }

            $propArr[$propName][$propField] = $propValue;

        } else /* $n == 1 */ {
            // Simple Key / Value Pair
            $propArr[$propKey] = $propValue;
        }
    }

    return $propArr;
}

function UIPropsToXml($UIProps) {
    $propsXML = "";
    $propArr = aggregateProps($UIProps);
    foreach ($propArr as $propName => $propValue) {
        if (is_array($propValue)) {
            $i = 0;
            foreach($propValue as $fld => $fldVal) {
                if (is_array($fldVal)) {
                    $propsXML .= "  <$propName\n";
                    $propsXML .= "    index=\"$i\"\n";
                    $propsXML .= "    id=\"$propName-$fld\"\n";
                    foreach($fldVal as $subFld => $subFldVal) {
                        $propsXML .= "    $subFld=\"" . htmlspecialchars($subFldVal) . "\"\n";
                    }
                    $propsXML .= "  />\n";
                    $i += 1;
                } else {
                    $i += 1;
                    if ($i == 1) {
                        $propsXML .= "  <$propName \n";
                    }
                    $propsXML .= "    $fld=\"" . htmlspecialchars($fldVal) . "\"\n";
                    if ($i == count($propValue)) {
                        $propsXML .= "  />\n";
                    }
                }
            }
        } else {
            $propsXML .= "  <$propName value=\"" . htmlspecialchars($propValue) . "\" />\n";
        }
    }
    return $propsXML;
}
