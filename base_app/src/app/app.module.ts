import { AppComponent } from './app.component';
import { AppTabNormalComponent } from './app-tab-normal/app-tab-normal.component';
import { AppTabOverlayComponent } from './app-tab-overlay/app-tab-overlay.component';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CmdSetComponent } from './cmdsets/cmdset.component';
import { CommonModule } from '@angular/common';
import { DataSetChangeService } from './services/dataset-change.service';
import { CommandButtonComponent } from './command-button/command-button';
import { ErrorPopupComponent } from './cmdsets/error-popup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ImageOverlaysComponent } from './app-tab-overlay/image-overlays';
import { MaterialPopupComponent } from './cmdsets/material-popup-component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { OverlayCmdBarComponent } from './app-tab-overlay/overlay-cmd-bar';
import { OverlayPageComponent } from './app-tab-overlay/overlay-page';
import { DatasetTableComponent } from './dataset-tables/dataset-table';
import { PortalModule } from '@angular/cdk/portal';
import { PropDefinedTableComponent } from './prop-defined-table/prop-defined-table';
import { SectionComponent } from './section/section.component';
import { SeparatorBarComponent } from './dataset-tables/separator-bar';
import { CommandButtonChangeService } from './services/command-button-change.service';
import { AppEditUiPanelComponent } from './app-tab-overlay/app-edit-ui-panel-component';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { FilterPipe } from './filter.pipe';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
    declarations: [
      AppComponent,
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
      SeparatorBarComponent,
      SmartTableComponent,
      FilterPipe
  ],
  imports: [
      BrowserModule,
      CommonModule,
      FormsModule,
      HttpClientModule,
      MatDialogModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatTableModule,
      MatTabsModule,
      NoopAnimationsModule,
      PortalModule,
      ReactiveFormsModule,
      MatSortModule
  ],
  providers: [
      CommandButtonChangeService,
      DataSetChangeService,
      HttpClient
  ],
  schemas: [
      CUSTOM_ELEMENTS_SCHEMA,
      NO_ERRORS_SCHEMA
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
