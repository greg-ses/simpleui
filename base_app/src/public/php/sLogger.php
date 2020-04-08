<?php


// Set to LOG_INFO when put into production, LOG_DEBUG for dev.
if (is_null($log_file)) { $log_file = "DEFAULT_PHP_LOG";}
$log = new sLogger(LOG_INFO, $log_file);

class sLogger
{
    private $_logSource;
	var $_level;
	var $_writeErrors;

    function __construct($level, $logSource)
    {
        if (!defined("LOG_EMERG")) define("LOG_EMERG", 0);
        if (!defined("LOG_ALERT")) define("LOG_ALERT", 1);
        if (!defined("LOG_CRIT")) define("LOG_CRIT", 2);
        if (!defined("LOG_ERR")) define("LOG_ERR", 3);
        if (!defined("LOG_WARNING")) define("LOG_WARNING", 4);
        if (!defined("LOG_NOTICE")) define("LOG_NOTICE", 5);
        if (!defined("LOG_INFO")) define("LOG_INFO", 6);
        if (!defined("LOG_DEBUG")) define("LOG_DEBUG", 7);
        if (!defined("LOG_VERBOSE")) define("LOG_VERBOSE", 8);

        $this->_logSource = $logSource;
		$this->_level = $level;	
		$this->_writeErrors = 0;

        openlog($this->_logSource, LOG_CONS, LOG_SYSLOG);

        $this->logData(LOG_VERBOSE, "sLogger::constructor()");
        // $this->logData(LOG_VERBOSE, "0MQ version: " . ZMQ::LIBZMQ_VER);

	}

	function __destruct()
    {
        closelog();
    }

	function setLevel($level)
	{
		$this->_level = $level;	
	}
	
	public function logData($prio, $string)
	{
        //This is the ng-simple ui sLogger
        // return;

        if ($prio > $this->_level)
        {
            //echo "Called with level $prio which is less then $this->_level \n";
            //syslog($this->_level | LOG_SYSLOG, "Cannot log this message " . $prio . " " . $this->_level);
            return;
        }


        try {

			$requester = (array_key_exists('REMOTE_ADDR', $_SERVER) ? $_SERVER['REMOTE_ADDR'] : 'XXX');
            // $message = date("m/d/y G:i:s") . " $prio, $this->_writeErrors, $requester: $string\n";
            $message = $this->_writeErrors . "," . $requester . ":" . $string;

            syslog($this->_level | LOG_SYSLOG, $message);

	    } catch (Exception $e) {
			$this->_writeErrors += 1;
		}

    }
}
