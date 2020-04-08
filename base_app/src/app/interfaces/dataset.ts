import { UiObjList } from './ui-obj-list';

export class DataSet extends UiObjList {

    geometry = { menuPos: 'top', orientation: 'horizontal'};
}

export class DataSetChangeList {
    datasets_instance_u_id: string;
    sectionUpdateNeeded: boolean;
    changed_dsItem_u_ids: Array<string> = [];
}

export class SectionChangeList {
    tabName: string;
    changed: boolean;
    section: any;
    dataSetChangeList_arr: Array<DataSetChangeList> = [];
}


export class PropDefinedDataSet extends DataSet {
    props = {
        index: '0',
        id: 'tableId',
        element: 'table-name',
        item: 'item',
        columns: []
    };
}

