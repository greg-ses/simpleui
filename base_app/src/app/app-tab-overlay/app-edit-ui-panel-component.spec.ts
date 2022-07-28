import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppEditUiPanelComponent } from './app-edit-ui-panel-component';

describe('AppEditUiPanelComponent', () => {
  let component: AppEditUiPanelComponent;
  let fixture: ComponentFixture<AppEditUiPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppEditUiPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppEditUiPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
