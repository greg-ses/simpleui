<?php
// for debug
//require_once "modules/FirePHPCore/fb.php";
//ob_start();
//FB::info("loaded DbReader");

// default target working dir (nginx): /usr/share/nginx/www/php/
require_once "Commander.php";
require_once "modules/FleetMonitorDB.php";
require_once "modules/DB_Data.php";
require_once "modules/xmlHelper.php";
require_once "modules/sqlSet.php";
require_once "modules/sqlSetData.php";
require_once "modules/sqlData.php";
require_once "modules/CsvString.php";
require_once "modules/Environment.php";
require_once "modules/Factory.php";
require_once "modules/IDataCompiler.php";
require_once "modules/IDataExporter.php";
require_once "modules/efficiency/EfficiencyDTO.php";
require_once "modules/efficiency/EfficiencyReport.php";
require_once "modules/efficiency/IEfficiency.php";
require_once "modules/efficiency/ModeDuration.php";
require_once "modules/webClient/IWebClient.php";
require_once "modules/webClient/HttpWebClient.php";

require_once "FleetConsts.php";
require_once "DbSqlSetData.php";

use efficiency\EfficiencyDTO;
use efficiency\EfficiencyReport;
use efficiency\IEfficiency;
use efficiency\ModeDuration;

class DbReader extends Commander
{
	const NUM_TF_QUADS = 4;
    const DCDC_SAMPLE_INTERVAL_MS = 60000;
    
	function __construct($slogger)
	{
		parent::__construct($slogger, get_class());

		$this->gets["DATA_SETS"]		= new CmdInfo(cmd_DATA_SETS
												, "GET=DATA_SETS&MACH_TYPE=TF2000"
												, "An xml formed list of available data sets. [SET_FILE=abx.xml]");
		$this->gets["CHART_TEMPLATE"]	= new CmdInfo(cmd_CHART_TEMPLATE
												, "GET=CHART_TEMPLATE&MAJOR=TF2000&MINOR=Accumulators&ID=TF2000_0035"
												, "Essentially the column information");
		$this->gets["DATA_SET_RANGE"]	= new CmdInfo(cmd_DATA_SET_RANGE2
												, "GET=DATA_SET_RANGE&MAJOR=TF2000_Quad&MINOR=Accumulators&ID=TF2000_0035_Q3&BEGIN=1333993739999&END=1334166540000&LASTID=0&MAXNUMPTS=1000"
												, "The actual data.");
        $this->gets["DATA_SET_EXPORT"]	= new CmdInfo(cmd_DATA_SET_EXPORT
                                        , "GET=DATA_SET_EXPORT&MAJOR=TF2000_Quad&MINOR=Accumulators&ID=TF2000_0035_Q3&BEGIN=1333993739999&END=1334166540000&RESOLUTION=10"
                                        , "The actual data.");
        $this->gets["EXPORT_TEST"]	= new CmdInfo(cmd_test_export_data
                                , "GET=DATA_SET_EXPORT&MAJOR=TF2000_Quad&MINOR=Accumulators&ID=TF2000_0035_Q3&BEGIN=1333993739999&END=1334166540000&RESOLUTION=10"
                                , "The actual data.");
		$this->gets["LOG_DATA"]			= new CmdInfo(cmd_LOG_DATA
												, "GET=LOG_DATA&ID=TF2000_0035_Q3&BEGIN=1333993739999&END=1334166540000&LASTID=0&MAXNUMPTS=1000"
												, "The event log data.");
        $this->gets["EFFICIENCY_TEMPLATE"]	= new CmdInfo(cmd_EFFICIENCY_TEMPLATE
                                                , "GET=EFFICIENCY_TEMPLATE"
                                                , "Efficiency grid template");
        $this->gets["EFFICIENCY_DATA"]	= new CmdInfo(cmd_EFFICIENCY_DATA
                                                , "GET=EFFICIENCY_DATA"
                                                , "Efficiency grid data");
	}

	function cmd_DATA_SETS()
	{		
		$set_file = $_REQUEST['SET_FILE'];
		if($set_file == "")
			$set_file = "standard_dataSets.xml";
			
		$mach_type = $_REQUEST['MACH_TYPE'];
		if($mach_type == "")
			$mach_type = self::getMachTypeFromId($_REQUEST['ID']);

		if($mach_type === NULL)
		{
			parent::error_out("cmd_DATA_SETS : Unable to detmine machine type of <i>".$_REQUEST['ID']."</i> ");
		}
		else 
		{
			$this->log->logData(LOG_DEBUG, "cmd_DATA_SETS() ID:" .$_REQUEST['ID']. " Type:" . $mach_type);
			
			header('Content-type: application/xml');
			
			echo file_get_contents("userFiles/" . $mach_type . "/" . $set_file);
		}
	}

	function cmd_CHART_TEMPLATE()
	{		
		$setdata = new DbSqlSetData($this->log);
		
		if($setdata->system_type != self::getMachTypeFromId($setdata->rsrc_id) )
		{
			parent::error_out("cmd_CHART_TEMPLATE : Machine type mismatch for <i>".$setdata->rsrc_id."</i> ");
			return;
		}
		
		if($setdata->ReadSetFile() == false)
		{
			parent::error_out("Unable to open " . $setdata->set_file_name);
		}
		else
		{
			$response = new ppcXml("<dataTemplate></dataTemplate>");
		
			$setdata->DataTemplateToXml($response);
	
			header('Content-type: application/xml');
			//echo $response->asXML();
			echo $response->asPrettyXML();
		}
	}
    
	/*
	function cmd_DATA_SET_RANGE()
	{		
		$setdata = new DbSqlSetData($this->log);
		
		if($setdata->system_type != self::getMachTypeFromId($setdata->rsrc_id) )
		{
			parent::error_out("cmd_DATA_SET_RANGE : Machine type mismatch for <i>".$setdata->rsrc_id."</i> ");
			return;
		}

		$response = new ppcXml("<dataSet></dataSet>");
		
		$response->addChild("timestamp", mSecondsSince1970());
		
		$real_time = false;
		
		if($real_time || $_REQUEST['UNFILTERED']==1)
			$record = $setdata->GetDataFromSql();		// Get
		else
			$record = $setdata->GetDataFromSql(1000000);		// Get them all
		
		if($this->log->_level > LOG_INFO || $_REQUEST['SQL']==true)
			$response->addChild("SQL_STRING", $setdata->sql_completed);
	
		$rows = $response->addChild("data");			
		
		if($record !== false)
		{													
			$num_points_being_sent = 0;
			
			if($real_time 
				|| $setdata->db_data->num_records <= $_REQUEST['MAXNUMPTS']
				|| $_REQUEST['UNFILTERED']==1) 		// Return the unfiltered xml data stream.
			{
				$this->log->logData(LOG_DEBUG, "sql_data | Creating unfiltered row data.");
	
				while($record && $setdata->db_data!==false)
				{
					$data_row = "";
					$sep = "";
				
					for($c=0; $c<count($record); $c++)
					{
						$data_row .= $sep;
						if($record[$c] != "")
							$data_row .= $record[$c];
						else
							$data_row .= " ";
						$sep = ",";
					}
				
					$num_points_being_sent++;
					$rows->addChild("d", $data_row);
					
					$record = $setdata->db_data->nextRow();
				}
				
				$this->log->logData(LOG_INFO, "sql_data | Unfiltered data, Sent ".$num_points_being_sent." rows of ".$setdata->db_data->num_records);
			}	
			else 		// Create a filtered dataset.
			{
				$this->log->logData(LOG_DEBUG, "sql_data | Creating filtered row data.");
	
				$x_pixel = $setdata->x_pix;
				$y_pixel = $setdata->y_pix;
				$chart_min = $setdata->y_min;	// The data will modify these if applicable.
				$chart_max = $setdata->y_max;	
			
				$plots_due_to_x_axis = 0;
				$plots_due_to_y_axis = 0;
				
				// If it's an indexed table.
				if(true===$setdata->indexField && strlen($setdata->idxRangeStr)>0)
				{
					$last_ts = Array();
					$last_val = Array();
					$plot_point = Array();
					for($c=$setdata->idxMin; $c<=$setdata->idxMax; $c++)
						$plot_point[$c] = true;
						
					while($record && $setdata->db_data!==false && $num_points_being_sent<=$_REQUEST['MAXNUMPTS'])
					{
						$id_num = intval($record[3]);
						
						// Look for changes in x axis time data
						if(!$plot_point[$id_num]) {
							$plot_point[$id_num] = ( floatval($record[1])-$last_ts[$id_num] >= ($setdata->end-$setdata->begin)/$x_pixel );
							if($plot_point[$id_num]==true)
								$plots_due_to_x_axis++;
						}
							
						$chart_min = min(floatval($record[4]), $chart_min);
						$chart_max = max(floatval($record[4]), $chart_max);
						
						// Look for changes in y axis data.
						if(!$plot_point[$id_num]) {
							$plot_point[$id_num] = (abs($last_val[$id_num] - floatval($record[4])) >= ($chart_max-$chart_min)/$y_pixel) ;
							if($plot_point[$id_num]==true)
								$plots_due_to_y_axis++;
						}
						
						if($plot_point[$id_num] == true)
						{
							$plot_point[$id_num] = false;
							$data_row = "";
							$sep = "";
							
							for($c=0; $c<count($record); $c++)
							{
								$data_row .= $sep;
								if($record[$c] != "")
									$data_row .= $record[$c];
								else
									$data_row .= " ";
								$sep = ",";																
							}
							$num_points_being_sent++;
							$rows->addChild("d", $data_row);
	
							$last_ts[$id_num] = floatval($record[1]);	// Set last time.
							$last_val[$id_num] = floatval($record[4]);	// Record last values.
						}
						
						$record = $setdata->db_data->nextRow();
					}	// while($record
				}
				else // Not an indexed table.
				{
					$prev_ts = 0.0;
					$last_val = Array();
					$plot_point = true;
					
					while($record && $setdata->db_data!==false && $num_points_being_sent<=$_REQUEST['MAXNUMPTS'])
					{							
						// Look for changes in x axis time data
						if(!$plot_point) {
							$plot_point = ( abs(floatval($record[1])-$prev_ts) >= ($setdata->end-$setdata->begin)/$x_pixel );
							
							$last_x_comparison = "( abs(".floatval($record[1])."-".$prev_ts.") >= (".$setdata->end."-".$setdata->begin.")/".$x_pixel." )";
							
							if($plot_point==true)
								$plots_due_to_x_axis++;
						}
							// Look for changes in y axis data.
						for($c=3; !$plot_point && $c<count($record); $c++) 
						{
							$chart_min = min(floatval($record[$c]), $chart_min);
							$chart_max = max(floatval($record[$c]), $chart_max);
							$plot_point = ( abs($last_val[$c] - floatval($record[$c])) >= ($chart_max-$chart_min)/$y_pixel ) ;
							if($plot_point==true)
								$plots_due_to_y_axis++;
						}
						
						if($plot_point == true)
						{
							$plot_point = false;
							$data_row = "";
							$sep = "";
							
							$prev_ts = floatval($record[1]);	// Set last time.
							for($c=0; $c<count($record); $c++)
							{
								$data_row .= $sep;
								if($record[$c] != "")
									$data_row .= $record[$c];
								else
									$data_row .= " ";
								$sep = ",";
	
								if($c>=3)
									$last_val[$c] = floatval($record[$c]);	// Record last values.
							}
							$num_points_being_sent++;
							$rows->addChild("d", $data_row);
						}
						
						$record = $setdata->db_data->nextRow();
					}	// while($record)
				}	// else not index table
	
				$this->log->logData(LOG_NOTICE, "sql_data | Sent ".$num_points_being_sent." rows of ".$setdata->db_data->num_records." min:".$chart_min." max:".$chart_max." xTrig:".$plots_due_to_x_axis." yTrig:".$plots_due_to_y_axis);
				$this->log->logData(LOG_DEBUG, $last_x_comparison);
			}	// else filtered data		
		}	// successful query
		else
			$this->log->logData(LOG_INFO, "sql_data | No data to return.");
			
		header('Content-type: application/xml');
		
		//echo $response->asXML();
		echo $response->asPrettyXML();
	}
	*/
    
    function cmd_DATA_SET_RANGE2()
    {
        $setdata = new DbSqlSetData($this->log);
		
		if($setdata->system_type == self::getMachTypeFromId($setdata->rsrc_id) ) {
            $results = array();
            $noFilter = ($_REQUEST['UNFILTERED'] == 1);
            $maxPoints = $_REQUEST['MAXNUMPTS'];
            
            if($noFilter) {
                $recordsExist = $setdata->SetQuery();		// Get
            }
            else {
                $recordsExist = $setdata->SetQuery(1000000);		// Get them all??
            }
     
            if($recordsExist == true) {
                $dataExporter = Factory::createIDataExporter( Factory::createIDataCompiler() );
                
                $recordsInSec = array();
                while($record = $setdata->GetResultRow()) {
                    $dataExporter->convertTimeStampToSec($record);
                    $recordsInSec[] = $record;
                }

                $indices = CsvString::toIntArray($setdata->idxRangeStr);                
                $results = $dataExporter->process($recordsInSec, $setdata->indexField, $indices, $maxPoints, $noFilter);
                
                $recordsInSec = null;
            }
            else {
                $this->log->logData(LOG_INFO, "sql_data | No data to return.");
            }
            
            header('Content-type: application/xml');
            echo $this->_createChartDataResponse($results);
        }
        else {
			parent::error_out("cmd_DATA_SET_RANGE : Machine type mismatch for <i>".$setdata->rsrc_id."</i> ");
		}
    }
    
    function cmd_DATA_SET_EXPORT()
    {
        $setdata = new DbSqlSetData($this->log);
		
		if($setdata->system_type == self::getMachTypeFromId($setdata->rsrc_id) ) {
            $results = array();
            $resolutionSec = $_REQUEST['RESOLUTION'];
            
            $recordsExist = $setdata->SetQuery();
            if($recordsExist == true) {
                $dataCompiler = Factory::createIDataCompiler();   // TODO:  inject IDataCompiler in constructor

                while($record = $setdata->GetResultRow()) {
                    $this->_convertTimeStampToSec($record);
                    $results[] = $record;
                }
                
                // multiplex if indexed record format
                $indices = CsvString::toIntArray($setdata->idxRangeStr);
                $validIndices = (count($indices) == 2) && ($indices[1] >= $indices[0]);
                if(($setdata->indexField === true) && ($validIndices == true)) {
                    $results = $dataCompiler->multiplex($results, sqlSet::DATA_FIELD_0_NUM, sqlSet::DATA_FIELD_0_NUM + 1, $indices[0], $indices[1]);
                }
                
                $lastFieldNum = count($results[0]) - 1;
                $percentTolerance = 10;
                $results = $dataCompiler->stripSubPeriodSamples($results, sqlSet::TIME_STAMP_FIELD_NUM, $resolutionSec, $percentTolerance);
                $results = $dataCompiler->upSample($results, sqlSet::TIME_STAMP_FIELD_NUM, sqlSet::DATA_FIELD_0_NUM, $lastFieldNum, $resolutionSec);
            }
            else {
                $this->log->logData(LOG_INFO, "sql_data | No data to return.");
            }
            
            header("Content-type: text/csv");
            header("Content-Disposition: attachment; filename=" . $this->_createFileName());

            $headingArray = $setdata->DataTemplateToHeadingArray();
            $contents = CsvString::toCvsString($headingArray);
            
            foreach($results as &$row) {
                $this->_convertToExcelDateTime($row);
                $contents .= CsvString::toCvsString($row);
            }
            unset($row);

            echo $contents;
        }
        else {
			parent::error_out("cmd_DATA_SET_EXPORT : Machine type mismatch for <i>".$setdata->rsrc_id."</i> ");
		}
    }
    
    function cmd_test_export_data()
    {
        $filename = 'test_file.csv';
        header('Content-type: text/csv');
        header('Content-Disposition: attachment; filename='.$filename);
        echo file_get_contents("userFiles/generic/test_data.csv");
    }
    
    function cmd_EFFICIENCY_TEMPLATE()
    {
        header('Content-type: application/xml');
        echo file_get_contents("userFiles/generic/efficiencyTemplateResponse.xml");
    }
    
    function cmd_EFFICIENCY_DATA()
    {
        // validate query values
        $beginTimeStamp = $_REQUEST['BEGIN'];
        $endTimeStamp = $_REQUEST['END'];
        $resourceId = $_REQUEST['ID'];
        $triggerEnableTimeStamp = $_REQUEST['START_END'];
        $triggerType= $_REQUEST['END_VAR'];
        $triggerValue = $_REQUEST['END_VAL'];
        $save = $_REQUEST['save'];
        
        /*
        if(Environment::is_64_bit_version()) {
        $validBegin = (filter_var($beginTimeStamp, FILTER_VALIDATE_INT) != 0);
        $validEnd = (filter_var($endTimeStamp, FILTER_VALIDATE_INT) != 0)  || ($endTimeStamp === "0");
        }
        else {
        // no numeric eval if 32 bit PHP
        $validBegin = $beginTimeStamp;
        $validEnd = $endTimeStamp || ($endTimeStamp === "0"); 
        }
        $validResourceId = $resourceId || ($resourceId === "0"); // accept "0" pending confirmation
         */
        $validResourceId = true;
        $validBegin = true;
        $validEnd = true;

        if($validBegin && $validEnd && $validResourceId) {
            $dbName = $this->getDBName($resourceId);
            $dcDcDataSource = new DB_Data($this->log, $dbName);
            $stateDataSource = new DB_Data($this->log, $dbName);
            $machinetype = $this->getMachTypeFromId($resourceId);
            $validDataAndSelector = $dcDcDataSource->connected && $stateDataSource->connected && ($machinetype != NULL);
            
            if($validDataAndSelector) {
                $dcDcTableName = "";
                $stateTableName = "";
                $numDcDc = $this->_getNumberDcdcAndInitTableNames($machinetype, $resourceId, $dcDcTableName, $stateTableName);
                
                // set queries. TODO: update to latest sql? advance to qualifying mode, set dcdc begin time
                $stateSelect = sprintf("SELECT  rowid, timestamp, System_Mode_idx FROM `%s` WHERE timestamp >= %d AND timestamp <= %d ORDER BY rowid ASC", 
                    $stateTableName, $beginTimeStamp, $endTimeStamp);
                $efficiencySelect = sprintf("SELECT  rowid, timestamp, id_field, avg_BattCurr, avg_BattVolt, (avg_BattCurr * avg_BattVolt / 1000) AS BattPow_kW, avg_BattAH"
				. " FROM `%s` WHERE timestamp >= %d AND timestamp <= %d "
				. " AND id_field>=1 AND id_field<=%d ORDER BY rowid ASC;", $dcDcTableName, $beginTimeStamp, $endTimeStamp, $numDcDc);

                $numDcdcSamplesRemaining = $dcDcDataSource->setQuery($efficiencySelect);
                $recordsExist = ($stateDataSource->setQuery($stateSelect) > 0) && ($numDcdcSamplesRemaining > 0);
                
                // pass ModeDuration linked list to IEfficiency object for processing
                $initialModeDuration = $this->_compileRootModeDuration($stateDataSource);
                $efficiency = Factory::createIEfficiency($numDcDc, $initialModeDuration, $triggerEnableTimeStamp, $triggerType, $triggerValue);   // TODO: inject IEfficiency in constructor
                
                while($record = $dcDcDataSource->nextRow()) {
                    $numDcdcSamplesRemaining--;
                    $timeStamp = $record[1];
                    $index = $record[2];
                    $amps = floatval($record[3]);
                    $volts = floatval($record[4]);
                    $kWatts = floatval($record[5]);
                    $ampHours = floatval($record[6]);
                    $isLastSample = (($timeStamp + 1.5 * self::DCDC_SAMPLE_INTERVAL_MS) > $endTimeStamp) || ($numDcdcSamplesRemaining == 0);
                    $efficiency->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, $isLastSample);
                }
                $results = $efficiency->getDcdcReports();

                if($save == 'true') {
                    $logEntry = $_REQUEST['logEntry'];
                    $chartURL = $_REQUEST['chartURL'];
                    
                    // Register the test run with the BatteryTrackerService
                    $batteryTrackerNewTestRunEndpoint = 'http://localhost/BatteryTrackerService/test-run';
                    $apacheServerPort = 80;
                    $dto = new EfficiencyDTO($resourceId, $beginTimeStamp, $results, $logEntry, $chartURL);
                    $webClient = Factory::createIWebClient();
                    $webClient->post($batteryTrackerNewTestRunEndpoint, $apacheServerPort, webClient\MimeType::JSON, $dto);
                }
                else {
                    // generate xml response
                    header('Content-type: application/xml');
                    echo $this->_createEfficiencyDataResponse($results);
                }
            }
        }
    }
    
	function cmd_LOG_DATA()
	{		
		$db_name = self::getDBName($_REQUEST['ID']);
		
		if(strlen($db_name)<=0)
		{
			parent::error_out("cmd_LOG_DATA : Unable to validate the resource ID: ", $_REQUEST['ID']);
			return; 
		}
				
		if(is_string($_REQUEST['BEGIN']) && is_string($_REQUEST['END']) )
		{
			$begin = $_REQUEST['BEGIN'];
			$end = $_REQUEST['END'];
			
			if($end==0)		
				$end = mSecondsSince1970();
					
			if($begin<0)		
				$begin = $end + $begin;
		}
		else
		{
			parent::error_out("cmd_LOG_DATA : Called without a valid time variables in request.");
			return;
		}
		
		if(is_string($_REQUEST['LASTID']))
			$last_rowid = $_REQUEST['LASTID'];
		else
			$last_rowid = 0;
				
		$max_num_rows = $_REQUEST['MAXNUMPTS'];
		
		$display_only = $_REQUEST['DIS_ONLY'];		// TODO: improve to be list

		$table_name = "events";
		
		//  We need to use the last_rowid as well as timestamp on the event table!!
		//  This is becouse the TF has multiple apps filling the table and there is
		//  nothing stopping multiple apps from writing at the exact same time.
		if($display_only=="")
			$select = "SELECT * FROM " .$table_name. " WHERE rowid>" .$last_rowid
						. " AND timestamp > " .$begin. " AND timestamp <= " .$end
						. " ORDER BY timestamp ASC, rowid ASC LIMIT " .$max_num_rows. ";";
		else 
			$select = "SELECT * FROM " .$table_name. " WHERE resource=\"" . $display_only . "\" AND rowid>" .$last_rowid
						. " AND timestamp > " .$begin. " AND timestamp <= " .$end
						. " ORDER BY timestamp ASC, rowid ASC LIMIT " .$max_num_rows. ";";
		
		$this->log->logData(LOG_DEBUG, $select);
		
		$ev_data = new DB_Data($this->log, $db_name);
		
		$record = $ev_data->SelectStmt($select);

		$response = new ppcXml("<log></log>");
		
		if($this->log->_level >= LOG_DEBUG)	// Include the sql syntax for debugging
			$response->addChild("SQL_STRING", $select);
		
		//$response->addChild("headers", "rowid|timestamp|resource|type|msg");
		
		while($record)
		{
			$r = $response->addChild("r");
			
			$r->addAttribute("id", $record[0]);
			$r->addAttribute("time", $record[1]);
			$r->addAttribute("err", 2);								// TODO: need a real way to set.
		
			$r->addChild("rs", $record[2]);
			$r->addChild("tp", $record[3]);
			$nn = $r->addChild("m"); 
			$nn[0] = $record[4];			// For some reason this mannor of adding the text takes care escaping
		
			$record = $ev_data->nextRow();
		}
		
		header('Content-type: application/xml');
		
		//echo $response->asXML();
		echo $response->asPrettyXML();
		
	}
	
	
	/*************************************************************************************************
	 * Helper Functions
	 *************************************************************************************************/
	
	function getDBName($resource_id)
	{
		$db_name = "";
		
		$resource = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
		$result = $resource->loadList($resource_id, false);	
		
		if($result === true)
		{
			if(strlen($resource->sys[0]["parent"]) > 0)
				$db_name = $resource->sys[0]["parent"];
			else 
				$db_name = $resource_id;
		}
		else
			$this->log->logData(LOG_ERR, "getDBName($res_id) : unable to open system entry.");
		
		return $db_name;
	}
	
	function getMachTypeFromId($res_id)
	{
		$retval = NULL;
		$this->log->logData(LOG_INFO, "getMachTypeFromId($res_id)");
		
		$wd_list = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
		
		$result = $wd_list->loadList($res_id, false);
		
		if(true === $result)
		{
			if(FleetConsts::validResourceType($wd_list->sys[0]["machine_type"]) )
				$retval = $wd_list->sys[0]["machine_type"];
			else
				$this->log->logData(LOG_ERR, "getMachTypeFromId($res_id) : machine type ".$wd_list->sys[0]["machine_type"]." Not recognized.");
		}
		else
			$this->log->logData(LOG_ERR, "getMachTypeFromId($res_id) : unable to open system entry.");

		return $retval;
	}
    
    private function _convertTimeStampToSec(&$record)
    {
        $timeStampFieldNum = 1;
        $timeStampSec = floatval($record[$timeStampFieldNum]) / 1000;
        $record[$timeStampFieldNum] = intval($timeStampSec);
    }
    
    // returns xml response with standard elements
    private function _createDataResponseStub()
    {
        $response = new ppcXml("<dataSet></dataSet>");
        $timeStampSec = intval(mSecondsSince1970()/1000);
		$response->addChild("timeStamp", $timeStampSec);

        return $response;
    }
    
    // returns export filename
    private function _createFileName()
    {
        $beginTimeStamp = floatval($_REQUEST['BEGIN']);
        $beginDate = date("Ymd" , intval($beginTimeStamp/1000.0));
        $filename = $_REQUEST['ID'] . "_" . $_REQUEST['MINOR'] . "_" . $beginDate . ".csv";
        return $filename;
    }
    
    // returns root instance in linked list of non-repeating ModeDurations
    // requirement: $stateDataSource contains at least one record
    private function _compileRootModeDuration($stateDataSource)
    {
        $rootMode = NULL;
        $currentMode = NULL;
        
        while($record = $stateDataSource->nextRow()) {
            $timeStamp = $record[1];
            $mode = intval($record[2]);

            if($currentMode != NULL) {
                if($mode != $currentMode->mode) {
                    $currentMode = new ModeDuration($timeStamp, $mode, $currentMode);
                }
                else {
                    $currentMode->endTimeStamp = $timeStamp;
                }
            }
            else {
                // initialize linked list
                $currentMode = new ModeDuration($timeStamp, $mode);
                $rootMode = $currentMode;
            }
        }

        return $rootMode;
    }
    
    // returns XML response as string
    private function _createChartDataResponse($records)
    {
        $response = $this->_createDataResponseStub();
		$rows = $response->addChild("data");	
        $recordsLength = count($records);

        for($i=0; $i<$recordsLength; $i++) 
        {
            $data_row = "";
            $sep = "";
            $recordLength = count($records[$i]);
            if($recordLength > 0) {
                for($j=0; $j<$recordLength; $j++)
                {
                    $data_row .= $sep;
                    if($records[$i][$j] != "") {
                        $data_row .= $records[$i][$j];
                    }
                    else {
                        $data_row .= " ";
                    }
                    $sep = ",";
                }
            
                $rows->addChild("d", $data_row);
            }
        }
        
        return $response->asPrettyXML();
    }
 
    // returns XML response as string
    private function _createEfficiencyDataResponse(/*efficiency\EfficiencyReport[]*/$reports)
    {
        $response = $this->_createDataResponseStub();
		$rows = $response->addChild("data");	

        foreach ($reports as $report)
        {
            $row = $rows->addChild("row");
            $row->addChild("a", $report->id);
            $row->addChild("b", $report->chargeStartTimeStamp);
            $row->addChild("c", $report->chargeAmpHours);
            $row->addChild("d", $report->dischargeRate);
            $row->addChild("e", $report->fullDischargePowerEff);
            $row->addChild("f", $report->fullDischargeCoulombicEff);
            $row->addChild("g", $report->chargeEnergy);
            $row->addChild("h", $report->fullDischargeEnergy);
            $row->addChild("i", $report->maxVolts);
            $row->addChild("j", $report->fullDischargeMinutes);
            $row->addChild("k", $report->constantPowerEff);
            $row->addChild("l", $report->constantPowerDischargeEnergy);
            $row->addChild("m", $report->constantPowerMinutes);
        }

        return $response->asPrettyXML();
    }
    
    private function _convertToExcelDateTime(/*array*/&$record)
    {
        $record[sqlSet::TIME_STAMP_FIELD_NUM] = date("m/d/Y H:i:s", $record[sqlSet::TIME_STAMP_FIELD_NUM]);
    }
    
    // returns # DC/DCs
    private function _getNumberDcdcAndInitTableNames($machineType, $resourceId, &$dcDcTableName, &$stateTableName)
    {
        $numDcDc = 0;
        
        switch ($machineType)
        {
            case "TF2000":
            case "TF2000_Quad":
                sscanf($resourceId, "Quad%d", $index);  // legacy: will not likely work
                $dcDcTableName = sprintf("tfq-%d-%s", $index, "DCDCs");
                $stateTableName = sprintf("tfq-%d-%s", $index, "states");
                $numDcDc = 28;
                break;
            
            case "PB150":
                $dcDcTableName = sprintf("PB150-1-%s", "DCDCs");
                $stateTableName = sprintf("PB150-1-%s", "states");
                $numDcDc = 18;
                break;
            
            case "SSTS_r01":
            case "SSTS_Quad_r01":
            case "SSTS":
            case "SSTS_Quad":
                $indices = array(); 
                $matches = preg_match("/(?<=Q)\d*/", $resourceId, $indices);     // extract index from "..Q3"
                $dcDcTableName = sprintf("ctrl-%d-%s", $indices[0], "DCDCs");
                $stateTableName = sprintf("ctrl-%d-%s", $indices[0], "states");
                $numDcDc = 1;
                break;
            
            case "ETS":
            case "ETSJR":
            case "LTS":
            case "QTS":
                $dcDcTableName = sprintf("ctrl-1-%s", "DCDCs");
                $stateTableName = sprintf("ctrl-1-%s",  "states");
                $numDcDc = 6;
                break;
            
            default:
                break;
        }
        
        return $numDcDc;
    }
}