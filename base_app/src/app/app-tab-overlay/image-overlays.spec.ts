import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageOverlaysComponent } from './image-overlays';

describe('ImageOverlaysComponent', () => {
  let component: ImageOverlaysComponent;
  let fixture: ComponentFixture<ImageOverlaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageOverlaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageOverlaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
