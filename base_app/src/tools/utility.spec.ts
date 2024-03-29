import { TestBed, async } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UTIL } from './utility';

class DataSummaryWrapper {
    Data_Summary = {};
}

class TestSetup {

    public static Initial_Data_Summary_Initializer = {
        'Data_Summary': {
            'u_id': '2001',
            'Title': {'u_id': '2002', 'value': 'INITIAL_MOCK'},
            'timeStamp': {'u_id': '2003', 'value': '1554127348000'},
            'Section': [{
                'name': 'EPO : Safety System', 'u_id': '2004', 'DataSets': {
                    'u_id': '2005',
                    'Module_Control': {
                        'u_id': '2006',
                        'dyn': [{
                            'class': 'on',
                            'disabled': 'false',
                            'name': 'Local_Mode',
                            'u_id': '2008',
                            'value': 'on'
                        }, {'name': 'EPO_State', 'u_id': '2009', 'value': 'EPO_Fault'}, {
                            'name': 'Fault_Op_Mode',
                            'u_id': '2010',
                            'value': 'tolerant'
                        }, {'class': 'priority', 'name': 'System_Mode', 'u_id': '2011', 'value': 'Offline'}],
                        'Remote': {
                            'class': '',
                            'u_id': '2012',
                            'command': {
                                'cmd': 'Remote',
                                'confirm': 'false',
                                'desc': 'Place the module into remote\\/local mode.',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'false',
                                'idnum': '0',
                                'label': 'Remote',
                                'name': 'Remote',
                                'u_id': '2013'
                            }
                        },
                        'Service': {
                            'class': '',
                            'u_id': '2014',
                            'command': {
                                'cmd': 'Service',
                                'confirm': 'false',
                                'desc': 'Place the module into specified mode.',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'false',
                                'idnum': '0',
                                'label': 'Service',
                                'name': 'Service',
                                'u_id': '2015'
                            }
                        }
                    },
                    'EPO_Control': {
                        'u_id': '2015',
                        'ResetEPO': {
                            'class': '',
                            'u_id': '2017',
                            'command': {
                                'cmd': 'ResetEPO',
                                'confirm': 'false',
                                'desc': 'Reset the module EPO system',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'true',
                                'idnum': '0',
                                'label': 'Reset_EPO',
                                'name': 'ResetEPO',
                                'u_id': '2018'
                            }
                        },
                        'EnableSystem': {
                            'class': '',
                            'u_id': '2019',
                            'command': {
                                'cmd': 'EnableSystem',
                                'confirm': 'false',
                                'desc': 'Enable the module .',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'true',
                                'idnum': '0',
                                'label': 'Enable',
                                'name': 'EnableSystem',
                                'u_id': '2020'
                            }
                        },
                        'DisableSystem': {
                            'class': '',
                            'u_id': '2021',
                            'command': {
                                'cmd': 'DisableSystem',
                                'confirm': 'false',
                                'desc': 'Disable the module .',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'true',
                                'idnum': '0',
                                'label': 'Disable',
                                'name': 'DisableSystem',
                                'u_id': '2022'
                            }
                        }
                    },
                    'VCU_Inputs': {
                        'u_id': '2022',
                        'dyn': [{
                            'class': 'off',
                            'desc': ' [c1-vcu-VEC:Safety_IN_1_2_Bypass]',
                            'name': 'Door_Bypass',
                            'u_id': '2024',
                            'value': 'off'
                        }, {
                            'class': 'off',
                            'desc': ' [c1-vcu-VEC:Safety_IN1_a]',
                            'name': 'ZS301A_Switch_Door_Side_A',
                            'u_id': '2025',
                            'value': 'Off\\n                '
                        }, {
                            'class': 'on',
                            'desc': ' [c1-vcu-VEC:Safety_IN2_a]',
                            'name': 'ZS301B_Switch_Door_Side_B',
                            'u_id': '2026',
                            'value': 'On'
                        }, {
                            'class': 'on',
                            'desc': ' [c1-vcu-VEC:Safety_IN5_a]',
                            'name': 'PS403_Switch_PAD_Over_Pressure',
                            'u_id': '2027',
                            'value': 'On\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-vcu-VEC:Safety_IN3_a]',
                            'name': 'LS317A_Switch_Leak_Stack_Container_Side_A',
                            'u_id': '2028',
                            'value': 'Off\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-vcu-VEC:Safety_IN7_a]',
                            'name': 'Safety_Interlock_VCU_SMU_Alive',
                            'u_id': '2029',
                            'value': '\\n                    Off\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-vcu-VEC:Safety_IN6_a]',
                            'name': 'EPO_Mushroom_Button_VCU',
                            'u_id': '2030',
                            'value': 'Off'
                        }, {
                            'class': 'off',
                            'desc': ' [c1-vcu-VEC:ESTOP_FB]',
                            'name': 'External_Stop_VCU',
                            'u_id': '2031',
                            'value': 'off'
                        }],
                        'SetDigital': {
                            'class': 'off',
                            'u_id': '2032',
                            'value': 'off\\n                ',
                            'command': {
                                'cmd': 'SetDigital',
                                'confirm': 'false',
                                'desc': ' [c1-vcu-VEC:Reset_Safe_Input_Flt]',
                                'dest': 'dProcCtrl',
                                'deviceId': '0',
                                'disabled': 'true',
                                'idnum': '0',
                                'label': 'Reset_EPO_VCU',
                                'name': 'SetDigital',
                                'u_id': '2033',
                                'val': 'on'
                            }
                        },
                        'VEC_Enable': {
                            'class': 'Off',
                            'u_id': '2034',
                            'value': 'Disabled\\n                ',
                            'command': {
                                'cmd': 'VEC_Enable',
                                'confirm': 'false',
                                'desc': 'Enable Unit',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'true',
                                'idnum': '18',
                                'label': 'Enable',
                                'name': 'VEC_Enable',
                                'u_id': '2035'
                            }
                        }
                    },
                    'SMU_Inputs': {
                        'u_id': '2035',
                        'dyn': [{
                            'class': 'off',
                            'desc': ' [c1-smu-VEC:Safety_IN3_a]',
                            'name': 'LS317B_Switch_Leak_Stack_Container_Side_B',
                            'u_id': '2037',
                            'value': 'Off\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-smu-VEC:Safety_IN4_a]',
                            'name': 'LS318_Switch_Leak_Stack_Container_Ref_Cell',
                            'u_id': '2038',
                            'value': 'Off\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-smu-VEC:Safety_IN7_a]',
                            'name': 'LS401_Switch_Leak_Stack_Container_PAD',
                            'u_id': '2039',
                            'value': 'Off\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-smu-VEC:Safety_IN2_a]',
                            'name': 'Safety_Interlock_SMU_VCU_Enabled',
                            'u_id': '2040',
                            'value': '\\n                    Off\\n                '
                        }, {
                            'class': 'off',
                            'desc': ' [c1-smu-VEC:Safety_IN6_a]',
                            'name': 'EPO_Mushroom_Button_SMU',
                            'u_id': '2041',
                            'value': 'Off'
                        }, {
                            'class': 'off',
                            'desc': ' [c1-smu-VEC:ESTOP_FB]',
                            'name': 'External_Stop_SMU',
                            'u_id': '2042',
                            'value': 'off'
                        }],
                        'SetDigital': {
                            'class': 'off',
                            'u_id': '2043',
                            'value': 'off\\n                ',
                            'command': {
                                'cmd': 'SetDigital',
                                'confirm': 'false',
                                'desc': ' [c1-smu-VEC:Reset_Safe_Input_Flt]',
                                'dest': 'dProcCtrl',
                                'deviceId': '0',
                                'disabled': 'true',
                                'idnum': '1',
                                'label': 'Reset_EPO_SMU',
                                'name': 'SetDigital',
                                'u_id': '2044',
                                'val': 'on'
                            }
                        },
                        'VEC_Enable': {
                            'class': 'Off',
                            'u_id': '2045',
                            'value': 'Disabled\\n                ',
                            'command': {
                                'cmd': 'VEC_Enable',
                                'confirm': 'false',
                                'desc': 'Enable Unit',
                                'dest': 'dProcCtrl',
                                'deviceId': '1',
                                'disabled': 'true',
                                'idnum': '12',
                                'label': 'Enable',
                                'name': 'VEC_Enable',
                                'u_id': '2046'
                            }
                        }
                    }
                }
            }, {
                'menuPos': 'left', 'name': ' PMP102 An UTIL Pump \\/ PMP202 Ca UTIL Pump', 'u_id': '2568', 'CmdSet': {
                    'orientation': 'vertical',
                    'u_id': '2569',
                    'command': [{
                        'cmd': 'EnablePump',
                        'confirm': 'false',
                        'desc': 'Enable [c1-vcu-PUMP:AnUtil]',
                        'dest': 'dProcCtrl',
                        'deviceId': '72',
                        'disabled': 'true',
                        'idnum': '0',
                        'label': 'Enable',
                        'name': 'EnablePump',
                        'u_id': '2571'
                    }, {
                        'cmd': 'DisablePump',
                        'confirm': 'false',
                        'desc': 'Disable [c1-vcu-PUMP:AnUtil]',
                        'dest': 'dProcCtrl',
                        'deviceId': '72',
                        'disabled': 'true',
                        'idnum': '0',
                        'label': 'Disable',
                        'name': 'DisablePump',
                        'u_id': '2572'
                    }, {
                        'cmd': 'StartPump',
                        'confirm': 'false',
                        'desc': 'Start [c1-vcu-PUMP:AnUtil]',
                        'dest': 'dProcCtrl',
                        'deviceId': '72',
                        'disabled': 'true',
                        'idnum': '0',
                        'label': 'Start',
                        'name': 'StartPump',
                        'u_id': '2573'
                    }, {
                        'cmd': 'StopPump',
                        'confirm': 'false',
                        'desc': 'Stop [c1-vcu-PUMP:AnUtil]',
                        'dest': 'dProcCtrl',
                        'deviceId': '72',
                        'disabled': 'true',
                        'idnum': '0',
                        'label': 'Stop',
                        'name': 'StopPump',
                        'u_id': '2574'
                    }, {
                        'cmd': 'SetSpeed',
                        'desc': 'Set Speed [c1-vcu-PUMP:AnUtil]',
                        'dest': 'dProcCtrl',
                        'deviceId': '72',
                        'disabled': 'true',
                        'idnum': '0',
                        'label': 'Set Speed',
                        'name': 'SetSpeed',
                        'u_id': '2575',
                        '_input': {
                            '_type': 'float',
                            'desc': 'Enter speed in Hz',
                            'idnum': '0',
                            'max': '60.0',
                            'min': '0.0',
                            'u_id': '2576',
                            'value': '0.0'
                        }
                    }, {
                        'cmd': 'ClearFault',
                        'confirm': 'false',
                        'desc': 'Clear Fault [c1-vcu-PUMP:AnUtil]',
                        'dest': 'dProcCtrl',
                        'deviceId': '72',
                        'disabled': 'true',
                        'idnum': '0',
                        'label': 'Clear Fault',
                        'name': 'ClearFault',
                        'u_id': '2577'
                    }]
                }, 'DataSets': [{
                    'u_id': '2577',
                    'PF1': {
                        'name': 'An_Util_Pump Control',
                        'u_id': '2578',
                        'dyn': [{'name': 'Enabled', 'u_id': '2580', 'value': 'false'}, {
                            'name': 'Pump_Status',
                            'u_id': '2581',
                            'value': 'Comm Fault'
                        }, {'name': 'Pump_Faults', 'u_id': '2582', 'value': '0:None'}, {
                            'name': 'Command_Speed',
                            'u_id': '2583',
                            'units': 'Hz',
                            'value': '0.0'
                        }, {
                            'class': 'priority',
                            'name': 'Actual_Speed',
                            'u_id': '2584',
                            'units': 'Hz',
                            'value': '0.0'
                        }, {
                            'desc': 'Power at the inverter input side.',
                            'name': 'Input_Power',
                            'u_id': '2585',
                            'units': 'kW',
                            'value': '0.00'
                        }, {
                            'desc': 'Power at the inverter output side.',
                            'name': 'Output_Power',
                            'u_id': '2586',
                            'units': 'kW',
                            'value': '0.00'
                        }, {'desc': 'Motor shaft power output.', 'name': 'Motor_Power', 'u_id': '2587', 'units': 'kW', 'value': '0.00'}]
                    },
                    'An_Utility_Valves': {
                        'u_id': '2587',
                        'TransferValve': {
                            'class': 'Process',
                            'u_id': '2589',
                            'value': 'Process\\n                ',
                            'command': {
                                'cmd': 'TransferValve',
                                'confirm': 'false',
                                'desc': 'Anolyte utility transfer valve. [c1-vcu-VALVECTRL-1:Valve 11]',
                                'dest': 'dProcCtrl',
                                'deviceId': '73',
                                'disabled': 'true',
                                'idnum': '2',
                                'label': 'Tranfer:CV121_An_Xfer',
                                'name': 'TransferValve',
                                'u_id': '2590',
                                'val': '1'
                            }
                        }
                    },
                    'An_Utility_Data': {
                        'u_id': '2590',
                        'dyn': [{
                            'class': 'priority',
                            'desc': 'Anolyte utility pressure. [c1-smu-SENSEMON-3:AIN2]',
                            'name': 'PT102_An_Util',
                            'u_id': '2592',
                            'units': 'PSI',
                            'value': '0.2\\n                '
                        }, {
                            'desc': 'Anolyte utility flow. [c1-smu-SENSEMON-3:AIN0]',
                            'name': 'FT105_An_Util',
                            'u_id': '2593',
                            'value': '\\n                    Disconnected\\n                '
                        }, {
                            'desc': 'An Hex Inlet temperature. [c1-smu-SENSEMON-1:RTD_2]',
                            'name': 'TT102_An_Hex_Inlet',
                            'u_id': '2594',
                            'units': 'C',
                            'value': '-4.3\\n                '
                        }, {
                            'desc': 'An Hex Return temperature. [c1-smu-SENSEMON-2:RTD_2]',
                            'name': 'TT103_An_Hex_Return',
                            'u_id': '2595',
                            'units': 'C',
                            'value': '-4.4\\n                '
                        }]
                    }
                }, {
                    'u_id': '2604',
                    'PF1': {
                        'name': 'Ca_Util_Pump Control',
                        'u_id': '2605',
                        'dyn': [{'name': 'Enabled', 'u_id': '2607', 'value': 'false'}, {
                            'name': 'Pump_Status',
                            'u_id': '2608',
                            'value': 'Comm Fault'
                        }, {'name': 'Pump_Faults', 'u_id': '2609', 'value': '0:None'}, {
                            'name': 'Command_Speed',
                            'u_id': '2610',
                            'units': 'Hz',
                            'value': '0.0'
                        }, {
                            'class': 'priority',
                            'name': 'Actual_Speed',
                            'u_id': '2611',
                            'units': 'Hz',
                            'value': '0.0'
                        }, {
                            'desc': 'Power at the inverter input side.',
                            'name': 'Input_Power',
                            'u_id': '2612',
                            'units': 'kW',
                            'value': '0.00'
                        }, {
                            'desc': 'Power at the inverter output side.',
                            'name': 'Output_Power',
                            'u_id': '2613',
                            'units': 'kW',
                            'value': '0.00'
                        }, {'desc': 'Motor shaft power output.', 'name': 'Motor_Power', 'u_id': '2614', 'units': 'kW', 'value': '0.00'}]
                    },
                    'Ca_Utility_Valves': {
                        'u_id': '2614',
                        'TransferValve': {
                            'class': 'Process',
                            'u_id': '2616',
                            'value': 'Process\\n                ',
                            'command': {
                                'cmd': 'TransferValve',
                                'confirm': 'false',
                                'desc': 'Catholyte utility transfer valve. [c1-vcu-VALVECTRL-2:Valve 11]',
                                'dest': 'dProcCtrl',
                                'deviceId': '73',
                                'disabled': 'true',
                                'idnum': '3',
                                'label': 'Tranfer:CV221_Ca_Xfer',
                                'name': 'TransferValve',
                                'u_id': '2617',
                                'val': '1'
                            }
                        }
                    },
                    'Ca_Utility_Data': {
                        'u_id': '2617',
                        'dyn': [{
                            'desc': 'Catholyte utility pressure. [c1-smu-SENSEMON-3:AIN3]',
                            'name': 'PT202_Ca_Util',
                            'u_id': '2619',
                            'units': 'PSI',
                            'value': '0.1\\n                '
                        }, {
                            'desc': 'Catholyte utility flow. [c1-smu-SENSEMON-3:AIN1]',
                            'name': 'FT205_Ca_Util',
                            'u_id': '2620',
                            'value': '-OOR'
                        }, {
                            'desc': 'Ca Hex Inlet temperature. [c1-smu-SENSEMON-1:RTD_5]',
                            'name': 'TT202_Ca_Hex_Inlet',
                            'u_id': '2621',
                            'units': 'C',
                            'value': '-3.8\\n                '
                        }, {
                            'desc': 'Ca Hex Return temperature. [c1-smu-SENSEMON-2:RTD_5]',
                            'name': 'TT203_Ca_Hex_Return',
                            'u_id': '2622',
                            'units': 'C',
                            'value': '-3.2\\n                '
                        }]
                    }
                }]
            }],
            'status': '0'
        }
    };

    public static Working_Data_Summary_Initializer = {
        'Data_Summary': {
            'u_id': '1111',
            'Title': {'u_id': '1112', 'value': 'INITIAL_WORKING_MOCK'}
        }
    };
}


describe('UTIL', () => {
    let initialData: DataSummaryWrapper = {Data_Summary: {}};
    let workingData: DataSummaryWrapper = {Data_Summary: {}};

    beforeEach(async(() => {
        initialData = UTIL.deepCopy(TestSetup.Working_Data_Summary_Initializer);
        workingData = UTIL.deepCopy(TestSetup.Initial_Data_Summary_Initializer);
        TestBed.configureTestingModule({
            declarations: [
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
        }).compileComponents();
    }));

    it('TestSetup Working- and Initial- statics should have different list of property names', () => {
        const initialProps = Object.getOwnPropertyNames(workingData.Data_Summary).join();
        const workingProps = Object.getOwnPropertyNames(initialData.Data_Summary).join();

        expect(workingProps).not.toEqual(initialProps);
    });

    /*
    it('TestSetup Working- and Initial- statics should have identical property names after UTIL.recursiveUpdate()', () => {
        UTIL.recursiveUpdate(TestSetup.Working_Data_Summary_Initializer, TestSetup.Initial_Data_Summary_Initializer);

        const initialProps = Object.getOwnPropertyNames(initialData.Data_Summary).join();
        const workingProps = Object.getOwnPropertyNames(workingData.Data_Summary).join();

        expect(workingProps).toEqual(initialProps);
    });


    it('TestSetup statics should be equal after appropriate transformations', () => {

        let working_Data_Summary = TestSetup.Working_Data_Summary_Initializer;

        // Now make a couple of well-understood changes to
        let directly_Updated_Data_Summary = TestSetup.Initial_Data_Summary_Initializer;

        const pumpSection = TestSetup.Initial_Data_Summary_Initializer.Data_Summary.Section[1];

        // Now call the UTIL.DeepTransform function
        expect(Expected_Data_Summary).toEqual(Updated_Data_Summary);
    });
    */
});
