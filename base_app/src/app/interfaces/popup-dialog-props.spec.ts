import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDialogProps } from './popup-dialog-props';

describe('PopupDialogProps', () => {
  let component: PopupDialogProps;
  let fixture: ComponentFixture<PopupDialogProps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDialogProps ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupDialogProps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
