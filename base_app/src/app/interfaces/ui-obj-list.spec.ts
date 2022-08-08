import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiObjList } from './ui-obj-list';

describe('UiObjList', () => {
  let component: UiObjList;
  let fixture: ComponentFixture<UiObjList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UiObjList ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UiObjList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
