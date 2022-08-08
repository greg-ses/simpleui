import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandService } from './command.service';

describe('CommandService', () => {
  let component: CommandService;
  let fixture: ComponentFixture<CommandService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommandService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
