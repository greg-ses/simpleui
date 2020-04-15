<?php

require_once "../../modules/webClient/HttpWebclient.php";

use webClient\HttpWebClient;
use webClient\MimeType;

class HttpWebClientTest extends PHPUnit_Framework_TestCase
{
    public function setUp(){ }
    public function tearDown(){ }
    
    /**
     * round trip test requiring mock service at the below url
     */
    public function testPostJson()
    {
        try {
            $sut = new HttpWebClient();
            $dto = new TestDTO('stringValue', 1);
            $refDtoStr = json_encode($dto); 
            
            $result = $sut->post('http://localhost/BatteryTrackerService/mock', 8081, MimeType::JSON, $dto);
            
            $this->assertTrue(strpos($result, $refDtoStr) === 0);
        }
        catch (Exception $e)
        {
            $this->assertTrue(false, 'Could not connect to the mock service at http://localhost:8081/BatteryTrackerService/mock');
        }
    }
}

class TestDTO
{
    public $field1;
    public $field2;
    
    public function __construct($field1, $field2)
    {
        $this->field1 = $field1;
        $this->field2 = $field2;
    }

}
