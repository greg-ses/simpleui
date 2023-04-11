import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTableComponent } from './smart-table.component';
import { FilterPipe } from '../filter.pipe';

import { TabUI } from '../interfaces/props-data';
import { DataSummary } from '../interfaces/data-summary';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';


describe('SmartTableComponent', () => {
  let component: SmartTableComponent;
  let fixture: ComponentFixture<SmartTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SmartTableComponent,
        FilterPipe
       ],
       imports: [
        MatSortModule,
        MatTableModule
       ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTableComponent);
    component = fixture.componentInstance;

    component._dataset = {
      elements: [
        {id: 1, name: 'Item 1', status: 'none'},
        {id: 2, name: 'Item 2', status: 'disabled'},
        {id: 3, name: 'Item 3', status: 'warning'},
        {id: 4, name: 'Item 4', status: 'trip'},
      ],
      props: {
        coloumns: [
          ['col_1', 'column 1']
        ]
      }
    }
    component._uiTab = {
      index: 0,
      id: '',
      name: 'Test smart table',
      dataUrl: '',
      commandUrl: '',
      pageType: '',
      hash: '',
      _DataSummary: new DataSummary(),
      _autoRefreshEnabled: false,
      _commands_enabled: false,
      _updateTime: 0,
      _pendingRequestExpiration: 0,
      disabled_buttons: ''

    }
    fixture.detectChanges();
  });





  it('should create', () => {
    expect(component).toBeTruthy();
  })
});
