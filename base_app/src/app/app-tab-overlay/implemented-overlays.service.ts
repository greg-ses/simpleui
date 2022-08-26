/*
* Created by jscarsdale on 5/13/16.
 *
 *
 * Get XML data stream from the server and convert to JSON.
 *
 */


import {throwError as observableThrowError,  Observable } from 'rxjs';
import {Injectable, Optional} from '@angular/core';

import { CSSPairList } from '../interfaces/css-pair-list';
import {ajax} from 'rxjs/ajax';
import {AppComponent} from '../app.component';

@Injectable()
export class ImplementedOverlaysService {

    _overlays: any;
    private _nthOverlay = 1;

    constructor (
        @Optional() public app: AppComponent
    ) {     }

    /** GET Overlays from the server */
    getOverlays (): Observable<CSSPairList> {
        const appDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const ajaxRequest = {
            url: appDir +  'php/css_elements_to_json.php?nthOverlay=' + this._nthOverlay++,
            withCredentials: true,
            crossDomain: true,
            timeout: 5001
        };
        const data$ = ajax(ajaxRequest);
        data$.subscribe(res => {
            if (res.status === 200) {
                return (this.onDataUpdate(res.response.props));
            } else {
                console.log(`Error ${res.status} fetching data in getOverlays()`);
            }
        });

        /*
        return this.http.get<CSSPairList>(url)
            .map(this.initData)
            .catch(this.handleError);
        */
        return null;
    }

    private onDataUpdate(response: CSSPairList): CSSPairList {
        this._overlays = response;

        return this._overlays;
    }

    private handleError(error: any) {
        const errMsg = error.message || 'Server error';
        console.log(`getOverlays failed: ${errMsg}`);
        return observableThrowError(errMsg);
    }
}
