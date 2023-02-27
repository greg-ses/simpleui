/**
 * Created by jscarsdale on 5/13/16.
 *
 *
 * Post an XML command to the web server, returning JSON.
 *
 */


import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ajax } from 'rxjs/internal-compatibility';
import {TabUI} from '../interfaces/props-data';



@Injectable()
export class CommandService {
    _response: string;
    _tabId = '';
    _commandServiceProps: any = null;
    _responseHandler = (caller = this, response = '{Default Response') => {console.log(response); };
    _errorResponseHandler = function(caller = this, response: any) {
        let msg = 'Error on ajax.post()';
        if ( (typeof response === 'object') && (typeof response.status === 'string') ) {
            msg += `{response.status}`;
        }
        console.log(msg);
    };

    static commandCounter = 0;

    constructor (private http: HttpClient) { }

    formParamsToString(formParams: any): string {
        const formBody = [];
        for (const property in formParams) {
            if (['_input', 'value'].indexOf(property) > -1) {
                let innerValue = '';
                let delimiter = '';
                for (const key in formParams['value']) {
                    if (formParams['value'].hasOwnProperty(key)) {
                        const encodedInnerKey = encodeURIComponent(key);
                        const encodedInnerValue = encodeURIComponent(formParams[key]);
                        innerValue += delimiter + encodedInnerKey + '=' + encodedInnerValue;
                        delimiter = ', ';
                    }
                }
                formBody.push('value = {' +  innerValue + '}');
            } else {
                // property is not '_input' or 'value'
                const encodedKey = encodeURIComponent(property);
                const encodedValue = encodeURIComponent(formParams[property]);
                formBody.push(encodedKey + '=' + encodedValue);
            }
        }
        return formBody.join('&');
    }

    sendCommand(uiTab: TabUI, jsonToPost: any,
                caller: any,
                responseHandler: any,
                errorResponseHandler: any,
                commandServiceProps: any): void {

        this._responseHandler = responseHandler;
        this._errorResponseHandler = errorResponseHandler;

        this._tabId = uiTab.id;
        this._commandServiceProps = commandServiceProps;
        jsonToPost['counter'] = ++CommandService.commandCounter;
        const body = JSON.stringify(jsonToPost);

        const data$ = ajax.post(uiTab['commandUrl'], body, { 'Content-Type': 'application/json' });
        data$.subscribe(res => {
            if (res.status === 200) {
                this._responseHandler(caller, res.response.props);
            } else {
                this._errorResponseHandler(caller, res.response.props);
            }
        });
    }

    sendMockCommand(uiTab: TabUI, jsonToPost: any,
        caller: any,
        responseHandler: any,
        errorResponseHandler: any,
        commandServiceProps: any): void {

        this._responseHandler = responseHandler;
        this._errorResponseHandler = errorResponseHandler;

        this._tabId = uiTab.id;
        this._commandServiceProps = commandServiceProps;
        jsonToPost['counter'] = ++CommandService.commandCounter;
        const body = JSON.stringify(jsonToPost);

        const URL = 'http://localhost:4100' + uiTab['commandUrl'];

        const data$ = ajax.post(URL, body, { 'Content-Type': 'application/json' });
        data$.subscribe(res => {
            if (res.status === 200) {
                this._responseHandler(caller, res.response.props);
            } else {
                this._errorResponseHandler(caller, res.response.props);
            }
        });
    }


    private onPostResponse(dataSummary: string) {
        this._response = dataSummary;
        return this._response;
    }

    private handleError(errMsg: string) {
        const errTitle = 'Invalid Command Response';

        let appTitleBar: any = document.getElementsByTagName('app-title-bar');
        appTitleBar = appTitleBar && appTitleBar[0];
        const errorPopup = appTitleBar
                         && appTitleBar['PROPS'] && appTitleBar['PROPS']['GLOBAL']
                         && appTitleBar['PROPS']['GLOBAL']['error-popup']['tab-1'];

        if (errorPopup && errorPopup['show']) {
            errorPopup['show'](errTitle, errMsg);
        }

        return observableThrowError(errMsg);
    }
}
