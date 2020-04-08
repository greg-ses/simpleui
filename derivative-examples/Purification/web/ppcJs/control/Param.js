// ~/control/Param
// Widget for displaying/setting a parameter
// for state machine, ref: svn://10.0.4.30/ppc_repo/trunk/web/Server/documentation/ParamControl states.vsd

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-construct', 'dojo/dom-style', 'dojo/dom-class', 'dojo/on',
        'dijit/form/CheckBox', 'dijit/form/TextBox', 'dijit/form/NumberTextBox', 'dijit/form/NumberSpinner', 'dijit/form/Button',
        '../utilities/Store',
        './_Control', '../mixin/_XhrClient', 'dojo/text!./param/template/param.html'],
function (declare, lang, construct, domStyle, domClass, on, 
        CheckBox, TextBox, NumberTextBox, NumberSpinner, Button,
        Store,
        _Control, _XhrClient, template) {
    return declare([_Control, _XhrClient],
    {
        // ajax request command constants
        _updateCmd: { COMMAND: 'PARAM_UPDATE' },
        _saveCmd: { COMMAND: 'PARAM_SAVE' },

        // dijit variables
        name: 'ParamControl',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'paramControl',

        //parameter type-specific input widget
        _inputBox: '',

        // dojox.data.XmlItem
        //  .element - treeNode xml element
        //  .q - tree path, ex: "/treeNode[0]/treeNode[0]/treeNode[0]"
        //  .store - dojox.data.XmlStore
        //      .url - need to parse root before '?', if query exists
        _item: '',

        _paramType: '',

        _onChangeHandle: '',


        // state machine
        viewStateEnum: {
            Initial: 0, 
            Edited: 1, 
            ActiveSet: 2 
        },
        viewArcEnum: {
            EditValue: 0,
            SetActive: 1,
            SaveActive: 2 
        },
        _viewState: '',
        _setView: function (arcEnum) {
            switch (this._viewState) {
                case (this.viewStateEnum.Initial):
                    if (arcEnum === this.viewArcEnum.EditValue) {
                        this._viewState = this.viewStateEnum.Edited;
                    }
                    break;

                case (this.viewStateEnum.Edited):
                    if (arcEnum === this.viewArcEnum.SetActive) {
                        this._viewState = this.viewStateEnum.ActiveSet;
                    }
                    break;

                // this.viewStateEnum.ActiveSet   
                default:
                    if (arcEnum === this.viewArcEnum.EditValue) {
                        this._viewState = this.viewStateEnum.Edited;
                    }
                    else if (arcEnum === this.viewArcEnum.SaveActive) {
                        // save active value
                        this._viewState = this.viewStateEnum.Initial;
                    }
            }

            this._decorateDOM(this._viewState);
        },


        // overrides
        postMixInProperties: function () {
            this.name = this._item.element.nodeName;
            this._viewState = this.viewStateEnum.Initial;
        },

        postCreate: function () {
            var xmlElement = this._item['element'];
            this._paramType = xmlElement.attributes['type'];
            var inputBoxId = this.id + '_inputBox';

            if (this._paramType.value === 'int') {
                this._inputBox = this._createNumberSpinner(xmlElement, inputBoxId);
            }
            else if (this._paramType.value === 'float') {
                this._inputBox = this._createFloatBox(xmlElement, inputBoxId);
            }
            else if (this._paramType.value === 'bool')  {
                this._inputBox = this._createCheckBox(xmlElement, inputBoxId);
            }
            else {
                this._inputBox = this._createTextBox(xmlElement, inputBoxId);
            }

            construct.place(this._inputBox.domNode, this.domNode, 'first');
            this._onChangeHandle = on(this._inputBox, 'change', lang.hitch(this, this.handleOnChange));
            console.log(this._inputBox.get('value'));

            this._decorateDOM(this._viewState);
        },


        // callbacks
        // action button click handler
        onButtonClick: function () {
            domStyle.set((this.actionButton).domNode, { visibility: 'hidden' });

            // make state dependent ajax call
            if (this._viewState === this.viewStateEnum.Edited) {
                // submit edited value. Ex: [url]/cgi-bin/cgicmd?CGI=PBsqreader&COMMAND=PARAM_UPDATE&PID=3&VSTR=333
                var reportedVal = this._inputBox.get('value');

                // convert boolean to int return value
                if (this._paramType.value === 'bool') {
                    if(this._inputBox.get('checked')) {
                        reportedVal = 1;
                    }
                    else {
                        reportedVal = 0;
                    }
                }

                var queryObj = { PID: this._getXElemAttribute('id'), VSTR: reportedVal };
                lang.mixin(queryObj, this._updateCmd);
                this.xhrGet(queryObj, this._handleXhrError, this._handleXhrLoad);
            }
            else if (this._viewState === this.viewStateEnum.ActiveSet) {
                // save active value. Ex: 	[url]/cgi-bin/cgicmd?CGI=PBsqreader&COMMAND=PARAM_SAVE&PID=3
                var queryObj = { PID: this._getXElemAttribute('id') };
                lang.mixin(queryObj, this._saveCmd);
                this.xhrGet(queryObj, this._handleXhrError, this._handleXhrLoad);
            }
        },

        // input value change handler
        handleOnChange: function () {
            this._setView(this.viewArcEnum.EditValue);
        },

        // overrides base 2xx ajax response handler
        _handleXhrLoad: function (response, ioArgs) {
            this.inherited(arguments);
            if (this._viewState === this.viewStateEnum.Edited) {
                this._setView(this.viewArcEnum.SetActive);
            }
            else if (this._viewState === this.viewStateEnum.ActiveSet) {
                this._setView(this.viewArcEnum.SaveActive);
            }
        },

        // overrides base 4xx ajax response handler
        _handleXhrError: function (response, ioArgs) {
            this.inherited(arguments);
            this._decorateDOM(this._viewState);
        },


        // private methods
        _createNumberSpinner: function (xElem, inputBoxId) {
            var activeVal = parseInt( Store.getElementText('active', xElem) );

            var properties = {
                name: inputBoxId,
                value: activeVal,
                smallDelta: 10,
                intermediateChanges: true,
                constraints: { min: this._getMin(xElem), max: this._getMax(xElem) }
            };

            return new NumberSpinner(properties);
        },

        _createFloatBox: function (xElem, inputBoxId) {
            var activeVal = parseFloat( Store.getElementText('active', xElem) );

            var properties = {
                name: inputBoxId,
                value: activeVal,
                intermediateChanges: true,
                constraints: { min: this._getMin(xElem), max: this._getMax(xElem), pattern: "#0.00" }
            };

            return new NumberTextBox(properties);
        },

        _createCheckBox: function (xElem, inputBoxId) {
            var activeVal = Store.getElementText('active', xElem);

            var properties = {
                name: inputBoxId,
                value: activeVal,
                checked: activeVal,
                intermediateChanges: true,
            };

            return new CheckBox(properties);
        },

        _createTextBox: function (xElem, inputBoxId) {
            var activeVal = Store.getElementText('active', xElem);

            var properties = {
                name: inputBoxId,
                value: activeVal,
                intermediateChanges: true,
                constraints: { length: 64 }
            };

            return new TextBox(properties);
        },

        _decorateDOM: function (currentState) {
            if (currentState === this.viewStateEnum.Edited) {
                domClass.toggle(this.domNode, 'paramControlEdited', true);
                this.actionButton.set('label', 'Set');
                domStyle.set((this.actionButton).domNode, { visibility: 'visible', marginTop: '0px', marginBottom: '0px' });
            }
            else if (currentState === this.viewStateEnum.ActiveSet) {
                this.actionButton.set('label', 'Save');
                domStyle.set((this.actionButton).domNode, { visibility: 'visible', marginTop: '0px', marginBottom: '0px' });
            }
            else if (currentState === this.viewStateEnum.Initial) {
                domClass.toggle(this.domNode, 'paramControlEdited', false);
                domStyle.set((this.actionButton).domNode, { visibility: 'hidden', marginTop: '0px', marginBottom: '0px' });
            }
        },

        _getMin: function (xElem) {
            return parseInt(xElem.attributes['min'].value, 10);
        },

        _getMax: function (xElem) {
            return parseInt(xElem.attributes['max'].value, 10);
        },

        _getXElemAttribute: function (attributeName) {
            var xmlElement = this._item['element'];
            return xmlElement.attributes[attributeName].value;
        }
    });
});