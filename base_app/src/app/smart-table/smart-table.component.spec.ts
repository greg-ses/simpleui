import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SmartTableComponent, FilterOptions } from './smart-table.component';

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


  it('should show the correct rows', () => {
    fixture.detectChanges(); // update to see rows

    const debugElement: DebugElement = fixture.debugElement;
    const rows: DebugElement[] = debugElement.queryAll(By.css('td'));

    expect(rows.length).toBe(6); // 3 cols * 2 rows

    expect(rows[0].nativeElement.textContent.trim()).toBe('1');
    expect(rows[1].nativeElement.textContent.trim()).toBe('foo');
    expect(rows[2].nativeElement.textContent.trim()).toBe('bar');
    expect(rows[3].nativeElement.textContent.trim()).toBe('2');
    expect(rows[4].nativeElement.textContent.trim()).toBe('fizz');
    expect(rows[5].nativeElement.textContent.trim()).toBe('buzz');
  });


  it('should show no rows', () => {
    component._rows = [];

    const debugElement: DebugElement = fixture.debugElement;
    const rows: DebugElement[] = debugElement.queryAll(By.css('td'));

    expect(rows.length).toBe(0);
  });

});
