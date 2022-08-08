import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplementedOverlaysService } from './implemented-overlays.service';

describe('ImplementedOverlaysService', () => {
  let component: ImplementedOverlaysService;
  let fixture: ComponentFixture<ImplementedOverlaysService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImplementedOverlaysService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplementedOverlaysService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
