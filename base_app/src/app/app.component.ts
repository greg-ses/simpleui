import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AppProperties, SubscriptionState, TabUI, TitleBarProperties} from './interfaces/props-data';
import {ajax} from 'rxjs/ajax';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {interval} from 'rxjs';
import {DataSummary} from './interfaces/data-summary';
import {UTIL} from '../tools/utility';

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
    static _show_click_debug = false;


    @Output() selectedTabChange = new EventEmitter<MatTabChangeEvent>();

    _props = new AppProperties({});
    _appHash = AppComponent.getUniqueHash();
    _tBarProps = new TitleBarProperties();
    _refreshCycle = 0;
    _refreshRate = 1000;
    _pendingRequestWait = 10000;
    _updateSubscription = null;
    _errorMessage = '';
    _appURI = AppComponent.getServiceURI();
    _propsURL = AppComponent.getPropsURL();
    _theAppTitle = 'INITIAL-APP-TITLE';
    _globalProps = {
        _hiddenTables: []
    };
    _selectedTabIndex = 0;
    _autoRefreshEnabled = false;
    _commands_enabled = false;
    _propsSubscriptionState = SubscriptionState.Idle;
    _isDevMode = (document.location.port == "4200" ? true : false);


    _detectChanges: { 'name': string, 'value': boolean };

    @ViewChild('_tabGroup', {static: false}) _tabGroup !: MatTabGroup;

    static onWindowClick(event: MouseEvent) {
        if (!this._show_click_debug) return
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
        const base = document.getElementsByTagName('base')[0];
        return base['appURI'];
    }

    static getDataTabPath(incomingURL, tab_index, tab_hash, serverSideJsDebugging: boolean) {
        // TODO: verify that the hash stuff isn't being used for incremental update logic
        //       and remove.

        let querySuffix = '?ti=' + tab_index + '&hash=' + tab_hash;
        if (incomingURL.indexOf('?') > -1) {
            querySuffix = '&ti=' + tab_index + '&hash=' + tab_hash;
        }

        if (serverSideJsDebugging) {
            querySuffix += '&keepTempFile';
        }

        let prefix = '';
        if (window.location.port === '4200') {
            // Hack to support local development via docker and ng serv
            prefix = `http://localhost:4100`;
        }
        return `${prefix}${incomingURL}${querySuffix}`;
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
        //console.log('called AppComponent.resizeTabScrollRegion');
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
                            // console.log(`onscroll - tab: ${tabIndex},
                            //     scrollTop: ${targetElement.scrollTop}, scrollLeft: ${targetElement.scrollLeft}`);
                        }
                    } catch (e) {
                        // Do nothing
                        console.error(`resizeTabScrollRegion got error: ${e}`);
                    }
                };

            }
        }
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

    constructor() {}

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


    ngAfterViewInit(): void {
        // move to saved tab if it exists, got to first tab by default
        if (sessionStorage?.selectedTab) {
            this._selectedTabIndex = Number(sessionStorage.selectedTab);
            setTimeout( () => { this._tabGroup.selectedIndex = Number(sessionStorage.selectedTab) }, 1); // need to wait so DOM render
            this.selectedTabChange.emit({index: this._selectedTabIndex, tab: null});
        } else {
            this._selectedTabIndex = 0;
        }

        // do something with the 'scrolling region' of the tab
        if (Number(sessionStorage.selectedTab) === this._tabGroup.selectedIndex) {
            setTimeout(() => this.configureTabBar(), 1);
            AppComponent.doResizeTabScrollRegion({}, 10);
        } else {
            const scrollChangeWait = 1500;
            setTimeout(() => {
                if (typeof sessionStorage[`tab${this._selectedTabIndex}ScrollTop`] === 'string') {
                    const actualScrollElement = AppComponent.getActualScrollElement();
                    if (actualScrollElement) {
                        actualScrollElement.scrollTop = sessionStorage[`tab${this._selectedTabIndex}ScrollTop`];
                        actualScrollElement.scrollLeft = sessionStorage[`tab${this._selectedTabIndex}ScrollLeft`];
                    }
                }
            }, scrollChangeWait);
        }
    }

    public get globalProps(): any {
        return this._globalProps;
    }


    getCssToJsonURL(tab): string {
        let overlayNum = 1;
        const overlayImageUrl = tab['overlayImageUrl'];
        const matches = overlayImageUrl.match(/\/[^\/]*\/overlay-([0-9]+)\//);
        if (matches) {
            overlayNum = matches[1];
        }
        const url = AppComponent.getPropsURL().replace('/query/props', `/query/css_elements_to_json/overlay/${overlayNum}`);
        return url;
    }

    updateToggleButton() {
        const toggleButton = document.getElementById('dbPulse');

        if (this._props.tab[this._selectedTabIndex]._autoRefreshEnabled) {
            this._tBarProps._autoRefreshLabel = 'Pause';
            this._tBarProps._refreshState = 'indicatorOn';
            this._tBarProps._serverStatus = 'updates enabled';
            this._props.tab[this._selectedTabIndex]._commands_enabled = true;
        } else {
            this._tBarProps._autoRefreshLabel = 'Resume';
            this._tBarProps._refreshState = 'indicatorOff';
            this._tBarProps._serverStatus = 'updates paused';
        }
        toggleButton.className = this._tBarProps._refreshState;
        toggleButton.innerText = this._tBarProps._autoRefreshLabel;
    }


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
                AppComponent._show_click_debug = !AppComponent._show_click_debug;
                console.debug(`Click display is ${AppComponent._show_click_debug}`);
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

    getWindowLocationField(fieldName) {
        return window.location[fieldName];
    }

    getServiceName(suffix = '') {
        // TODO: handle the case of when this folder is serviced by another service
        return window.location.pathname.replace(/\//g, '') + suffix;
    }

    /**
     * Retrieves the props from simpleui server
     * @param uiProp
     * @returns
     */
    getProps(uiProp: string): void {

        if (this._props && this._props.initialized) {
            // already have properties - don't fetch again
            console.debug('Using cached _props');
            return;
        }

        console.debug(`AppComponent.getProps(${uiProp}) initializing...`);

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
                    console.error(`${this._propsURL} failed`);
                    alert(this._errorMessage + '\n\nPress F5 or REFRESH BUTTON to retry.');
                    this._propsSubscriptionState = SubscriptionState.ErrorFromAsyncResponse;
                }
            },
            err => {
                console.error(`Error in getProps() ajax subscribe callback.`, err);
            });
        this._propsSubscriptionState = SubscriptionState.AwaitingAsyncResponse;
    }

    /**
     * Updates application specific prop values
     * @param propsIn props object
     */
    onPropsUpdate(propsIn: any) {
        this._props = UTIL.deepCopy(propsIn);
        this._theAppTitle = (this._props?.instance != undefined ? this._props.instance : "DEFAULT-APP-TITLE")
        this._props.appURI = this._appURI;
        this._props.GLOBAL = this;

        this.initTabDataUpdates();
    }

    /**
     * Adjusts the size of the individual tabs to make them smaller
     */
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

                        tabLabel['style'].color = 'wheat';
                        tabLabel['style'].backgroundColor = '#673AB7';
                    } else if (tabLabel.tagName === 'MD-INK-BAR') {

                        tabLabel['style'].display = 'none';
                    } else {

                        tabLabel['style'].color = '#B4B7BA';
                        tabLabel['style'].backgroundColor = '#ECF2F9';
                    }

                    tabLabel['style'].top = TAB_TOP;
                    tabLabel['style'].height = TAB_BAR_HEIGHT;
                    tabLabel['style'].lineHeight = TAB_BAR_HEIGHT;
                }
            } catch (e) {
                console.error('error in configureTabBar: ', e);
            }
        }
    }

    onSelect(tab) {
        const newTabIndex = tab.index;
        sessionStorage.setItem('selectedTab', newTabIndex.toString());
        this._selectedTabIndex = newTabIndex;
        console.debug(`New Tab index: ${newTabIndex}`);
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


    initTabDataUpdates() {
        for (const tab of this._props.tab) {
            tab._DataSummary = new DataSummary();
            tab._autoRefreshEnabled = true;
            tab._commands_enabled = true;
            tab.pageType = tab.pageType || 'normal'; // Make 'normal' the default
            tab._lastUpdate = '1970-01-01 00:00.00';
            tab.hash = AppComponent.getUniqueHash();
        }

        this._refreshRate = 1000;
        if (this._props['refreshRate'] != undefined) {
            this._refreshRate = parseInt(this._props['refreshRate']);
            if (isNaN(this._refreshRate)) {
                this._refreshRate = 1000;
            }
        }

        this._refreshRate = Math.max(this._refreshRate, 1000); // Don't allow a refreshRate < 1000 ms

        const updateTimer = interval(this._refreshRate);

        this._updateSubscription = updateTimer.subscribe(
            _ => {
                this.doUpdate();
            },
            err => {
                console.error(`Error in initTabDataUpdates() ajax subscribe callback.`, err);
            });
    }

    /**
     * Main update loop of the base_app.
     */
    doUpdate() {
        try {
            if (!AppComponent._updatesSuspended) {
                for (const tab of this._props.tab) {
                    if (Number(tab.index) === this._selectedTabIndex) {
                        if (tab._autoRefreshEnabled) {
                            let serverSideJsDebugging = false;
                            this.getRemoteTabData(tab, tab.hash, serverSideJsDebugging);
                        }
                    }
                    this.updateMinColWidths(tab);
                }
            }
        } catch (err) {
            console.error(`AppComponent.doUpdate() error:`, err);
        }
    }

    updateMinColWidths(tab: any) {
        try {
            const dsHeads = document.getElementsByClassName('dataSetSizerHead');
            const dsBodies = document.getElementsByClassName('dataSetSizerBody');

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
            console.error(`updateMinColWidths got error ${e}`);
        }
    }

    init_common_props(tab: TabUI) {
        this._tBarProps._appTitle = this.getAppTitle();
        this._tBarProps._tabTitle = this.getTabTitle(tab);
        this._tBarProps._appVersion = this.getVersion(tab);
        this._tBarProps._uiVersionShort = this.getProp('uiVersionShort', 'app version short');
        this._tBarProps._uiVersionLong = this.getProp('uiVersionLong', 'app version long');
        this._tBarProps._updateTime = this.getUpdateTime(tab);
    }

    /**
     * Gets remote information for the selected tab
     * @param {TabUI} tab -
     * @param tab_hash -
     * @param {boolean} serverSideJsDebugging -
     */
    getRemoteTabData(tab: TabUI, tab_hash: string, serverSideJsDebugging: boolean) {

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
                    url: `${AppComponent.getDataTabPath(tab.dataUrl, tab.index, tab_hash, serverSideJsDebugging)}`,
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
                            //console.log('requested data...')
                        } else {
                            console.warn(`Got odd response: ${res.response}`);
                        }
                    },
                    err => {
                        console.error(`Error in getRemoteTabData() ajax subscribe callback.`, err);
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

        } else if (typeof response === 'object'
            && typeof response['Overlay_Summary'] === 'object') {

            this._detectChanges = {'name': tab.name, 'value': true};
            this.updateData(tab, response['Overlay_Summary']);
        }
    }

    updateData(tab: TabUI, ajaxDataSummary: any) {

        // Extract and delete the updateTime
        tab._updateTime = ajaxDataSummary.timeStamp.value;

        tab._DataSummary= UTIL.deepCopy(ajaxDataSummary);

        this.init_common_props(tab);
        this._tBarProps._serverStatus = 'Server connection okay';
        this._tBarProps._refreshState = 'indicatorOn';
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

}
