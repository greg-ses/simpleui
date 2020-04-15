// ~/widget/iPhoneButton
// Adapted from dojoiphonebutton, https://code.google.com/p/dojoiphonebutton/, for 
//  - ppcJs module hierarchy
//  - absolute state control
//  - inhibit action when clicking on button portion of slider

// summary:
//          iPhoneButton: a class that represents an iPhone style button
// description:
//          This class creates the backend functionality for
//          the iphone style toggle button.  Its movements are animated and the user
//          click either drag the handle or click any wear in order to toggle it.
//          The text, width, and animation speed can all be set in the constructor 
//          example: new ppcJs.iPhoneButton({id:"checkbox",onText:"ON",offText:"OFF",width:200,animateSpeed:200,startOn:true});
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-style', 'dojo/dnd/move', 'dojo/_base/fx', 'dojo/fx', 'dojo/on', 'dojo/mouse',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
        'dojo/text!./iPhoneButton/template/iPhoneButton.html'],
function (declare, lang, domStyle, move, baseFx, fx, on, mouse,
        _WidgetBase, _TemplatedMixin,
        template) {
    return declare([_WidgetBase, _TemplatedMixin],
    {
        realWidth: 0,        /*number-The actual width of the div*/
        container: null,     /*the dnd container for the slider thing*/
        left: 0,             /*The last known position of the handle*/
        animateSpeed: 200,   /*The duration in ms of the animation*/
        startOn: false,      /*If this is true we'll swap the starting position to true*/
        value: false,        /*value of the checkbox*/
        curText: '',         /*the currently selected text*/
        width: 89,           /*the width that the users sets*/
        onText: 'ON',        /*The text for the on state*/
        offText: 'OFF',     /* The text for the off state*/
        _isCurrentlyLeft: true,
        _blockUpdates: false,

        templateString: template,
        baseClass: 'iPhoneCheckContainer',

        // lifecycle methods
        constructor: function (args) {
            this.inherited(arguments);
        },

        postCreate: function () {
            // summary:
            //          this is really the controller for the creation of the widget.  It just has all the function calls.
            this.inherited(arguments);
            this._setInitialStyles();
            this._createDnD();
            this._attachListeners();
        },

        // public methods
        instantToggle: function () {
            // summary:
            //          this is a function that would probably only be used internally for toggling with no animation
            // description:
            //          i use this function on post create to start the button off in the right state.  it
            //          doesn't use any animation, so if a user wanted to switch with no animation they could use attr('value') and then toggle
            var tmpLeft = 0;
            var leftHandle = 0;
            if (this.left === 0) {
                this.left = this.realWidth - 30;
                tmpLeft = this.left;
                leftHandle = this.left - 9;
                this._isCurrentlyLeft = false;
            } else {
                this.left = 0;
                tmpLeft = this.left;
                leftHandle = this.left;
                this._isCurrentlyLeft = true;
            }

            domStyle.set(this.offSpan, "marginRight", -tmpLeft + "px"); //init 0
            domStyle.set(this.offLabel, "width", this.realWidth - 30 - tmpLeft + "px"); //init -50
            domStyle.set(this.onSpan, "marginLeft", tmpLeft - (this.realWidth - 30) + "px"); //init -50
            domStyle.set(this.onLabel, "width", tmpLeft + 3 + "px"); //init -50
            domStyle.set(this.handle, "left", leftHandle + "px"); //init -50
            this._updateValue(true);
        },

        toggle: function (/*bool*/noEvent) {
            // summary:
            //          animated toggle function
            // description:
            //          user available call to toggle the button with animation and appropriate calls to events
            this._snap(true);
            this._updateValue(noEvent);
        },

        // arbitrarily sets button state without firing onChange event
        setValue: function (/*bool*/newValue) {
            if ((this._isCurrentlyLeft === newValue) && !this._blockUpdates) {
                this.toggle(true);
            }
        },

        // private methods

        _attachListeners: function () {
            // summary:
            //          Attaches Listeners to the interactive parts of the button
            // description:
            //          this.container is a DnD container, so the onMove and onMoveStop events
            //          are specific to the dojo.dnd.move class that I'm using here.
            //          There is also a listener for just any clicks which will cause us to toggle
            this.connect(this.container, "onMove", '_dragging');
            this.connect(this.container, "onMoveStop", '_dragged');
            on(this.outsideContainer, 'click', lang.hitch(this, this._switchPosition));
            on(this.outsideContainer, mouse.enter, lang.hitch(this, this._onHover));
            on(this.outsideContainer, mouse.leave, lang.hitch(this, this._onBlur));
        },

        _createDnD: function () {
            // summary:
            //          creates the dnd object
            // description:
            //          the box args tell how far the handle is allowed to be dragged.  Its constrained to the 
            //          size of the button basically
            var boxargs = {
                box:
                {
                    l: 0, //left
                    t: 0, //top
                    w: this.realWidth - 3, //width
                    h: 27//height
                },
                within: true
            };
            this.container = new move.boxConstrainedMoveable(this.handle, boxargs);
        },

        _setInitialStyles: function () {
            // summary:
            //          Inject styles and copy into the template
            // description:
            //          the template starts of with no text or sizing, so this updates the styles on
            //          the various attach points for the template.
            this.onSpan.innerHTML = this.onText;
            this.offSpan.innerHTML = this.offText;
            var width = this.width || 89;
            if (typeof width === "string") {
                width = 89;
            }
            this.realWidth = width;
            domStyle.set(this.outsideContainer, "width", width + "px");
            domStyle.set(this.offLabel, "width", (width - 5) + "px");
            domStyle.set(this.onLabel, "width", "0px");
            domStyle.set(this.onSpan, "marginLeft", "-50px");
            domStyle.set(this.handle, "left", "0px");
            if (this.startOn) {
                this.instantToggle();
            }
        },

        _switchPosition: function (evt) {
            // summary:
            //          called to switch the position 
            // description:
            //          This is an internal only method that gets called when onClick happens
            //          on the outer div.  onClick always gets fired, so if there was a drag we 
            //          don't want to do anything, but if it wasn't dragged then we want to toggle 
            //          the position of the handle.
            this._blockUpdates = false;
            if (this.wasDragged) {
                this.wasDragged = false;
            } else {
                this.toggle();
            }
        },

        _dragging: function (mover, leftTop) {
            // summary:
            //          passes the appropriate values to the move function
            this.wasDragged = true;
            this._move(leftTop);
        },

        _dragged: function (mover) {
            // summary:
            //          when the handle is done being dragged this gets called and the handle snaps right or left
            this.wasDragged = true;
            this._blockUpdates = false;
            this._snap();
            this._updateValue(); //This is a bit of bad design, but if I put this function call in snap it gets called twice
        },

        _move: function (leftTop) {
            // summary:
            //          function to update the position of the handle
            // description:
            //          while the handle is being dragged, this function gets called to update the postion of the left
            //          and right sides of the toggle based on the position of the handle.  This is what make it seem like its
            //          one flowing element
            var left = leftTop.l;
            this.left = left;
            if (left > (this.realWidth - 30) || left < 0) {
                return;
            }
            domStyle.set(this.offSpan, "marginRight", -left + "px");
            domStyle.set(this.offLabel, "width", this.realWidth - 30 - left + "px");
            domStyle.set(this.onSpan, "marginLeft", left - (this.realWidth - 30) + "px");
            domStyle.set(this.onLabel, "width", left + 3 + "px");
        },


        _snap: function (swap) {
            // summary:
            //          responsible for animating the move of the handle after the user drops it
            // description: 
            //          this function figures out where the handle currently is and based on the position
            //          if its closer to one side or another, it animate the transtion to that side.  
            //          there are several properties on several elements that need to be animated all together
            //          in order for this to happen.  Fortunately dojo.fx.combine makes this easy
            var curLeft = this.left;
            var goLeft = this.realWidth - 30;
            var leftHandle = this.realWidth - 39;
            var curLeftHandle = curLeft;

            if ((this.realWidth - 30) / 2 > curLeft) {
                goLeft = 0;
                leftHandle = 0;
                this._isCurrentlyLeft = true;
            }
            else {
                this._isCurrentlyLeft = false;
            }

            if (swap) {
                if (goLeft === 0) {
                    goLeft = this.realWidth - 30;
                    leftHandle = this.realWidth - 39;
                    this._isCurrentlyLeft = false;
                }
                else {
                    goLeft = 0;
                    leftHandle = 0;
                    curLeftHandle = this.realWidth - 39;
                    this._isCurrentlyLeft = true;
                }
                this.left = goLeft;
            }

            var animOne = baseFx.animateProperty({
                node: this.offSpan,
                duration: this.animateSpeed,
                properties: {
                    marginRight: { end: -goLeft, start: -curLeft }
                }
            });

            var animTwo = baseFx.animateProperty({
                node: this.offLabel,
                duration: this.animateSpeed,
                properties: {
                    width: { end: this.realWidth - 30 - goLeft, start: this.realWidth - 30 - curLeft }
                }
            });

            var animThree = baseFx.animateProperty({
                node: this.onSpan,
                duration: this.animateSpeed,
                properties: {
                    marginLeft: { end: goLeft - (this.realWidth - 30), start: curLeft - (this.realWidth - 30) }
                }
            });

            var animFour = baseFx.animateProperty({
                node: this.onLabel,
                duration: this.animateSpeed,
                properties: {
                    width: { end: goLeft + 3, start: curLeft + 3 }
                }
            });

            var animFive = baseFx.animateProperty({
                node: this.handle,
                duration: this.animateSpeed,
                properties: {
                    left: { end: leftHandle, start: curLeftHandle }
                }
            });

            var combinedAnim = fx.combine([animOne, animTwo, animThree, animFour, animFive]);
            combinedAnim.play();
        },

        // keeps the value and curtext fields up to date
        _updateValue: function (/*bool*/noEvent) {
            var changed = (this._isCurrentlyLeft && this.value) || (!this._isCurrentlyLeft && !this.value);
            if (changed) {
                this.value = !this.value;
                this.curText = this.value ? this.onText : this.offText;

                if (!noEvent) {
                    this.onChange(this);
                }
            }
            /*
            if (this._isCurrentlyLeft) {
                if (this.value) {
                    this.value = false;
                    this.curText = this.offText;
                }
                else {
                    noEvent = true;
                }
            } else {
                if (!this.value) {
                    this.value = true;
                    this.curText = this.onText;
                }
                else {
                    noEvent = true;
                }
            }

            if (!noEvent) {
                this.onChange(this);
            }
            */
        },

        // callbacks
        _onHover: function () {
            this._blockUpdates = true;
        },

        _onBlur: function () {
            this._blockUpdates = false;
        },

        // event handlers

        onChange: function (iPhoneRef) {
            // summary:
            //          for whatever reason, widget,templated don't fire onChange for this 
            //          but they do fire onclick... so i just fire it myself
        }
    });
});
