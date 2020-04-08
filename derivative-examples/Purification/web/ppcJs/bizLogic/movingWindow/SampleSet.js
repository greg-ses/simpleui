// ~/bizLogic/movingWindow/SampleSet
// fixed length (FIFO) queue for holding InputSamples in a moving window
//  - flushes older samples that fall out of the time window as it moves forward on enqueueing new samples
//  - can repeat the last sample in lieue of enqueueing new samples
//  - generates data series from the FIFO

define(['dojo/_base/declare', 'dojox/collections/Queue', './DataPoint', '../../utilities/DataFormat'],
function (declare, xQueue, DataPoint, DataFormat) {
    return declare(null,
    {
        // private variables
        _queue: '',             // queue of InputSamples
        _windowLengthSec: '',
        _lastRowId: 0,
        _lastTimeStamp: 0,


        // lifecycle methods
        constructor: function (/*int*/windowLengthSec) {
            this._windowLengthSec = DataFormat.toInt(windowLengthSec);
            this._queue = new xQueue();
        },


        // public methods
        // takes array of InputSamples, ordered by ascending timestamp
        enqueue: function (/*InputSample[]*/inputSamples) {
            var lastTimeStamp = inputSamples[inputSamples.length - 1].ticks;

            // strip all overlap in inputSamples from last sample in queue and apply time window
            var trimmedInputSamples = dojo.filter(inputSamples, function (item) {
                return ((item.ticks > this._lastTimeStamp) && !this._isStale(item.ticks, lastTimeStamp));
            }, this);

            if (trimmedInputSamples.length > 0) {
                this._lastTimeStamp = lastTimeStamp;
                this._lastRowId = trimmedInputSamples[trimmedInputSamples.length - 1].rowId;
                // drop stale samples from window
                while ((this._queue.count > 0) && this._isStale(this._queue.peek().ticks, lastTimeStamp)) {
                    this._queue.dequeue();
                }

                for (var i = 0; i < trimmedInputSamples.length; i++) {
                    this._queue.enqueue(trimmedInputSamples[i]);
                }
            }
        },

        // returns bool, true = sample queue is empty
        isEmpty: function () {
            return (this._queue.count <= 0);
        },

        repeatLastSample: function (/*int, ms*/ticks) {
            // move iterator to previous sample
            var it = this._queue.getIterator();     // iterator undocumented, ref: dojox\collections\_base.js
            while (!it.atEnd()) {
                var lastSample = it.get();
            }

            // if the last sample is stale, flush and also clone a point at start of window
            if (this._isStale(lastSample.ticks, ticks)) {
                this._queue.clear();
                var startTime = ticks - this._windowLengthSec + 1;
                var startClone = this._cloneSample(lastSample, startTime);
                this.enqueue([startClone]);
            }

            var endClone = this._cloneSample(lastSample, ticks);
            this.enqueue([endClone]);
        },

        // returns [ DataPoint[], DataPoint[], ... ]
        getSeriesSet: function () {
            var seriesSet = new Array();

            var pivotQueue = this._queue.clone();
            if (pivotQueue.count > 0) {
                var numSeries = (pivotQueue.peek()).data.length;
                for (var i = 0; i < numSeries; i++) {
                    seriesSet.push(new Array());    // one for each series
                }

                while (pivotQueue.count > 0) {
                    var sample = pivotQueue.dequeue();
                    for (var seriesNum = 0; seriesNum < numSeries; seriesNum++) {
                        seriesSet[seriesNum].push(new DataPoint(sample.ticks, sample.data[seriesNum]));
                    }
                }
            }

            return seriesSet;
        },

        getLastRowId: function () {
            return this._lastRowId;
        },

        // returns unix timestamp in ms
        getLastTimeStamp: function () {
            return this._lastTimeStamp;
        },

        // returns window length in ms
        getWindowLength: function () {
            return (this._windowLengthSec * 1000);
        },

        // exports queue as an array
        // returns InputSample[], in chronological order
        fifoToArray: function () {
            return this._queue.toArray();
        },


        // private methods
        // returns true if ticksToTest has fallen out of the moving window 
        _isStale: function (/*int, ms*/ticksToTest, /*int, ms*/currentTicks) {
            var msPerSec = 1000;
            var timeLimit = currentTicks - (this._windowLengthSec * msPerSec);
            return (ticksToTest <= timeLimit);
        },

        // returns copy of oldSample at time newTicks
        _cloneSample: function (/*InputSample*/oldSample, /*int, ms*/newTicks) {
            var clonedSample = dojo.clone(oldSample);
            clonedSample.ticks = newTicks;

            return clonedSample;
        }
    });
});





