import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTableComponent } from './dataset-table';

import {DataSetChangeService} from '../services/dataset-change.service';
import {CommandButtonChangeService} from '../services/command-button-change.service';
import {ChangeDetectorRef, Optional} from '@angular/core';
import {AppComponent} from '../app.component';

describe('DatasetTableComponent', () => {
  let component: DatasetTableComponent;
  let fixture: ComponentFixture<DatasetTableComponent>;
  let datasetChangeService: DataSetChangeService;
  let commandButtonChangeService: CommandButtonChangeService;
  // let  changeDetectorRef: ChangeDetectorRef;
  let app: AppComponent;

  beforeAll( async () => {
    await TestBed.configureTestingModule( {
        declarations: [ DatasetTableComponent ],
        providers: [ DataSetChangeService, CommandButtonChangeService ]
      })
      .compileComponents();

    datasetChangeService = new DataSetChangeService();
    commandButtonChangeService = new CommandButtonChangeService();
    // changeDetectorRef = new ChangeDetectorRef();
    app = new(AppComponent);

  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetTableComponent ],
      providers: [ DataSetChangeService ]
    })
    .compileComponents();
    datasetChangeService = new DataSetChangeService();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // saying it should create a component
  });
});
