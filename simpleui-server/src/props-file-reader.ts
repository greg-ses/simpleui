import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as jsonxml from 'jsontoxml';
// import {Request, ParamsDictionary} from 'express-serve-static-core';
import { Logger, LogLevel } from './server-logger';
import { SimpleUIServer } from './simpleui-server';
import { ServerUtil } from './server-util';
import {ProcessInfo} from './interfaces';

export class VersionProps {
    user = 'user';
    uiVersionLong = 'UI Version Long';
    uiVersionShort = 'UI Version Short';
}


export class PropsFileReader {

    static PropertySets = [];

    static getAppPropsFiles(rawAppNameList: string, webPort: string): any
    {
        const appPropsTuples = [];

        const appNames = rawAppNameList.split(/[,:;]/);
        for (let appName of appNames) {
            appName = appName.trim();

            let isMock = (appName.substr(0, 5) === "mock-");

            let propsDir = `/var/www/${appName}`;
            if (isMock) { propsDir = `${SimpleUIServer.bin_dir}/../../test/data/${appName.replace("mock-", "")}`; }

            if (!fs.existsSync(propsDir)) {
                    console.log(`Invalid appName: '${appName}'. Missing expected folder '${propsDir}'`);
                    return;
                }

            const propsFiles =
                fs.readdirSync(propsDir).filter( (element, index, array) => { return element.match(/[^\.]\.properties$/); } );

            for (const propsFileName of propsFiles) {

                const props = PropsFileReader.getProps(propsFileName, appName, webPort, isMock);
                if (!(props instanceof Object)) {
                    Logger.log(LogLevel.ERROR,
                        `Invalid config (no props for app "${appName}" and uiProp "${propsFileName}")`);
                    return;
                }

                if (!(props.tab instanceof Array)) {
                    Logger.log(LogLevel.ERROR,
                        `Invalid config (There are no "tab" properties for app "${appName}" and uiProp "${propsFileName}")`);
                    return;
                }

                const propsStub = propsFileName.replace('.properties', '');
                appPropsTuples.push({appName: appName, propsFileName: propsFileName, propsStub: propsStub, props: props});
            }
        }

        return appPropsTuples;
    }

    // PropsFileReader.getProps(app expressRequest.protocol, appName, expressRequest.query.uiProp);
    static getProps(propsFileName: string, appName: string, webPort: string, isMock=false) {
        if (appName === '/' || appName === '') {
            return null;
        }

        let propsDir = `/var/www/${appName}`;
        if (isMock) { propsDir = `${SimpleUIServer.bin_dir}/../../test/data/${appName.replace("mock-", "")}`; }
        if (typeof propsFileName !== 'string') { propsFileName = 'ui.properties'; }

        const key = `${appName}/${propsFileName}`;
        const fullPropsFileName = `${propsDir}/${propsFileName}`;
        // TODO: Maybe do this less frequently, instead of on every call???
        const stats = fs.statSync(fullPropsFileName);
        const mtimeMs = stats.mtimeMs.toString();
        if (   (typeof PropsFileReader.PropertySets[key] === 'undefined')
            || (mtimeMs !== PropsFileReader.PropertySets[key]['mtimeMs']) ) {
            PropsFileReader.PropertySets[key] = PropsFileReader.loadUiPropsFile(fullPropsFileName, appName, webPort, mtimeMs);
        }
        return PropsFileReader.PropertySets[key];
    }

    /*
    // header("Access-Control-Allow-Origin: *");
    if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
        header("Content-Type: application/xml; charset=UTF-8");
    } else {
        header("Content-Type: application/json; charset=UTF-8");
    }
    */

    static processMacroPart(props: any, index: number) {

        let macroComplete = false;

        if (   (typeof props['macro'][index]['token'] === 'string')
            && (typeof props['macro'][index]['source'] === 'string')
            && (typeof props['macro'][index]['property'] === 'string') ) {

            // Macro is complete -- process it
            macroComplete = true;

            const sourceFile = props['macro'][index]['source'];
            const token = props['macro'][index]['token'];

            // props['macro'][index]['index'] = index.toString;
            // props['macro'][index]['id'] = `macro-${index}`;

            if (sourceFile === 'self') {
                // Defer substitution until we have all local props
                props['macro'][index]['replacement'] =  '${' + props['macro'][index]['token'] + '}';
            } else {
                if (!fs.existsSync(sourceFile)) {
                    const msg = `ERROR: Properties source file '${sourceFile}' referenced by MACRO ${token} does not exist.`;
                    Logger.log(LogLevel.ERROR, msg);
                    return false;
                }

                props['macro'][index]['replacement'] =
                    PropsFileReader.getPropFromFile(sourceFile, props['macro'][index]['property']);
                if (props['macro'][index]['replacement'] === 'missing') {
                    Logger.log(LogLevel.ERROR,
                        `Failed to find macro.${index}.property ("${props['macro'][index]['property']}") in ${sourceFile}.`);
                    return false;
                }
            }
        }
        return macroComplete;
    }

    static getPropFromFile(sourceFile: string, propKey: string)
    {
        let propValue = 'missing';
        const rawTestWithComments = fs.readFileSync(sourceFile, 'utf8');
        if (rawTestWithComments === '') {
            console.log(`Error reading ${sourceFile} in loadUiPropsFile`);
        } else {
            const rawText = rawTestWithComments.replace(/#[^\n]*[\n]+/g, '\n');
            const pattern = new RegExp('\\W*' + propKey + '\\W*=\\W*([^\\n]*)\\n');
            const matches = rawText.match(pattern);
            if (matches) {
                propValue = matches[1].trim();
            } else {
                Logger.log(LogLevel.ERROR, `Failed to find propKey: '${propKey}' in ${sourceFile}.`);
            }
        }
        return propValue;
    }

    static replaceMacros(props, value) {
        if (props['macro'] instanceof Array) {
            props['macro'].forEach(macro => {
                if (   (macro instanceof Object)
                    && (typeof macro['token'] === 'string')
                    && (typeof macro['replacement'] === 'string') ) {

                    const searchString = '${' + macro['token'] + '}';
                    const replacement = macro['replacement'];
                    value = value.replace(searchString, replacement)
                        .replace('{{index}}', '((index))');
                }
            });
        }

        return value;
    }

    static loadUiPropsFile(uiPropsFile: string, appName: string, webPort: string, mtimeMs: string) {
        const uiProp = path.parse(uiPropsFile).name;
        const props = { 'srcFile': uiPropsFile };
        props['uiProp'] = { 'value': uiProp };

        const versionProps = PropsFileReader.getSoftwareVersionStrings(`/var/www/${appName}/version.txt`);
        props['uiVersionLong'] = { 'value': versionProps.uiVersionLong };
        props['uiVersionShort'] = { 'value': versionProps.uiVersionShort };

        props['propsUrl'] =  { 'value': `/${appName}/${uiProp}/query/props`};
        props['mtimeMs'] = mtimeMs;
        props['propsLastRefresh'] = ServerUtil.formatDate(new Date(), 'second');
        props['fullAppUrl'] =  { 'value': `/${appName}/`};
        props['selectedIndex'] = { 'value': '0' };
        props['instance'] = { 'name': 'Simple_UI_Instance' };
        props['nodejsPort'] = { 'value': '2080'};
        props['refreshRate'] = { 'value': '1200'};
        props['logLevel'] = { 'value': '0'};
        props['sessionExpiration'] = { 'value': '6'};

        const rawText = fs.readFileSync(uiPropsFile, 'utf8');
        if (rawText === '') {
            console.log(`Error reading ${uiPropsFile} in loadUiPropsFile`);
        }

        // Remove comments
        let propCount = 0;
        let macroCount = 0;
        let propsText = rawText.toString().replace(/[ \t]*#.*\n/g, '\n').replace(/\n+/g, '\n');


        let macroIndex = 0;

        if (!(props['macro'] instanceof Array)) {
            props['macro'] = [];
        }

        const oneLineMacroRegEx = /@MACRO\W+([0-9a-zA-Z._-]+)\W*=\W*[$]?\(\W*([^ \t]+)\W+FROM\W+([^\)]+)[ \t]*\)/g;
        const oneLineMacros: any = propsText.match(oneLineMacroRegEx);
        if (oneLineMacros) {
            for (const macro of oneLineMacros) {
                propsText = propsText.replace(macro, '');
                const macroParts = macro.trim().split(/[ \t=$\(\)\n]+/);
                if ((props['macro'][macroIndex] instanceof Object)) {
                    macroIndex = Object.keys(props['macro']).length;
                } else {
                    props['macro'][macroIndex] = {};
                }

                props['macro'][macroIndex]['index'] = macroIndex.toString();
                props['macro'][macroIndex]['id'] = `macro-${macroIndex}`;
                props['macro'][macroIndex]['token'] = macroParts[1];
                props['macro'][macroIndex]['source'] = macroParts[4];
                props['macro'][macroIndex]['property'] = macroParts[2];
                PropsFileReader.processMacroPart(props, macroIndex);

                macroIndex++; macroCount++;
            }
        }

        // Add 'PREDEFINED' macros
        props['macro'][macroIndex] = {};
        props['macro'][macroIndex]['index'] = macroIndex.toString();
        props['macro'][macroIndex]['id'] = `macro-${macroIndex}`;
        props['macro'][macroIndex]['token'] = 'APP_DIR';
        props['macro'][macroIndex]['source'] = 'PREDEFINED';
        props['macro'][macroIndex]['replacement'] = `/${appName}/`;
        PropsFileReader.processMacroPart(props, macroIndex);

        ++macroIndex; macroCount++;
        props['macro'][macroIndex] = {};
        props['macro'][macroIndex]['index'] = macroIndex.toString();
        props['macro'][macroIndex]['id'] = `macro-${macroIndex}`;
        props['macro'][macroIndex]['token'] = 'HOSTNAME';
        props['macro'][macroIndex]['source'] = 'PREDEFINED';
        props['macro'][macroIndex]['replacement'] = os.hostname();
        PropsFileReader.processMacroPart(props, macroIndex);

        ++macroIndex; macroCount++;
        props['macro'][macroIndex] = {};
        props['macro'][macroIndex]['index'] = macroIndex.toString();
        props['macro'][macroIndex]['id'] = `macro-${macroIndex}`;
        props['macro'][macroIndex]['token'] = 'URL_PREFIX';
        props['macro'][macroIndex]['source'] = 'PREDEFINED';
        props['macro'][macroIndex]['replacement'] = `/${appName}/${uiProp}`;
        PropsFileReader.processMacroPart(props, macroIndex);

        ++macroIndex; macroCount++;
        props['macro'][macroIndex] = {};
        props['macro'][macroIndex]['index'] = macroIndex.toString();
        props['macro'][macroIndex]['id'] = `macro-${macroIndex}`;
        props['macro'][macroIndex]['token'] = 'IP_ADDR';
        props['macro'][macroIndex]['source'] = 'PREDEFINED';
        props['macro'][macroIndex]['replacement'] = `${SimpleUIServer.EXTERNAL_IP}`;
        PropsFileReader.processMacroPart(props, macroIndex);

        ++macroIndex; macroCount++;
        props['macro'][macroIndex] = {};
        props['macro'][macroIndex]['index'] = macroIndex.toString();
        props['macro'][macroIndex]['id'] = `macro-${macroIndex}`;
        props['macro'][macroIndex]['token'] = 'NODEJS_PORT';
        props['macro'][macroIndex]['source'] = 'PREDEFINED';
        props['macro'][macroIndex]['replacement'] = webPort;
        PropsFileReader.processMacroPart(props, macroIndex);

        const propRegEx = /\W*([0-9a-zA-Z._-]+)\W*=\W*([^\n]*)\n/g;
        const pairs: any = propsText.match(propRegEx);
        if (!pairs) {
            console.log(`Invalid UI Properties file: ${uiPropsFile}`);
            return null;
        }

        let i = 0;
        let keyIndex = 0;
        for (const pair of pairs) {
            // if (i++ === 0) { continue; }
            const firstEqual = pair.indexOf('=');
            if (firstEqual > 0) {
                let key = pair.substr(0, firstEqual).trim();
                const value = pair.substr(firstEqual + 1).trim();
                const arrayKey = key.match(/^([^.]+)\.([0-9])+\.([^ =]+)/);
                if (arrayKey) {
                    key = arrayKey[1];
                    const index = parseInt(arrayKey[2], 10) - 1;
                    const subKey = arrayKey[3];

                    // Array
                    if (! (props[key] instanceof Array) ) {
                        props[key] = [];
                        keyIndex = 0;
                    }
                    if (! (props[key][index] instanceof Object) ) {
                        props[key][index] = {};
                        keyIndex++;
                    }

                    if (key === 'macro') {
                        props[key][index][subKey] = value;
                        if (PropsFileReader.processMacroPart(props, keyIndex)) {
                            macroCount++;
                        }
                    } else if (key === 'tab') {
                        props[key][index]['index'] = (keyIndex - 1).toString();
                        props[key][index]['id'] = `${key}-${index + 1}`;
                        props[key][index][subKey] = PropsFileReader.replaceMacros(props, value);
                    } else {
                        props[key][index]['index'] = index.toString();
                        props[key][index]['id'] = `${key}-${index + 1}`;
                        props[key][index][subKey] = PropsFileReader.replaceMacros(props, value);
                    }
                } else {
                    const compoundKey = key.match(/^([^.]+)\.([^ =]+)/);
                    if (compoundKey) {
                        key = compoundKey[1];
                        const subKey = compoundKey[2];

                        if (! (props[key] instanceof Array) ) { props[key] = {}; }

                        props[key][subKey] = PropsFileReader.replaceMacros(props, value);
                } else {
                        props[key] = PropsFileReader.replaceMacros(props, value);
                    }
                }
                propCount++;
            }
        }

        // Reset replacement for macros with source of 'self'
        if (props['macro'] instanceof Array) {
            props['macro'].forEach( macro => {
               if (macro['source'] === 'self') {
                   macro['replacement'] = props[macro['property']];

                   const searchStr = '${' + macro['token'] + '}';
                   Object.keys(props).forEach( key => {
                       if (typeof props[key] === 'string') {
                           props[key] = props[key].replace(searchStr, macro['replacement']);
                       } else {
                           if (key !== 'macro') {
                               if (props[key] instanceof Array) {
                                   props[key].forEach( item => {
                                       Object.keys(item).forEach( subKey => {
                                           if (typeof item[subKey] === 'string') {
                                               item[subKey] = item[subKey].replace(searchStr, macro['replacement']);
                                           }
                                       });
                                   });
                               }
                           }
                       }
                   });
               }
            });
        }

        console.log(`UI Properties file: ${uiPropsFile}, ` +
            `#direct props: ${propCount}, ` +
//            `#derived props: ${derivedPropCount}, ` +
            `total complete macros: ${macroCount}`);

        return props;
    }

    static getSoftwareVersionStrings(versionFile): VersionProps {

        const returnValue = new VersionProps();

        if (!fs.existsSync(versionFile) ) {
            return returnValue;
        }
        const userRegEx = /define\W+GIT_USER\W+"([^"]*)"/g;
        const uiVersionShortRegEx = /define\W+GIT_REVSTR_SHORT\W+"([^"]*)"/g;
        const uiVersionLongRegEx = /define\W+GIT_REV_SUMMARY\W+"([^"]*)"/g;

        const versionText = fs.readFileSync(versionFile,'utf8');
        if (versionText === '') {
            console.log(`Error reading ${versionFile} in getSoftwareVersionStrings`);
            return null;
        }

        let matchedStr = versionText.toString().match(userRegEx);
        if (matchedStr) {
            returnValue.user = matchedStr[0].split(' ')[2].replace(/"/g, '');
        }

        matchedStr = versionText.match(uiVersionShortRegEx);
        if (matchedStr) {
            returnValue.uiVersionShort = matchedStr[0].split(' ')[2].replace(/"/g, '');
        }

        matchedStr = versionText.match(uiVersionLongRegEx);
        if (matchedStr) {
            returnValue.uiVersionLong = matchedStr[0].split(' ')[2].replace(/"/g, '');
        }

        /*
        console.log(
            `Version data: user: ${returnValue.user}, ` +
            `uiVersionShort: ${returnValue.uiVersionShort}, ` +
            `uiVersionLong: ${returnValue.uiVersionLong}`);
        */

        return returnValue;
    }

    static specialJsonToXml(key: string, value: any) {
        let xml = `\n<${key}s>`;
        const arr = (value instanceof Array) ? value : [ value ];

        for (let i = 0; i < arr.length; i++) {
            if (!arr[i]) { continue; }
            xml += `\n  <${key} idx="${i}">`;
            for (const attr of Object.keys(arr[i])) {
                if (arr[i].hasOwnProperty(attr)) {
                    if (arr[i][attr] && (typeof arr[i][attr] === 'string')) {
                        xml += `\n    <${attr}>${ServerUtil.htmlspecialchars(arr[i][attr])}</${attr}>\n`;
                    }
                }
            }
            xml += `\n  </${key}>`;

        }

        xml += `\n</${key}s>`;
        return xml;
    }

    static jsonToXml(element, root, depth = 0) {

        // IMPORTANT NOTE: element is modified by this function!
        // To avoid whacking the props you pass to this function,
        //   use    const tmpElement = ServerUtil.deepCopy(props);
        //   and    jsonToXml(tmpElement)

        // Rip out non-vanilla elements and process them specially.
        const specializedElements = {};
        for (const key of ['appLink', 'macro', 'tab', 'table']) {
            if (element[key] instanceof Array) {
                specializedElements[key] = PropsFileReader.specialJsonToXml(key, element[key]);
                element[key] = '';
            }
        }

        // Use the jsonxml lib to format vanilla xml
        let xml = `<${root}>\n${jsonxml(element)}\n</${root}>`;


        for (const key of Object.keys(specializedElements)) {
            const xmlValue = `<${key}/>`;
            xml = xml.replace(xmlValue, specializedElements[key]);
        }
        return xml;
    }

    static async propsFileRequest(request, response, props) {

        if ((typeof request.query.xml === 'string')
            || (typeof request.query.XML === 'string')) {
            response.setHeader('Content-Type', 'application/xml');
            response.setHeader('charset', 'UTF-8');
            const xmlMetaPrefix = '<?xml version="1.0" encoding="UTF-8"?>';
            const tmpProps = ServerUtil.deepCopy(props);
            const xml = PropsFileReader.jsonToXml(tmpProps, 'props');;
            response.send(xmlMetaPrefix + xml);
        } else {
            response.setHeader('Content-Type', 'application/json');
            response.setHeader('charset', 'UTF-8');
            const propsJSON =
                JSON.stringify(props)
                    .replace(/([^\\])\//g, '$1\\/')
                    .replace(/([^\\])\//g, '$1\\/')
                    .replace(/^\//g, '\\/')
            const json = `{"props": ${propsJSON}}`;
            response.send(json);
        }
        return;
    }

/*
function getPropsJson(request, appDir, uiProp)
{
    // new stuff
    if (array_key_exists("uiProp", request)) {
        $uiProp = trim(request["uiProp"]);
    } else {
        $uiProp = "ui";
    }

    $UIProps = loadUiPropsFile(appDir . "/" . $uiProp . ".properties");
    $UIMacroProps = extractMacros($UIProps);
    replaceMacros($UIProps, $UIMacroProps);


    $response = "<props>\n"
        . UIPropsToXml($UIProps)
        . "</props>\n";

    // Arbitrary change

    if (array_key_exists("xml", $_REQUEST) || array_key_exists("XML", $_REQUEST)) {
        // nothing to do -- already have XML
    } else {
        // Default is to return JSON
        $versionText = "V.xxx";
        if (array_key_exists("version", $_REQUEST)) {
            $versionText = $_REQUEST["version"];
        }
        $response = XmlDiffTool::xmlToJSON($response, "props", $versionText);
    }

    echo $response;
}
*/

}
