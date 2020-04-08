/// <reference file="jquery-1.2.6.js" />
/// <reference file="jquery-1.2.6-vsdoc.js" />
/*

===========================
       jqDialogForms
===========================

Author:   Jon Davis
          jon@jondavis.net

Version:  1.2

For documentation and other information, see:
http://www.jondavis.net/codeprojects/jqDialogForms/

*/
var DialogWindow = function(optional_message, optional_options, optional_parentWindow) {
    var dwindow = this;
    this.childWindows = new Array();

    if (optional_parentWindow) {
        optional_parentWindow.childWindows.push(this);
        this.parentWindow = optional_parentWindow;
    }

    this.message = optional_message;

    this.options = optional_options; var defOptions = DialogWindow.DefaultOptions;
    if (!this.options) this.options = defOptions;
    if (!this.options['nodefaults']) {
        for (var o in defOptions) {
            if (this.options[o] === undefined) {
                this.options[o] = defOptions[o];
            }
        }
    }
    this.title = this.options['title'];
    this.iconUrl = this.options['iconUrl'];
    this.ok_text = this.options['okText'];
    this.apply_text = this.options['applyText'];
    this.cancel_text = this.options['cancelText'];

    // You can use your own dialog window in the options, but this is the default.
    this.dialogMasterMarkup =
          '<div id="#jqDialogWindowMaster">\n'
        + '    <div class="dialogWindow"><form onsubmit="return false">\n'
        + '        <div class="closeBox"><a href="javascript:void(0);" class="closeButton"><span></span></a></div>\n'
        + '        <div class="dialogTitle jqHandle jqDrag"></div>\n'
        + '        <div class="dialogIcon"><span></span></div>\n'
        + '        <div class="dialogBody"></div>\n'
        + '        <div class="okCancelButtons">\n'
        + '            <button type="submit" disabled="disabled" class="okButton button" style="width: 75px;">'+this.ok_text+'</button>\n'
        + '            <button type="submit" disabled="disabled" class="applyButton button" style="width: 75px; display: none;">Apply</button>\n'
        + '            <button type="button" class="cancelButton button" style="width: 75px;">Close</button>\n'
        + '        </div>\n'
        + '        <div class="jqHandle jqResize"><div></div></div>'
        + '    </form></div>\n'
        + '</div>';

    // For the container DOM element, first
    // options.containerWindowElement is checked,
    // and it is reused (options.reuseElement == true)
    // or else its inner HTML is COPIED.
    if (this.options['containerWindowElement']) {
        if (this.options['reuseElement']) {
            this.el = this.options.containerWindowElement;
            this.domCopy = false;
        } else {
            this.el = $($(this.options.containerWindowElement).html())[0];
            this.domCopy = true;
        }
        //this.options.containerWindowElement = undefined;
    } else {
        // Next, the entire document is checked for an element
        // with the ID of "jqDialogWindowMaster", and its inner HTML is COPIED.
        this.el = $('#jqDialogWindowMaster').length > 0
            ? $($('#jqDialogWindowMaster').html())[0]
        // Otherwise, the default markup is COPIED.
            : $(this.dialogMasterMarkup)[0];

        this.domCopy = true;
    }
    if ($(this.el).find('.dialogWindow').length > 0) {
        this.el = $(this.el).find('.dialogWindow')[0];
    }
    if (!this.options['allowResize'] && $(this.el).find('.jqResize').length > 0) {
        $(this.el).find('.jqResize').remove();
    } else {
        $(this.el).jqResize('.jqResize');
    }
    $(this.el).jqDrag('.jqDrag');
    $(this.el).find('.dialogTitle').mousedown(function() {
        dwindow.bringToFront();
    });

    // apply CSS
    var positionSetByOptions = false;
    if (this.options['css']) {
        for (var cssProperty in this.options.css) {
            $(this.el).css(cssProperty, this.options.css[cssProperty]);
            if (cssProperty == 'position') positionSetByOptions = true;
        }
    }
    if (!positionSetByOptions) $(this.css).css('position', 'fixed');
    if ($(this.el).css('position') == 'fixed') {
        try {
            if (($.browser.msie && parseFloat($.browser.version) < 7)
                    || document.compatMode.toLowerCase() == 'backcompat') {
                $(this.el).css('position', 'absolute');
            }
        } catch (e) {
            $(this.el).css('position', 'absolute');
        }
    }

    // events list
    this._fn = {
        beforeShow: new Array(),
        show: new Array(),
        apply: new Array(),
        close: new Array(),
        dirtyStateChanged: new Array()
    };

    this.beforeShow = function(fn) {
        if (fn) {
            if (typeof (fn) == 'function') {
                this._fn['beforeShow'].push(fn);
            } else {
                throw 'Argument must be a function.';
            }
        }
    };

    this.getCenterLeft = function(el) {
        var w = $(el).width();
        var sw = $(window).width();
        var ret = (sw / 2) - (w / 2);
        if (el.style.position == 'absolute' && document.body.scrollLeft) {
            ret += document.body.scrollLeft;
        }
        if (ret > 0) return ret;
        else return 0;
    }

    this.getCenterTop = function(el) {
        var h = $(el).height();
        var sh = $(window).height();
        var ret = (sh / 2) - (h / 2);
        if (el.style.position == 'absolute' && document.body.scrollTop) {
            ret += document.body.scrollTop;
        }
        if (ret > 0) return ret;
        else return 0;
    }

    this.apply = function(args) {
        var fn = false;

        // if fn provided, add event handler
        for (var mx = 0; mx < arguments.length; mx++) {
            var m = arguments[mx];
            if (m !== undefined) {
                if (typeof (m) == 'function') {
                    this._fn['apply'].push(m);
                    fn = true;
                }
            }
        }

        // if no fn provided, invoke event handler(s)
        if (!fn) {
            var c;
            for (var fi = 0; fi < this._fn['apply'].length; fi++) {
                c = this._fn['apply'][fi].call(this);
                if (c === false) return false;
            }
            $(this.el).find('.applyButton').add('.okButton').each(function() {
                var applyButton = this;
                switch (applyButton.tagName.toLowerCase()) {
                    case 'input':
                    case 'button':
                        applyButton.disabled = true;
                        break;
                }
            });
        }
        return true;
    };

    this.okButton_click = function() {
        var dwindow = $(this).data('dwindow');
        if (!dwindow.isDirty || (dwindow.isDirty && dwindow.apply())) {
            dwindow.close();
        }
    };

    this.applyButton_click = function() {
        var dwindow = $(this).data('dwindow');
        dwindow.apply();
    };

    this.cancelButton_click = function() {
        var dwindow = $(this).data('dwindow');
        dwindow.close();
    };

    this.dirtyStateChanged = function(args) {
        var fn = false;
        var fields = new Array();
        for (var mx = 0; mx < arguments.length; mx++) {
            var m = arguments[mx];
            if (m !== undefined) {
                if (typeof (m) == 'function') {
                    this._fn['dirtyStateChanged'].push(m);
                    fn = true;
                } else if (m != null) {
                    fields.push(m);
                }
            }
        }
        if (fn) {
            return this;
        } else {
            $(this.el).find('.okButton').add('.applyButton').each(function() {
                $(this)[0].disabled = false;
            });
            $(this.el).find('.cancelButton').each(function(dwindow) {
                if (!dwindow.options.cancelText ||
                        (
                            dwindow.options.cancelText == 'Cancel' && $(this).text() == 'Close'
                        )) {
                    var cancelText = (dwindow.options.cancelText ? dwindow.options.cancelText : 'Cancel');
                    $(this).text(cancelText);
                }
            }, new Array(this));
            // invoke state changed event handlers
            for (var fi = 0; fi < this._fn['dirtyStateChanged'].length; fi++) {
                this._fn['dirtyStateChanged'][fi].call(this, fields);
            }
        }
    };

    this.__ifocus = 0; // used for focus tracking

    // If args is a fn or a list of fn, show will not execute, 
    // rather args will be added to the show event handler list.
    // Otherwise, show() will execute and then raise the show
    // event on behalf of the handlers. If args was a string,
    // it will be used as the message text.
    this.show = function(args) {
        DialogWindow.visibleWindows.push(this);
        var msg = false;
        var fn = false;
        for (var mx = 0; mx < arguments.length; mx++) {
            var m = arguments[mx];
            if (m !== undefined) {
                if (typeof (m) == 'function') {
                    this._fn['show'].push(m);
                    fn = true;
                } else {
                    if (typeof (m) != 'string') {
                        m = $(m.html());
                    }
                    this.message = m;
                    msg = true;
                }
            }
        }

        // assume that show(fn) was a setup call only
        if (!msg && fn) return;

        else { // here we go

            // invoke beforeShow event handlers
            for (var fi = 0; fi < this._fn['beforeShow'].length; fi++) {
                this._fn['beforeShow'][fi].call(this);
            }

            // apply title / message
            $(this.el).find('.dialogTitle').each(function(dwindow) {
                $(this).append(dwindow.title);
            }, new Array(this));
            $(this.el).find('.dialogBody').append(dwindow.message).data('dwindow', dwindow)
            .each(function(dwindow) {
                try { // disable selections on browsers that support it
                    this.onselectstart = function() { return false; }
                } catch (e) { }
            }, new Array(this));
            if (this.iconUrl) {
                $(this.el).find('.dialogIcon').append(
                    '<img src="' + this.iconUrl + '" />');
            }

            // set up OK/Apply/Cancel event handlers
            $(this.el).find('.okButton').data('dwindow', dwindow)
            .each(function(dwindow) {
                this.onclick = dwindow.okButton_click;
            }, new Array(this));
            $(this.el).find('.applyButton').data('dwindow', dwindow)
            .each(function(dwindow) {
                this.onclick = dwindow.applyButton_click;
            }, new Array(this));
            $(this.el).find('.cancelButton').add($(this.el).find('.closeButton'))
            .data('dwindow', dwindow)
            .each(function(dwindow) {
                this.onclick = dwindow.cancelButton_click;
                $(this);
            }, new Array(this));

            $(this.el).mousedown(function() {
                dwindow.bringToFront();
            });

            this.fields(true).each(function() {
                $(this).focus(function() {
                    dwindow.activeElement = this;
                });
                $(this).blur(function() {
                    if (dwindow.activeElement == this)
                        dwindow.activeElement = null;
                });

                if (!$(this).hasClass('okButton') &&
                    !$(this).hasClass('applyButton') &&
                    !$(this).hasClass('cancelButton') &&
                    !$(this).hasClass('closeButton')) {

                    $(this).change(function() {
                        if (!dwindow.isDirty) {
                            DialogWindow.setDirty.call(this, dwindow, true);
                        }
                    });
                    $(this).keypress(function() {
                        if (!dwindow.isDirty) {
                            DialogWindow.setDirty.call(this, dwindow, true);
                        }
                    });
                }

            });

            // set up top/left/height/width
            if (this.options['left'] == 'center') {
                $(this.el).css('left', this.getCenterLeft(this.el));
            } else if (this.options['left'] !== undefined) {
                $(this.el).css('left', this.options.left);
            }
            if (this.options['top'] == 'middle') {
                $(this.el).css('top', this.getCenterTop(this.el));
            } else if (this.options['top'] !== undefined) {
                $(this.el).css('top', this.options.top);
            }
            var doctop = $().scrollTop();
            var top = $(this.el).scrollTop();
            var left = $(this.el).scrollLeft();
            var borderWidth = parseInt($(this.el).css('borderWidth').replace(/px/, ''));
            if ($(this.el).height() - top > $(window).height()) {
                $(this.el).height($(window).height() - (top * 2) - (borderWidth * 2));
            }
          //  if ($(this.el).width() - left > $(window).width()) {
          //      $(this.el).left($(window).width() - (left * 2) - (borderWidth * 2));	// Produced an error, left() not a function.
          //  }
            if (this.options['css'] && this.options.css['minWidth']) {
                var minWidth = parseInt(this.options.css.minWidth.replace(/px/, ''));
                if ($(this.el).width() < minWidth) $(this.el).width(minWidth);
            }
            if ($(this.el).height() - top > $(window).height() && $(this.el).css('position') == 'fixed') {
                // could not confine dimensions; show document scrollbar!
                $(this.el).css('position', 'absolute');
                $(this.el).css('top', doctop);
            }

            // hide buttons
            if (this.options.hideOkCancelButtons) {
                $(this.el).find('.okCancelButtons').hide();
            }
            if (this.options.hideOkButton) {
                $(this.el).find('.okButton').hide();
            }
            if (this.options.hideApplyButton) {
                $(this.el).find('.applyButton').hide();
            } else {
                $(this.el).find('.applyButton').show();
            }
            if (this.options.hideCancelButton) {
                $(this.el).find('.cancelButton').hide();

                if (!this.options.containerWindowElement) {
                    $(this.el).find('.okButton').attr('disabled', '');
                    $(this.el).find('.okCancelButtons').css('text-align', 'center');
                }
            }

            // css check
            $(this.el).append('<div id="dialogwincsscheck"></div>');
            var csscheck = $(this.el).find('#dialogwincsscheck');
            var cssvalid = csscheck.css('display') == 'none';
            csscheck.remove();
            if (!cssvalid) alert('jqDialogForms requires a compliant CSS file to be referenced on the page.');

            var bShown = false;
            // invoke show event handlers
            for (var xf = 0; xf < this._fn['show'].length; xf++) {
                if (this._fn['show'][xf].call(this) === true) bShown = true;
            }

            // animate
            if (this.options.showAnimate) {
                bShown = true;
                $(this.el).animate(this.options.showAnimate, this.options.showAnimate['speed'],
                            this.options.showAnimate['easing'], this.options.showAnimate['callback']);
            }

            if (!bShown) {
                $(this.el).show();
            }
            this.bringToFront();
            this.focus();

            if ($(this.el).css('position') != 'fixed' && $(this.el).css('top') != '')
                $().scrollTop(parseInt($(this.el).css('top').replace(/px/, '')));
        }

    };

    this.close = function(fn) {
        // if fn provided, add event handler
        if (fn) {
            if (typeof (fn) == 'function') {
                this._fn['close'].push(fn);
            } else {
                throw 'Argument must be a function.';
            }

            // if no fn provided, invoke event handler(s)
        } else {
            if (this.inputsBlocked) return;
            var c;
            for (var fi = 0; fi < this._fn['close'].length; fi++) {
                c = this._fn['close'][fi].call(this);
                if (c === false) return;
            }

        }
        if (this.domCopy) $(this.el).remove();
        else $(this.el).hide();
        if (this.parentWindow) {
            var hasOtherBlockingChild = false;
            var newChildren = new Array();
            for (var w = 0; w < this.parentWindow.childWindows.length; w++) {
                if (this.parentWindow.childWindows[w] == this) {
                    // drop
                } else {
                    newChildren.push(this.parentWindow.childWindows[w]);
                    if (this.parentWindow.childWindows[w].options.modal == 'parent') {
                        hasOtherBlockingChild = true;
                    }
                }
            }
            this.parentWindow.childWindows = newChildren;
            if (!hasOtherBlockingChild && this.parentWindow.inputsBlocked) {
                this.parentWindow.unblockInputs.call(this.parentWindow);
            }
            this.parentWindow = null;
        }
        DialogWindow.dropVisibleWindow(this);
    };

    if (this.parentWindow && this.options.modal === 'parent' && !this.parentWindow.inputsBlocked) {
        this.parentWindow.blockInputs.call(this.parentWindow);
    }

    this.blockInputs = function() {
        if (this.inputsBlocked) return;
        this.fields(true).each(function() {
            $(this).data('disabled', $(this).attr('disabled'));
            $(this).attr('disabled', 'disabled');
        });
        this.inputsBlocked = true;
    };

    this.unblockInputs = function() {
        this.fields(true).each(function() {
            if ($(this).data('disabled') !== null && $(this).data('disabled') !== undefined) {
                $(this).attr('disabled', $(this).data('disabled'));
                $(this).data('disabled', null);
            }
        });
        this.inputsBlocked = false;
    };

    this.hasFocus = function() {
        if (this['activeElement']) {
            return true;
        }
        return false;
    };

    this.findFocusableElement = function() {
        var focEl = null;
        var ctxEl = this;
        if (ctxEl.constructor == DialogWindow) {
            this.fields(true).each(function() {
                if ($(this).css('display') != 'none' && !this.disabled)
                    focEl = ctxEl;
            });
        } else {
            switch (this.tagName.toLowerCase()) {
                case 'input':
                case 'select':
                case 'textarea':
                case 'button':
                    if ($(this).css('display') != 'none' && !this.disabled) {
                        focEl = ctxEl;
                    }
                    break;
            }
        }
        return focEl;
    }

    this.focus = function() {
        if (this.hasFocus()) return;
        var focEl = null;
        var dwindow = this;
        $(this.el).find('.okButton').each(function() {
            focEl = dwindow.findFocusableElement.call(this);
        });
        if (!focEl) $(this.el).find('.cancelButton').each(function() {
            focEl = dwindow.findFocusableElement.call(this);
        });
        if (!focEl) this.fields(true).each(function() {
            focEl = dwindow.findFocusableElement.call(this);
        });
        if (focEl) $(focEl).focus();
        //if (button) $(button).blur();
    }

    this.fields = function(includeOkApplyCancel) {
        var ret = $(this.el).find('input').add($(this.el).find('select')).add($(this.el).find('textarea'));
        if (!includeOkApplyCancel)
            ret = ret.add($(this.el).find('button:not(.okButton):not(.applyButton)'
                + ':not(.cancelButton):not(.closeButton)'));
        else ret = ret.add($(this.el).find('button'));
        // remove dupes
        var arr = new Array();
        for (var i = 0; i < ret.length; i++) {
            arr.push(ret[i]);
            for (var ae = 0; ae < arr.length; ae++) {
                if (ret[i] == arr[ae]) arr.pop();
            }
        }
        for (var ae = 0; ae < arr.length; ae++) {
            if (ae == 0) ret = $(arr[0]);
            else ret.add(arr[ae]);
        }
        return ret;
    };

    this.serialize = function(toJson) {
        var jform = $(this.el).find('form');
        var fields = this.fields();
        if (!toJson && jform.length > 0) {
            var form = jform[0];
            if ($(form).attr('name') == 'undefined' ||
                $(form).attr('name') == '') {
                $(form).attr('name', 'dialogForm' + $('.dialogWindow').length);
            }
            return $(form).serialize();
        }
        else {
            var ret = '';
            if (toJson) ret += '{\n\t';
            var bf = false;
            for (var f = 0; f < fields.length; f++) {
                if ($(fields[f]).attr('name') &&
                    $(fields[f]).attr('name') != '') {
                    if (bf && f > 0) {
                        if (toJson) {
                            ret += ',\n\t';
                        } else {
                            ret += '&';
                        }
                    }
                    var bf = false;
                    switch ($(fields[f]).attr('type')) {
                        case 'checkbox':
                        case 'radio':
                            if ($(fields[f])[0].checked) {
                                if (toJson) {
                                    ret += "'" + $(fields[f]).attr('name') + "': "
                                        + "'" + $(fields[f]).val().replace(/\'/g, '\\\'').replace(/\n/g, '\\n')
                                        + "'";
                                } else {
                                    ret += escape($(fields[f]).attr('name')) + '='
                                        + escape($(fields[f]).val());
                                }
                                var bf = true;
                            }
                            break;
                        default:
                            if (toJson) {
                                ret += "'" + $(fields[f]).attr('name') + "': "
                                        + "'" + $(fields[f]).val().replace(/\'/g, '\\\'').replace(/\n/g, '\\n')
                                        + "'";
                            } else {
                                ret += escape($(fields[f]).attr('name')) + '='
                                        + escape($(fields[f]).val());
                            }
                            var bf = true;
                            break;
                    }
                }
            }
            if (toJson) ret += '\n}';
            return ret;
        }
    };

    this.fieldValues = function() {
        return eval('(' + this.serialize(true) + ')');
    };

    this.bringToFront = function() {

        for (var i = 0; i < DialogWindow.visibleWindows.length; i++) {
            var winEl = $(DialogWindow.visibleWindows[i].el);
            if (DialogWindow.visibleWindows[i] != this && winEl.hasClass('activeWindow')) {
                winEl.removeClass('activeWindow');
            }
        }
        $(this.el).addClass('activeWindow');

        // z-indexing
        var winArray = DialogWindow.visibleWindows;
        var startZ = 0;
        for (var e = 0; e < winArray.length; e++) {
            if ($(winArray[e].el).css('zIndex') == '') {
                $(winArray[e].el).css('zIndex', 0);
                startZ++;
            }
            // if z was > 0 (default) then z is now z + startZ, else if z < 0 then it stays the same
            var z = parseInt($(winArray[e].el).css('zIndex').toString().replace(/auto/, '0'));
            $(winArray[e].el).css('zIndex', z > 0
            ? z + startZ
            : z);
        }
        var z = 0;
        for (var w = 0; w < winArray.length; w++) {
            if (winArray[w] != this) {
                $(winArray[w].el).css('zIndex', ++z);
            }
        }
        $(this.el).css('zIndex', winArray.length);


        // bring child windows to front
        for (var c = 0; c < this.childWindows.length; c++) {
            this.childWindows[c].bringToFront();
            //this.childWindows[c].focus();
        }
    };

    // constructor: immediately add to document body but hide first
    $(this.el).data('dwindow', this);
    $(this.el).css('display', 'none');
    $(document.body).append($(this.el));

};
DialogWindow.setDirty = function(dwindow, value) {
    dwindow.isDirty = value;
    dwindow.dirtyStateChanged(value ? this : null);
};

DialogWindow.visibleWindows = new Array();

DialogWindow.dropVisibleWindow = function(w) {
    var arr1 = new Array();
    for (var i = 0; i < DialogWindow.visibleWindows.length; i++) {
        var x = DialogWindow.visibleWindows[i];
        if (x != w) {
            arr1.push(x);
        }
    }
    DialogWindow.visibleWindows = arr1;
};

DialogWindow.DefaultOptions = {

        containerWindowElement: null,

        reuseElement: false,        // set to true to use the element object rather 
                                    // than its HTML
        
        title: 'Dialog',            // the text for dialogTitle element
        
        top: 'middle',              // set to pixels or to 'middle'
        
        left: 'center',             // set to pixels or to 'center'
        
        css: {                      // injected to the dialogWindow element
            position: 'fixed',
            minWidth: '120px'
        },

        iconUrl: '',                // if set, adds an image to dialogIcon element

        modal: false,               // can be false (normal), true (page blocking -- not yet implemented), 
                                    //      'modeless' (takes Z-Index of parent), or 
                                    //      'parent' (like 'modeless' but also block 
                                    //      parent's message and buttons)
        showAnimate: null,          // function; callback function that uses jQuery

                                    //      animate options structure, w/ added 
                                    //      props: speed, easing, callback

        hideAnimate: null,          // function; callback function for performing an 
                                    //      animation after closing a form

        hideOkCancelButtons: false, // hide the element that contains the OK / Apply 
                                    //      / Cancel buttons

        hideOkButton: false,        // hide the OK button

        hideApplyButton: true,      // hide the Apply button

        hideCancelButton: true,     // hide the Cancel button

        allowResize: true,          // enable jqDnR for resizing

        okText: 'OK',               // the text to be displayed on the OK button

        applyText: 'Apply',         // the text to be displayed on the Apply button

        cancelText: 'Cancel'        // the text to be displayed on the Cancel button
};

