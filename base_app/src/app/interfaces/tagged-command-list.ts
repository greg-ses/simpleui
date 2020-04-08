import { TaggedCommand } from './tagged-command';

export class TaggedCommandList {
  u_id: string;
  name: string;

  local_mode: {
    confirm: boolean;
    disabled: boolean;
    value: string
  };

  commandList: Array<TaggedCommand>;
}

