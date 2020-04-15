// ~/bizLogic/movingWindow/ItemTemplate
// object representing a sampleTemplate child item

define(['dojo/_base/declare', 'dojox/xml/parser',
        '../../Enum', '../../utilities/Compatibility'],
function (declare, parser,
        Enum, Compatibility) {
    return declare(null,
    {
        _setValueType: function (/*string*/type) {
            switch (type) {
                case ('FLOAT'):
                    this.Type = Enum.ValueType.Float;
                    break;
                case ('TIMESTAMP'):
                    this.Type = Enum.ValueType.TimeStamp;
                    break;
                case ('INTEGER'):
                default:
                    this.Type = Enum.ValueType.Integer;
                    break;
            }
        },

        // public fields
        Index: '',
        Type: '',
        Name: '',
        Description: '',

        constructor: function (/*XmlElement*/itemXmlElement) {
            this._setValueType(Compatibility.attr(itemXmlElement, 'type'));
            this.Index = parseInt(Compatibility.attr(itemXmlElement, 'index'));
            this.Name = parser.textContent(itemXmlElement);
            this.Description = Compatibility.attr(itemXmlElement, 'hint');
        }
    });
});