// ~/script/State
// business object representing the state of a script on a remote server

define(['dojo/_base/declare'], function (declare) {

    return declare(null,
    {
        fileName: '',
        currentUuid: '',
        state: null,
        resourceId: '',
        loopCounts: null,
        variables: null,
        otherActiveScripts: null,

        constructor: function (fileName,
                                currentUuid,
                                /*Enum.PlayBackState*/state,
                                /*optional*/resourceId,
                                /*optional, {uuid: string, timesRemaining: int}[]*/loopCounts,
                                /*optional*/currentStatus,
                                /*optional, string[]*/breakPointUuids,
                                /*optional, {variableId: string, value: float}[]*/variables) {
            this.fileName = fileName;
            this.currentUuid = currentUuid;
            this.state = state;
            if (resourceId) {
                this.resourceId = resourceId;
            }

            if (loopCounts) {
                this.loopCounts = loopCounts;
            }
            else {
                this.loopCounts = new Array();
            }

            if (currentStatus) {
                this.currentStatus = currentStatus;
            }

            if (breakPointUuids) {
                this.breakPointUuids = breakPointUuids;
            }
            else {
                this.breakPointUuids = new Array();
            }

            if (variables) {
                this.variables = variables;
            }
            else {
                this.variables = new Array();
            }

            this.otherActiveScripts = new Array();
        }
    });
});