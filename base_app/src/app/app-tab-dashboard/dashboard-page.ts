import {ChangeDetectionStrategy, Component, Directive, EventEmitter, Input, Optional, Output} from '@angular/core';
import {DataSummary} from '../interfaces/data-summary';
import {ClientLogger} from '../../tools/logger';
import {DashboardType} from './dashboard-type';
import {SiteIndex} from '../interfaces/site-index';
// import { CssUpdateService } from '../services/css-update-service';
import {AppComponent} from '../app.component';
import {UTIL} from '../../tools/utility';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dashboard-page',
    changeDetection: ChangeDetectionStrategy.Default,
    styleUrls: ['./app-tab-dashboard.component.css'],
    templateUrl: './dashboard-page.html'
})

// The common page layout with id tags for js
export class DashboardPageComponent {
    @Input() _DataSummary: DataSummary;
    @Input() _siteIndex: SiteIndex;
    @Input() _ticks: any;
    @Input() _props: any;
    @Input() _uiTab: any;
    @Input() _imageDashboardGroupNames: any;
    @Input() _cmdBarNames: any;
    @Input() _dataTableNames: any;
    @Input() _all_implemented_dashboards: any;
    @Input() _logLevel = 0;

    @Output() onToggleAutoRefresh = new EventEmitter<boolean>();

    _autoRefreshLabel = 'Pause Auto Refresh';

    _commandList = [];
    _imageList = [];
    _animationList = [];

    TODO__hide_graphs_and_data = false;

    static writeDashboardDebugInfo(dashboardGroupName: string, idList: any, dashboardType: DashboardType): void {
        const implKey = DashboardType[DashboardType[dashboardType]] || 'Unimplemented';

        if (typeof window['dashboards'] === 'undefined') {
            window['dashboards'] = {};
        }

        if (typeof window['dashboards'][implKey] === 'undefined') {
            window['dashboards'][implKey] = {};
        }

        if (typeof window['dashboards'][implKey][dashboardGroupName] === 'undefined') {
            window['dashboards'][implKey][dashboardGroupName] = [];
        }

        let o: any = null;
        for (o of idList) {
            if (typeof window['dashboards'][implKey][dashboardGroupName][o] === 'undefined') {
                const cmd = 'window["dashboards"]["' + implKey + '"]["' + dashboardGroupName + '"]["' + o + '"]' +
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
    ) {
    }


    // _dataRefreshed: boolean = (typeof this._DataSummary.DerivedSummary === 'UiObjList') &&
    //          (this._DataSummary.DerivedSummary.elements.length > 0);
    //

    isDesignEnabled(): boolean {
        return (this.app._props && this.app._props['mode'] && this.app._props['mode'] === 'design');
    }

    getMode(): string {
        const retVal = (this.app._props && this.app._props['mode']) || '';
        return retVal;
    }

    toggleAutoRefresh() {
        if (this._autoRefreshLabel === 'Pause Auto Refresh') {
            this._autoRefreshLabel = 'Resume Auto Refresh';
        } else {
            this._autoRefreshLabel = 'Pause Auto Refresh';
        }
        this.onToggleAutoRefresh.emit(this._autoRefreshLabel === 'Pause Auto Refresh');
    }

    showQuickLinks(): boolean {
        let retVal = false;

        if (typeof this._DataSummary === 'object'
            && typeof this._DataSummary.Access === 'object'
            && typeof this._DataSummary.Access.value === 'string') {
            if (this._DataSummary.Access.value > 2 || !this.TODO__hide_graphs_and_data) {
                retVal = true;
            }
        }
        return retVal;
    }

    isImplemented(eName: string): boolean {
        return (this._all_implemented_dashboards && this._all_implemented_dashboards[eName]);
    }

    filterBy(dashboardType: DashboardType, dashboardNode: any, fullDashboardName: string, tag: string): boolean {

        if (this.isImplemented(fullDashboardName)) {
            if ((dashboardType === DashboardType.ImplementedDyns) && (tag === 'dyn')) {
                return true;
            }
            if ((dashboardType === DashboardType.ImplementedImages) && (tag === 'img')) {
                return true;
            }
            if ((dashboardType === DashboardType.ImplementedAnimations) && (tag === 'animation')) {
                return true;
            }
            if ((dashboardType === DashboardType.ImplementedCommands) && (tag === 'command')) {
                return true;
            }
            if ((dashboardType === DashboardType.ImplementedDataTables) && (tag === 'prop-def-table')) {
                return true;
            }
        } else {
            if ((dashboardType === DashboardType.UnImplementedDyns) && (tag === 'dyn')) {
                return true;
            }
            if ((dashboardType === DashboardType.UnImplementedImages) && (tag === 'img')) {
                return true;
            }
            if ((dashboardType === DashboardType.UnImplementedAnimations) && (tag === 'animation')) {
                return true;
            }
            if ((dashboardType === DashboardType.UnImplementedCommands) && (tag === 'command')) {
                return true;
            }
            if ((dashboardType === DashboardType.UnImplementedDataTables) && (tag === 'prop-def-table')) {
                return true;
            }
        }

        return false;
    }

    getGroupMembers(dashboardType: DashboardType, dashboardGroupName: string, tag: string): any {
        // tag is an element of ['dyn', 'command', 'img', 'table']
        const node = this._DataSummary[dashboardGroupName];
        const elemList = [];
        if (node && typeof node !== 'undefined') {
            for (const key of Object.keys(node)) {
                if (key === tag) {
                    if (Array.isArray(node[key])) {
                        for (let i = 0; i < node[key].length; i++) {
                            if (typeof node[key][i]['name'] === 'string') {
                                // to uncode fullDashboardName, use .replace(/≪[^≫]*≫/, '')
                                const fullDashboardName = UTIL.addContextPrefix(dashboardGroupName, node[key][i]['name']);
                                const e = this.getElemInfo(tag, dashboardGroupName, node[key][i]['name']);
                                if (this.filterBy(dashboardType, node[key][i], e.id, tag)
                                    || this.filterBy(dashboardType, node[key][i], fullDashboardName, tag)) {
                                    elemList.push(e);
                                }
                            }
                        }
                    } else {
                        const fullDashboardName = UTIL.addContextPrefix(dashboardGroupName, node[key]['name']);
                        const e = this.getElemInfo(tag, dashboardGroupName, node[key]['name']);
                        if (this.filterBy(dashboardType, node[key], e.id, tag)
                            || this.filterBy(dashboardType, node[key], fullDashboardName, tag)) {
                            elemList.push(e);
                        }
                    }
                } else if (['dyn', 'command', 'img', 'animation', 'label', 'table', 'u_id', 'value'].indexOf(key) === -1) {

                    // todo: find out what this else acuatlly does!!!  Might be "dead" code
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

                    const fullDashboardName = UTIL.addContextPrefix(dashboardGroupName, key);
                    let e = this.getElemInfo(tag, dashboardGroupName, key);
                    if (this.filterBy(dashboardType, node[key], e.id, tag)
                        || this.filterBy(dashboardType, node[key], fullDashboardName, tag)) {
                        elemList.push(e);
                    }
                }
            }
        }

        if (this.isDesignEnabled()) {
            DashboardPageComponent.writeDashboardDebugInfo(dashboardGroupName, this.elemListToIdList(elemList), dashboardType);
        }

        // ClientLogger.log('LogDashboardList', 'getGroupMemberIds (' + dashboardType + ", " + Object.keys(elemList).length + ') for group "'
        //     + dashboardGroupName + '": [' + idList + ']');

        return elemList;
    }

    getTableColumnHeaders(tableIdStr: string) {
        let colHeaders = [];
        colHeaders[0] = 'Time';
        colHeaders[1] = 'Type';
        colHeaders[2] = 'Description';
        return colHeaders;
    }

    elemListToIdList(elemList: any): any {
        let idList = [];
        for (let e of elemList) {
            idList.push(e.id);
        }

        return idList;
    }

    getLabelId(arg: any) {
        if (arg instanceof Object) {
            if ((arg.command instanceof Object)
                && (typeof arg.command.id === 'string')) {

                return arg.command.id + '_label';
            } else if (typeof arg.id === 'string') {
                return arg.id + '_label';
            }
        }
        return 'ill-formed-label';
    }

    getElement(arg: any) {
        return arg;
    }

    // ----------------------
    get_implemented_dyns_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.ImplementedDyns, dashboardGroupName, 'dyn');
        // ClientLogger.log('LogDashboardList', 'ImplementedDashboardElementIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }

    get_un_implemented_dyns_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.UnImplementedDyns, dashboardGroupName, 'dyn');
        // ClientLogger.log('LogDashboardList', 'UnImplementedDashboardElementIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }

    elements_are_equal(deep: number, el1: any, el2: any): boolean {
        for (const key of Object.keys(el1)) {
            if (typeof el1[key] === 'object' && typeof el2[key] === 'object') {
                if ((deep > 4)
                    || (!this.elements_are_equal(deep + 1, el1[key], el2[key]))) {
                    return false;
                }
            } else if (el1[key] !== el2[key]) {
                return false;
            }
        }
        return true;
    }

    // ----------------------
    get_implemented_commands_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.ImplementedCommands, dashboardGroupName, 'command');

        // ClientLogger.log('LogDashboardList_commands', 'ImplementedCommands (' + Object.keys(elemList).length + ') for group "'
        //     + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');

        if (!this.isArray(this._commandList[dashboardGroupName])) {
            this._commandList[dashboardGroupName] = [];
        }

        if (elemList.length !== this._commandList[dashboardGroupName].length) {
            this._commandList[dashboardGroupName] = UTIL.deepCopy(elemList);
        } else {
            for (let idx = 0; idx < elemList.length; ++idx) {
                if (!this.elements_are_equal(0, this._commandList[dashboardGroupName][idx], elemList[idx])) {
                    this._commandList[dashboardGroupName][idx] = UTIL.deepCopy(elemList[idx]);
                }
            }
        }
        return this._commandList[dashboardGroupName];
    }

    get_un_implemented_commands_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.UnImplementedCommands, dashboardGroupName, 'command');
        ClientLogger.log('LogDashboardList_commands', 'UnImplementedCommands (' + Object.keys(elemList).length + ') for group "'
            + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }

    // ----------------------
    get_implemented_images_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.ImplementedImages, dashboardGroupName, 'img');
        // ClientLogger.log('LogDashboardList', 'ImplementedDataTableIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');

        if (!this.isArray(this._imageList[dashboardGroupName])) {
            this._imageList[dashboardGroupName] = [];
        }

        if (elemList.length !== this._imageList[dashboardGroupName].length) {
            this._imageList[dashboardGroupName] = UTIL.deepCopy(elemList);
        } else {
            for (let idx = 0; idx < elemList.length; ++idx) {
                if (!this.elements_are_equal(0, this._imageList[dashboardGroupName][idx], elemList[idx])) {
                    this._imageList[dashboardGroupName][idx] = UTIL.deepCopy(elemList[idx]);
                }
            }
        }
        return this._imageList[dashboardGroupName];

    }

    get_un_implemented_images_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.UnImplementedImages, dashboardGroupName, 'img');
        // ClientLogger.log('LogDashboardList', 'UnImplementedDashboardImageIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }

    get_implemented_animations_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.ImplementedAnimations, dashboardGroupName, 'animation');
        // ClientLogger.log('LogDashboardList', 'ImplementedDataTableIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');

        if (!this.isArray(this._animationList[dashboardGroupName])) {
            this._animationList[dashboardGroupName] = [];
        }

        if (elemList.length !== this._animationList[dashboardGroupName].length) {
            this._animationList[dashboardGroupName] = UTIL.deepCopy(elemList);
        } else {
            for (let idx = 0; idx < elemList.length; ++idx) {
                if (!this.elements_are_equal(0, this._animationList[dashboardGroupName][idx], elemList[idx])) {
                    this._animationList[dashboardGroupName][idx] = UTIL.deepCopy(elemList[idx]);
                }
            }
        }
        return this._animationList[dashboardGroupName];

    }

    get_un_implemented_animations_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.UnImplementedAnimations, dashboardGroupName, 'animation');
        // ClientLogger.log('LogDashboardList', 'UnImplementedDashboardImageIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }


    // ----------------------
    get_implemented_defined_table_in_group(dashboardGroupName: string, tableName: string): any {
        const elemList = this.getGroupMembers(DashboardType.ImplementedDataTables, dashboardGroupName, 'prop-def-table');
        // ClientLogger.log('LogDashboardList', 'ImplementedDashboardDataTableIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        for (const key of elemList) {
            if (key.name === tableName) {
                return key;
            }
        }
        return null;
    }


    // ----------------------
    get_implemented_prop_defined_tables_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.ImplementedDataTables, dashboardGroupName, 'prop-def-table');
        // ClientLogger.log('LogDashboardList', 'ImplementedDashboardDataTableIDs (' + Object.keys(elemList).length + ') for group "'
        //    + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }

    get_un_implemented_prop_defined_tables_in_group(dashboardGroupName: string): any {
        const elemList = this.getGroupMembers(DashboardType.UnImplementedDataTables, dashboardGroupName, 'prop-def-table');
        // ClientLogger.log('LogDashboardList', 'UnImplementedDashboardDataTableIDs (' + Object.keys(elemList).length + ') for group "'
        //     + dashboardGroupName + '": [' + this.elemListToIdList(elemList) + ']');
        return elemList;
    }


    // ----------------------
    getJsonElement(dashboardGroupName: string, longName: string, tagName = 'dyn'): any {
        // Get a handle to the JSON element the var is based on

        if (!dashboardGroupName || dashboardGroupName === '') {
            ClientLogger.log('LogDashboardList_JSON',
                'Missing Element: dashboardGroupName: ' + dashboardGroupName
                + ', longName: ' + longName
                + ', tagName: '
                + tagName);
            return null;
        }

        if (!longName || longName === '') {
            ClientLogger.log('LogDashboardList_JSON',
                'Missing Element: dashboardGroupName: ' + dashboardGroupName
                + ', longName: ' + longName
                + ', tagName: '
                + tagName);
            return null;
        }

        const shortName = UTIL.removeContextPrefix(longName);
        ClientLogger.log('LogDashboardList_JSON',
            'Found Element: dashboardGroupName: ' + dashboardGroupName
            + ', longName: ' + longName
            + ', shortName: ' + shortName
            + ', tagName: '
            + tagName);

        return this.getJsonElement1(dashboardGroupName, shortName, tagName);
    }

    getJsonElement1(dashboardGroupName: string, shortName: string, tagName: string): any {

        let retObj = {'name': shortName, 'id': UTIL.addContextPrefix(dashboardGroupName, shortName)};

        let e: any = (typeof this._DataSummary[dashboardGroupName] === 'object')
            && (this._DataSummary[dashboardGroupName][shortName]
                || this._DataSummary[dashboardGroupName][tagName]);

        if (typeof e === 'object') {
            if (Array.isArray(e)) {
                for (let i = 0; i < e.length; i++) {
                    if (e[i]['name'] && e[i]['name'] === shortName) {
                        retObj = e[i];
                        break;
                    }
                }
            } else {
                for (let attr of Object.keys(e)) {
                    if (typeof retObj[attr] === 'undefined') {
                        retObj[attr] = e[attr];
                    }
                }
            }
        }

        if (typeof retObj['id'] === 'undefined') {
            retObj['id'] = UTIL.addContextPrefix(dashboardGroupName, shortName);
        }

        ClientLogger.log('LogDashboardList_JSON',
            'In getJsonElement1: '
            + 'o.id: ' + (typeof retObj.id === 'string') ? retObj.id : 'unknown'
            + ', o.command: '
            + (typeof retObj['command'] === 'string')
                ? retObj['command']
                : (typeof retObj['command'] === 'object')
                    ? '(object)'
                    : 'unknown'
                    + ', o.label: ' + (typeof retObj['label'] === 'string') ? retObj['label'] : 'unknown'
                    + ', o.Name: ' + (typeof retObj.name === 'string') ? retObj.name : 'value'
                        + tagName);

        return retObj;
    }

    getLabel(dashboardGroupName: string, varName: string, defaultLabel = '') {
        let e = this.getJsonElement(dashboardGroupName, varName);
        if (!e) {
            return '';
        }

        let label = ((typeof e === 'object') && (typeof e['label'] === 'string') && e['label']) || defaultLabel;

        return label;
    }

    splitPrefix(name: any) {
        const parts = UTIL.getContextPrefixParts(name);
        return parts.join('\n');
    }

    getElemInfo(tag: string, dashboardGroupName: string, shortName: string): any {

        let j = this.getJsonElement(dashboardGroupName, shortName, tag);
        let info = {
            'json': j,
            'label': '',
            'name': shortName,
            'id': UTIL.addContextPrefix(dashboardGroupName, shortName),
            'commandLabel': '',
            'class': '',
            'value': '',
            'desc': UTIL.addContextPrefix(dashboardGroupName, shortName),
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
                info.command = j;
                info['_action'] = ((typeof j['_action'] === 'string') && j['_action']) || '';
                }
        } else if (tag === 'img') {
            info.class = ((typeof j['class'] === 'string') && j['class']) || '';
            info.value = ((typeof j['value'] === 'string') && j['value']) || '';
            info.desc = UTIL.addContextPrefix(dashboardGroupName, shortName) + ' : ' + info.value;
            if (typeof j['desc'] === 'string') {
                info.desc = info.desc + '\n  - ' + j['desc'];
            }
        } else if (tag === 'animation') {
            info.class = ((typeof j['class'] === 'string') && j['class']) || '';
            if (typeof j['speed_rpm'] === 'string') {
                let speed_rpm = 0;
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

    hasCommandLabel(commandInfo: any) {
        return (typeof commandInfo.json.commandLabel === 'string' && commandInfo.json.commandLabel !== '');
    }

    isArray(test_object: any) {
        return Array.isArray(test_object);
    }

    formatValue(dashboardGroupName: string, varName: string, isImplemented: boolean) {
        let v = '';
        let css = '';
        try {
            const e = this.getJsonElement(dashboardGroupName, varName);
            if (!e) {
                return '⦻';
            }

            const value = e.value || '';
            const units = e.units || '';
            if (units === 'bool') {
                return value;
            }

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
            console.log(err);
        }
        return v;
    }

    getImpDashboardCssDef(eName: string): string {
        let retVal = '';
        if (this._all_implemented_dashboards && this._all_implemented_dashboards[eName]) {
            retVal = this._all_implemented_dashboards[eName].replace(/"/g, '\'');
        }
        return retVal;
    }

    getImplDashboardImageCssDef(eName: string, eValue: string): string {
        let retVal = '';
        let cssKey = eName;
        if (eValue) {
            cssKey = UTIL.addContextPrefix(cssKey, eValue);
        }
        if (this._all_implemented_dashboards && this._all_implemented_dashboards[cssKey]) {
            retVal = this._all_implemented_dashboards[cssKey];
        } else if (this._all_implemented_dashboards && this._all_implemented_dashboards[eName]) {
            retVal = this._all_implemented_dashboards[eName];
        }

        return retVal;
    }

    getImgLabel(dashboardGroupName: string, varName: string): string {
        const shortName = UTIL.removeContextPrefix(varName);

        return (typeof this._DataSummary === 'object'
            && typeof this._DataSummary[dashboardGroupName] === 'object'
            && typeof this._DataSummary[dashboardGroupName][shortName] === 'object'
            && typeof this._DataSummary[dashboardGroupName][shortName].value === 'string'
            && this._DataSummary[dashboardGroupName][shortName].value) || '';
    }

    getImgSrc(dashboardGroupName: string, imgInfo: object): string {
        const varName = imgInfo['id'];
        let s = 'invalid-filename.png';
        let value = 'default';
        let fileType = 'png';
        let url = 'badURL';
        const shortName = UTIL.removeContextPrefix(varName);

        if (typeof this._uiTab === 'object'
            && typeof this._uiTab['dashboardImageUrl'] === 'string'
            && typeof imgInfo['json']['value'] === 'string'
            && typeof imgInfo['json']['fileType'] === 'string') {

            value = imgInfo['json']['value'];
            fileType = imgInfo['json']['fileType'];
            url = this._uiTab['dashboardImageUrl'];

            s = url.substring(0, url.lastIndexOf('/'))
                + '/' + shortName + '.' + value + '.' + fileType;
        }

        return s;
    }

    getAnimationSrc(dashboardGroupName: string, imgInfo: object): string {
        const varName = imgInfo['id'];
        let s = 'invalid-filename.png';
        const shortName = UTIL.removeContextPrefix(varName);

        if (typeof this._uiTab === 'object'
            && typeof this._uiTab['dashboardImageUrl'] === 'string'
            && typeof imgInfo['json']['fileType'] === 'string'
            && typeof imgInfo['json']['class'] === 'string') {

            const url = this._uiTab['dashboardImageUrl'];
            const baseName = imgInfo['json']['class'];
            const fileType = imgInfo['json']['fileType'];

            s = url.substring(0, url.lastIndexOf('/'))
                + '/' + baseName + '.' + fileType;
        }

        return s;
    }

    showHideInstructions() {
        let e = document.getElementById('dnd-toggle');
        let instructions = document.getElementById('movedElementInfo');
        if (e && e.innerHTML === '►') {
            e.innerHTML = '▼';
            instructions.style.display = 'block';
        } else {
            e.innerHTML = '►';
            instructions.style.display = 'none';
        }
    }
}
