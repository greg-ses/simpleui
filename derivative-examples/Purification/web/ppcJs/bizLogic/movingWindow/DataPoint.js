// ~/bizLogic/movingWindow/DataPoint
// DataPoints make up data series consumed, for example, by charts

define(['dojo/_base/declare'],
function (declare) {
    return declare(null,
    {
        x: '',
        y: '',

        constructor: function (/*int*/x, /*float*/y) {
            this.x = x;
            this.y = y;
        }
    });
});