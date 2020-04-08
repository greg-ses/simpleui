// expandable control containing stacked collapsible and noncollapsible data grids
// for system volt, amp, energy, etc, data to present in grid format

dojo.provide('ppcJs.SystemDataGridControl');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Container');
dojo.require('dijit.form.Button');
dojo.require('dojox.data.XmlStore');
dojo.require('dojox.grid.TreeGrid');
dojo.require('ppcJs.utilities.Store');

dojo.declare('ppcJs.SystemDataGridControl', [dijit._Widget, dijit._Templated, dijit._Container],
{
    // ajax request command constants
    _getDataCmd: { GET: 'SYSTEM_GRID_DATA' },
    _testUrl: '../../ppcJs/tests/vaeGridDataResponse.xml',

    // dijit variables
    name: '',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/SystemDataGridControl.html'),

    // privateclass variables
    //_urlInfo: '',
    _xmlStore: '',


    load: function (urlInfo) {
        //this._urlInfo = urlInfo;
        var fullUrl = ppcJs.utilities.Store.getFullUrl(urlInfo, this._getDataCmd, this._testUrl);
        this._xmlStore = new dojox.data.XmlStore({ url: fullUrl, rootItem: 'item', label: 'label' });

        this._createVaGrid();
        this._createEnergyGrid();

        this.startup();
    },

    unload: function () {
    },

    // private methods
    _createVaGrid: function () {
        var container = dojo.create('div');

        // set the layout structure:
        var gridStruct = [
					        { cells: [
						        [ /* item */
							        {field: 'label', name: 'Name' },
                                    { field: 'phase',
                                        children: [
									        { field: 'label', name: 'Phase' },
									        { field: 'val', name: 'Value' },
								        ],
                                        itemAggregates: ['', 'avg'],
                                        aggregate: 'sum'
                                    }
						        ]]
					        }
				        ];

        var vaGrid = new dojox.grid.TreeGrid({
            structure: gridStruct,
            store: this._xmlStore,
            query: { type: 'va' },
            queryOptions: { deep: false },
            rowSelector: true
        }, container);

        dojo.addClass(vaGrid.domNode, 'sdgcVaGrid');
        dojo.place(vaGrid.domNode, this.vaGridDiv);
        vaGrid.startup();
    },

    _createEnergyGrid: function () {
        var container = dojo.create('div');

        // set the layout structure:
        var gridStruct = [
					        { cells: [
						        [ /* item */
							        {field: 'label', name: 'Name' },
									{ field: 'yd', name: 'Yesterday' },
									{ field: 'td', name: 'Today' },
                                    { field: 'lm', name: 'Last Month' },
									{ field: 'tm', name: 'This Month' }
						        ]]
					        }
				        ];
        var energyGrid = new dojox.grid.DataGrid({
            structure: gridStruct,
            store: this._xmlStore,
            query: { type: 'energy' },
            queryOptions: { deep: false }
        }, container);

        dojo.addClass(energyGrid.domNode, 'sdgcEnergyGrid');
        dojo.place(energyGrid.domNode, this.energyGridDiv);
        energyGrid.startup();
    },

    // callbacks
    onToggleChange: function () {
        var view = this.viewToggle.get('checked');
        alert('Detail view = ' + view.toString());
    }
});