// ~/control/loadServerData/dsdDto

// (POJSOs to avoid Dijit construction mixin conflicts - otherwise Dijit becomes DTO class type)
define([], function () {
    return {
        // constructor object for setting LoadServerData public fields
        Ctor: function (name, intervalMs, /*bool*/showLabels) {
            this.name = name;
            this.intervalMs = intervalMs;
            this.showLabels = showLabels;
        },

        // update object
        Status: function ( /*float*/Load_Current,
        /*float*/Load_Voltage,
        /*float*/Load_Power,
        /*float*/Load_Resist,
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
            this.Load_Current = Load_Current;
            this.Load_Voltage = Load_Voltage;
            this.Load_Power = Load_Power;
            this.Load_Resist = Load_Resist;
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