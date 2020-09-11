<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "ParamHelper.php";


$conn = new mysqli($MYSQL_HOST, $MYSQL_USER, $MYSQL_PWD, $MYSQL_DB);
if ($conn->connect_errno) {
	$errorContext = sprintf("mysqli Connect(%s, %s, %s, %s)", $MYSQL_HOST, $MYSQL_USER, "****", $MYSQL_DB);
	writeError("1", $conn->connect_errno, $conn->connect_error, $errorContext);
	exit();
}

$paramFields = array('name', 'resource', 'subsystem', 'category', 'timestamp', 'Value', 'user');
// $file_get_contents = file_get_contents('php://input');
$data = json_decode(file_get_contents('php://input'), true);

//var_dump($data, true);

/* $category = $_GET['category']; */
if (($_SERVER["REQUEST_METHOD"] == "POST") /* && empty($_POST) */) {
	if (isset($_SERVER["CONTENT_TYPE"]) && (strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false)) {
//		echo "json:";
		$_POST = json_decode(file_get_contents('php://input'), true);
	}
}

$query = "INSERT INTO $DataParameterTable(" . implode(",", $paramFields)  .  ")"   .   "\nVALUES";

$i = 0;
foreach ($data["newParamValues"] as $newParamValue) {
	$i++;
	$query .= "\n  (";
	$j = 0;
	foreach ($paramFields as $fld) {
		$j++;
		$query .= "\""  .  $newParamValue[$fld]  .  "\""  .  ($j < count($paramFields) ? "," : "");
	}
	$query .=  ")"  .  ($i < count($data["newParamValues"]) ? "," : ";");
}

$i++;

$result = $conn->query($query);
if ($result === false) {
	writeError("1", "102", "Query failed", $query);
	exit();
} else {
	$outJSON = "{\"response\": \"200\", \"result\": \"$result - $i records added.\"}";
	writeError("0", "200", $outJSON, $query);
};

// $outJSON ="{\"response\": \"200\"}";
// $outJSON ="{}";

/*
$outJSON ="{\"_SERVER.REQUEST_METHOD\": \""   .  $_SERVER["REQUEST_METHOD"]  .   "\","   .
		    "\n\"_SERVER.CONTENT_TYPE\": \""   .  $_SERVER["CONTENT_TYPE"]  .   "\","   .
		    "\n\"query\": \"$query\","   .
			"\n\"result\": \"$result - $i records added.\"}";
*/
$conn->close();

//echo($outJSON);
?>
