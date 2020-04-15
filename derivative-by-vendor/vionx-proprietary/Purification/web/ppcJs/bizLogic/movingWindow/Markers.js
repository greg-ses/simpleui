// ~/bizLogic/movingWindow/Markers
// Markers container

define(['dojo/_base/declare'],
function (declare) {
    return declare(null,
    {
        Offset: 0,              // unix time of Labels[0], ms
        MarkerInterval: '',     // ms per nomalized chart horizontal unit
        MarkerSubInterval: '',  // as ratio to MarkerInterval
        Labels: '',

        constructor: function (/*int, ms*/offset, /*int, ms*/markerInterval, /*int*/subInterval) {
            this.Offset = offset;
            this.MarkerInterval = markerInterval;
            this.MarkerSubInterval = subInterval;
            this.Labels = new Array();
        }
    });
});