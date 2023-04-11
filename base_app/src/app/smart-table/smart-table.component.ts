import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { TabUI } from '../interfaces/props-data';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


enum Fault_Status {
  EMPTY = "",
  NONE = "none",
  DISABLED = "disabled",
  WARNING = "warning",
  TRIP = "trip"
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

  @ViewChild(MatSort) sort: MatSort;


  columns = [];
  filterFaultValue: Fault_Status|Fault_Status[] = Fault_Status.EMPTY;
  allStatuses = ['none', 'disabled', 'warning', 'trip'];
  datasource: any =  new MatTableDataSource();

  constructor() { }

  ngOnInit(): void {
    if (this._uiTab?.name.toLowerCase() == 'fault list') {
      this.filterFaultValue = [Fault_Status.TRIP, Fault_Status.WARNING]; // default filter
    }
  }

  ngAfterViewInit() {
    this.datasource = new MatTableDataSource(this._dataset?.elements);
    this.datasource.sort = this.sort;
  }

  getColumns() {
    const originalColumns = this._dataset?.props?.columns !== undefined ? this._dataset.props.columns : [];
    let columns = [];
    originalColumns.forEach(element => {
      columns.push(element[0]);
    });
    return columns
  }

  handleSelection(selectedValues) {
    this.filterFaultValue = selectedValues;
  }
}
