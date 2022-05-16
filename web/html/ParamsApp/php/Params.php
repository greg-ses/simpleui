<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "ParamHelper.php";


function writeInvalidRowError($rowLabel, $row, $missingKey) {
    $errorMsg = sprintf("%s is missing key '%s'", $rowLabel, $missingKey);
    $errorContext = $rowLabel . ":\n";
    foreach ($row as $i) {
        $errorContext .= $i . ",";
    }
    writeError("1", "101", "missing key", $errorContext);
}

function isSameParam($prevRow, $currRow) {
    static $paramIdentifierFields = array("subsystem", "catDisplayOrder", "paramDisplayOrder", "category", "paramName");

    $ret = true;
    $prev = "";
    $curr = "";
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
$fields = array("catDisplayOrder", "paramDisplayOrder", "category", "paramName",
                "type", "min", "max", "description", "detail", "subsystem",
                "timestamp",
                "Res1Name", "Res1Val", "Res2Name", "Res2Val", "Res3Name", "Res3Val",
                "Res4Name", "Res4Val", "Res5Name", "Res5Val", "Res6Name", "Res6Val",
                "Res7Name", "Res7Val", "Res8Name", "Res8Val"/*, "Res9Name", "Res9Val",
                "Res10Name", "Res10Val", "Res11Name", "Res11Val", "Res12Name", "Res12Val",
                "Res13Name", "Res13Val", "Res14Name", "Res14Val", "Res15Name", "Res15Val",
                "Res16Name", "Res16Val"*/);
$last = "Res8Val";


$category = "";
if (! empty($_GET['category'])) {
    $category = $_GET['category'];
}

$maxHistoryRows = 0;
if (! empty($_GET['MaxHistoryRows'])) {
    $maxHistoryRows = $_GET['MaxHistoryRows'];
}

$query = "select " . implode(",", $fields) . " from ParameterResourcePivot";
if (! empty($category)) {
    $query .= "/* where category = '" . $category . "'";
}


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

$historyRows = 0;
$prevRow = [];

$isFirstRow = true;
$outJSON = "";
while($row = $result->fetch_array(MYSQLI_ASSOC)) {
    if (!$isFirstRow && isSameParam($prevRow, $row)) {
        if ($historyRows++ > $maxHistoryRows) {
            continue;
        }
    } else {
        $historyRows = 1;
        $prevRow = $row;
    }

    if ($isFirstRow) {
        $isFirstRow = false;
        $outJSON .= "{";
    } else {
        $outJSON .= ",\n{";
    }

    foreach ($fields as &$f) {
        $outJSON .= "\"$f\":\"$row[$f]\"";
        if ($f == $last) {
            $outJSON .= "}";
        } else {
            $outJSON .= ",";
        }
    }
}
$result->close();

$outJSON = "{\n\n\"query\": \"$query\", \n\n\"records\":[\n$outJSON\n],\n\n\"MaxHistoryRows\": \"$maxHistoryRows\",\n\n\"status\": \"0\"\n}\n";
$conn->close();

echo($outJSON);

?>
