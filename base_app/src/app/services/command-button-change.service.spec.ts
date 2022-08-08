import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandButtonChange } from './command-button-change.service';

describe('CommandButtonChange', () => {
  let component: CommandButtonChange;
  let fixture: ComponentFixture<CommandButtonChange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandButtonChange ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandButtonChange);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
