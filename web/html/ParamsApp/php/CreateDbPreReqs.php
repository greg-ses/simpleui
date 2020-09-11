<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

/* require_once "../../../php/creds.php"; */
require_once "ParamHelper.php";
require_once "DbSchemaDefs.php";

$tableList = createRequiredDbEntities($MYSQL_DB, $MYSQL_USER, $MYSQL_PWD, $MYSQL_HOST);

$outJSON = "\n{\"Tables/Views Created\": \"$tableList\"}";

echo($outJSON);
?>
