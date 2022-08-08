import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataChange } from './data-change.service';

describe('DataChange', () => {
  let component: DataChange;
  let fixture: ComponentFixture<DataChange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataChange ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataChange);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
