import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedCommandList } from './tagged-command-list';

describe('TaggedCommandList', () => {
  let component: TaggedCommandList;
  let fixture: ComponentFixture<TaggedCommandList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaggedCommandList ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggedCommandList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
