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

  constructor() { }

  ngOnInit(): void {
    console.log(this._dataset)
    this.getColumns()
  }

  onSearch(event: any) {
    this.filterFaultValue = event.target.value;
  }

  onFilterFault(event: any) {
    this.filterFaultValue = event.target.value;
    console.log(this.filterFaultValue)
  }


  getColumns() {
    let originalColumns = this._dataset?.props?.columns

    let columns = [];

    originalColumns.forEach(element => {
      columns.push(element[0])
    });
    return columns
  }

}
