<?php
// white box for Efficiency to allow test access to private methods
require_once "../../modules/state/State.php";
require_once "../../modules/efficiency/Efficiency.php";
require_once "EfficiencyStateMachineWB.php";

use efficiency\Efficiency;
use efficiency\EfficiencyStateMachine;
use state\State;

class EfficiencyWB extends Efficiency
{
    public function getCurrentSample()
    {
        return $this->_currentSample;
    }
    
    public function getModeDuration($index)
    {
        $effGroup = $this->_efficiencyGroups[$index];
        return $effGroup->modeDuration;
    }
    
    public function getEfficiencyRecord($index)
    {
        $effGroup = $this->_efficiencyGroups[$index];
        return $effGroup->efficiencyRecord;
    }
    
    public function setEfficiencyRecord($index, $efficiencyRecord)
    {
        $this->_efficiencyGroups[$index]->efficiencyRecord = $efficiencyRecord;
    }
    
    public function getNextValidModeOrSignalEnd($index)
    {
        $effGroup = $this->_efficiencyGroups[$index];
        return $this->_getNextValidModeOrSignalEnd($effGroup->modeDuration);
    }

    public function setToEndState($index)
    {
        $effGroup = $this->_efficiencyGroups[$index];
        $effGroup->stateMachine->setToEndState();
    }
    
    // overrides to instance an EfficiencyStateMachineWB
    protected function _getStateMachine($startState, $chargeState, $dischargeConstPowerState, $dischargePostConstPowerState, $endState)
    {
        return new EfficiencyStateMachineWB($startState, $chargeState, $dischargeConstPowerState, $dischargePostConstPowerState, $endState);
    }
}