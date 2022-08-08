import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedTimeStamp } from './tagged-timestamp';

describe('TaggedTimeStamp', () => {
  let component: TaggedTimeStamp;
  let fixture: ComponentFixture<TaggedTimeStamp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedTimeStamp ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggedTimeStamp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
