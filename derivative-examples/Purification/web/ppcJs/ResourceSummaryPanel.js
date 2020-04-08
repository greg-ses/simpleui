// top level widget containing resource summary panel
// note: switches to local test file if running on localhost
// requires that dojo & ppcJs resources have already been linked and djConfig has been configured

dojo.provide('ppcJs.ResourceSummaryPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojox.data.XmlStore');
dojo.require('ppcJs.FormSelect');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.utilities.Page');
dojo.require('ppcJs.utilities.Store');
dojo.require('ppcJs.utilities.Compatibility');

dojo.declare('ppcJs.ResourceSummaryPanel', [dijit._Widget, dijit._Templated],
{
    // ajax request command constants
    _loadSummaryGridCmd: { GET: 'RESOURCE_SUMMARIES' },
    _setModeCmd: { SET: 'RESOURCE_MODE' },

    // table constants
    _summaryGridBodyId: 'resourceSummaryGridBody',
    _floatPrecision: 2,

    // item css class names, in-line styles
    _gridRowOdd: 'basePanelGridRowOdd',
    _nameItem: 'name',
    _modeItem: 'mode',
    _modeSelectStyle: { width: '90px' },    // Select styling (Selects require in-line styles)
    _mwItem: 'mw',
    _mvarItem: 'mvar',
    _acVoltage_AItem: 'acVoltage_A',
    _acVoltage_BItem: 'acVoltage_B',
    _acVoltage_CItem: 'acVoltage_C',
    _acCurrent_AItem: 'acCurrent_A',
    _acCurrent_BItem: 'acCurrent_B',
    _acCurrent_CItem: 'acCurrent_C',
    _frequencyItem: 'frequency',
    _socMwhItem: 'socMwh',
    _capacityMwhItem: 'capacityMwh',

    // ajax request interval (ms)
    _gridInterval: 2000,
    _refreshIntervalId: '',
    _inhibitRefresh: false,

    // dijit variables
    name: 'ResourceSummaryPanel',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/ResourceSummaryPanel.html'),


    // enums and maps
    modeEnum: {
        Null: 0,
        Charge: 1,
        Discharge: 2,
        OffLine: 3,
        Standby: 4
    },
    modeLabels: '',     // note: clone before using

    _mapModeLabels: function () {
        this.modeLabels = new Array();
        this.modeLabels.push({ value: this.modeEnum.Null.toString(), label: 'Null' });
        this.modeLabels.push({ value: this.modeEnum.Charge.toString(), label: 'Charge' });
        this.modeLabels.push({ value: this.modeEnum.Discharge.toString(), label: 'Discharge' });
        this.modeLabels.push({ value: this.modeEnum.OffLine.toString(), label: 'Off-line' });
        this.modeLabels.push({ value: this.modeEnum.Standby.toString(), label: 'Standby' });
    },

    // class variables
    _urlInfo: '',
    _currentResourceId: '',
    _xmlStore: '',
    _handlerList: '',


    // public methods

    constructor: function () {
        this._mapModeLabels();
    },

    load: function (urlVal) {
        this._urlInfo = ppcJs.utilities.Store.getUrlInfo(urlVal);
        this._loadSummaryGrid();
    },

    unload: function () {
        // perform housekeeping if this panel has previously been loaded
        if (dojo.isArray(this._handlerList)) {
            // stop periodic ajax requests
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                delete this._refreshIntervalId;
            }

            // flush event handlers
            dojo.forEach(this._handlerList, function (handler) {
                dojo.disconnect(handler);
            });
            this._handlerList = '';

            dojo.empty(this._summaryGridBodyId);
        }
    },

    // private methods

    _loadSummaryGrid: function () {
        this._handlerList = new Array();

        var testUrl = '../../ppcJs/tests/resourceSummaries.xml';
        var fullUrl = ppcJs.utilities.Store.getFullUrl(this._urlInfo, this._loadSummaryGridCmd, testUrl);
        this._xmlStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'resourceData' });
        var request = this._xmlStore.fetch({ onComplete: dojo.hitch(this, this.onFetchData) });

        this._refreshIntervalId = setInterval(dojo.hitch(this, this._reloadSummaryGrid), this._gridInterval);
    },

    // assemble arg object, wire callbacks for dojo.xhrGet call
    _assembleXhrArgs: function (queryObject) {
        queryObject.CGI = this._urlInfo[1];

        var xhrArgs = { url: this._urlInfo[0], handleAs: 'xml', content: queryObject };
        xhrArgs.load = dojo.hitch(this, this.handleXhrLoad);
        xhrArgs.error = dojo.hitch(this, this.handleXhrError);

        return xhrArgs;
    },

    _setModeValue: function (/*dijit.form.Select*/modeSelect, /*Xmlelement*/xmlElement) {
        var modeValue = ppcJs.utilities.Store.getElementText(this._modeItem, xmlElement);
        modeSelect.set('value', modeValue);
    },

    _addTableCell: function (/*string*/itemName, /*Xmlelement*/xmlElement, rowNode, addLink) {
        var textContent = ppcJs.utilities.Store.getElementText(itemName, xmlElement);
        var cell = dojo.create('td', { innerHTML: ppcJs.DataFormat.getFloatAsString(textContent, this._floatPrecision, textContent) }, rowNode);
        dojo.addClass(cell, itemName);

        if (addLink) {
            this._addLink(cell, 'handleNameClick');
        }
    },

    _addLink: function (node, /*string*/handlerName) {
        this._handlerList.push(dojo.connect(node, 'onclick', this, handlerName));
        ppcJs.utilities.Page.addHoverBehavior(this._handlerList, node);
    },

    _addModeSelectTableCell: function (/*string*/id, /*Xmlelement*/xmlElement, rowNode) {
        var modeCell = dojo.create('td', null, rowNode);
        //ppcJs.utilities.Compatibility.attr(modeCell, this._itemAttribute, this._modeItem);
        dojo.addClass(modeCell, this._modeItem);
        var modeSelect = new ppcJs.FormSelect({
            name: 'select' + id,
            options: dojo.clone(this.modeLabels),
            containerId: id,
            style: this._modeSelectStyle
        });
        this._setModeValue(modeSelect, xmlElement);

        this._handlerList.push(dojo.connect(modeSelect, 'onClick', this, 'handleModeClick'));
        this._handlerList.push(dojo.connect(modeSelect, 'onBlur', this, 'handleModeLeave'));
        this._handlerList.push(dojo.connect(modeSelect, 'onChange', this, 'handleModeSelectChange'));

        modeSelect.placeAt(modeCell);
    },

    _updateTableCell: function (/*string*/itemName, /*Xmlelement*/xmlElement, rowNode) {
        var cssClassName = 'td.' + itemName;
        var cells = dojo.query(cssClassName, rowNode);
        var textContent = ppcJs.utilities.Store.getElementText(itemName, xmlElement);
        cells[0].innerHTML = ppcJs.DataFormat.getFloatAsString(textContent, this._floatPrecision, textContent);
    },

    _createTableRow: function (/*XmlItem*/xmlItem, /*int*/i) {
        var xmlElement = xmlItem['element'];
        //var id = ppcJs.utilities.Compatibility.attr(xmlElement, 'id');   //TODO: move <id> to attribute
        var id = ppcJs.utilities.Store.getElementText('id', xmlElement);

        var row = dojo.create('tr', null, dojo.byId('resourceSummaryGridBody'));
        ppcJs.utilities.Compatibility.attr(row, 'id', id);
        if (ppcJs.DataFormat.isOdd(i)) {
            dojo.addClass(row, this._gridRowOdd);
        }

        // Note: cell order as specified in template
        var addLink = true;
        this._addTableCell(this._nameItem, xmlElement, row, addLink);   // Column 0
        this._addModeSelectTableCell(id, xmlElement, row);              // Column 1
        this._addTableCell(this._mwItem, xmlElement, row);              // Column 2
        this._addTableCell(this._mvarItem, xmlElement, row);            // Column 3
        this._addTableCell(this._acVoltage_AItem, xmlElement, row);     // Column 4
        this._addTableCell(this._acVoltage_BItem, xmlElement, row);     // Column 5
        this._addTableCell(this._acVoltage_CItem, xmlElement, row);     // Column 6
        this._addTableCell(this._acCurrent_AItem, xmlElement, row);     // Column 7
        this._addTableCell(this._acCurrent_BItem, xmlElement, row);     // Column 8
        this._addTableCell(this._acCurrent_CItem, xmlElement, row);     // Column 9
        this._addTableCell(this._frequencyItem, xmlElement, row);       // Column 10
        this._addTableCell(this._socMwhItem, xmlElement, row);          // Column 11
        this._addTableCell(this._capacityMwhItem, xmlElement, row);     // Column 12
    },

    _updateTableRow: function (/*XmlItem*/xmlItem) {
        var xmlElement = xmlItem['element'];

        // get row by ID
        //var id = ppcJs.utilities.Compatibility.attr(xmlElement, 'id');  //TODO: move <id> to attribute
        var id = ppcJs.utilities.Store.getElementText('id', xmlElement);
        var row = dojo.byId(id);

        // for now, only one widget in row so no need to filter by 'mode' class name
        var modeSelects = dijit.findWidgets(row);
        this._setModeValue(modeSelects[0], xmlElement);

        this._updateTableCell(this._mwItem, xmlElement, row);
        this._updateTableCell(this._mvarItem, xmlElement, row);
        this._updateTableCell(this._acVoltage_AItem, xmlElement, row);
        this._updateTableCell(this._acVoltage_BItem, xmlElement, row);
        this._updateTableCell(this._acVoltage_CItem, xmlElement, row);
        this._updateTableCell(this._acCurrent_AItem, xmlElement, row);
        this._updateTableCell(this._acCurrent_BItem, xmlElement, row);
        this._updateTableCell(this._acCurrent_CItem, xmlElement, row);
        this._updateTableCell(this._frequencyItem, xmlElement, row);
        this._updateTableCell(this._socMwhItem, xmlElement, row);
        this._updateTableCell(this._capacityMwhItem, xmlElement, row);
    },

    _reloadSummaryGrid: function () {
        if (!this._inhibitRefresh) {
            dijit.focus(this.domNode);
            this._xmlStore.close();
            var request = this._xmlStore.fetch({ onComplete: dojo.hitch(this, this.onRefetchData) });
        }
    },


    // callbacks

    onFetchData: function (/*XmlItem[]*/items, request) {
        dojo.empty('resourceSummaryGridBody');
        dojo.forEach(items, this._createTableRow, this);
    },

    onRefetchData: function (/*XmlItem[]*/items, request) {
        dojo.forEach(items, this._updateTableRow, this);
    },

    handleNameClick: function (evt) {
        var row = evt.currentTarget.parentNode;
        var id = ppcJs.utilities.Compatibility.attr(row, 'id');
        var blockDetailUrl = 'BlockDetail.html?ID=' + id;
        window.open(blockDetailUrl);
    },

    handleModeClick: function (evt) {
        this._inhibitRefresh = true;

        // get current resource ID from FormSelect for use on changed value
        var cell = evt.currentTarget;
        var currentDijit = dijit.byId(cell.id);
        this._currentResourceId = currentDijit.get('containerId');
    },

    handleModeLeave: function (evt) {
        this._inhibitRefresh = false;
        this._currentResourceId = '';   // so won't fire SET command on refresh changing a mode value
    },

    handleModeSelectChange: function (/*string*/newValue) {
        if (this._currentResourceId !== '') {
            var queryObject = { ID: this._currentResourceId, MODE: newValue };

            dojo.mixin(queryObject, this._setModeCmd);
            dojo.xhrGet(this._assembleXhrArgs(queryObject));
            this._inhibitRefresh = false;
        }
    },

    // 2xx ajax response handler
    handleXhrLoad: function (response, ioArgs) {

    },

    // 4xx ajax response handler
    handleXhrError: function (response, ioArgs) {
        console.log('Request to server failed: no action taken', response, ioArgs);
    }
});