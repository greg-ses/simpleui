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
import { XmlToJsonConverter } from '../../tools/xml-to-json-converter';
import {ajax} from 'rxjs/ajax';

@Injectable()
export class CssUpdateService {
    _response: string;

    constructor (private http: HttpClient) { }

    sendUpdate(nthOverlay: number, cssOperation: string, cssRecord: string, cssValueRecord: string): Observable<string> {
        const appDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const ajaxRequest = {
            url: appDir + 'php/update_css_file.php' +
                '?nth-overlay=' + nthOverlay +
                '&' + cssOperation + '=' + encodeURIComponent(cssRecord) +
                '&value-css=' + encodeURIComponent(cssValueRecord),
            withCredentials: true,
            crossDomain: true,
            timeout: 5001
        };
        const propsData$ = ajax(ajaxRequest);
        propsData$.subscribe(res => {
            if (res.status === 200) {
                return (this.extractResponse(res));
            } else {
                console.log('Error in CssUpdateService.sendUpdate()');
            }
        },
        err => {
            console.log(`Error in CssUpdateService.sendUpdate() ajax subscribe callback.`);
            try {
                console.log('  name: ' + err.name + ', message: ' + err.message + ', url: ' + err.request.url);
            } catch (err1) { }
        });

        /*
        return this.http.get<string>(url)
            .map(this.extractResponse)
            .catch(this.handleError);
        */

        return null;
    }

    private extractResponse(res: any) {
        const xmlConverter = new XmlToJsonConverter();

        const jsonText = xmlConverter.xml2json(res, '  ');
        this._response = JSON.stringify(jsonText);
        return this._response;
    }
}
