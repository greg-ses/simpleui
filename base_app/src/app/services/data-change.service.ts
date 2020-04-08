
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


export enum ObjRel {
    Identical,
    Equal,
    Changed,
    Different
}

export class DataChange {
    _keyField: any;
    _relationship: ObjRel;
    _oldValue: any;
    _newValue: any;

    public constructor(keyField: string, relationship: ObjRel, oldValue: any, newValue: any) {
        this._keyField = keyField;
        this._relationship = relationship;
        this._oldValue = oldValue;
        this._newValue = newValue;
    }
}
