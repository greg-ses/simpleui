/**
 * Created by jscarsdale on 9/30/16.
 *
 * Added typescript wrapper around xml2json function
 */

/*	Adapted from xml2json.js:

    xml2json.js:
    This work is licensed under Creative Commons GNU LGPL License.

 License: http://creativecommons.org/licenses/LGPL/2.1/
 Version: 0.9
 Author:  Stefan Goessner/2006
 Web:     http://goessner.net/
 */


import { Injectable } from '@angular/core';

@Injectable()
export class XmlToJsonConverter {
    parseXml: any;

    constructor() {
        // alert('XmlToJsonConverter constructor!');

        if (typeof (<any>window).DOMParser !== 'undefined') {
            this.parseXml = function (xmlStr: string) {
                return ( new (<any>window).DOMParser() ).parseFromString(xmlStr, 'text/xml');
            };
        } else if (typeof (<any>window).ActiveXObject !== 'undefined' &&
            new (<any>window).ActiveXObject('Microsoft.XMLDOM')) {
            this.parseXml = function (xmlStr: string) {
                const xmlDoc = new (<any>window).ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = 'false';
                xmlDoc.loadXML(xmlStr);
                return xmlDoc;
            };
        } else {
            throw new Error('No XML parser found');
        }
    }


    public xml2json(xml0: any, tab: string) {
        const X = {
            toObj: function (xml: any) {
                let o = {};
                if (xml.nodeType === 1) {   // element node ..
                    if (xml.attributes.length) {   // element with attributes  ..
                        for (let i = 0; i < xml.attributes.length; i++) {
                            o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || '').toString();
                        }
                    }
                    if (xml.firstChild) { // element has child nodes ..
                        let textChild = 0, cdataChild = 0, hasElementChild = false;
                        for (let n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType === 1) {
                                hasElementChild = true;
                            } else if (n.nodeType === 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                                textChild++; // non-whitespace text
                            } else if (n.nodeType === 4) {
                                cdataChild++; // cdata section node
                            }
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(xml);
                                for (let n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType === 3) {  // text node
                                        // Use ..value instead of o['#text']
                                        // o['#text'] = X.escape(n.nodeValue);
                                        o['value'] = X.escape(n.nodeValue);
                                    } else if (n.nodeType === 4) { // cdata node
                                        o['#cdata'] = X.escape(n.nodeValue);
                                    } else if (o[n.nodeName]) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array) {
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        } else {
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                        }
                                    } else {  // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                    }
                                }
                            } else { // mixed content
                                if (!xml.attributes.length) {
                                    o = X.escape(X.innerXml(xml));
                                } else {
                                    // Use o.value instead of o['#text']
                                    // o['#text'] = X.escape(X.innerXml(xml));
                                    o['value'] = X.escape(X.innerXml(xml));
                                }
                            }
                        } else if (textChild) { // pure text
                            if (!xml.attributes.length) {
                                o = X.escape(X.innerXml(xml));
                            } else {
                                // Use o.value instead of o['#text']
                                // o['#text'] = X.escape(X.innerXml(xml));
                                o['value'] = X.escape(X.innerXml(xml));
                            }
                        } else if (cdataChild) { // cdata
                            if (cdataChild > 1) {
                                o = X.escape(X.innerXml(xml));
                            } else {
                                for (let n = xml.firstChild; n; n = n.nextSibling) {
                                    o['#cdata'] = X.escape(n.nodeValue);
                                }
                            }
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) {
                        o = null;
                    }
                } else if (xml.nodeType === 9) { // document.node
                    o = X.toObj(xml.documentElement);
                } else {
                    alert('unhandled node type: ' + xml.nodeType);
                }
                return o;
            },
            toJson: function (o: any, name: any, ind: any) {
                let json1 = name ? ('"' + name + '"') : '';
                if (o instanceof Array) {
                    for (let i = 0, n = o.length; i < n; i++) {
                        o[i] = X.toJson(o[i], '', ind + '\t');
                    }
                    json1 += (name ? ':[' : '[')
                               + (o.length > 1
                                    ? ('\n' + ind + '\t' + o.join(',\n' + ind + '\t') + '\n' + ind)
                                    : o.join('')) + ']';
                } else if (o == null) {
                    json1 += (name && ':') + 'null';
                } else if (typeof(o) === 'object') {
                    const arr: any = [];
                    for (const m in o) {
                        if (o.hasOwnProperty(m)) {
                            arr[arr.length] = X.toJson(o[m], m, ind + '\t');
                        }
                    }
                    json1 += (name ? ':{' : '{')
                               + (arr.length > 1
                                    ? ('\n' + ind + '\t' + arr.join(',\n' + ind + '\t') + '\n' + ind)
                                    : arr.join('')) + '}';
                } else if (typeof(o) === 'string') {
                    json1 += (name && ':') + '"' + o.toString() + '"';
                } else {
                    json1 += (name && ':') + o.toString();
                }
                return json1;
            },
            innerXml: function (node: any) {
                let s0 = '';
                if ('innerHTML' in node) {
                    s0 = node.innerHTML;
                } else {
                    const asXml = function (n: any) {
                        let s = '';
                        if (n.nodeType === 1) {
                            s += '<' + n.nodeName;
                            for (let i = 0; i < n.attributes.length; i++) {
                                s += ' ' + n.attributes[i].nodeName + '="' + (n.attributes[i].nodeValue || '').toString() + '"';
                            }
                            if (n.firstChild) {
                                s += '>';
                                for (let c = n.firstChild; c; c = c.nextSibling) {
                                    s += asXml(c);
                                }
                                s += '</' + n.nodeName + '>';
                            } else {
                                s += '/>';
                            }
                        } else if (n.nodeType === 3) {
                            s += n.nodeValue;
                        } else if (n.nodeType === 4) {
                            s += '<![CDATA[' + n.nodeValue + ']]>';
                        }
                        return s;
                    };
                    for (let c = node.firstChild; c; c = c.nextSibling) {
                        s0 += asXml(c);
                    }
                }
                return s0;
            },
            escape: function (txt: any) {
                return txt.replace(/[\\]/g, '\\\\')
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e: any) {
                e.normalize();
                for (let n = e.firstChild; n; ) {
                    if (n.nodeType === 3) {  // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            const nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        } else {
                            n = n.nextSibling;
                        }
                    } else if (n.nodeType === 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    } else {                     // any other node
                        n = n.nextSibling;
                    }
                }
                return e;
            }
        };
        xml0 = this.parseXml(xml0);
        if (xml0.nodeType === 9) { // document node
            xml0 = xml0.documentElement;
        }
        const json = X.toJson(X.toObj(X.removeWhite(xml0)), xml0.nodeName, '\t');
        return '{\n' + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, '')) + '\n}';
    }
}
