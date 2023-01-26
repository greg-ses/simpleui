import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropDefinedTableComponent } from './prop-defined-table';

import { AppComponent } from '../app.component';


describe('PropDefinedTableComponent', () => {
  let component: PropDefinedTableComponent;
  let fixture: ComponentFixture<PropDefinedTableComponent>;
  let app: AppComponent;



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropDefinedTableComponent ]
    })
    .compileComponents();

    app = new AppComponent();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropDefinedTableComponent);
    component = fixture.componentInstance;
    component.app = app;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
