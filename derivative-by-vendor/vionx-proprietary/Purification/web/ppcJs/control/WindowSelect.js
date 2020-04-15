// ~/control/WindowSelect
// fixed and moving window selector control
// accordian to toggle between controlling a moving or fixed window
// can export Control's state from fixed window for reproducing state in another _MovingWindowClient Panel

/* (declarative) property configuration example:
        data-dojo-props= "windowSizeMap:[{key: 3600, value: '1 hour'},
                                         {key: 18000, value: '5 hours'},
                                         {key: 86400, value: '24 hours'},
                                         {key: 432000, value: '5 days'}  ], 
                          triggerEnabled:true"
*/
// cookie:
//  wscState - ./windowSelect/wsDto.State

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/on', 'dojo/json',
        'dijit/registry', 'dijit/layout/AccordionContainer', 'dijit/layout/ContentPane', 'dojox/layout/TableContainer',
        'dijit/form/Select', 'dijit/form/Button', 'dijit/form/DateTextBox', 'dijit/form/TimeTextBox', 'dijit/form/NumberSpinner',
        '../Enum', '../utilities/DataFormat', '../utilities/Identity', '../widget/CollapseToggle', '../widget/FadeoutAlertBox', '../widget/iPhoneButton',
        './_Control', '../mixin/_CookieClient', './windowSelect/wsDto', 'dojo/text!./windowSelect/template/windowSelect.html'],
function (declare, lang, array, construct, domClass, on, json,
        registry, AccordionContainer, ContentPane, TableContainer,
        Select, Button, DateTextBox, TimeTextBox, NumberSpinner,
        Enum, DataFormat, Identity, CollapseToggle, FadeoutAlertBox, iPhoneButton,
        _Control, _CookieClient, wsDto, template) {
    return declare([_Control, _CookieClient],
    {
        // constants
        _msPerHour: 60 * 60 * 1000,

        // dijit variables
        name: 'WindowSelectControl',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'windowSelectControl',

        // enums and maps
        viewStateEnum: {
            InitialFixed: 0,
            ReadyToSubmit: 1,
            DatesSet: 2,
            Moving: 3
        },

        displayModeEnum: {
            RealTime: 0,
            FixedTime: 1,
            All: 2
        },

        // path options between viewStates
        viewArcEnum: {
            InitializeFixed: 0,
            SetData: 1,
            SubmitData: 2,   // differentiated from SetData so 2nd edit won't move viewState from ReadyToSubmit to DatesSet
            InitializeMoving: 3
        },

        // cookies
        _cookieName: 'wsState',
        _resourceName: { value: 0},   // for indexing cookies by resource, static to synchronize across all Control instances

        // private variables
        _handlerList: null,
        _movingLengthSelect: null,
        _fixedLengthSelect: null,
        _viewState: '',
        _importedState: false,

        // window type, size selection
        _selectedWindowType: '',    // Enum.WindowData
        _windowSizeLabels: '',

        // public configuration variables (declare statically in html of hosting panel or dynamically in ctor obj)
        // array of objects mapping window size (sec) to display text where each map item consists of an int key (sec) and string value
        // ex: windowSizeMap = [{key: 300, value: '5 minutes'},{key: 900, value: '15 minutes'}]
        windowSizeMap: '',
        triggerEnabled: false,   // true = enable trigger UI
        triggerDisplayDefaultVisible: false,    // true = show expanded as default if triggerEnabled
        useCookie: true,    // true= read/write cookie (or in-memory object)
        displayMode: 0,     // displayModeEnum modes to display

        // lifecycle methods
        constructor: function () {
            this._handlerList = new Array();
            this._viewState = this.viewStateEnum.InitialFixed;
            this.displayMode = this.displayModeEnum.All;
        },

        postCreate: function () {
            this.inherited(arguments);

            switch (this.displayMode) {
                case (this.displayModeEnum.RealTime):
                    this._setUpRealTimePane();
                    this.accordian.removeChild(registry.byId(this.fixedTimePane));
                    this._selectedWindowType = Enum.WindowData.Moving;
                    break;

                case (this.displayModeEnum.FixedTime):
                    this._setUpFixedTimePane();
                    this.accordian.removeChild(registry.byId(this.realTimePane));
                    this._selectedWindowType = Enum.WindowData.Fixed;
                    break;

                case (this.displayModeEnum.All):
                default:
                    this._setUpRealTimePane();
                    this._setUpFixedTimePane();
                    this._selectedWindowType = Enum.WindowData.Moving;
                    break;
            }
        },

        startup: function () {
            this.inherited(arguments);
            this.accordian.resize();
        },

        // public methods
        // overrides _Control.configure
        // queryObj contains variable 'wscState' with value of cookie contents as string
        configure: function (queryObj) {
            if (this.useCookie) {
                this._updateCookieFromQuery(this._cookieName, queryObj, this._resourceName.value);
                var state = this._getStateFromCookie();
                this.setState(state);
            }
            else if (!this._importedState) {
                this._transitionState(this.viewArcEnum.InitializeMoving);
            }
            else {
                this._importedState = false;
            }
        },

        // set resource ID for cookie indexing
        setResource: function (resourceName) {
            this._resourceName.value = resourceName;
            var state = this._getStateFromCookie();
            this.setState(state);
        },

        setRTEnable: function (/*bool*/enable) {
            var windowQualifiedEnable = (enable && this.isMovingWindow());
            this.realTimeToggle.setValue(windowQualifiedEnable);
        },

        // returns selected window length in sec
        getWindowLength: function () {
            if (this.isMovingWindow()) {
                return parseInt(this._movingLengthSelect.get('value'));
            }
            else {
                var startTime = this.getStartTime();
                var endTime = this._getEndTime();
                var windowLengthMs = endTime.getTime() - startTime.getTime();
                return DataFormat.toInt(windowLengthMs / 1000);
            }
        },

        // returns Enum.WindowData
        getWindowType: function () {
            return this._selectedWindowType;
        },

        // returns Date object
        getStartTime: function () {
            return ( this.isMovingWindow()? null : this._getStartTime() );
        },

        // set view as if data has been submitted
        setAsSubmitted: function () {
            this._transitionState(this.viewArcEnum.SubmitData);
            this.setRTEnable(true);
        },

        // import fixed window state to this Control. Used, for example, for cloning Control's state across Panels.
        // Set state if an allowed display mode for this Control.
        // Note: seconds and ms are zeroed
        setState: function (/*wsDto.State*/state) {
            this._importedState = true;
            var allowedDisplayMode = (state.window == Enum.WindowData.Moving) && (this.displayMode != this.displayModeEnum.FixedTime) ||
                (state.window == Enum.WindowData.Fixed) && (this.displayMode != this.displayModeEnum.RealTime);
            if (allowedDisplayMode) {
                this._selectedWindowType = state.window;
            }

            if (this.isMovingWindow()) {
                this.accordian.selectChild(dijit.byId(this.realTimePane));
                this._movingLengthSelect.set('value', state.windowLengthSec);
            }
            else {
                this.accordian.selectChild(dijit.byId(this.fixedTimePane));
                this._transitionState(this.viewArcEnum.SubmitData);
            }

            this._setDateTime(this.startDate, this.startTime, state.startTime);
            this._setDateTime(this.endDate, this.endTime, state.endTime);
            var triggerTime = state.trigger ? state.trigger.time : state.startTime;
            this._setDateTime(this.triggerDate, this.triggerTime, triggerTime);
            this._rescaleFixedTimeSpinners();

            if (state.trigger) {
                this.triggerTypeSelect.set('value', state.trigger.type);
                this.triggerValInput.set('value', state.trigger.value);
                console.log('triggerValInput=' + this.triggerValInput.get('value'));
            }

            if (this.useCookie) {
                this._saveStateToCookie(state.startTime, state.endTime);
            }
        },

        getTrigger: function () {
            if (this.isMovingWindow() || !this.triggerEnabled) {
                return null;
            }
            else {
                return this._getTrigger();
            }
        },

        addCookieAsProperty: function (/*object*/cookiesObj) {
            if (this.useCookie) {
                this._addCookieAsStringProperty(cookiesObj, this._cookieName, this._resourceName.value);
            }
        },

        isMovingWindow: function () {
            return (this._selectedWindowType === Enum.WindowData.Moving);
        },


        // private methods
        _getTrigger: function () {
            var time = this.triggerTime.get('value');
            var sec = time.getSeconds();
            var min = time.getMinutes();
            var hrs = time.getHours();

            var date = this.triggerDate.get('value');
            if (date) {
                date.setSeconds(sec);
                date.setMinutes(min);
                date.setHours(hrs);
            }

            var type = parseInt(this.triggerTypeSelect.get('value'));
            var value = this.triggerValInput.get('value');
            var trigger = new wsDto.Trigger(date.getTime(), type, value);

            return trigger;
        },

        // initialize all date/times to current
        _createDefaultState: function () {
            var timestamp = new Date().getTime();
            var trigger = new wsDto.Trigger(timestamp, Enum.TriggerType.V, 100);
            var state = new wsDto.State(this._selectedWindowType, this.getWindowLength(), timestamp, timestamp);
            return state;
        },

        _setUpRealTimePane: function () {
            this._mapWindowLabels();
            this._movingLengthSelect = this._addWindowSelect(this.realTimeTable);
        },

        _setUpFixedTimePane: function () {
            if (this.triggerEnabled) {
                this.puP.showDomNode(this.triggerBlock);
                if (this.triggerDisplayDefaultVisible) {
                    this.displayTriggerToggle.setExpanded(true);
                    this.puP.showDomNode(this.triggerSelect);
                }
            }
            else {
                this.puP.hideDomNode(this.triggerBlock);
            }

            // initialize end time selectors to allow window validation
            this.endTime.set('value', new Date(), false);
            this.endDate.set('value', new Date(), false);
        },

        _mapWindowLabels: function () {
            this._windowSizeLabels = new Array();

            array.forEach(this.windowSizeMap, function (mapItem) {
                this._windowSizeLabels.push({ value: mapItem.key.toString(), label: mapItem.value });
            }, this);
        },

        _addWindowSelect: function (/*table*/table) {
            var select = new dijit.form.Select({
                options: this._windowSizeLabels,
                title: 'Window Size'
            });
            table.addChild(select);
            this._handlerList.push(on(select, 'change', lang.hitch(this, this._onWindowLengthChange)));
            return select;
        },

        // returns Date object
        _getStartTime: function () {
            return this._getDateTime(this.startDate, this.startTime);
        },

        // returns Date object
        _getEndTime: function () {
            return this._getDateTime(this.endDate, this.endTime);
        },

        // returns Date object
        _getDateTime: function (/*DateTextBox*/dateTextBox, /*TimeTextBox*/timeTextBox)
        {
            var time = timeTextBox.get('value');
            var sec = time.getSeconds();
            var min = time.getMinutes();
            var hrs = time.getHours();

            var dateTime = dateTextBox.get('value');
            if (dateTime) {
                dateTime.setSeconds(sec);
                dateTime.setMinutes(min);
                dateTime.setHours(hrs);
            }

            return dateTime;
        },

        _setDateTime: function (/*DateTextBox*/dateTextBox, /*TimeTextBox*/timeTextBox, /*int, ms since epoch*/timestamp) {
            var dateTime = new Date(timestamp);
            timeTextBox.set('value', dateTime, false);

            dateTime.setSeconds(0);
            dateTime.setMinutes(0);
            dateTime.setHours(0);
            dateTextBox.set('value', dateTime, false);
        },

        // state machine transition matrix
        _transitionState: function (/*viewArcEnum*/arc) {
            // check global cases first
            switch (arc) {
                case (this.viewArcEnum.InitializeMoving):
                    this._enterState(this.viewStateEnum.Moving);
                    break;

                case (this.viewArcEnum.InitializeFixed):
                    this._enterState(this.viewStateEnum.InitialFixed);
                    break;

                case (this.viewArcEnum.SubmitData):
                    this._enterState(this.viewStateEnum.DatesSet);
                    break;

                default:
                    // state dependent cases
                    switch (this._viewState) {
                        case (this.viewStateEnum.InitialFixed):
                            if (arc === this.viewArcEnum.SetData) {
                                this._enterState(this.viewStateEnum.ReadyToSubmit);
                            }
                            break;

                        case (this.viewStateEnum.DatesSet):
                            if (arc === this.viewArcEnum.SetData) {
                                this._enterState(this.viewStateEnum.ReadyToSubmit);
                            }
                            break;

                        default:
                            break;
                    }
                    break;
            }
        },

        _enterState: function (/*viewStateEnum*/newState) {
            this._viewState = newState;
            switch (this._viewState) {
                case (this.viewStateEnum.Moving):
                    this.setRTEnable(true);
                    break;

                case (this.viewStateEnum.InitialFixed):
                    this.startDate.set('value', null, false);
                    this.puP.hideDomNode(this.fixedEndTimeSelect);
                    this.puP.hideDijit(this.getFixedWindowButton);
                    break;

                case (this.viewStateEnum.ReadyToSubmit):
                    this.puP.showDomNode(this.fixedEndTimeSelect);
                    this.puP.showDijit(this.getFixedWindowButton);
                    break;

                case (this.viewStateEnum.DatesSet):
                    this.puP.showDomNode(this.fixedEndTimeSelect);
                    this.puP.hideDijit(this.getFixedWindowButton);
                    break;

                default:
                    break;
            }
        },

        // rescale fixed time spinner resolutions to correlate with window size
        _rescaleFixedTimeSpinners: function () {
            var windowLengthSec = this.getWindowLength();

            var clickIncrement = 'T00:30:00';
            var visibleIncrement = 'T01:00:00';

            if (windowLengthSec <= 5400) {  // Less then an hour and half
                var clickIncrement = 'T00:05:00';
                var visibleIncrement = 'T00:30:00';
            }

            this.startTime.constraints.clickableIncrement = clickIncrement;
            this.triggerTime.constraints.clickableIncrement = clickIncrement;
            this.endTime.constraints.clickableIncrement = clickIncrement;
            this.startTime.constraints.visibleIncrement = visibleIncrement;
            this.triggerTime.constraints.visibleIncrement = visibleIncrement;
            this.endTime.constraints.visibleIncrement = visibleIncrement;
        },

        // args optional if window type is moving
        _saveStateToCookie: function (/*Date or int, ms since epoch*/startTime, /*Date or int, ms since epoch*/endTime) {
            if (startTime) {
                var startTimeMs = Identity.isObject(startTime) ? startTime.getTime() : startTime;
            }
            else {
                var startTimeMs = this._getStartTime().getTime();
            }
            if (endTime) {
                var endTimeMs = Identity.isObject(endTime) ? endTime.getTime() : endTime;
            }
            else {
                var endTimeMs = this._getEndTime().getTime();
            }

            var trigger = this._getTrigger();
            var state = new wsDto.State(this._selectedWindowType, this.getWindowLength(), startTimeMs, endTimeMs, trigger);
            this._updateCookieList(this._cookieName, this._resourceName.value, state);
        },

        // returns wsDto.State object from cookie if it exists, default state if not
        _getStateFromCookie: function () {
            var state = this._getItemFromCookieList(this._cookieName, this._resourceName.value);
            if (!state) {
                state = this._createDefaultState();
            }

            return state;
        },

        // private event handlers
        _onSelectChild: function (child, /*bool*/isMouseEvent) {
            if (isMouseEvent) {
                var paneId = this.accordian.selectedChildWidget.dojoAttachPoint;    // accordian autogenerates ID
                this._selectedWindowType = (paneId === 'realTimePane') ? Enum.WindowData.Moving : Enum.WindowData.Fixed;

                if (this._selectedWindowType === Enum.WindowData.Fixed) {
                    var state = this._getStateFromCookie();
                    state.window = this._selectedWindowType;
                    this.setState(state);
                }
                else {
                    this._transitionState(this.viewArcEnum.InitializeMoving);
                    this.setRTEnable(false);
                }

                if (this.useCookie) {
                    this._saveStateToCookie();
                }
                this.onSwitchChild(this._selectedWindowType);
            }
        },

        _onWindowLengthChange: function () {
            var windowLength = parseInt(this._movingLengthSelect.get('value'));
            this.onWindowLengthChange(windowLength, this.getStartTime());
            if (this.useCookie) {
                this._saveStateToCookie();
            }
        },

        _onRealTimeToggleChange: function () {
            var enable = this.realTimeToggle.get('value');
            this.onRealTimeToggle(enable);
        },

        _onTriggerTypeSelectChange: function () {
            var triggertype = parseInt(this.triggerTypeSelect.get('value'));
            switch (triggertype) {
                case (Enum.TriggerType.I):
                    this.triggerValInput.set('value', 0);
                    this.triggerValInput.set('smallDelta', 1);
                    this.triggerValInput.set('largeDelta', 10);
                    this.triggerValInput.set('constraints', { min: 0, max: 1000, places: 0 });
                    break;
                case (Enum.TriggerType.V):
                    this.triggerValInput.set('value', 100);
                    this.triggerValInput.set('smallDelta', 1);
                    this.triggerValInput.set('largeDelta', 10);
                    this.triggerValInput.set('constraints', { min: 0, max: 1000, places: 0 });
                    break;
                case (Enum.TriggerType.W):
                    this.triggerValInput.set('value', 1000);
                    this.triggerValInput.set('smallDelta', 50);
                    this.triggerValInput.set('largeDelta', 1000);
                    this.triggerValInput.set('constraints', { min: 0, max: 10000, places: 0 });
                    break;
                default:
                    break;
            }

            this._transitionState(this.viewArcEnum.SetData);
        },

        _onTriggerValueClick: function () {
            this._transitionState(this.viewArcEnum.SetData);
        },

        _onStartDateTimeSelectChange: function () {

            if (this.getWindowLength() > 0) {
                this._rescaleFixedTimeSpinners();
            }
            else {
                this.endTime.set('value', this.startTime.get('value'), false);
                this.endDate.set('value', this.startDate.get('value'), false);
            }
            this._transitionState(this.viewArcEnum.SetData);
        },

        _onEndDateTimeSelectChange: function () {
            if (this.getWindowLength() > 0) {
                this._rescaleFixedTimeSpinners();
                this._transitionState(this.viewArcEnum.SetData);
            }
            else {
                this.startTime.set('value', this.endTime.get('value'), false);
                this.startDate.set('value', this.endDate.get('value'), false);
            }
        },

        _onGetFixedWindowClick: function () {
            var windowLength = this.getWindowLength();
            if (windowLength > 0) {
                var startTime = this.getStartTime();
                if (this.useCookie) {
                    this._saveStateToCookie(startTime, this._getEndTime());
                }
                this.onFixedWindowSelected(windowLength, startTime);
                this._transitionState(this.viewArcEnum.SubmitData);
            }
            else {
                this.fadeoutAlertBox.show('The ending time and date must follow the starting time and date.');
            }
        },

        _onDisplayTriggerToggleChange: function (evt) {
            if (this.displayTriggerToggle.checked) {
                this.puP.showDomNode(this.triggerSelect);
            }
            else {
                this.puP.hideDomNode(this.triggerSelect);
            }
        },


        // public events
        // real-time window length changed
        onWindowLengthChange: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
        },

        onRealTimeToggle: function (/*bool*/enable) {
        },

        onFixedWindowSelected: function (/*int, sec*/windowLength, /*Date(), optional, for fixed window*/startTime) {
        },

        // event triggered on switching accordian panes
        onSwitchChild: function (/*Enum.WindowData*/windowType) {
        }
    });
});
