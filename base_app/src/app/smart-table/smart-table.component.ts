import { Component, OnInit, Input } from '@angular/core';
import { TabUI } from '../interfaces/props-data';

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

  dataSource = [
    {
      "value": "none",
      "conditions": "value > Warn:0.75 > Trip:1.75",
      "currVal": "+OOR",
      "desc": "Tank Leak Sensor warning.",
      "ev_details": "",
      "fault_code": "Process-Mod1-1",
      "idx": "1",
      "mode_averse": "offline",
      "mode_critical_only": "none",
      "mode_no_response": "none",
      "mode_tolerant": "none",
      "name": "Mod1-Process-AnTank-2-Leak_Detected",
      "primLoc": "Mod1",
      "subLoc": "mod",
      "timestamp": "20:36:24",
      "trip_ms": "20000",
      "type": "Leak-Flt",
      "warn_ms": "10000"
    }
  ]

  constructor() { }

  ngOnInit(): void {
    console.log(this._dataset)
    this.getColumns()
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
