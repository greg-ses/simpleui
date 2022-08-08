import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppTabNormalComponent } from './app-tab-normal/app-tab-normal.component';
import { AppTabOverlayComponent } from './app-tab-overlay/app-tab-overlay.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommandButtonComponent } from './cmdsets/command-button';
import { ImageOverlaysComponent } from './app-tab-overlay/image-overlays';
import { OverlayCmdBarComponent } from './app-tab-overlay/overlay-cmd-bar';
import { DatasetTableComponent } from './dataset-tables/dataset-table';
import { PropDefinedTableComponent } from './dataset-tables/prop-defined-table';
import { SeparatorBarComponent } from './dataset-tables/separator-bar';
import {OverlayPageComponent} from './app-tab-overlay/overlay-page';

describe('AppComponent', () => {
  beforeAll(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    }).compileComponents();
  }));

  it('should create the AppComponent', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'INITIAL-APP-TITLE'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    // expect(app).isNot(null);
    expect(app._theAppTitle).toEqual('INITIAL-APP-TITLE');
  });

  it('should render title in a div with class=appTitle', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const appTitle = compiled.querySelector('.appTitle');
    expect(appTitle).toBeTruthy();
  });
});
