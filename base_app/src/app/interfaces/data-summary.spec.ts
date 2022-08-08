import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSummary } from './data-summary';

describe('DataSummary', () => {
  let component: DataSummary;
  let fixture: ComponentFixture<DataSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSummary ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
