import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


export interface FilterOptions {
  possible_options: string[];
  title: string;
  filter_column: string;
}



@Component({
  selector: 'app-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.css']
})
export class SmartTableComponent implements OnInit, AfterViewInit {

  @Input() _rows: Object[];
  @Input() _columns: string[];
  @Input() filter_options?: FilterOptions;


  @ViewChild(MatSort) sort: MatSort;
  datasource: MatTableDataSource<any> =  new MatTableDataSource();


  constructor() { }

  ngOnInit(): void {}



  ngAfterViewInit() {

    if (this._rows.length < 0) return;

    this.datasource = new MatTableDataSource(this._rows);

    // dont do anything if we dont want to filter
    if (this.filter_options == undefined) return;


    // allows us to define our own filter method
    this.datasource.filterPredicate = (row, filter: string|[]): boolean => {
      if (filter.length == 0) return true; // if nothing is checked, show everything (not filtered)

      if (typeof filter == "string") return row[this.filter_options.filter_column].includes(filter)

      else if (Array.isArray(filter)) {
        // allows for multiple filters at once
        for (let indx=0; indx<filter.length; indx++) {
          if (row[this.filter_options.filter_column].includes(filter[indx])) return true
        }
      }
      return false

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
    this.datasource.filter = data;
  }
}
