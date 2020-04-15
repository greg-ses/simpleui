// ~/utilities/CSV
// static utilities for CSV conversion
// see dojox.grid.enhanced.plugins.exporter.CSVWriter

define(['dojox/string/Builder', 'dojo/_base/lang', './Identity'], 
function (Builder, lang, Identity) {
    return {
	    _separator: ',',
	    _newline: '\r\n',

        arrayToRow: function (/*array*/content) {
            var validArray = (content && Identity.isArray(content) && (content.length > 0));

            if(validArray){
			    var row = new Builder();

                for(var i=0; i<(content.length-1); i++) {
                    var field = content[i].toString();
                    row.append( lang.trim(field));
                    row.append(this._separator);
                }
                row.append(content[i].toString());
                row.append(this._newline);

                return row.toString();
		    }
            else {
                return '';
            }
        },
    };
});