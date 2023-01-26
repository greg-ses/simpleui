import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTableComponent } from './dataset-table';
import {DataSetChangeService} from '../services/dataset-change.service';
import {CommandButtonChangeService} from '../services/command-button-change.service';
import {AppComponent} from '../app.component';
import { DataSet } from '../interfaces/dataset';


describe('DatasetTableComponent', () => {
  let component: DatasetTableComponent;
  let fixture: ComponentFixture<DatasetTableComponent>;
  let datasetChangeService: DataSetChangeService;
  let commandButtonChangeService: CommandButtonChangeService;
  // let  changeDetectorRef: ChangeDetectorRef;
  let app: AppComponent;
  let mock_data_set: DataSet;

  beforeAll( async () => {
    await TestBed.configureTestingModule( {
        declarations: [ DatasetTableComponent ],
        providers: [ DataSetChangeService, CommandButtonChangeService ]
      })
      .compileComponents();

    datasetChangeService = new DataSetChangeService();
    commandButtonChangeService = new CommandButtonChangeService();
    // changeDetectorRef = new ChangeDetectorRef();
    app = new AppComponent();
    mock_data_set = new DataSet();
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
    component.app = app;
    component._dataset = mock_data_set;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log(Object.keys(app))

    expect(component).toBeTruthy(); // saying it should create a component
  });
});
