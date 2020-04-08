// ~/control/dcServerData/dsdDto

// (POJSOs to avoid Dijit construction mixin conflicts - otherwise Dijit becomes DTO class type)
define([], function () {
    return {
        // constructor object for setting DcServerData public fields
        Ctor: function (name, intervalMs, /*bool*/showLabels) {
            this.name = name;
            this.intervalMs = intervalMs;
            this.showLabels = showLabels;
        },

        // update object
        Status: function ( /*float*/Batt_Current,
        /*float*/Batt_Voltage,
        /*float*/DCBus_Voltage,
        /*float*/Bus_Current,
        /*float*/Amp_Hours,
        /*float*/OVP_Setpoint,
        /*int*/DC_Mode,
        /*int*/DCStatus,
        /*int*/DCFault_Status,
        /*string*/SF_Version,
        /*String*/FaultInfo,
        /*String*/StatusInfo,
        /*String*/ModeInfo,
        /*nullable int, ms since epoch*/timestamp
                         ) {
            this.Batt_Current = Batt_Current;
            this.Batt_Voltage = Batt_Voltage;
            this.DCBus_Voltage = DCBus_Voltage;
            this.Bus_Current = Bus_Current;
            this.Amp_Hours = Amp_Hours;
            this.OVP_Setpoint = OVP_Setpoint;
            this.DC_Mode = DC_Mode;
            this.DCStatus = DCStatus;
            this.DCFault_Status = DCFault_Status;
            this.SF_Version = SF_Version;
            this.FaultInfo = FaultInfo;
            this.StatusInfo = StatusInfo;
            this.ModeInfo = ModeInfo;
            this.timestamp = timestamp;

        }
    };
});