dojo.provide('ppcJs.tests.SampleSetTest');
dojo.require('ppcJs.bizLogic.movingWindow.InputSample');
dojo.require('ppcJs.bizLogic.movingWindow.SampleSet');

doh.register('ppcJs.tests.SampleSetTest',
    [
        function testGetWindowLengthAndVerifyEmpty(t) {
            var windowLength = 2;   // sec
            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);

            var windowLengthMs = sut.getWindowLength();

            t.assertEqual(windowLength * 1000, windowLengthMs, 'incorrect window length');
            t.assertEqual(0, sut.getLastRowId(), 'getLastRowId returned nonzero when empty');
            t.assertTrue(sut.isEmpty(), 'isEmpty returned false when empty');
        },

        function testEnqueueSamplesOlderThanWindowLengthFlushed(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 2;   // sec

            // create test input array with timestamps in ascending order
            var inputSamples = new Array();
            for (var i = 0; i < (windowLength + 1); i++) {
                var dataArray = new Array(i, 2 * i, 3 * i);
                inputSamples.push(new ppcJs.bizLogic.movingWindow.InputSample(i + 1, startTicks + (1000 * i), dataArray));
            }

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            sut.enqueue(inputSamples);

            t.assertEqual(windowLength, sut._queue.count);
            var lastRowId = sut.getLastRowId();
            t.assertEqual(windowLength + 1, lastRowId);

            //  verify last 2 input samples are in queue
            var testSample = sut._queue.dequeue();
            t.assertEqual(startTicks + 1000, testSample.ticks, 'oldest sample - incorrect ticks');
            t.assertEqual(1, testSample.data[0]);

            testSample = sut._queue.dequeue();
            t.assertEqual(startTicks + 2000, testSample.ticks, 'most recent sample - incorrect ticks');
            t.assertEqual(4, testSample.data[1]);
        },

        function testEnqueueNewSamplesMovesWindowAndFlushesOlderSampleFromQueue(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 3;   // sec

            // load old samples, including one to be flushed
            var oldSample1 = new ppcJs.bizLogic.movingWindow.InputSample(1, startTicks - 5000, [1, 2, 3]);
            var oldSample2 = new ppcJs.bizLogic.movingWindow.InputSample(2, startTicks - 2000, [4, 5, 6]);
            var oldSamples = [oldSample1, oldSample2];

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            sut.enqueue(oldSamples);

            // load new samples
            var newSample1 = new ppcJs.bizLogic.movingWindow.InputSample(3, startTicks - 1000, [7, 8, 9]);
            var newSample2 = new ppcJs.bizLogic.movingWindow.InputSample(4, startTicks, [10, 11, 12]);
            var newSamples = [newSample1, newSample2];
            sut.enqueue(newSamples);

            t.assertEqual(3, sut._queue.count);

            var testSample = sut._queue.dequeue();
            t.assertEqual(oldSample2.ticks, testSample.ticks, 'oldSample2 - incorrect ticks');
            t.assertEqual(oldSample2.data[0], testSample.data[0]);

            testSample = sut._queue.dequeue();
            t.assertEqual(newSample1.ticks, testSample.ticks, 'newSample1 - incorrect ticks');
            t.assertEqual(newSample1.data[0], testSample.data[0]);

            testSample = sut._queue.dequeue();
            t.assertEqual(newSample2.ticks, testSample.ticks, 'newSample2 - incorrect ticks');
            t.assertEqual(newSample2.data[0], testSample.data[0]);
        },

        function testRepeatEnqueueOfSameSamplesIgnored(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 3;   // sec

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            // load samples 2x
            var newSample1 = new ppcJs.bizLogic.movingWindow.InputSample(1, startTicks - 1000, [7, 8, 9]);
            var newSample2 = new ppcJs.bizLogic.movingWindow.InputSample(2, startTicks, [10, 11, 12]);
            var newSamples = [newSample1, newSample2];
            sut.enqueue(newSamples);
            sut.enqueue(newSamples);

            t.assertEqual(2, sut._queue.count);

            var testSample = sut._queue.dequeue();
            t.assertEqual(newSample1.ticks, testSample.ticks, 'newSample1 - incorrect ticks');
            t.assertEqual(newSample1.data[0], testSample.data[0]);
            var testSample = sut._queue.dequeue();
            t.assertEqual(newSample2.ticks, testSample.ticks, 'newSample2 - incorrect ticks');
            t.assertEqual(newSample2.data[0], testSample.data[0]);
        },

        function testGetSeriesSet(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 3;   // sec

            // create test input array with timestamps in ascending order
            var inputSamples = new Array();
            for (var i = 0; i < (windowLength); i++) {
                var dataArray = new Array(i, 2 * i, 3 * i);
                inputSamples.push(new ppcJs.bizLogic.movingWindow.InputSample(i + 1, startTicks + 1000 * i, dataArray));
            }

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            sut.enqueue(inputSamples);

            var seriesSet = sut.getSeriesSet();

            /*
            inputSamples:
            sample[0]   {t, [0,0,0]}
            sample[1]   {t+1000, [1,2,3]}
            sample[2]   {t+2000, [2,4,6]}
            
            expected:
            seriesSet[0]   [{t, 0}, {t+1000, 1}, {t+2000, 2}]
            seriesSet[1]   [{t, 0}, {t+1000, 2}, {t+2000, 4}]
            seriesSet[2]   [{t, 0}, {t+1000, 3}, {t+2000, 6}]
            */
            t.assertEqual(inputSamples[1].ticks, seriesSet[0][1].x);
            t.assertEqual(inputSamples[2].data[2], seriesSet[2][2].y);
        },

        function testRepeatLastSampleInsertsCloneSample(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 3;   // sec

            // load old sample
            var oldSample1 = new ppcJs.bizLogic.movingWindow.InputSample(1, startTicks, [1, 2, 3]);
            var oldSample2 = new ppcJs.bizLogic.movingWindow.InputSample(2, startTicks + 1000, [1.1, 2.1, 3.1]);
            var oldSamples = [oldSample1, oldSample2];

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            sut.enqueue(oldSamples);

            var repeatTime = startTicks + 2000;
            sut.repeatLastSample(repeatTime);

            var seriesSet = sut.getSeriesSet();

            /*
            expected cloned samples:
            sample[0]   {t, [1,2,3]}
            sample[1]   {t+1000, [1,2,3]}
            
            expected:
            seriesSet[0]   [{t, 1}, {t+1000, 1.1}, {t+2000, 1.1}]
            seriesSet[1]   [{t, 2}, {t+1000, 2.1}, {t+2000, 2.1}]
            seriesSet[2]   [{t, 3}, {t+1000, 3.1}, {t+2000, 3.1}]
            */

            t.assertEqual(startTicks, seriesSet[0][0].x, 'incorrect old sample timestamp');
            t.assertEqual(oldSample1.data[0], seriesSet[0][0].y);
            var lastPointIndex = seriesSet[0].length - 1;
            t.assertEqual(repeatTime, seriesSet[2][lastPointIndex].x, 'incorrect clone timestamp');
            t.assertEqual(oldSample2.data[2], seriesSet[2][lastPointIndex].y);
        },

        function testRepeatLastSampleBeyondWindowInsertsCloneAndFlushesStaleSample(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 3;   // sec

            // load old sample
            var rowId = 1;
            var oldSample = new ppcJs.bizLogic.movingWindow.InputSample(rowId, startTicks, [1, 2, 3]);
            var oldSamples = [oldSample];

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            sut.enqueue(oldSamples);

            var repeatTime = startTicks + 1000 * (windowLength + 1); // should require flushing of oldSample
            sut.repeatLastSample(repeatTime);

            var seriesSet = sut.getSeriesSet();

            /*
            expected cloned samples:
            sample[0]   {t+2000, [1,2,3]}
            sample[1]   {t+4000, [1,2,3]}
            
            expected:
            seriesSet[0]   [{t+2000, 1}, {t+4000, 1}]
            seriesSet[1]   [{t+2000, 2}, {t+4000, 2}]
            seriesSet[2]   [{t+2000, 3}, {t+4000, 3}]
            */
            var firstCloneTime = repeatTime - windowLength + 1;
            t.assertEqual(firstCloneTime, seriesSet[0][0].x, 'incorrect first clone timestamp');
            t.assertEqual(oldSample.data[0], seriesSet[0][0].y);
            var lastPointIndex = seriesSet[0].length - 1;
            t.assertEqual(repeatTime, seriesSet[2][lastPointIndex].x, 'incorrect second clone timestamp');
            t.assertEqual(oldSample.data[2], seriesSet[2][lastPointIndex].y);

            t.assertEqual(rowId, sut.getLastRowId(), 'incorrect row ID');
        },

        function testFifoToArray(t) {
            // 00:00:00 1/24/12 UTC = 1327363200
            var startTicks = 1327363200000; // ms
            var windowLength = 3;   // sec

            // create test input array with timestamps in ascending order
            var inputSamples = new Array();
            for (var i = 0; i < (windowLength); i++) {
                var dataArray = new Array(i, 2 * i, 3 * i);
                inputSamples.push(new ppcJs.bizLogic.movingWindow.InputSample(i + 1, startTicks + 1000 * i, dataArray));
            }

            var sut = new ppcJs.bizLogic.movingWindow.SampleSet(windowLength);
            sut.enqueue(inputSamples);

            var result = sut.fifoToArray();
            t.assertEqual(windowLength, result.length, 'incorrect result array length');
            t.assertEqual(1, result[0].rowId, 'incorrect rowId');
            t.assertEqual(0, result[0].data[0], 'incorrect result[0].data[0]');
            t.assertEqual(6, result[2].data[2], 'incorrect result[2].data[2]');
        }

/*

function testEnqueueDataClearsCloneSample(t) {
// TODO: confirm this is desirable behavior
}
*/
    ]
);