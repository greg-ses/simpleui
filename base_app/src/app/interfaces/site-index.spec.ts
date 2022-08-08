import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIndex } from './site-index';

describe('SiteIndex', () => {
  let component: SiteIndex;
  let fixture: ComponentFixture<SiteIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIndex ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
