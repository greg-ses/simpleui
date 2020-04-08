export class SiteIndex {
    id: number;
    urlHostName: string;
    overlayHostName: string;
    overlayResourceId: string;
    bscMySqlHost: string;
    mySqlDB: string;
    isOverlayConfigured: number;

    constructor() {
        this.id = -1;
        this.urlHostName = 'unknown-urlHostName';
        this.overlayHostName = 'unknown-overlayHostName';
        this.overlayResourceId = 'unknown-modResourceId';
        this.bscMySqlHost = 'unknown-bscMySqlHost';
        this.mySqlDB = 'unknown-mySqlDB';
        this.isOverlayConfigured = 0;
    }
}
