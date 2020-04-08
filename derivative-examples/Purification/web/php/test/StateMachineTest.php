<?php

require_once "../../test/DummyStateMachine.php";
require_once "../../modules/state/State.php";

use state\State;

class StateMachineTest extends PHPUnit_Framework_TestCase
{
    const STATE1_NAME = 'state 1';
    const STATE2_NAME = 'state 2';
    private $_state1 = NULL;
    private $_state2 = NULL;
    private $_sut = NULL;
    
    private $_enterResult = '';
    private $_duringResult = '';
    private $_leaveResult = '';
    
    public function setUp()
    {
        $this->_enterResult = '';
        $this->_duringResult = '';
        $this->_leaveResult = '';
        
        $enterCallback1 = array($this, '_enterCallback1');
        $enterCallback2 = array($this, '_enterCallback2');
        $duringCallback1 = array($this, '_duringCallback1');
        $duringCallback2 = array($this, '_duringCallback2');
        $leaveCallback1 = array($this, '_leaveCallback1');
        $leaveCallback2 = array($this, '_leaveCallback2');
        $this->_state1 = new State(self::STATE1_NAME, $enterCallback1, $duringCallback1, $leaveCallback1);
        $this->_state2 = new State(self::STATE2_NAME, $enterCallback2, $duringCallback2, $leaveCallback2);
        $this->_sut = new DummyStateMachine($this->_state1, $this->_state2);
    }

    public function tearDown(){ }
    
    public function testEnterState()
    {
        $this->_sut->setTimeBased(true);
        $this->_sut->transition(true);
        $this->assertEquals(self::STATE1_NAME, $this->_leaveResult);
        $this->assertEquals(self::STATE2_NAME, $this->_enterResult);
        $this->assertEquals(self::STATE2_NAME, $this->_duringResult);
    }
    
    public function testDuringState()
    {
        $this->_sut->transition(false);
        $this->assertEquals(self::STATE1_NAME, $this->_duringResult);
    }
    
    public function _enterCallback1()
    {
        $this->_enterResult = self::STATE1_NAME;
    }
    
    public function _enterCallback2()
    {
        $this->_enterResult = self::STATE2_NAME;
    }
  
    public function _duringCallback1()
    {
        $this->_duringResult = self::STATE1_NAME;
    }
    
    public function _duringCallback2()
    {
        $this->_duringResult = self::STATE2_NAME;
    }
    
    public function _leaveCallback1()
    {
        $this->_leaveResult = self::STATE1_NAME;
    }
    
    public function _leaveCallback2()
    {
        $this->_leaveResult = self::STATE2_NAME;
    }
}