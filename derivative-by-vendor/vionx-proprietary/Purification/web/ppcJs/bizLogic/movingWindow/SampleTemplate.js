// ~/bizLogic/movingWindow/SampleTemplate
//  value class: object representation of <sampleTemplate> XML element.

define(['dojo/_base/declare', 'dojo/query', './ItemTemplate'],
function (declare, query, ItemTemplate) {
    return declare(null,
    {
        // xml tag definitions
        _rowTag: 'rowId',
        _timeTag: 'timeStamp',
        _itemTag: 'item',

        // public fields: standard template items required in sampleTemplate XML element
        RowId: '',
        TimeStamp: '',  // ms, UTC since epoch
        SeriesSet: '',  // array containing items 2..n specifying data series

        constructor: function (/*dojox.data.XmlItem*/sampleTemplateXmlItem) {
            var sampleTemplateElem = sampleTemplateXmlItem['element'];

            var rowId = query(this._rowTag, sampleTemplateElem);
            this.RowId = new ItemTemplate(rowId[0]);

            var timeStamp = query(this._timeTag, sampleTemplateElem);
            this.TimeStamp = new ItemTemplate(timeStamp[0]);
            this.SeriesSet = new Array();
            query(this._itemTag, sampleTemplateElem).forEach(this._populateSeriesSet, this);
        },

        _populateSeriesSet: function (/*XmlElement*/itemXmlElement) {
            var itemTemplate = new ItemTemplate(itemXmlElement);
            this.SeriesSet.push(itemTemplate);
        }
    });
});