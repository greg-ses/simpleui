<?php

$SCRIPT_PATH = dirname($_SERVER["SCRIPT_FILENAME"]);

require_once ($SCRIPT_PATH . "/sui_command.php");
require_once ($SCRIPT_PATH . "/sui_helper.php");
require_once ($SCRIPT_PATH . "/sLogger.php");

$APP_DIR = getAppName();
$REQUEST_URI = $_SERVER["REQUEST_URI"];
$requestUrl = $REQUEST_URI;
$requestPath = parse_url($requestUrl, PHP_URL_PATH);

printf("<table>\n");
printf("<tr><th>%s</th><th>%s</th></tr>\n", "Variable", "Value");
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$SCRIPT_PATH", $SCRIPT_PATH);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "getAppName()", getAppName());
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$APP_DIR", $APP_DIR);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$_SERVER[\"DOCUMENT_ROOT\"]", $_SERVER["DOCUMENT_ROOT"]);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$_SERVER[\"REQUEST_URI\"]", $_SERVER["REQUEST_URI"]);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$_SERVER[\"PHP_SELF\"]", $_SERVER["PHP_SELF"]);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$_SERVER[\"PATH_TRANSLATED\"]", $_SERVER["PATH_TRANSLATED"]);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$_SERVER[\"SCRIPT_NAME\"]", $_SERVER["SCRIPT_NAME"]);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$_SERVER[\"SCRIPT_FILENAME\"]", $_SERVER["SCRIPT_FILENAME"]);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$requestUrl", $requestUrl);
printf("<tr><td>%s</td><td>%s</td></tr>\n", "\$requestPath", $requestPath);
printf("</table>\n");

?>