<?php
// dummy concrete implementation of StateMachine
require_once "../../modules/state/State.php";
require_once "../../modules/state/StateMachine.php";

use state\State;

class DummyStateMachine extends \state\StateMachine
{
    private $_state1 = NULL;
    private $_state2 = NULL;
    
    public function __construct($state1, $state2)
    {
        $this->_state1 = $state1;
        $this->_state2 = $state2;
        $this->_setCurrent($this->_state1);
     }
    
    public function transition($swapStates)
    {
        if($swapStates) {
            $currentStateName = $this->getCurrentStateName();
            if($currentStateName == $this->_state1->getName()) {
                $this->_change($this->_state2);
            }
            else {
                $this->_change($this->_state1);
            }
        }
        else {
            $this->_while();
        }
    }
    
    public function setTimeBased($isTimeBased) {
        $this->_timeBased = $isTimeBased;
    }
}