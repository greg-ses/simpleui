import { UiObjList } from './ui-obj-list';
import { Section } from './section';
import { TaggedBoolean } from './tagged-boolean';
import { TaggedCommandList } from './tagged-command-list';
import { TaggedNumber } from './tagged-number';
import { TaggedString } from './tagged-string';
import { TaggedTimeStamp } from './tagged-timestamp';

export class DataSummary {
    json: any;
    Section: Section[] = [];
    status: { value: string };

    u_id: string;
    v: string;

    Title: TaggedString;
    Version: TaggedString;

    timeStamp: TaggedTimeStamp;
    hostname: string;
    Access: TaggedNumber;

// neither data nor cmd set; just display the pairs as they might appear
  NsElement: UiObjList;

  // StatusOverview:UiObjList;

//  emergency_commands:TaggedCommandList;

 commands: TaggedCommandList;

  // service_commands:TaggedCommandList;

  Inputs: {
    Title: TaggedString;
    Float_Switch: TaggedBoolean;
    Quad_Enabled: TaggedNumber;
  };

    constructor() {
        this.json = {};
        this.status = {'value': ''};
        this.u_id = '';

        this.timeStamp = {'u_id': '', 'value': 0};
        this.hostname = '';
        this.Access = {'u_id': '', 'value': 0, 'units': '', 'label': ''};

        this.Section = [];

        // this.StatusOverview = {'label': 'Status Overview', 'u_id': '', 'elements': []};

        // this.emergency_commands = {
        //   'u_id': '',
        //   'name': '',
        //   'local_mode': {'confirm': false, 'disabled': true, 'value': ''},
        //   'commandList':  []
        // };

        this.commands = {
          'u_id': '',
          'name': '',
          'local_mode': {'confirm': false, 'disabled': true, 'value': ''},
          'commandList':  []
        };

        // this.service_commands = {
        //   'u_id': '',
        //   'name': '',
        //   'local_mode': {'confirm': false, 'disabled': true, 'value': ''},
        //   'commandList':  []
        // };

        this.Inputs = {
          'Title': {'u_id': '', 'value': ''},
          'Float_Switch': {'u_id': '', 'value': false, 'trueLabel': 'On', 'falseLabel': 'Off'},
          'Quad_Enabled': {'u_id': '', 'value': 0, 'units': '', 'label': ''},
        };
    }
}
