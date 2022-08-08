import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialPopupComponent } from './material-popup-component';

describe('MaterialPopupComponent', () => {
  let component: MaterialPopupComponent;
  let fixture: ComponentFixture<MaterialPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
