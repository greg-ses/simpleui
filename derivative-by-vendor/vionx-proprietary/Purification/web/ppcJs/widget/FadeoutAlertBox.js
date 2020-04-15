// ~/widget/FadeoutAlertBox
// non-modal info box that fades to transparent after a delay

define(['dojo/_base/declare', 'dojo/dom', 'dojo/dom-class', 'dojo/dom-style', 'dojo/_base/fx',
        'dijit/_WidgetBase', 'dijit/_TemplatedMixin',
          '../utilities/Page', '../mixin/_QueueClient', 'dojo/text!./fadeoutAlertBox/template/fadeoutAlertBox.html'],
function (declare, dom, domClass, domStyle, fx,
          WidgetBase, TemplatedMixin,
          Page, _QueueClient, template) {
    return declare([WidgetBase, TemplatedMixin, _QueueClient],
    {
        // dijit variables
        name: 'Script Runner',
        templateString: template,
        baseClass: 'fadeoutAlertBox',

        // css class names/in-line code
        _cssHide: 'fabHide',
        _cssShow: 'fabShow',

        // lifecycle methods
        constructor: function () {
            this._queueDelayMs = 3000;
        },

        postCreate: function () {
            this.inherited(arguments);
            domClass.add(this.containerNode, this._cssHide);
        },

        // public methods
        show: function (msg) {
            dom.byId(this.containerNode).innerHTML = msg;
            domStyle.set(this.containerNode, 'opacity', '1');   // must directly set opacity element style instead of through class
            domClass.replace(this.containerNode, this._cssShow, this._cssHide);

            // fade out after _queueDelayMs
            this._queueCall(function () {
                var fadeArgs = {
                    node: this.containerNode,
                    duration: 2000
                };
                fx.fadeOut(fadeArgs).play();

                // after fadeout, push to bottom of z order
                this._queueCall(function () {
                    domClass.replace(this.containerNode, this._cssHide, this._cssShow);
                }, null, true);
            }, null, true);
        }
    });
});