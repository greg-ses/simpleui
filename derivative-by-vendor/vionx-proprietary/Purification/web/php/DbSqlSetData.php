<?php
// for debug
//require_once "modules/FirePHPCore/fb.php";
//ob_start();
//FB::info("loaded DbSqlSetData");

require_once "modules/sqlSet.php";
require_once "modules/db_connection.php";
require_once "modules/FleetMonitorDB.php";
require_once "modules/CsvString.php";

class DbSqlSetData extends sqlSet
{
	public $db_data = false;
	
	
	public $rsrc_id 		= "";	// mySql database
	public $major			= "";	// The requested majorItem in the dataSets list, 
									//  ** equates to machineType
	public $minor			= "";	// The requested minorItem in teh dataSets request,
									//  ** equates to the root name of the colset file
									
	public $system_type 	= "";
	public $setName 		= "";	// The core set file name.
	
	public $set_file_name		= "";	// The qualified name of the set file
	public $db_name				= "";	// The actual DB to open
	public $table_name_prefix 	= "";	// Prefix for the table names within the DB
	
	function __construct($slogger)
	{		
		parent::__construct($slogger);
		
		self::_completeVariableInitialization();
	}
		
	
	// For test
	/* 
	 * Indexed:  
	 * 		http://10.0.4.30/fleetviewer/sql_data.php?COMMAND=DATA_SET_EXPORT_NEW&MACH_NAME=TF2000_0035&IDNUM=4&DATA_DB=Quad4&SYS_TYPE=TF2000&DATA_SET=BattCurr&BEGIN=1329922740266&END=1329922800000&LAST_ID=true&INCHEADERS=0&MAXNUMPTS=1500&tstamp=1330007309395
	 * 
	 * Non-indexed:
	 * 		http://10.0.4.30/fleetviewer/sql_data.php?COMMAND=DATA_SET_EXPORT_NEW&MACH_NAME=TF2000_0035&IDNUM=4&DATA_DB=Quad4&SYS_TYPE=TF2000&DATA_SET=ACAC_VoltCurr&BEGIN=1329922740266&END=1329922800000&LAST_ID=true&INCHEADERS=0&MAXNUMPTS=1500&tstamp=1330007309395
	 * 
	 */
//	function exportDataSet()
//	{
//		$this->log->logData(LOG_DEBUG, "sqlSetData::exportDataSet() : begin");
//		
//		$this->generateSetfileName();
//		
//		if($this->LoadSetFile($this->set_file_name) === false)
//			return;
//
//		$this->generateSql($this->table_name_prefix, $override_limit);
//					
//		// ** Generate a temporary table to hold all the results in
//		
//		$sql = "CREATE TABLE `export_" . mSecondsSince1970() . "`(";
//		
//		$sql .= " `timestamp` TIMESTAMP NOT NULL";
//
//		foreach($this->col_info as $cinfo)
//		{
//			if($cinfo->name == "rowid" 	|| $cinfo->name == "timestamp"
//					|| $cinfo->name == "num_points"	|| $cinfo->name == "id_field")
//				continue;		// Don't include these.
//			
//			if(true===$this->indexField && strlen($this->idxRangeStr)>0)		// TODO: Do we want to create the columns for each....
//				for($x=$this->idxMin; $x<=$this->idxMax; $x++) 
//					$sql .= ", `" . $cinfo->name . '_' . $x. "` " . $cinfo->metaType . "";
//			else
//				$sql .= ", `" . $cinfo->name . "` " . $cinfo->metaType . "";
//		}
//		$sql .= ", PRIMARY KEY ( `timestamp` ) ) ENGINE = MYISAM ;";
//
//		$this->log->logData(LOG_DEBUG, "sql: " . $sql);
//		
//		$db_conn = new db_connection($this->log, $this->rsrc_id, $this->rsrc_id);		// Open the correct sql db
//		
//		//$db_conn->exe_sql($sql);
//		
//		$this->log->logData(LOG_DEBUG, "sqlSetData::exportDataSet() : end");
//	}
	
	function ReadSetFile()
	{
        $setTableNamePrefixCallback = array($this, '_setTableNamePrefix');
		return $this->LoadSetFile($this->set_file_name, $setTableNamePrefixCallback);
	}
	
	function GetDataFromSql($override_limit=-1)
	{
		$record = false;

		if($this->ReadSetFile() === true)
		{
			$this->generateSql($this->table_name_prefix, $override_limit);
			
			$this->db_data = new DB_Data($this->log, $this->db_name);		// Open the correct sql db
			
			$record = $this->db_data->SelectStmt($this->sql_completed);
		}
				
		return $record;
	}
	
    // returns true if there is there is at least one resulting record
    function SetQuery($override_limit=-1)
	{
		$recordsExist = false;

		if($this->ReadSetFile() === true) {
			$this->generateSql($this->table_name_prefix, $override_limit);
			$this->db_data = new DB_Data($this->log, $this->db_name);		// Open the correct sql db
			$recordsExist = ($this->db_data->setQuery($this->sql_completed) > 0);
		}
        
		return $recordsExist;
	}
    
    function GetResultRow()
    {
        if($this->db_data !== false) {
            return $this->db_data->nextRow();
        }
        else {
            return false;
        }
    }
    
	function DataTemplateToXml_old($node)
	{
		//->addChild
		if($this->metaType != "")
			$node->addChild("metaType", $this->metaType);
		
		if($this->indexField && $this->idxRangeStr != "")
			$node->addChild("indexRange", $this->idxRangeStr);
		
		$begin_graph_index = 3;
		if($this->indexField)
			++$begin_graph_index;
		
		$snode = $node;
		
		for($i=0; $i<count($this->col_info); ++$i)
		{
			if($i==$begin_graph_index)
				$snode = $node->addChild("series");
		
			if($i<$begin_graph_index)
				$pele = $snode->addChild($this->col_info[$i]->name, "");
			else
				$pele = $snode->addChild("item", $this->col_info[$i]->name);
		
			$pele->addAttribute("index", $i);
			$pele->addAttribute("type", $this->col_info[$i]->metaType);
			$pele->addAttribute("hint", $this->col_info[$i]->description);
		}
	}
	
    function DataTemplateToXml($node)
	{
        // boilerplate definition is fixed
		if($this->metaType != "") {
			$node->addChild("metaType", $this->metaType);
        }
		$this->_addTemplateElement($node, "rowId", "", "INTEGER", "Unique row Unique Row ID", sqlSet::ROWID_FIELD_NUM);
        $this->_addTemplateElement($node, "timeStamp", "", "TIMESTAMP", "Seconds Since Jan 1st, 1970", sqlSet::TIME_STAMP_FIELD_NUM);
        $this->_addTemplateElement($node, "numPoints", "", "INTEGER", "Number of points in averaged in float values", sqlSet::NUM_POINTS_FIELD_NUM);

        // generate series entries from col_info
        $seriesNode = $node->addChild("series");
        $colInfoLength = count( $this->col_info);
        
        $indices = CsvString::toIntArray($this->idxRangeStr);
        $validIndices = (count($indices) == 2) && ($indices[1] >= $indices[0]);
        if(($this->indexField === true) && ($validIndices == true)) {
            $indexOffset = $indices[0];
            $indexedDataField0Num = sqlSet::DATA_FIELD_0_NUM + 1;   // accounts for index row in colInfo
            $numDataItems = $colInfoLength - $indexedDataField0Num; 
            
            // i is offset by id_field (remove offset when setting template field number)
            for($i = $indexedDataField0Num; $i < $colInfoLength ; $i++) {
                $colInfoItem = $this->col_info[$i];
                
                // repeat the data item once for each index value at interval (# data items)
                for($j = $indices[0]; $j <= $indices[1] ; $j++) {
                    $fieldNum = $i - 1 + (($j - $indexOffset) * $numDataItems);   // * number data items
                    $this->_addTemplateItem($seriesNode, $colInfoItem, $fieldNum, true, $j);
                }
            }
        }
        else {
            for($i = sqlSet::DATA_FIELD_0_NUM; $i < $colInfoLength ; $i++) {
                $this->_addTemplateItem($seriesNode, $this->col_info[$i], $i);
            }
        }
	}
    
    // returns array of column anmes
    function DataTemplateToHeadingArray()
    {
        $heading = array();
        $heading[] = "rowId";
        $heading[] = "timeStamp";
        $heading[] = "numPoints";

        $colInfoLength = count( $this->col_info);
        $indices = CsvString::toIntArray($this->idxRangeStr);
        $validIndices = (count($indices) == 2) && ($indices[1] >= $indices[0]);

        if(($this->indexField === true) && ($validIndices == true)) {
            $indexOffset = $indices[0];
            $indexedDataField0Num = sqlSet::DATA_FIELD_0_NUM + 1;   // accounts for index row in colInfo
            $numDataItems = $colInfoLength - $indexedDataField0Num; 

            // i is offset by id_field (remove offset when setting field number)
            for($i = $indexedDataField0Num; $i < $colInfoLength; $i++) {
                $colInfoItem = $this->col_info[$i];

                // repeat the data item once for each index value at interval (# data items)
                for($j = $indices[0]; $j <= $indices[1] ; $j++) {
                    $fieldNum = $i - 1 + (($j - $indexOffset) * $numDataItems);   // * number data items
                    $value = $colInfoItem->name . "_" . strval($j);
                    $heading[$fieldNum] = $value;
                }
            }
        }
        else {
            for($i = sqlSet::DATA_FIELD_0_NUM; $i < $colInfoLength; $i++) {
                $colInfoItem = $this->col_info[$i];
                $heading[$i] = $colInfoItem->name;
            }
        }

        return $heading;
    }
    
	/*************************************************************************************************
	 * Helper Functions
	 *************************************************************************************************/
    // appends a col_info item, ex: <item index="3" type="FLOAT" hint="Quad 1 Total Battery Amp Hours" >avg_Q1_TotalBattAH</item>
    private function _addTemplateItem($parent, $colInfoItem, $fieldNum, $isIndexed = false, $indexer = 0)
    {
        if($isIndexed == true) {
            $value = $colInfoItem->name . "_" . strval($indexer);
        }
        else {
            $value = $colInfoItem->name;
        }
        
        $this->_addTemplateElement($parent, "item", $value, $colInfoItem->metaType, $colInfoItem->description, $fieldNum);
    }
    
    private function _addTemplateElement($parent, $elementName, $value, $type, $description, $fieldNum)
    {
        $elem = $parent->addChild($elementName, $value);
        $elem->addAttribute("index", $fieldNum);
        $elem->addAttribute("type", $type);
        $elem->addAttribute("hint", $description);
    }
    
    private function _completeVariableInitialization()
	{
		$this->system_type = $_REQUEST['SYS_TYPE'];
		$this->rsrc_id 		= $_REQUEST['ID'];			// mySql database
		$this->major 		= $_REQUEST['MAJOR'];		// The machineType.
		$this->minor 		= $_REQUEST['MINOR'];		// The core set file name.
		
		$this->system_type 	= $this->major;
		$this->setName 		= $this->minor;
		
		$this->set_file_name = "userFiles/" . $this->system_type ."/". $this->setName . ".colset";
		
		switch($this->system_type)
		{
			case 'TF2000':
				$this->db_name = $this->rsrc_id;
				break;
				
			case 'TF2000_Quad':
				// Need to load the parent name from the table
				$resource = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
				$resource->loadList($this->rsrc_id, false);	
				$this->db_name = $resource->sys[0]["parent"];
				break;
				
			case 'PB150':
				$this->db_name = $this->rsrc_id;
				break;
				
			case 'SSTS':
			case 'SSTS_r01':
				$this->db_name = $this->rsrc_id;
				break;
				
			case 'SSTS_Quad':
			case 'SSTS_Quad_r01':
				// Need to load the parent name from the table
				$resource = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
				$resource->loadList($this->rsrc_id, false);	
				$this->db_name = $resource->sys[0]["parent"];
				break;
				
			case 'ETS':
            case "ETSJR":
            case 'LTS':
			case 'QTS':
				$this->db_name = $this->rsrc_id;
				break;
				
			default:	// Single DB type systems simply use the colsets extension.
				// Add the list of col_sets
				$this->log->logData(LOG_ERR, "Unsupported system type: " + $this->system_type);
				break;
		}
		
		$this->log->logData(LOG_DEBUG, "DbSqlSetData::_completeVariableInitialization() : DB: "
										+ $this->db_name + " TablePrefix: " + $this->table_name_prefix);
		
		return $this->set_file_name;
	}
		
    protected function _setTableNamePrefix()
    {
        switch($this->system_type)
		{
			case 'TF2000':
				$this->table_name_prefix = "TF2000-";
				break;
            
			case 'TF2000_Quad':
				$qstr = strstr($this->rsrc_id , "_Q");
				$q = intval(substr($qstr, 2));
				$this->table_name_prefix = "tfq-" . $q . "-";
				break;
            
			case 'PB150':
				$this->table_name_prefix = "PB150-1-";
				break;
            
			case 'SSTS':
			case 'SSTS_r01':
				$this->table_name_prefix = "";
				break;
            
			case 'SSTS_Quad':
			case 'SSTS_Quad_r01':
				$qstr = strstr($this->rsrc_id , "_Q");
				$q = intval(substr($qstr, 2));
				$this->table_name_prefix = "ctrl-" . $q . "-";
				break;
            
			case 'ETS':
            case "ETSJR":
            case 'LTS':
			case 'QTS':
                if($this->_noTablePrefix) {
                    $this->table_name_prefix = "";
                }
                else {
                    $this->table_name_prefix = "ctrl-1-";
                }
				break;
            
			default:
				break;
		}
    }
}

