
// These functions support a strictly formated data stream originating from a DB table.

//	- The data must include as the first three columns
//		- rowid			: Unique row id
//		- timestamp		: The number of mseconds since Jan 1st 1970 in UTC time
//		- num_points	: The number points included in an averaged value
//
//	- If it's an indexed table the fourth column must be
//		- id_field		: The graph column id for the row.		


function ppcSqlData()
{
	
	this._last_rowid = -1;				// The retained data from all the responses.

	// The data recieved thus far
	this._cols=0;
	this._headers=new Array();
	this._rows=0;
	this._row_data=new Array();
	this._row_cols=0;
	this._realHeaders = new Array();
	this._realColType = new Array();
	
	this._graph_meta_type = "";
	this._indexedTable = false;
	this.FIRST_GRAPH_COLUMN=3;			// The first column to put in the graph, skip rowid, timestamp, & num_points

	// The formated data for the chart
	this.full_data_set = new Array();	// The object which holds the graphing data.
	this.next_row_to_add = 0;

	var fake_data_point = false;		// Used for a complete fake row when not indexed.

	var fake_dp = Array();	// Used to indicate that a column specific fake data point is active

	var num_graph_columns = 0;

	this.resetData = function()
	{
		this._last_rowid = -1;				// The retained data from all the responses.

		this.full_data_set.lenth=0;			// Clear the data for the chart.
		next_row_to_add = 0;
		
		// The data recieved thus far
		this._cols=0;
		this._headers.length=0;
		this._rows=0;
		this._row_data.length=0;
		this._row_cols = 0;
		this._realHeaders.length = 0;
		this._realColType.length = 0;
		
		this._graph_meta_type = "";
		this._indexedTable = false;
		this.FIRST_GRAPH_COLUMN=3;
		
		this._headers=new Array();
		this._row_data=new Array();
		this.full_data_set = new Array();
	}

	this.getLastRowId = function()
	{
		return this._last_rowid;
	}
	
	this.extractColHeaders = function(responseStr)
	{
		var resp_str = responseStr;
		
		this.resetData();

		this._graph_meta_type = "";
		tstr = xmlFindTag(resp_str, "Graph_MetaType", 1);
		if("" != tstr)
		{
			xmlExtractElement(tstr);
			this._graph_meta_type = _val;
		}

		tstr = xmlFindTag(resp_str, "INDEX_RANGE", 1);
		if("" != tstr)
		{
			xmlExtractElement(tstr);
			this._indexedTable = true;
			this.FIRST_GRAPH_COLUMN=4;	// additional idx column.
			idxMin = parseInt(_val.slice(0, _val.indexOf(",")));
			idxMax = parseInt(_val.slice(_val.indexOf(",")+1));
		}
		
		this._headers.length = 0;	// We always want this to start at zero length.
		
		resp_str = xmlFindTag(resp_str, "ColumnHeaders", 1);
		if("" == resp_str)
			return;				// No data that we can interpret.
		resp_str = xmlExtractElement(resp_str);	// Extract section tag ColumnHeaders
		
		if(this._indexedTable)
		{
			count = 0;
			
			resp_str = xmlExtractElement(resp_str);
			
			while(_tag=="Col") 
			{
				if(0 == _val.indexOf("avg_"))	// Remove avg_ prefix.
					_val = _val.slice(4);

				if(count++<this.FIRST_GRAPH_COLUMN)	// Replicate the non-indexed model.
					this._headers.push(_val);
					
				this._realHeaders.push(_val);
				this._realColType.push(_data_type);
				
				resp_str = xmlExtractElement(resp_str);
			}
			this._row_cols = this._realHeaders.length;
			
			for(_idx=idxMin; _idx<=idxMax; _idx++)
				for(h=this.FIRST_GRAPH_COLUMN; h<this._realHeaders.length; h++)
					this._headers.push(this._realHeaders[h] + '_' + _idx);

			this._cols = this._headers.length;
		}
		else
		{
			resp_str = xmlExtractElement(resp_str);
			while(_tag=="Col") 
			{
				if(0 == _val.indexOf("avg_"))	// Remove avg_ prefix.
					_val = _val.slice(4);
				
				this._headers.push(_val);
				this._realHeaders.push(_val);
				this._realColType.push(_data_type);
				
				resp_str = xmlExtractElement(resp_str);
			}
			this._cols = this._headers.length;
			this._row_cols = this._cols;
		}
		
		for(c=this.FIRST_GRAPH_COLUMN; c<this._cols; c++)
		{
			this.full_data_set.push({ label: this._headers[c]			// Add the header name
								, data: new Array() });		// Create the data array for population later
		}

		num_graph_columns = this._cols - this.FIRST_GRAPH_COLUMN;

		if(num_graph_columns<=0)
			return false;

		var fake_dp = new Array(num_graph_columns);
		for(gc_idx=0; gc_idx<num_graph_columns; gc_idx++)		
			fake_dp[gc_idx] = false;					// Assume no new data points.
	}
		
	this.extractRowData = function(responseStr)
	{
		if(num_graph_columns<=0)
			return false;
			
		var resp_str = responseStr;

		resp_str = xmlFindTag(resp_str, "RowData", 1);
		if("" == resp_str)
			return false;				// No data that we can interpret.
		resp_str = xmlExtractElement(resp_str);	// Extract section tag RowData

		var additional_data = false;
		resp_str = xmlExtractElement(resp_str);	// Get the first real datapoint.
		while(_tag=="Row" || _tag=="r")
		{
			additional_data = true;
			
			this._row_data[this._rows] = new Array();
			str = _val;
			for(c=0; c<this._row_cols; c++)
			{
				if(str.indexOf(",") >= 0) {
					this._row_data[this._rows][c] = str.substring(0, str.indexOf(","));
					str = str.slice(str.indexOf(",")+1);
				}
				else {
					this._row_data[this._rows][c] = str;
					if(c != this._row_cols-1)
					{
						ajaxCmd.haltUpdates();
						alert("Data lineup issue.");
						return false;
					}
				}
			}
			this._rows++;
			resp_str = xmlExtractElement(resp_str);
		}

		if(this._rows > 0)
			this._last_rowid = this._row_data[this._rows-1][0];
			
		//var new_data = (next_row_to_add != this._rows);	// 2010-03-03 Next next_row_to_add set in chart filling.
		//return new_data;									// I'm not sure why I had done it this way.
		
		return additional_data;	// Indicates there is new data.
	}

	this.fillChartData = function()
	{
		if(num_graph_columns<=0)
			return false;

		if(this._indexedTable)
			this.fillChartDataArray_Indexed();
		else
			this.fillChartDataArray();		
	}

	this.fillChartDataArray_Indexed = function()
	{
		var num_graph_columns = this._cols - this.FIRST_GRAPH_COLUMN;
		var num_data_columns = this._row_cols - this.FIRST_GRAPH_COLUMN;
		
		//console.log("cols:"+this._cols +"  gc:"+num_graph_columns + "  row_cols:"+this._row_cols + "  dc:" + num_data_columns);
		
		var new_data_point = new Array(num_graph_columns);
		
		for(gc_idx=0; gc_idx<num_graph_columns; gc_idx++)		
			new_data_point[gc_idx] = false;					// Assume no new data points.

		// Add any data from the xml stream to the correct graphing rows.
		for(dc_idx=0; dc_idx<num_data_columns; dc_idx++)		
		{
			for(r=next_row_to_add; r<this._rows; r++)
			{	
				// Calculate the graph column based on the id_field value
				gc_idx = dc_idx + num_data_columns*(this._row_data[r][3] - idxMin);
				//console.log("gc_idx:" + gc_idx + "=" + dc_idx + "+" + num_data_columns + "*(" + this._row_data[r][3] + "-" + idxMin + ")");

				var col_data = this.full_data_set[gc_idx].data;	// Graph the dataset for the column
				
				var row_ltime = MkLocalTime(this._row_data[r][1]); // Create local time from te row timestamp
				
				if(fake_dp[gc_idx])	col_data.pop(); 		// Remove the one fake datapoint, if it exists
					
				fake_dp[gc_idx] = false;					// Manage flags
				new_data_point[gc_idx] = true;
				
				// Add the new data point to the graph data.
				col_data.push([ row_ltime, parseFloat(this._row_data[r][dc_idx+this.FIRST_GRAPH_COLUMN]) ]); 
			}
		}

		// Create fake data for real time effects
		for(gc_idx=0; gc_idx<num_graph_columns; gc_idx++)		
		{
			if(new_data_point[gc_idx] == true)	// Don't need a fake data point.
				continue;
				
			var col_data = this.full_data_set[gc_idx].data;
			
			if(col_data.length < 1)		// No data to base a fake point off of.
				continue;

			if(fake_dp[gc_idx])	col_data.pop();		// Remove fake datapoint if it esistws
			
			// Use the last data point as a fake value corrisponding to the local time of the xml data set.
			col_data.push([ _lastLocalTime, col_data[col_data.length-1][1] ]); 
			
			fake_dp[gc_idx] = true;
		}
		
			
		next_row_to_add = this._rows;
	}

	this.fillChartDataArray = function()
	{
		var data_column = 0;
		// Skip rowid, timestamp, and num_points.  
		for(c=this.FIRST_GRAPH_COLUMN; c<this._row_cols; c++)
		{
			// Get a pointer to the data array object for this column.
			var col_data = this.full_data_set[data_column].data;
			
			// Only add new this._rows to the IO data.
			for(r=next_row_to_add; r<this._rows; r++)
			{	
				var row_ltime = MkLocalTime(this._row_data[r][1]); 
				
				if(fake_data_point && r==next_row_to_add)	
					col_data.pop(); // Remove the one fake datapoint

				col_data.push([ row_ltime, parseFloat(this._row_data[r][c]) ]); 
			}
			
			// If no data, add the current time point as an fake update
			if(next_row_to_add == this._rows)
			{
				if(fake_data_point)	col_data.pop();		// Remove fake datapoint
				
				//console.log("Create Fake Data.  next_row:%d this._rows:%d  llt:%d ldp:%0.1f"
				//				, next_row_to_add, this._rows, _lastLocalTime, parseFloat(this._row_data[this._rows-1][c]) );

				// Use the last data point as a fake value corrisponding to the local time of the xml data set.
				col_data.push([ _lastLocalTime, col_data[col_data.length-1][1]]); //parseFloat(this._row_data[this._rows-1][c]) ]); 
				//col_data.push([ _lastLocalTime, parseFloat(this._row_data[this._rows-1][c]) ]); 
			}

			data_column++;
		}

		if(next_row_to_add == this._rows) 
			fake_data_point = true;			// The local time should have been added and will need to be removed.
		else
			fake_data_point = false;
			
		next_row_to_add = this._rows;
	}

	this.displayDataInTable = function()
	{
		if(this._indexedTable)
			return this.fillDataInTable_Indexed();
		else
			return this.fillDataInTable();
		}
	
	this.fillDataInTable = function()
	{
		// For debug, display the table data returned.
		var ret_str = '<table id="dataTable" border="2" valign="top" class="display">';
		ret_str += '<thead> <tr>';
			for(c=0; c<this._headers.length; c++)	// Create the this._headers
			{
				ret_str += '<th align="center">' + this._headers[c] + '</th>';
			}
			ret_str += '</thead> </tr>';
			ret_str += '<tbody>';
			for(r=0; r<this._row_data.length; r++) 
			{
				ret_str += '<tr>';
				for(c=0; c<this._headers.length; c++)	// 
				{
					if(this._realColType[c]=='TIMESTAMP') {  //if(this._headers[c] == 'timestamp') {
						var _t = new Date();
						_t.setTime(this._row_data[r][c]);
						//ret_str += '<td align="center">' + _t.toLocaleTimeString() + '</td>';
						ret_str += '<td align="center">' + (1+_t.getMonth()) +'/'+ _t.getDate() +'/'+ _t.getFullYear() +' '+ _t.toLocaleTimeString() + '</td>';
					}
					else
						ret_str += '<td align="center">' + this._row_data[r][c] + '</td>';
				}
				ret_str += '</tr>';		
			}
			ret_str += '</tbody>';
		ret_str += '</table>';
		
		return ret_str;
	}

	this.fillDataInTable_Indexed = function()
	{
		// For debug, display the table data returned.
		var ret_str = '<table id="dataTable" border="2" valign="top" class="display">';
		ret_str += '<thead> <tr>';
			for(c=0; c<this._realHeaders.length; c++)	// Create the this._headers
			{
				ret_str += '<th align="center">' + this._realHeaders[c] + '</th>';
			}
			ret_str += '</thead> </tr>';
			ret_str += '<tbody>';
			for(r=0; r<this._row_data.length; r++) 
			{
				ret_str += '<tr>';
				for(c=0; c<this._realHeaders.length; c++)	// 
				{
					if(this._realColType[c]=='TIMESTAMP') {	//if(this._realHeaders[c] == 'timestamp') {
						var _t = new Date();
						_t.setTime(this._row_data[r][c]);
						//ret_str += '<td align="center">' + _t.toLocaleTimeString() + '</td>';
						ret_str += '<td align="center">' + (1+_t.getMonth()) +'/'+ _t.getDate() +'/'+ _t.getFullYear() +' '+ _t.toLocaleTimeString() + '</td>';
					}
					else
						ret_str += '<td align="center">' + this._row_data[r][c] + '</td>';
				}
				ret_str += '</tr>';		
			}
			ret_str += '</tbody>';
		ret_str += '</table>';
		
		return ret_str;
	}
	
}