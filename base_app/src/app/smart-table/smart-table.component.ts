import { Component, OnInit, Input } from '@angular/core';
import { TabUI } from '../interfaces/props-data';


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
export class SmartTableComponent implements OnInit {
  @Input() _dataset: any;
  @Input() _uiTab: TabUI;
  @Input() _id: string;

  columns = [];
  filterFaultValue: Fault_Status = Fault_Status.EMPTY;


  allStatuses = ['none', 'disabled', 'warning', 'trip']
  // allStatuses = Object.values(Fault_Status); I would like to do this instead of we need to change transpile lib target to es2017+

  constructor() { }

  ngOnInit(): void {
    this.getColumns()
  }

  onSearch(event: any) {
    this.filterFaultValue = event.target.value;
  }

  onFilterFault(event: any) {
    this.filterFaultValue = event.target.value;
  }


  getColumns() {
    let originalColumns = this._dataset?.props?.columns
    let columns = [];
    originalColumns.forEach(element => {
      columns.push(element[0])
    });
    return columns
  }

  handleSelection(selectedValues) {
    this.filterFaultValue = selectedValues;
  }
}
