// import CommandJsonNormalizer from 'command-json-normalizer';
// import 'node';
import * as fs from 'fs';
import { CommandJsonNormalizer } from './command-json-normalizer';
// import { sha1 } from '@angular/compiler/src/i18n/digest';
import * as crypt from './crypt';
import * as charenc from './charenc';
import * as sha1 from './sha1';

export class JsonStringNormalizer {

    static deepCopy(obj: any) {

        if (typeof obj === 'undefined') {
            // return value is also undefined
            return obj;
        }

        let clonedObject: any;

        if (obj instanceof Array) {
            clonedObject = Object.assign([], obj);

            for (let j = 0; j < obj.length; j++) {
                clonedObject[j] = JsonStringNormalizer.deepCopy(obj[j]);
            }

            return clonedObject;

        } else if (['number', 'string', 'boolean'].indexOf(typeof obj) > -1) {
            return obj;
        } else {

            clonedObject = Object.assign({}, obj);

            const allKeys = Object.keys(clonedObject);

            for (let i = 0; i < allKeys.length; i++) {
                if (clonedObject[allKeys[i]] instanceof Array) {
                    clonedObject[allKeys[i]] = JsonStringNormalizer.deepCopy(clonedObject[allKeys[i]]);
                } else if (clonedObject[allKeys[i]] instanceof Date) {
                    clonedObject[allKeys[i]] = new Date(clonedObject[allKeys[i]].valueOf());
                } else if (clonedObject[allKeys[i]] instanceof Object){
                    clonedObject[allKeys[i]] = JsonStringNormalizer.deepCopy(clonedObject[allKeys[i]]);
                }
            }
            return clonedObject;
        }
    }

    static normalizeJSON($json, $propsJson)
    {
        if (typeof $json === 'object') {

            if (typeof $json['Data_Summary'] !== 'object') {
                const new_json = { 'Data_Summary': $json };
                $json = new_json;
            }

            if (typeof $json.Data_Summary.Section === 'object') {

                // Convert single Section object into array if necessary
                if (!($json.Data_Summary.Section instanceof Array)) {
                    $json.Data_Summary.Section = [$json.Data_Summary.Section];
                }

                // Assure that every Section has a normalized version of its required children:
                //     CmdSet, DataSets, Fault_List, geometry
                for (let sectionIndex = 0; sectionIndex < $json.Data_Summary.Section.length; sectionIndex++) {
                    let childList = '';
                    childList += JsonStringNormalizer.normalizeCmdSet($json, sectionIndex);
                    childList += JsonStringNormalizer.normalizeDataSets($json, sectionIndex, $propsJson);
                    childList += JsonStringNormalizer.normalizeSectionChild($json, sectionIndex, 'Fault_List');
                    JsonStringNormalizer.setSectionGeometryAndUpdateTime($json.Data_Summary.Section[sectionIndex]);
                    $json.Data_Summary.Section[sectionIndex]['sha1sum'] = sha1(childList);
                }

                if (typeof $json.Data_Summary.timeStamp === 'undefined') {
                    $json.Data_Summary.timeStamp = {u_id: '0000', value: new Date().getTime()};
                }
            }
        }
        // strip trailing spaces and newlines
        // $json = $json.toString().replace(/(\"value\"[ \t]*:[ \t]*\")([^ \t]*)(\\n| |\t)+\"/g, '$1\"');
    }

    static  NON_OBJECT_ATTRS = ['colCount', 'desc', 'id', 'label', 'length', 'name', 'rowCount', 'tooltip', 'u_id', 'url', 'value'];

    // getSubObjectAccessorArray -- get an accessor list for either an array or an object that can be used
    // to iterate across the list like this:
    //     for(const key of getSubObjectAccessorArray(obj) {
    //         console.log('key:', key, ' value:', obj[key]);
    //     }
    static getSubObjectAccessorArray(o)
    {
        const normalKeys = [];
        for (const key of Object.keys(o)) {
            if (o.hasOwnProperty(key) && (JsonStringNormalizer.NON_OBJECT_ATTRS.indexOf(key) === -1) ) {
                normalKeys.push(key);
            }
        }
        return normalKeys;
    }

    static normalizeTableCommandItems($jsonTableObject) {

        if ($jsonTableObject.elements instanceof Array) {
            $jsonTableObject.elements.forEach( (element, index) => {
                element.id = element.u_id;

                if (element.command instanceof Object) {
                    const commandJsonNormalizer = new CommandJsonNormalizer(element);
                    $jsonTableObject.elements[index] = commandJsonNormalizer.getNormalCommandJSON();
                }
            } );
        }

        $jsonTableObject['sha1sum'] = sha1(JSON.stringify($jsonTableObject));
    }

    static normalizeDataSets($json, sectIdx, $propsJson) {
        let dataSetNames = '';
        const DATA_SETS = 'DataSets';
        let section = $json.Data_Summary.Section[sectIdx];

        if (section instanceof Object) {
            if (section.hasOwnProperty(DATA_SETS)) {
                if (section[DATA_SETS] instanceof Object) {
                    if (! (section[DATA_SETS] instanceof Array)) {
                        const tempDataSets = JsonStringNormalizer.deepCopy(section[DATA_SETS]);
                        section[DATA_SETS] = [];
                        section[DATA_SETS].push(tempDataSets);
                    }
                    const normalDataSet = [];

                    // Copy sub-objects
                    let dataSetIdx = 0;
                    for (const key of JsonStringNormalizer.getSubObjectAccessorArray(section[DATA_SETS])) {
                        const subObject = section[DATA_SETS][key];
                        const dataSet = {
                            'name': subObject[key],
                            'u_id': subObject['u_id'],
                            'id': 'DataSet-' + sectIdx + '.' + dataSetIdx,
                            'className': 'tableRowGroupBlock dataset-wrapper L3',
                            'sha1sums': '',
                            'dsItems': []
                        };

                        // dataSet['elements'] = JsonStringNormalizer.deepCopy(section[DATA_SETS][key]);
                        // dataSet['elements'] = section[DATA_SETS][key];
                        const dsItemArray = JsonStringNormalizer.objToArray(section[DATA_SETS][key], $propsJson);

                        let tableIdx = 0;
                        for (const container of dsItemArray) {
                            container['id'] = 'Table-'  + sectIdx + '.' + dataSetIdx + '.' + tableIdx;
                            if (typeof container['name'] === 'undefined') {
                                container['name'] = container['label'] || 'Table-' + tableIdx;
                            }
                            container['tableType'] = JsonStringNormalizer.getTableInfo(container.name, $propsJson)['tableType'];
                            const tempTable = JsonStringNormalizer.deepCopy(container);
                            JsonStringNormalizer.normalizeTableCommandItems(tempTable);
                            dataSet['dsItems'].push(tempTable);
                            dataSet['sha1sums'] += ' ' + tempTable['sha1sum'];
                            tableIdx++;
                        }
                        dataSetNames += dataSet['name'] + ',';
                        normalDataSet.push(dataSet);

                        dataSetIdx++;
                    }

                    // Copy string attributes
                    for (const attrName of JsonStringNormalizer.NON_OBJECT_ATTRS) {
                        if (typeof section[DATA_SETS][attrName] === 'string') {
                            normalDataSet[attrName] = section[DATA_SETS][attrName];
                        }
                    }

                    section[DATA_SETS] = JsonStringNormalizer.deepCopy(normalDataSet);
                    // section[DATA_SETS] = dataSetArray;

                } else {
                    section[DATA_SETS] = [];
                }
            } else {
                section[DATA_SETS] = [];
            }
        } else {
            section = {};
            section[DATA_SETS] = [];
        }

        const tempSection = JsonStringNormalizer.deepCopy(section);
        // const tempSection = section;

        $json.Data_Summary.Section[sectIdx] = JsonStringNormalizer.deepCopy(tempSection);
        // $json.Data_Summary.Section[sectIdx] = tempSection;

        return dataSetNames;
    }

    static objToArray(dataset: any, $propsJson: any): any {
        const arr: any = [];

        for (const dsItem in dataset) {
            if (dataset.hasOwnProperty(dsItem)) {
                if (JsonStringNormalizer.NON_OBJECT_ATTRS.indexOf(dsItem) === -1) {

                    // Unique dsItem, not in the list above...
                    const tableInfo: any = JsonStringNormalizer.getTableInfo(dsItem, $propsJson);
                    if (tableInfo['tableType'] === 'PairListTable') {
                        arr.push(JsonStringNormalizer.makePairListTableObject(dsItem, dataset));
                    } else if (tableInfo['tableType'] === 'PropDefinedTable') {
                        arr.push(JsonStringNormalizer.makePropDefinedTableObject(dsItem, dataset, tableInfo['props']));
                    }
                }
            }
        }
        return arr;
    }

    static getTableInfo(tableName: string, propsJsonIn: any): any {
        const pair = {'tableType': 'PairListTable', 'props': {} };
        const propsJson = (propsJsonIn instanceof Array) ? propsJsonIn : [propsJsonIn];

        if (   (propsJson.length > 0)
            && (propsJson[0] instanceof Object)
            && (typeof propsJson[0].table !== 'undefined') ) {

            // Determine if dsItem is in the "propDefinedTable" list
            for (const table of propsJson[0].table) {
                if (   typeof table === 'object'
                    && typeof table['element'] === 'string'
                    && (table['element'] === tableName) ) {

                    pair['tableType'] = 'PropDefinedTable';
                    pair['props'] = table;
                    break;
                }
            }
        }

        return pair;
    }

    static makePairListTableObject(e: any, o: any) {
        const tableObject = {
            'label': '',
            'desc': '',
            'u_id': '',
            'url': '',
            'tooltip': '',
            'elements': []
        };
        tableObject.label = e;
        tableObject['tableType'] = 'PairListTable';
        for (const c in o[e]) {
            if (o[e].hasOwnProperty(c)) {
                if (tableObject.hasOwnProperty(c)) {
                    tableObject[c] = o[e][c];
                }
                if (c === 'name' && typeof o[e][c] !== null) {
                    tableObject.label = o[e][c];
                }
                if (c === 'desc') {
                    tableObject.desc = o[e][c].replace(/\(NL\)/g, '\n');
                } else {
                    const cObj = o[e][c];
                    if (typeof cObj === 'object') {
                        if (!Array.isArray(cObj)) {
                            // a single object
                            if (!(cObj.hasOwnProperty('name') && cObj['name'] !== '')) {
                                cObj['name'] = c;
                            }
                            tableObject.elements.push(cObj);
                        } else {  // we have an array of pairs, append the whole thing
                            for (const ae of cObj) {
                                tableObject.elements.push(ae);
                            }
                        }
                    }
                }
            }
        }

        // if this element has a command, we'll suppress the name so the button gets all the real estate.
        for (const el of tableObject.elements) {
            if (typeof el.command !== 'undefined') {
                el.name = '';
            }
        }

        return tableObject;
    }

    static makePropDefinedTableObject(e: any, o: any, tableProps: any) {
        const tableObject = {
            'label': '',
            'desc': '',
            'u_id': '',
            'url': '',
            'tooltip': '',
            'elements': []
        };
        tableObject.label = e;
        tableObject['tableType'] = 'PropDefinedTable';
        tableObject['props'] = tableProps;
        const colDefs = tableObject['props']['columns'];
        let colIndex = 0;
        if (typeof colDefs === 'string') {
            const columns = [];
            for (const column of colDefs.split(',')) {
                colIndex++;
                const parts = column.split(':');
                switch (parts.length) {
                    case 3:
                        columns.push ([parts[0].trim(), parts[1].trim(), parts[2].trim()]);
                        break;

                    case 2:
                        columns.push ([parts[0].trim(), parts[1].trim()]);
                        break;

                    case 1:
                        columns.push ([parts[0].trim(), parts[0].trim()]);
                        break;

                    default:
                        columns.push(['col' + colIndex, 'col' + colIndex]);
                        break;
                }
            }
            tableObject['props']['columns'] = columns;
        }

        for (const c in o[e]) {
            if (o[e].hasOwnProperty(c)) {
                if (tableObject.hasOwnProperty(c)) {
                    tableObject[c] = o[e][c];
                }
                if (c === 'name' && typeof o[e][c] !== null) {
                    tableObject.label = o[e][c];
                }
                if (c === 'desc') {
                    tableObject.desc = o[e][c].replace(/\(NL\)/g, '\n');
                } else {
                    let cObj = o[e][c];
                    if (typeof cObj === 'object') {
                        if (!Array.isArray(cObj)) {
                            // a single object
                            if (!(cObj.hasOwnProperty('name') && cObj['name'] !== '')) {
                                cObj['name'] = c;
                            }
                            tableObject.elements.push(cObj);
                        } else {  // we have an array of tableObjects, append the whole thing
                            for (let ae of cObj) {
                                tableObject.elements.push(ae);
                            }
                        }
                    }
                }
            }
        }

        // if this element has a command, we'll suppress the name so the button gets all the real estate.
        for (const el of tableObject.elements) {
            if (typeof el.command !== 'undefined') {
                el.name = '';
            }
        }

        return tableObject;
    }

    static normalizeSectionChild($json, sectIdx, childName)
    {
        let dataSection = $json.Data_Summary.Section[ sectIdx ];

        if (dataSection instanceof Object) {
            if (dataSection.hasOwnProperty(childName)) {
                if (dataSection[childName] instanceof Object) {
                    if (!(dataSection[childName] instanceof Array)) {
                        dataSection[childName] = [dataSection[childName]];
                    }
                } else {
                    dataSection[childName] = [];
                }
            } else {
                dataSection[childName] = [];
            }
        } else {
            dataSection = {};
            dataSection[childName] = [];
        }

        let tempSection = {};
        Object.assign(dataSection, tempSection);
        Object.assign($json.Data_Summary.Section[sectIdx], tempSection);

        return childName;
    }

    /*
    static getUpdateTime() {
        const system_utc = new Date();
        return system_utc.toDateString() + ', ' + system_utc.toLocaleTimeString();
    }
    */

    static normalizeCmdSet($json, sectIdx)
    {
        let childDescList = '';
        const CMD_SET = 'CmdSet';
        let dataSection = $json.Data_Summary.Section[ sectIdx ];

        if (! (dataSection instanceof Object) ) {
            return childDescList;
        }

        if (dataSection.hasOwnProperty(CMD_SET)) {

            if (dataSection [CMD_SET]) {
                if (!Array.isArray(dataSection[CMD_SET])) {
                    // handle single cmdset as an array of 1 cmdset
                    dataSection[CMD_SET] = [dataSection[CMD_SET]];
                }
                for (let c in dataSection[CMD_SET]) {
                    if (dataSection[CMD_SET].hasOwnProperty(c)) {
                        const normalCmdSet = {
                            'label': '',
                            'desc': '',
                            'orientation': '',
                            'u_id': '',
                            'id': '',
                            'sha1sums': '',
                            'url': '',
                            'elements': []
                        };
                        normalCmdSet.label = CMD_SET;
                        normalCmdSet.id = normalCmdSet.u_id = dataSection[CMD_SET][c].u_id;
                        normalCmdSet.desc = dataSection[CMD_SET][c].desc || dataSection[CMD_SET][c].name;
                        normalCmdSet.elements = [];
                        childDescList += normalCmdSet.desc + ',';
                        normalCmdSet['orientation'] =
                            (dataSection[CMD_SET][c]
                                && typeof dataSection[CMD_SET][c].orientation === 'string'
                                && dataSection[CMD_SET][c].orientation
                            ) || 'horizontal';

                        let cmdArr = dataSection[CMD_SET][c].command;
                        if (!Array.isArray(cmdArr)) {
                            // Got a single command, instead of an array of commands
                            cmdArr = [cmdArr];
                        }

                        for (let i in cmdArr) {
                            if (cmdArr.hasOwnProperty(i) && cmdArr[i] instanceof Object) {
                                if (cmdArr[i].hasOwnProperty('_input')) {
                                    cmdArr[i]['controls'] = cmdArr[i]['_input'];
                                    delete cmdArr[i]['_input'];
                                    if (!Array.isArray(cmdArr[i]['controls'])) {
                                        // Got a single control, instead of an array of controls
                                        cmdArr[i]['controls'] = [cmdArr[i]['controls']];
                                    }
                                }
                                const rawCommandElement = {'name': i, 'command': cmdArr[i]};
                                const commandJsonNormalizer = new CommandJsonNormalizer(rawCommandElement);
                                const normalCommandElement = commandJsonNormalizer.getNormalCommandJSON();
                                normalCmdSet.sha1sums += ' ' + normalCommandElement['sha1sum'];
                                normalCmdSet.elements.push(normalCommandElement);
                            }
                        }
                        dataSection[CMD_SET][c] = normalCmdSet;
                    }
                }
            }
        } else {
            dataSection[CMD_SET] = [];
        }
        return childDescList;
    }

    static setSectionGeometryAndUpdateTime(section) {

        if ( ! (section instanceof Object)) {
            return;
        }

        if (typeof section['menuPos'] !== 'string') {
            section['menuPos'] = 'top';
        }

        // Calculate colCount and rowCount
        let cmdSetCount = 0;
        let colCount = 0;
        let rowCount = 0;

        if ('left' === section.menuPos) {
            // Left-aligned cmdset
            cmdSetCount = section.CmdSet.length;
        }

        if ( section.DataSets instanceof Array) {

            // Top-aligned cmdset
            for (let i = 0; i < section.DataSets.length; i++) {
                const countSubObjects = section.DataSets[i]['dsItems'].length;
                colCount = Math.max(colCount, cmdSetCount + countSubObjects);
            }

            rowCount = Math.max(1, section.DataSets.length + 1);
        }

        section['colCount'] = Math.max(colCount, 1);
        section['rowCount'] = Math.max(rowCount, 1);
        // section['updateTime'] = getUpdateTime();
    }
}