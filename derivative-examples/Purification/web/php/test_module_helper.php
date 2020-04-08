<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 5/17/16
 * Time: 10:14 AM
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");

require_once "module_helper.php";

loadModSvrProps();

$myProps = array(
    "DatabaseMgr.RESOURCE_ID",
    "DatabaseMgr.MYSQL_USER",
    "DatabaseMgr.MYSQL_PWD",
    "DatabaseMgr.MYSQL_HOST",
    "DatabaseMgr.MYSQL_PORT",
    "DatabaseMgr.MYSQL_SYSDB",
    "DatabaseMgr.MYSQL_CYCDB",
    "DatabaseMgr.enabled",
    "DatabaseMgr.update_rate",
    "DatabaseMgr.table",
    "DatabaseMgr.master",

    "BMCDataService.enabled",
    "BMCDataService.data.port",
    "BMCDataService.simulate",

    "MBSlaveService.port",
    "MBSlaveService.listenip",
    "MBSlaveService.modulenum",

    "control_object.num_stacks",
    "control_object.enabled"
);

echo '<?xml version="1.0" encoding="utf-8"?>';
echo "<ModuleServer.properties.elements>\n";
foreach ($myProps as $prop) {
    printf("<%s>%s</%s>\n", $prop, getModSvrProp($prop, ""), $prop);

}
echo "</ModuleServer.properties.elements>\n";

/*  Some old test
$outXML = "";
$xmlFileName = "";
$samples = 0;

$fn = "../apps/modmgr/app/tests/mock-system-summaries.xml";
$versions = 5;

$newFn = getRandomNthFilenameVersion($fn, $versions);

echo "          fn: " . $fn . "\nfn + version: " . $newFn . "\n";

validateAndEchoXmlFile($newFn, __FILE__);
*/



?>


