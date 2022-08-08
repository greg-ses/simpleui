import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedCommand } from './tagged-command';

describe('TaggedCommand', () => {
  let component: TaggedCommand;
  let fixture: ComponentFixture<TaggedCommand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedCommand ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggedCommand);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
