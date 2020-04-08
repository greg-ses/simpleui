// ~/control/InsertCommandMenu
// ScriptEnum.CommandType insert menu widget
// derived from _ScriptEnumMap to inherit static _cmdTypeKeyMap (preconfigured by _ScriptTemplateBuilder)

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom-attr', 'dojo/_base/array', 'dojo/on', 'dojo/mouse', 'dijit/registry',
        'dijit/Menu', 'dijit/MenuBarItem', 'dijit/PopupMenuItem', 'dijit/DropDownMenu', 'dijit/MenuItem', 'dijit/MenuSeparator',
        '../script/EntryEnum', '../script/_ScriptEnumMap',
        './_Control', '../mixin/_NestedChildren', 'dojo/text!./insertCommandMenu/template/insertCommandMenu.html'],
function (declare, lang, domAttr, array, on, mouse, registry,
        Menu, MenuBarItem, PopupMenuItem, DropDownMenu, MenuItem, MenuSeparator,
        EntryEnum, _ScriptEnumMap,
        _Control, _NestedChildren, template) {
    return declare([_Control, _NestedChildren, _ScriptEnumMap],
    {
        // css class names/in-line code
        _cssMenuBarItem: 'baseMenuBarItem',
        _cssNoDeleteHeight: 'icmcNoDeleteHeight',
        _cssDeleteHeight: 'icmcDeleteHeight',

        // public variables set by InsertCommandMenuControlDto.Ctor
        enableDelete: false,
        globalSettings: { enableRepeatMenuItem: false },    // static

        // private variables
        _handlerList: '',
        _repeatMenuItem: null,

        // dijit variables
        name: 'Insert Command Menu Control',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'insertCommandMenuControl',

        constructor: function () {
            this._handlerList = new Array();
        },

        // public methods
        postCreate: function () {
            this.inherited(arguments);

            var categoryMenus = {};
            for (var key in this._cmdTypeKeyMap) {
                var cmdTypeKey = this._cmdTypeKeyMap[key];
                if (cmdTypeKey.category) {
                    if (!categoryMenus[cmdTypeKey.category]) {
                        this._addCategoryPopupMenuItem(cmdTypeKey.category, categoryMenus);
                    }

                    this._addInsertMenuItem(key, cmdTypeKey.name, categoryMenus[cmdTypeKey.category]);
                }
                else {
                    this._addInsertMenuItem(key, cmdTypeKey.name, this.insertDropDown);
                }
            }

            this._addInsertScriptMenuSection();
            this._handlerList.push(on(this.containerNode, mouse.enter, lang.hitch(this, this._onMouseEnter)));

            if(this.enableDelete) {
                this._addDeleteMenuItem();
                dojo.addClass(this.domNode, this._cssDeleteHeight);
            }
            else {
                dojo.addClass(this.domNode, this._cssNoDeleteHeight);
            }

            this.insertMenu.startup();
        },

        // private methods
        // insert a new popup for a category
        _addCategoryPopupMenuItem: function (/*string*/category, /*bag of Menus by category*/categoryMenus) {
            var populLabel = category + ' . . .';
            var menu = new Menu();
            var popupMenuItem = new PopupMenuItem({ label: populLabel, popup: menu });
            this.insertDropDown.addChild(popupMenuItem);
            categoryMenus[category] = menu;
        },

        _addInsertMenuItem: function (/*EntryEnum.CommandType*/commandType, name, parentMenu) {
            var menuItem = new MenuItem({ label: name, commandType: commandType, parentNode: this.domNode });
            parentMenu.addChild(menuItem);
            this._handlerList.push(on(menuItem, 'click', lang.hitch(this, this._onSelectInsertMenuItem)));
        },

        _addInsertScriptMenuSection: function () {
            var menuSeparator = new MenuSeparator();
            this.insertDropDown.addChild(menuSeparator);
            var menuItem = new MenuItem({ label: 'a script', parentNode: this.domNode });
            this.insertDropDown.addChild(menuItem);
            this._handlerList.push(on(menuItem, 'click', lang.hitch(this, this._onSelectScriptInsertMenuItem)));
        },

        _addDeleteMenuItem: function () {
            var menuItem = new MenuItem({label: 'Delete' });
            dojo.addClass(menuItem.domNode, this._cssMenuBarItem);
            this._handlerList.push(on(menuItem, 'click', lang.hitch(this, this._onSelectDeleteMenuItem)));
            this.insertMenu.addChild(menuItem, 0);
        },

        _addRepeatMenuItem: function () {
            this._repeatMenuItem = new MenuItem({ label: 'same script again', parentNode: this.domNode });
            this.insertDropDown.addChild(this._repeatMenuItem);
            this._handlerList.push(on(this._repeatMenuItem, 'click', lang.hitch(this, this._onSelectRepeatScriptInsertMenuItem)));
        },


        // callbacks
        _onSelectInsertMenuItem: function (evt) {
            var menuItem = registry.getEnclosingWidget(evt.target)
            var cmdType = parseInt(menuItem.get('commandType'));
            this.onSelectCommand(this.domNode, cmdType);
        },

        _onSelectScriptInsertMenuItem: function (evt) {
            this.onSelectScript(this.domNode);
        },

        _onSelectRepeatScriptInsertMenuItem: function (evt) {
            this.onRepeatSelectScript(this.domNode);
        },

        _onSelectDeleteMenuItem: function (evt) {
            this.onDeleteCommand(this.domNode);
        },

        _onMouseEnter: function (evt) {
            if (this.globalSettings.enableRepeatMenuItem && !this._repeatMenuItem) {
                this._addRepeatMenuItem();
            }
        },

        // public events
        onSelectCommand: function (/*DOM node*/domNode, /*ScriptEnum.CommandType*/cmdType) {
        },

        onSelectScript: function (/*DOM node*/domNode) {
        },

        onRepeatSelectScript: function (/*DOM node*/domNode) {
        },

        onDeleteCommand: function (/*DOM node*/domNode) {
        }
    });
});
