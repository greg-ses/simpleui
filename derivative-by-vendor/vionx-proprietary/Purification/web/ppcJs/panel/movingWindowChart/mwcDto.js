// ~/panel/movingWindowChart/mwcDto

define([], function () {
    return {
        // capture chart state in order to refetch view
        ChartState: function (/*string*/fullUrl, /*Date obj*/startTime, windowLengthMs) {
            this.fullUrl = fullUrl;
            this.startTime = startTime;
            this.windowLengthMs = windowLengthMs;
        },

        // for persisting config settings to cookie/memory as hash object Persistance
        // one Persistance instance per resource (ordered by resourceId)
        // where resourcesAxes contains one AxisSettings object per chart ID (ordered by chart ID)
        // usage: { name:, plot: bizLogic/movingWindow/enums.Plot}[] chartSettings = configSettings['LTS1].axisSettings['ACAC_VoltCurr']
        Persistence: function (/*bool*/enableSecondYAxis, /*int*/secondPlotRatio, /*bool*/isAuto) {
            this.enableSecondYAxis = enableSecondYAxis;
            this.secondPlotRatio = secondPlotRatio;
            this.isAuto = isAuto;
            this.axisSettings = {};
        },

        // Not Yet Used
        // secondary axis configuration for one resource's ('LTS1') chart ('ACAC_VoltCurr')
        // one per chart ID
        AxisSettings: function (/*bool*/isAuto, /*{ name:, plot: bizLogic/movingWindow/enums.Plot}[]*/seriesMap) {
            this.isAuto = isAuto;
            this.axes = axes;
        }
    };
});