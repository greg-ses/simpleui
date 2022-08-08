import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSet } from './dataset';

describe('DataSet', () => {
  let component: DataSet;
  let fixture: ComponentFixture<DataSet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSet ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
