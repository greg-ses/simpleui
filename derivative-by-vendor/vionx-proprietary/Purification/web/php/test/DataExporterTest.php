<?php
$currentDir = getcwd(); // if this isn't ~\trunk\web\Server\php\vendor\bin, make sure project start action is "Don't open a page"
require_once "../../modules/DataExporter.php";
require_once "../../modules/Factory.php";

class DataExporterTest extends PHPUnit_Framework_TestCase
{
    public function setUp(){ }
    public function tearDown(){ }
    
    public function testDebug()
    {
        $this->assertEquals(1, 1);
    }
    /*
    public function testIntegration()
    {
        $records = $this->_loadCsvFile('../../test/data_export1.csv');
        $compiler = Factory::createIDataCompiler();
        $sut = new DataExporter($compiler);
        
        $recordsInSec = array();
        foreach($records as $record) {
            $sut->convertTimeStampToSec($record);
            $recordsInSec[] = $record;
        }
        
        $isIndexed = true;
        $indices = array(1, 6);
        $maxPoints = 800;
        $noFilter = false;
        $results = $sut->process($recordsInSec, $isIndexed, $indices, $maxPoints, $noFilter);
        
        $this->assertLessThanOrEqual($maxPoints, count($results), "maxPoints exceeded");
    }
*/
    public function testIntegrationTrello79()
    {
        $records = $this->_loadCsvFile('../../test/data_export_trello79.csv');
        $compiler = Factory::createIDataCompiler();
        $sut = new DataExporter($compiler);
        
        $recordsInSec = array();
        foreach($records as $record) {
            $sut->convertTimeStampToSec($record);
            $recordsInSec[] = $record;
        }
        
        $isIndexed = true;
        $indices = array(1, 6);
        $maxPoints = 800;
        $noFilter = false;
        $results = $sut->process($recordsInSec, $isIndexed, $indices, $maxPoints, $noFilter);
        
        $this->assertLessThanOrEqual($maxPoints, count($results), "maxPoints exceeded");
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
