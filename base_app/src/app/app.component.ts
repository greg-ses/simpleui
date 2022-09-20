import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
//import './css/styles.css';
import {AppProperties, SubscriptionState, TabUI, TitleBarProperties} from './interfaces/props-data';
import {ajax} from 'rxjs/ajax';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {interval} from 'rxjs';
import {ClientLogger, LogLevel} from '../tools/logger';
import {DataSummary} from './interfaces/data-summary';
import {UTIL} from '../tools/utility';
// import {AppEditUiPanelComponent} from './app-tab-overlay/app-edit-ui-panel-component';
// import {Subscriber} from 'rxjs/src/internal/Subscriber';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [],
    selector: 'app-simpleui',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

/*
 * AppComponent communications with children:
 * 1. AppComponent listens for events sent from AppTabComponent
 * 2. AppComponent _tBarProps is an @Input to AppTitleBarComponent
 */

export class AppComponent implements OnInit, AfterViewInit /*, OnChanges */ {
    static _updatesSuspended = false;
    static _trackClicks = false;
    static _mouseDownSuspendsUpdates = false;
    static _minutesBeforeAutoPageReload_Default = 30; // Time until the page auto-refreshes, doing automatic garbage collection
    static _logLevel = LogLevel.CRITICAL;

    @Output() selectedTabChange = new EventEmitter<MatTabChangeEvent>();

    _props = new AppProperties({});
    _appHash = AppComponent.getUniqueHash();
    _tBarProps = new TitleBarProperties();
    _refreshCycle = 0;
    _refreshRate = 1000;
    _pendingRequestWait = 10000;
    _updateSubscription = null;
    _milliSecondsBeforeAutoPageReload = AppComponent._minutesBeforeAutoPageReload_Default * 60 * 1000;
    _debugRefreshCycle = 0;
    _errorMessage = '';
    _appURI = AppComponent.getServiceURI();
    _propsURL = AppComponent.getPropsURL();
    _theAppTitle = 'INITIAL-APP-TITLE';
    _globalProps = {};
    _fullUpdateRequired = false;
    _selectedTabIndex = 0;
    _autoRefreshEnabled = false;
    _commands_enabled = false;
    _propsSubscriptionState = SubscriptionState.Idle;
    /*
        // appOptions is normally hidden - can be enabled for development
        _appOptionsVisible = false;
        _appOptions = [
            { name: 'mouseDownSuspendsUpdates', description: 'Mouse Down Suspends Updates', value: true},
            { name: 'trackMouseClicks', description: 'Track Mouse Clicks', value: false}
        ];
    */
    _detectChanges: { 'name': string, 'value': boolean };

    @ViewChild('_tabGroup', {static: false}) _tabGroup !: MatTabGroup;

    static onWindowClick(event: MouseEvent) {
        const e = document.getElementById('eventMsg');
        e.innerHTML = 'Clicked on target: ';

        if (typeof event.target['u_id'] === 'string') {
            e.innerHTML += event.target['u_id'] + ' / ' + event.target['tagName'];
        } else {
            e.innerHTML += event.target['tagName'];
        }

        if ((typeof event.target['className'] === 'string') && event.target['className']) {
            e.innerHTML += ' / ' + event.target['className'];
        }
        e.style.display = 'block';
        setTimeout(() => {
            const e1 = document.getElementById('eventMsg');
            e1.innerHTML = '';
            e1.style.display = 'none';
        }, 3000);
    }

    static onMouseDown(event: MouseEvent) {
        if (AppComponent._mouseDownSuspendsUpdates) {
            AppComponent._updatesSuspended = true;
        }
        if (AppComponent._trackClicks) {
            const eventMsgObj = document.getElementById('eventMsg');
            let e: EventTarget = event.target;
            eventMsgObj.innerText = '';
            for (let i = 0; i < 10; i++) {
                if (e instanceof HTMLElement) {
                    eventMsgObj.innerText +=
                        e['nodeName'] + (typeof e['id'] === 'string' ? (' ' + e['id']) + ' < ' : ' < ');
                    e = e.parentElement;
                }
            }
            eventMsgObj.title = eventMsgObj.innerText;
            eventMsgObj.style.backgroundColor = '#777777';
        }
    }

    static onMouseUp(event: MouseEvent) {
        if (AppComponent._trackClicks) {
            const e = document.getElementById('eventMsg');
            e.innerText = '';
            e.style.backgroundColor = '';

            if (event.target) {
                // event.target.dispatchEvent(new MouseEvent('click', event));
                event.preventDefault();
                event.stopPropagation();
            }
        }
        if (AppComponent._mouseDownSuspendsUpdates) {
            AppComponent._updatesSuspended = false;
        }
    }

    static getUniqueHash(): string {
        const s = Math.random().toString();
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            // tslint:disable-next-line:no-bitwise
            hash += Math.imul(31, s.charCodeAt(i) | 0);
        }
        return hash.toString();
    }

    static getPropsURL(): string {
        const base = document.getElementsByTagName('base')[0];
        return base['propsQuery'];
    }

    static getServiceURI(): string {

        /*
        let path = '';
        const pos = window.location.pathname.indexOf('/index.html');
        if (pos > -1) {
            path = window.location.pathname.substr(pos);
        } else if (window.location.pathname === '/' || window.location.pathname === '/context.html') {
            path = '/simpleui/';
        } else {
            path = window.location.pathname;
        }

        return (window.location.protocol + '//' + window.location.hostname + path);
        */

        const base = document.getElementsByTagName('base')[0];
        return base['appURI'];

    }

    static getDataTabRelativePath(relativeURL, tab_index, tab_hash, serverSideJsDebugging) {

        // Default assumes relativeURL is a complete URL

        let querySuffix = '?ti=' + tab_index + '&hash=' + tab_hash;
        if (relativeURL.indexOf('?') > -1) {
            querySuffix = '&ti=' + tab_index + '&hash=' + tab_hash;
        }

        if (serverSideJsDebugging) {
            querySuffix += '&keepTempFile';
        }

        // Relative path
        return relativeURL + querySuffix;
    }


    static doResizeTabScrollRegion(evt: any, timeout = 10) {
        if (evt) {
        }
        setTimeout(() => {
            AppComponent.resizeTabScrollRegion();
        }, timeout);
    }

    static getActualScrollElement(): HTMLElement {
        let actualScrollElement = null;
        const tabScrollRegion = document.getElementsByClassName('tabScrollRegion');
        if (typeof tabScrollRegion === 'object' && tabScrollRegion.hasOwnProperty('0')) {
            actualScrollElement = tabScrollRegion[0].parentElement;
        }
        return actualScrollElement;
    }

    static resizeTabScrollRegion() {
        console.log('called AppComponent.resizeTabScrollRegion');
        const actualScrollElement = AppComponent.getActualScrollElement();
        if (actualScrollElement) {
            actualScrollElement.style.width = window.innerWidth + 'px';
            actualScrollElement.style.height = window.innerHeight - 98 + 'px';
            if (document.body['onscroll'] && typeof document.body['onscroll'] === 'function') {
                document.body['onscroll'](new UIEvent('fix-layout'));
            }

            if (!(actualScrollElement['onscroll'] instanceof Function)) {

                actualScrollElement['onscroll'] = function (event) {
                    try {
                        const targetElement = <HTMLElement>event.target;
                        const pattern = targetElement.parentElement.id.match(/mat-tab-content-[0-9]+-([0-9]+)/);
                        if (pattern instanceof Array) {
                            const tabIndex = pattern[1];
                            sessionStorage[`tab${tabIndex}ScrollTop`] = targetElement.scrollTop;
                            sessionStorage[`tab${tabIndex}ScrollLeft`] = targetElement.scrollLeft;
                            console.log(`onscroll - tab: ${tabIndex},
                                scrollTop: ${targetElement.scrollTop}, scrollLeft: ${targetElement.scrollLeft}`);
                        }
                    } catch (e) {
                        // Do nothing
                    }
                };

            }
        }
    }

    @Output() onFullUpdateRequired(fullUpdateRequired) {
        this._fullUpdateRequired = fullUpdateRequired;
    }

    @Output() onUpdateModelOfChildDataSet(evt: any) {
        if (this._props.tab[evt.uiTab.index]._DataSummary['Section'][evt.sectionIdx]['DataSets'][evt.dataSetsIdx] !== evt.newChildData) {
            this._props.tab[evt.uiTab.index]._DataSummary['Section'][evt.sectionIdx]['DataSets'][evt.dataSetsIdx] = evt.newChildData;
        } else {
            console.log(
                'Unnecessary call to onUpdateModelOfChildDataSet('
                + 'sectionIdx:' + evt.sectionIdx
                + ', dataSetsIdx: ' + evt.dataSetsIdx
                + ') - src and target are identical');
        }
    }

    constructor(
    ) {
    }

    ngOnInit() {
        const base = document.getElementsByTagName('base')[0];

        this.getProps(base['uiProp']);

        window.addEventListener('click', function (event: MouseEvent) {
            AppComponent.onWindowClick(event);
        });
        window.addEventListener('mousedown', function (event: MouseEvent) {
            AppComponent.onMouseDown(event);
        });
        window.addEventListener('mouseup', function (event: MouseEvent) {
            AppComponent.onMouseUp(event);
        });
        window.addEventListener('resize', function (event) {
            AppComponent.doResizeTabScrollRegion(event);
        });

        AppComponent.doResizeTabScrollRegion(null, 100);
    }

    ngAfterViewInit() {
        if (parseInt(sessionStorage.selectedTab, 10) === this._tabGroup.selectedIndex) {
            setTimeout(() => this.configureTabBar(), 1);
            AppComponent.doResizeTabScrollRegion({}, 10);
        } else {
            const scrollChangeWait = 1500;
            setTimeout(() => {
                let rememberedTab = parseInt(sessionStorage.selectedTab, 10);
                rememberedTab = Math.max(0, rememberedTab);
                this._tabGroup.selectedIndex = rememberedTab;
                this.selectedTabChange.emit({index: rememberedTab, tab: null});
                setTimeout(() => {
                    if (typeof sessionStorage[`tab${rememberedTab}ScrollTop`] === 'string') {
                        const actualScrollElement = AppComponent.getActualScrollElement();
                        if (actualScrollElement) {
                            actualScrollElement.scrollTop = sessionStorage[`tab${rememberedTab}ScrollTop`];
                            actualScrollElement.scrollLeft = sessionStorage[`tab${rememberedTab}ScrollLeft`];
                            console.log(`Restored tab: ${rememberedTab},
                                scrollTop: ${actualScrollElement.scrollTop},
                                scrollLeft: ${actualScrollElement.scrollLeft}`);
                        }
                    }
                }, scrollChangeWait);
            }, 1);
        }
    }

    public get globalProps(): any {
        return this._globalProps;
    }

    displayBrokenCommsDialog() {
        // this._errorPopup
        /*
        <mat-tab *ngIf="(!_props || !_props['uiProp'])">
            <ng-template mat-tab-label>Stalled Communications</ng-template>
        <div class="tabScrollRegion">
        <div class="tabBody">
        <div [className]="_props['appTheme'].name">
        <div style="width:100%; padding:50px">
            <br>Waiting to receive properties from: <a [href]="propsURL">{{_propsURL}}</a>
        <br>&nbsp;
        <br>On host <b>{{ getWindowLocationField('hostname') }}</b>, execute the command:
        <pre>sudo systemctl status {{ getServiceName('-web') }}</pre>
        If necessary, execute this command to restart the service:
            <pre>sudo systemctl restart {{ getServiceName('-web') }}</pre>
        Once the service is running, refresh this page.
        </div>
        </div>
        </div>
        </div>
        </mat-tab>
        */
    }

    /*
    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
            this._changeDetectorRef.markForCheck();
    }

    registerPopupDialog(popupDialog) {
        this.popupDialog = popupDialog;
    }

    */

    updateToggleButton() {
        const toggleButton = document.getElementById('dbPulse');

        if (this._props.tab[this._selectedTabIndex]._autoRefreshEnabled) {
            this._tBarProps._autoRefreshLabel = 'Pause';
            this._tBarProps._refreshState = 'indicatorOn';
            this._tBarProps._serverStatus = 'updates enabled';
            this._props.tab[this._selectedTabIndex]._commands_enabled = true;
            /*
            const miniConsole: HTMLElement = document.getElementById('miniConsole');
            if (miniConsole.className === 'miniConsoleAnnounce') {
                this.unDisplayRefreshPausedMessage();
            }
            */
        } else {
            this._tBarProps._autoRefreshLabel = 'Resume';
            this._tBarProps._refreshState = 'indicatorOff';
            this._tBarProps._serverStatus = 'updates paused';
        }
        toggleButton.className = this._tBarProps._refreshState;
        toggleButton.innerText = this._tBarProps._autoRefreshLabel;
    }

    /*
    mockButtonClick() {
        alert('hello mock button');
    }
    */

    onToggleAutoRefresh(event: MouseEvent) {
        const selectedTab = this._props.tab[this._selectedTabIndex];
        if (event) {
            if (event.ctrlKey && event.shiftKey) {
                // CTRL-SHIFT-CLICK
                AppComponent._trackClicks = window.confirm('Enable click tracking?');
            } else if (event.ctrlKey && event.altKey) {
                // CTRL-ALT-CLICK
                AppComponent._mouseDownSuspendsUpdates = window.confirm('Suspend data/GUI updates on MOUSEDOWN?');
            } else if (event.shiftKey && event.altKey) {
                // SHIFT-ALT-CLICK
                ClientLogger.initialize();
                window['setLoggingFeatures']();
            } else if (event.shiftKey && !selectedTab._autoRefreshEnabled) {
                // SHIFT-CLICK with updates paused
                selectedTab._commands_enabled  = window.confirm(`Allow commands even when refresh is paused (developers only)?`);
            } else {
                const newVal = !selectedTab._autoRefreshEnabled;
                selectedTab._autoRefreshEnabled = newVal;
                selectedTab._commands_enabled = newVal;
                // this._changeDetectorRef.detectChanges();
                this.updateToggleButton();
                // this._changeDetectorRef.detach();
            }
        }
        // event.preventDefault();
        // event.stopPropagation();
    }

    onMoveElement(event: MouseEvent) {
        if (event) {
            if (event.ctrlKey && event.shiftKey) {
                // CTRL-SHIFT-CLICK
            } else if (event.ctrlKey && event.altKey) {
                // CTRL-ALT-CLICK
            } else if (event.shiftKey && event.altKey) {
                // SHIFT-ALT-CLICK
            } else {
                const container = document.getElementById('unimplementedOverlaysContainer');
                const newPos = window.prompt(
                    'Enter the new TOP,LEFT for unimplementedOverlaysContainer',
                    `${parseInt(getComputedStyle(container)['top'], 10)}, ${parseInt(getComputedStyle(container)['left'], 10)}`);
                const arr = newPos.split(',');
                if (arr.length === 2) {
                    container.style.top = `${arr[0]}px`;
                    container.style.left = `${arr[1]}px`;
                }
            }
            event.preventDefault();
        }
    }

    onEditUIElements(event) {
        if (event) {
            /*
                if (event.ctrlKey && event.shiftKey) {
                    window['editUiPanel'] = new AppEditUiPanelComponent();
                    setTimeout(() => window['editUiPanel'].create(), 1000);
                } else if (event.shiftKey) {
                    AppComponent.turnOffAnimatedGifs();
                }
           */
            }
    }

    getWindowLocationField(fieldName) {
        return window.location[fieldName];
    }

    getServiceName(suffix = '') {
        // TODO: handle the case of when this folder is serviced by another service
        return window.location.pathname.replace(/\//g, '') + suffix;
    }

    getProps(uiProp: string): void {

        if (this._props && this._props.initialized) {
            // already have properties - don't fetch again
            console.log('Using cached _props');
            return;
        }

        if (AppComponent._logLevel >= LogLevel.VERBOSE) {
            console.log(`AppComponent.getProps(${uiProp} initializing...`);
        }

        const ajaxRequest = {
            url: this._propsURL,
            withCredentials: true,
            crossDomain: true,
            timeout: 5001
        };
        const propsData$ = ajax(ajaxRequest);
        propsData$.subscribe(
            res => {
                this._propsSubscriptionState = SubscriptionState.ProcessingAsyncResponse;
                if (res.status === 200 && typeof res.response === 'object' && typeof res.response.props === 'object') {
                    this.onPropsUpdate(res.response.props);
                    this._propsSubscriptionState = SubscriptionState.Idle;
                } else {
                    console.log(`${this._propsURL} failed`);
                    alert(this._errorMessage + '\n\nPress F5 or REFRESH BUTTON to retry.');
                    this._propsSubscriptionState = SubscriptionState.ErrorFromAsyncResponse;
                }
            },
            err => {
                console.log(`Error in getProps() ajax subscribe callback.`);
                try {
                    console.log('  name: ' + err.name + ', message: ' + err.message + ', url: ' + err.request.url);
                } catch (err1) {
                    console.log('Error trying to display error');
                }
            });
        this._propsSubscriptionState = SubscriptionState.AwaitingAsyncResponse;
    }

    onPropsUpdate(propsIn: any) {
        this._props = propsIn;
        if (typeof this._props.instance === 'object'
            && typeof this._props.instance['name'] === 'string') {
            this._theAppTitle = this._props.instance['name'];
        } else {
            this._theAppTitle = 'DEFAULT-APP-TITLE';
        }

        this._props.appURI = this._appURI;
        this._props.GLOBAL = this;

        this.initTabDataUpdates();
    }


    configureTabBar() {
        // Just want this to adjust the tab height
        const TAB_BAR_HEIGHT = '20px';
        const TAB_TOP = '';

        const matTabGroups = document.getElementsByTagName('mat-tab-group');
        if (typeof matTabGroups === 'object'
            && typeof matTabGroups[0] === 'object'
            && ('children' in matTabGroups[0])
            && matTabGroups[0].children.length > 0) {

            try {
                const tabGroup = matTabGroups[0];
                const matTabHeader = tabGroup.children[0];
                matTabHeader['style'].height = TAB_BAR_HEIGHT;
                matTabHeader['style'].lineHeight = TAB_BAR_HEIGHT;
                const tabsParent = matTabHeader.children[1].children[0].children[0];
                for (let i = 0; i < tabsParent.children.length; i++) {
                    const tabLabel = tabsParent.children[i];
                    if (typeof tabLabel !== 'object') {
                        continue;
                    }

                    if (i === this._selectedTabIndex) {
                        // console.log('matTabHeader.children[' + i + '].tagName:', child.tagName, '.className:', child.className);

                        tabLabel['style'].color = 'wheat';
                        tabLabel['style'].backgroundColor = '#673AB7';
                    } else if (tabLabel.tagName === 'MD-INK-BAR') {
                        // console.log('tabLabel.tagName:', tabLabel.tagName);

                        tabLabel['style'].display = 'none';
                    } else {
                        // console.log('tabLabel.tagName:', tabLabel.tagName, '.className:', tabLabel.className);

                        tabLabel['style'].color = '#B4B7BA';
                        tabLabel['style'].backgroundColor = '#ECF2F9';
                    }

                    tabLabel['style'].top = TAB_TOP;
                    tabLabel['style'].height = TAB_BAR_HEIGHT;
                    tabLabel['style'].lineHeight = TAB_BAR_HEIGHT;
                }
            } catch (e) {
                console.log('error: ', e);
            }
        }
    }

    onSelect(tab) {
        const newTabIndex = Math.max(0, parseInt(tab.index, 10));
        console.log('New Tab Index: ' + tab.index);
        this._selectedTabIndex = newTabIndex;
        sessionStorage.selectedTab = newTabIndex;
        if (typeof sessionStorage[`tab${newTabIndex}ScrollTop`] === 'undefined') {
            sessionStorage[`tab${newTabIndex}ScrollTop`] = 0;
        }
        if (typeof sessionStorage[`tab${newTabIndex}ScrollLeft`] === 'undefined') {
            sessionStorage[`tab${newTabIndex}ScrollLeft`] = 0;
        }
        this.updateToggleButton();
        this.configureTabBar();
        AppComponent.doResizeTabScrollRegion({}, 200);
    }


    // Reimplemented functions and those from app-tab.component.ts
    initTabDataUpdates() {
        let i = 0;
        for (const tab of this._props.tab) {
            tab._DataSummary = new DataSummary();
            tab._autoRefreshEnabled = true;
            tab._commands_enabled = true;
            tab.pageType = tab.pageType || 'normal'; // Make 'normal' the default
            tab._lastUpdate = '1970-01-01 00:00.00';
            tab.hash = AppComponent.getUniqueHash();
            i++;
        }

        let minutesBeforeAutoPageReload = AppComponent._minutesBeforeAutoPageReload_Default;
        if ((this._props instanceof Object)
            && (typeof this._props['minutesBeforeAutoPageReload'] === 'string')) {
            minutesBeforeAutoPageReload = parseInt(this._props['minutesBeforeAutoPageReload'], 10);
            if (isNaN(minutesBeforeAutoPageReload)) {
                minutesBeforeAutoPageReload = AppComponent._minutesBeforeAutoPageReload_Default;
            }
        }
        // Restrict minutesBeforeAutoPageReload range to (1..30)
        minutesBeforeAutoPageReload = Math.max(Math.min(minutesBeforeAutoPageReload, AppComponent._minutesBeforeAutoPageReload_Default), 1);
        this._milliSecondsBeforeAutoPageReload = minutesBeforeAutoPageReload * 60 * 1000;

        this._refreshRate = 1000;
        if ((this._props instanceof Object)
            && (typeof this._props['refreshRate'] === 'string')) {
            this._refreshRate = parseInt(this._props['refreshRate'], 10);
            if (isNaN(this._refreshRate)) {
                this._refreshRate = 1000;
            }
        }
        this._refreshRate = Math.max(this._refreshRate, 1000); // Don't allow a refreshRate < 1000 ms

        const updateTimer = interval(this._refreshRate);

        this._updateSubscription = updateTimer.subscribe(
            cycle => {
                this.doUpdate(cycle);
            },
            err => {
                console.log(`Error in initTabDataUpdates() ajax subscribe callback.`);
                try {
                    console.log('  name: ' + err.name + ', message: ' + err.message + ', url: ' + err.request.url);
                } catch (err1) {
                }
            });
    }

    doUpdate(cycle: number = 0) {
        try {
            if ((cycle * this._refreshRate) > this._milliSecondsBeforeAutoPageReload) {
                sessionStorage.autoReload = 'true';
                setTimeout(() => {
                    document.location.reload();
                }, 1);
            }

            if (!AppComponent._updatesSuspended) {
                for (const tab of this._props.tab) {
                    if (Number(tab.index) === this._selectedTabIndex) {
                        if (tab._autoRefreshEnabled) {
                            ClientLogger.log('LogRefreshCycle', `Tab ${Number(tab.index)}, cycle #${this._refreshCycle} of ${cycle} -` +
                                `REFRESHING (AutoRefreshEnabled: true.  Tab Selected: true)`);

                            let serverSideJsDebugging = false;
                            if (ClientLogger.isFeatureEnabled('ServerSideJsDebugging')) {
                                if (this._debugRefreshCycle++ < 100) {
                                    serverSideJsDebugging = true;
                                } else {
                                    // Disable refresh and ServerSideJsDebugging
                                    tab._autoRefreshEnabled = false;
                                    tab._commands_enabled = false;
                                    ClientLogger.enableFeature('ServerSideJsDebugging', false);
                                    ClientLogger.logToMiniConsole('ServerSideJsDebugging has expired.');
                                    this._debugRefreshCycle = 0;
                                }
                            } else {
                                this._debugRefreshCycle = 0;
                            }

                            this.getRemoteTabData(tab, tab.hash, serverSideJsDebugging);
                        } else {
                            ClientLogger.log('LogRefreshCycle', `Tab ${Number(tab.index)}, cycle #${this._refreshCycle} of ${cycle} - ` +
                                `SKIPPED (AutoRefreshEnabled: false.  Tab Selected: true)`);
                        }
                    } else {
                        ClientLogger.log('LogRefreshCycle', `Tab ${Number(tab.index)}, cycle #${this._refreshCycle} of ${cycle} -` +
                            `SKIPPED (AutoRefreshEnabled: ${tab._autoRefreshEnabled}.  Tab Selected: false)`);
                    }
                    this.updateMinColWidths(tab);
                }
            }
        } catch (e) {
            console.log(`AppComponent.doUpdate() error: ${e.toString()}`);
        }
    }

    updateMinColWidths(tab: any) {
        try {
            const dsHeads = document.getElementsByClassName('dataSetSizerHead');
            const dsBodies = document.getElementsByClassName('dataSetSizerBody');


            if (AppComponent._logLevel >= LogLevel.VERBOSE) {
                console.log(`Called AppComponent.updateMinColWidths(${tab.name}`);
            }

            if ((dsHeads.length > 0) && (dsHeads.length === dsBodies.length)) {

                for (let i = 0; i < dsHeads.length; i++) {
                    const firstHead = dsHeads[i].children[0].children[0];
                    const firstLabel: HTMLElement = <HTMLElement>dsBodies[i].children[0].children[0];
                    const firstValue: HTMLElement = <HTMLElement>(dsBodies[i].children[0].children[1]);

                    if (typeof dsHeads['minWidthUpdateCount'] === 'undefined') {
                        dsHeads['minWidthUpdateCount'] = 0;
                    } else {
                        dsHeads['minWidthUpdateCount'] += 1;
                        if (dsHeads['minWidthUpdateCount'] > 4) {
                            continue;
                        }
                    }

                    if ((firstHead.tagName.toUpperCase() === 'TH')
                        && (firstLabel.tagName.toUpperCase() === 'TH')
                        && (firstValue.tagName.toUpperCase() === 'TD')
                    ) {
                        const firstHeadWidth = parseInt(window.getComputedStyle(firstHead)['width'], 10) - 2;
                        const firstHeadMinWidth = parseInt(window.getComputedStyle(firstHead)['minWidth'], 10);

                        const firstLabelWidth = parseInt(window.getComputedStyle(firstLabel)['width'], 10);
                        const firstLabelMinWidth = parseInt(window.getComputedStyle(firstLabel)['minWidth'], 10);

                        const firstValueWidth = parseInt(window.getComputedStyle(firstValue)['width'], 10);
                        const firstValueMinWidth = parseInt(window.getComputedStyle(firstValue)['minWidth'], 10);

                        const maximum_width = Math.max(firstHeadWidth, (firstLabelWidth + firstValueWidth));
                        const maximum_minWidth = Math.max(firstHeadMinWidth, (firstLabelMinWidth + firstValueMinWidth));

                        if ((maximum_width > maximum_minWidth)
                            || (firstHeadWidth > (firstLabelWidth + firstValueWidth))) {

                            const new_firstLabel_minWidth = Math.max(firstLabelWidth, (firstHeadWidth - firstValueWidth));
                            if (firstLabelWidth > firstLabelMinWidth) {
                                firstLabel.style.minWidth = ('' + new_firstLabel_minWidth.toString() + 'px');
                            }

                            const new_firstValue_minWidth = Math.max(firstValueWidth, (firstHeadWidth - firstLabelWidth));
                            if (firstValueWidth > firstValueMinWidth) {
                                firstValue.style.minWidth = ('' + new_firstValue_minWidth.toString() + 'px');
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }


    isDeltaUpdate(tab: TabUI) {
        return (tab._DataSummary
            && typeof tab._DataSummary === 'object'
            && typeof tab._DataSummary['updateType'] === 'string'
            && (tab._DataSummary['updateType'] === 'delta'));
    }

    aboutDialog() {
        const aboutMsg =
            'About'
            + '\n\nApp Title: ' + this.getAppTitle()
            + '\n\nSimple UI Version Short: ' + this.getProp('uiVersionShort', 'ui version short')
            + '\n\nSimple UI Version Long: ' + this.getProp('uiVersionLong', 'ui version long')
            + '\n\nApp Title: ' + this.getProp('uiVersionLong', 'app version long');

        alert(aboutMsg);
    }

    init_common_props(tab: TabUI) {
        this._tBarProps._appTitle = this.getAppTitle();
        this._tBarProps._tabTitle = this.getTabTitle(tab);
        this._tBarProps._appVersion = this.getVersion(tab);
        this._tBarProps._uiVersionShort = this.getProp('uiVersionShort', 'app version short');
        this._tBarProps._uiVersionLong = this.getProp('uiVersionLong', 'app version long');
        this._tBarProps._updateTime = this.getUpdateTime(tab);
    }

    getRemoteTabData(tab: TabUI, tab_hash, serverSideJsDebugging) {

        if (this.isDeltaUpdate(tab)) {
            ClientLogger.log('DeltaUpdate', 'Partial Update');
        } else {
            ClientLogger.log('DeltaUpdate', 'Full Update');
        }

        this._tBarProps._refreshState = 'indicatorPending';
        this._tBarProps._serverStatus = 'Server connection pending';
        this.init_common_props(tab);

        this._refreshCycle++;

        if (typeof tab === 'object' && typeof tab.dataUrl === 'string') {
            const now = new Date();
            if ((typeof tab._pendingRequestExpiration !== 'number')
                || (tab._pendingRequestExpiration < now.valueOf())) {

                // Wait "_pendingRequestWait" milliseconds to before sending another next ajax request
                tab._pendingRequestExpiration = now.valueOf() + this._pendingRequestWait;

                const ajaxRequest = {
                    url: `http://localhost:4100${AppComponent.getDataTabRelativePath(tab.dataUrl, tab.index, tab_hash, serverSideJsDebugging)}`,
                    withCredentials: true,
                    crossDomain: true,
                    timeout: parseInt(this.getProp('ajaxTimeout', '5001'), 10)
                };
                const remoteData$ = ajax(ajaxRequest);
                remoteData$.subscribe(
                    res => {
                        if (res.status === 200 && typeof res.response === 'object' && (null !== res.response)) {
                            tab._pendingRequestExpiration = 0; // Cancel wait
                            this.onTabDataUpdate(tab, res.response);
                        }
                    },
                    err => {
                        console.log(`Error in getRemoteTabData() ajax subscribe callback.`);
                        try {
                            console.log('  name: ' + err.name + ', message: ' + err.message + ', url: ' + err.request.url);
                        } catch (err1) {
                            console.log('error logging ajax error in getRemoteTabData()');
                        }
                    });
            }
        }
    }

    onTabDataUpdate(tab: TabUI, response: any) {
        if (typeof response === 'object'
            && typeof response['Data_Summary'] === 'object'
            && typeof response['Data_Summary']['status'] === 'string'
            && response['Data_Summary']['status'] === '0') {

            this._detectChanges = {'name': tab.name, 'value': true};
            this.updateData(tab, response['Data_Summary']);
            ClientLogger.log('LogRefreshCycleCount', 'Cycle #' + this._refreshCycle + ' completed.');
            
        } else if (typeof response === 'object'
            && typeof response['Overlay_Summary'] === 'object') {

            this._detectChanges = {'name': tab.name, 'value': true};
            this.updateData(tab, response['Overlay_Summary']);
            ClientLogger.log('LogRefreshCycleCount', 'Cycle #' + this._refreshCycle + ' completed.');

        } else {
            ClientLogger.log('LogRefreshCycleCount', 'Cycle #' + this._refreshCycle + ' completed with error (EMPTY RESPONSE).');
        }
    }

    updateData(tab: TabUI, ajaxDataSummary: any) {

        // Extract and delete the updateTime
        tab._updateTime = ajaxDataSummary.timeStamp.value;
        // delete ajaxDataSummary.timeStamp;
        if (this._fullUpdateRequired) {
            tab._DataSummary = ajaxDataSummary;
            this._fullUpdateRequired = false;
        } else {
            UTIL.recursiveUpdate(tab._DataSummary, ajaxDataSummary);
        }

        this.init_common_props(tab);
        this._tBarProps._serverStatus = 'Server connection okay';
        this._tBarProps._refreshState = 'indicatorOn';

        /*
                if ((sessionStorage.autoReload === 'true') && (this._refreshCycle > 2) ) {
                    setTimeout(() => this.displayRefreshPausedMessage(), 1);
                    sessionStorage.autoReload = 'false';
                }

        */
        // this._changeDetectorRef.markForCheck();
        // this._changeDetectorRef.detectChanges();
        // this._changeDetectorRef.detach();
    }

    getUpdateTime(tab: TabUI) {
        let dTime = '';

        if (typeof tab === 'object' && typeof tab._updateTime === 'string') {
            // Based on update_time_display from VTS_main.html.
            const system_utc = new Date();
            system_utc.setTime(tab._updateTime);
            dTime = system_utc.toDateString() + ', ' + system_utc.toLocaleTimeString();
        }

        return dTime;
    }

    getProp(propName: string, defaultValue: any = 'default') {
        let value = defaultValue;
        if (typeof this._props === 'object'
            && typeof this._props[propName] === 'object'
            && typeof this._props[propName]['value'] === 'string') {
            value = this._props[propName]['value'];
        }
        return value;
    }

    getAppTitle() {
        let dTitle = '';
        if (typeof this._props === 'object'
            && typeof this._props.instance === 'object'
            && typeof this._props.instance.name === 'string') {
            dTitle = this._props.instance.name;
        }
        return dTitle;
    }

    getTabTitle(tab: TabUI) {
        let dTitle = '';
        if (typeof tab._DataSummary === 'object' && typeof tab._DataSummary.Title === 'object') {
            dTitle = tab._DataSummary.Title.value;
        }
        return dTitle;
    }

    getVersion(tab: TabUI) {
        let dVersion = 'App Version';
        if ((typeof tab._DataSummary === 'object')
            && (typeof tab._DataSummary.Version === 'object')
            && (typeof tab._DataSummary.Version.value === 'string')) {
            dVersion = tab._DataSummary.Version.value;
        }
        return dVersion;
    }

    hasProps() {
        return (this._props instanceof Object);
    }

    hasProp(key: string) {
        return ((this._props instanceof Object) && (typeof this._props[key] !== 'undefined'));
    }

}
