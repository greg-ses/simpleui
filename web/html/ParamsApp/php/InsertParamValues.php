<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "ParamHelper.php";

/* $category = $_GET['category']; */




$conn = new mysqli($MYSQL_HOST, $MYSQL_USER, $MYSQL_PWD, $MYSQL_DB);
if ($conn->connect_errno) {
	$errorContext = sprintf("mysqli Connect(%s, %s, %s, %s)", $MYSQL_HOST, $MYSQL_USER, "****", $MYSQL_DB);
	writeError("1", $conn->connect_errno, $conn->connect_error, $errorContext);
	exit();
}


// incoming data from client
$data = json_decode(file_get_contents('php://input'), true);



// set the $_POST variable (not sure why)
if (($_SERVER["REQUEST_METHOD"] == "POST") /* && empty($_POST) */) {
	if (isset($_SERVER["CONTENT_TYPE"]) && (strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false)) {
		$_POST = json_decode(file_get_contents('php://input'), true);
	}
}


// Get the type, possible min, and possible max values for this item in the DB
$name = $_POST['newParamValues'][0]['name'];
$user_input = $_POST['newParamValues'][0]['Value'];
$limitation_query = "SELECT type, min, max FROM $AbstractParameterTable WHERE name='$name'";
$limitation_result = $conn->query($limitation_query);
if ($limitation_result === false) {
	writeError("1", "102", "Limitation Query failed", $limitation_query);
    exit();
}


// check if input is valid with the DB type, min, and max
$isInputValid = false;
if ($limitation_result->num_rows > 0) {
	$row = $limitation_result->fetch_assoc();
	$allowed_type = strtolower($row['type']);
	$max_value = isset($row['max']) ? $row['max'] : null;
	$min_value = isset($row['min']) ? $row['min'] : null;

	$isInputValid = is_user_input_valid($user_input, $allowed_type, $min_value, $max_value);
}


// if invalid, send error response
if (!$isInputValid) {
	$invalid_input_json_response = array();
	// send a response "invalid item entered"
	writeError("1", "105", "invalid item entered. Either wrong type, or not in within range", $user_input);
	exit();
}


$paramFields = array('name', 'resource', 'subsystem', 'category', 'timestamp', 'Value', 'user');

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


$conn->close();


