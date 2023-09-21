import { AfterContentInit, Component, EventEmitter, Input, Optional, Output} from '@angular/core';
import { TabUI } from '../interfaces/props-data';
import { AppComponent } from '../app.component';

@Component({
    animations: [],
    selector: 'app-tab-normal',
    templateUrl: './app-tab-normal.component.html',
    styleUrls: ['./app-tab-normal.component.css'],
})

export class AppTabNormalComponent implements AfterContentInit {
    @Input() _uiTab: TabUI;
    @Input() _props: any;
    @Output() updateModelOfChildDataSet = new EventEmitter<{uiTab: any, sectionIdx: number, dataSetsIdx: number, newChildData: any}>();

    _initialized = false;

    constructor(
        @Optional() public app: AppComponent
    ) { }

    ngAfterContentInit() {
        this._initialized = true;
    }

    getSectionClassName(sectionIndex) {
        let theme = this.app._props?.appTheme?.name || 'SimpleUiBlue';
        return `section-${sectionIndex % 2 ? 'even' : 'odd'}-${theme} L2`;
    }

    sectionTrackBy(index: number, section: any) {
        return section.u_id;
    }

}

