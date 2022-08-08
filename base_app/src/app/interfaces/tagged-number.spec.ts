import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedNumber } from './tagged-number';

describe('TaggedNumber', () => {
  let component: TaggedNumber;
  let fixture: ComponentFixture<TaggedNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedNumber ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggedNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
