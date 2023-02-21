import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { OverlayPageComponent } from './app-tab-overlay/overlay-page';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

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
      imports: [
        CommonModule,
        HttpClientTestingModule
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    }).compileComponents();
    const commonModule = new CommonModule();
  });

  beforeEach( async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ HttpClientTestingModule ],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
  });



  it('should create the AppComponent', () => {
    // const fixture = TestBed.createComponent(AppComponent);
    // const app = fixture.debugElement.componentInstance;
    // expect(app).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it(`should have as title 'INITIAL-APP-TITLE'`, () => {
    // const fixture = TestBed.createComponent(AppComponent);
    // const app = fixture.debugElement.componentInstance;
    // // expect(app).isNot(null);
    expect(component._theAppTitle).toEqual('INITIAL-APP-TITLE');
  });

  it('should render title in a div with class=appTitle', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const appTitle = compiled.querySelector('.appTitle');
    expect(appTitle).toBeTruthy();
  });


  // it('should call getProps and make a request', (done) => {
  //   const httpMock = TestBed.inject(HttpClientTestingModule);
  //   const TEST_TAB_TITLE = "Test Tab";
  //   component._propsURL = "localhost:4100/simple_ui/ui/query/props"
  //   const request_url = "localhost:4100/simple_ui/ui/query/props"
  //   const mock_response = {
  //     "props": {
  //       "srcFile": "/var/www/simple_ui/ui.properties",
  //       "mtimeMs": "1675090930263.723",
  //       "propsLastRefresh": "2023-02-21.15:14:44",
  //       "uiProp": {
  //         "value": "ui"
  //       },
  //       "uiVersionLong": {
  //         "value": "UI Version Long"
  //       },
  //       "uiVersionShort": {
  //         "value": "UI Version Short"
  //       },
  //       "propsUrl": {
  //         "value": "/simple_ui/ui/query/props"
  //       },
  //       "fullAppUrl": {
  //         "value": "/simple_ui"
  //       },
  //       "selectedIndex": {
  //         "value": "0"
  //       },
  //       "instance": {
  //         "name": "Simple ui sample app"
  //       },
  //       "nodejsPort": {
  //         "value": "2080"
  //       },
  //       "refreshRate": "1200",
  //       "appTheme": {
  //         "name": "SimpleUiPeach"
  //       },
  //       "tab": [{
  //         "index": "0",
  //         "id": "tab-1",
  //         "name": `${TEST_TAB_TITLE}`
  //       }]
  //     }
  //   };
  //   const mockRequest = httpMock.expectOne(request_url);
  //   mockRequest.flush(mock_response);
  //   fixture.detectChanges(); // make DOM update with async data
  // });



  // it('should call getProps() and give the first tab the title XYZ', (done) => {
  //   const getPropsSpy = spyOn(component, 'getProps' );
  //   fixture.detectChanges();
  //   expect(getPropsSpy).toHaveBeenCalled();
  //   done()
  // });

});
