import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTabOverlayComponent } from './app-tab-overlay.component';

describe('AppTabOverlayComponent', () => {
  let component: AppTabOverlayComponent;
  let fixture: ComponentFixture<AppTabOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppTabOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTabOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
