import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/**
 * TODO
 *    - [x] double check work I did today and make sure I understand it
 *    - [x] make faultlist not hardcoded
 *    - [ ] make sure generic smart-table works with other tables too
 *    - [ ] restrict overlay mod filter to 1 at a time (Mod1 or Mod2, never both)
 *    - [ ] remove filter pipe
 *    - [x] check if I even need this.current_filter
 */



export interface Filter_Options {
  possible_options: string[];
  title: string;
  filter_column: string;
  allow_multiple_filters?: boolean;
}


export interface SmartTableConfig {
  columns: string[];
  rows: any;
  filter_options?: Filter_Options;
}




@Component({
  selector: 'app-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.css']
})
export class SmartTableComponent implements OnInit, AfterViewInit {

  @Input() _config: SmartTableConfig;


  @ViewChild(MatSort) sort: MatSort;
  datasource: MatTableDataSource<any> =  new MatTableDataSource();


  constructor() { }

  ngOnInit(): void {}



  ngAfterViewInit() {
    /**
     * ugly, refactor
     */
    if (this?._config?.rows?.length > 0) {

      this.datasource = new MatTableDataSource(this?._config.rows);

      // allows us to define our own filter method
      this.datasource.filterPredicate = (data, filter: string|[]): boolean => {
        if (filter.length == 0) return true; // if nothing is checked, show everything (not filtered)

        // should make this: 'if data[this._config.filter_options.filter_column] includes anything in filter,
        // return true so this allows multiple values if needed
        if (data[this._config.filter_options.filter_column].includes(filter[0])) {
          return true;
        }
        return false;
      }
    }

  }


  /**
   * Returns column names of table
   */
  getColumns() {
    if (this?._config?.columns) { return this._config.columns; }
    return [];
  }



  /**
   * applies the filter to the table rows
   * @param data data to filter
   */
  applyFilter(data: any): void {
    this.datasource.filter = data;
  }
}
