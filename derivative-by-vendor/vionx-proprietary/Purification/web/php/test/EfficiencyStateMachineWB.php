<?php
// white box for EfficiencyStateMachine to allow test access to private methods
require_once "../../modules/efficiency/EfficiencyStateMachine.php";

use efficiency\EfficiencyStateMachine;

class EfficiencyStateMachineWB extends EfficiencyStateMachine
{
    public function setToEndState()
    {
        $this->_setCurrent($this->_endState);
    }
}