// ~/widget/LockedCheckBox
//  - 2-step unlock and set/clear checkbox widget combines two styled checkboxes with interlock
//  - tooltip displays from mouseover until the lock checkbox is clicked
//  - fires onChange event on mouseout if subject checkboxes value has changed

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojo/dom', 'dojo/dom-class',
        'dojo/on', 'dojo/mouse',
        'dijit/registry', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin',
        'dijit/form/CheckBox', 'dijit/Tooltip',
        '../utilities/Page', 'dojo/text!./lockedCheckBox/template/lockedCheckBox.html'],
function (declare, lang, array, dom, domClass,
          on, mouse,
          registry, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
          CheckBox, Tooltip,
          Page, template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // css classes
        _cssLockCheckBoxIcon: 'lcbLockIcon',
        _cssSubjectCheckBoxIcon: 'lcbBreakPointIcon',
        _cssActiveBg: 'basePanelHover',

        // dijit variables
        name: 'Locked Checkbox',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'lockedCheckBox',

        // private variables
        _id: '',
        _state: null,
        _inhibitUpdate: false,
        _value: false,  // bool, subject checkbox value

        // state machine
        stateEnum: {
            Blur: 0,
            FocusLocked: 1,
            FocusUnlocked: 2
        },

        arcEnum: {
            MouseOut: 0,
            ClickLock: 1,
            ClickUnlock: 2
        },

        // lifecycle methods
        constructor: function (id, /*optional*/subjectIconClass) {
            this._id = id;
            if (subjectIconClass) {
                this._cssSubjectCheckBoxIcon = subjectIconClass;
            }
        },

        postCreate: function () {
            this.inherited(arguments);
            domClass.add(this.lockCheckbox.domNode, this._cssLockCheckBoxIcon);
            domClass.add(this.subjectCheckbox.domNode, this._cssSubjectCheckBoxIcon);
            this._enterState(this.stateEnum.Blur);

            // wire events
            on(this.lockCheckbox.domNode, mouse.enter, lang.hitch(this, this._onMouseEnterLock));
            on(this.lockCheckbox.domNode, mouse.leave, lang.hitch(this, this._onMouseOutLock));
            on(dom.byId(this.containerNode), mouse.leave, lang.hitch(this, this._onMouseOut));
        },

        // public methods
        getId: function () {
            return this._id;
        },

        setValue: function (/*bool*/newValue) {
            if (!this._inhibitUpdate) {
                this._value = newValue;
                this.subjectCheckbox.set('checked', newValue);
            }
        },

        // private methods
        // state machine transition matrix
        _transitionState: function (/*arcEnum*/arc) {
            switch (arc) {
                case (this.arcEnum.MouseOut):
                    this._enterState(this.stateEnum.Blur);
                    break;

                case (this.arcEnum.ClickLock):
                    this._enterState(this.stateEnum.FocusLocked);
                    break;

                case (this.arcEnum.ClickUnlock):
                    this._enterState(this.stateEnum.FocusUnlocked);
                    break;

                default:
                    break;
            }
        },

        _enterState: function (/*stateEnum*/state) {
            switch (state) {
                case (this.stateEnum.Blur):
                    this._inhibitUpdate = false;
                    this.lockCheckbox.set('checked', true);
                    Page.disableDijit(this.subjectCheckbox);
                    domClass.remove(this.containerNode, this._cssActiveBg);

                    var newValue = this.subjectCheckbox.checked;
                    if (this._value != newValue) {
                        this._value = newValue;
                        this.onChange(newValue, this._id);
                    }
                    break;

                case (this.stateEnum.FocusLocked):
                    this._inhibitUpdate = false;
                    Page.disableDijit(this.subjectCheckbox);
                    domClass.remove(this.containerNode, this._cssActiveBg);
                    break;

                case (this.stateEnum.FocusUnlocked):
                    // enable subject
                    Tooltip.hide(this.lockCheckbox.domNode);
                    this._inhibitUpdate = true;
                    Page.enableDijit(this.subjectCheckbox);
                    domClass.add(this.containerNode, this._cssActiveBg);
                    break;

                default:
                    break;
            }

            this._state = state;
        },

        // callbacks
        _onMouseEnterLock: function () {
            var clearBpMsg = 'Unlock to clear this breakpoint';
            var setBpMsg = 'Unlock to set this breakpoint';
            var msg = this.subjectCheckbox.checked ? clearBpMsg : setBpMsg;
            Tooltip.show(msg, this.lockCheckbox.domNode);
        },

        _onMouseOutLock: function () {
            Tooltip.hide(this.lockCheckbox.domNode);
        },

        _onMouseOut: function () {
            this._transitionState(this.arcEnum.MouseOut);
        },

        _onLockClick: function (evt) {
            var lock = registry.getEnclosingWidget(evt.target);
            var arc = lock.checked ? this.arcEnum.ClickLock : this.arcEnum.ClickUnlock;
            this._transitionState(arc);
        },

        // public events
        onChange: function (checked, id) {
        }
    });
});