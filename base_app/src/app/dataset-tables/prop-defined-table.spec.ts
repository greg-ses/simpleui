import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropDefinedTableComponent } from './prop-defined-table';

describe('PropDefinedTableComponent', () => {
  let component: PropDefinedTableComponent;
  let fixture: ComponentFixture<PropDefinedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropDefinedTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropDefinedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
