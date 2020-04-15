import {DataSummary} from './data-summary';

/**
 * Created by kcummings on 11/30/16.
 */

export enum SubscriptionState {
    Idle,
    AwaitingAsyncResponse,
    ProcessingAsyncResponse,
    ErrorFromAsyncResponse
}

export class AppLink {
    _name: string;
    _href: string;
    _tooltip: string;
}

export class TabUI {
    index: number;
    id: string;
    name: string;
    dataUrl: string;
    commandUrl: string;
    pageType: string;
    hash: string;
    _DataSummary: DataSummary;
    _autoRefreshEnabled: boolean;
    _updateTime: number;
    _pendingRequestExpiration: number;

    constructor () {
        return {
            index: -1,
            id: '',
            name: '',
            dataUrl: '',
            commandUrl: '',
            pageType: 'normal',
            hash: '00000',
            _DataSummary: new DataSummary(),
            _autoRefreshEnabled: false,
            _updateTime: 18000000, // '1970-01-01 00:00.00'
            _pendingRequestExpiration: 0
        };
    }
}

export class TitleBarProperties {
    _appPath: string;
    _autoRefreshLabel: string;
    _eventMsg: string;
    _appTitle: string;
    _tabTitle: string;
    _appVersion: string;
    _uiVersionShort: string;
    _uiVersionLong: string;
    _miniConsoleText: string;
    _updateTime: string;
    _refreshState: string;
    _serverStatus: string;

    constructor () {
        return {
            _appPath: '/simpleui/',
            _autoRefreshLabel: 'Pause',
            _eventMsg: '',
            _appTitle: 'App Title',
            _tabTitle: 'Tab Title',
            _appVersion: 'App Version',
            _uiVersionShort: 'UI Version Short',
            _uiVersionLong: 'UI Version Long',
            _miniConsoleText: '',
            _updateTime: '1970-01-01 00:00.00',
            _refreshState: 'indicatorOn',
            _serverStatus: 'Server connection pending'
        };
    }
}

export class AppProperties {
    public tab: Array<any>;
    public appURI: string;
    public appVersion: string;
    public uiVersionLong: string;
    public uiVersionShort: string;
    public appTheme: any;
    public initialized: boolean;
    public GLOBAL: any;
    public selectedIndex: number;
    public logLevel: number;
    public mode: string;
    public instance: any;
    public appLink: Array<AppLink>;

    constructor( propsIn: any ) {
        this.tab = [];
        this.appURI = '/simpleui/';
        this.appVersion = 'App Version';
        this.uiVersionLong = 'UI Version Long';
        this.uiVersionShort = 'UI Version Short';
        this.appTheme = { 'name': 'SimpleUiBlue' };
        this.initialized = false;
        this.GLOBAL = null;
        this.selectedIndex = 0;
        this.logLevel = 0;
        this.mode = '';
        this.instance = { 'name': 'UNNAMED' };
        this.appLink = [
            {_name: 'Link1', _href: 'about:blank', _tooltip: 'Link1 tooltip'},
            {_name: 'Link2', _href: 'about:blank', _tooltip: 'Link2 tooltip'},
            {_name: 'Link3', _href: 'about:blank', _tooltip: 'Link3 tooltip'}
        ];

        if (typeof propsIn === 'object') {
            for (const key of Object.keys(propsIn)) {
                if (propsIn.hasOwnProperty(key)) {
                    this[key] = propsIn[key];
                    if (key === 'tab' && Array.isArray((propsIn[key])) && propsIn[key].length > 0) {
                        this.initialized = true;
                    }
                }
            }
        }
    }
}
