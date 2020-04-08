// ~/bizLogic/movingWindow/DataSampleToSeriesAdapter

// given a SampleTemplate,
// - converts XmlItems to InputSample[] for use by SampleSet
// - provides the data series names

define(['dojo/_base/declare', 'dojox/xml/parser',
         '../../Enum', '../../utilities/DataFormat', './ItemTemplate', './InputSample'],
function (declare, parser,
        Enum, DataFormat, ItemTemplate, InputSample) {
    return declare(null,
    {
        // xml tag definitions
        _sampleTag: 'd',

        // custom variables
        _sampleTemplate: '',
        _sampleList: '',


        // lifecycle methods
        constructor: function (/*SampleTemplate*/sampleTemplate) {
            this._sampleTemplate = sampleTemplate;
        },


        // public methods
        // returns string[]
        getSeriesNames: function () {
            var seriesNames = new Array();

            for(var i=0; i<this._sampleTemplate.SeriesSet.length; i++) {
                seriesNames.push( this._sampleTemplate.SeriesSet[i].Name );
            }

            return seriesNames;
        },

        // returns InputSample[]
        convertToSamples: function (/*dojox.data.XmlItem*/samplesXmlItem) {
            this._sampleList = new Array();

            dojo.forEach(
                dojo.query(this._sampleTag, samplesXmlItem['element']),
                this._populateSampleList,
                this
            );

            return this._sampleList;
        },


        // private methods
        _populateSampleList: function (/*XmlElement*/sampleXmlElement) {
            var dataVal = new Array();

            var sampleStr = parser.textContent(sampleXmlElement);
            var sampleFields = sampleStr.split(',');

            // use template to map fields and build array in order of template array
            var rowId = parseInt(sampleFields[this._sampleTemplate.RowId.Index]);
            var ticksMs = parseInt(sampleFields[this._sampleTemplate.TimeStamp.Index]) * 1000;

            for(var i=0; i<this._sampleTemplate.SeriesSet.length; i++) {
                var index = this._sampleTemplate.SeriesSet[i].Index;

                switch(this._sampleTemplate.SeriesSet[i].Type)
                {
                    case (Enum.ValueType.Integer):
                    dataVal[i] = parseInt(sampleFields[index]);
                    break;

                case (Enum.ValueType.Float):
                    dataVal[i] = parseFloat(sampleFields[index]);
                    break;

                case (Enum.ValueType.TimeStamp):
                    var timeSec = parseInt(sampleFields[index]);
                    dataVal[i] = DataFormat.toInt(timeSec);
                    break;

                default:
                    dataVal[i] = sampleFields[index];
                    break;
                }
            }

            var sample = new InputSample(rowId, ticksMs, dataVal);
            this._sampleList.push(sample);
        }
    });
});


