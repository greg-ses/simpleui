<?php
$currentDir = getcwd(); // if this isn't ~\trunk\web\Server\php\vendor\bin, make sure project start action is "Don't open a page"
require_once "../../test/DataCompilerWB.php";
require_once "../../modules/Factory.php";

class DataCompilerTest extends PHPUnit_Framework_TestCase
{
    public function setUp(){ }
    public function tearDown(){ }
    
    public function testMultiplexTwoDataItems()
    {
        $sut = Factory::createIDataCompiler();
        
        // (timestamp, idx, data1, data2)
        $inputRecords = array(
            array(10, 1, 1, 9),
            array(11, 2, 2, 10),
            array(12, 3, 3, 11),
            array(15, 1, 6, 12),
            array(16, 2, 7, 13),
            array(18, 3, 8, 14)
            );
        
        // (timestamp, id1_data1, id1_data2, id2_data1, id2_data2, id3_data1, id3_data2)
        $refResult = array(
            array(12, 1, 9, 2, 10, 3, 11),
            array(18, 6, 12, 7, 13, 8, 14)
            );
        
        $indexerFieldNum = 1;
        $dataFieldNum = 2;
        $indexerMin = 1;
        $indexerMax = 3;
        $result = $sut->multiplex($inputRecords, $indexerFieldNum, $dataFieldNum, $indexerMin, $indexerMax);
        $this->validate($result, $refResult, "Multiplex");
    }
    
    public function testMultiplexInterpolatesForSingleMidIndexTimeStamp()
    {
        $sut = Factory::createIDataCompiler();
        
        // index + 1 data field
        $inputRecords = array(
            array(10, 1, 1),
            array(11, 2, 2),
            array(12, 3, 3),
            array(13, 2, 4),        // only single index (2)
            array(14, 2, 5),        // only single index (2)
            array(15, 1, 6),
            array(16, 2, 7),
            array(18, 3, 8)        
            );
        
        $refResult = array(
            array(12, 1, 2, 3),
            array(13, 1, 4, 3),     // expected functionality: duplicate preceding value
            array(14, 1, 5, 3),     // expected functionality: duplicate preceding value
            array(18, 6, 7, 8)
            );
        
        $indexerFieldNum = 1;
        $dataFieldNum = 2;
        $indexerMin = 1;
        $indexerMax = 3;
        $result = $sut->multiplex($inputRecords, $indexerFieldNum, $dataFieldNum, $indexerMin, $indexerMax);
        $this->validate($result, $refResult, "MultiplexInterpolatesForSingleMidIndexTimeStamp");
    }
    
    public function testMultiplexInterpolatesForSingleStartIndexTimeStamp()
    {
        $sut = Factory::createIDataCompiler();
        
        // index + 1 data field
        $inputRecords = array(
            array(10, 1, 1),
            array(11, 2, 2),
            array(12, 3, 3),
            array(13, 1, 4),        // only single index (1)
            array(14, 1, 5),        // only single index (1)
            array(15, 1, 6),
            array(16, 2, 7),
            array(18, 3, 8)        
            );
        
        $refResult = array(
            array(12, 1, 2, 3),
            array(13, 4, 2, 3),     // expected functionality: duplicate preceding value
            array(14, 5, 2, 3),     // expected functionality: duplicate preceding value
            array(18, 6, 7, 8)
            );
        
        $indexerFieldNum = 1;
        $dataFieldNum = 2;
        $indexerMin = 1;
        $indexerMax = 3;
        $result = $sut->multiplex($inputRecords, $indexerFieldNum, $dataFieldNum, $indexerMin, $indexerMax);
        $this->validate($result, $refResult, "MultiplexInterpolatesForSingleStartIndexTimeStamp");
    }
    
    public function testMultiplexInterpolatesForSingleEndIndexTimeStamp()
    {
        $sut = Factory::createIDataCompiler();
        
        // time + index + 1 data field
        $inputRecords = array(
            array(10, 1, 1),
            array(11, 2, 2),
            array(12, 3, 3),
            array(13, 3, 4),        // only single index (3)
            array(14, 3, 5),        // only single index (3)
            array(15, 1, 6),
            array(16, 2, 7),
            array(18, 3, 8)        
            );
        
        $refResult = array(
            array(12, 1, 2, 3),
            array(13, 1, 2, 4),     // expected functionality: duplicate preceding value
            array(14, 1, 2, 5),     // expected functionality: duplicate preceding value
            array(18, 6, 7, 8)
            );
        
        $indexerFieldNum = 1;
        $dataFieldNum = 2;
        $indexerMin = 1;
        $indexerMax = 3;
        $result = $sut->multiplex($inputRecords, $indexerFieldNum, $dataFieldNum, $indexerMin, $indexerMax);
        $this->validate($result, $refResult, "MultiplexInterpolatesForSingleEndIndexTimeStamp");
    }
    
    public function testMultiplexDuplicatesPreviousDataPointForMissingEndIndex()
    {
        $sut = Factory::createIDataCompiler();
        
        // index + 1 data field
        $inputRecords = array(
            array(1, 1),
            array(2, 2),
            array(3, 3),

            array(1, 6),
            array(2, 7),
            array(3, 8),

            array(1, 9),
            array(2, 10)       // missing end index
            );
        
        $refResult = array(
            array(1, 2, 3),
            array(6, 7, 8),
            array(9, 10, 8)     // expected functionality: duplicate preceding value
            );
        
        $indexerFieldNum = 0;
        $dataFieldNum = 1;
        $indexerMin = 1;
        $indexerMax = 3;
        $result = $sut->multiplex($inputRecords, $indexerFieldNum, $dataFieldNum, $indexerMin, $indexerMax);
        $this->validate($result, $refResult, "MultiplexMissingEndIndex");
    }
   
    public function testMultiplexInvalidIndex()
    {
        $sut = Factory::createIDataCompiler();
        
        // index + 1 data field
        $inputRecords = array(
            array(1, 1),
            array(2, 2),
            array(3, 3),

            array(1, 6),
            array(2, 7),
            array(4, 8.5),      // invalid indexer
            array(3, 8)
            );
        
        $refResult = array(
            array(1, 2, 3),
            array(6, 7, 8)
            );
        
        $indexerFieldNum = 0;
        $dataFieldNum = 1;
        $indexerMin = 1;
        $indexerMax = 3;
        $result = $sut->multiplex($inputRecords, $indexerFieldNum, $dataFieldNum, $indexerMin, $indexerMax);
        $this->validate($result, $refResult, "MultiplexInvalidIndex");
    }

    public function testMovingAvgFilter()
    {
        // ref: /test/reference MAF results.xlsx
        $inputData = array(
            array(10, 10),
            array(11, 11),
            array(12, 12),
            array(13, 13),
            array(14, 14),
            array(15, 15),
            array(16, 16),
            array(17, 17),
            array(18, 18),
            array(19, 19),
            array(20, 20),
            array(21, 21),
            array(22, 22),
            array(23, 23),
            array(24, 24),
            array(25, 25),
            array(26, 26),
            array(27, 27),
            array(28, 28),
            array(29, 29)
            );
        
        $referenceData = array(
            array(10, 11),
            array(11, 11.5),
            array(12, 12),
            array(13, 13),
            array(14, 14),
            array(15, 15),
            array(16, 16),
            array(17, 17),
            array(18, 18),
            array(19, 19),
            array(20, 20),
            array(21, 21),
            array(22, 22),
            array(23, 23),
            array(24, 24),
            array(25, 25),
            array(26, 26),
            array(27, 27),
            array(28, 27.5),
            array(29, 28)
            );
        
        $sut = new DataCompilerWB();
        $resultData = $sut->run__movingAvgFilter($inputData, 1, 1, 4);
        $tolerance = 0.1;
        $this->validateApprox($resultData, $referenceData, $tolerance, "MovingAvgFilter");
    }
    
    public function testSimplifyFraction()
    {
        $numerator = 1500;
        $denominator = 1000;
        
        $sut = new DataCompilerWB();
        $sut->run__simplifyFraction($numerator, $denominator);
        
        $this->assertEquals(3, $numerator, "SimplifyFraction: numerator");
        $this->assertEquals(2, $denominator, "SimplifyFraction: denominator");
    }
    
    public function testInternalUpSample()
    {
        $upSampleRate = 3;
        $timeStampFieldNum = 0;
        $inputData = array(
            array(1000001000, 10),
            array(1000001100, 11),
            array(1000001200, 12),
            array(1000001300, 13),
            array(1000001400, 14),
            array(1000001500, 15),
            array(1000001600, 16),
            array(1000001700, 17),
            array(1000001800, 18),
            array(1000001900, 19),
            array(1000002000, 20),
            array(1000002100, 21),
            array(1000002200, 22),
            array(1000002300, 23),
            array(1000002400, 24),
            array(1000002500, 25),
            array(1000002600, 26),
            array(1000002700, 27),
            array(1000002800, 28),
            array(1000002900, 29)
            );
        
        $referenceData = array(
            array(1000001000, 10), array(1000001033, 10), array(1000001067, 10),
            array(1000001100, 11), array(1000001133, 11), array(1000001167, 11),
            array(1000001200, 12), array(1000001233, 12), array(1000001267, 12),
            array(1000001300, 13), array(1000001333, 13), array(1000001367, 13),
            array(1000001400, 14), array(1000001433, 14), array(1000001467, 14),
            array(1000001500, 15), array(1000001533, 15), array(1000001567, 15),
            array(1000001600, 16), array(1000001633, 16), array(1000001667, 16),
            array(1000001700, 17), array(1000001733, 17), array(1000001767, 17),
            array(1000001800, 18), array(1000001833, 18), array(1000001867, 18),
            array(1000001900, 19), array(1000001933, 19), array(1000001967, 19),
            array(1000002000, 20), array(1000002033, 20), array(1000002067, 20),
            array(1000002100, 21), array(1000002133, 21), array(1000002167, 21),
            array(1000002200, 22), array(1000002233, 22), array(1000002267, 22),
            array(1000002300, 23), array(1000002333, 23), array(1000002367, 23),
            array(1000002400, 24), array(1000002433, 24), array(1000002467, 24),
            array(1000002500, 25), array(1000002533, 25), array(1000002567, 25),
            array(1000002600, 26), array(1000002633, 26), array(1000002667, 26),
            array(1000002700, 27), array(1000002733, 27), array(1000002767, 27),
            array(1000002800, 28), array(1000002833, 28), array(1000002867, 28),
            array(1000002900, 29)
            );
        
        $sut = new DataCompilerWB();
        $result = $sut->run__upSample($inputData, $upSampleRate, $timeStampFieldNum);
        
        $tolerance = 1.1;
        $this->validateApprox($result, $referenceData, $tolerance, "UpSample");
    }

    public function testDecimateWithoutUpsample()
    {
        $maxPoints = 10;
        $inputData = array(
            array(10, 10),
            array(11, 11),
            array(12, 12),
            array(13, 13),
            array(14, 14),
            array(15, 15),
            array(16, 16),
            array(17, 17),
            array(18, 18),
            array(19, 19),
            array(20, 20),
            array(21, 21),
            array(22, 22),
            array(23, 23),
            array(24, 24),
            array(25, 25),
            array(26, 26),
            array(27, 27),
            array(28, 28),
            array(29, 29)
            );
        
        $sut = new DataCompilerWB();
        $resultData = $sut->decimate($inputData, 0, 1, 1, $maxPoints);
        
        $resultLength = count($resultData);
        $this->assertEquals($maxPoints, $resultLength);
        
        // note: manually verify signal fidelity with excel comparison between input and result data
    }
        
    public function testDecimateWithUpsample()
    {
        $maxPoints = 15;
        $inputData = array(
            array(100, 10),
            array(110, 11),
            array(120, 12),
            array(130, 13),
            array(140, 14),
            array(150, 15),
            array(160, 16),
            array(170, 17),
            array(180, 18),
            array(190, 19),
            array(200, 20),
            array(210, 21),
            array(220, 22),
            array(230, 23),
            array(240, 24),
            array(250, 25),
            array(260, 26),
            array(270, 27),
            array(280, 28),
            array(290, 29),
            array(300, 30)
            );
        
        $sut = Factory::createIDataCompiler();
        $resultData = $sut->decimate($inputData, 0, 1, 1, $maxPoints);
        
        $resultLength = count($resultData);
        $this->assertEquals($maxPoints, $resultLength);
        
        // note: manually verify signal fidelity with excel comparison between input and result data
    }

    public function testCalcUpsampleFactor()
    {
        $resolutionSec = 10;
        
        // at one minute interval, +1 sec avg variance
        $overtimeInputData = array(
            array(1000001000, 0),
            array(1000001060, 60),
            array(1000001122, 120)
            );
        
        $sut = new DataCompilerWB();
        $result = $sut->run__calcUpSampleFactor($overtimeInputData, $resolutionSec, 0);
        $this->assertEquals(6, $result);
        
        // at one minute interval, -1 sec avg variance
        $undertimeInputData = array(
            array(1000001000, 0),
            array(1000001060, 60),
            array(1000001118, 120)
            );
        
        $sut = new DataCompilerWB();
        $result = $sut->run__calcUpSampleFactor($undertimeInputData, $resolutionSec, 0);
        $this->assertEquals(6, $result);
    }
    
    public function testUpSampleIncludesTenPercentVariableRate()
    {
        $resolutionSec = 10;
        // at nominal one minute interval, with inserted samples
        $inputData = array(
            array(1000001000, 0),
            array(1000001051, 0),   // inserted sample
            array(1000001060, 60),
            array(1000001109, 60),  // inserted sample
            array(1000001120, 120)
            );
        
        $referenceData = array(
            array(1000001000, 0),
            array(1000001010, 0),
            array(1000001020, 0),
            array(1000001030, 0),
            array(1000001040, 0),
            array(1000001051, 0),
            array(1000001060, 60),
            array(1000001070, 60),
            array(1000001080, 60),
            array(1000001090, 60),
            array(1000001100, 60),
            array(1000001109, 60),
            array(1000001120, 120)
            );
               
        $sut = Factory::createIDataCompiler();
        $resultData = $sut->upSample($inputData, 0, 1, 1, $resolutionSec);
        $tolerance = 0.1;
        $this->validateApprox($resultData, $referenceData, $tolerance, "upsampled value");
    }
    
    public function testStripSubPeriodSamplesDataPeriodLessThanDesired()
    {
        $timeStampFieldNum = 0;
        $resolutionSec = 10;
        $percentTolerance = 10;
        
        // at nominal ten second interval
        $inputData = array(
            array(1000001000, 0),
            array(1000001000, -1),  // outside tolerance
            array(1000001009, 1),
            array(1000001020, 2),
            array(1000001028, -2),  // outside tolerance
            array(1000001031, 3),  
            array(1000001040, 4)
            );
        
        $referenceData = array(
            array(1000001000, 0),
            array(1000001009, 1),
            array(1000001020, 2),
            array(1000001031, 3),  
            array(1000001040, 4)
            );
        
        $sut = Factory::createIDataCompiler();
        $resultData = $sut->stripSubPeriodSamples($inputData, $timeStampFieldNum, $resolutionSec, $percentTolerance);
        $this->validate($resultData, $referenceData, 'validate failed: stripped sub periods');
    }
    
    private function validate($result, $refResult, $message)
    {
        for($i=0; $i<count($refResult); $i++)
        {
            for($j=0; $j<count($refResult[$i]); $j++)
            {
                $this->assertEquals($refResult[$i][$j], $result[$i][$j], $message);
            }
        }
        
        $this->assertEquals(count($refResult), count($result), "result array is different size than ref");
    }
    
    private function validateApprox($result, $refResult, $tolerance, $message)
    {
        for($i=0; $i<count($refResult); $i++)
        {
            for($j=0; $j<count($refResult[$i]); $j++)
            {
                $this->assertGreaterThan($refResult[$i][$j] - $tolerance, $result[$i][$j], $message);
                $this->assertLessThan($refResult[$i][$j] + $tolerance, $result[$i][$j], $message);
            }
        }
        
        $this->assertEquals(count($refResult), count($result), "result array is different size than ref");
    }
}

