import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTabOverlayComponent } from './app-tab-overlay.component';
import {  HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { OverlayPageComponent } from './overlay-page';

describe('AppTabOverlayComponent', () => {
  let component: AppTabOverlayComponent;
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<AppTabOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppTabOverlayComponent, OverlayPageComponent ],
      imports: [ HttpClientTestingModule ]
    })
    .compileComponents();
    httpMock = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTabOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
