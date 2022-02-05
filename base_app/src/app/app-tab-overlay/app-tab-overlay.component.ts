import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    Optional
} from '@angular/core';
// import { DataSummary } from '../interfaces/data-summary';
import { DataSetChange, DataSetChangeService} from '../services/dataset-change.service';
import {HttpClientModule} from '@angular/common/http';
import {ClientLogger} from '../../tools/logger';
import {UiObjList} from '../interfaces/ui-obj-list';
import {SiteIndex} from '../interfaces/site-index';

import {CssUpdateService} from '../services/css-update-service';
import {TabUI} from '../interfaces/props-data';

import '../css/styles.css';
// import {Observable, throwError as observableThrowError} from 'rxjs';
// import {CSSPairList} from '../interfaces/css-pair-list';
import {ajax} from 'rxjs/ajax';
import {AppComponent} from '../app.component';

@Component({
    selector: 'app-tab-overlay',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app-tab-overlay.component.html',
    styleUrls: ['./app-tab-overlay.component.css'] ,
    providers: [
        HttpClientModule,
        CssUpdateService,
        DataSetChangeService
    ]
})

export class AppTabOverlayComponent implements AfterViewInit, OnInit {
    @Input() _uiTab: TabUI;
    @Input() _cmdBarNames: any;
    @Input() _dataTableNames: any;
    @Input() _imageOverlayGroupNames: string;
    @Input() _appURI: string;
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

    static getImgInfoCmd(id, tag) {
        let cmd: string;
        cmd = 'var e = document.getElementById("' + id + '");' +
            'if (e) {var cs = window.getComputedStyle(e);' +
            'if (cs) {' +
            'var msg = "[' + tag + '] id: ' + id +
            ' .className: " + e.className + ' +
            '", .style { position: " + cs.position + ' +
            '"; top: " + cs.top + ' +
            '"; left: " + cs.left + ' +
            '"; width: " + cs.width + ' +
            '"; height:" + cs.height + ' +
            '"; }";' +
            'console.log(msg);' +
            '}' +
            '} else { console.log("[\' + tag + \'] id: \' + id + \' - Element not found.") } ';
        return cmd;
    }

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
        private _cssUpdateService: CssUpdateService,
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
        return s.split(/,[ ]*/);
    }

    log(logLevel: number, msg: string) {
        if (this._siteIndex && this._siteIndex['props']
            && this._siteIndex['props'].logLevel
            && (this._siteIndex['props'].logLevel.value >= logLevel) ) {

            this._logCount++;
            const now = new Date();
            const ts: string = now.getHours() + 'h ' + now.getMinutes() + 'm ' + now.getSeconds() + 's ' + now.getMilliseconds() + 'ms';
            console.log('Level: ' + logLevel + ', logCount: ' + this._logCount + ', at ' + ts + ': ' + msg);
        }
    }

    getNthOverlayNumber() {

        let nthOverlay: any;
        nthOverlay = (this._siteIndex && this._siteIndex['props']
            && this._siteIndex['props'].nthOverlay
            && (this._siteIndex['props'].nthOverlay.value)) || 1;

        return nthOverlay;
    }

    getImplementedOverlays(nthOverlay) {

        ClientLogger.log('LogOverlayList', 'getImplementedOverlays(nthOverlay)');

        const ajaxRequest = {
            url: `${this._appURI}php/css_elements_to_json.php?nthOverlay=${nthOverlay}`,
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
                return (this.onImplementedOverlaysUpdate(res.response.CSS_Elements));
            } else {
                console.log(`Error ${res.status} fetching res,response.CSS_Elements data in getImplementedOverlays(${nthOverlay})`);
            }
        },
        err => {
            console.log(`Error in AppTabOverlayComponent.getImplementedOverlays() ajax subscribe callback.`);
            try {
                console.log('  name: ' + err.name + ', message: ' + err.message + ', url: ' + err.request.url);
            } catch (err1) { }
        });

        ClientLogger.log('LogOverlayList',
            (typeof this._implementedOverlays === 'undefined') ? 'undefined' : this._implementedOverlays.toString());
    }

    onImplementedOverlaysUpdate(cssElements: any) {
        this._implementedOverlays = [];
        if (cssElements instanceof Object) {
            for (const key of Object.keys(cssElements)) {
                this._implementedOverlays[key] = cssElements[key];
            }
        }
        ClientLogger.log('LogOverlayListAll',
            'onImplementedOverlaysUpdate() - count _implementedOverlays: '
                  + Object.keys(this._implementedOverlays).length);
    }

    sendCssUpdate(cssOperation: string, cssRecord: string, cssValueRecord: string) {
        ClientLogger.log('LogCssUpdate', 'sendCssUpdate(' + cssOperation + ', ' + cssRecord + ')');

        this._cssUpdateService.sendUpdate(this.getNthOverlayNumber(), cssOperation, cssRecord, cssValueRecord);
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

        if (typeof this._uiTab._DataSummary === 'object' && typeof this._uiTab._DataSummary[sectionName] === 'object') {
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

    onDataUpdate(response: any) {
        if (typeof response['Overlay_Summary'] === 'object') {
            this._uiTab._DataSummary = response['Overlay_Summary'];
        } else {
            this._uiTab._DataSummary = response;
            }
        this.normalizeSection('StatusOverview', 'Status Overview');

        const groups = this._imageOverlayGroupNames.split(',');
        for (const gName in groups) {
            if (groups.hasOwnProperty(gName)) {
                this.normalizeSection(gName, gName.replace(/([a-z])([A-Z])/g, '$1 $2'));
            }
        }

        this.normalizeActiveFaultsSection('ActiveFaultList', 'Active Faults');

        // this._changeDetectorRef.markForCheck();
        this._changeDetectorRef.detectChanges();
        this._changeDetectorRef.detach();
    }

    getOverlayImage() {
        return this._uiTab['overlayImageUrl'];
    }

    getCoordinates(elem) {
        const box = elem.getBoundingClientRect();

        return {
            top: Math.round((box.top + pageYOffset) * 10) / 10,
            left: Math.round((box.left + pageXOffset) * 10) / 10
        };
    }

    parseImgData(url): any {
        let imgData = null;
        const pos = url.lastIndexOf('/');
        if (pos > -1) {
            const fileParts = url.substring(pos + 1).split('.');
            if (fileParts.length > 0) {
                imgData = {};
                imgData['id'] = fileParts[0];
                imgData['className'] = '';
                imgData['cssDefName'] = '#' + imgData['id'];
                if (fileParts.length > 1) {
                    imgData['className'] = fileParts[1];
                    imgData['cssDefName'] = imgData['id'] + '.' + imgData['className'];
                }
            }
        }

        return imgData;
    }

    onDrop(ev: DragEvent) {
        try {
            let id: string = ev.dataTransfer.getData('Text');


            if (id === 'unimplementedOverlaysContainer') {
                return false;
            }

            console.log('OverlayComponent.onDrop(' + id + ')');
                const imgData = this.parseImgData(id);
                if (imgData) {
                    id = imgData.id;
                }

                this.moveDraggableVarOrImage(ev, imgData, id);

        } catch (e) {
            console.log('Error in onDrop(): ' + e);
        }

        ev.preventDefault();
    }

    moveDraggableVarOrImage(ev: any, imgData: any, id: string) {
        let anchorCoords = {top: 0, left: 0};

        const anchorElement = document.getElementById('overlayAnchor');
        if (anchorElement) {
            anchorCoords = this.getCoordinates(anchorElement);
        }

        const e: any = document.getElementById(id);
        const prevStyle = window.getComputedStyle(e);

        let valueWidth: any = e && e.children && e.children[1] && e.children[1].offsetWidth || '100';
        valueWidth = Math.round(valueWidth);

        const eLeft = ev.pageX - (anchorCoords.left + (e.offsetWidth / 2));
        const eTop = ev.pageY - (anchorCoords.top + (e.offsetHeight / 2));

        const moveLogger: any = document.getElementById('moveLogger');
        moveLogger.innerHTML = 'x: ' + ev.pageX + 'px, y:' + ev.pageY + 'px&nbsp;&nbsp;' +
            'left: '     + anchorCoords.left + ', top: ' + anchorCoords.top + '&nbsp;&nbsp;' +
            'ev.pageX: ' + ev.pageX + ', ev.pageY: ' + ev.pageY + '&nbsp;&nbsp;' +
            'eLeft: '    + eLeft + ', eTop: ' + eTop + '&nbsp;&nbsp;' +
            'Width: '    + e.offsetWidth + ', Height: ' + e.offsetHeight;

        console.log('prevStyle["left"]): ' + prevStyle['left'] + ', prevStyle["top"] ' + prevStyle['top']);
        console.log('          ev.pageX: ' + ev.pageX + ', ev.pageY: ' + ev.pageY);
        console.log('          ev.scrollX: ' + ev.scrollX + ', ev.scrollY: ' + ev.scrollY);
        console.log('           startX:'   + moveLogger['dragStartInfo']['startX']
            + ',   startY: ' + moveLogger['dragStartInfo']['startY']);
        console.log('leftOffsetToMouse:' + moveLogger['dragStartInfo']['leftOffsetToMouse'] +
            ',topOffsetToMouse: ' + moveLogger['dragStartInfo']['topOffsetToMouse']);

        const newTop: any = Math.round(ev.pageY - anchorCoords.top + moveLogger['dragStartInfo']['topOffsetToMouse']);
        const newLeft: any = Math.round(ev.pageX - anchorCoords.left + moveLogger['dragStartInfo']['leftOffsetToMouse']);

        let newHeight: any = e && e.children && e.children[1] && e.children[1].offsetHeight || e.offsetHeight;
        newHeight = Math.round(newHeight);

        const defaultFmt  = (e && e.innerHTML && e.innerHTML.match(/[0-9]*[.][0-9]+/)) ? '\'%2d\'' : '\'\'';
        const newStyle = 'position: absolute; ' +
            'top: '  + newTop + 'px; '  +
            'left: ' + newLeft + 'px; ' +
            'width: 200px; ' +
            'height:' + newHeight + 'px; ';
        const newValueStyle = 'width:' + valueWidth + 'px; ' +
            'height:' + newHeight + 'px; ' +
            '--format:' + defaultFmt + ';';
        let cssDef = '';
        let cssValueDef = '';
        if (imgData) {
            e.className = imgData.className;
            cssDef = imgData.cssDefName + ' {' + newStyle + '}\n';

            if (this._debug) {
                const imgInfoCmd = AppTabOverlayComponent.getImgInfoCmd(id, 'Before');
                setTimeout(imgInfoCmd, 50);
            }

            const cmd = 'var e=document.getElementById("' + id + '"); if (e) {e.style="' + newStyle + '";}';
            if (this._debug) {
                console.log(cmd);
            }
            setTimeout(cmd, 200);

            if (this._debug) {
                const imgInfoCmd = AppTabOverlayComponent.getImgInfoCmd(id, 'After');
                setTimeout(imgInfoCmd, 100);
            }

        } else {
            cssDef = '#' + id + ' {' + newStyle + '}\n';
            cssValueDef = '#' + id + '_value {' + newValueStyle + '}\n';
            e.style = newStyle;

            // Move the element to a the div containing the image, and update its current CSS definitions
            const cmd =
                `var e=document.getElementById("${id}");
                if (e) {
                     var overlayAnchor = document.getElementById("overlayAnchor");
                     if (overlayAnchor) {overlayAnchor.appendChild(e);}
                     e.style="${newStyle}";
                 }
                 var e_val=document.getElementById("${id}_value"); if (e_val) {e_val.style="${newValueStyle}";}`;
            if (this._debug) {
                console.log(cmd);
            }
            setTimeout(cmd, 200);

            console.log('newStyle: ' + newStyle);
            console.log('newValueStyle: ' + newValueStyle);

            const retVal = this.sendCssUpdate('update-css', cssDef, cssValueDef);
            console.log(retVal);
        }

        console.log(cssDef);
    }

    onDragOver(ev: DragEvent) {
        // Allow Drop
        ev.preventDefault();

        const positioner = document.getElementById('moveLogger');
        positioner.innerHTML = '(x: ' + ev.pageX + 'px, y:' + ev.pageY + 'px)';
    }
}

