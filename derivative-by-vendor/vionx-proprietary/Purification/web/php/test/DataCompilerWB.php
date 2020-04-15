<?php
// white box for DataCompiler to allow test access to private methods

require_once "../../modules/DataCompiler.php";

class DataCompilerWB extends DataCompiler
{
    public function run__movingAvgFilter($records, $firstDataFieldNum, $lastDataFieldNum, $windowSize) 
    {
        return $this->_movingAvgFilter($records, $firstDataFieldNum, $lastDataFieldNum, $windowSize);
    }
    
    public function run__simplifyFraction(&$numerator, &$denominator)
    {
        $this->_simplifyFraction($numerator, $denominator);
    }
    
    public function run__calcUpSampleFactor($samples, $upSampleInterval, $timeStampFieldNum)
    {
        return $this->_calcUpSampleFactor($samples, $upSampleInterval, $timeStampFieldNum);
    }
    
    public function run__upSample($dataPoints, $upSampleFactor, $timeStampFieldNum)
    {
        $upSampleInterval = $this->_calcSampleInterval($dataPoints, $upSampleFactor, $timeStampFieldNum);
        return $this->_upSample($dataPoints, $upSampleInterval, $timeStampFieldNum);
    }
}
