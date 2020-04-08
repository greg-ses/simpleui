// ~/widget/PlayBack
// playback widget combines playback toggle buttons with radio button group modality

define(['dojo/_base/declare', 'dojo/dom', 'dojo/dom-class',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', 'dijit/form/ToggleButton', 'dijit/Dialog', 'dijit/form/Button',
        '../Enum', '../utilities/BasePanel', '../utilities/Page', 'dojo/text!./playBack/template/playBack.html'],
function (declare, dom, domClass,
          WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin, ToggleButton, Dialog, Button,
          Enum, BasePanel, Page, template) {
    return declare([WidgetBase, TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // icon css class names, in-line styles
        _cssSelectDisabled: 'pbSelectDisabled',
        _cssShowButton: 'pbShowButton',
        _cssHideButton: 'pbHideButton',
        _cssPauseLength: 'pbPauseLength',
        _cssNoPauseLength: 'pbNoPauseLength',

        // private variables
        _enabled: true,
        _state: Enum.PlayBackState.Stopped,

        // dijit variables
        name: 'PlayBack',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'playBack',

        // declaration time configuration
        showPauseButton: false,

        // public methods
        postCreate: function () {
            this.inherited(arguments);
            this._setStateOutputs(this._state);

            var pauseNode = dom.byId(this.pauseDiv);
            if (this.showPauseButton) {
                domClass.add(this.domNode, this._cssPauseLength);
                domClass.add(pauseNode, this._cssShowButton);
            }
            else {
                domClass.add(this.domNode, this._cssNoPauseLength);
                domClass.add(pauseNode, this._cssHideButton);
            }
        },

        // state machine
        playBackArcEnum: {
            Stop: 0,
            Pause: 1,
            Play: 2
        },

        enable: function () {
            this._enabled = true;
            this._setStateOutputs(this._state, false);
        },

        disable: function () {
            this._enabled = false;
            this._setStateOutputs(this._state, false);
            Page.disableDijit(this.playToggle);
            Page.disableDijit(this.pauseToggle);
            Page.disableDijit(this.stopToggle);
        },

        setState: function (/*Enum.PlayBackState*/newState) {
            this._setStateOutputs(newState, false);
        },

        getState: function () {
            return this._state;
        },

        // state machine methods
        _setView: function (/*playBackArcEnum*/arc) {
            switch (this._state) {
                case (Enum.PlayBackState.Stopped):
                    switch (arc) {
                        case (this.playBackArcEnum.Play):
                            this._setStateOutputs(Enum.PlayBackState.Running, true);
                            break;
                        default:
                            break;
                    }
                    break;

                case (Enum.PlayBackState.Paused):
                    switch (arc) {
                        case (this.playBackArcEnum.Stop):
                            this._setStateOutputs(Enum.PlayBackState.Stopped, true);
                            break;
                        case (this.playBackArcEnum.Play):
                            this._setStateOutputs(Enum.PlayBackState.Running, true);
                            break;
                        default:
                            break;
                    }
                    break;

                case (Enum.PlayBackState.Running):
                    switch (arc) {
                        case (this.playBackArcEnum.Stop):
                            this._setStateOutputs(Enum.PlayBackState.Stopped, true);
                            break;
                        case (this.playBackArcEnum.Pause):
                            this._setStateOutputs(Enum.PlayBackState.Paused, true);
                            break;
                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }
        },

        _setStateOutputs: function (/*Enum.PlayBackState*/newState, /*bool*/isUiAction) {
            this._state = newState;

            switch (newState) {
                case (Enum.PlayBackState.Stopped):
                    this._selectToggle(this.stopToggle);
                    this._unselectToggle(this.pauseToggle);
                    this._unselectToggle(this.playToggle);
                    break;
                case (Enum.PlayBackState.Paused):
                    this._unselectToggle(this.stopToggle);
                    this._selectToggle(this.pauseToggle);
                    this._unselectToggle(this.playToggle);
                    break;
                case (Enum.PlayBackState.Running):
                    this._unselectToggle(this.stopToggle);
                    this._unselectToggle(this.pauseToggle);
                    this._selectToggle(this.playToggle);
                    break;
                default:
                    break;
            }

            if (isUiAction) {
                this.onPlayStateChange(newState);
            }
        },

        _selectToggle: function (node) {
            node.set('checked', true);
            var cssSelect = this._enabled ? BasePanel._cssSelectBorder : this._cssSelectDisabled;
            domClass.replace(node.domNode.parentNode, cssSelect, [this._cssSelectDisabled, BasePanel._cssSelectBorder]);
            Page.disableDijit(node);
        },

        _unselectToggle: function (node) {
            node.set('checked', false);
            domClass.remove(node.domNode.parentNode, [this._cssSelectDisabled, BasePanel._cssSelectBorder]);
            if (this._enabled) {
                Page.enableDijit(node);
            }
        },

        // callbacks
        onPlayClick: function (event) {
            this._setView(this.playBackArcEnum.Play);
        },

        onPauseClick: function (event) {
            this._setView(this.playBackArcEnum.Pause);
        },

        onStopClick: function (event) {
            this.stopDialog.show();
        },

        onSubmitStopClick: function () {
            this._setView(this.playBackArcEnum.Stop);
        },

        onCancelStopClick: function () {
            this.stopDialog.hide();
        },

        // public events
        onPlayStateChange: function (/*Enum.PlayBackState*/newState) {
        }
    });
});