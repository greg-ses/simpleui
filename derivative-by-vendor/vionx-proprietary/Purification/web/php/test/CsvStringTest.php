<?php
require_once "../../modules/CsvString.php";

class CsvStringTest extends PHPUnit_Framework_TestCase
{
    public function setUp(){ }
    public function tearDown(){ }
    
    public function testToIntArray()
    {
        $csvString = " 1 , 6.1 ";
        $refResult = array(1,6);
        $resultLength = count($refResult);
        
        $result = CsvString::toIntArray($csvString);
        
        for($i=0; $i<$resultLength; $i++) {
            $this->assertEquals($refResult[$i], $result[$i], "ToIntArray");
        }
    }
    
    public function testNullToIntArray()
    {
        $csvString = "";
        
        $result = CsvString::toIntArray($csvString);
        
        $this->assertEquals(0, count($result), "NullToIntArray");
    }
    
    public function testGetAsCvsString()
    {
        $inputRecord = array(271380,"01/31/2013 03:06:00",237,85.8886,87.0067,83.2342,88.0654,88.2118,87.4565);
        
        $result = CsvString::toCvsString($inputRecord);
        
        $this->assertEquals("271380,01/31/2013 03:06:00,237,85.8886,87.0067,83.2342,88.0654,88.2118,87.4565\r\n", $result);
    }
}
