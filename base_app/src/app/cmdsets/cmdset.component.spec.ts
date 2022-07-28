import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmdSetComponent } from './CmdSet.component';

describe('CmdSet.Component', () => {
  let component: CmdSetComponent;
  let fixture: ComponentFixture<CmdSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmdSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CmdSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
