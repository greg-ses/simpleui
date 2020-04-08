<?php
// test fixture for Efficiency and internal value classes. Reference data at ~/trunk/web/Server/php/test/ 

// SQL queries (from DBReader.cmd_EFFICIENCY_DATA) to assemble test data required for test case from historical runs (substitute actual table names and timestamps):
// - create modes file: SELECT  rowid, timestamp, System_Mode_idx FROM `ctrl-2-states` 
//                      WHERE timestamp >=1381582920000 AND timestamp <=1381788600000 
//                      ORDER BY rowid ASC

// - create data file:  SELECT rowid, timestamp, id_field, avg_BattCurr, avg_BattVolt, (
//                      avg_BattCurr * avg_BattVolt /1000
//                      ) AS BattPow_kW, avg_BattAH
//                      FROM `ctrl-2-DCDCs` 
//                      WHERE timestamp >=1381582920000 
//                      AND timestamp <=1381788600000 
//                      ORDER BY rowid ASC


require_once "../../test/EfficiencyWB.php";
require_once "../../modules/Factory.php";
require_once "../../modules/efficiency/EfficiencyRecord.php";
require_once "../../modules/efficiency/EfficiencyReport.php";
require_once "../../modules/efficiency/ModeDuration.php";
require_once "../../modules/efficiency/ModeEnum.php";
require_once "../../modules/efficiency/TriggerTypeEnum.php";

use efficiency\EfficiencyRecord;
use efficiency\EfficiencyReport;
use efficiency\ModeDuration;
use efficiency\ModeEnum;
use efficiency\TriggerTypeEnum;

class EfficiencyTest extends PHPUnit_Framework_TestCase
{
    const NUM_DCDCS = 2;
    private $_modeData;
    
    public function setUp(){
        $this->_modeData = array(
            array(1, 1357237414582, 0),
            array(2, 1357239600252, 0),
            array(3, 1357240747224, 1),
            array(4, 1357240749257, 1),
            array(5, 1357240750274, 1)
            );
    }
    public function tearDown(){ }
    
    public function testEfficiencyRecord()
    {
        $sut = new EfficiencyRecord(1);
        $sut->maxVolts = 220.0;
        $report = $sut->exportReport();
        $this->assertEquals(220.0, $report->maxVolts);
    }
    
    public function testModeDurationTimeStamp()
    {
        $modeDurations = array();
        $modesLength = count($this->_modeData);
        for($i=0; $i<$modesLength; $i++)
        {
            $mode = $this->_modeData[$i];
            if($i > 0) {
                $mdInstance = new ModeDuration($mode[1], $mode[2], $mdInstance);
            }
            else {
                $mdInstance = new ModeDuration($mode[1], $mode[2]);
            }
            
            $modeDurations[] = $mdInstance;
        }
        
        $this->assertEquals(1357240750274, $modeDurations[3]->endTimeStamp);
    }
    
    public function testModeDurationLinking()
    {
        $rootMode = NULL;
        $modesLength = count($this->_modeData);
        for($i=0; $i<$modesLength; $i++)
        {
            $mode = $this->_modeData[$i];
            if($i > 0) {
                $mdInstance = new ModeDuration($mode[1], $mode[2], $mdInstance);
            }
            else {
                $mdInstance = new ModeDuration($mode[1], $mode[2]);
                $rootMode = $mdInstance;
            }
        }
        
        $secondMode = $rootMode->get_next();
        $thirdMode = $secondMode->get_next();
        $this->assertEquals(1357240749257, $thirdMode->endTimeStamp);
    }
   
    public function testConstructAndAdvanceMode()
    {
        $rootMode = $this->_createModeDurationLinkedList();
        $triggerTimeStamp = 1360606262000;
        $sut = new EfficiencyWB(6, $rootMode, $triggerTimeStamp, TriggerTypeEnum::I, 1.5);
        
        $modeDuration = $sut->getModeDuration(0);
        $this->assertEquals(ModeEnum::CHARGE, $modeDuration->mode, "incorrect mode");
    }
    
    public function testGetModeAfterLastReturnsFalse()
    {
        $chargeStartTime = 1360591800000;
        $rootMode = new ModeDuration(1360590000000, ModeEnum::CHARGE);
        $offLineMode = new ModeDuration(1360597202000, ModeEnum::OFFLINE, $rootMode);
        $offLineMode->endTimeStamp = 1360617062000;
        $triggerTimeStamp = 1360606262000;
        $sut = new EfficiencyWB(6, $rootMode, $triggerTimeStamp, TriggerTypeEnum::I, 1.5);
        
        $this->assertTrue($sut->getNextValidModeOrSignalEnd(0), "getNextValidModeOrSignalEnd returned false");
    }
    
    public function testProcess()
    {
        $chargeStartTime = 1360591800000;
        
        $rootMode = $this->_createModeDurationLinkedList();
        $triggerTimeStamp = 1360606262000;
        $sut = new EfficiencyWB(self::NUM_DCDCS, $rootMode, $triggerTimeStamp, TriggerTypeEnum::I, 1.5);
            
        $data = $this->_loadCsvFile('../../test/efficiencytestdata.csv');
        $dataLength = count($data);
        for($i=0; $i<$dataLength; $i++)
        {
            $timeStamp = $data[$i][0];
            $index = $data[$i][1];
            $volts = $data[$i][2];
            $amps = $data[$i][3];
            $kWatts = $data[$i][4];
            $ampHours = $data[$i][5];
            $isLastSample = $i == $dataLength - 1;
            $sut->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, false);
        }
        
        // verify data capture ends at discharge end trigger
        $lastSample = $sut->getCurrentSample();
        //$this->assertEquals(1360608062000, $lastSample->getPreviousTimeStamp(), "previousTimeStamp");
        $this->assertEquals(1360609862000, $lastSample->getTimeStamp(), "timeStamp");
        
        $effRecord = $sut->getEfficiencyRecord(1);
        // verify timestamps and snapshot
        $this->assertEquals(1360591800000, $effRecord->chargeStartTimeStamp, "chargeStartTimeStamp");
        $this->assertEquals(1360597202000, $effRecord->dischargeStartTimeStamp, "dischargeStartTimeStamp");
        $this->assertEquals(1360608062000, $effRecord->dischargeConstPowerEndTimeStamp, "dischargeConstPowerEndTimeStamp");
        //$this->assertEquals(1360609862000, $effRecord->dischargeEndTimeStamp, "dischargeEndTimeStamp");
        $this->assertEquals(220.0, $effRecord->maxVolts, "maxVolts", 0.1);
        $this->assertEquals(0.2, $effRecord->dischargeRate, "dischargeRate", 0.01);
        
        // verify integration
        $this->_verifyIntegration($effRecord);
    }

    public function testGetDcdcReports()
    {
        $rootMode = $this->_createModeDurationLinkedList();
        $triggerTimeStamp = 1360606262000;
        $sut = new EfficiencyWB(self::NUM_DCDCS, $rootMode, $triggerTimeStamp, TriggerTypeEnum::I, 1.5);
        $sut->setEfficiencyRecord(0, $this->_createEffRecord(1));
        $sut->setEfficiencyRecord(1, $this->_createEffRecord(2));
        $sut->setToEndState(0);
        $sut->setToEndState(1);
        
        $dcdcReports = $sut->getDcdcReports();
        
        $this->assertCount(self::NUM_DCDCS + 2, $dcdcReports);
        $report = $dcdcReports[1];
        $this->_verifyDcdcReport($report);
        $sumReport = $dcdcReports[EfficiencyReport::SUM_ID];
        $this->_verifySumReport($sumReport);
        $avgReport = $dcdcReports[EfficiencyReport::AVERAGE_ID];
        $this->_verifyAvgReport($avgReport);
    }

    public function test_integration_FullDischargeCycle()
    {
        $chargeStartTime = 1360591800000;
        
        $rootMode = $this->_createModeDurationLinkedList();
        $triggerTimeStamp = 1360606262000;
        $sut = Factory::createIEfficiency(self::NUM_DCDCS, $rootMode, $triggerTimeStamp, "0", "1.5");
        
        $data = $this->_loadCsvFile('../../test/efficiencytestdata.csv');
        $dataLength = count($data);
        for($i=0; $i<$dataLength; $i++)
        {
            $timeStamp = $data[$i][0];
            $index = $data[$i][1];
            $volts = $data[$i][2];
            $amps = $data[$i][3];
            $kWatts = $data[$i][4];
            $ampHours = $data[$i][5];
            $isLastSample = $i == $dataLength - 1;
            $sut->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, false);
        }
        $reports = $sut->getDcdcReports();
        $this->assertCount(self::NUM_DCDCS + 2, $reports);
        $dcdc1Report = $reports[1];
        $this->assertEquals(2, $dcdc1Report->id, "id");       
        $this->_verifyDcdcReport($dcdc1Report);
    }
    
    public function test_integration_RunLts1DbFiles50V()
    {
        $modes = $this->_loadCsvFile('../../test/ctrl-1-states.csv');
        $endTimeStamp = 0;
        $rootMode = $this->_compileRootModeDuration($modes, $endTimeStamp);
        $startTimeStamp = $rootMode->startTimeStamp;
        $sut = Factory::createIEfficiency(6, $rootMode, $startTimeStamp, TriggerTypeEnum::V, 50);
        
        $data = $this->_loadCsvFile('../../test/ctrl-1-DCDCs.csv');
        $dataLength = count($data);
        for($i=0; $i<$dataLength; $i++) {
            $timeStamp = $data[$i][1];
            $index = $data[$i][2];
            $amps = $data[$i][3];
            $volts = $data[$i][4];
            $kWatts = $data[$i][5];
            $ampHours = $data[$i][6];
            $isLastSample = (floatval($timeStamp) + 90000) > $endTimeStamp;
            $sut->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, $isLastSample);
        }
        
        $reports = $sut->getDcdcReports();
        for($j=0; $j<6; $j++) {
            $this->assertTrue($reports[$j]->constantPowerMinutes > 300, 'constantPowerMinutes');
        }
        
        $this->assertTrue($reports[0]->dischargeRate > 1.3, 'dischargeRate');
    }
    
    public function test_integration_RunLts1DbFiles1300W()
    {
        $modes = $this->_loadCsvFile('../../test/ctrl-1-states.csv');
        $endTimeStamp = 0;
        $rootMode = $this->_compileRootModeDuration($modes, $endTimeStamp);
        $startTimeStamp = $rootMode->startTimeStamp;
        $sut = Factory::createIEfficiency(6, $rootMode, 1360886160159, TriggerTypeEnum::W, 1300);
        
        $data = $this->_loadCsvFile('../../test/ctrl-1-DCDCs.csv');
        $dataLength = count($data);
        for($i=0; $i<$dataLength; $i++) {
            $timeStamp = $data[$i][1];
            $index = $data[$i][2];
            $amps = $data[$i][3];
            $volts = $data[$i][4];
            $kWatts = $data[$i][5];
            $ampHours = $data[$i][6];
            $isLastSample = (floatval($timeStamp) + 90000) > $endTimeStamp;
            $sut->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, $isLastSample);
        }
        
        $reports = $sut->getDcdcReports();
        for($j=0; $j<6; $j++) {
            $this->assertTrue($reports[$j]->constantPowerMinutes > 12000/60, 'constantPowerMinutes');
        }
    }

    // test data from SSTS1 Quad2,  9:02 10/12/13 - 18:10 10/14/13
    // trigger: 11:00 10/14/13 (1381762800000 ms), 1.35 kW
    public function test_integration_RunMulticycle()
    {
        $modes = $this->_loadCsvFile('../../test/efficiency_multicycle_states.csv');
        $endTimeStamp = 0;
        $rootMode = $this->_compileRootModeDuration($modes, $endTimeStamp);
        $triggerTimeStamp = 1381762800000;
        $sut = Factory::createIEfficiency(1, $rootMode, $triggerTimeStamp, TriggerTypeEnum::W, 1350);
        
        $data = $this->_loadCsvFile('../../test/efficiency_multicycle.csv');
        $dataLength = count($data);
        for($i=0; $i<$dataLength; $i++) {
            $timeStamp = $data[$i][1];
            $index = $data[$i][2];
            $amps = $data[$i][3];
            $volts = $data[$i][4];
            $kWatts = $data[$i][5];
            $ampHours = $data[$i][6];
            $isLastSample = ((floatval($timeStamp) + 90000) > $endTimeStamp) || ($i == $dataLength-1);
            $sut->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, $isLastSample);
        }
        
        $reports = $sut->getDcdcReports();

        $this->assertEquals(331.0, $reports[0]->chargeAmpHours, "chargeAmpHours", 33.0);
        $this->assertEquals(34.02, $reports[0]->chargeEnergy, "chargeEnergy", 3.0);
        $this->assertEquals(25.96, $reports[0]->constantPowerDischargeEnergy, "constantPowerDischargeEnergy", 2.5);
        $this->assertEquals(26.55, $reports[0]->fullDischargeEnergy, "fullDischargeEnergy", 2.7);
        $this->assertEquals(1.39, $reports[0]->dischargeRate, "dischargeRate", 0.14);
        $this->assertEquals(1120, $reports[0]->constantPowerMinutes, "constantPowerMinutes", 1);
        $this->assertEquals(1342, $reports[0]->fullDischargeMinutes, "fullDischargeMinutes", 1);
    }
    
    // test for trello #71
    // test data from SSTS1 Q1, 7:00 2/19/14 - 13:00 2/20/14
    // trigger: 11:00 2/20/14, 38 A
    public function test_integration_RunMulticycleTrello71()
    {
        $modes = $this->_loadCsvFile('../../test/efficiency_multicycle_trello71_states.csv');
        $endTimeStamp = 0;
        $rootMode = $this->_compileRootModeDuration($modes, $endTimeStamp);
        $triggerTimeStamp = 1392913800000;
        $sut = Factory::createIEfficiency(1, $rootMode, $triggerTimeStamp, TriggerTypeEnum::I, 38);
        
        $data = $this->_loadCsvFile('../../test/efficiency_multicycle_trello71.csv');
        $dataLength = count($data);
        for($i=0; $i<$dataLength; $i++) {
            $timeStamp = $data[$i][1];
            $index = $data[$i][2];
            $amps = $data[$i][3];
            $volts = $data[$i][4];
            $kWatts = $data[$i][5];
            $ampHours = $data[$i][6];
            $isLastSample = ((floatval($timeStamp) + 90000) > $endTimeStamp) || ($i == $dataLength-1);
            $sut->process($timeStamp, $index, $amps, $volts, $kWatts, $ampHours, $isLastSample);
        }
        
        $reports = $sut->getDcdcReports();
        $this->assertGreaterThan(150.0, $reports[0]->chargeAmpHours, "chargeAmpHours");
    }   
    
    private function _createEffRecord($dcdcNum) {
        $effRecord = new EfficiencyRecord($dcdcNum);
        $effRecord->chargeStartTimeStamp = 1360591800000;
        $effRecord->dischargeStartTimeStamp = 1360597202000;
        $effRecord->dischargeConstPowerEndTimeStamp = 1360608062000;
        $effRecord->dischargeEndTimeStamp = 1360609862000;
        $effRecord->chargeEnergy = 2.58;
        $effRecord->constantPowerDischargeEnergy = 0.993;
        $effRecord->postConstantPowerDischargeEnergy = 0.050;
        $effRecord->chargeAmpHours = 12.167;
        $effRecord->constantPowerDischargeAmpHours = 9.933;
        $effRecord->postConstantPowerDischargeAmpHours = 0.500;
        $effRecord->maxVolts = 220.0;
        $effRecord->dischargeRate = 0.200;
        $effRecord->constantPowerMinutes = 181;
        
        return $effRecord;
    }
    
    // returns root instance in linked list of non-repeating ModeDurations
    // adapted from DBReader._compileRootModeDuration (no test harness for DBReader)
    private function _compileRootModeDuration(/*2D array*/$modesList, &$endTimeStamp)
    {
        $rootMode = NULL;
        $currentMode = NULL;
        
        foreach($modesList as $record) {
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
        
        $endTimeStamp = $currentMode->endTimeStamp;

        return $rootMode;
    }
    
    private function _verifyIntegration($record) {
        $this->assertEquals(12.167, $record->chargeAmpHours, "chargeAmpHours", 0.01);
        $this->assertEquals(2.58, $record->chargeEnergy, "chargeEnergy", 0.01);
        $this->assertEquals(0.993, $record->constantPowerDischargeEnergy, "constantPowerDischargeEnergy", 0.001);
        $this->assertEquals(0.05, $record->postConstantPowerDischargeEnergy, "postConstantPowerDischargeEnergy", 0.01);
        $this->assertEquals(9.933, $record->constantPowerDischargeAmpHours, "constantPowerDischargeAmpHours", 0.01);
        $this->assertEquals(0.5, $record->postConstantPowerDischargeAmpHours, "postConstantPowerDischargeAmpHours", 0.01);
    }
    
    private function _verifyDcdcReport($report) {

        $this->assertEquals(1360591800000, $report->chargeStartTimeStamp, "chargeStartTimeStamp");
        $this->assertEquals(220.0, $report->maxVolts, "maxVolts", 0.1);
        $this->assertEquals(12.167, $report->chargeAmpHours, "chargeAmpHours", 0.01);
        $this->assertEquals(0.2, $report->dischargeRate, "dischargeRate", 0.01);
        $this->assertEquals(0.385, $report->constantPowerEff, "constantPowerEff", 0.005);
        $this->assertEquals(0.404, $report->fullDischargePowerEff, "fullDischargePowerEff", 0.005);
        $this->assertEquals(0.858, $report->fullDischargeCoulombicEff, "fullDischargeCoulombicEff", 0.005);
        $this->assertEquals(2.58, $report->chargeEnergy, "chargeEnergy", 0.01);
        $this->assertEquals(0.993, $report->constantPowerDischargeEnergy, "constantPowerDischargeEnergy", 0.001);
        $this->assertEquals(1.043, $report->fullDischargeEnergy, "fullDischargeEnergy", 0.001);
        $this->assertEquals(181.0, $report->constantPowerMinutes, "constantPowerMinutes", 0.01);
        $this->assertEquals(211.0, $report->fullDischargeMinutes, "fullDischargeMinutes", 0.01);
    }
    
    private function _verifySumReport($report)
    {
        $this->assertEquals(220.0, $report->maxVolts, "maxVolts", 0.1);
        $this->assertEquals(12.167 * self::NUM_DCDCS, $report->chargeAmpHours, "chargeAmpHours", 0.01);
        $this->assertEquals(0.2 * self::NUM_DCDCS, $report->dischargeRate, "dischargeRate", 0.01);
        $this->assertEquals(2.58 * self::NUM_DCDCS, $report->chargeEnergy, "chargeEnergy", 0.01);
        $this->assertEquals(0.993 * self::NUM_DCDCS, $report->constantPowerDischargeEnergy, "constantPowerDischargeEnergy", 0.001);
        $this->assertEquals(1.043 * self::NUM_DCDCS, $report->fullDischargeEnergy, "fullDischargeEnergy", 0.001);
    }
    
    private function _verifyAvgReport($report)
    {
        $this->assertEquals(220.0, $report->maxVolts, "maxVolts", 0.1);
        $this->assertEquals(12.167, $report->chargeAmpHours, "chargeAmpHours", 0.01);
        $this->assertEquals(0.2, $report->dischargeRate, "dischargeRate", 0.01);
        $this->assertEquals(0.385, $report->constantPowerEff, "constantPowerEff", 0.005);
        $this->assertEquals(0.404, $report->fullDischargePowerEff, "fullDischargePowerEff", 0.005);
        $this->assertEquals(0.858, $report->fullDischargeCoulombicEff, "fullDischargeCoulombicEff", 0.005);
        $this->assertEquals(2.58, $report->chargeEnergy, "chargeEnergy", 0.01);
        $this->assertEquals(0.993, $report->constantPowerDischargeEnergy, "constantPowerDischargeEnergy", 0.001);
        $this->assertEquals(1.043, $report->fullDischargeEnergy, "fullDischargeEnergy", 0.001);
        $this->assertEquals(181.0, $report->constantPowerMinutes, "constantPowerMinutes", 0.01);
        $this->AssertGreaterThan(200.0, $report->fullDischargeMinutes, "fullDischargeMinutes");
    }
    
    // returns initial ModeDuration in linked list matched to efficiencytestdata.csv
    private function _createModeDurationLinkedList()
    {
        $chargeStartTime = 1360591800000;
        $rootMode = new ModeDuration(1360590000000, ModeEnum::OFFLINE);
        $dischargeMode0 = new ModeDuration(1360590001000, ModeEnum::DISCHARGE, $rootMode);
        $chargeMode1 = new ModeDuration($chargeStartTime, ModeEnum::CHARGE, $dischargeMode0);
        $dischargeMode = new ModeDuration(1360597202000, ModeEnum::DISCHARGE, $chargeMode1);
        $chargeMode2 = new ModeDuration(1360613462000, ModeEnum::CHARGE, $dischargeMode);
        $chargeMode2->endTimeStamp = 1360617062000;
        return $rootMode;
    }
    
    private function _loadCsvFile($fileName)
    {
        $result = array();
        
        $file = fopen($fileName, 'r');
        while (($line = fgetcsv($file, 1000, ',')) !== FALSE) {
            //$line is an array of the csv elements
            $result[] = $line;
        }
        fclose($file);
        
        return $result;
    }
}