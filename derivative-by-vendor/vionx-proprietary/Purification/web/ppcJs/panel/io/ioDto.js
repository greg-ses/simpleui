// ~/panel/io/ioDto

// local value classes, enums
define(['dojo/_base/lang', 'dojox/xml/parser',
        '../../utilities/Compatibility', '../../utilities/Store'],
function (lang, parser,
        Compatibility, Store) {
    return {
        // item type
        TypeEnum: {
            AI: 0,  // analog input
            AO: 1,  // analog output
            DI: 2,  // digital input
            DO: 3   // digital output
        },

        Map: function (/*DOM node or Dijit*/item, /*TypeEnum*/type) {
            this.item = item;
            this.type = type;
        },

        Config: function (/*XmlElement*/element) {
            this.id = lang.trim(Compatibility.attr(element, 'id'));
            this.name = Store.getElementText('name', element);
            this.desc = Store.getElementText('desc', element);
        },

        objConfig: function (/*Object*/element) {
            this.id = element.name; 					// TODO: Add ID to the template stream
            this.name = element.name; 
            this.desc = element.description; 
        },

        Data: function (/*XmlElement*/element) {
            this.id = lang.trim(Compatibility.attr(element, 'id'));
            this.rawVal = lang.trim(parser.textContent(element));
        },

        objData: function (/*Object*/element) {
            this.id = element.name;
            this.rawVal = element.value;
        }
    };
});