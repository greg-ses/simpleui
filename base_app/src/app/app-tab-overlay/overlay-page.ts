import {ChangeDetectionStrategy, Component, EventEmitter, Input, Optional, Output, AfterViewChecked, ViewChild, ElementRef, NgZone} from '@angular/core';
import {DataSummary} from '../interfaces/data-summary';
import {OverlayType} from './overlay-type';
import {SiteIndex} from '../interfaces/site-index';
import {AppComponent} from '../app.component';
import {UTIL} from '../../tools/utility';

@Component({
    animations: [],
    // tslint:disable-next-line:component-selector
    selector: 'overlay-page',
    changeDetection: ChangeDetectionStrategy.Default,
    styleUrls: ['./app-tab-overlay.component.css'],
    templateUrl: './overlay-page.html'
})

// The common page layout with id tags for js
export class OverlayPageComponent {
    @Input() _DataSummary: DataSummary;
    @Input() _siteIndex: SiteIndex;
    @Input() _ticks: any;
    @Input() _props: any;
    @Input() _uiTab: any;
    @Input() _imageOverlayGroupNames: any;
    @Input() _cmdBarNames: any;
    @Input() _dataTableNames: any;
    @Input() _all_implemented_overlays: any;
    @Input() _logLevel = 0;

    @Output() onToggleAutoRefresh = new EventEmitter<boolean>();

    _autoRefreshLabel = 'Pause Auto Refresh';

    _commandList = [];
    _imageList = [];
    _animationList = [];

    TODO__hide_graphs_and_data = false;

    isMissingFiles = false;
    missingFiles = [];

    static writeOverlayDebugInfo(overlayGroupName: string, idList: any, overlayType: OverlayType): void {
        const implKey = OverlayType[OverlayType[overlayType]] || 'Unimplemented';

        if (typeof window['overlays'] === 'undefined') {
            window['overlays'] = {};
        }

        if (typeof window['overlays'][implKey] === 'undefined') {
            window['overlays'][implKey] = {};
        }

        if (typeof window['overlays'][implKey][overlayGroupName] === 'undefined') {
            window['overlays'][implKey][overlayGroupName] = [];
        }

        let o: any = null;
        for (o of idList) {
            if (typeof window['overlays'][implKey][overlayGroupName][o] === 'undefined') {
                const cmd = 'window["overlays"]["' + implKey + '"]["' + overlayGroupName + '"]["' + o + '"]' +
                    '= document.getElementById("' + o + '");';
                setTimeout(cmd, 500);
            }
        }
    }

    static isImage(e: any): boolean {
        return (typeof e['type'] === 'string') && (e['type'] === 'valToImg');
    }

    constructor(
        // private _changeDetectorRef: ChangeDetectorRef,
        @Optional() public app: AppComponent
    ) {    }



    isDesignEnabled(): boolean {
        return (this.app._props && this.app._props['mode'] && this.app._props['mode'] === 'design');
    }

    toggleAutoRefresh(): void {
        if (this._autoRefreshLabel === 'Pause Auto Refresh') {
            this._autoRefreshLabel = 'Resume Auto Refresh';
        } else {
            this._autoRefreshLabel = 'Pause Auto Refresh';
        }
        this.onToggleAutoRefresh.emit(this._autoRefreshLabel === 'Pause Auto Refresh');
    }

    isImplemented(eName: string): boolean {
        return (this._all_implemented_overlays && this._all_implemented_overlays[eName]);
    }

    filterBy(overlayType: OverlayType, overlayNode: any, fullOverlayName: string, tag: string): boolean {

        if (this.isImplemented(fullOverlayName)) {
            if ((overlayType === OverlayType.ImplementedDyns) && (tag === 'dyn')) {
                return true;
            }
            if ((overlayType === OverlayType.ImplementedImages) && (tag === 'img')) {
                return true;
            }
            if ((overlayType === OverlayType.ImplementedAnimations) && (tag === 'animation')) {
                return true;
            }
            if ((overlayType === OverlayType.ImplementedCommands) && (tag === 'command')) {
                return true;
            }
            if ((overlayType === OverlayType.ImplementedDataTables) && (tag === 'prop-def-table')) {
                return true;
            }
        } else {
            if ((overlayType === OverlayType.UnImplementedDyns) && (tag === 'dyn')) {
                return true;
            }
            if ((overlayType === OverlayType.UnImplementedImages) && (tag === 'img')) {
                return true;
            }
            if ((overlayType === OverlayType.UnImplementedAnimations) && (tag === 'animation')) {
                return true;
            }
            if ((overlayType === OverlayType.UnImplementedCommands) && (tag === 'command')) {
                return true;
            }
            if ((overlayType === OverlayType.UnImplementedDataTables) && (tag === 'prop-def-table')) {
                return true;
            }
        }

        return false;
    }


     /**
     * Returns true if element is already in elemlist
     * @param elemList list of elements
     * @param element potenital new element
     */
    checkElemListForDuplicates(elemList: any, element: any): boolean {
        if (!elemList || !element) {
            return false
        }
        for (let iter = 0; iter < elemList.length; iter++) {
            const current = elemList[iter];
            if (UTIL.elements_are_equal(current, element)) {
                return true
            }
        }
        return false
    }

    /**
     * TBD
     * @param overlayType -
     * @param overlayGroupName -
     * @param tag -
     * @returns elemList
     */
    getGroupMembers(overlayType: OverlayType, overlayGroupName: string, tag: string): any {
        // tag is an element of ['dyn', 'command', 'img', 'table']

        // update missing gif and png overlay files
        if (this._DataSummary['missing_overlay_files']) {
            this.isMissingFiles = true;
            this.missingFiles = this._DataSummary['missing_overlay_files'];
        } else { this.isMissingFiles = false }

        const node = this._DataSummary[overlayGroupName];
        const elemList = [];
        if (node && typeof node !== 'undefined') {
            for (const key of Object.keys(node)) {
                if (key === tag) {
                    if (Array.isArray(node[key])) {
                        for (let i = 0; i < node[key].length; i++) {
                            if (typeof node[key][i]['name'] === 'string') {
                                const fullOverlayName = UTIL.addContextPrefix(overlayGroupName, node[key][i]['name']);
                                const e = this.getElemInfo(tag, overlayGroupName, node[key][i]['name']);
                                if (this.filterBy(overlayType, node[key][i], e.id, tag)
                                    || this.filterBy(overlayType, node[key][i], fullOverlayName, tag)) {
                                    if (!this.checkElemListForDuplicates(elemList, e)) {
                                        elemList.push(e);
                                    }
                                }
                            }
                        }
                    } else {
                        const fullOverlayName = UTIL.addContextPrefix(overlayGroupName, node[key]['name']);
                        const e = this.getElemInfo(tag, overlayGroupName, node[key]['name']);
                        if (this.filterBy(overlayType, node[key], e.id, tag)
                            || this.filterBy(overlayType, node[key], fullOverlayName, tag)) {
                            elemList.push(e);
                        }
                    }
                } else if (['dyn', 'command', 'img', 'animation', 'label', 'table', 'u_id', 'value'].indexOf(key) === -1) {

                    // todo: find out what this else actually does!!!  Might be "dead" code
                    // todo: update 5/22/20, not deleting yet,
                    //                       but all actually defined values should be handled (and appear to be handled) in the if above.
                    //
                    //
                    // Each tagName is unique - interpret as 'dyn' or 'valToImg'

                    if ((typeof node[key]['type'] === 'string') && (node[key]['type'] === 'valToImg')) {
                        // Image
                    } else {
                        if (typeof node[key]['type'] !== 'undefined') {
                            // The only 'type' allowed currently is 'valToImg'. Skip keys containing other 'type' values.
                            // console.log("Unsupported node[key]['type'] '" + (typeof node[key]['type']) + "'. See key: " + key);
                            continue;
                        }
                    }

                    const fullOverlayName = UTIL.addContextPrefix(overlayGroupName, key);
                    const e = this.getElemInfo(tag, overlayGroupName, key);
                    if (this.filterBy(overlayType, node[key], e.id, tag)
                        || this.filterBy(overlayType, node[key], fullOverlayName, tag)) {
                        elemList.push(e);
                    }
                }
            }
        }

        if (this.isDesignEnabled()) {
            OverlayPageComponent.writeOverlayDebugInfo(overlayGroupName, this.elemListToIdList(elemList), overlayType);
        }

        return elemList;
    }

    elemListToIdList(elemList: any): any {
        const idList = [];
        for (const e of elemList) {
            idList.push(e.id);
        }

        return idList;
    }

    getElement(arg: any) {
        return arg;
    }

    // ----------------------
    get_implemented_dyns_in_group(overlayGroupName: string): any {
        const elemList = this.getGroupMembers(OverlayType.ImplementedDyns, overlayGroupName, 'dyn');
        return elemList;
    }


    // ----------------------
    get_implemented_commands_in_group(overlayGroupName: string): any {
        const elemList = this.getGroupMembers(OverlayType.ImplementedCommands, overlayGroupName, 'command');

        if (!this.isArray(this._commandList[overlayGroupName])) {
            this._commandList[overlayGroupName] = [];
        }

        if (elemList.length !== this._commandList[overlayGroupName].length) {
            this._commandList[overlayGroupName] = UTIL.deepCopy(elemList);
        } else {
            for (let idx = 0; idx < elemList.length; ++idx) {
                if (!UTIL.elements_are_equal(this._commandList[overlayGroupName][idx], elemList[idx])) {
                    this._commandList[overlayGroupName][idx] = UTIL.deepCopy(elemList[idx]);
                }
            }
        }
        return this._commandList[overlayGroupName];
    }

    // ----------------------
    get_implemented_images_in_group(overlayGroupName: string): any {
        const elemList = this.getGroupMembers(OverlayType.ImplementedImages, overlayGroupName, 'img');

        if (!this.isArray(this._imageList[overlayGroupName])) {
            this._imageList[overlayGroupName] = [];
        }

        if (elemList.length !== this._imageList[overlayGroupName].length) {
            this._imageList[overlayGroupName] = UTIL.deepCopy(elemList);
        } else {
            for (let idx = 0; idx < elemList.length; ++idx) {
                if (!UTIL.elements_are_equal(this._imageList[overlayGroupName][idx], elemList[idx])) {
                    this._imageList[overlayGroupName][idx] = UTIL.deepCopy(elemList[idx]);
                }
            }
        }
        return this._imageList[overlayGroupName];

    }

    get_implemented_animations_in_group(overlayGroupName: string): any {
        const elemList = this.getGroupMembers(OverlayType.ImplementedAnimations, overlayGroupName, 'animation');

        if (!this.isArray(this._animationList[overlayGroupName])) {
            this._animationList[overlayGroupName] = [];
        }

        if (elemList.length !== this._animationList[overlayGroupName].length) {
            this._animationList[overlayGroupName] = UTIL.deepCopy(elemList);
        } else {
            for (let idx = 0; idx < elemList.length; ++idx) {
                if (!UTIL.elements_are_equal(this._animationList[overlayGroupName][idx], elemList[idx])) {
                    this._animationList[overlayGroupName][idx] = UTIL.deepCopy(elemList[idx]);
                }
            }
        }
        return this._animationList[overlayGroupName];

    }


    // ----------------------
    get_implemented_defined_table_in_group(overlayGroupName: string, tableName: string): any {
        const elemList = this.getGroupMembers(OverlayType.ImplementedDataTables, overlayGroupName, 'prop-def-table');
        for (const key of elemList) {
            if (key.name === tableName) {
                return key;
            }
        }
        return null;
    }


    // ----------------------
    getJsonElement(overlayGroupName: string, longName: string, tagName = 'dyn'): any {
        // Get a handle to the JSON element the var is based on

        if (!overlayGroupName || overlayGroupName === '') {
            console.warn(`Got element with missing overlayGroupName: ${overlayGroupName} longname: ${longName} tagname: ${tagName}`)
            return null;
        }
        if (!longName || longName === '') {
            console.warn(`Got element with missing longname overlayGroupName: ${overlayGroupName} longname: ${longName} tagname: ${tagName}`)
            return null;
        }
        const shortName = UTIL.removeContextPrefix(longName);
        return this.getJsonElement1(overlayGroupName, shortName, tagName);
    }

    getJsonElement1(overlayGroupName: string, shortName: string, tagName: string): any {

        let retObj = {'name': shortName, 'id': UTIL.addContextPrefix(overlayGroupName, shortName)};

        const e: any = (typeof this._DataSummary[overlayGroupName] === 'object')
            && (this._DataSummary[overlayGroupName][shortName]
                || this._DataSummary[overlayGroupName][tagName]);

        if (typeof e === 'object') {
            if (Array.isArray(e)) {
                for (let i = 0; i < e.length; i++) {
                    if (e[i]['name'] && e[i]['name'] === shortName) {
                        retObj = e[i];
                        break;
                    }
                }
            } else {
                for (const attr of Object.keys(e)) {
                    if (typeof retObj[attr] === 'undefined') {
                        retObj[attr] = e[attr];
                    }
                }
            }
        }

        if (typeof retObj['id'] === 'undefined') {
            retObj['id'] = UTIL.addContextPrefix(overlayGroupName, shortName);
        }
        return retObj;
    }

    splitPrefix(name: any) {
        const parts = UTIL.getContextPrefixParts(name);
        return parts.join('\n');
    }

    getElemInfo(tag: string, overlayGroupName: string, shortName: string): any {

        const j = this.getJsonElement(overlayGroupName, shortName, tag);

        const info = {
            'json': j,
            'label': '',
            'name': shortName,
            'id': UTIL.addContextPrefix(overlayGroupName, shortName),
            'commandLabel': '',
            'class': '',
            'value': '',
            'desc': UTIL.addContextPrefix(overlayGroupName, shortName),
            'command': ((typeof j['command'] === 'object') ? j['command'] : null)
        };

        if (typeof j['desc'] === 'string') {
            info.desc = info.desc + '\n  - ' + j['desc'];
        }

        if (tag === 'dyn') {
            if (j && (typeof j === 'object')) {
                info.label = ((typeof j['label'] === 'string') && j['label']) || '';
                info.value = ((typeof j['value'] === 'string') && j['value']) || '';
                info.class = ((typeof j['class'] === 'string') && j['class']) || '';

                if (typeof j['command'] === 'object') {
                    info.commandLabel = ((typeof j['command']['label'] === 'string') && j['command']['label']) || '';
                    info.command = {
                        'id': info.id + '_cmd',
                        'position': 'left',
                        'label': info.commandLabel,
                        'name': info.name
                    };
                }

            }
        } else if (tag === 'command') {
            if (j && (typeof j === 'object')) {
                info.label = ((typeof j['label'] === 'string') && j['label']) || '';
                info.value = ((typeof j['value'] === 'string') && j['value']) || '';
                info['disabled'] = false;


                info.commandLabel = ((typeof j['cmd'] === 'string') && j['cmd']) || '';
                info.command = Object.assign({}, j);
                info['_action'] = ((typeof j['_action'] === 'string') && j['_action']) || '';
                }
        } else if (tag === 'img') {
            info.class = ((typeof j['class'] === 'string') && j['class']) || '';
            info.value = ((typeof j['value'] === 'string') && j['value']) || '';
            info.desc = UTIL.addContextPrefix(overlayGroupName, shortName) + ' : ' + info.value;
            if (typeof j['desc'] === 'string') {
                info.desc = info.desc + '\n  - ' + j['desc'];
            }
        } else if (tag === 'animation') {
            info.class = ((typeof j['class'] === 'string') && j['class']) || '';
            if (typeof j['speed_rpm'] === 'string') {
                let speed_rpm: number;
                try { speed_rpm = parseInt(j['speed_rpm'], 10); } catch (e) { speed_rpm = 0; }

                if (speed_rpm < 1.0) {
                    info.class = info.class + ' stop_rotate';
                } else if (speed_rpm < 5.0) {
                    info.class = info.class + ' rotate_5rpm';
                } else if (speed_rpm < 10.0) {
                    info.class = info.class + ' rotate_10rpm';
                } else if (speed_rpm < 15.0) {
                    info.class = info.class + ' rotate_15rpm';
                } else if (speed_rpm < 20.0) {
                    info.class = info.class + ' rotate_20rpm';
                } else if (speed_rpm < 25.0) {
                    info.class = info.class + ' rotate_25rpm';
                } else if (speed_rpm < 30.0) {
                    info.class = info.class + ' rotate_30rpm';
                } else if (speed_rpm < 35.0) {
                    info.class = info.class + ' rotate_35rpm';
                } else if (speed_rpm < 40.0) {
                    info.class = info.class + ' rotate_40rpm';
                } else if (speed_rpm < 45.0) {
                    info.class = info.class + ' rotate_45rpm';
                } else if (speed_rpm < 50.0) {
                    info.class = info.class + ' rotate_50rpm';
                } else if (speed_rpm < 55.0) {
                    info.class = info.class + ' rotate_55rpm';
                } else if (speed_rpm < 60.0) {
                    info.class = info.class + ' rotate_60rpm';
                } else {
                    info.class = info.class + ' rotate_70rpm';
                }
            }
        } else if (tag === 'prop-def-table') {
            if (j && (typeof j === 'object')) {
                if (this.isArray(j['label'])) {
                    info.label = ((typeof j['label'][0]['value'] === 'string') && j['label'][0]['value']) || '';
                }
                info['disabled'] = false;
            }
        }

        return info;
    }

    hasCommandLabel(commandInfo: any): boolean {
        return (typeof commandInfo.json.commandLabel === 'string' && commandInfo.json.commandLabel !== '');
    }

    isArray(test_object: any): boolean {
        return Array.isArray(test_object);
    }

    formatValue(overlayGroupName: string, varName: string, isImplemented: boolean) {
        let css = '';
        if (isImplemented) {}
        try {
            const e = this.getJsonElement(overlayGroupName, varName);
            if (!e) {
                return '⦻';
            }

            const value = e.value || '';
            const units = e.units || '';
            if (units === 'bool') {
                return value;
            }

            /******************************************************************/
            /* Start of section lost with checkin on 9/10.2020 2:07 PM change
               Not sure if this code is needed, but without it, "if (fmt === '')"
               (used below this block) will always evaluate to true.
             */
            if (isImplemented) {
                css = this.getImpOverlayCssDef(varName);
                if (css.length > 0) {
                    let cmd = 'var e=document.getElementById("' + varName + '");' +
                        'var e_val=document.getElementById("' + varName + '_value");' +
                        'if (e) {e.style="' + css + '";}';

                    const val_css = this.getImpOverlayCssDef(varName + '_value');
                    if (val_css.length > 0) {
                        cmd += 'if (e_val) {e_val.style="' + val_css + '";}';
                    }
                    setTimeout(cmd, 5);
                }
            }
            /* End of section lost with checkin on 9/10.2020 2:07 PM change */
            /******************************************************************/

            const pat = css && (css.length > 0) && css.match(/--format:[ \t]*['"]([^']+)*['"]/);
            let fmt = (pat && pat.length === 2 && pat[1]) || '';

            if (fmt === '') {
                return value + (units ? (' ' + units) : '');
            }

            // This code handles the --format tag if defined in the css for this object.  Not test in purification implementation.

            let prefix = '';
            const arr: any = fmt.split(/:[ \t]*/);
            if (arr.length === 1) {
                fmt = arr[0];
            } else {
                prefix = arr[0] + ': ';
                fmt = arr[1];
            }

            if (value === '0') {
                return prefix + '0' + (units ? (' ' + units) : '');
            }

            const nDigits: string = fmt.replace(/%([0-9]+)d/, '$1');
            if (fmt === ('%' + nDigits + 'd')) {
                // simple %1d, %2d, etc.
                return prefix + parseFloat(value).toFixed(parseInt(nDigits, 10)) + (units ? (' ' + units) : '');
            } else {
                return prefix + value + (units ? (' ' + units) : '');
            }
        } catch (err) {
            console.error(err);
        }
        return '';
    }

    getImpOverlayCssDef(eName: string): string {
        let retVal = '';
        if (this._all_implemented_overlays && this._all_implemented_overlays[eName]) {
            retVal = this._all_implemented_overlays[eName].replace(/"/g, '\'');
        }
        return retVal;
    }

    getImgSrc(overlayGroupName: string, imgInfo: object): string {
        const varName = imgInfo['id'];
        let s = 'invalid-filename.png';
        let value = 'default';
        let fileType = 'png';
        let url = 'badURL';
        const shortName = UTIL.removeContextPrefix(varName);

        if (typeof this._uiTab === 'object'
            && typeof this._uiTab['overlayImageUrl'] === 'string'
            && typeof imgInfo['json']['value'] === 'string'
            && typeof imgInfo['json']['fileType'] === 'string') {

            value = imgInfo['json']['value'];
            fileType = imgInfo['json']['fileType'];
            url = this._uiTab['overlayImageUrl'];

            s = url.substring(0, url.lastIndexOf('/'))
                + '/' + shortName + '.' + value + '.' + fileType;
        }

        return s;
    }

    getAnimationSrc(overlayGroupName: string, imgInfo: object): string {
        const varName = imgInfo['id'];
        let s = 'invalid-filename.png';
        // const shortName = UTIL.removeContextPrefix(varName);

        if (typeof this._uiTab === 'object'
            && typeof this._uiTab['overlayImageUrl'] === 'string'
            && typeof imgInfo['json']['fileType'] === 'string'
            && typeof imgInfo['json']['class'] === 'string') {

            const url = this._uiTab['overlayImageUrl'];
            const baseName = imgInfo['json']['class'];
            const fileType = imgInfo['json']['fileType'];

            s = url.substring(0, url.lastIndexOf('/'))
                + '/' + baseName + '.' + fileType;
        }

        return s;
    }





    /**
     * For the 'Active Faults & Warnings' table
     */
    generateRowsForSmartTable(data: any): any {
        let _rows = [];

        // format row data for SmartTable to injest
        data?.json?.Fault?.forEach(fault => {
            // skip row if it is a fault for the wrong mod
            if (!fault.name.includes(this._uiTab.ModuleToShowInActiveFaultsTable)) { return; }
            _rows.push({
                "Time": fault.timestamp,
                "Type": fault.name,
                "Description": fault.value,
                "css_class": fault.class
            })
        });
        return _rows;
    }
}
