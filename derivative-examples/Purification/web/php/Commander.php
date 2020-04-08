<?php

require_once "php_config/config.php";
require_once "modules/sLogger.php";
//require_once "modules/FirePHPCore/fb.php";

class CmdInfo
{
	public $func = "";
	public $usage = "";
	public $desc = "";
	
	function __construct($function, $use, $description)
	{
		$this->func = $function;
		$this->usage = $use;
		$this->desc = $description;
	}
}

class Commander
{
	public $log;
	
	public $obj_name;
	public $gets = array();		// Contains the array of potential GET commands.
	public $sets = array();		// Contains the array of potential SET commands.
	public $commands = array();	// Contains the array of potential COMMAND commands.
	
	function __construct($slogger, $obj_name)
	{
		$this->log = $slogger;
		$this->obj_name = $obj_name;
	}

	function proccessCommand()
	{
        try {
            $func = NULL;
            $command = NULL;

            if (isset($_REQUEST['GET'])) {
                $commandType = $_REQUEST['GET'];
                $command = $this->gets[$commandType];
            } else if (isset($_REQUEST['SET'])) {
                $commandType = $_REQUEST['SET'];
                $command = $this->sets[$commandType];
            } else if (isset($_REQUEST['COMMAND'])) {
                $commandType = $_REQUEST['COMMAND'];
                $command = $this->commands[$commandType];
            }

            if (is_object($command)) {
                $func = $this->obj_name . "::" . $command->func;
            }

//echo "command->func: " . $command->func;
            $this->log->logData(LOG_DEBUG, "Just entered; Commander::proccessCommand(): obj:". $this->obj_name . " cmdType:" .$commandType);
         
            if ( ! is_null($func)) {
                if (is_callable($func)) {
                    call_user_func([$this, $command->func]);
                } else {
                    self::cmd_error("Callback function not correctly defined for " . $this->obj_name . "::" . $command->func);
                }
            } else {
                self::cmd_error("Not defined " . $this->obj_name . "::" . $commandType);
            }
        }
        catch(Exception $e) {
            $this->_recordError($e, 'proccessCommand');
        }
	}

	function error_out($error_string)
	{
		global $sql_set;
		global $log;
	
		$log->logData(LOG_VERBOSE, "error_out($error_string)");
		
		echo "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\"> "	;
		echo "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">"	;
		echo "<head>"															;
		echo "</head>"  														;
		echo "<body>"															;
	
		echo "<h2> " . $this->obj_name . " </h2>";
	
		echo "<p><font color=\"red\">" . $error_string . "</font>";
		
		echo "<p>- Usage : <i> cgicmd.php?CGI=".$this->obj_name."&(GET|SET|COMMAND)=SOME_COMMAND[&VAL=VALUE] </i>";
		
		echo "</body>"															;
		echo "</html>"															;
	}
	
	function cmd_error($error_string="Unrecognized command or no command")
	{
		global $sql_set;
		global $log;
	
		$log->logData(LOG_VERBOSE, "cmd_error($error_string)");
		
		echo "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\"> "	;
		echo "<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\">"	;
		echo "<head>"															;
		echo "</head>"  														;
		echo "<body>"															;
	
		echo "<h2> " . $this->obj_name . " </h2>";
	
		echo "<p><font color=\"red\">" . $error_string . "</font>";
		
		echo "<p>- Usage : <i> cgicmd.php?CGI=".$this->obj_name."&(GET|SET|COMMAND)=SOME_COMMAND[&VAL=VALUE] </i>";
	
		if(count($this->gets)>0)
		{
			echo "<p><b> - The following GET commands are supported </b>";
			self::printCmdList($this->gets);
		}
		if(count($this->sets)>0)
		{
			echo "<p><b> - The following SET commands are supported </b>";
			self::printCmdList($this->sets);
		}
		if(count($this->commands)>0)
		{
			echo "<p><b> - The following COMMAND commands are supported </b>";
			self::printCmdList($this->commands);
		}
	
		echo "</body>"															;
		echo "</html>"															;
	}
	
	function printCmdList($list)
	{
		echo "<table border=1 cellpadding=4>";
		echo "<tf><th width=200>Command</th><th width=400>Description</th><th width=600>Query options</th></tr>" ;
	
		foreach($list as $cmd => $info)
		{
			echo "<tr><td><a href=\"cgicmd.php?CGI=".$this->obj_name."&" . $info->usage . "\">" . $cmd . "</a>";
			echo "</td><td>" . $info->desc;
			echo "</td><td>" . $info->usage;
			echo "</td></tr>";
		}
		echo "</table>";
	}
    
    private function _recordError($exception, $functionName)
    {
        ob_start();
        FB::error($exception, $functionName);
    }
}
