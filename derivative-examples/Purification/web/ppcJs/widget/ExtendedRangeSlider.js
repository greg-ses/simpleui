// ~/widget/ExtendedRangeSlider
// dojox/form/RangeSlider with extension for tooltips

// range is normalized to 0...1

define(['dojo/_base/declare', 'dojo/on', 'dojox/form/RangeSlider', 'dijit/Tooltip',
        '../utilities/Identity'],
function (declare, on, RangeSlider, Tooltip,
        Identity) {
    return declare([dojox.form.HorizontalRangeSlider],
    {
        _xTolerance: 0.001,
        _prevMinVal: 0,
        _prevMaxVal: 1,
        _minToolTip: null,
        _maxToolTap: null,


        // lifecycle methods
        postCreate: function () {
            this.inherited(arguments);

            // add tooltips
            this._minToolTip = new Tooltip({
                connectId: [this.sliderHandle],
                label: 'minToolTip',
                position: ['before']
            });

            this._maxToolTap = new Tooltip({
                connectId: [this.sliderHandleMax],
                label: 'maxToolTap'
            });
        },


        // public methods
        setCallback: function (callback) {
            this._xMoveCallback = callback;
        },

        // default callback
        _xMoveCallback: function (sliderRange) {
        },

        // event overrides
        onChange: function (newValue) {
            this.inherited(arguments);

            //if (!Identity.areEqualFloats(this.value[0], this._prevMinVal, this._xTolerance)) {
            //console.log(this.value[0]);
             //   this._prevMinVal = this.value[0];
                //this._minToolTip.set('label', this.value[0]);
            //}
            
            //if (!Identity.areEqualFloats(this.value[1], this._prevMaxVal, this._xTolerance)) {
            //    this._prevMaxVal = this.value[1];
                //this._maxToolTap.set('label', this.value[1]);
            //}
        }

    });
});