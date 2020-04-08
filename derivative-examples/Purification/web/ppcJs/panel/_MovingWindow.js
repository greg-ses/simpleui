// ~/panel/_MovingWindow
// base Panel class for moving window panels that interact with WindowsSelectControl: handles switching between fixed/moving windows

define(['dojo/_base/declare', './_Panel', '../Enum'],
function (declare, _Panel, Enum) {
    return declare([_Panel],
    {
        // private variables
        _selectedWindowType: '',
        _startTime: '',


        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);
            this._selectedWindowType = Enum.WindowData.Moving;
        },


        // protected methods
        _setWindowType: function (/*Enum.WindowData*/windowType) {
            this._selectedWindowType = windowType;
        },

        _setStartTime: function (/*Date(), optional, for fixed window*/startTime) {
            this._selectedWindowType = (startTime) ? Enum.WindowData.Fixed : Enum.WindowData.Moving;
            this._startTime = startTime;
        },

        _isMovingWindow: function () {
            return (this._selectedWindowType === Enum.WindowData.Moving);
        },

        _validateTimeInputs: function (/*Date(), optional, for fixed window*/startTime) {
            this._startTime = startTime;
            var valid = (this._isMovingWindow() || startTime);
            if (!valid) {
                this._alert('a required date/time has not been selected.');
            }

            return valid;
        },

        // derived panels can override to use a FadeoutAlertBox
        _alert: function (message) {
            alert(message);
        }
    });
});