import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparatorBarComponent } from './separator-bar';

describe('SeparatorBarComponent', () => {
  let component: SeparatorBarComponent;
  let fixture: ComponentFixture<SeparatorBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeparatorBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeparatorBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
