import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SmartTableComponent, Fault_Status } from './smart-table.component';
import { FilterPipe } from '../filter.pipe';

import { DataSummary } from '../interfaces/data-summary';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



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
        MatTableModule,
        BrowserAnimationsModule
       ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTableComponent);
    component = fixture.componentInstance;

    component._dataset = {
      elements: [
        {idx: 1, name: 'Item 1', status: 'none'},
        {idx: 2, name: 'Item 2', status: 'disabled'},
        {idx: 3, name: 'Item 3', status: 'warning'},
        {idx: 4, name: 'Item 4', status: 'trip'},
      ],
      props: {
        columns: [
          [ 'column 1', 'idx' ],
          [ 'column 2', 'name' ],
          [ 'column 3', 'status' ],

        ]
      }
    }
    component._uiTab = {
      index: 0,
      id: '',
      name: 'Test tab',
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
  });


  it('should have the default filter be an empty string', () => {
    expect(component.filterFaultValue).toEqual('');
  });


  it('should show the correct columns', () => {
    const debugElement: DebugElement = fixture.debugElement;
    const columnNames: DebugElement[] = debugElement.queryAll(By.css('th'));
    expect(columnNames.length).toBe(3);
    expect(columnNames[0].nativeElement.textContent.trim()).toBe('column 1');
    expect(columnNames[1].nativeElement.textContent.trim()).toBe('column 2');
    expect(columnNames[2].nativeElement.textContent.trim()).toBe('column 3');
  });

});







describe('Fault list specific SmartTableComponent', () => {
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
      name: 'Fault List',
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


  it('should have the default filter set to trip and warning', () => {
    expect(component.filterFaultValue).toEqual(['trip', 'warning']);
  });
});



