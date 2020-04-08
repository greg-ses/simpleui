/**
 * Created by jscarsdale on 6/8/16.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Optional } from '@angular/core';
import { CommandButtonChange, CommandButtonChangeService } from '../services/command-button-change.service';
import { UiObjList } from '../interfaces/ui-obj-list';
import { TabUI } from '../interfaces/props-data';
import { AppComponent } from '../app.component';
import { DataSetChangeService } from '../services/dataset-change.service';
import { Subscription } from 'rxjs';
import {UTIL} from '../../tools/utility';

@Component({
    selector: 'image-overlays',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./image-overlays.css'],
    templateUrl: './image-overlays.html',
    providers: [CommandButtonChangeService]
})

export class ImageOverlaysComponent {
    @Input() _uiObjList: UiObjList;
    @Input() _overlayImage: string;
    @Input() _groupName: string;
    @Input() _implementedOverlays: any;

    @Input() _implemented_dyns: any;
    @Input() _count_implemented_dyns_in_group: number;
    @Input() _un_implemented_dyns_in_group: any;

    @Input() _implemented_commands: any;
    @Input() _count_implemented_commands_in_group: number;
    @Input() _un_implemented_commands_in_group: any;

    @Input() _implemented_images: any;
    @Input() _count_implemented_images_in_group: number;
    @Input() _un_implemented_images_in_group: any;

    @Input() _implemented_data_tables: any;
    @Input() _count_implemented_data_tables_in_group: number;
    @Input() _un_implemented_data_tables_in_group: any;

    @Input() _uiTab: TabUI;
    @Input() _props: any;
    @Input() _logLevel: number;
    _updateCount = 0;
    imageSetChangeSubscription: Subscription;

    static evtToString(evt: any) {
        let s = 'evt dump. ';
        if ((typeof evt !== 'undefined') && (typeof evt.srcElement !== 'undefined') && typeof (evt.srcElement.tagName !== 'undefined')) {
            s += 'evt.srcElement.tagName: ' + evt.srcElement.tagName;
        } else {
            s += 'evt.srcElement.tagName: UnDefined';
        }

        if ((typeof evt !== 'undefined') && (typeof evt.target !== 'undefined') && typeof (evt.target.id !== 'undefined')) {
            s += 'evt.target.id: ' + evt.target.id;
        } else {
            s += 'evt.target.id: unDefined';
        }

        return s.replace('"', 'Q');
    }

    constructor(
        private commandButtonChangeService: CommandButtonChangeService,
        private imageSetChangeService: DataSetChangeService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Optional() public app: AppComponent
    ) {
        this.imageSetChangeSubscription = imageSetChangeService.changeAnnounced$.subscribe(
            dataChange => {
                if (   (dataChange.tabId === this._uiTab.id)
                    && (this._uiObjList.u_id === dataChange.updatedDataSet.u_id) ) {

                    this._updateCount++;

                    if (this._uiObjList.elements instanceof Object) {
                        for (const element of this._uiObjList.elements) {
                            if (element['command'] instanceof Object) {
                                const commandButtonChange = new CommandButtonChange(this._uiTab.id, element);
                                this.commandButtonChangeService.announceChange(commandButtonChange);
                            }
                        }
                    }

                    this._uiObjList = dataChange.updatedDataSet;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    getCommandList(list: any) {
        return list;
    }

    formatValue(varName: string, isImplemented: boolean) {
        if (!varName || varName === '') {
            return 'unnamed';
        }

        let v = '';
        let css = '';
        try {
            let e: any = (typeof this._uiObjList === 'object') ? this._uiObjList[varName] : null;
            if (!e) {
                let msg = '⦻';
                return msg;
            }

            const value = (typeof e.value === 'string' && e.value) || '' ;
            const units = (typeof e.units === 'string' && e.units) || '' ;

            if (isImplemented) {
                css = this.getImpOverlayCssDef(varName);
                if (css.length > 0) {
                    const cmd = 'var e=document.getElementById("' + varName + '"); if (e) {e.style="' + css + '";}';
                    setTimeout(cmd, 50);
                }
            }

            const pat = css && (css.length > 0) && css.match(/--format:[ \t]*['"]([^']+)*['"]/);
            let fmt = (pat && pat.length === 2 && pat[1]) || '';


            if (fmt === '') {
                return value  + ' ' + units;
            }

            let prefix = '';
            let arr: any = fmt.split(/:[ \t]*/);
            if (arr.length === 1) {
                fmt = arr[0];
            } else {
                prefix = arr[0] + ': ';
                fmt = arr[1];
            }

            if (value === '0') {
                return prefix + '0' + ' ' + units;
            }

            let nDigits: string = fmt.replace(/%([0-9]+)d/, '$1');
            if (fmt === ('%' + nDigits + 'd')) {
                // simple %1d, %2d, etc.
                return prefix + parseFloat(value).toFixed(parseInt(nDigits, 10)) + units;
            } else {
                return prefix + value + ' ' + units;
            }
        } catch (err) {
            console.log (err);
        }
        return v;
    }

    getSize() {
        let arr = this._uiObjList && Object.keys(this._uiObjList);
        let len = (arr && arr.length) || 0;
        return len;
    }

    getImplOverlayName(eName: string): string {
        let retVal = '';
        if (this._implementedOverlays && this._implementedOverlays[eName]) {
            retVal = eName;
        }
        return retVal;
    }

    getImpOverlayCssDef(eName: string): string {
        let retVal = '';
        if (this._implementedOverlays && this._implementedOverlays[eName]) {
            retVal = this._implementedOverlays[eName].replace(/"/g, '\'');
        }
        return retVal;
    }


    getImplOverlayImageCssDef(eName: string, eValue: string): string {
        let retVal = '';
        let cssKey = eName;
        if (eValue) {
            cssKey += '.' + eValue;
        }
        if (this._implementedOverlays && this._implementedOverlays[cssKey]) {
            retVal = this._implementedOverlays[cssKey];
        } else if (this._implementedOverlays && this._implementedOverlays[eName]) {
            retVal = this._implementedOverlays[eName];
        }

        return retVal;
    }

    isCommand(): boolean {
        // TODO: figure out real logic
        return false;
    }

    isDyn(): boolean {
        // TODO: figure out real logic
        return true;
    }

    isTable(): boolean {
        // TODO: figure out real logic
        return false;
    }

    getJsonElement(varName: string): any {
        // Get a handle to the JSON element the var is based on
        const varNameWithoutGroup = UTIL.removeContextPrefix(varName);

        let e: any = (typeof this._uiObjList === 'object')
            && (  this._uiObjList[varNameWithoutGroup]
                || this._uiObjList['dyn'] );

        if (e && Array.isArray(e)) {
            for (let i = 0; i < e.length; i++) {
                if (e[i]['name'] && e[i]['name'] === varNameWithoutGroup) {
                    e = e[i];
                    break;
                }
            }
        }

        return e;
    }

    getAttr(varName: string, attr: string) {
        if (!this._groupName || this._groupName === '') {
            return '';
        }

        if (!varName || varName === '') {
            return '';
        }

        if (!attr || attr === '') {
            return '';
        }

        let e = this.getJsonElement(varName);
        let attrVal = ( (typeof e === 'object') && (typeof e[attr] === 'string') && e[attr]) || '';

        return attrVal;
    }

    getImgSrc(varName: string): string {
        let nameWithoutGroup = varName;
        let fnValue = '';
        let fileType = '';
        let css = '';

        if (Object.keys(this._uiObjList).indexOf(nameWithoutGroup) !== -1) {
            fnValue = this._uiObjList[nameWithoutGroup].value || '';
            fileType = this._uiObjList[nameWithoutGroup]['fileType'];
        } else {
            nameWithoutGroup = UTIL.removeContextPrefix(nameWithoutGroup);

            if (Object.keys(this._uiObjList).indexOf(nameWithoutGroup) !== -1) {
                fnValue = this._uiObjList[nameWithoutGroup].value || '';
                fileType = this._uiObjList[nameWithoutGroup]['fileType'] || 'png';
                css = this.getImplOverlayImageCssDef(nameWithoutGroup, this._uiObjList[nameWithoutGroup].value);
            } else {
                if (Object.keys(this._uiObjList).indexOf('dyn') !== -1) {
                    if (Array.isArray(this._uiObjList['dyn'])) {
                        for (let i = 0; i < this._uiObjList['dyn'].length; i++) {
                            if (this._uiObjList['dyn'][i]['name'] === nameWithoutGroup) {
                                fnValue = this._uiObjList['dyn'][i]['value'] || '';
                                fileType = this._uiObjList['dyn'][i]['fileType'] || '';
                                break;
                            }
                        }
                    } else {
                        if (this._uiObjList['dyn']['name'] === nameWithoutGroup) {
                            fnValue = this._uiObjList['dyn']['value'] || '';
                            fileType = this._uiObjList['dyn']['fileType'] || '';
                        }
                    }
                }
            }
        }

        let s = this._uiTab
            && this._uiTab['overlayImageUrl']
            && this._uiTab['overlayImageUrl'].substring(0, this._uiTab['overlayImageUrl'].lastIndexOf('/'))
               + '/' + nameWithoutGroup + '.' + fnValue + '.' + fileType;

        // SideEffect - apply any pre-defined style for the image (primarily to allow size different than full-size)
        css = this.getImplOverlayImageCssDef(nameWithoutGroup, fnValue);
        if (css.length > 0) {
            let cmd = 'var e=document.getElementById("' + nameWithoutGroup + '"); if (e) {e.style="' + css + '";}';
            setTimeout(cmd, 100);
        }

        return s;
    }

    onDragStart(ev: any): any {
        if (this._logLevel) {
            const msg = ImageOverlaysComponent.evtToString(ev);
            setTimeout('console.log("' + msg + '");', 50);
        }
        if (ev.currentTarget.tagName === 'DIV') {
            ev.dataTransfer.setData('Text', ev.currentTarget.id);
            ev.target.style = 'width: 100px; background-color: green;';
        } else if (ev.currentTarget.tagName === 'IMG') {
            ev.dataTransfer.setData('Text', ev.currentTarget.id);
        }
        const moveLogger = document.getElementById('moveLogger');
        moveLogger.innerHTML = 'x:' + ev.pageX + 'px, y:' + ev.pageY + 'px';
        const rect = ev.currentTarget.getBoundingClientRect();

        const leftOffsetToMouse = Math.round((rect.left - ev.pageX) * 10) / 10;
        const topOffsetToMouse = Math.round((rect.top - ev.pageY) * 10) / 10;

        moveLogger['dragStartInfo'] = {
            'id': ev.currentTarget.id,
            'startX': ev.pageX,
            'startY': ev.pageY,
            'leftOffsetToMouse': leftOffsetToMouse,
            'topOffsetToMouse': topOffsetToMouse
        };

    }

}
