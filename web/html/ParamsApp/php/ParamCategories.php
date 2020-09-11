<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("127.0.0.1", "root", "read42us3", "BSC");
$fields = array("catDisplayOrder", "category", "paramCount", "visibleParamCount");
$last = "visibleParamCount";

$result = $conn->query("select " . implode(",", $fields) . " from ParameterCategory");

$outJSON = "";
while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
	$outJSON .= ( empty($outJSON)  ?  "{"  :  ",\n{" );
	
	foreach ($fields as &$f) {
		$outJSON .= "\"$f\":\"$rs[$f]\"" . ($f == $last ? "}" : ",");
	}
}
$outJSON ="{\"records\":[\n$outJSON\n]}";
$conn->close();

echo($outJSON);
?>
