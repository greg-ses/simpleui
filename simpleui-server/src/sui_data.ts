import {ParamsDictionary, Request, Response} from 'express-serve-static-core';
import {JsonStringNormalizer} from './json-string-normalizer';
import {JsonOverlayNormalizer} from './json-overlay-normalizer';
import {Logger, LogLevel} from './server-logger';
import * as fastXmlParser from 'fast-xml-parser';
import * as he from 'he';
import {CommandArgs} from './interfaces';
import {ServerUtil} from './server-util';
import * as fs from 'fs';

import * as child_process from 'child_process';
import * as path from 'path';

const SIMPLE_TYPES = ['boolean', 'float', 'integer', 'string'];

export interface UiPropStubs {
    uiProp: string,
    tabIndex: string,
    hash: string,
    todayStub: string,
    yesterdayStub: string,
    microSec: string
}

export class SuiData {

// Subscribe to zmq publisher
    static zmq = require('zeromq');
    static ram_disk_folder = '/var/volatile/tmp/apache2';
    static requestNum = 0;
    static mockRequestNum = 0;
    static mockDataFileIndex = [];

    static propOrDefault(props: any, prop: string, defaultValue): any {
        let val = defaultValue;
        if (typeof props[prop] !== 'undefined') {
            val = props[prop];
        }
        return val;
    }

    static errorToXml5(statusCode, errorCode, errorMsg, errorContext, subElem = '') {
        return '' +
`<status value='${statusCode}'><error code='${errorCode}' context='${errorContext}'>
    <msg>
      ${errorMsg}
    </msg>
    ${subElem}
  </error>
</status>`;
    }

    static sendResponse(req: Request<ParamsDictionary>, res: Response, uiProps: any, xmlResponse: string) {
        if ((typeof req.query.xml === 'string')
            || (typeof req.query.XML === 'string')) {
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('charset', 'UTF-8');
            const xmlMetaPrefix = '<?xml version="1.0" encoding="UTF-8"?>';
            res.send(xmlMetaPrefix + xmlResponse);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('charset', 'UTF-8');
            let versionString = 'V.xxx';
            if (typeof req.query.version === 'string') {
                versionString = req.query.version;
            }
            let sJson = "";
            if (xmlResponse[0] === "{") {
                sJson = xmlResponse;
            } else {
                sJson = SuiData.xmlToJSON(xmlResponse, req.params.appName, uiProps, req);
            }
            res.send(sJson);
        }

    }

    static getCmdFromReq(req: Request<ParamsDictionary>): any {

        const cmd = {
            source: 'unknown',
            cmd: 'missing',
            valueName: (typeof req.params.zmqValue === 'string') ? req.params.zmqValue : ''
        };

        if (typeof req.query.cmd === 'string') {
            Logger.log(LogLevel.DEBUG, `typeof req.query.cmd === 'string'`);
            cmd.source = 'req.query.cmd';
            cmd.cmd = req.query.cmd;
        } else if (typeof req.params.overlay === 'string') {
            Logger.log(LogLevel.DEBUG, `typeof req.query.css_elements_to_json === 'string''`);
            cmd.source = 'req.query.css_elements_to_json';
            cmd.cmd = req.params.overlay;
        } else {
            Logger.log(LogLevel.DEBUG, `else (cmd.source = 'req.params.zmqCmd'`);
            cmd.source = 'req.params.zmqCmd';
            cmd.cmd = req.params.zmqCmd;
        }
        return cmd;
    }

    static getZmqPort(req: Request<ParamsDictionary>) {
        let zmqPort = 0;
        try {
            if (typeof req.params.zmqPortExpr === 'string') {
                const arr = req.params.zmqPortExpr.split('+');
                if (arr.length === 1) {
                    zmqPort = parseInt(req.params.zmqPortExpr, 10);
                } else {
                    arr.forEach(part => {
                        zmqPort += parseInt(part, 10);
                    });
                }
            }
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Error in getPortFromRequest(): ${err}`);
        }

        return zmqPort;
    }

    static incrRequestNum() { SuiData.requestNum = (SuiData.requestNum + 1) % 100000; }

    // from sui_data.php:  zmqRequest($props, $DataPortPrefix, $cmd, $valueName, $expectedResponseRoot, "get");
    static async suiDataRequest(req: Request<ParamsDictionary>, res: Response, uiProps: any) {
        // req contains:  /:appName/:propsStub/:tabName/query/cmd/zmq/:zmqPortExpr/:zmqCmd/:zmqValue
        // if the req.query contains

        SuiData.incrRequestNum();

        if (!uiProps) {
            Logger.log(LogLevel.ERROR, 'No response is defined for the root folder "/".');
            return;
        }

        const cmd = SuiData.getCmdFromReq(req);
        ServerUtil.logRequestDetails(LogLevel.DEBUG, req,
            `Starting data request # ${SuiData.requestNum}`,
            'suiDataRequest', '/query/data/zmq', cmd);


        /*
        if (SuiData.propOrDefault(uiProps, `${tab.dataServiceEnabled}`, 1) === 0) {
            Logger.log(LogLevel.INFO, `Service is disabled for ${tab.tabName}`);
            const errorXml = `<Data_Summary>${SuiData.errorToXml('1005', 'suiRequest')}</Data_Summary>`;
            response.send(errorXml);
        } else */ {
            Logger.log(LogLevel.DEBUG, `Getting properties data.`);
            const timeout = SuiData.propOrDefault(uiProps, 'zmqTimeout', 1000);
            const zmqDataRequester = SuiData.zmq.socket('req');
            zmqDataRequester.connect_timeout = timeout;

            // Register async callbacks:

            // Callback invoked after zmqDataRequester.send() completes
            zmqDataRequester.on('message', function (reply) {
                const zmqResponse = SuiData.addXmlStatus(reply.toString());
                zmqDataRequester.close();
                SuiData.sendResponse(req, res, uiProps, zmqResponse);

                Logger.log((SuiData.requestNum <= 5) ? LogLevel.INFO : LogLevel.DEBUG,
                    `Request #${SuiData.requestNum} - zmqResponse: ` +
                    `${zmqResponse.substr(0, 105).replace(/[ \t]*\n[ \t]*/g, '')}...`);
                return;
            });

            // Callback invoked after zmqDataRequester gets an error
            zmqDataRequester.on('error', function (zmqErr) {
                const zmqResponse = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', zmqErr);
                SuiData.sendResponse(req, res, uiProps, zmqResponse);
                Logger.log(LogLevel.WARNING,
                    `Request #${SuiData.requestNum} - suiDataRequest(): ${zmqResponse}`);
                zmqDataRequester.close();
                return;
            });

            // Synchronous processing that occurs PRIOR TO the callbacks above
            zmqDataRequester.connect(`tcp://svcmachineapps:${SuiData.getZmqPort(req)}`);
            const xmlDataRequestForZmq = `<request COMMAND="${cmd.cmd}" valueName="${cmd.valueName}"/>`;
            Logger.log(LogLevel.DEBUG, `Send Request: ${xmlDataRequestForZmq}`);
            Logger.log(LogLevel.DEBUG, `Port number of request: ${SuiData.getZmqPort(req)}`);
            zmqDataRequester.send(xmlDataRequestForZmq);

            // Callback invoked after SIGINT
            process.on('SIGINT', function () {
                const zmqResponse = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', 'SIGINT');
                SuiData.sendResponse(req, res, uiProps, zmqResponse);
                Logger.log(LogLevel.WARNING,
                    `Request #${SuiData.requestNum} - suiDataRequest() received SIGINT: ` + zmqResponse);
                zmqDataRequester.close();
            });
        }
        return;
    }

    static createXmlResponse() {
        return 'not yet implemented';
    }

    static createJSONResponse() {
        return 'not yet implemented';
    }

    static async suiCommandRequest(req: Request<ParamsDictionary>, res: Response, uiProps) {
        SuiData.incrRequestNum();

        if (!uiProps) {
            Logger.log(LogLevel.ERROR, 'No response is defined for the root folder "/".');
            return;
        }

        const cmd = SuiData.getCmdFromReq(req);
        ServerUtil.logRequestDetails(LogLevel.DEBUG, req,
            `Starting cmd request # ${SuiData.requestNum}`,
            'suiCommandRequest', '/query/cmd/zmq', cmd);

        if (uiProps && (typeof uiProps['dependsOnApp'] === 'string') ) {
            const processInfo = {};
            await ServerUtil.getProcessInfo(uiProps['dependsOnApp'], processInfo);
        }

        /* if (SuiData.propOrDefault(uiProps, `${tab.dataServiceEnabled}`, 1) === 0) {
            Logger.log(LogLevel.INFO, `Service is disabled for ${tab.tabName}`);
            const errorXml = `<Data_Summary>${SuiData.errorToXml("1005", "suiRequest")}</Data_Summary>`;
            res.send(errorXml);
        } else */ {

            const parsedReq = {cmd: `${req.params.zmqCmd}`};
            let xmlCmdRequestForZmq = '';
            const contentType = SuiData.getContentType(req);

            if (req.method === 'POST') {
                if (contentType === 'application/xml') {
                    // header('Content-Type: application/xml; charset=UTF-8');

                    try {
                        Logger.log(LogLevel.DEBUG, 'Getting XML stream from req.body \n');
                        // xmlCmdRequestForZmq = file_get_contents('php://input');
                        xmlCmdRequestForZmq = req.body;
                    } catch (e) {
                        Logger.log(LogLevel.ERROR, `Exception while building XML request: ${e}`);
                    }

                } else if (contentType === 'application/x-www-form-urlencoded') {
                    Logger.log(LogLevel.VERBOSE, 'Incoming CONTENT_TYPE is application/x-www-form-urlencoded\n');

                    try {
                        // header('Content-Type: application/json; charset=UTF-8');
                        // echo '{'document':{'body': 'This is a response'}}\n';

                        xmlCmdRequestForZmq = SuiData.getXmlFromUrlArgs(req, req.params.zmqCmd);
                        Logger.log(LogLevel.VERBOSE,
                            `${SuiData.ram_disk_folder}/my-apache-log.txt. Xml Command: ${xmlCmdRequestForZmq.toString()}`);
                    } catch (e) {
                        Logger.log(LogLevel.VERBOSE, `Exception while building JSON request: ${e}`);
                    }

                } else if ((contentType === 'json') || (contentType === 'application/json')) {
                    Logger.log(LogLevel.VERBOSE, 'Incoming CONTENT_TYPE is ${contentType}\n');

                    try {
                        // header('Content-Type: application/json; charset=UTF-8');
                        // echo '{'document':{'body': 'This is a response'}}\n';
                        xmlCmdRequestForZmq = SuiData.getXmlFromJsonArgs(req, parsedReq);
                        Logger.log(LogLevel.VERBOSE, `Xml Command:\n ${xmlCmdRequestForZmq.toString()}`);
                    } catch (e) {
                        Logger.log(LogLevel.VERBOSE, `Exception while building JSON request: '  ${e}`);
                    }
                } else if (contentType === 'unknown') {
                    // Look for a file as input.
                    Logger.log(LogLevel.VERBOSE, `requestMethod for contentType === "unknown" is not yet implemented\n`);
                    /*
                    SuiData_statusValue = 1;
                    SuiData_statusMsg = '
                    options = getopt('f:');
                    xmlCmdRequestForZmq = file_get_contents(options['f']);
                    //xmlCmdRequestForZmq = file_get_contents('./test_stream.xml');  Greg - Start here, at least it appears to get through.
                    */
                    return;
                } else {
                    Logger.log(LogLevel.VERBOSE, `requestMethod for contentType === "${contentType}" is not yet implemented\n`);
                    /*
                    SuiData_statusValue = 2;
                    // ClientLogger.log(LOG_INFO, 'Unexpected content type in request');
                    // msg = sprintf('Unexpected content type in request: %s\n', requestMethod);
                    Logger.log(LogLevel.VERBOSE, msg);
                    */
                    return;
                }
            }

            Logger.log(LogLevel.INFO, `suiCommandRequest(): App "${req.params.appName}" received command "${parsedReq.cmd}" ` +
                `for tab ${req.params.tabName} - forwarding to ZMQ.`);
            Logger.log(LogLevel.VERBOSE, `contentType: ${contentType}, request.method: ${req.method}, contentType: ${contentType}`);
            const zmqCmdRequester = SuiData.zmq.socket('req');

            // Callback invoked after zmqCmdRequester.send() completes
            zmqCmdRequester.on('message', function (reply) {
                const zmqResponse = SuiData.addXmlStatus(reply.toString());
                zmqCmdRequester.close();
                SuiData.sendResponse(req, res, uiProps, zmqResponse);

                Logger.log((SuiData.requestNum <= 5) ? LogLevel.INFO : LogLevel.DEBUG,
                    `Request #${SuiData.requestNum} - zmqResponse: ` +
                    `${zmqResponse.substr(0, 105).replace(/[ \t]*\n[ \t]*/g, '')}...`);
                return;
                // process.exit(0);
            });

            zmqCmdRequester.connect(`tcp://svcmachineapps:${SuiData.getZmqPort(req)}`);
            Logger.log(LogLevel.VERBOSE, `Send Request: ${xmlCmdRequestForZmq}`);
            zmqCmdRequester.send(xmlCmdRequestForZmq);

            process.on('SIGINT', function () {
                zmqCmdRequester.close();
            });
        }
        return;
    }

    static async suiCssToJsonRequest(req: Request<ParamsDictionary>, res: Response, uiProps: any) {
        // req contains:  /:appName/:propsStub/:tabName/query/css_elements_to_json/overlay/:nthOverlay

        SuiData.incrRequestNum();

        if (!uiProps) {
            Logger.log(LogLevel.ERROR, 'No response is defined for the root folder "/".');
            return;
        }

        const cmd = SuiData.getCmdFromReq(req);
        ServerUtil.logRequestDetails(LogLevel.DEBUG, req,
            `Starting css_elements_to_json request # ${SuiData.requestNum}`,
            'suiCssToJsonRequest', '/query/css_elements_to_json', cmd);

        Logger.log(LogLevel.DEBUG, `Converting css to json.`);
        const css_file = `/var/www/${req.params.appName}/overlay-${req.params.nthOverlay}/image-overlays.css`;
        const response = SuiData.cssToJson(css_file);
        SuiData.sendResponse(req, res, uiProps, response);

        return;
    }

    static addXmlStatus(xmlString): string {
        // Inject a status if the XML didn't contain one.
        let tagNames = "(Data_Summary|Overlay_Summary)";
        let endTagRegExp = new RegExp(`<\/${tagNames}>`);
        let endTagContainingStatusRegExp = new RegExp(`\<status\>[0-9]+\<\/status\>\n*\<\/${tagNames}\>`);
        const matches = xmlString.match(endTagContainingStatusRegExp);
        if (!matches) {
            xmlString = xmlString.replace(
                endTagRegExp,
                '<status>0</status></$1>');
        }
        return xmlString
    }

    static getContentType(req): string {
        let contentType = 'unknown';
        if (req.accepts(['json', 'text'])) {
            contentType = 'json';
        } else {
            ['html', 'text/html', 'application/json'].forEach(ct => {
                if (req.accepts(ct)) {
                    contentType = ct;
                }
            });
        }
        return contentType;
    }

    static getItemTag(listName)
    {
        // Create an itemTag from $listName that strips the trailing 's' if it exists,
        // or appends '_item' if the trailing 's' does NOT exist
        let itemTag = `${listName}_item}`;
        const len = listName.length;
        if (len > 1) {
            const end = len - 1;
            if (listName.substr(end, 1) === 's') {
                itemTag = listName.substr(0, len - 1);
            }
        }

        return itemTag;
    }

    static removeNestedTrivialCmd(xml)
    {
        const cmdNameMatches = xml.match(/<request[ \t]+COMMAND=\"([^"]+)\"/);
        if (cmdNameMatches) {
            const trivialCmdMatches = xml.match(/\<cmd[ \t]+name=\"([a-zA-Z0-9_]+)\"><\/cmd>/);
            if (trivialCmdMatches && (trivialCmdMatches[1] === cmdNameMatches[1])) {
                xml = xml.replace(trivialCmdMatches[0], '');
            }
        }
        return xml;
    }

    static jsonToXml(json, docRoot, extraDocRootAttrs = '', depth = 0)
    {
        let xml = `<${docRoot} ${extraDocRootAttrs} `;
        try {
            let childrenXml = '';
            Logger.log(LogLevel.VERBOSE, '\n');

            if (json instanceof Object) {
                for (const key of Object.keys(json)) {
                    if (json.hasOwnProperty(key)) {
                        let value = json[key];

                        let displayKey = key;
                        if ( SIMPLE_TYPES.indexOf(typeof key) === -1) {
                            displayKey = '[KEY]';
                        }

                        let displayValue = value;
                        if ( SIMPLE_TYPES.indexOf(typeof value) === -1) {
                            displayValue = '[VALUE]';
                        }

                        const msg = `depth: ${depth}, key: ${displayKey}, value: ${displayValue}`;
                        Logger.log(LogLevel.VERBOSE, msg);

                        if (json[key] instanceof Array) {
                            let itemTag = SuiData.getItemTag(key);
                            for (const item of value) {
                                childrenXml += SuiData.jsonToXml(item, itemTag, '', depth + 1);
                            }
                        }
                        else if (json[key] instanceof Object)
                        {
                            childrenXml += SuiData.jsonToXml(value, key, '', depth + 1);
                        } else {
                            if (['cmd', 'sha1sum'].indexOf(key) === -1) {
                                if (typeof value === 'string') { value = value.trim(); }
                                xml += ` ${key}="${value.toString()}"`;
                            }
                        }
                    }
                }
            }
            xml += `>${childrenXml}</${docRoot}>`;

            if (depth === 0) {
                // Remove trivial embedded command with same name as 'cmd' attribute
                xml = SuiData.removeNestedTrivialCmd(xml);
            }
        } catch (e) {
            Logger.log(LogLevel.ERROR, `Exception in jsonToXml(): '  ${e}`);
        }

        return xml;
    }

    static merge_singleton_cmd(json_params) {
        if ( typeof json_params['cmd'] !== 'undefined') {
            let innerCmd = null;
            if (json_params['cmd'] instanceof Object) {
                innerCmd = json_params['cmd'];
                json_params['cmd'] = null;
            } else if ((json_params['cmd'] instanceof Array) && (json_params['cmd'].length === 1)) {
                innerCmd = json_params['cmd'][0];
                json_params['cmd'] = null;
            } else {
                return json_params;
            }

            // Walk cmd and merge all attributes to the parent
            if (innerCmd instanceof Object) {
                for (const key of Object.keys(innerCmd)) {
                    const value = innerCmd[key];
                    if ( typeof json_params[key] === 'undefined' ) {
                        json_params[key] = value;
                    }
                }
            }

            // Add "cmd" attribute as a string
            if (typeof json_params['name'] === 'string') {
                json_params['cmd'] = json_params['name'];
            }
        }
        return json_params;
    }

    static getXmlFromJsonArgs(req: Request<ParamsDictionary>, parsedReq) {
        //Logger.log(LogLevel.VERBOSE, '\n==> Inside getXmlFromJsonArgs()\n');

        if (req.body == null) {
            Logger.log(LogLevel.VERBOSE, 'req.body IS NULL\n');
            return '{}';
        } else {
            Logger.log(LogLevel.VERBOSE, `req.body is NOT null, type: %s', ${typeof req.body}`);
        }

        const json_params = SuiData.merge_singleton_cmd(req.body);
        json_params['commandName'] = 'unknown_command_name';
        if (json_params['cmd'] instanceof Object) {
            if (typeof json_params['cmd']['name'] === 'string') {
                json_params['commandName'] = json_params['cmd']['name'];
            }
        } else if (typeof json_params['cmd'] === 'string') {
            json_params['commandName'] = json_params['cmd'];
        }

        Logger.log(LogLevel.VERBOSE, `commandName: ${json_params['commandName']}`);

        const extraDocRootAttrs = `COMMAND="${json_params['commandName']}" cmd="${json_params['commandName']}"`;
        let xmlOut = SuiData.jsonToXml(json_params, 'request', extraDocRootAttrs);
        xmlOut = xmlOut.replace('_input', 'value');

        parsedReq.cmd = json_params['commandName'];
        Logger.log(LogLevel.VERBOSE, `output xml for command "${json_params['commandName']}": ${xmlOut}`);

        return xmlOut;
    }

    static getXmlFromUrlArgs(req: Request<ParamsDictionary>, tab): string
    {
        let cmd =
            (typeof tab.commandCmd === 'string')
                ? tab.commandCmd
                : tab.dataCmd;

        if (typeof req.query.cmd === 'string') {
            cmd = req.query.cmd;
        }

        let attributes = '';

        if (typeof req.query !== 'object') {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    if (key === 'cmd') {
                        cmd = req.query.cmd;
                    } else {
                        attributes += ` "${key}"="${req.query[key]}"`;
                    }
                }
            });
        }

        const xml = `<request COMMAND="{{cmd}}" ${attributes}}></request>`;
        Logger.log(LogLevel.VERBOSE, `SuiData.getXmlFromUrlArgs() - xml: ${xml}\n`);
        return xml;
    }



    static getUiPropStubs(props: any, req: Request<ParamsDictionary>): UiPropStubs {

        const retVal = {
            uiProp: 'ui',
            tabIndex: '0',
            hash: '00000',
            todayStub: 'YYYY-MM-01',
            yesterdayStub: 'YYYY-MM-00',
            microSec: '00.00000000'
        };

        // uiProp
        const matchedStr = req.path.match(/\/device\/vec\/data\/([^\/]+)\//);
        if (matchedStr) {
            retVal.uiProp = matchedStr[1];
        }

        if (typeof req.query.ti === 'string') {
            retVal.tabIndex = req.query.ti;
        }

        if (typeof req.query.hash === 'string') {
            retVal.hash = req.query.hash;
        }

        try {
            const d = new Date();
            const yesterdayMs = d.getTime() - (24 * 60 * 60 * 1000);
            retVal.todayStub = ServerUtil.formatDate(d);
            retVal.yesterdayStub = ServerUtil.formatDate(new Date(yesterdayMs));
        } catch (Exception) {
            retVal.todayStub = 'YYYY-MM-01';
            retVal.yesterdayStub = 'YYYY-MM-00';
        }

        retVal.microSec = SuiData.getMicroSecs();

        return retVal;
    }

    static getMicroSecs() {
        let microSec = '00.00000000';

        try {
            const microtime = require('microtime');
            const mt = microtime.nowStruct();
            microSec = `${mt[0].toString().substr(8, 2)}.${mt[1]}00`;
        } catch (e) {
            Logger.log(LogLevel.INFO, `Error in getMicroSecs(): ${e}`);
        }
        return microSec;
    }

    static getApacheTempFolder() {

        let apacheTempFolder = '/var/volatile/tmp/apache2/';

        if (!fs.statSync(apacheTempFolder).isDirectory()) {
            apacheTempFolder = '/tmp/';
        }

        return apacheTempFolder;
    }

    // +
    static getDebugFileNames(appName, props, req: Request<ParamsDictionary>) {

        const st = SuiData.getUiPropStubs(props, req);
        const ramDrive = SuiData.getApacheTempFolder();

        const debugFileNames = {
            xml_in_file: `${ramDrive}${appName}.${st.uiProp}.${st.tabIndex}.${st.hash}.${st.microSec}.in.xml`,
            json_initial_file: `${ramDrive}${appName}.${st.uiProp}.${st.tabIndex}.${st.hash}.${st.microSec}.initial.json`,
            json_normal_file: `${ramDrive}${appName}.${st.uiProp}.${st.tabIndex}.${st.hash}.${st.microSec}.normal.json`
        };

        return debugFileNames;
    }

    static execute_getPhpJsonShim(appName: string, filenames: any) {
        // Execute a php script to call the XMLDiffTool::  getPhpJsonShim passing
        //   xml_send_file
        //   json_receive_file

        // Read and rewrite temp_data_in_file_name
        const phpCommand = '/usr/bin/php' ;
        const phpArgs =
            [
                filenames.xml_to_json_php,
                appName,  filenames.xml_send_file,
                filenames.json_receive_file,
                'keepTempFile'
            ];
        const retObj = child_process.spawnSync(phpCommand, phpArgs);

        let retVal = 0;
        if (retObj.signal) {
            Logger.log(LogLevel.ERROR, `PHP child command failed due to signal ${retObj.signal}.`)
            retVal = 2;
        } else {
            retVal = retObj.status;
        }

        if (retVal !== 0) {
            Logger.log(LogLevel.ERROR, `PHP child command failed with return status ${retVal}.`)
        }

        return retVal;
    }

        static replacer(match, p1, p2, p3, offset, string) {
            return `${p2.trim()}",`;
        }

    static cleanUpOutgoingJson(sJson: string) {
    // strip trailing spaces and newlines

        /*

        const valueRegEx = /("value":\W*"([^"])*)",/;
        while (true) {
            let matches = sJson.match(valueRegEx);
            if (matches) {
                sJson = sJson.replace(matches[0], `${matches[1].trim()}",`);
            } else {
                break;
        }
        */

        const valueRegEx = /("value":\W*"([^"])*)",/;
        sJson = sJson.replace(valueRegEx, SuiData.replacer);
        return sJson;
    }

    static readJsonFile(jsonFile) {
        if (!fs.statSync(jsonFile).isFile()) {
            const msg = 'ERROR: Input json file does not exist: ' + jsonFile;
            Logger.log(LogLevel.ERROR, msg);
            return msg;
        }

        const sJson = fs.readFileSync(jsonFile, 'utf8');
        if (sJson === '') {
            const msg = 'ERROR: empty result reading ' + jsonFile;
            Logger.log(LogLevel.ERROR, msg);
            return msg;
        }

        return JSON.parse(sJson);
    }

    static cssToJson(filepath: string) {
        let json = '{\n  "CSS_Elements": {\n';
        let delim = '\n';
        const elemNameRegEx = /[ \t]*#([0-9a-zA-Z.≪≫_-]+)[ \t]*\{[ \t]*([^\}]*)[ \t]*\}/;

        try {
            const css = fs.readFileSync(filepath, 'utf-8');
            for (let line of css.split('\n')) {
                if (line !== "") {
                    let matches = line.match(elemNameRegEx)
                    if (matches) {
                        json += `${delim}    "${matches[1]}": "${matches[2]}"`;
                        delim = ',\n';
                    }
                }
            }
            json += '  }\n}\n';
        } catch(error) {
            Logger.log(LogLevel.ERROR, `Error parsing incoming .css: ${error.message}`);
            json = '{\n  "CSS_Elements": { }\n}';
        }
        return json;
    }

    static xmlToJSON(xmlString: string, appName: string, props: any, req: Request<ParamsDictionary>) {
        let json = '{"error": "Something bad happened inside xmlToJSON."}';

        if (xmlString[0] !== '<') {
            xmlString = xmlString.trim();
        }

        // console.log('SuiData.xmlToJSON - 2\n\$xmlString: ' . substr($xmlString, 0, 50) . '\n');
        const options = {
            attributeNamePrefix : '',
            attrNodeName: '', // default is 'false'
            textNodeName : 'value',
            ignoreAttributes : false,
            ignoreNameSpace : false,
            allowBooleanAttributes : false,
            parseNodeValue : false,
            parseAttributeValue : false,
            trimValues: true,
            cdataTagName: '__cdata', // default is 'false'
            cdataPositionChar: '\\c',
            localeRange: '', // To support non english character in tag/attribute values.
            parseTrueNumberOnly: false,
            arrayMode: false, // 'strict'
            attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}), // default is a=>a
            tagValueProcessor : (val, tagName) => he.decode(val), // default is a=>a
            stopNodes: ['parse-me-as-string']
        };

        try {
            json = fastXmlParser.parse(xmlString, options, true);
        } catch(error) {
            Logger.log(LogLevel.ERROR, `Error parsing incoming XML: ${error.message}`);
        }

        let docRootName = Object.keys(json)[0]; // should this have some type of error handling?
        Logger.log(LogLevel.DEBUG, `sui_data.ts docRootName: ${docRootName}`);

        if (!docRootName) {
            docRootName = 'error';
        }

        const keepIntermediateFile = req.query.keepTempFile;
        let debugFileNames = {xml_in_file: '', json_initial_file: '', json_normal_file: ''};
        if (keepIntermediateFile) {
            debugFileNames = SuiData.getDebugFileNames(appName, props, req);
            Logger.log(LogLevel.INFO, 'keepIntermediateFile: true - keeping intermediate files');
            fs.writeFileSync(debugFileNames.xml_in_file, xmlString);
            fs.writeFileSync(debugFileNames.json_initial_file, JSON.stringify(json));
        }

        if (docRootName === 'Data_Summary') {
            JsonStringNormalizer.normalizeJSON(json, props);
        } else if (docRootName === 'Overlay_Summary') {
            JsonOverlayNormalizer.normalizeJSON(json, props);
        } 
        //else if (docRootName === 'error') {}
        else {
            json = `{ '${docRootName}': ${json} }`; 
        }

        const sJson = JSON.stringify(json);

        if (keepIntermediateFile) {
            fs.writeFileSync(debugFileNames.json_normal_file, sJson);
        }

        return sJson;
    }
    static mockSuiRequest(cmdArgs: CommandArgs, props: any, req: any = null, res: Response = null)
    {
        if (!props) {
            return 'No response is defined for the root folder "/".';
        }

        if (typeof SuiData.mockDataFileIndex[cmdArgs.xmlInFile] === 'undefined'){
            SuiData.mockDataFileIndex[cmdArgs.xmlInFile] = 0;
        } else {
            SuiData.mockDataFileIndex[cmdArgs.xmlInFile] = (SuiData.mockDataFileIndex[cmdArgs.xmlInFile] + 1) % req.query.versions;
        }

        const xmlInFile = cmdArgs.xmlInFile.replace('.0.', `.${SuiData.mockDataFileIndex[cmdArgs.xmlInFile]}.`);
        const xmlFileExists = fs.existsSync(xmlInFile);
        Logger.log(LogLevel.DEBUG, `\n ==>  mockCmdVars.xmlInFile (in mockSuiRequest, exists ${xmlFileExists}): '${xmlInFile}'\n`);
        ServerUtil.logRequestDetails(LogLevel.DEBUG, req,
            `Starting MOCK request # ${++SuiData.mockRequestNum}`,
            'suiMockRequest', '/mock/data?file=', xmlInFile);


        let xmlString = fs.readFileSync(xmlInFile, { 'encoding': 'utf8', 'flag': 'r'} );
        if (xmlString === '') {
            const msg = 'ERROR: empty result reading ' + xmlInFile;
            Logger.log(LogLevel.ERROR, msg);
            return msg;
        }

        xmlString = SuiData.addXmlStatus(xmlString);

        // let versionString = "V.xxx";

        // let req = new Request<ParamsDictionary>();
        let theReq = req;
        if (theReq === null) {
            theReq = {
                path: `${xmlInFile}`,
                query: {
                    keepTempFile: false,
                    ti: {},
                    hash: {}
                },
            };
        }

        const sJson = SuiData.xmlToJSON(xmlString, cmdArgs.appName, props, <Request<ParamsDictionary>>theReq);

        let jsonOutFile = "";


        if (typeof cmdArgs.jsonOutFile !== 'undefined' && cmdArgs.jsonOutFile !== "") {
            // Use the indexed version
            jsonOutFile = cmdArgs.jsonOutFile;
        } else {
            // No or empty jsonOutFile: follow keepTempFile instruction if passed
            if (theReq.query.keepTempFile) {
                // Use the temp file as the output file
                SuiData.mockDataFileIndex[cmdArgs.xmlInFile] = 0;
                jsonOutFile =
                    `${SuiData.ram_disk_folder}`
                    + path.basename(`${xmlInFile}`).replace(/\.xml$/, '.json');

                try {
                    fs.writeFileSync(jsonOutFile, sJson);
                    Logger.log(LogLevel.DEBUG, `Created test output file: ${jsonOutFile}.`);
                } catch (err) {
                    Logger.log(LogLevel.ERROR, `Couldn't create output file due to error | jsonOutFile = ${jsonOutFile === '' ? 'empty string' : jsonOutFile}`);
                }
            }


        }

        if (res) {
            res.send(sJson);
        }
        return;
    }
}
