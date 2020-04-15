// top level widget containing block summary panel
// note: switches to local test file if running on localhost
// requires that dojo & ppcJs resources have already been linked and djConfig has been configured

dojo.provide('ppcJs.BlockSummaryPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojox.data.XmlStore');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.grid.cells.dijit');
dojo.require('ppcJs.utilities.Store');

dojo.declare('ppcJs.BlockSummaryPanel', [dijit._Widget, dijit._Templated],
{
    // ajax request command constant
    _loadSummaryGridCmd: { GET: 'RESOURCE_SUMMARIES' },
    _setModeCmd: { SET: 'RESOURCE_MODE' },

    // ajax request interval constants (ms)
    _gridInterval: 5000,
    _refreshIntervalId: '',
    _inhibitRefresh: false,

    // dijit variables
    name: 'BlockSummaryPanel',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/BlockSummaryPanel.html'),


    // enums and maps
    modeEnum: {
        Null: 0,
        Charge: 1,
        Discharge: 2,
        OffLine: 3,
        Standby: 4
    },
    modeLabels: '',
    _mapModeLabels: function () {
        this.modeLabels = new Array();
        this.modeLabels[this.modeEnum.Null] = 'Null';
        this.modeLabels[this.modeEnum.Charge] = 'Charge';
        this.modeLabels[this.modeEnum.Discharge] = 'Discharge';
        this.modeLabels[this.modeEnum.OffLine] = 'Off-line';
        this.modeLabels[this.modeEnum.Standby] = 'Standby';
    },


    // custom variables
    _idFieldName: 'id',
    _idFieldMode: 'mode',
    _urlInfo: '',
    _summaryGrid: '',
    _rowClickHandler: '',
    _xmlStore: '',


    // public methods

    constructor: function () {
        this._mapModeLabels();
    },

    load: function (urlVal) {
        this._urlInfo = ppcJs.utilities.Store.getUrlInfo(urlVal);
        this._loadSummaryGrid();
    },

    unload: function () {
        // stop periodic ajax requests
        if (this._refreshIntervalId) {
            clearInterval(this._refreshIntervalId);
            delete this._refreshIntervalId;
        }
    },

    // private methods

    _loadSummaryGrid: function () {
        // remove old grid:
        if (this._summaryGrid !== '') {
            this._summaryGrid.destroy();
            dojo.disconnect(this._rowClickHandler);
        }

        var testUrl = '../../ppcJs/tests/blockSummaryResponse.xml';
        var fullUrl = ppcJs.utilities.Store.getFullUrl(this._urlInfo, this._loadSummaryGridCmd, testUrl);
        this._createSummaryGrid(fullUrl);
    },

    _getModeLabel: function (modeVal) {
        return this.modeLabels[modeVal];
    },

    // assemble arg object, wire callbacks for dojo.xhrGet call
    _assembleXhrArgs: function (queryObject) {
        queryObject.CGI = this._urlInfo[1];

        var xhrArgs = { url: this._urlInfo[0], handleAs: 'xml', content: queryObject };
        xhrArgs.load = dojo.hitch(this, this.handleXhrLoad);
        xhrArgs.error = dojo.hitch(this, this.handleXhrError);

        return xhrArgs;
    },

    _createSummaryGrid: function (fullUrl) {
        this._xmlStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'resourceData', label: 'id' });

        // getValue is an event handler so must hitch host's handler here
        var updateModeValuePtr = dojo.hitch(this, this.handleUpdateModeValue);

        // set the layout structure:
        var gridLayout = [[
            {
                field: this._idFieldName,
                name: 'ID',
                width: '25px',
                formatter: function (item) {
                    return item.toString();
                },
                styles: 'color: blue; text-decoration: underline;'
            },

            {
                field: 'name',
                name: 'Name',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'mode',
                name: 'Mode',
                width: '75px',
                editable: true,     // in the future, we'll set this from a manual/auto xml element
                type: dojox.grid.cells.Select,
                options: [this.modeLabels[this.modeEnum.Null],
                            this.modeLabels[this.modeEnum.Charge],
                            this.modeLabels[this.modeEnum.Discharge],
                            this.modeLabels[this.modeEnum.OffLine]
                        ],
                formatter: dojo.hitch(this, this._getModeLabel),
                getValue: function () {
                    var modeVal = this.index;
                    updateModeValuePtr(modeVal);
                }
            },

            {
                field: 'mw',
                name: '(AC) MW',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'mvar',
                name: '(AC) MVAR',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'acVoltage_A',
                name: 'AC Voltage A',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'acVoltage_B',
                name: 'AC Voltage B',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'acVoltage_C',
                name: 'AC Voltage C',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'acCurrent_A',
                name: 'AC Current A',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'acCurrent_B',
                name: 'AC Current B',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'acCurrent_C',
                name: 'AC Current C',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'frequency',
                name: 'Frequency',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'socMwh',
                name: 'Total Energy Stored (SOC, MWH)',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            },

            {
                field: 'capacityMwh',
                name: 'Maximun Energy Storage Capacity (MWH)',
                width: '75px',
                formatter: function (item) {
                    return item.toString();
                }
            }
        ]];

        this._summaryGrid = new dojox.grid.DataGrid({
            query: {},
            store: this._xmlStore,
            singleClickEdit: true,
            structure: gridLayout,
            columnReordering: true
        },
            document.createElement('div'));

        // wire new grid's DOM and event
        dojo.place(this._summaryGrid.domNode, this.blockSummaryGridDiv);
        this._rowClickHandler = dojo.connect(this._summaryGrid, 'onRowClick', this, 'handleRowClick');

        // Call startup, in order to render the grid:
        this._summaryGrid.startup();

        this._refreshIntervalId = setInterval(dojo.hitch(this, this._reloadSummaryGrid), this._gridInterval);
    },

    _reloadSummaryGrid: function () {
        if (!this._inhibitRefresh) {
            dijit.focus(this.domNode);
            this._summaryGrid.setStore(this._xmlStore);
        }
    },

    _getBlockIdFromItem: function (dataItem) {
        var blockElem = dataItem['element'];
        var blockId = ppcJs.utilities.Store.getElementText(this._idFieldName, blockElem);
        return blockId;
    },

    _openBlockDetailPage: function (rowIndex) {
        var item = this._summaryGrid.getItem(rowIndex);
        var blockId = this._getBlockIdFromItem(item);
        var blockDetailUrl = 'BlockDetail.html?ID=' + blockId;
        window.open(blockDetailUrl);
    },


    // callbacks

    handleRowClick: function (evt) {
        var cell = evt.cell;
        if (cell.field === this._idFieldName) {
            this._inhibitRefresh = false;
            this._openBlockDetailPage(evt.rowIndex);
        }
        else if (cell.field === this._idFieldMode) {
            this._inhibitRefresh = true;
        }
        else {
            this._inhibitRefresh = false;
        }
    },

    handleUpdateModeValue: function (modeVal) {
        // only single row select enabled
        var selectedRowItems = this._summaryGrid.selection.getSelected();
        var blockId = this._getBlockIdFromItem(selectedRowItems[0]);
        dijit.focus(this.domNode);

        var queryObject = { ID: blockId, MODE: modeVal };
        dojo.mixin(queryObject, this._setModeCmd);
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
        this._inhibitRefresh = false;
    },

    // 2xx ajax response handler
    handleXhrLoad: function (response, ioArgs) {

    },

    // 4xx ajax response handler
    handleXhrError: function (response, ioArgs) {
        console.log('Request to server failed: no action taken', response, ioArgs);
    }
});