// ~/panel/SystemDiagram
// system diagram panel - graphical overview of system and resources for use in left side panel container

// Pub/sub list:
// [pub] ppcJs.PubSub.selectResource
// [pub] ppcJs.PubSub.resourceName

// cookie:
//  resourceId - selected server ID

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-attr', 'dojo/dom-construct', 'dojo/dom-class',
        'dojo/query', 'dojo/NodeList-traverse', 'dojo/aspect', 'dojo/topic', 'dojo/on',
        'dijit/registry', 'dijit/form/ToggleButton', 'dijit/form/CheckBox', 'dojox/layout/TableContainer',
        'dojo/dom-geometry', 'dojo/dom-style', 'dojox/collections/Dictionary', 'dojox/xml/parser',
        '../Enum', '../PubSub', '../utilities/Compatibility', '../utilities/DataFormat', '../utilities/Identity', '../utilities/Page',
        '../widget/CollapseToggle', '../control/AjaxStatus', '../control/DiagramBlock', '../control/diagramBlock/dbDto',
        './_WatchdogPanel', '../mixin/_CookieClient', 'dojo/text!./systemDiagram/template/systemDiagram.html'],
function (declare, lang, dom, domAttr, construct, domClass,
        query, nodeListTraverse, aspect, topic, on,
        registry, ToggleButton, CheckBox, TableContainer,
        domGeom, domStyle, Dictionary, parser,
        Enum, PubSub, Compatibility, DataFormat, Identity, Page,
        CollapseToggle, AjaxStatus, DiagramBlock, dbDto,
        _WatchdogPanel, _CookieClient, template) {
    return declare([_WatchdogPanel, _CookieClient],
    {
        // ajax request command constants
        _getTemplateCmd: { GET: 'SYS_SUMMARY_TEMPLATE' },
        _getDataCmd: { GET: 'SYS_SUMMARY_DATA' },

        // ajax request interval (ms)
        _refreshIntervalId: '',

        // ajax response tags
        _rootTemplateTag: 'systemSummaryTemplate',
        _rootDataTag: 'resource',
        _childDataTag: 'childResources',
        _nameTag: 'name',
        _typeTag: 'type',
        _modeTag: 'mode',

        _dataItemsTag: 'dataItems',
        _dataItemTag: 'dataItem',
        _idAttrib: 'id',
        _linkDisabledAttrib: 'disabled',
        _labelTag: 'label',
        _descriptionTag: 'desc',
        _valueTypeTag: 'valueType',

        _powerDirTag: 'pwrDir',
        _errorStatusTag: 'err',
        _autoControlTag: 'auto',
        _lockTag: 'lock',
        _timestampTag: 'timestamp',

        // item css class names, in-line styles
        _cssRootContainer: 'sdpRootContainer',
        _cssControlBorder: 'basePanelWidgetBorder',
        _cssDisplayNone: 'basePanelDisplayNone',
        _cssDisplayBlock: 'basePanelDisplayBlock',
        _cssToggle: 'sdpToggle',
        _cssDiagramResourceCell: 'diagramResourceCell',
        _cssConfigTable: 'sdpConfigTable',
        _cssPopUpHide: 'basePanelPopUpHide',
        _cssPopUpShow: 'basePanelPopUpShow',

        // cookies
        _cookieServerId: 'serverId',
        _cookieDisplay: 'sdpDisplay',

        // class variables
        _resourceIdMap: null,       // 2-way dictionary: key/value = resource's 'id' attribute, value/key = dijit id
        _collapseTableMap: null,    // dictionary: key = CollapseToggle dijit, value = corresponding table DOM node
        _selected: '',              // dijit, currently selected resource block
        _defaultSelection: null,    // if no cookie, reference to first resource created
        _ajaxStatusCheckBox: null,
        _tempCheckBox: null,        // temporary checkbox hack to work around http://bugs.dojotoolkit.org/ticket/15065: 1 pre-startup widget required to layout table
        _configCheckBoxes: null,
        _configCheckBoxRowMap: null,    // dictionary: key = config pane checkbox dijit, value = corresponding resource row DOM node

        // dijit variables
        name: 'SystemDiagram Panel',
        templateString: template,
        baseClass: 'systemDiagramPanel',

        // lifecycle methods
        constructor: function () {
            this._resourceIdMap = new Dictionary();
            this._collapseTableMap = new Dictionary();
            this._configCheckBoxRowMap = new Dictionary();
            this._refreshInterval = 10 * 60 * 1000; // 10 minutes
        },

        postCreate: function () {
            this.inherited(arguments);
            this._configCheckBoxes = new TableContainer({
                cols: 1,
                customClass: this._cssConfigTable,
                labelWidth: 150
            }, this.configTable);

            this._ajaxStatusCheckBox = new CheckBox({ label: 'Comm Status', value: false });
            this._configCheckBoxes.addChild(this._ajaxStatusCheckBox);
            this._tempCheckBox = new CheckBox({ label: '' });
            this._configCheckBoxes.addChild(this._tempCheckBox);
        },

        startup: function () {
            this.inherited(arguments);
        },

        // public methods
        load: function (urlVal, resourceId, serverProcess, queryObj) {
            // ignore resourceID
            this.inherited(arguments);
            // now that _handlerList has been initialized by base class
            this._handlerList.push(aspect.after(this._ajaxStatusCheckBox, 'onChange', lang.hitch(this, this._onCommStatusCheckBoxChange), true));

            this._updateCookieFromQuery(this._cookieServerId, queryObj);
            var testUrl = '../../ppcJs/tests/systemSummaryTemplateResponse.xml';
            this._initStore(testUrl, this._getTemplateCmd, this._rootTemplateTag, this.onFetchTemplate);
        },

        unload: function () {
            this.inherited(arguments);
            this._resourceIdMap.clear();
            this._collapseTableMap.clear();
            this._configCheckBoxRowMap.clear();
            this._configCheckBoxes.destroyDescendants();
            if(this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                this._refreshIntervalId = '';
            }
        },

        // private methods
        _addRootResource: function (/*XmlElement*/xmlElement) {
            var cssChildren =  this._childDataTag + ' > ' + this._rootDataTag;
            var childResources = query(cssChildren, xmlElement);

            var numChildResources = childResources.length;
            var isParent = (numChildResources > 0);

            var root = this._createRootContainer(isParent);
            var row = this.puB.createRow();
            construct.place(row, root.table);

            var checkBoxConfig = {label: '', checked:true};
            var resourceCell = this._addResourceCell(xmlElement, row, isParent, checkBoxConfig);
            var emptyCell = this.puB.createCell();
            // fill child column width using emptyCell to maintain row width when either no children or all children hidden
            var width = domGeom.position(resourceCell).w;
            domStyle.set(emptyCell, 'width', width.toString() + 'px');
            construct.place(emptyCell, row);

            if (isParent) {
                for (var i = 0; i < numChildResources; i++) {
                    var isLast = (i == (numChildResources - 1));
                    this._addChildResource(childResources[i], root.table);
                }
            }

            var onlyVerifyExists = true;
            if (this._getItemFromCookieList(this._cookieDisplay, checkBoxConfig.label, onlyVerifyExists)) {
                checkBoxConfig.checked = this._getItemFromCookieList(this._cookieDisplay, checkBoxConfig.label);
                this._showRootContainer(root.container, checkBoxConfig.checked);
            }
            else {
                checkBoxConfig.checked = true;
                this._updateCookieList(this._cookieDisplay, checkBoxConfig.label, checkBoxConfig.checked);
            }

            // add config checkbox and map checkbox to row
            var checkBox = new CheckBox(checkBoxConfig);
            this._configCheckBoxes.addChild(checkBox);
            this._configCheckBoxes.layout();    // workaround for http://bugs.dojotoolkit.org/ticket/15065

            this._configCheckBoxRowMap.add(checkBox, root.container);
            this._handlerList.push(on(checkBox, 'click', lang.hitch(this, this._onConfigCheckBoxClick)));
        },

        // returns root and table elements of new collapsible container: {container:, table:}
        _createRootContainer: function (isCollapsible) {
            // div containing CollapseToggle and table
            var rootContainer = construct.create('div', null, this.diagramContainer);
            domClass.add(rootContainer, [this._cssRootContainer, this._cssControlBorder]);
            var table = construct.create('div', null, rootContainer);

            if (isCollapsible) {
                var collapseToggle = new CollapseToggle({ checked: true });   // initialize as expanded
                domClass.add(collapseToggle.domNode, this._cssToggle);
                construct.place(collapseToggle.domNode, rootContainer);
                this._collapseTableMap.add(collapseToggle, table);
                this._handlerList.push(on(collapseToggle, 'click', lang.hitch(this, this._onCollapseToggleClick)));
            }

            domClass.add(table, this.puB._cssTable);

            return {container: rootContainer, table: table};
        },

        _addChildResource: function (/*XmlElement*/xmlElement, parentNode) {
            var row = this.puB.createRow();

            var emptyCell = this.puB.createCell();
            construct.place(emptyCell, row);

            this._addResourceCell(xmlElement, row, false);
            construct.place(row, parentNode);
            // TODO: add recursive calls to _addChildResource using...
        },

        _addResourceCell: function (/*XmlElement*/xmlElement, rowNode, /*bool*/isMaster, /*optional, obj*/checkBoxConfig) {
            var resourceCell = this.puB.createCell();
            domClass.add(resourceCell, this._cssDiagramResourceCell);
            construct.place(resourceCell, rowNode);

            var dataItems = new Array();
            var cssDataItemSelect = '> ' + this._dataItemsTag + ' > ' + this._dataItemTag;
            query(cssDataItemSelect, xmlElement).forEach(function (dataItemElem) {
                var id = Compatibility.attr(dataItemElem, this._idAttrib);
                var label = this.puS.getElementText(this._labelTag, dataItemElem);
                var description = this.puS.getElementText(this._descriptionTag, dataItemElem);
                var valueType = parseInt(this.puS.getElementText(this._valueTypeTag, dataItemElem));
                dataItems.push(new dbDto.DataConfig(id, label, description, valueType));
            }, this);

            var serverId = Compatibility.attr(xmlElement, 'id');
            var name = this.puS.getElementText(this._nameTag, xmlElement);
            var type = this.puS.getElementText(this._typeTag, xmlElement);

            var dto = new dbDto.Ctor(serverId, name, isMaster, dataItems, type);
            var resource = new DiagramBlock(dto);

            // add 2-way dictionary entry so can select by either resourceId or serverId
            var resourceId = resource.get('id');
            this._resourceIdMap.add(serverId, resourceId);
            this._resourceIdMap.add(resourceId, { serverId: serverId, row: rowNode });  // allows getting both by resourceId
            resource.placeAt(resourceCell);

            if (!this._defaultSelection) {
                this._defaultSelection = resourceId;
            }

            if(Identity.isObject(checkBoxConfig)) {
                checkBoxConfig.label = serverId;
            }

            // connect event handlers: register parent's handler before resource handler
            this._handlerList.push(on(resource.domNode, 'click', lang.hitch(this, this.handleResourceClick)));
            resource.configure();

            Page.addHoverBehavior(this._handlerList, resource.domNode);

            return resourceCell;
        },

        _initiateDataRequests: function () {
            var testUrl = '../../ppcJs/tests/systemSummaryDataResponse.xml';
            this._initStore(testUrl, this._getDataCmd, this._rootDataTag, this.onFetchData);
            if (!this._refreshIntervalId) {
                this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchData), this._refreshInterval);
            }
        },

        _refetchData: function () {
            this._xmlStore.close();
            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onFetchData) });
        },

        // unset previous and set new selection
        _setSelection: function (/*node ID or dijit instance*/id) {
            var prevSelectedId = this._selected? this._selected.get('id') : null;

            if (id && (prevSelectedId != id)) {
                var resource = dijit.byId(id);
                var name = resource.get('name');
                topic.publish(PubSub.resourceName, name);

                if (this._selected) {
                    var idMapItem = this._resourceIdMap.item(prevSelectedId);
                    // remove row decoration
                    var selectedRow = idMapItem.row;
                    domClass.remove(selectedRow, this.puB._cssSelectBg);
                    this._selected.unselect();
                }

                resource.select();
                this._selected = resource;

                // get valid resource ID (arg 'id' could be dijit instance)
                var idMapItem = this._resourceIdMap.item(resource.get('id'));
                var serverId = idMapItem.serverId;
                var isMaster = resource.get('isMaster');
                topic.publish(PubSub.selectResource, serverId, isMaster, false);
                this._cookie(this._cookieServerId, serverId);

                // add row decoration
                domClass.add(idMapItem.row, this.puB._cssSelectBg);
            }
        },

        _showRootContainer: function (rootContainer, display) {
            if (display) {
                domClass.replace(rootContainer, this._cssDisplayBlock, this._cssDisplayNone);
            }
            else {
                domClass.replace(rootContainer, this._cssDisplayNone, this._cssDisplayBlock);
            }
        },

        // callbacks
        onFetchTemplate: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            construct.empty(this.diagramContainer);
            var rootElem = items[0]['element'];

            // only select immediate children resources (root resources)
            for (var i = 0; i < rootElem.childNodes.length; i++) {
                if (rootElem.childNodes[i].nodeName === this._rootDataTag) {
                    this._addRootResource(rootElem.childNodes[i]);
                }
            }

            // remove work around for http://bugs.dojotoolkit.org/ticket/15065
            this._configCheckBoxes.removeChild(this._tempCheckBox);
            this._tempCheckBox.destroy();

            this._initiateDataRequests();

            // initial resource selection
            var serverId = this._cookie(this._cookieServerId);
            if (serverId) {
                var dijitId = this._resourceIdMap.item(serverId);
                this._setSelection(dijitId);
            }
            else {
                this._setSelection(this._defaultSelection);
            }
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    var xmlElement = items[i]['element'];
                    // get dijit by 'id' XML attribute
                    var serverId = Compatibility.attr(xmlElement, this._idAttrib);
                    var dijitId = this._resourceIdMap.item(serverId);
                    var resource = registry.byId(dijitId);

                    if (resource) {
                        var linkDisabled = Compatibility.attr(xmlElement, this._linkDisabledAttrib);
                        var powerDirection = parseInt(this.puS.getElementText(this._powerDirTag, xmlElement));
                        var mode = this.puS.getElementText(this._modeTag, xmlElement);

                        var dataValues = new Array();
                        var cssDataItemSelect = '> ' + this._dataItemsTag + ' > ' + this._dataItemTag;
                        query(cssDataItemSelect, xmlElement).forEach(function (dataItemElem) {
                            var id = Compatibility.attr(dataItemElem, this._idAttrib);
                            var value = parser.textContent(dataItemElem);
                            dataValues.push(new dbDto.DataValue(id, value));
                        }, this);

                        var errorStatus = parseInt(this.puS.getElementText(this._errorStatusTag, xmlElement));

                        var timestamp = this.puS.getElementText(this._timestampTag, xmlElement);
                        if (!DataFormat.isInt(timestamp)) {
                            timestamp = null;
                        }
                        else {
                            timestamp = parseInt(timestamp);
                        }

                        var dto = new dbDto.Status(powerDirection,
                                                            mode,
                                                            dataValues,
                                                            errorStatus,
                                                            timestamp,
                                                            linkDisabled);
                        resource.update(dto);
                    }
                }
            }
        },

        handleResourceClick: function (evt) {
            var resource = evt.currentTarget;
            this._setSelection(Compatibility.attr(resource, 'id'));
        },

        _onCollapseToggleClick: function (evt) {
            var toggle = registry.getEnclosingWidget(evt.currentTarget);
            var expand = toggle.checked;
            var table = this._collapseTableMap.item(toggle);

            if (expand) {
                // reveal all hidden rows
                var cssRowSelect = '.' + this._cssDisplayNone;
                query(cssRowSelect, table).forEach(function (node, i) {
                    domClass.replace(node, this.puB._cssRow, this._cssDisplayNone);
                }, this);
            }
            else {
                // hide rows containing children
                var cssRowSelect = '.' + this.puB._cssRow;
                query(cssRowSelect, table).forEach(function (node, i) {
                    if (i > 0) {
                        domClass.replace(node, this._cssDisplayNone, this.puB._cssRow);
                    }
                }, this);
            }
        },

        _onConfigToggleChange: function (evt) {
            if (this.configToggle.checked) {
                domClass.replace(this.configPane, this._cssPopUpShow, this._cssPopUpHide);
                Page.showDijit(this._configCheckBoxes);
            }
            else {
                domClass.replace(this.configPane, this._cssPopUpHide, this._cssPopUpShow);
                Page.hideDijit(this._configCheckBoxes);
            }
        },

        _onConfigCheckBoxClick: function (evt) {
            var checkBox = registry.getEnclosingWidget(evt.target);
            var rootContainer = this._configCheckBoxRowMap.item(checkBox);
            var isChecked = checkBox.get('checked');
            this._showRootContainer(rootContainer, isChecked);
            this._updateCookieList(this._cookieDisplay, checkBox.label, isChecked);
        },

        _onCommStatusCheckBoxChange: function (newValue) {
            this.ajaxStatus.configure(newValue);
        }
    });
});