import { CmdSet } from './cmdset';
import { DataSet } from './dataset';
import { UiObjList } from './ui-obj-list';

export class Section extends UiObjList{
    name = 'default-section';
    u_id = '0';
    menuPos = 'top';
    rowCount = 0;
    colCount = 0;
    orientation = 'horizontal';
    DataSets: DataSet[] = [];
    CmdSet: CmdSet[] = [];
}
