// ~/panel/loadServer/dsDto

// local value classes, enums
//ppcJs.DCServerPanelItem = {
define(['../../utilities/Compatibility', '../../utilities/Store', 'dojox/data/dom'], 
function (Compatibility, Store, dom) {
    return {
        // item type
        TypeEnum: {
            LoadData: 0,   // digital output
            Legend: 1
        },

        Map: function (/*DOM node or Dijit*/item, /*ppcJs.DCServerPanelItem.TypeEnum*/type) {
            this.item = item;
            this.type = type;
        },

        Config: function (/*XmlElement*/element) {
            this.id = dojo.trim(ppcJs.utilities.Compatibility.attr(element, 'id'));
            this.name = Store.getElementText('name', element);
            this.desc = Store.getElementText('desc', element);
        },

        ConfigLoad: function ( /*XmlElement*/element) {
            //TODO right now the id doesn't really matter for legend
            //this.id = dojo.trim(ppcJs.utilities.Compatibility.attr(element, 'id'));
            this.name = Store.getElementText('name', element);
            this.desc = Store.getElementText('desc', element);

            //Retrieve the dc item list
            try {
                this.dcDataElements = dojo.query('item', element);
            }
            catch (e) {
                print("Dojo query error: ", e);
            }
        },

        ConfigLegend: function (/*XmlElement*/element) {
            //TODO right now the id doesn't really matter for legend
            //this.id = dojo.trim(ppcJs.utilities.Compatibility.attr(element, 'id'));
            this.name = Store.getElementText('name', element);
            this.desc = Store.getElementText('desc', element);
        },

        Data: function (/*XmlElement*/element) {
            this.id = dojo.trim(Compatibility.attr(element, 'id'));
            this.rawVal = dojo.trim(dom.textContent(element));
        }
    };
});