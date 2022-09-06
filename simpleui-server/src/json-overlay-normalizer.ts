import {CommandJsonNormalizer} from './command-json-normalizer';

export class JsonOverlayNormalizer {

    static deepCopy(obj: any) {
        let flag = true;

        if (typeof obj === 'undefined') {
            // return value is also undefined
            return obj;
        }

        if (flag) {
            let clone = structuredClone(obj);
            return clone;
        }
    }

    static deepCopy_old(obj: any) {

        if (typeof obj === 'undefined') {
            // return value is also undefined
            return obj;
        }
        let clonedObject: any;

        if (obj instanceof Array) {
            clonedObject = Object.assign([], obj);

            for (let j = 0; j < obj.length; j++) {
                clonedObject[j] = JsonOverlayNormalizer.deepCopy(obj[j]);
            }

            return clonedObject;

        } else if (['number', 'string', 'boolean'].indexOf(typeof obj) > -1) {
            return obj;
        } else {

            clonedObject = Object.assign({}, obj);

            const allKeys = Object.keys(clonedObject);

            for (let i = 0; i < allKeys.length; i++) {
                if (clonedObject[allKeys[i]] instanceof Array) {
                    clonedObject[allKeys[i]] = JsonOverlayNormalizer.deepCopy(clonedObject[allKeys[i]]);
                } else if (clonedObject[allKeys[i]] instanceof Date) {
                    clonedObject[allKeys[i]] = new Date(clonedObject[allKeys[i]].valueOf());
                } else if (clonedObject[allKeys[i]] instanceof Object) {
                    clonedObject[allKeys[i]] = JsonOverlayNormalizer.deepCopy(clonedObject[allKeys[i]]);
                }
            }
            return clonedObject;
        }
    }

    static normalizeJSON($json, $propsJson) {
        if (typeof $json === 'object') {

            if (typeof $json['Overlay_Summary'] === 'object') {

                if (typeof $json['Overlay_Summary'] !== 'object') {
                    const new_json = {'Overlay_Summary': $json};
                    $json = new_json;
                }

                for (const key of Object.keys($json.Overlay_Summary)) {
                    for (const childKey of Object.keys($json.Overlay_Summary[key])) {

                        if (childKey === 'command') {
                            if (!($json.Overlay_Summary[key][childKey] instanceof Array)) {
                                $json.Overlay_Summary[key][childKey] = [$json.Overlay_Summary[key][childKey]];
                            }
                            JsonOverlayNormalizer.normalizeCmdSet($json.Overlay_Summary[key][childKey]);
                        } else if (childKey === 'animation'
                            || childKey === 'dyn'
                            || childKey === 'img') {
                            if (!($json.Overlay_Summary[key][childKey] instanceof Array)) {
                                $json.Overlay_Summary[key][childKey] = [$json.Overlay_Summary[key][childKey]];
                            }
                        } else if (childKey === 'prop-def-table') {
                            if (!($json.Overlay_Summary[key][childKey] instanceof Array)) {
                                $json.Overlay_Summary[key][childKey] = [$json.Overlay_Summary[key][childKey]];
                            }
                            for (let tblIdx = 0; tblIdx < $json.Overlay_Summary[key][childKey].length; ++tblIdx) {
                                for (const tblObjKey of Object.keys($json.Overlay_Summary[key][childKey][tblIdx])) {
                                    if ($json.Overlay_Summary[key][childKey][tblIdx][tblObjKey] instanceof Object
                                        && !($json.Overlay_Summary[key][childKey][tblIdx][tblObjKey] instanceof Array)) {
                                        $json.Overlay_Summary[key][childKey][tblIdx][tblObjKey]
                                            = [$json.Overlay_Summary[key][childKey][tblIdx][tblObjKey]];
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
        // strip trailing spaces and newlines
        // $json = $json.toString().replace(/(\"value\"[ \t]*:[ \t]*\")([^ \t]*)(\\n| |\t)+\"/g, '$1\"');
    }

    static NON_OBJECT_ATTRS = ['colCount', 'desc', 'id', 'label', 'length', 'name', 'rowCount', 'tooltip', 'u_id', 'url', 'value'];

    // getSubObjectAccessorArray -- get an accessor list for either an array or an object that can be used
    // to iterate across the list like this:
    //     for(const key of getSubObjectAccessorArray(obj) {
    //         console.log('key:', key, ' value:', obj[key]);
    //     }
    static getSubObjectAccessorArray(o) {
        const normalKeys = [];
        for (const key of Object.keys(o)) {
            if (o.hasOwnProperty(key) && (JsonOverlayNormalizer.NON_OBJECT_ATTRS.indexOf(key) === -1)) {
                normalKeys.push(key);
            }
        }
        return normalKeys;
    }

    static objToArray(dataset: any, $propsJson: any): any {
        const arr: any = [];

        for (const dsItem in dataset) {
            if (dataset.hasOwnProperty(dsItem)) {
                if (JsonOverlayNormalizer.NON_OBJECT_ATTRS.indexOf(dsItem) === -1) {

                    // Unique dsItem, not in the list above...
                    const tableInfo: any = JsonOverlayNormalizer.getTableInfo(dsItem, $propsJson);
                    if (tableInfo['tableType'] === 'PairListTable') {
                        arr.push(JsonOverlayNormalizer.makePairListTableObject(dsItem, dataset));
                    } else if (tableInfo['tableType'] === 'PropDefinedTable') {
                        arr.push(JsonOverlayNormalizer.makePropDefinedTableObject(dsItem, dataset, tableInfo['props']));
                    }
                }
            }
        }
        return arr;
    }

    static getTableInfo(tableName: string, propsJsonIn: any): any {
        const pair = {'tableType': 'PairListTable', 'props': {}};
        const propsJson = (propsJsonIn instanceof Array) ? propsJsonIn : [propsJsonIn];

        if ((propsJson.length > 0)
            && (propsJson[0] instanceof Object)
            && (typeof propsJson[0].table !== 'undefined')) {

            // Determine if dsItem is in the "propDefinedTable" list
            for (const table of propsJson[0].table) {
                if (typeof table === 'object'
                    && typeof table['element'] === 'string'
                    && (table['element'] === tableName)) {

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
                        columns.push([parts[0].trim(), parts[1].trim(), parts[2].trim()]);
                        break;

                    case 2:
                        columns.push([parts[0].trim(), parts[1].trim()]);
                        break;

                    case 1:
                        columns.push([parts[0].trim(), parts[0].trim()]);
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

    static normalizeCmdSet($json) {
        let cmdArr = $json;

        if (!Array.isArray(cmdArr)) {
            return;
        }

        for (const i in cmdArr) {
            if (cmdArr.hasOwnProperty(i) && cmdArr[i] instanceof Object) {
                if (cmdArr[i].hasOwnProperty('_input')) {
                    cmdArr[i]['controls'] = cmdArr[i]['_input'];
                    delete cmdArr[i]['_input'];
                    if (!Array.isArray(cmdArr[i]['controls'])) {
                        // Got a single control, instead of an array of controls
                        cmdArr[i]['controls'] = [cmdArr[i]['controls']];
                    }

                    const rawCommandElement = {'name': i, 'command': cmdArr[i]};
                    const commandJsonNormalizer = new CommandJsonNormalizer(rawCommandElement);
                    const normalCommandElement = commandJsonNormalizer.getNormalCommandJSON();
                    // cmdArr[i].sha1sums += ' ' + normalCommandElement['sha1sum'];
                    // cmdArr[i].elements = [];
                    // cmdArr[i].elements.push(normalCommandElement);  // what am I pushing on??

                    // TODO: Clean-up the command conversion.  Probably should wait until a json conversion on the back end.
                    cmdArr[i]._action = commandJsonNormalizer._element._action;
                    delete cmdArr[i].id; // Undo what the legacy code does, otherwise the id is not set correctly by the client.
                }
            }
        }
    }

}
