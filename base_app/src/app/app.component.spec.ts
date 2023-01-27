import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppTabNormalComponent } from './app-tab-normal/app-tab-normal.component';
import { AppTabOverlayComponent } from './app-tab-overlay/app-tab-overlay.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommandButtonComponent } from './command-button/command-button';
import { ImageOverlaysComponent } from './app-tab-overlay/image-overlays';
import { OverlayCmdBarComponent } from './app-tab-overlay/overlay-cmd-bar';
import { DatasetTableComponent } from './dataset-tables/dataset-table';
import { PropDefinedTableComponent } from './prop-defined-table/prop-defined-table';
import { SeparatorBarComponent } from './dataset-tables/separator-bar';
import {OverlayPageComponent} from './app-tab-overlay/overlay-page';
import {CommonModule} from '@angular/common';


describe('AppComponent', () => {

  beforeAll( async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        SeparatorBarComponent,
        PropDefinedTableComponent,
        DatasetTableComponent,
        OverlayPageComponent,
        OverlayCmdBarComponent,
        ImageOverlaysComponent,
        CommandButtonComponent,
        AppTabNormalComponent,
        AppTabOverlayComponent
      ],
      imports: [ CommonModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    }).compileComponents();
    const commonModule = new CommonModule();
  });

  it('should create the AppComponent', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should not have as title 'INITIAL-APP-TITLE'`, () => {
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
