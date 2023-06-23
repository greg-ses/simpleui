import { Component, OnInit, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';


export interface FilterOptions {
  possible_options: string[];
  title: string;
  filter_column: string;
}



@Component({
  selector: 'app-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.css'],
})
export class SmartTableComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() _rows: Object[];
  @Input() _columns: string[];
  @Input() filter_options?: FilterOptions;


  datasource: MatTableDataSource<any> =  new MatTableDataSource();
  current_filter: string|string[]


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { }

  ngAfterViewInit() { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes._rows) {
      this.updateDataSource();  // update the datasource to reflect the changes to the model
      this.applyFilter(this.current_filter);  // make the filter persist through changes to the model
    }
  }


  /**
   * Updates the datasource to reflect changes to the model (this._rows).
   * Also will impliment the custom filtering method if applicable
   * @returns void
   */
  updateDataSource(): void {

    this.datasource = new MatTableDataSource(this._rows);

    // dont do anything if we dont want to filter
    if (this.filter_options == undefined) return;

    // allows us to define our own filter method
    this.datasource.filterPredicate = (row, filter: string|string[]): boolean => {
      if (filter.length == 0) return true; // if nothing is checked, show everything (not filtered)

      // we have a single filter
      if (typeof filter == "string") return row[this.filter_options.filter_column].includes(filter)

      else if (Array.isArray(filter)) {
        // allows for multiple filters at once
        for (let indx=0; indx<filter.length; indx++) {
          if (row[this.filter_options.filter_column].includes(filter[indx])) return true
        }
      }
      return false;
    }
  }



  /**
   * Returns column names of table
   */
  getColumns() {
    return this._columns;
  }



  /**
   * applies the filter to the table rows
   * @param data data to filter
   */
  applyFilter(data: any): void {
    this.current_filter = data;
    this.datasource.filter = data;
  }
}
