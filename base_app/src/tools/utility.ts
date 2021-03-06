/**
 * Created by jscarsdale on 3/29/2019.
 *
 * Added typescript wrapper around xml2json function
 *
 * Based on deepClone() example from
 *     https://stackoverflow.com/questions/40291987/javascript-deep-clone-object-with-circular-references/40293777#40293777
*/


import { Injectable } from '@angular/core';
import { ObjRel, DataChange } from '../app/services/data-change.service';

@Injectable()
export class UTIL {

    /*
     * createArrayComparator - classifies all children of an array as either
     * 'comparable' or 'incomparable', returning an 'arrayAccessor' with a list of each.
     * The 'comparable' member of the arrayAccessor contains an 'index' member for
     * directly accessing the child, and a 'comparator' member for comparing with an element
     * from another array.
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

    /*
     * compareObjects - determines whether two 'comparable' objects are
     * 'identical', 'equal', 'changed', or 'unrelated'.
     * All objects are assumed to have 'u_id', 'name', and 'id' members.
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

    public static  getSubObjectCount(o: any) {
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

    public static recursiveUpdateArray(outObj, inObj) {

        if (!outObj || (! (outObj instanceof Array)) ) {
            throw new Error('outObj must be an array, but is of type "' + typeof outObj + '".');
        }

        if (!inObj || (! (inObj instanceof Array)) ) {
            throw new Error('inObj should be an array, but is of type "' + typeof outObj + '".');
        }

        const updateElementsMap = []; // Map of (outObjIndex, inObjIndex) of elements that match by 'u_id'

        // Walk outObj elements, saving elements with a corresponding inObj element in updateElementsMap.
        for (let i = 0; i < outObj.length; i++) {
            for (let j = 0; j < inObj.length; j++) {
                if (   (typeof outObj[i]['u_id'] === 'string') && (typeof inObj[j]['u_id'] === 'string')
                    && (outObj[i]['u_id'] === inObj[j]['u_id']) ) {

                    updateElementsMap.push([i, j]);
                    break;
                }
            }
        }

        // Update all elements from outObj that matched an inObj element by 'u_id'
        // and Delete all elements from outObj that didn't match any inObj element by 'u_id'
        for (let i = outObj.length - 1; i >= 0; i--) {
            let outPos = -1;
            let inPos = -1;
            for (let j = 0; j < updateElementsMap.length; j++) {
                if (i === updateElementsMap[j][0]) {
                    outPos = i;
                    inPos = updateElementsMap[j][1];
                    break;
                }
            }
            if (outPos > -1) {
                UTIL.recursiveUpdate(outObj[outPos], inObj[inPos]);
            } else {
                outObj.splice(i, 1);
            }
        }

        // Add any elements from inObj that had no corresponding element in outObj
        for (let i = 0; i < inObj.length; i++) {
            let found = false;
            for (let j = 0; j < updateElementsMap.length; j++) {
                if (i === updateElementsMap[j][1]) {
                    found = true;
                }
            }
            if (!found) {
                outObj.push(inObj[i]);
            }
        }
    }

    /*
     * recursiveUpdate(outObj, inObj)
     *     Replicates inObj to outObj, by modifying any existing children,
     *     instead of creating new instances of them.
     *
     *     Children that are in inObj but not present in outObj are added to outObj.
     *
     *     Any children of outObj that are not present in InObj are deleted.
     */

    public static recursiveUpdate(outObj, inObj, depth = 0) {

        if (!outObj || (! (outObj instanceof Object)) ) {
            throw new Error('outObj must be a mutable argument, but is of type "' + typeof outObj + '".');
        }

        if (!inObj || (! (inObj instanceof Object)) ) {
            throw new Error('inObj should be an object type, but is of type "' + typeof outObj + '".');
        }

        if (inObj instanceof Array) {
            if (Array.isArray(outObj)) {
                UTIL.recursiveUpdateArray(outObj, inObj);
            } else {
                // inObj IS an array, but outObj is NOT an array - just copy the array
                Object.assign(outObj, inObj);
            }
        } else {
            // inObj is an object, but is NOT an array

            const inObjKeys = Object.keys(inObj);

            // Delete all children of outObj that aren't in inObj
            for (const key of Object.keys(outObj)) {
                if (inObjKeys.indexOf(key) === -1) {
                    delete outObj[key];
                }
            }

            // Copy all children from inObj to outObj
            for (const key of inObjKeys) {
                if ( (inObj[key] instanceof Object)
                    && outObj[key]
                    && (outObj[key] instanceof Object)
                    && (! ( (outObj[key] instanceof Array) && (outObj[key].length === 0) ) ) ) {

                    UTIL.recursiveUpdate(outObj[key], inObj[key], depth + 1);
                } else {
                    outObj[key] = UTIL.deepCopy(inObj[key]);
                }
            }
        }

        return;
    }

    /*
     * compareUid(obj1, obj2)
     *    Compare the 'u_id' of obj1 and obj2.
     *
     * Arguments:
     *    obj1 - first object
     *    obj2 - second object
     */

    public static compareUid(obj1, obj2) {
        return (   (obj1 instanceof Object) && (obj2 instanceof Object)
            && ('u_id' in obj1) && ('u_id' in obj2)
            && (obj1['u_id'] === obj2['u_id']) );
    }

    /*
     * recursiveMerge(outObj, inObj)
     *     Replicates inObj to outObj, by modifying any existing children,
     *     instead of creating new instances of them.
     *
     *     Children that are in inObj but not present in outObj are added to outObj.
     *
     *     Any children of outObj that are not present in InObj are preserved.
     */
    public static recursiveMerge(outObj, inObj) {

    }

    public static deepCopy(obj: any) {

        if (typeof obj === 'undefined') {
            // return value is also undefined
            return obj;
        }

        let clonedObject: any;

        if (obj instanceof Array) {
            clonedObject = Object.assign([], obj);

            for (let j = 0; j < obj.length; j++) {
                clonedObject[j] = this.deepCopy(obj[j]);
            }

            return clonedObject;

        } else if (['number', 'string', 'boolean'].indexOf(typeof obj) > -1) {
            return obj;
        } else {

            clonedObject = Object.assign({}, obj);

            const allKeys = Object.keys(clonedObject);

            for (let i = 0; i < allKeys.length; i++) {
                if (clonedObject[allKeys[i]] instanceof Array) {
                    clonedObject[allKeys[i]] = this.deepCopy(clonedObject[allKeys[i]]);
                } else if (clonedObject[allKeys[i]] instanceof Date) {
                    clonedObject[allKeys[i]] = new Date(clonedObject[allKeys[i]].valueOf());
                } else if (clonedObject[allKeys[i]] instanceof Object){
                    clonedObject[allKeys[i]] = this.deepCopy(clonedObject[allKeys[i]]);
                } else {
                    clonedObject[allKeys[i]] = this.deepCopy(clonedObject[allKeys[i]]);
                }
            }
            return clonedObject;
        }
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

    /*
     * getNamedAttr() - looks for a non-empty value the object e
     */
    public static getNamedAttr(o: any, attrName: string, defaultValue: string): string {
        return (o && (typeof o[attrName] === 'string') && o[attrName]) || defaultValue;
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

}
