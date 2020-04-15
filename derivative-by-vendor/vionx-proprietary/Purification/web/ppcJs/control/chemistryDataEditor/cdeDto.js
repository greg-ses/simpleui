// ~/control/chemistryDataEditor/cdeDto

define([], function () {
    return {
        // DTO for creating, viewing, updating a chemistry data log
        ChemistryData: function (zincMolarConcentration, 
                                bromineMolarConcentration,
                                zincPh,
                                brominePh,
                                indirectBromineInZincTank,
                                indirectBromineInBromineTank,
                                electrolyteAdded,
                                bromineAdded,
                                logEntry
            ) {
            // POST/PUT fields
            this.subsystemTestRunId = 0;    // set after construction
            this.zincMolarConcentration = parseFloat(zincMolarConcentration, 10);
            this.bromineMolarConcentration = parseFloat(bromineMolarConcentration, 10);
            this.zincPh = parseFloat(zincPh, 10);
            this.brominePh = parseFloat(brominePh, 10);
            this.indirectBromineInZincTank = parseFloat(indirectBromineInZincTank, 10);
            this.indirectBromineInBromineTank = parseFloat(indirectBromineInBromineTank, 10);
            this.electrolyteAdded = electrolyteAdded;
            this.bromineAdded = bromineAdded;
            this.logEntry = logEntry;

            // GET fields (set after construction)
            this.avgMolarConcentration = 0;
            this.avgPh = 0;
            this.avgBromine = 0;
        }
    };
});