import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedString } from './tagged-string';

describe('TaggedString', () => {
  let component: TaggedString;
  let fixture: ComponentFixture<TaggedString>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedString ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggedString);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
