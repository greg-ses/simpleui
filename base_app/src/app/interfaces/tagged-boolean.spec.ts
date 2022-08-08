import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedBoolean } from './tagged-boolean';

describe('TaggedBoolean', () => {
  let component: TaggedBoolean;
  let fixture: ComponentFixture<TaggedBoolean>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedBoolean ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggedBoolean);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
