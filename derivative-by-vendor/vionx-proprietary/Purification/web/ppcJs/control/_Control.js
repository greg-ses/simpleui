// ~/control/_Control
// base mixin class for Controls. provides
// - default API implementation
// - common variables, methods

define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin', '../Enum', '../utilities/BasePanel', '../utilities/Page'],
function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Enum, BasePanel, Page) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], 
    {
        // aliases
        puB: BasePanel,
        puP: Page,

        // class variables configured on construction or configuration
        queryId: 0,      // ID assigned to this resource by server, 0 = root resource
        urlInfo: null,        // ppcJs.utilities.Store.urlInfo
        authTasks: null,      // ppcJs.utilities.AccessControl.Task[], array of user's authorizations

        // protected class variables

        // default Control API implementation
        // generic post-construction initializer, such as for Controls declared in html
        configure: function (/*control._control._cDto.Ctor*/dto) {
            this.urlInfo = dto.urlInfo;
            this.queryId = dto.queryId;
            this.authTasks = dto.authTasks;
        },

        // generic setter
        update: function (dto) {
            // override this
        },

        // generic getter
        getValue: function () {
            // override this
        }
    });
});

