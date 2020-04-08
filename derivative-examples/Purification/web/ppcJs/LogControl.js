// log display widget with home/expanded views
// DEPRECATED, TODO: replace all occurrences with LogPanel

dojo.provide('ppcJs.LogControl');
dojo.provide('ppcJs.LogData');

dojo.require('ppcJs._Control');
dojo.require('dijit.form.Button');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.utilities.Compatibility');
dojo.require('ppcJs.utilities.Store');

dojo.declare('ppcJs.LogControl', [ppcJs._Control],
{
    // dijit variables
    name: 'LogControl',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/LogControl.html'),

    // css class names
    _cssRow: 'basePanelTableRow',
    _cssLogRow: 'lcRow',
    _cssCell: 'basePanelTableCell',
    _cssGridRowOdd: 'basePanelGridRowOdd',
    _cssWarning: 'basePanelWarning',
    _cssFault: 'basePanelFault',
    _cssIconCell: 'lcIconCell',
    _cssTextCell: 'lcTextCell',

    // class variables
    _lastEntryId: '',

    // public methods
    postCreate: function () {
    },

    update: function (/*LogData.DTO*/dto) {
        dojo.forEach(dto.statuses, this._addEntry, this);
    },


    // private methods
    _addEntry: function (/*LogData.Status*/status, /*int*/i) {
        if(status.id !== this._lastEntryId) {
            var row = dojo.create('div');
            dojo.addClass(row, [this._cssRow, this._cssLogRow]);
            dojo.attr(row, 'id', status.id);
            if (ppcJs.DataFormat.isOdd(i)) {
                dojo.addClass(row, this._cssGridRowOdd);
            }

            var iconCell = dojo.create('div', {}, row);
            dojo.addClass(iconCell, [this._cssCell, this._cssIconCell]);

            this.puB.updateErrorIcon(iconCell, status.errorStatus);
            var textCell = dojo.create('div', { innerHTML: status.text }, row);
            dojo.addClass(textCell, [this._cssCell, this._cssTextCell]);

            dojo.place(row, this.contentTable);

            this._lastEntryId = status.id;
        }
    },

    // callbacks
    onToggleChange: function () {
        var view = this.viewToggle.get('checked');
        alert('Detail view = ' + view.toString());
        //var queryObject = eStopVal? this._setEStopOnCmd : this._setEStopOffCmd;
        //dojo.xhrGet(this._assembleXhrArgs(queryObject));
    }
});


// processes data transfer object to update LogControl
ppcJs.LogData = {
    // returns DTO
    parseXml: function (/*XmlElement*/xmlElement) {
        // xml definitions
        var timeTag = 'timestamp';
        var entryTag = 'r';
        var idAttr = 'id';
        var timeAttr = 'time';
        var errorLevelAttr = 'err';
        var resourceTag = 'rs';
        var typeTag = 'tp';
        var messageTag = 'm';

        var statuses = new Array();
        var entries = dojo.query(entryTag, xmlElement);

        for (var i = 0; i < entries.length; i++) {
            var id = ppcJs.utilities.Compatibility.attr(entries[i], idAttr);
            var entryTime = parseInt(ppcJs.utilities.Compatibility.attr(entries[i], timeAttr));
            var errLevel = parseInt(ppcJs.utilities.Compatibility.attr(entries[i], errorLevelAttr));
            var resource = ppcJs.utilities.Store.getElementText(resourceTag, entries[i]);
            var messageType = ppcJs.utilities.Store.getElementText(typeTag, entries[i]);
            var message = ppcJs.utilities.Store.getElementText(messageTag, entries[i]);

            var status = new ppcJs.LogData.Status(id, entryTime, errLevel, message, resource, messageType);
            statuses.push(status);
        }

        var timestamp = parseInt(ppcJs.utilities.Store.getElementText(timeTag, xmlElement));
        var dto = new ppcJs.LogData.DTO(timestamp, statuses);
        return dto;
    },

    DTO: function (/*int, ms since epoch*/timestamp, /*Status[]*/statuses) {
        this.timestamp = timestamp;
        this.statuses = statuses;
    },

    Status: function (/*string*/id,
    /*int, ms since epoch*/timestamp,
    /*ppcJs.Enum.Error*/errorLevel,
    /*string*/text,
    /*string*/resource,
    /*string*/messageType) {
        this.id = id;
        this.timestamp = timestamp;
        this.errorLevel = errorLevel;
        this.text = text;
        this.resource = resource;
        this.messageType = messageType;
    }
};

