// ~/utilities/BasePanel
// static panel/control utilities
// Note: requires external linking to ~/ppcJs/themes/basePanel/basePanel.css


define(['dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', '../Enum', './DataFormat'],
function (dom, construct, domClass, Enum, DataFormat) {
    return {
        // css classes
        _cssTable: 'basePanelTable',
        _cssRow: 'basePanelTableRow',
        _cssCell: 'basePanelTableCell',
        _cssIndicatorLabel: 'basePanelIndicatorLabel',
        _cssIndicatorBox: 'basePanelIconBox',
        _cssLabel: 'basePanelLabel',
        _cssInfo: 'basePanelInfoBox',
        _cssWarning: 'basePanelWarning',
        _cssFault: 'basePanelFault',
        _cssIndicatorOn: 'basePanelOn',
        _cssIndicatorOff: 'basePanelOff',
        _cssOkIcon: 'basePanelBattOk',
        _cssNokIcon: 'basePanelNok',
        _cssVisible: 'basePanelVisible',
        _cssInvisible: 'basePanelnvisible',
        _cssEditedText: 'basePanelEditedText',
        _cssInactiveText: 'basePanelInactiveText',
        _cssResetText: 'basePanelResetText',
        _cssHover: 'basePanelHover',
        _cssSelectBg: 'basePanelHighlightBg',
        _cssSelectBorder: 'basePanelSelection',

        // returns css table-row styled div
        createRow: function () {
            var row = construct.create('div');
            domClass.add(row, this._cssRow);
            return row;
        },

        // returns css table-cell styled span
        createCell: function (/*string*/textContent) {
            var cell = construct.create('div');
            domClass.add(cell, this._cssCell);

            if (textContent) {
                domClass.add(cell, this._cssLabel);
                cell.innerHTML = textContent;
            }

            return cell;
        },

        // places error icon as background image
        updateErrorIcon: function (/*node*/cell, /*Enum.Error*/errorStatus) {
            switch (errorStatus) {
                case (Enum.Error.None):
                    domClass.remove(cell, [this._cssWarning, this._cssFault]);
                    break;

                case (Enum.Error.Warn):
                    domClass.replace(cell, this._cssWarning, this._cssFault);
                    break;

                case (Enum.Error.Fault):
                    domClass.replace(cell, this._cssFault, this._cssWarning);
                    break;

                default:
                    break;
            }
        },

        // error icon formatter for grids returns html image ref
        formatErrorImage: function (/*string*/errorStr) {
            var imageLoc = 'ppcJs/themes/basePanel/images/';

            var errorStatus = parseInt(errorStr);
            if (isNaN(errorStatus)) {
                errorStatus = Enum.Error.None;
            }

            switch (errorStatus) {
                case (Enum.Error.Warn):
                    return '<img src="' + imageLoc + 'warnIcon.png" alt="Warn" height="20px" width="20px">';

                case (Enum.Error.Fault):
                    return '<img src="' + imageLoc + 'faultIcon.png" alt="Fault" height="20px" width="20px">';

                case (Enum.Error.None):
                default:
                    return '';
            }
        },

        // add table row containing label and indicator icon
        // returns node containing indicator icon
        addIndicatorRow: function (/*string*/label, /*icon class*/cssIcon, parentNode) {
            var row = this.createRow();
            var labelCell = this.createCell(label);
            domClass.add(labelCell, this._cssIndicatorLabel);
            construct.place(labelCell, row);

            var iconCell = this.createCell();
            domClass.add(iconCell, [this._cssIndicatorBox, cssIcon]);
            construct.place(iconCell, row);

            construct.place(row, parentNode);

            return iconCell;
        },

        // add table row containing label and standard On/Off icon
        // returns node containing On/Off icon
        addOnOffRow: function (/*string*/label, parentNode) {
            return this.addIndicatorRow(label, this._cssIndicatorOff, parentNode);
        },

        // add table row contain label and value
        // returns node containing value
        addDataRow: function (/*string*/label, /*string*/value, parentNode) {
            var row = this.createRow();
            var labelCell = this.createCell(label);
            domClass.add(labelCell, this._cssIndicatorLabel);
            construct.place(labelCell, row);

            var dataCell = this.createCell(value);
            domClass.add(dataCell, this._cssInfo);
            construct.place(dataCell, row);

            construct.place(row, parentNode);

            return dataCell;
        },

        setOn: function (node, /*bool*/isOn) {
            if (isOn) {
                domClass.replace(node, this._cssIndicatorOn, this._cssIndicatorOff);
            }
            else {
                domClass.replace(node, this._cssIndicatorOff, this._cssIndicatorOn);
            }
        },

        setOk: function (node, /*bool*/isOk) {
            if (isOk) {
                domClass.replace(node, this._cssOkIcon, this._cssNokIcon);
            }
            else {
                domClass.replace(node, this._cssNokIcon, this._cssOkIcon);
            }
        },

        setData: function (node, /* float */value, floatPrecision, naNPlaceHolder) {
            var valueStr = DataFormat.getFloatAsString(value, floatPrecision, naNPlaceHolder);
            node.innerHTML = valueStr;
        },

        setString: function (node, /* string */value, maxStringLength) {
            var valueStr = value.slice(0, maxStringLength);
            node.innerHTML = valueStr;
        },

        setVisible: function (node, /*bool*/isVisible) {
            if (isVisible) {
                domClass.replace(node, this._cssVisible, this._cssInvisible);
            }
            else {
                domClass.replace(node, this._cssInvisible, this._cssVisible);
            }
        }
    };
});