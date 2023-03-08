/**
 * Created by jscarsdale on 3/29/2019.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class UTIL {




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
