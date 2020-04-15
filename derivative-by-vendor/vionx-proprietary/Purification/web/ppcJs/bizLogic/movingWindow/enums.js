// ~/bizLogic/movingWindow/enums

define([], function () {
    return {
        // timescale marker interval selector
        Interval: {
            OneMinute: 0,
            FiveMinutes: 1,
            OneHour: 2,
            TwoHours: 3,
            FourHours: 4,
            OneDay: 5,
            TwoDays: 6,
            SevenDays: 7,
            FifteenMinutes: 8,
            TwelveHours: 9
        },

        // for assigning a series to one of up to two plots with different y axes
        Plot: {
            Primary: 0,
            Secondary: 1
        }
    };
});