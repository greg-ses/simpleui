<?php

$log_file = "file:///var/log/ppcData/fleet_server.log";

//$log_file = "c:/temp/fleet_view.log";

// Database connection.

$db_conn	= 'localhost:3306';			// Depricate after PDO's work everywhere.

// ** Local MySql database
$pdo_conn   = 'mysql:host=localhost;'; 	// Must add the database. "dbname=thename"
$db_user	= 'sys_mon';
$db_psswd	= 'ZnBr2';

// ** SQLite db
//$pdo_conn   = 'sqlite:';		// Include the direcory, the dbname will be added by the code.
//$db_user	= '';
//$db_psswd	= '';


?>