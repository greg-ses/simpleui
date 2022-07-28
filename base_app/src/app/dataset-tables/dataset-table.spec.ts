import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTableComponent } from './dataset-table';

describe('DatasetTableComponent', () => {
  let component: DatasetTableComponent;
  let fixture: ComponentFixture<DatasetTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetTableComponent ]
    })
    .compileComponents();
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
