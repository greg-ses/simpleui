
export interface CommandArgs {
    valid: boolean;
    help: string;
    errors: string;
    mode: string;
    appName: string;
    webPort: string;
    xmlInFile: string;
    jsonOutFile: string;
}

export interface ProcessInfo {
    name: string;
    isRunning: boolean;
    nextCheck: number;
}

export interface UiPropStubs {
    uiProp: string,
    tabIndex: string,
    hash: string,
    todayStub: string,
    yesterdayStub: string,
    microSec: string
}