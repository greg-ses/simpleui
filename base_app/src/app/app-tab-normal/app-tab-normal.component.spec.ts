import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTabNormalComponent } from './app-tab-normal.component';

describe('AppTabNormal.Component', () => {
  let component: AppTabNormalComponent;
  let fixture: ComponentFixture<AppTabNormalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppTabNormalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTabNormalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
