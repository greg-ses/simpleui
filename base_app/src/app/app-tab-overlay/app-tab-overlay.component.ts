import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    Optional
} from '@angular/core';
import { DataSetChangeService } from '../services/dataset-change.service';
import {HttpClientModule} from '@angular/common/http';
import {UiObjList} from '../interfaces/ui-obj-list';
import {SiteIndex} from '../interfaces/site-index';

import {TabUI} from '../interfaces/props-data';

import {ajax} from 'rxjs/ajax';
import {AppComponent} from '../app.component';

@Component({
    animations: [],
    selector: 'app-tab-overlay',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app-tab-overlay.component.html',
    styleUrls: ['./app-tab-overlay.component.css'] ,
    providers: [
        HttpClientModule,
        DataSetChangeService
    ]
})

export class AppTabOverlayComponent implements AfterViewInit, OnInit {
    @Input() _uiTab: TabUI;
    @Input() _cmdBarNames: any;
    @Input() _dataTableNames: any;
    @Input() _imageOverlayGroupNames: string;
    @Input() _appURI: string;
    @Input() _cssToJsonURL: string;
    private _nthOverlay = 1;
    private _detectChanges: {name: string, value: boolean};

    _index: number;
    _debug = false;
    _siteIndex = new SiteIndex();
    _implementedOverlays: any;
    _ticks = 0;
    _logCount = 0;
    _serverStatus: string;
    _autoRefreshLabel = 'Pause';
    _refreshState = 'pending';

    @Input()
    set detectChanges(detectChanges: {name: string, value: boolean}) {

        if (typeof detectChanges === 'undefined') {
            return;
        }

        if (typeof this._detectChanges === 'undefined') {
            this._detectChanges = detectChanges;
        }

        if (typeof this._uiTab === 'object') {
            if (this._uiTab.name === detectChanges.name) {
                if (detectChanges.value === true) {
                    // this._changeDetectorRef.markForCheck();
                    this._changeDetectorRef.detectChanges();
                    this._changeDetectorRef.detach();
                }
            }
        }
    }
    get detectChanges(): {name: string, value: boolean} { return this._detectChanges; }

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private dataSetChangeService: DataSetChangeService,
        @Optional() public app: AppComponent
    ) {
            this._index = -1;
    }

    ngOnInit() {
        this.getImplementedOverlays(this._nthOverlay);
    }

    ngAfterViewInit() {
        // Disable change detection on the component - we deliberately re-enable it when required using reattach() and detectChanges()
        this._changeDetectorRef.detach();
    }

    commaSplit(s: string): any {
        return (s && s.split(/,[ ]*/)) || [];
    }

    log(logLevel: number, msg: string): void {
        if (this._siteIndex && this._siteIndex['props']
            && this._siteIndex['props'].logLevel
            && (this._siteIndex['props'].logLevel.value >= logLevel) ) {

            this._logCount++;
            const now = new Date();
            const ts: string = now.getHours() + 'h ' + now.getMinutes() + 'm ' + now.getSeconds() + 's ' + now.getMilliseconds() + 'ms';
            console.log('Level: ' + logLevel + ', logCount: ' + this._logCount + ', at ' + ts + ': ' + msg);
        }
    }

    getImplementedOverlays(nthOverlay): any {

        const ajaxRequest = {
            url: `${this._cssToJsonURL}`,
            withCredentials: true,
            crossDomain: true,
            timeout:
                (this._siteIndex && this._siteIndex['props'] && (typeof this._siteIndex['props']['ajaxTimeout'] === 'string'))
                    ? parseInt(this._siteIndex['props']['ajaxTimeout'], 10)
                    : 5001
        };
        const data$ = ajax(ajaxRequest);
        data$.subscribe(res => {
            if (   (res.status === 200)
                && (res.response instanceof Object)
                && (res.response.CSS_Elements instanceof Object)
            ) {
                return this.onImplementedOverlaysUpdate(res.response.CSS_Elements);
            } else {
                console.error(`Error ${res.status} fetching res,response.CSS_Elements data in getImplementedOverlays(${nthOverlay})`);
            }
        },
        err => {
            console.error(`Error in AppTabOverlayComponent.getImplementedOverlays() ajax subscribe callback.`, err);

        });
    }

    onImplementedOverlaysUpdate(cssElements: any) {
        this._implementedOverlays = [];
        if (cssElements instanceof Object) {
            for (const key of Object.keys(cssElements)) {
                this._implementedOverlays[key] = cssElements[key];
            }
        }
    }

    normalizeSection(sectionName: string, sectionLabel: string, sortIt?: boolean) {

        // Normalize the StatusOverview section into an NVPList
        if (   typeof this._uiTab === 'object'
            && typeof this._uiTab._DataSummary === 'object'
            && typeof this._uiTab._DataSummary[sectionName] === 'object') {
            const normalSection: UiObjList = new UiObjList;
            normalSection.label = sectionLabel;
            normalSection.u_id = this._uiTab._DataSummary[sectionName].u_id;
            normalSection.elements = [];

            this.traverseJSONwithPush(normalSection.elements, sectionName, JSON.stringify(this._uiTab._DataSummary[sectionName]),
                function (outArr, root, key, valueObj) {
                    if (typeof valueObj === 'object' && root !== key) {
                        if (sectionName === 'ValvesOverview') {
                            if (valueObj.name !== undefined) {
                                const e = {
                                    'name': valueObj.name,
                                    'value': valueObj.value,
                                    'units': valueObj.units ? valueObj.units : ''
                                };
                                outArr.push(e);
                            }
                        } else {
                            const ee = {
                                'name': key,
                                'value': valueObj.value,
                                'units': valueObj.units ? valueObj.units : ''
                            };
                            outArr.push(ee);
                        }
                    }
                });

            if (sortIt) {
                normalSection.elements.sort(function (a, b) {
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });
            }
            this._uiTab._DataSummary[sectionName] = normalSection;
        }

    }

    traverseJSONwithPush (pushToArr, root, json, callback) {
        JSON.parse(json, function (key, valueObj) {
            if (key !== '') {
                callback.call(this, pushToArr, root, key, valueObj);
            }
        return valueObj;
    });
    }

    normalizeActiveFaultsSection(sectionName: string, sectionLabel: string) {

        if (   typeof this._uiTab === 'object'
            && typeof this._uiTab?._DataSummary === 'object'
            && typeof this._uiTab._DataSummary[sectionName] === 'object'
           ) {
            const normalSection: UiObjList = new UiObjList;
            normalSection.label = sectionLabel;
            normalSection.u_id = this._uiTab._DataSummary[sectionName].u_id;

            const origSection = this._uiTab._DataSummary[sectionName];
            const normalElements = [];

            Object.keys(origSection).forEach(function(key) {
                if (typeof origSection[key] === 'object') {
                    if (Array.isArray(origSection[key])) {
                        for (const i in origSection[key]) {
                            if (origSection[key].hasOwnProperty(i)) {
                                const o: any = origSection[key][i];
                                o['type'] = key;
                                o['desc'] = o['desc'].replace(/_/g, ' ');
                                normalElements.push({'fault': o});
                            }
                        }
                    }  else if (typeof origSection[key] === 'string') {
                        // Do nothing - simple string attribute, handled above
                    } else {
                        const o: any = origSection[key];
                        if (typeof o === 'object') {
                            o['type'] = key;
                            o['desc'] = o['desc'].replace(/_/g, ' ');
                            normalElements.push({'fault': o});
                        } else {
                            normalElements.push({'fault': {'type': 'Unknown', 'value': key}});
                        }
                    }
                }
            });
            normalSection.elements = normalElements;
            this._uiTab._DataSummary[sectionName] = normalSection;
        }
    }

    getOverlayImage() {
        return this._uiTab && this._uiTab['overlayImageUrl'];
    }

    createUiObjList(label = '', desc = '', u_id = '', url = '', tooltip = '', elements = []): UiObjList {
        const uiObjList = new UiObjList();
        uiObjList.label = label;
        uiObjList.desc = desc;
        uiObjList.u_id = u_id;
        uiObjList.url = url;
        uiObjList.tooltip = tooltip;
        uiObjList.elements = elements;

        return uiObjList;
    }

}
