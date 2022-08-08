import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayCmdBarComponent } from './overlay-cmd-bar';

describe('OverlayCmdBarComponent', () => {
  let component: OverlayCmdBarComponent;
  let fixture: ComponentFixture<OverlayCmdBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverlayCmdBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayCmdBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
