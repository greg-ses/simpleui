/**
 * Created by jscarsdale on 3/29/2019.
 *
 * Added typescript wrapper around xml2json function
*/

import { Injectable } from '@angular/core';
import { ObjRel, DataChange } from '../app/services/data-change.service';

@Injectable()
export class UTIL {



    /**
     * Classifies all children of an array as either 'comparable' or 'incomparable', returning an 'arrayAccessor' with a list of each.
     * The 'comparable' member of the arrayAccessor contains an 'index' member for
     * directly accessing the child, and a 'comparator' member
     * for comparing with an element from another array.
     * @param arr - -
     * @returns -
     */
    public static createArrayComparator(arr): any {
        const arrayAccessor = {'comparable': [], 'incomparable': []};
        const EMPTY_COMPARATOR = {'u_id': null, 'name': null, 'id': null};
        for (let i = arr.length - 1; i >= 0; i--) {
            const comparator = EMPTY_COMPARATOR;
            comparator.u_id = arr[i]['u_id'] || null;
            comparator.name = arr[i]['name'] || null;
            comparator.id   = arr[i]['id'] || null;
            if (comparator.u_id || comparator.name || comparator.id) {
                arrayAccessor.comparable.push({'index': i, 'comparator': comparator});
            } else {
                arrayAccessor.incomparable.push(i);
            }
        }
        return arrayAccessor;
    }


    /**
     * Determines whether two 'comparable' objects are 'identical', 'equal', 'changed', or 'unrelated'.
     * All objects are assumed to have 'u_id', 'name', and 'id' members.
     * @param obj1 -
     * @param obj2 -
     * @returns -
     */
    public static compareObjects(obj1, obj2): ObjRel {
        try {
            if (obj1 && obj2) {
                if (obj1 === obj2) {
                    return ObjRel.Identical;
                }

                if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
                    return ObjRel.Equal;
                }

                if (obj1.u_id && (obj1.u_id === obj2.u_id)) {
                    return ObjRel.Changed;
                }

                if (obj1.name && (obj1.name === obj2.name)) {
                    return ObjRel.Changed;
                }

                if (obj1.id && (obj1.id === obj2.id)) {
                    return ObjRel.Changed;
                }
            }
        } catch (e) {
            console.log('Error in compareObjects', e);
        }

        return ObjRel.Different;
    }

    public static getSubObjectCount(o: any) {
        let count = 0;
        if (o instanceof Array) {
            count = o.length;
        } else if (o instanceof Object) {
            for (const key of Object.keys(o)) {
                if (o[key] instanceof Object) {
                    count++;
                }
            }
        }

        return count;
    }

    public static getChangeSet(keyField: string, arr1: any, arr2: any): Array<DataChange> {
        const changeSet = new Array<DataChange>();
        const arr1Comparator = UTIL.createArrayComparator(arr1);
        const arr2Comparator = UTIL.createArrayComparator(arr2);

        for (const e1 of arr1Comparator.comparable) {
            for (const e2 of arr2Comparator.comparable) {
                const relationship = UTIL.compareObjects(arr1[e1.index], arr2[e2.index]);
                if (relationship === ObjRel.Changed) {
                    const dataChange = new DataChange(keyField, relationship, arr1[e1.index], arr2[e2.index]);
                    changeSet.push(dataChange);
                }
            }
        }
        return changeSet;
    }


    /**
     * Compares the 'u_id' of obj1 and obj2.
     * @param obj1 -
     * @param obj2 -
     * @returns boolean
     */
    public static compareUid(obj1, obj2) {
        return (   (obj1 instanceof Object) && (obj2 instanceof Object)
            && ('u_id' in obj1) && ('u_id' in obj2)
            && (obj1['u_id'] === obj2['u_id']) );
    }


    /**
     * Copies any data (complex or not) and returns with no reference.
     * Beware, if any non-clonable items (EX: functions) are present in data,
     * they will not be present in the output.
     * @param data - data to be cloned
     * @returns the cloned data
     */
    public static deepCopy(data: any) {
        if (typeof data === 'undefined') {
            return undefined;
        }
        return structuredClone(data);
    }


    public static compareAndUpdateSavedJSONValue(newJson, referenceKey, childObj, outComparedValues: any = null): boolean {
        // Example: const changed = this.app._popupDialog.compareAndUpdateSavedJSONValue(sect, sect.name, 'CmdSet');
        let changed = false;

        if (typeof window['_comparisonIdentities'] === 'undefined') {
            window['_comparisonIdentities'] = {};
        }

        const hasComparisonString = (typeof window['_comparisonIdentities'][referenceKey] === 'string');

        if (newJson instanceof Object) {

            if ( typeof childObj !== 'undefined') {
                const childJson = JSON.stringify(childObj);
                if (hasComparisonString) {
                    if (childJson !== window['_comparisonIdentities'][referenceKey]) {
                        changed = true;
                        if (outComparedValues instanceof Object) {
                            outComparedValues.new = childJson;
                            outComparedValues.old = window['_comparisonIdentities'][referenceKey];
                        }
                        window['_comparisonIdentities'][referenceKey] = childJson;
                    }
                } else {
                    // no comparison object
                    changed = true;
                    if (outComparedValues instanceof Object) {
                        outComparedValues.new = childJson;
                        outComparedValues.old = '';
                    }
                    window['_comparisonIdentities'][referenceKey] = childJson;
                }
            } else {
                // childObj is undefined
                if (hasComparisonString) {
                    changed = true;
                    if (outComparedValues instanceof Object) {
                        outComparedValues.new = '';
                        outComparedValues.old = window['_comparisonIdentities'][referenceKey];
                    }
                    window['_comparisonIdentities'].delete(referenceKey);
                }
            }
        } else {
            // newJson is NOT an object
            if (hasComparisonString) {
                changed = true;
                if (outComparedValues instanceof Object) {
                    outComparedValues.new = '';
                    outComparedValues.old = window['_comparisonIdentities'][referenceKey];
                }
                window['_comparisonIdentities'].delete(referenceKey);
            }
        }

        return changed;
    }


    /**
     * Looks for a non-empty value within obj
     * @param obj -
     * @param attrName -
     * @param defaultValue -
     * @returns -
     */
    public static getNamedAttr(obj: any, attrName: string, defaultValue: string): string {
        return (obj && (typeof obj[attrName] === 'string') && obj[attrName]) || defaultValue;
    }

    public static addContextPrefix(context: string, name: string) {
        return `≪${context}≫${name}`;
    }

    public static removeContextPrefix(nameWithPrefix: string) {
        return nameWithPrefix.replace(/≪[^≫]*≫/, '');
    }

    public static getContextPrefixParts(nameWithPrefix: string) {
        const parts = nameWithPrefix.split('≫');
        if (parts.length === 2) {
            parts[0] = parts[0].replace('≪', '');
        }
        return parts;
    }


    // Memory leak tools
    /**
     * Finds a reasonable format for bytes
     * @param {number} bytes input
     * @param decimals number of decimal places for output
     * @returns string of formatted bytes
     */
    public static readableBytesFormat(bytes: number, decimals: number = 2): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let i = 0;
        for (i; bytes > 1024; i++) {
            bytes /= 1024;
        }
        return parseFloat(bytes.toFixed(decimals)) + ' ' + units[i];
    }

    /**
     * Returns the total bytes that a UTF-16 string represents
     * @param str input UTF-16 string
     */
    public static strToBytes(str: string): number {
        const bytes = [];
        for (let ii = 0; ii < str.length; ii++) {
            const code = str.charCodeAt(ii); // x00-xFFFF
            bytes.push(code & 255, code >> 8); // low, high
        }
        const bytesTOTAL = bytes.reduce( (partialSum, a) => partialSum + a, 0);
        return bytesTOTAL;
    }


    /**
     * Returns the amount of memory a string consumes
     * @param str input string
     * @returns {string} string of formatted bytes
     */
    public static stringMemoryChecker(str: string): string {
        const totalBytes = UTIL.strToBytes(str);
        return UTIL.readableBytesFormat(totalBytes);
    }


    /**
     * Returns true if two objects are equal
     * @param element_1 -
     * @param element_2 -
     */
    public static elements_are_equal(element_1, element_2): boolean {
        return JSON.stringify(element_1) === JSON.stringify(element_2);
    }

}
