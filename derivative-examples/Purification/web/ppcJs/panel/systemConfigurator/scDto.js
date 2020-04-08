// ~/panel/systemConfigurator/scDto

define([], function () {
    return {
        NewSystem: function (name, /*int*/numSubsystems, /*int, number of batteries*/subsystemSize) {
            this.name = name;
            this.numSubsystems = numSubsystems;
            this.subsystemSize = subsystemSize;
        }
    };
});