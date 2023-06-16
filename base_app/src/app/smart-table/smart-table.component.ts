import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { TabUI } from '../interfaces/props-data';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


export enum Fault_Status {
  EMPTY = "",
  NONE = "none",
  DISABLED = "disabled",
  WARNING = "warning",
  TRIP = "trip"
}

/**
 * TODO
 *    - [ ] double check work I did today and make sure I understand it
 *    - [ ] make faultlist not hardcoded
 *    - [ ] make sure generic smart-table works with other tables too
 *    - [ ] restrict overlay mod filter to 1 at a time (Mod1 or Mod2, never both)
 *    - [ ] remove filter pipe
 *    - [ ] check if I even need this.current_filter
 */



export interface Filter_Options {
  possible_options: string[];
  title: string;
  filter_column: string;
  default?: string|string[];
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
  @Input() _dataset: any;
  @Input() _uiTab: TabUI;
  @Input() _id: string;
  @Input() _config: SmartTableConfig;

  @ViewChild(MatSort) sort: MatSort;


  columns = [];
  filterFaultValue: Fault_Status|Fault_Status[] = Fault_Status.EMPTY;
  allStatuses = ['none', 'disabled', 'warning', 'trip'];
  datasource: MatTableDataSource<any> =  new MatTableDataSource();

  // curent values we want in the table
  current_filter: string|string[];






  constructor() { }

  ngOnInit(): void {
     // set default filters if applicable

    if (this._uiTab?.name.toLowerCase() == 'fault list') {
      this.filterFaultValue = [Fault_Status.TRIP, Fault_Status.WARNING];
    }

    /**
     * remove once faultlist is uncoupled
     */
    if (this?._config?.filter_options?.default) {
      this.current_filter = this._config.filter_options.default;
    }
  }



  ngAfterViewInit() {
    if (this?._config.rows.length > 0) {

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


    } else {
      this.datasource = new MatTableDataSource(this._dataset?.elements);
      this.datasource.sort = this.sort;
    }

  }



  getColumns() {
    if (this?._config?.columns) { return this._config.columns; }

    /**
     * remove once faultlist is uncoupled
     */
    const originalColumns = this._dataset?.props?.columns !== undefined ? this._dataset.props.columns : [];
    let columns = [];
    originalColumns.forEach(element => {
      columns.push(element[0]);
    });
    return columns
  }



  /**
   * applies the filter to the table rows
   * @param data data to filter
   */
  applyFilter(data: any): void {
    this.datasource.filter = data;
  }





  /**
   * remove once faultlist is uncoupled
   */
  handleSelection(selectedValues: any) {
    this.filterFaultValue = selectedValues;

    this.current_filter = selectedValues;
  }



}
