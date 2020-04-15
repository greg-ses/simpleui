<?php

require_once "Commander.php";
require_once "modules/FleetMonitorDB.php";
require_once "modules/DB_Data.php";
require_once "modules/xmlHelper.php";
require_once "modules/sqlSetData.php";
require_once "modules/sqlData.php";


class FleetData extends Commander
{
	const NUM_TF_QUADS = 4;
	
	const MODE_NULL = 0;
	const MODE_CHARGE = 1;
	const MODE_DISCHARGE = 2;
	const MODE_OFFLINE = 3;
	const MODE_STANDBY = 4;
	
	const PWR_NONE = 0;
	const PWR_IN = 1;
	const PWR_OUT = 2;
    
    const VALUETYPE_INT = 0;
    const VALUETYPE_FLOAT = 1;
    const VALUETYPE_TIMESTAMP = 2;
	
    const ERROR_NONE = 0;
    const ERROR_WARN = 1;
    const ERROR_FAULT = 2;
	
	function __construct($slogger)
	{
		parent::__construct($slogger, get_class());

        $this->gets["AUTHORIZATIONS"]	= new CmdInfo(cmd_AUTHORIZATIONS,	"GET=AUTHORIZATIONS",	"authorization template stream");
		$this->gets["SYS_SUMMARY_TEMPLATE"]	= new CmdInfo(cmd_SYS_SUMMARY_TEMPLATE,	"GET=SYS_SUMMARY_TEMPLATE",	"Summary template stream");
		$this->gets["SYS_SUMMARY_DATA"]		= new CmdInfo(cmd_SYS_SUMMARY_DATA,		"GET=SYS_SUMMARY_DATA",		"Summary data stream");
	}
	
    function cmd_AUTHORIZATIONS()
	{
		$this->log->logData(LOG_VERBOSE, "cmd_AUTHORIZATIONS()");
		
		$response = new ppcXml("<authorizations></authorizations>");
		
		// TODO: Determine how to use this.
		$response->addChild("task", 0);
		$response->addChild("task", 1);
		$response->addChild("task", 2);
        
		header('Content-type: application/xml');
		
		echo $response->asPrettyXML();
	}
    
	function cmd_SYS_SUMMARY_TEMPLATE()
	{
		$this->log->logData(LOG_VERBOSE, "cmd_SYS_SUMMARY_TEMPLATE()");
		
		$response = new ppcXml("<systemSummaryTemplate></systemSummaryTemplate>");
		
		$parent_list = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
		$child_list = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
		
		$this->log->logData(LOG_DEBUG, "overview_data.php calling wd_list->loadList();");
		
		$parent_list->loadList();	// Loads only parents.
		
		for($p=0; $p<$parent_list->num_systems; $p++)
		{
			$parent_node = $response->addChild("resource");
			
			self::addResourceTemplate($parent_node, $parent_list->sys[$p]);

			// Loads only children.
			$child_list->loadListWhere("WHERE `parent` = '" . $parent_list->sys[$p]["name"] . "'");	
			
			if($child_list->num_systems > 0)
			{
				$children = $parent_node->addChild("childResources");
				for($c=0; $c<$child_list->num_systems; $c++)
				{
					$child_node = $children->addChild("resource");
					self::addResourceTemplate($child_node, $child_list->sys[$c]);
				}
			}
			
		}
			
		header('Content-type: application/xml');
		
		//echo $response->asXML();
		echo $response->asPrettyXML();
	}
		
	function cmd_SYS_SUMMARY_DATA()
	{
		$this->log->logData(LOG_VERBOSE, "cmd_SYS_SUMMARY_DATA()");
		
		$response = new ppcXml("<systemSummaryData></systemSummaryData>");
			
		$parent_list = new FleetMonitorDB($this->log, "FleetMonitor", "overview");
	
		$this->log->logData(LOG_DEBUG, "overview_data.php calling wd_list->loadList();");
		
		$parent_list->loadListWhere("");	// Loads all.
		
		for($s=0; $s<$parent_list->num_systems; $s++)
		{
			$sys = $response->addChild("resource");
			
			self::addResourceData($sys, $parent_list->sys[$s]);			
		}
			
		header('Content-type: application/xml');
		
		//echo $response->asXML();
		echo $response->asPrettyXML();
	}	

	/*************************************************************************************************
	 * Helper Functions
	 *************************************************************************************************/
	
	private function addResourceData($node, $resource)
	{
		$mode = self::MODE_NULL;
		
		$node->addAttribute("id", $resource["name"]);
        
        if($resource["disabled"] != 0) {
            $node->addAttribute("disabled", "true");
        }
		
		// TODO:  The timestamps should ultimatly come from the machine itself.
		$node->addChild("timestamp", mSecondsSince1970()); //->addAttribute("HINT", "UTC mSeconds since 1970");
		
		$mtype = $resource["machine_type"];
		
		// Two connection to pull from multiple tables.
		if($resource["sub_component"] == true)
		{
			$sys_data = new DB_Data($this->log, $resource["parent"]);	// Open up this systems database
		}
		else 
		{
			$sys_data = new DB_Data($this->log, $resource["name"]);	// Open up this systems database
		}
		
		if($sys_data->connected)
		{
            $dataItems = $node->addChild("dataItems");
                                
			switch($resource["machine_type"])
			{
				case "TF2000":
					if($sys_data->loadLastRow("TF2000-sys_states")) 
					{
						$mode = $sys_data->row_res["system_mode"];
						$node->addChild("mode",  $mode); 
					}
					
					if($sys_data->loadLastRow("TF2000-sys_analog"))
					{
						$node->addChild("pwrDir",  self::determinePwrDirection($mode, $sys_data->row_res["avg_Net_AC_Power_ext"]) );
                        $error = self::convertModeToError($mode);
                        $node->addChild("err",  $error); 
                        self::addDataValueItem("data1", $sys_data->row_res["avg_Net_AC_Power_ext"], $dataItems);    //	"GRID"
                        self::addDataValueItem("data2", $sys_data->row_res["avg_Net_percentage_charge"], $dataItems);    //	"SOC"
					}
					
					break;
					
				case "TF2000_Quad":
					$qstr = strstr($resource["name"] , "_Q");
					$q = intval(substr($qstr, 2));

					if($sys_data->loadLastRow("tfq-" . $q . "-states")) 
					{
						$mode = $sys_data->row_res["System_Mode"];
						$node->addChild("mode",  $mode); 
					}
					
					if($sys_data->loadLastRow("tfq-" . $q . "-analog"))
					{
						$node->addChild("pwrDir",  self::determinePwrDirection($mode, $sys_data->row_res["avg_Three_Phase_Pwr_ext"]) );
                        $error = self::convertModeToError($mode);
                        $node->addChild("err",  $error); 
                        self::addDataValueItem("data1", $sys_data->row_res["avg_Three_Phase_Pwr_ext"], $dataItems);    //	"GRID"
                        self::addDataValueItem("data2", $sys_data->row_res["avg_Total_Batt_kW"], $dataItems);    //	"BATT_PWR"
                        self::addDataValueItem("data3", 0.0, $dataItems);    //	"SOC"
					}
					
					break;
					
				case "PB150":				
					if($sys_data->loadLastRow("PB150-1-states")) 
					{
						$mode = $sys_data->row_res["System_Mode"];
						$node->addChild("mode",  $mode); 
					}					
					
					if($sys_data->loadLastRow("PB150-1-acac"))
					{
						$node->addChild("pwrDir",  self::determinePwrDirection($mode, $sys_data->row_res["avg_Net_AC_Power_ext"]) );
                        $error = self::convertModeToError($mode);
                        $node->addChild("err",  $error); 
                        self::addDataValueItem("data1", $sys_data->row_res["avg_Three_Phase_Pwr_ext_Grid"], $dataItems);    //	"GRID"
                        self::addDataValueItem("data2", $sys_data->row_res["avg_Three_Phase_Pwr_ext_Load"], $dataItems);    //	"BATT_PWR"
                        self::addDataValueItem("data3", 0.0, $dataItems);    //	"SOC"
					}
					break;
						
				case "SSTS":
				case "SSTS_r01":
					//if($sys_data->loadLastRow("TF2000-sys_states")) 			// TODO: Remove
					{
						$mode = "Offline";
						$node->addChild("mode",  $mode); 
					}
					
					//if($sys_data->loadLastRow("TF2000-sys_analog"))
					{
						$node->addChild("pwrDir",  self::PWR_NONE );
                        $error = self::convertModeToError($mode);
                        $node->addChild("err",  $error); 
						//$node->addChild("dat1",  0); //	"GRID");
						//$node->addChild("dat2",  0); //	"SOC");
					}
					break;
					
				case "SSTS_Quad":
				case "SSTS_Quad_r01":
					$qstr = strstr($resource["name"] , "_Q");
					$q = intval(substr($qstr, 2));

					if($sys_data->loadLastRow("ctrl-" . $q . "-states")) 
					{
						$mode = $sys_data->row_res["System_Mode"];
						$node->addChild("mode",  $mode); 
					}
					
					if($sys_data->loadLastRow("ctrl-" . $q . "-analog"))
					{
						$node->addChild("pwrDir",  self::determinePwrDirection($mode, $sys_data->row_res["avg_Three_Phase_Pwr_ext"]) );
                        $error = self::convertModeToError($mode);
                        $node->addChild("err",  $error); 
                        self::addDataValueItem("data1", $sys_data->row_res["avg_Total_Batt_kW"], $dataItems);    //	"BATT_PWR"
					}
					
					break;

                case "ETS":
                case "ETSJR":
				case "LTS":
				case "QTS":
					if($sys_data->loadLastRow("ctrl-1-states")) 
					{
						$mode = $sys_data->row_res["System_Mode"];
						$node->addChild("mode",  $mode); 
					}
                    
                    if($sys_data->loadLastRow("ctrl-1-DCDCs"))
					{
                        $error = self::convertModeToError($mode);
                        $node->addChild("err",  $error); 
                        $battKw = ($sys_data->row_res["avg_BattCurr"] * $sys_data->row_res["avg_BattVolt"]) / 1000;
                        self::addDataValueItem("data1", $battKw, $dataItems);    //	"BATT_PWR"
					}
					
					break;
							
				default:	
					break;
			}
		}
	}	
			
	private function addResourceTemplate($node, $resource)
	{
        $mtype = $resource["machine_type"];        
		$resourceId = $resource["name"];
        $node->addAttribute("id", $resourceId);

        // extract subsystem ID, if subsystem resource (quad)
        $name = $resourceId;
        switch($mtype)
		{
            // pass just the last two characters, which are quad identifiers (ex: 'Q1')
			case 'TF2000_Quad':
			case 'SSTS_Quad':
				{
                    $name = substr($resourceId, strlen($resourceId) - 2);
				}
				break;

            default:	
				break;
		}
		$node->addChild("name", $name);
        
		$node->addChild("type", $mtype);
		$dataItems = $node->addChild("dataItems");
        
		switch($mtype)
		{
			case 'TF2000':
				{
                    self::addDataTemplateItem("data1", "GRID", "kW", self::VALUETYPE_FLOAT, $dataItems);
                    self::addDataTemplateItem("data2", "SOC", "State of Charge, kWHr", self::VALUETYPE_FLOAT, $dataItems);
				}
				break;
				
			case 'TF2000_Quad':
				{
                    self::addDataTemplateItem("data1", "GRID", "Grid power, kW", self::VALUETYPE_FLOAT, $dataItems);
                    self::addDataTemplateItem("data2", "BATT_PWR", "Battery power, kW", self::VALUETYPE_FLOAT, $dataItems);
                    self::addDataTemplateItem("data3", "SOC", "State of Charge, kWHr", self::VALUETYPE_FLOAT, $dataItems);
				}
				break;
			
			case 'PB150':
				{
                    self::addDataTemplateItem("data1", "GRID", "Grid power, kW", self::VALUETYPE_FLOAT, $dataItems);
                    self::addDataTemplateItem("data2", "LOAD", "Load power, kW", self::VALUETYPE_FLOAT, $dataItems);
                    self::addDataTemplateItem("data3", "SOC", "State of Charge, kWHr", self::VALUETYPE_FLOAT, $dataItems);
					
					$child_resources = $node->addChild("childResources");
				}
				break;
				
			case 'SSTS_r01':
			case 'SSTS':
				{
					//$dataItems->addChild("dat1Name", "GRID");
					//$dataItems->addChild("dat2Name", "SOC");
				}
				break;
				
			case 'SSTS_Quad_r01':
			case 'SSTS_Quad':
				{
                    self::addDataTemplateItem("data1", "BATT_PWR", "Battery power, kW", self::VALUETYPE_FLOAT, $dataItems);
				}
				break;
			
            case 'ETS':
            case "ETSJR":
			case 'LTS':
			case 'QTS':
				{
                    self::addDataTemplateItem("data1", "BATT_PWR", "Battery power, kW", self::VALUETYPE_FLOAT, $dataItems);
				}
				break;
			
				default:	
				break;
		}		
	}
    
    private function addDataTemplateItem($id, $label, $desc, $valueType, $parent) 
    {
        $dataItem = $parent->addChild("dataItem");
        $dataItem->addAttribute("id", $id);
        $dataItem->addChild("label", $label);
        $dataItem->addChild("desc", $desc);
        $dataItem->addChild("valueType", $valueType);
    }
    
    private function addDataValueItem($id, $value, $parent) 
    {
        $dataItem = $parent->addChild("dataItem", $value);
        $dataItem->addAttribute("id", $id);
    }
	
	function convertMode($mode_txt)	
	{
		$mode = self::MODE_NULL;
		
	    if($mode_txt == "Charge")
	    	$mode = self::MODE_CHARGE;
	    	
	    else if($mode_txt == "Discharge")
	    	$mode = self::MODE_DISCHARGE;
	    	
	    else if($mode_txt == "Offline"
	    		|| $mode_txt == "POST"
	    		|| $mode_txt == "Neutralize"
	   			|| $mode_txt == "UPS"
				|| $mode_txt == "Service Mode"
				|| $mode_txt == "Quad Fault"	
				|| $mode_txt == "Fault"	)
	    	$mode = self::MODE_OFFLINE;
	    	
	    else if($mode_txt == "Standby"
	    		|| $mode_txt == "Float")
	    	$mode = self::MODE_STANDBY;
	    	
	    return $mode;
	}
	
    function convertModeToError($mode_txt)
    {
        $error = self::ERROR_NONE;
        
        if ($mode_txt == "Service Mode")
        {
            $error = self::ERROR_WARN;
        }
        else if($mode_txt == "Quad Fault" || $mode_txt == "Fault"	)
        {
            $error = self::ERROR_FAULT;
        }
        
        return $error;
    }
    
	function determinePwrDirection($mode, $net_ac_pwr)		// TODO:  Move into the Consts class
	{
		if($mode == self::MODE_CHARGE || $mode == self::MODE_DISCHARGE || $mode == self::MODE_STANDBY)
			return $net_ac_pwr>=0 ? self::PWR_IN: self::PWR_OUT ;
		else
			return self::PWR_NONE;
	}
	
}


