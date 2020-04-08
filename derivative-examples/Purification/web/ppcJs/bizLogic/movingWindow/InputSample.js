// ~/bizLogic/movingWindow/InputSample
// intermediate value class holding a single time sample of all data series

define(['dojo/_base/declare'],
function (declare) {
    return declare(null,
    {
        rowId: 0,
        ticks: 0,  // number of milliseconds since January 1, 1970 in UTC
        data: '',

        constructor: function (/*int*/rowId, /*int, ms*/ticks, /*float[]*/dataVal) {
            this.rowId = rowId;
            this.ticks = ticks;
            this.data = dataVal;
        },

        toArray: function () {
            var sample = new Array();
            sample.push(this.rowId);
            sample.push(this.ticks);
            for (var i = 0; i < this.data.length; i++) {
                sample.push(this.data[i]);
            }

            return sample;
        }
    });
});
