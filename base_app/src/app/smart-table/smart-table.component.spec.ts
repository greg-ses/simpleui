import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SmartTableComponent, FilterOptions } from './smart-table.component';

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

    component._columns = ['indx', 'col1', 'col2'];
    component._rows = [
      {
        indx: 1,
        col1: 'foo',
        col2: 'bar'
      },
      {
        indx: 2,
        col1: 'fizz',
        col2: 'buzz'
      }
    ];


    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });




  it('should show the correct columns', () => {
    const debugElement: DebugElement = fixture.debugElement;
    const columnNames: DebugElement[] = debugElement.queryAll(By.css('th'));
    expect(columnNames.length).toBe(3);
    expect(columnNames[0].nativeElement.textContent.trim()).toBe('indx');
    expect(columnNames[1].nativeElement.textContent.trim()).toBe('col1');
    expect(columnNames[2].nativeElement.textContent.trim()).toBe('col2');
  });

});



