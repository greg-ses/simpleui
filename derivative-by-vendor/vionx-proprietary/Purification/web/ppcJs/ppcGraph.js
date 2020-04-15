// ppcGraphing.js
//
// This object wrapps the graphing functionality used in the browser.


function ppcGraph(theSqlData, instance_name, graph_tag, legend_tag, zooming_cb)
{
	/*************************************************************************
		Variables.
	 *************************************************************************/

	// Public variables.

	this._min_select = 0;
	this._max_select = 0;


	// Private variables.

	var _instance_name = instance_name;			// Used in the creation of globally identifiable callbacks.
	var _jquery_graph_tag = "#"+graph_tag;		// The html graph tag 
	var _jquery_legend_tag = null;
	if(typeof legend_tag != 'undefined' && legend_tag != null)
		_jquery_legend_tag = "#"+legend_tag;	// The html legend tag
	var _zooming_cb = zooming_cb;
	
	var that = this;	// Required for private member access to public vars.
						//  - this appears to be a workaroudn for a bug in the language

	var _plot_data_set = new Array();		// Only the plotted data
		
	var _options = {};
	
	var _theData = theSqlData;;
	
	var _current_min_ts = 0;
	var _current_max_ts = 0;
	
	/*************************************************************************
		Public Functions 
	 *************************************************************************/
	
	this.reset = function()
	{
		_plot_data_set = new Array();	// Reset the series.
	}
	
	this.plotTheData = function(min_ts, max_ts)
	{
		that._min_select = 0;	// Make sure the zoom does not occur.
		that._max_select = 0;

		_plot_data_set.lenth=_theData._cols-_theData.FIRST_GRAPH_COLUMN;
		
		data_column = 0;
		for(c=_theData.FIRST_GRAPH_COLUMN; c<_theData._cols; c++)
		{
			id = "#"+_theData._headers[c];
			
			enabled = $(id).attr("checked");

			if(typeof enabled == 'undefined') 	enabled = true;	// If not initialized yet.
			
			_plot_data_set[data_column] = null;
			
			if(enabled)
				_plot_data_set[data_column] = _theData.full_data_set[data_column];
			else
				_plot_data_set[data_column] = {label: _theData.full_data_set[data_column].label
												, data: new Array() };
				
			data_column++;
		}

		_current_min_ts = min_ts;
		_current_max_ts = max_ts;
		
		this.plotDataSet(min_ts, max_ts);

		$(_jquery_graph_tag).bind("plotclick", plotClickHandler); 
		
		$(_jquery_graph_tag).bind("plotselected", zoomHandler);

	}

	this.updatePlot = function()
	{
		this.plotTheData(_current_min_ts, _current_max_ts);
	}
	

	this.hideAllSeries = function()
	{
		for(c=_theData.FIRST_GRAPH_COLUMN; c<_theData._cols; c++)
		{
			id = "#"+_theData._headers[c];
			
			$(id).attr("checked", "");
		}
		
		this.updatePlot();
	}

	this.showAllSeries = function()
	{
		for(c=_theData.FIRST_GRAPH_COLUMN; c<_theData._cols; c++)
		{
			id = "#"+_theData._headers[c];
			
			$(id).attr("checked", "checked");
		}
		
		this.updatePlot();
	}


	function plotClickHandler(event, pos, item)
	{
		//alert("You clicked at " + pos.x + ", " + pos.y);
		// secondary axis coordinates if present are in pos.x2, pos.y2,
		// if you need global screen coordinates, they are pos.pageX, pos.pageY

		if (item) {
		//  $(_jquery_graph_tag).highlight(item.series, item.datapoint);
		  alert("You clicked a point: Series:" + item.series.label + " Point:" + item.datapoint);
		}
	}

	function zoomHandler(event, ranges)
	{
		that._min_select = ranges.xaxis.from;
		that._max_select = ranges.xaxis.to;
		
		var zoom = $("#zoom").attr("checked");
		if (zoom)
		{
			if(typeof _zooming_cb == 'function')
				_zooming_cb();
				
			that.plotDataSet(that._min_select, that._max_select);
		}
	}

	function seriesLink(label)
	{
		id = "#"+label;
		enabled = $(id).attr("checked");

		if(typeof enabled == 'undefined') 	checked = 'checked="checked"';
		else if(enabled)					checked = 'checked="checked"';
		else								checked = '';
		
		//return label;
		return '<input type="checkbox" id="' + label + '" dir="rtl" onclick="'+_instance_name+'.updatePlot()"'
				   + checked +'>'+label+'</input><br />';
	}

	this.plotDataSet = function(min_ts, max_ts)
	{
		var yoptions = { };
		if(_theData._graph_meta_type == "DIGITAL") 	// Special y axis options for digital type data.
				yoptions = {show: false
							, hideLabels: true	// Not for IO display
							, min: 0
							, max: (_theData._cols-_theData.FIRST_GRAPH_COLUMN)
							, ticks: (_theData._cols-_theData.FIRST_GRAPH_COLUMN)};

		if(14 < (_theData._cols-_theData.FIRST_GRAPH_COLUMN))
			num_legend_cols = 2;
		else
			num_legend_cols = 1;
			
		_options = { xaxis: { mode: "time", min: min_ts, max: max_ts } 
						//, yaxis: { show: false, min: 0, max: _theData._cols}	
						, yaxis: yoptions
						, selection: { mode: "x" }
						, grid: { 
									color: "rgb(0, 0, 0)"
									, backgroundColor: "rgb(255, 255, 255)"
									, tickColor: "rgb(0, 0, 0)"
									//, labelMargin: number
									//, markings: array of markings or (fn: axes -> array of markings)
									//, borderWidth: number
									, clickable: true		// Enable for interactive graph.
									//, hoverable: false
									//, autoHighlight: true
									//, mouseActiveRadius: 10
								}
					};
					
		if(_jquery_legend_tag == null)
			_options["legend"] = { show: false };
		else
			_options["legend"] = { show: true
									, container: $(_jquery_legend_tag)
									, noColumns: num_legend_cols
									, labelFormatter: seriesLink };	

		var zoom = $("#zoom").attr("checked");
		if (zoom && this._min_select != this._max_select) 
		{
			$.plot($(_jquery_graph_tag), _plot_data_set,
							  $.extend(true, {}, _options, {
								  xaxis: { min: this._min_select, max: this._max_select }
							  }));
		}
		else
		{
			this._min_select = 0;
			this._max_select = 0;
			$.plot($(_jquery_graph_tag), _plot_data_set, _options);
		}

		$.cookie("ZOOM_TO_SELECTION", zoom);
	}

	
}
