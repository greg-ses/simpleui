// ~/widget/dataGrid/CustomCSVWriter
// CSVWriter for enhanced grids that takes formatting object writerArgs.formatters
// where formatters = array of format functions returning strings, ordered by column index (nullable)
// usage (WindowGrid):
//      this._grid.exportGrid('customcsv', { writerArgs: { separator: ',', formatters: this._formatters } }, lang.hitch(this, this._setExportContent));

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array',
    '../../utilities/Identity',
    'dojox/grid/enhanced/plugins/Exporter', 'dojox/grid/enhanced/plugins/exporter/CSVWriter'],
function (declare, lang, array, Identity, Exporter, CSVWriter) {
    Exporter.registerWriter('customcsv', 'ppcJs.widget.dataGrid.CustomCSVWriter');

    return declare('ppcJs.widget.dataGrid.CustomCSVWriter', CSVWriter,
    {
        _formatters: null,

        // lifecycle methods
        constructor: function (/* object? */writerArgs) {
            this.inherited(arguments);

            if (writerArgs && writerArgs.formatters) {
                this._formatters = writerArgs.formatters;
            }
        },

        // override to apply custom format functions
        beforeContentRow: function (/* object */arg_obj) {
            var row = new Array();

            array.forEach(arg_obj.grid.layout.cells, function (cell, i) {
                //We are not interested in indirect selectors and row indexes.
                if (!cell.hidden && array.indexOf(arg_obj.spCols, cell.index) < 0) {
                    var rawStr = this._formatCSVCell(this._getExportDataForCell(arg_obj.rowIndex, arg_obj.row, cell, arg_obj.grid));
                    // apply formatter if exists
                    if (this._formatters && this._formatters[i] && Identity.isFunction(this._formatters[i])) {
                        rawStr = this._formatters[i](rawStr);
                    }

                    row.push(rawStr);
                }
            }, this);

            this._dataRows.push(row);
            //We do not need to go into the row.
            return false;	//Boolean
        }

    });
});