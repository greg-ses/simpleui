import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CSSPairList } from './css-pair-list';

// TODO: maybe remove this class altogether

describe('CSSPairList', () => {
  let component: CSSPairList;
  let fixture: ComponentFixture<CSSPairList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CSSPairList ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CSSPairList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
