// ~/ConfigTypeDef
//  enums, constants, and typedefs for the Configurator web app
// Note: must be synchronized with PHP enum ~/web/Server/BatteryTrackerService/BatteryTracker/BatteryLifeCycleEnum

define([], function () {
    return {
        // battery lifecycle
        BatteryStateEnum: {
            Inventory: 0,   // available to install in a system
            Installed: 1,   // installed in a system
            Retired: 2      // no longer in use
        }
    };
});