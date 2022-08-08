import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppLink } from './props-data';

// TODO: refactor out other classes from props-data.ts, make their own tests

describe('AppLink', () => {
  let component: AppLink;
  let fixture: ComponentFixture<AppLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppLink ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppLink);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

