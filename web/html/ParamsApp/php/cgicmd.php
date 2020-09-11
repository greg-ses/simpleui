<?php


require_once "php_config/config.php";
require_once "modules/sLogger.php";

$log->setLevel(LOG_INFO); // (LOG_NOTICE);



class ObjInfo
{
	public $description = "";	

	function __construct($description)
	{
		$this->description = $description;
	}
}

$objs = array();

$objs["FleetData"] = new ObjInfo("Fleet wide type information");
$objs["DbReader"] = new ObjInfo("Charting and data export support");
$objs["AutoCycle_cmd"] = new ObjInfo("Automatic Cycling script data");
$objs["io"] = new ObjInfo("IO Template and Data support");
$objs["Pump"] = new ObjInfo("Pump Options and Data support");
$objs["Params"] = new ObjInfo("Parameters support");


$command = $_REQUEST['CGI'];

if(is_object($objs[$command]))
{
	require_once  $command . ".php";
	
	$obj = new $command($log);	
	
	$obj->proccessCommand();
}
else 
{
	echo "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\"> "	;
	echo "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">"	;
	echo "<head>"															;
	echo "</head>"  														;
	echo "<body>"															;

	echo "<h2> " . "cgicmd.php" . " </h2>";

	echo "<p><font color=\"red\">" . "Unkown command : " . $command . "</font>";
	
	echo "<p>- Usage : <i> cgicmd.php&CGI=OBJECT&(GET|SET)=COMMAND[&VAL=VALUE] </i>";

	if(count($objs)>0)
	{
		echo "<p><b> - The following objects are supported </b>";

		echo "<table border=1 cellpadding=4>";
		echo "<tf><th width=200>Command</th><th width=400>Description</th></tr>" ;
		//echo "<tf><th width=200>Command</th><th width=400>Description</th><th width=600>Query options</th></tr>" ;
		
		foreach($objs as $obj => $info)
		{
			echo "<tr><td><a href=\"cgicmd.php?CGI=" . $obj . "&" . "\">" . $obj . "</a>";
			echo "</td><td>" . $info->description;
			//echo "</td><td>" . $info->usage;
			echo "</td></tr>";
		}
		echo "</table>";
	}

	echo "</body>"															;
	echo "</html>"															;
}

