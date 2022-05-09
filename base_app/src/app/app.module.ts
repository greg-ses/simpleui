import { AppComponent } from './app.component';
import { AppTabDashboardComponent } from './app-tab-dashboard/app-tab-dashboard.component';
import { AppTabNormalComponent } from './app-tab-normal/app-tab-normal.component';
import { AppTabOverlayComponent } from './app-tab-overlay/app-tab-overlay.component';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CmdSetComponent } from './cmdsets/cmdset.component';
import { CommonModule } from '@angular/common';
import { CommandButtonComponent } from './cmdsets/command-button';
import { ErrorPopupComponent } from './cmdsets/error-popup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ImageOverlaysComponent } from './app-tab-overlay/image-overlays';
import { MaterialPopupComponent } from './cmdsets/material-popup-component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { OverlayCmdBarComponent } from './app-tab-overlay/overlay-cmd-bar';
import { OverlayPageComponent } from './app-tab-overlay/overlay-page';
import { DatasetTableComponent } from './dataset-tables/dataset-table';
import { PortalModule } from '@angular/cdk/portal';
import { PropDefinedTableComponent } from './dataset-tables/prop-defined-table';
import { SectionComponent } from './section/section.component';
import { SeparatorBarComponent } from './dataset-tables/separator-bar';
import { CommandButtonChangeService } from './services/command-button-change.service';
import { AppEditUiPanelComponent } from './app-tab-overlay/app-edit-ui-panel-component';

@NgModule({
    declarations: [
      AppComponent,
      AppTabDashboardComponent,
      AppEditUiPanelComponent,
      AppTabNormalComponent,
      AppTabOverlayComponent,
      CmdSetComponent,
      CommandButtonComponent,
      ErrorPopupComponent,
      ImageOverlaysComponent,
      MaterialPopupComponent,
      OverlayCmdBarComponent,
      OverlayPageComponent,
      DatasetTableComponent,
      PropDefinedTableComponent,
      SectionComponent,
      SeparatorBarComponent
  ],
  imports: [
      NoopAnimationsModule,
      BrowserModule,
      CommonModule,
      FormsModule,
      HttpClientModule,
      MatDialogModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      MatTabsModule,
      PortalModule,
      ReactiveFormsModule
  ],
  providers: [ CommandButtonChangeService ],
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
