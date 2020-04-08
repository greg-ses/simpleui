export class UiObjList {
  label: string;
  desc: string;
  u_id: string;
  url: string;
  tooltip: string;
  elements: any [];

  constructor() {
    this.label = '';
    this.desc = '';
    this.u_id = '';
    this.url = '';
    this.tooltip = '';
    this.elements = [];
  }

  hasElements() {
    return ( (this.elements instanceof Array) && (this.elements.length > 0));
  }
}

