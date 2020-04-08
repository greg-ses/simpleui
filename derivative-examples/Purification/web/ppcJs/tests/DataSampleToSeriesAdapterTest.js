dojo.provide('ppcJs.tests.DataSampleToSeriesAdapterTest');

dojo.require('ppcJs.Enum');
dojo.require('dojox.data.XmlStore');
dojo.require('ppcJs.bizLogic.movingWindow.ItemTemplate');
dojo.require('ppcJs.bizLogic.movingWindow.SampleTemplate');
dojo.require('ppcJs.bizLogic.movingWindow.DataSampleToSeriesAdapter');
dojo.require('ppcJs.tests.MovingWindowChartTestUtilities');

//var dataSampleToSeriesAdapterTestTimeout = 7000;

doh.register('ppcJs.tests.DataSampleToSeriesAdapterTest',
    [
        function testConstructSampleTemplate(t) {
            var xmlItem = ppcJs.tests.MovingWindowChartTestUtilities.getSampleTemplateXmlItem();
            var sampleTemplate = new ppcJs.bizLogic.movingWindow.SampleTemplate(xmlItem);

            var rowId = sampleTemplate.RowId;
            t.assertEqual(0, rowId.Index);
            t.assertEqual(ppcJs.Enum.ValueType.Integer, rowId.Type);

            var timeStamp = sampleTemplate.TimeStamp;
            t.assertEqual(timeStamp.Index, 1);
            t.assertEqual(timeStamp.Type, ppcJs.Enum.ValueType.TimeStamp);

            var seriesSet = sampleTemplate.SeriesSet;
            t.assertEqual(6, seriesSet[3].Index);
            t.assertEqual(ppcJs.Enum.ValueType.Float, seriesSet[3].Type);
            t.assertEqual('avg_Q4_TotalBattAH', seriesSet[3].Name);
            t.assertEqual('Quad 4 Total Battery Amp Hours', seriesSet[3].Description);
        },

        function testConstructDataSampleToSeriesAdapter(t) {
            var xmlItem = ppcJs.tests.MovingWindowChartTestUtilities.getSampleTemplateXmlItem();
            var sampleTemplate = new ppcJs.bizLogic.movingWindow.SampleTemplate(xmlItem);
            var sut = new ppcJs.bizLogic.movingWindow.DataSampleToSeriesAdapter(sampleTemplate);

            xmlItem = ppcJs.tests.MovingWindowChartTestUtilities.getSamplesXmlItem();
            var inputSamples = sut.convertToSamples(xmlItem);

            /*
            expected inputSamples:
            sample[0]   {65950, 1324482120, [0.0000, 1.0000, 3.0000, 4.0000]}
            sample[1]   {65951, 1324482180, [0.1000, 1.1000, 3.1000, 4.1000]}
            sample[2]   {65952, 1324482240, [0.2000, 1.2000, 3.2000, 4.2000]}
            sample[3]   {65953, 1324482300, [0.3000, 1.3000, 3.3000, 4.3000]}
            sample[4]   {65954, 1324482360, [0.4000, 1.4000, 3.4000, 4.4000]}
            */
            t.assertEqual(65950, inputSamples[0].rowId);
            t.assertEqual(1324482120000, inputSamples[0].ticks);
            t.assertEqual(4.4000, inputSamples[4].data[3]);
        },

        function testGetSeriesNames(t) {
            var xmlItem = ppcJs.tests.MovingWindowChartTestUtilities.getSampleTemplateXmlItem();
            var sampleTemplate = new ppcJs.bizLogic.movingWindow.SampleTemplate(xmlItem);
            var sut = new ppcJs.bizLogic.movingWindow.DataSampleToSeriesAdapter(sampleTemplate);

            var seriesNames = sut.getSeriesNames();
            t.assertEqual(4, seriesNames.length);
            t.assertEqual('avg_Q1_TotalBattAH', seriesNames[0]);
            t.assertEqual('avg_Q2_TotalBattAH', seriesNames[1]);
            t.assertEqual('avg_Q3_TotalBattAH', seriesNames[2]);
            t.assertEqual('avg_Q4_TotalBattAH', seriesNames[3]);
        }

    ]
);