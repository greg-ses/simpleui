<?php

$SCRIPT_PATH = dirname($argv[0]);
require_once ($SCRIPT_PATH . "/xml-diff-tool.php");

function main() {
    global $argv;

    $appName = $argv[1];
    $inXmlFile = $argv[2];
    $outJSONFile = $argv[3];
    $keepTempFile = ( (count($argv) == 5) && ("$argv[4]" == "keepTempFile") );

    echo "appName: " . "$appName" . "\n";
    echo "inXmlFile: " . "$inXmlFile" . "\n";
    echo "outJSONFile: " . "$outJSONFile" . "\n";
    echo "keepTempFile: " . "$keepTempFile" . "\n";

    XmlDiffTool::  getPhpJsonShim($inXmlFile, $outJSONFile, $keepTempFile);

    return 0;
}

return main();

?>