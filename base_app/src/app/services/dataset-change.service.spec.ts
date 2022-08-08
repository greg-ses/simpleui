import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetChange } from './dataset-change.service';

describe('DataSetChange', () => {
  let component: DataSetChange;
  let fixture: ComponentFixture<DataSetChange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSetChange ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetChange);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
