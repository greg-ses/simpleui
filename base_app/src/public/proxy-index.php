<?php
/**
 * Created by PhpStorm.
 * User: jscarsdale
 * Date: 1/12/18
 * Time: 05:36 PM
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

function main()
{
    $relativeReference = "/(href|src)(=[\"'])(\\" . dirname($_SERVER["PHP_SELF"]) . ")/";
    $matches = null;
    $protocol = $_SERVER["HTTPS"];
    if ($protocol == "") {$protocol = "http";}

    $proxyHostAndPort = $protocol . "://" . $_SERVER["SERVER_NAME"];
    if (  ($_SERVER["SERVER_PORT"] == "80" && (0 == strcasecmp($protocol, "http")))
        || ($_SERVER["SERVER_PORT"] == "443" && (0 == strcasecmp($protocol, "https")))) {
        // don't append port
        $proxyHostAndPort .= "/" . gethostname();
    } else {
        $proxyHostAndPort .= ":" . $_SERVER["SERVER_PORT"] . "/" . gethostname();
    }

    $INPUT_FILE = dirname($_SERVER["SCRIPT_FILENAME"]) . "/index.html";

    /*
    printf("INPUT_FILE: %s\n", "$INPUT_FILE");
    printf("relativeReference: %s\n", "$relativeReference");
    printf("proxyHostAndPort: %s\n", "$proxyHostAndPort");
    */

    $inFile = fopen("$INPUT_FILE", "r") or die("Unable to open file $INPUT_FILE!");
    while ( ($line = fgets($inFile, 4096)) !== false) {
        if (preg_match($relativeReference, $line, $matches) == 1) {
            $line = preg_replace($relativeReference, "$1$2$proxyHostAndPort$3", $line);
        }
        echo($line);
    }
    fclose($inFile);
}

main();
?>
