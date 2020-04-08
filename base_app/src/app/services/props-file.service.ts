/*
* Created by jscarsdale on 5/13/16.
 *
 *
 * Get XML data stream from the server and convert to JSON.
 *
 */


import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { of } from 'rxjs/observable/of';
// import { map } from 'rxjs/operators';
// import { XmlToJsonConverter } from '../../tools/xml-to-json-converter';

import { AppProperties } from '../interfaces/props-data';
import {ajax} from 'rxjs/ajax';

@Injectable()
export class PropsFileService {
    _props: any = null;

    private static normalizePropToArray(props: any, propName: string): any {
        // Normalize this._props[propName] so that it's always an
        // array of 0 or more elements.
        if (typeof props[propName] === 'object') {
            if (Array.isArray(props[propName])) {
                // Nothing to do
                return;
            } else {
                props[propName] = [ props[propName] ];
            }
        } else {
            props[propName] = [];
        }
    }

    constructor (private http: HttpClient) { }

    getProps (): Observable<AppProperties> {
        const appDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const ajaxRequest = {
            url: appDir + 'php/get_props_file.php?JSON',
            withCredentials: true,
            crossDomain: true,
            timeout: 5001
        };

        const propsData$ = ajax(ajaxRequest);
        propsData$.subscribe(res => {
            if (res.status === 200) {
                return (this.onDataUpdate(res.response.props));
            } else {
                console.log('Error in ');
            }
        });

        /*
        return this.http.get<AppProperties>(url)
            .map(this.initProps)
            .catch(this.handleError)
        ;
        */

        return null;
    }

    private onDataUpdate(propsIn: AppProperties): AppProperties {
        console.log('initProps.1');

        if (   typeof propsIn === 'object'
            && typeof propsIn['props'] === 'object'
            && typeof propsIn['props']['tab'] === 'object') {

            console.log('initProps.2');
            this._props = propsIn['props'];

            console.log('initProps.3');
            PropsFileService.normalizePropToArray(this._props, 'tab');

            console.log('initProps.4');
            PropsFileService.normalizePropToArray(this._props, 'appLink');
        }

        return this._props;
    }

    private handleError(error: any) {
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console
        return observableThrowError(errMsg);
    }
}
