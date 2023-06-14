<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once "ParamHelper.php";

/* $category = $_GET['category']; */



// connect to DB
$conn = new mysqli($MYSQL_HOST, $MYSQL_USER, $MYSQL_PWD, $MYSQL_DB);
if ($conn->connect_errno) {
	$errorContext = sprintf("mysqli Connect(%s, %s, %s, %s)", $MYSQL_HOST, $MYSQL_USER, "****", $MYSQL_DB);
	writeError("1", $conn->connect_errno, $conn->connect_error, $errorContext);
	exit();
}


// incoming data from client
$post_data = json_decode(file_get_contents('php://input'), true);

$invalid_params = array();
$updated_param_counter = 0;

foreach ($post_data['newParamValues'] as $param) {
    // Find the bounds for the current param
    $name = $param['name'];
    $limitation_query = "SELECT type, min, max FROM $AbstractParameterTable WHERE name='$name'";
    $limitation_result = $conn->query($limitation_query);
    if ($limitation_result === false) {
        $info = array(
            "name" => $name,
            "reason" => "Limitation query failed. Param is potentially not in Abstract Params table"
        );
        array_push($invalid_params, $info);
        unset($info);
    }

    $row = $limitation_result->fetch_assoc();
    $allowed_type = strtolower($row['type']);
    $max_value = isset($row['max']) ? $row['max'] : null;
    $min_value = isset($row['min']) ? $row['min'] : null;

    $new_value = $param['Value'];

    $is_value_valid = is_user_input_valid($new_value, $allowed_type, $min_value, $max_value);

    if (!$is_value_valid) {
        // if the value isn't in range, save some info about it to tell the user later
        $info = array(
            "name" => $name,
            "value" => $new_value,
            "max" => $max_value,
            "min" => $min_value,
            "type" => $allowed_type
        );
        array_push($invalid_params, $info);
        continue;   // don't put invalid param into DB
    }

    $paramFields = array('name', 'resource', 'subsystem', 'category', 'timestamp', 'Value', 'user');
    $query = "INSERT INTO $DataParameterTable(" . implode(",", $paramFields) . ")"  .  " VALUES (\"" . implode("\" , \"", $param) . "\");";

    $result = $conn->query($query);
    if ($result === false) {
        // uhhhh something really bad happened...
        writeError("1", "102", "Could not set param $name in DataParams table", "Query Failed");
        exit();
    }
    $updated_param_counter = $updated_param_counter + 1;
}


if (empty($invalid_params)) {
    $outJSON = json_encode(array("response" => 200, "result" => "$updated_param_counter record(s) added"));
    writeError("0", "200", $outJSON, "Successfully completed operation");
} else {
    $outJSON = json_encode($invalid_params);
    writeError("2", "301", "Some params are invalid. Updated $updated_param_counter record(s).", $outJSON);
}


$conn->close();

