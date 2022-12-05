<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "ParamHelper.php";
require_once "DbSchemaDefs.php";
//require_once "sLogger.php";

//$log->logData(LOG_INFO, "NewParams.php");

function writeInvalidRowError($rowLabel, $row, $missingKey) {
    $errorContext = $rowLabel . ":\n";
    foreach ($row as $i) {
        $errorContext .= $i . ",";
    }
    writeError("1", "101", "missing key", $errorContext);
}

function isSameParam($prevRow, $currRow) {
    static $paramIdentifierFields = array("subsystem", "catDisplayOrder", "paramDisplayOrder", "category", "paramName");

    $ret = true;
    foreach ($paramIdentifierFields as $g) {
        if (!array_key_exists($g, $prevRow)) {
            writeInvalidRowError("prevRow", $prevRow, $g);
            exit();
        }
        if (!array_key_exists($g, $currRow)) {
            writeInvalidRowError("currRow", $currRow, $g);
            exit();
        }

        if ($prevRow[$g] <> $currRow[$g]) {
            $ret = false;
        }
    }

    /* printf("\n{\"comparing\":\n { \"%s\",\n   \"%s\",\n   \"%s\",\n  \"return\": \"%d\" },\n", $g, $prev, $curr, $ret); */
    return $ret;
}


function isSameResource($prevRow, $currRow) {
    static $paramIdentifierFields = array("subsystem", "catDisplayOrder", "paramDisplayOrder", "category", "paramName", "resource");

    $ret = true;
    foreach ($paramIdentifierFields as $g) {
        if (!array_key_exists($g, $prevRow)) {
            writeInvalidRowError("prevRow", $prevRow, $g);
            exit();
        }
        if (!array_key_exists($g, $currRow)) {
            writeInvalidRowError("currRow", $currRow, $g);
            exit();
        }

        if ($prevRow[$g] <> $currRow[$g]) {
            $ret = false;
        }
    }

    /* printf("\n{\"comparing\":\n { \"%s\",\n   \"%s\",\n   \"%s\",\n  \"return\": \"%d\" },\n", $g, $prev, $curr, $ret); */
    return $ret;
}


/* Main Execution Path */

/* Create required Database definitions if necessary */
$tableList = createRequiredDbEntities($MYSQL_DB, $MYSQL_USER, $MYSQL_PWD, $MYSQL_HOST, true);

/* Continue */
$fields = array("subsystem", "catDisplayOrder", "paramDisplayOrder", "category", "paramName", "type", "min", "max", "description", "detail", "resource", "timestamp", "value", "user");
$outerParamFields = array("subsystem", "catDisplayOrder", "paramDisplayOrder", "category", "paramName", "type", "min", "max", "description", "detail", "resource");
$resourceField = "resource";


$category = "";
if (! empty($_GET['category'])) {
    $category = $_GET['category'];
}


// Define empty defaults for debug trace flags that help understand where in the flow various pieces of data are created
$DT0 = "";
$DT1 = "";
$DT2 = "";
$DT3 = "";
$DT4 = "";
$DT5 = "";
$DT6 = "";
$DT7 = "";
$DT8 = "";
$DT9 = "";
if (! empty($_GET['DEBUG'])) {
    // add ?DEBUG=1 to URL to use
    $DT0 = "|0|";
    $DT1 = "|1|";
    $DT2 = "|2|";
    $DT3 = "|3|";
    $DT4 = "|4|";
    $DT5 = "|5|";
    $DT6 = "|6|";
    $DT7 = "|7|";
    $DT8 = "|8|";
    $DT9 = "|9|";
}

// $query = "
// SELECT apd.subsystem, apd.catDisplayOrder, apd.paramDisplayOrder, apd.category,
// apd.paramName, apd.type, apd.min, apd.max, apd.description, apd.detail,
// p.resource, p.`timestamp`, p.value, p.`user`
// FROM `AbstractParameterByCategory` AS apd
// INNER JOIN `$DataParameterTable` AS p
// ON apd.paramName = p.name
// AND apd.subsystem = p.subsystem
// AND apd.category = p.category
// ORDER BY apd.subsystem, apd.catDisplayOrder, apd.paramDisplayOrder, apd.category, p.name, p.resource asc, p.`timestamp` desc";

$query = "SELECT apd.subsystem, apd.catDisplayOrder, apd.paramDisplayOrder, apd.category,";
$query .= " apd.paramName, apd.type, apd.min, apd.max, apd.description, apd.detail,";
$query .= " p.resource, p.`timestamp`, p.value, p.`user`";
$query .= " FROM `AbstractParameterByCategory` AS apd";
$query .= " INNER JOIN `$DataParameterTable` AS p";
$query .= " ON apd.paramName = p.name";
$query .= " AND apd.subsystem = p.subsystem";
$query .= " AND apd.category = p.category";
$query .= " ORDER BY apd.subsystem, apd.catDisplayOrder, apd.paramDisplayOrder, apd.category, p.name, p.resource asc, p.`timestamp` desc";


$conn = new mysqli($MYSQL_HOST, $MYSQL_USER, $MYSQL_PWD, $MYSQL_DB);

if ($conn->connect_errno) {
    $errorContext = sprintf("mysqli Connect(%s, %s, %s, %s)", $MYSQL_HOST, $MYSQL_USER, "****", $MYSQL_DB);
    writeError("1", $conn->connect_errno, $conn->connect_error, $errorContext);
    exit();
}


$result = $conn->query($query);

if ($result === false) {
    writeError("1", "102", "Query failed", $query);
    exit();
}

$prevRow = array_fill_keys($fields, '');

$outJSON = "";
$outParamJSON = " ${DT8}{";
$outResourceJSON = "";
$outResourceHistory = "";
$paramIndex = 0;
$resourceIndex = -1;
$historyIndex = -1;

while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    if (isSameParam($prevRow, $row)) {
        // Same Param -- just append the resource

        if (isSameResource($prevRow, $row)) {
            // Same Resource - just append the history
            $historyIndex += 1;
            $outResourceHistory .= ",\n        ${DT3}{\n";
            $outResourceHistory .= "          ${DT3}\"historyIndex\": \"$historyIndex\",\n";
            $outResourceHistory .= "          ${DT3}\"timestamp\": " . json_encode($row["timestamp"]) . ",\n";
            $outResourceHistory .= "          ${DT3}\"value\": " . json_encode($row["value"]) . ",\n";
            $outResourceHistory .= "          ${DT3}\"user\": " . json_encode($row["user"]) . "\n";
            $outResourceHistory .= "        ${DT3}}";
        } else {
            // New resource - flush previous history and start a new resource and history
            $outResourceJSON .= "       ${DT4}\"history\":\n       ${DT4}[\n$outResourceHistory\n       ${DT4}]\n  ${DT4}},";
            $outParamJSON .= $outResourceJSON;

            // Start new resource
            $resourceIndex += 1;
            $outResourceJSON = "\n    ${DT4}{\n";
            $outResourceJSON .= "       ${DT4}\"resourceIndex\": \"$resourceIndex\",\n";
            $outResourceJSON .= "       ${DT4}\"resource\": " . json_encode($row["resource"]) . ",\n";

            // Start new history for the new resource
            $historyIndex = 0;
            $outResourceHistory = "        ${DT4}{\n";
            $outResourceHistory .= "          ${DT4}\"historyIndex\": \"$historyIndex\",\n";
            $outResourceHistory .= "          ${DT4}\"timestamp\": " . json_encode($row["timestamp"]) . ",\n";
            $outResourceHistory .= "          ${DT4}\"value\": " . json_encode($row["value"]) . ",\n";
            $outResourceHistory .= "          ${DT4}\"user\": " . json_encode($row["user"]) . "\n";
            $outResourceHistory .= "        ${DT4}}";
        }

    } else {
        // New Param
        if ($paramIndex > 0) {
            // Flush the previous param

            // First, flush the previous history
            $outResourceJSON .= "\n       ${DT1}\"history\":\n      ${DT7}[\n$outResourceHistory\n      ${DT7}]\n     ${DT1}}";

            // Flush the previous resource
            $outParamJSON .= "    $outResourceJSON\n   ${DT5}]\n ${DT9}}";

            $outJSON .= $outParamJSON;

            $outParamJSON = ",\n\n${DT1}{";

            $outResourceJSON = "";
            $resourceIndex = 0;

            $outResourceHistory = "";
            $historyIndex = 0;
        }

        $resourceIndex = 0;
        $outParamJSON .= "\n  ${DT0}\"paramIndex\":\"$paramIndex\",";
        foreach ($outerParamFields as &$f) {
            if ($f == $resourceField) {
                // Last field and composite resource field
                $outResourceJSON .= "\n  ${DT1}\"resources\":\n   ${DT0}[\n     ${DT0}{\n";
                $outResourceJSON .= "       ${DT0}\"resourceIndex\": \"$resourceIndex\",\n";
                $outResourceJSON .= "       ${DT0}\"resource\": ". json_encode($row["resource"]) . ",\n";

                $historyIndex = 0;
                $outResourceHistory = "        ${DT2}{ \n";
                $outResourceHistory .= "          ${DT2}\"historyIndex\": \"$historyIndex\",\n";
                $outResourceHistory .= "          ${DT2}\"timestamp\": " . json_encode($row["timestamp"]) . ",\n";
                $outResourceHistory .= "          ${DT2}\"value\": " . json_encode($row["value"]) . ",\n";
                $outResourceHistory .= "          ${DT2}\"user\": " . json_encode($row["user"]) . "\n";
                $outResourceHistory .= "        ${DT2}}";
            } else {
                // Regular outer field
                $outParamJSON .= "\n  ${DT2}\"$f\":" . json_encode($row[$f]) . ",";
            }
        }
        $paramIndex += 1;
    }

    $prevRow = $row;
}
$result->close();

if (!empty($outResourceJSON)) {


    // Flush previous history and start a new resource and history
    $outResourceJSON .= "       ${DT6}\"history\":\n       ${DT6}[\n$outResourceHistory\n      ${DT6}]\n    ${DT6}}";

    // Flush the previous param
    $outParamJSON .= "${DT6}$outResourceJSON\n";
    $outJSON .= $outParamJSON;
}

$outJSON = "{\n\n\"SQL_QUERY\": " . json_encode($query) . ",\n\n\"QUERY_POST_PROCESSING\": \"Collapse to unique parameter.\", \n\n\"records\":\n${DT6}[\n$outJSON  ${DT9}]\n ${DT9}}\n${DT9}],\n\n\"totalParameters\": \"$paramIndex\",\n\n\"status\": \"0\"\n}\n";
$conn->close();

echo($outJSON);

?>
