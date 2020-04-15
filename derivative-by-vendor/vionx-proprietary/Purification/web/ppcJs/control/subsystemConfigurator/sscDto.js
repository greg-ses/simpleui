// ~/control/subsystemConfigurator/sscDto

define([], function () {
    return {
        // formalizes expected JSON
        // ref: ~\trunk\web\Server\ppcJs\tests\getSubsystems.json
        Ctor: function (/*subsystem JSON object*/item) {
            this.id = item.id;
            this.name = item.name;
            this.batterySerialNumbers = item.batterySerialNumbers;
            this.timeStamp = item.timeStamp;
            this.logEntries = item.logEntries;
            this.baseUrl = item.baseUrl;
        }
    };
});