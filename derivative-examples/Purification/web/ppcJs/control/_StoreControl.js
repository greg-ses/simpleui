// ~/control/_StoreControl
// Base mixin class for Controls using dojo Object Stores. A Control's resourceId is passed independent of its
// resource endpoint URLs to allow all CRUD operations on the resourceId.

// provides:
// - default Control API implementation
// - common variables, methods

define(['dojo/_base/declare',
        '../Enum', '../utilities/BasePanel', '../utilities/Page',
        '../mixin/_StoreContainer', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dijit/_WidgetsInTemplateMixin'],
function (declare,
        Enum, BasePanel, Page,
        _StoreContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare([_StoreContainer, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
    {
        // aliases
        puB: BasePanel,
        puP: Page,

        // class variables configured on construction or configuration
        resourceId: 0,      // ID assigned to this resource by server, 0 = root resource
        authTasks: null,      // ppcJs.utilities.AccessControl.Task[], array of user's authorizations

        // protected methods
        _processConfig: function (dto) {
            // override this
        },

        // default Control API implementation
        // generic post-construction initializer, such as for Controls declared in html but requiring dynamic configuration
        configure: function (/*control._control._cDto.Ctor or other*/dto) {
            this._processConfig(dto);
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
