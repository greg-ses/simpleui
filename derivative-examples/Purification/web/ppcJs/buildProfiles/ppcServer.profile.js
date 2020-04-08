dependencies = {
    // strip out all console calls except console.warn and console.error
    stripConsole: 'normal',

    layers: [
        /*{
            // This layer will be discarded, it is just used
            // to specify some modules that should not be included
            // in a later layer, but something that should not be
            // saved as an actual layer output.
            name: 'ppcJs.discard',
            resourceName: 'ppcJs.discard',
            discard: true,
            dependencies: [
                    'dojo.string'
            ]
        },*/

        {
            // where the output file goes, relative to the dojo dir
            name: '../dijit/dijit.js',
            // what the module's name will be, i.e., what gets generated
            // for dojo.provide(<name here>);
            resourceName: 'dijit.dijit',
            // modules not to include code for
            //layerDependencies: [
            //    'string.discard'
            //],
            // modules to use as the "source" for this layer
            dependencies: [
                'dijit.dijit'
            ]
        },

        {
            name: '../../ppcJs/inverterConverter.js',
            resourceName: 'ppcJs.inverterConverter',
            layerDependencies: [
                'dijit.dijit'
            ],
            dependencies: [
                'dojox.layout.TableContainer',
                'dojox.data.XmlStore',
                'dojox.grid.DataGrid',
                'dojox.charting.Chart2D',
                'dojox.grid.cells.dijit',
                'ppcJs.ProjectSummaryPanel',
            /*'ppcJs.BlockSummaryPanel',*/
                'ppcJs.ResourceSummaryPanel',
                'ppcJs.LedStack',
                'ppcJs.utilities.Store',
                'ppcJs.DataFormat',
                'ppcJs.FormSelect'
            ]
        },

        {
            name: '../../ppcJs/GeneralGraph.js',
            resourceName: 'ppcJs.GeneralGraph',
            layerDependencies: [
                'dijit.dijit'
            ],
            dependencies: [
                'dojox.layout.TableContainer',
                'dojox.data.XmlStore',
                'dojox.grid.DataGrid',
                'dojox.charting.Chart2D',
                'dojox.charting.widget.SelectableLegend',
                'ppcJs.MultimodeChartPanel',
                'ppcJs.SystemDiagramPanel',
                'ppcJs.iPhoneButton',
                'ppcJs.SelectMenuItem',
                'ppcJs.utilities.Store',
                'ppcJs.MovingWindowChart',
                'ppcJs.SampleSet',
                'ppcJs.DataFormat',
                'ppcJs.TimeScale',
                'ppcJs.DataSampleToSeriesAdapter'
            ]
        },

        {
            name: '../../ppcJs/dBConfig.js',
            resourceName: 'ppcJs.dBConfig',
            layerDependencies: [
                'dijit.dijit'
            ],
            dependencies: [
                'ppcJs.ParameterPanel',
                'dojox.data.XmlStore',
                'ppcJs.ParameterTree',
                'ppcJs.utilities.Store',
                'ppcJs.ParamTreeNode',
                'ppcJs.ParamControl'
            ]
        },

        {
            name: '../../ppcJs/fleetViewer.js',
            resourceName: 'ppcJs.fleetViewer',
            layerDependencies: [
                'dijit.dijit'
            ],
            dependencies: [
                'ppcJs.MultimodeChartPanel',
                'ppcJs.SystemDiagramPanel',
                'ppcJs.LogPanel',
                'ppcJs.PubSub',
                'ppcJs.utilities.Page'
            ]
        },

        {
            name: '../../ppcJs/main.js',
            resourceName: 'ppcJs.main',
            layerDependencies: [
                'dijit.dijit'
            ],
            dependencies: [
                'ppcJs.SystemDiagramPanel',
                'ppcJs.MainSystemPanel',
                'ppcJs.MainBlockPanel',
                'ppcJs.PubSub',
                'ppcJs.utilities.Page'
            ]
        },

        {
            name: '../../ppcJs/io.js',
            resourceName: 'ppcJs.io',
            layerDependencies: [
                'dijit.dijit'
            ],
            dependencies: [
                'ppcJs.IoPanel',
                'ppcJs.AjaxStatusControl',
                'ppcJs.utilities.Page'
            ]
        }
    ],

    prefixes: [
    // the system knows where to find the "dojo/" directory, but we
    // need to tell it about everything else. Directories listed here
    // are, at a minimum, copied to the build directory.
        ['dijit', '../dijit'],
        ['dojox', '../dojox'],
        ['ppcJs', '../../ppcJs']
    ]
}