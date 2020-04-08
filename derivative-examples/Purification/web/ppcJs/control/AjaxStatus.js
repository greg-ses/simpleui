// ~/control/AjaxStatus
// AJAX communication status/fault monitor Control

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-class', 'dojo/topic',
        '../Enum', '../PubSub', '../utilities/DateString', '../bizLogic/generic/FlashTimer',
        './_Control', 'dojo/text!./ajaxStatus/template/ajaxStatus.html'],
function (declare, lang, dom, domClass, topic,
        Enum, PubSub, DateString, FlashTimer,
        _Control, template) {

    // private variables
    _flashTimer = null;
    _inhibitClear = false;   // true = don't clear fault displayed

    return declare([_Control],
    {
        // public configuration variables
        showWhenNoFault: true,  // if false, initially hides timestampDiv

        // dijit variables
        name: 'AJAX Status Control',
        templateString: template,
        baseClass: 'ajaxStatusControl',

        // css class names/in-line code
        _cssHide: 'ascHide',
        _cssShow: 'ascShow',
        _cssDisplay: 'bcShow',
        _cssNoDisplay: 'bcHide',

        // public methods
        constructor: function () {
            topic.subscribe(PubSub.timeUpdate, lang.hitch(this, this.onTimeUpdate));
            topic.subscribe(PubSub.commTimeout, lang.hitch(this, this.onCommTimeout));
            topic.subscribe(PubSub.commFault, lang.hitch(this, this.onCommFault));
        },

        postCreate: function () {
            _flashTimer = new FlashTimer(dom.byId(this.timestampDiv));
            domClass.add(this.faultDiv, this._cssHide);
            this.onTimeUpdate(0, 'loading');
            this._setView(this.showWhenNoFault);
        },

        configure: function (showWhenNoFault) {
            this._setView(showWhenNoFault);
        },


        // private methods
        _setView: function (showWhenNoFault) {
            if (showWhenNoFault) {
                domClass.replace(this.timestampDiv, this._cssDisplay, this._cssNoDisplay);
            }
            else {
                domClass.replace(this.timestampDiv, this._cssNoDisplay, this._cssDisplay);
            }
        },


        // event handlers
        onTimeUpdate: function (/*int, ms since epoch*/timestamp, name) {
            // display date as 'mm/dd/yyyy'
            var d = new Date(timestamp);
            this.dateSpan.innerHTML = DateString.toDate(d);
            this.timeSpan.innerHTML = d.toLocaleTimeString();

            // clear faults
            if (!_inhibitClear) {
                this.puB.updateErrorIcon(this.faultIconBox, Enum.Error.None);
                domClass.replace(this.faultDiv, this._cssHide, this._cssShow);
            }
            else {
                _inhibitClear = false;
            }

            _flashTimer.flash();
        },

        onCommTimeout: function (name) {
            this.faultDiv.innerHTML = name + ': Comm timeout';
            this.puB.updateErrorIcon(this.faultIconBox, Enum.Error.Warn);
            domClass.replace(this.faultDiv, this._cssShow, this._cssHide);
            _flashTimer.setFault();
        },

        onCommFault: function (name) {
            this.faultDiv.innerHTML = name + ': Comm fault (invalid response)';
            this.puB.updateErrorIcon(this.faultIconBox, Enum.Error.Warn);
            domClass.replace(this.faultDiv, this._cssShow, this._cssHide);
            _flashTimer.setFault();
            _inhibitClear = true;
        }
    });
});