import { AppComponent } from './app.component';
import { AppTabNormalComponent } from './app-tab-normal/app-tab-normal.component';
import { AppTabOverlayComponent } from './app-tab-overlay/app-tab-overlay.component';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CmdSetComponent } from './cmdsets/cmdset.component';
import { CommonModule } from '@angular/common';
import { CommandButtonComponent } from './cmdsets/command-button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ImageOverlaysComponent } from './app-tab-overlay/image-overlays';
import { MaterialPopupComponent } from './cmdsets/material-popup-component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { OverlayCmdBarComponent } from './app-tab-overlay/overlay-cmd-bar';
import { OverlayPageComponent } from './app-tab-overlay/overlay-page';
import { DatasetTableComponent } from './dataset-tables/dataset-table';
import { PortalModule } from '@angular/cdk/portal';
import { PropDefinedTableComponent } from './dataset-tables/prop-defined-table';
import { SectionComponent } from './section/section.component';
import { SeparatorBarComponent } from './dataset-tables/separator-bar';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {CommandButtonChangeService} from './services/command-button-change.service';
import {AppEditUiPanelComponent} from "./app-tab-overlay/app-edit-ui-panel-component";

const BMSDataService_data_port = 16901;
const config: SocketIoConfig = {  url: 'http://localhost:' + BMSDataService_data_port, options: {}};

@NgModule({
  declarations: [
      AppComponent,
      AppEditUiPanelComponent,
      AppTabNormalComponent,
      AppTabOverlayComponent,
      CmdSetComponent,
      CommandButtonComponent,
      ImageOverlaysComponent,
      MaterialPopupComponent,
      OverlayCmdBarComponent,
      OverlayPageComponent,
      DatasetTableComponent,
      PropDefinedTableComponent,
      SectionComponent,
      SeparatorBarComponent
  ],
    entryComponents: [
      MaterialPopupComponent
  ],
  imports: [
      NoopAnimationsModule,
      BrowserModule,
      CommonModule,
      FormsModule,
      HttpClientModule,
      MatDialogModule,
      MatTabsModule,
      PortalModule,
      ReactiveFormsModule,
      SocketIoModule.forRoot(config)
  ],
  providers: [ CommandButtonChangeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }


// static forRoot(routes: Routes, config?: ExtraOptions): ModuleWithProviders<RouterModule>;
