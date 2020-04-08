// ~/bizLogic/movingWindow/AmplitudeBasedPlotAssigner
// Assigns series to one of two plots using amplitude comparison

define(['dojo/_base/declare', 'dojo/_base/array', './enums'],
function (declare, array, enums) {
    return declare(null,
    {
        // public configuration variables
        secondaryPlotRatio: 4,  // if >= 4:1 ration between peaks, smaller series assigned to secondary plot


        // lifecycle methods
        constructor: function () {
        },


        // public methods
        // assign each series in seriesSet to either the primary or secondary plot in seriesMap
        execute: function (/*{name: string, plot: enums.Plot}[]*/seriesMap, /*DataPoint[][]*/seriesSet) {
            var ranges = [];
            array.forEach(seriesSet, function (series) {
                var range = this._getRange(series);
                ranges.push(range);
            }, this);

            this._assignPlots(seriesMap, ranges);
        },


        // private methods

        // returns float, differential between max and min
        _getRange: function (/*DataPoint[]*/series) {
            var max = 0;
            var min = 0;

            array.forEach(series, function (dataPoint) {
                if (dataPoint.y > max) {
                    max = dataPoint.y;
                }
                else if (dataPoint.y < min) {
                    min = dataPoint.y;
                }
            });

            return (max - min);
        },

        // selection rules:
        // - determine range cutoff for primary
        // - ranges < cutoff assigned to secondary
        _assignPlots: function (/*{name: string, plot: enums.Plot}[]*/seriesMap, /*float[]*/ranges) {
            var maxRange = ranges[0];

            array.forEach(ranges, function (range) {
                if (range > maxRange) {
                    maxRange = range;
                }
            });

            var secondaryPlotThreshold = maxRange / this.secondaryPlotRatio;
            array.forEach(ranges, function (range, i) {
                var noRange = (range == 0); // cannot auto-scale axis if no range, so keep in primary plot
                seriesMap[i].plot = ((range > secondaryPlotThreshold) || noRange) ? enums.Plot.Primary : enums.Plot.Secondary;
            }, this)
        }
    });
});