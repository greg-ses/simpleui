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
  let httpTestingController: HttpTestingController;


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
    // expect(app._theAppTitle).toEqual('INITIAL-APP-TITLE');
    expect(component._theAppTitle).toEqual('INITIAL-APP-TITLE');
  });

  it('should render title in a div with class=appTitle', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const appTitle = compiled.querySelector('.appTitle');
    expect(appTitle).toBeTruthy();
  });

  it('should call getProps() and give the first tab the title XYZ', (done) => {

    const test_tab_tile = 'XYZ';

    const getPropsSpy = spyOn(component, 'getProps' );

    fixture.detectChanges();

    expect(getPropsSpy).toHaveBeenCalled();



    done()
  });

});
