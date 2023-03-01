import {ParamsDictionary, Request, Response} from 'express-serve-static-core';
import {JsonStringNormalizer} from './json-string-normalizer';
import {JsonOverlayNormalizer} from './json-overlay-normalizer';
import {Logger, LogLevel} from './server-logger';
import {CommandArgs} from './interfaces';
import {ServerUtil} from './server-util';
import { SimpleUIServer } from './simpleui-server';
import { ZMQ_Socket_Wrapper, zmq_wrapper } from './sui_zmq';
import * as fs from 'fs';
import * as path from 'path';
import * as fastXmlParser from 'fast-xml-parser';
import * as he from 'he';


export interface UiPropStubs {
    uiProp: string,
    tabIndex: string,
    hash: string,
    todayStub: string,
    yesterdayStub: string,
    microSec: string
}


export class SuiData {
    static ram_disk_folder = '/var/volatile/tmp/apache2';
    static requestNum = 0;
    static mockRequestNum = 0;
    static mockDataFileIndex = [];
    static uiProps = "";
    static open_zmq_connections = 0;




    static propOrDefault(props: Object, prop: string, defaultValue: any): any {
        return props[prop] ? props[prop] : defaultValue;
    }



    /**
     * Parses the Overlay_Summary object to extract all the image and
     * animation file names
     * @param data the Overlay_Summary object
     * @returns
     */
    static getImageLinksFromOverlaySummary(data: object): string[] {
        data = data['Overlay_Summary'];
        const groupnames = Object.keys(data);
        let groups_with_images = [];
        let all_image_links = [];

        // get every group with a image or animation
        groupnames.forEach( (group, indx) => {
            let group_data = data[group];
            if (Object.keys(group_data).includes("img") || Object.keys(group_data).includes("animation")) {
                groups_with_images.push(group);
            }
        });


        // build a list of all the image / animation file names
        groups_with_images.forEach( (val, _) => {
            let current = data[val];
            if (current?.img) {
              for (let indx = 0; indx < current.img.length; indx++) {
                const name =  current.img[indx].name;
                const classname = current.img[indx].class;
                const filetype = current.img[indx].fileType;
                const filename = `${name}.${classname}.${filetype}`;
                all_image_links.push(filename)
              }
            }
            else {
              for (let indx = 0; indx < current.animation.length; indx++) {
                const name =  current.animation[indx].name;
                const classname = current.animation[indx].class;
                const filetype = current.animation[indx].fileType;
                const filename = `${name}.${classname}.${filetype}`;
                all_image_links.push(filename)
              }
            }
          });

        return all_image_links;

    }


    /**
     * Iterates through the image files in the zmq response to
     * find broken images
     * @returns array of broken filenames. [] if none
     */
    static checkForBrokenOverlayFiles(data: string): string[] {
        let json = JSON.parse(data);
        let all_file_names = SuiData.getImageLinksFromOverlaySummary(json);
        const broken_links = ServerUtil.getArrayDifference(all_file_names, SimpleUIServer.overlay_image_file_names);
        return broken_links;
    }

    /**
     * Responds to the request base_app sent. Also, adds headers to the request
     * depending on filetype.
     * @param req
     * @param res
     * @param uiProps
     * @param xmlResponse data to send to base_app
    */
    static sendResponse(req: Request<ParamsDictionary>, res: Response, xmlResponse: string) {
        try {

            if (res.headersSent) { return }

            if (req.query.xml == "" || req.query.XML == "") {
                res.setHeader('Content-Type', 'application/xml');
                res.setHeader('charset', 'UTF-8');
                const xmlMetaPrefix = '<?xml version="1.0" encoding="UTF-8"?>';
                res.send(xmlMetaPrefix + xmlResponse);
                return;
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('charset', 'UTF-8');
                let versionString: any = 'V.xxx';
                if (req.query.version) {
                    versionString = req.query.version;
                }
                let sJson = "";
                if (xmlResponse[0] === "{") {
                    sJson = xmlResponse;
                } else {
                    sJson = SuiData.xmlToJSON(xmlResponse, req.params.appName, SuiData.uiProps, req);
                }
                // if sJson is for an overlay, check the imgs to see if any are missing
                if (sJson.substring(0, 20).includes("Overlay_Summary")) {
                    const broken_links = SuiData.checkForBrokenOverlayFiles(sJson);
                    if (broken_links) {
                        SimpleUIServer.missing_overlay_files = new Set();
                        broken_links.forEach( item => SimpleUIServer.missing_overlay_files.add(item) );
                        const json = JSON.parse(sJson);
                        json['Overlay_Summary'].missing_overlay_files = Array.from(SimpleUIServer.missing_overlay_files);
                        sJson = JSON.stringify(json);
                    }
                }
                res.send(sJson);
            }
        } catch (err) {
            Logger.log(LogLevel.ERROR, `SendResponse got error: ${err}`)
        }
    }

    /**
     * Parses the command from the request from base_app
     * @param req request from base_app
     * @returns
     */
    static getZmqCmdFromReq(req: Request<ParamsDictionary>): any {
        const cmd = {
            source: 'unknown',
            cmd: 'missing',
            valueName: (typeof req.params.zmqValue === 'string') ? req.params.zmqValue : ''
        };
        if (typeof req.query.cmd === 'string') {
            cmd.source = 'req.query.cmd';
            cmd.cmd = req.query.cmd;
        } else if (typeof req.params.overlay === 'string') {
            cmd.source = 'req.params.overlay';
            cmd.cmd = req.params.overlay;
        } else {
            cmd.source = 'req.params.zmqCmd';
            cmd.cmd = req.params.zmqCmd;
        }
        return cmd;
    }

    /**
     * Parses the zmq port from the request. Will also evaluate expressions with addition.
     * EX: ${100}+5 ===> 105
     * @param req
     * @returns 0 if no port found
     */
    static getZmqPort(req: Request<ParamsDictionary>): number {
        let zmqPort = 0;
        try {
            if (typeof req.params.zmqPortExpr === 'string' && req.params.zmqPortExpr !== 'missing') {
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


    /**
     * Handles the zmq request from base_app.
     * An http request can only request data from a single zmq socket
     * @param req
     * @param res
     * @param uiProps
     * @returns
     */
    static handleZmqRequest(req: Request<ParamsDictionary>, res: Response, uiProps: any) {
        if (!uiProps) { Logger.log(LogLevel.ERROR, `ui.props is null`); return }


        /**
         *
         * MEMORY LEAK WHEN BMS IS DOWN IS STILL PRESENT
         *      - MAYBE DISCONNECT INSTEAD OF CLOSE?
         */


        SuiData.incrRequestNum();

        // Update SuiData's copy of uiProps
        SuiData.uiProps = uiProps;

        // get port
        const zmq_port = SuiData.getZmqPort(req);

        // get connection timeout
        const connect_timeout = SuiData.propOrDefault(SuiData.uiProps, 'zmqTimeout', 1000);


        // make the socket and connect
        let requester = new ZMQ_Socket_Wrapper(SimpleUIServer.zmqHostname, zmq_port);

        SuiData.open_zmq_connections += 1;


        requester.connect();


        requester.socket.once('message', (msg: any) => {
            const zmqResponse = SuiData.addXmlStatus(msg.toString());
            Logger.log(LogLevel.DEBUG, `Recieved ZMQ message at ${requester.remote_address}: ${zmqResponse.substring(0, 105)}`);
            //requester.close();
            requester.disconnect();
            SuiData.open_zmq_connections -= 1;
            SuiData.sendResponse(req, res, zmqResponse);
            return;
        });

        requester.socket.once('error', (err: any) => {
            const zmqResponse = ServerUtil.getServerError('ZMQ_ERROR', '{{ERROR}}', err);
            SuiData.sendResponse(req, res, zmqResponse);
            Logger.log(LogLevel.ERROR, `ZMQ socket at ${requester.remote_address} got error: ${err}`);
            requester.disconnect();
            SuiData.open_zmq_connections -= 1;
            return;
        });


        // build the message
        let zmq_request_packet = "";
        if (req.method === "POST") {
            zmq_request_packet = SuiData.makeZmqCmdPacket(req);
        } else {
            zmq_request_packet = SuiData.makeZmqDataPacket(req);
        }

        // bounce if max number of connections are open
        if (SuiData.open_zmq_connections > 7) {
            SuiData.open_zmq_connections -= 1;
            console.log(`Bouncing request for ${requester.remote_address} ${req.params.tabName} ${SuiData.open_zmq_connections}`)

            res.json({"ZMQ_error": "reconnecting"});
            return;
        }

        // send the message
        requester.send(zmq_request_packet);

        Logger.log(
            SuiData.requestNum <= 5 ? LogLevel.INFO : LogLevel.DEBUG,
            `Sent ZMQ request: ${requester.remote_address} ${zmq_request_packet} ${SuiData.open_zmq_connections}`
        );
    }


    /**
     * Creates the ZMQ packet for a command
     * @param req
     * @returns
     */
    static makeZmqCmdPacket(req: Request<ParamsDictionary>) {
        let data = "";
        let parsed_request = {cmd: `${req.params.zmqCmd}`};
        if (req.headers.accept === "*/*" && req.body) {         // regular cmd request
            data = SuiData.getXmlFromJsonArgs(req, parsed_request);
        } else if (Object.keys(req.query).includes('xml')) {    // &xml debug request
            data = req.body;
        } else {
            Logger.log(LogLevel.WARNING,
                `Got unknown request type with headers ${req.headers} and body ${req.body}`);
        }
        Logger.log(LogLevel.INFO, `Received ZMQ command "${parsed_request.cmd}" for tab ${req.params.tabName}`);
        return data
    }

    /**
     * Creates a ZMQ packet for data
     * @param req
     * @param res
     * @returns
     */
    static makeZmqDataPacket(req: Request<ParamsDictionary>) {
        // get data cmd
        const cmd = SuiData.getZmqCmdFromReq(req);
        // return packet
        return `<request COMMAND="${cmd.cmd}" valueName="${cmd.valueName}"/>`;
    }

    static async suiCssToJsonRequest(req: Request<ParamsDictionary>, res: Response, uiProps: any) {
        // req contains:  /:appName/:propsStub/:tabName/query/css_elements_to_json/overlay/:nthOverlay

        SuiData.uiProps = uiProps;

        SuiData.incrRequestNum();
        if (!uiProps) {
            Logger.log(LogLevel.ERROR, 'No response is defined for the root folder "/".');
            return;
        }
        const cmd = SuiData.getZmqCmdFromReq(req);
        ServerUtil.logRequestDetails(LogLevel.DEBUG, req,
            `Starting css_elements_to_json request # ${SuiData.requestNum}`,
            'suiCssToJsonRequest', '/query/css_elements_to_json', cmd);
        Logger.log(LogLevel.DEBUG, `Converting css to json.`);
        const css_file = `/var/www/${req.params.appName}/overlay-${req.params.nthOverlay}/image-overlays.css`;
        const response = SuiData.cssToJson(css_file);
        SuiData.sendResponse(req, res, response);
        return;
    }

    /**
     * Injects a status if the XML doesn't aready have it
     * @param xmlString
     * @returns
     */
    static addXmlStatus(xmlString: string): string {
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

    static jsonToXml(json, docRoot, extraDocRootAttrs = '', depth = 0) {
        let xml = `<${docRoot} ${extraDocRootAttrs} `;
        const SIMPLE_TYPES = ['boolean', 'float', 'integer', 'string'];
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
        try {
            if (req.body == null) {
                Logger.log(LogLevel.VERBOSE, 'req.body IS NULL');
                return '{}';
            } else {
                Logger.log(LogLevel.VERBOSE, `req.body is not null, ${typeof req.body}`);
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
        } catch (err) {
            Logger.log(LogLevel.ERROR, `getXmlFromJsonArgs got error: ${err}`);
            return '{}';
        }
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

    static replacer(match, p1, p2, p3, offset, string) {
        return `${p2.trim()}",`;
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
        } else if (docRootName === 'response') {
            json = json;
        } else if (docRootName === 'error') {
            Logger.log(LogLevel.ERROR, "xmlToJSON xmlString has no docRootName");
        } else {
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
