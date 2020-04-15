// ~/control/_control/_cDto
// base constructor config object
// example:
//  var extendedSelect = require('./extendedSelect');
//  var cfgObj = new extendedSelect.Ctor(extensionRefs);

define([], function () {
    return {
        Ctor: function (urlInfo, authTasks, queryId) {
            this.urlInfo = urlInfo;
            this.authTasks = authTasks;
            this.queryId = (queryId) ? queryId : 0;
        }
    };
});