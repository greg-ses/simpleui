import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmdSet } from './cmdset';

describe('CmdSet', () => {
  let component: CmdSet;
  let fixture: ComponentFixture<CmdSet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmdSet ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CmdSet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
