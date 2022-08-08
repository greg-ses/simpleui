import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CssUpdateService } from './css-update-service';

describe('CssUpdateService', () => {
  let component: CssUpdateService;
  let fixture: ComponentFixture<CssUpdateService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CssUpdateService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CssUpdateService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
