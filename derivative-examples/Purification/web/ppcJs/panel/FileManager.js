// ~/panel/FileManager
// FileManager - embedded Panel for handling remote file operations and client upload
//  - show() supports multiple views
//  - dynamic blacklist to filter file lists
// Notes: 
//  - will not respond to file list responses until after configure() is called to set up it's file list filters
//  - uses long file names (with extensions) for identification and API, short file names (w/o extensions) are displayed

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-class', 'dojo/dom-style',
        'dojo/query', 'dojo/on', 'dojo/_base/array', 'dojox/string/Builder',
        'dijit/_FocusMixin', 'dijit/registry', 'dojox/xml/parser',
        'dijit/Dialog', 'dijit/form/TextBox', 'dijit/Menu', 'dijit/MenuBar', 'dijit/MenuBarItem', 'dijit/PopupMenuBarItem', 'dijit/MenuItem',
        '../utilities/Store', '../utilities/Compatibility', '../utilities/File', '../utilities/Identity', '../utilities/Page', '../utilities/Reflection', '../widget/FadeoutAlertBox',
        './_Panel', '../mixin/_QueueClient', './fileManager/fmDto', './fileManager/ExtensionMap', './fileManager/FileListAccessor', 'dojo/text!./fileManager/template/fileManager.html'],
function (declare, lang, dom, domClass, domStyle,
        query, on, array, Builder,
        _FocusMixin, registry, parser,
        Dialog, TextBox, Menu, MenuBar, MenuBarItem, PopupMenuBarItem, MenuItem,
        Store, Compatibility, File, Identity, Page, Reflection, FadeoutAlertBox,
        _Panel, _QueueClient, fmDto, ExtensionMap, FileListAccessor, template) {
    return declare([_Panel, _QueueClient, _FocusMixin],
    {
        // ajax request command constants
        _fileListCmd: { COMMAND: 'FILE_LIST' },
        _fileActionCmd: { COMMAND: 'FILE_ACTION' },

        // ajax request interval (ms)
        _refreshInterval: 15000,
        _refreshIntervalId: '',

        // ajax response tags
        _rootFileListTag: 'files',
        _fileTag: 'file',
        _rootDataTag: 'cmds',

        // dijit variables
        name: 'File Manager',
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'fileManager',

        // configuration parameters set in html declaration
        baseShowFileOption: fmDto.ShowFileOptionType.All,   // const base filter used on published file list (events, etc)

        // class variables
        _extensionMap: null,                 // ./fileManager/ExtensionMap
        _fileListMenus: '',
        _deleteMenuItem: null,              // delete file menu item
        _inhibitFileListHandling: false,    // true when user is interacting with menu bar
        _fileState: null,                   // ./fileManager/fmDto/FileState, static state of FileManager
        _blackList: '',                     // names of active scripts
        _fileListAccessor: null,            // ./fileManager/FileListAccessor
        _contentOptionsState: null,         // restores new content options state when toggling between load-only and full view 
        _showFileOption: fmDto.ShowFileOptionType.All,              // internal file list filter

        // lifecycle methods
        constructor: function () {
            this.inherited(arguments);
            this._initFileState();
            this._blackList = new Array();
            this._fileListAccessor = new FileListAccessor();
        },

        postCreate: function () {
            this.inherited(arguments);
        },

        // public methods
        load: function (urlVal, resourceId, serverProcess) {
            this.inherited(arguments);

            var uploadNode = dom.byId(this.fileUpload);
            this._handlerList.push(on(uploadNode, 'change', lang.hitch(this, this._onFileUpload)));

            this._clearLoadedFileBox();
            this.setNewContentOptions(false, true);
            this._blackList.length = 0;
            this._fileListAccessor.update();
        },

        unload: function () {
            this.inherited(arguments);
            this._cancelFileListRequests();
        },

        // usage note: load() must be called first to provide server data before AJAX requests can be made
        configure: function (/*fmDto.FileExtensionMap[]*/fileExtMaps) {
            this._extensionMap = new ExtensionMap(fileExtMaps);
            this._initiateFileListRequests();
        },

        // retrieve an existing file from the file list
        getFile: function (fileName) {
            this._fileState.staticName = fileName;
            //this._fileState.fileType = get from map
            this._fetchData();
        },

        // returns /panel/fileManager/fmDto/FileState
        getFileState: function () {
            return this._fileState;
        },

        clearFileState: function () {
            this._initFileState();
            this._clearLoadedFileBox();
        },

        // update dropdown menus if blacklist changed
        setFileBlackList: function (/*string[], long file names*/blackList) {
            if (blackList) {
                this._setFileBlackList(blackList);
            }
        },

        show: function (/*fmDto.ShowFileOptionType*/showFileOption) {
            this._showFileOption = showFileOption;
            this.puB.setVisible(this.containerNode, true);
            this._refreshMenu();

            if (this._hasFullFunctionality()) {
                if (this._fileState.loaded) {
                    Page.showDijit(this.newMenuItem);
                }
                Page.showDijit(this._deleteMenuItem);
                domStyle.set(dom.byId(this.loadedScriptBox), { display: 'block' });

                this._setNewContentOptions();
            }
            else {
                Page.hideDijit(this._deleteMenuItem);
                Page.hideDijit(this.newMenuItem);
                Page.hideDijit(this.saveMenuItem);
                domStyle.set(dom.byId(this.loadedScriptBox), { display: 'none' });
            }
        },

        hide: function () {
            this.puB.setVisible(this.containerNode, false);
            Page.hideDijit(this.newMenuItem);
            Page.hideDijit(this.saveMenuItem);
            Page.hideDijit(this._deleteMenuItem);
        },

        /*
        isEdited    isEmptyScript   'New'   'Save'
        0           0               1       0
        0           1               0       0
        1           0               1       1
        1           1               0       0
        */
        setNewContentOptions: function (/*bool*/isEdited, /*bool*/isEmptyScript) {
            this._contentOptionsState = { isEdited: isEdited, isEmptyScript: isEmptyScript };
            this._setFileNameIsEditedIndicator(isEdited);
            this._setNewContentOptions();
        },

        // private methods
        _setNewContentOptions: function () {
            if (Page.isVisible(this.containerNode)) {
                if (!this._contentOptionsState.isEmptyScript) {
                    Page.showDijit(this.newMenuItem);
                }
                else {
                    Page.hideDijit(this.newMenuItem);
                }

                if (this._contentOptionsState.isEdited && !this._contentOptionsState.isEmptyScript) {
                    Page.showDijit(this.saveMenuItem);
                }
                else {
                    Page.hideDijit(this.saveMenuItem);
                }
            }
        },

        _setFileNameIsEditedIndicator: function (/*bool*/isEdited) {
            var isEditedChar = '*';
            var fileName = dom.byId(this.loadedScriptBox).innerHTML;
            var indexOfIsEditedChar = fileName.lastIndexOf(isEditedChar);
            var displayingIsEditedChar = (indexOfIsEditedChar >= 0);

            if (displayingIsEditedChar && !isEdited) {
                dom.byId(this.loadedScriptBox).innerHTML = fileName.slice(0, indexOfIsEditedChar);
            }
            else if (!displayingIsEditedChar && isEdited) {
                dom.byId(this.loadedScriptBox).innerHTML = fileName + isEditedChar;
            }
        },
        
        _initFileState: function () {
            if (this._fileState) {
                this._fileState.staticName = '';
                this._fileState.loaded = false;
                this._fileState.volatileName = '';
                this._fileState.fileType = fmDto.FileType.Script;
            }
            else {
                this._fileState = new fmDto.FileState('', false);
            }
        },

        _cancelFileListRequests: function () {
            if (this._refreshIntervalId) {
                clearInterval(this._refreshIntervalId);
                this._refreshIntervalId = '';
            }
        },

        _hasFullFunctionality: function () {
            return (this._showFileOption == fmDto.ShowFileOptionType.All) || (this._showFileOption == fmDto.ShowFileOptionType.AllScripts);
        },

        _clearLoadedFileBox: function () {
            dom.byId(this.loadedScriptBox).innerHTML = '';
        },

        _updateLoadedFileBox: function () {
            if (this._hasFullFunctionality()) {
                dom.byId(this.loadedScriptBox).innerHTML = this._fileListAccessor.getShortFileName(this._fileState.staticName);
            }
        },

        _initiateFileListRequests: function () {
            var testUrl = '../../ppcJs/tests/autoCycleScriptListResponse.xml';
            var queryObj = {};
            lang.mixin(queryObj, this._fileListCmd);
            this._initStore(testUrl, queryObj, this._rootFileListTag, this.onFetchFileList);

            if (!this._refreshIntervalId) {
                this._refreshIntervalId = setInterval(lang.hitch(this, this._refetchFileList), this._refreshInterval);
            }
        },

        _refetchFileList: function () {
            this._xmlStore.close();
            var request = this._xmlStore.fetch({ onComplete: lang.hitch(this, this.onFetchFileList) });
        },

        _fetchData: function () {
            this._cancelFileListRequests();
            var testUrl = '../../ppcJs/tests/autoCycleDataResponse.xml';
            var queryObj = { FILE_NAME: this._fileState.staticName };
            lang.mixin(queryObj, this._fileActionCmd);
            this._initStore(testUrl, queryObj, this._rootDataTag, this.onFetchData);

            this._updateLoadedFileBox();
        },

        _addMenuItem: function (fileName, /*dijit.Menu*/menu, /*callback*/handler, /*bool*/skipBlackList) {
            if (skipBlackList || !Identity.listIncludes(this._blackList, fileName)) {
                var menuItem = new MenuItem({ label: fileName });
                this._handlerList.push(on(menuItem, 'click', lang.hitch(this, handler)));
                menu.addChild(menuItem);
            }
        },

        _createPopUpMenu: function (/*string[]*/fileNames, /*string*/label, /*callback*/handler, /*bool*/skipBlackList, /*bool*/append) {
            var menu = new Menu();
            var menuBarItem = new PopupMenuBarItem({ label: label, popup: menu });

            array.forEach(fileNames, function (fileName) {
                this._addMenuItem(fileName, menu, handler, skipBlackList);
            }, this);

            var position = append ? 'last' : 0;
            this.menuBar.addChild(menuBarItem, position);
            this._fileListMenus.push(menuBarItem);

            return menuBarItem;
        },

        _setFileBlackList: function (/*string[]*/blackList) {
            var blacklistChanged = array.some(blackList, function (fileName) {
                return !Identity.listIncludes(this._blackList, fileName);
            }, this) ||

                array.some(this._blackList, function (fileName) {
                    return !Identity.listIncludes(blackList, fileName);
                }, this);

            if (blacklistChanged) {
                this._blackList = blackList;
                this._refreshMenu();
            }
        },

        _refreshMenu: function () {
            if (this._fileListMenus) {
                array.forEach(this._fileListMenus, function (menu) {
                    menu.destroyRecursive();
                });

                this._fileListMenus.length = 0;
            }
            else {
                this._fileListMenus = new Array();
            }

            var filteredMenuLabels = this._getFileNames(this._showFileOption);
            var unfilteredMenuLabels = this._getFileNames(fmDto.ShowFileOptionType.All);

            this._createPopUpMenu(filteredMenuLabels, 'View XML', this._onXmlMenuItemClick, true, true);
            this._deleteMenuItem = this._createPopUpMenu(unfilteredMenuLabels, 'Delete', this._onDeleteMenuItemClick, false);
            this._createPopUpMenu(filteredMenuLabels, 'Load', this._onLoadMenuItemClick, true);
            this.onGetFileList(this._getFileNames(this.baseShowFileOption, true));
        },

        // returns array of strings filtered by _showFileOption
        _getFileNames: function (/*fmDto.ShowFileOptionType*/showFileOption, /*bool*/getLongFileNames) {
            var filterObj = this._getFileTypeFilterObj(showFileOption);
            return this._fileListAccessor.getFileNames(getLongFileNames, filterObj);
        },

        // returns  {(fmDto.FileType) fileType} or null if no filter is warranted
        _getFileTypeFilterObj: function (/*fmDto.ShowFileOptionType*/showFileOption) {
            var filterObj = null;

            switch (showFileOption) {
                case (fmDto.ShowFileOptionType.AllScripts):
                case (fmDto.ShowFileOptionType.LoadScripts):
                    filterObj = { fileType: fmDto.FileType.Script };
                    break;

                case (fmDto.ShowFileOptionType.LoadDataNoImport):
                    filterObj = { fileType: fmDto.FileType.Data };
                    break;

                case (fmDto.ShowFileOptionType.All):
                default:
                    break;
            }

            return filterObj;
        },

        // callbacks - AJAX request handlers
        onFetchFileList: function (/*XmlItem[]*/items, request) {
            if ((items.length > 0) && !this._inhibitFileListHandling && this._extensionMap) {
                var rootElem = items[0]['element'];
                var fileElems = query(this._fileTag, rootElem);

                var fileIdentifiers = new Array();
                array.forEach(fileElems, function (fileElem) {
                    var longFileName = parser.textContent(fileElem);
                    if (longFileName) {
                        var shortFileName = File.removeExtension(longFileName);
                        var extension = File.getExtension(longFileName);
                        fileType = this._extensionMap.getType(extension);
                        fileIdentifiers.push(new fmDto.FileIdentifier(longFileName, shortFileName, fileType));
                    }
                }, this);

                var listChanged = this._fileListAccessor.update(fileIdentifiers);
                if (listChanged) {
                    this._refreshMenu();
                }
            }
        },

        onFetchData: function (/*XmlItem[]*/items, request) {
            this.inherited(arguments);
            if (items.length > 0) {
                this._fileState.loaded = true;
                this.setNewContentOptions(false, false);
                var rootElem = items[0]['element'];
                this.onGetFile(this._fileState.staticName, rootElem);
                this._initiateFileListRequests();
            }
        },

        // callbacks - menu handlers
        _onMenuChildClick: function (item, evt) {
            this._inhibitFileListHandling = true;
        },

        _onDeleteMenuItemClick: function (evt) {
            var menuItem = registry.getEnclosingWidget(evt.target);
            this.deleteAlertBox.innerHTML = menuItem.get('label');

            this.deleteDialog.show();
        },

        _onLoadMenuItemClick: function (evt) {
            var menuItem = registry.getEnclosingWidget(evt.target);
            var shortFileName = menuItem.get('label');
            var longFileName = this._fileListAccessor.getLongFileName(shortFileName);

            switch (this._showFileOption) {
                case (fmDto.ShowFileOptionType.All):
                case (fmDto.ShowFileOptionType.AllScripts):
                    this._fileState.staticName = longFileName;
                    this._fileState.fileType = fmDto.FileType.Script;
                    this._fetchData();
                    break;

                case (fmDto.ShowFileOptionType.LoadScripts):
                    this._fileState.volatileName = longFileName;
                    this._fileState.fileType = fmDto.FileType.Script;
                    this._fetchData();
                    break;

                case (fmDto.ShowFileOptionType.LoadDataNoImport):
                    this._fileState.volatileName = longFileName;
                    this._fileState.fileType = fmDto.FileType.Data;
                    this.onGetFile(longFileName);
                    break;
            }

            this._inhibitFileListHandling = false;
        },

        _onXmlMenuItemClick: function (evt) {
            var testUrl = '../../ppcJs/tests/autoCycleDataResponse.xml';

            var menuItem = registry.getEnclosingWidget(evt.target);
            var shortFileName = menuItem.get('label');
            var longFileName = this._fileListAccessor.getLongFileName(shortFileName);
            var queryObj = { FILE_NAME: longFileName };
            lang.mixin(queryObj, this._fileActionCmd);
            var fullUrl = Store.getFullUrl(this._urlInfo, queryObj, testUrl);
            window.open(fullUrl);

            this._queueCall(this._onBlur, null, true);
        },

        _onNewMenuItemClick: function (evt) {
            this.onNewFileRequest(lang.hitch(this, this._editStateReceiver));
        },

        _onSaveMenuItemClick: function (evt) {
            this.saveAlertBox.innerHTML = '';
            var shortName = this._fileListAccessor.getShortFileName(this._fileState.staticName);
            this.fileNameTextBox.set('value', shortName);
            this.saveExtensionLabel.innerHTML = this._extensionMap.getExtension(this._fileState.fileType);
            this.saveDialog.show();
        },

        _onClientLoadMenuItemClick: function (evt) {
            var filterObj = this._getFileTypeFilterObj(this._showFileOption);
            var filterFileType = filterObj ? filterObj.fileType : null;
            var mimeTypes = this._extensionMap.getMimeTypes(filterFileType);
            var isText = (mimeTypes.search('text') >= 0);
            var html5Compatible = isText? Compatibility.hasBasicHtmlFileApiSupport() : Compatibility.hasCompleteHtmlFileApiSupport();
            
            if (html5Compatible) {
                Compatibility.attr(dom.byId(this.fileUpload), 'accept', mimeTypes);
                this.clientLoadDialog.show();
            }
            else {
                 this.fadeoutAlertBox.show('This browser does not support HTML5, which this feature requires.');
                this._queueCall(this._onBlur, null, true);
            }
        },

        _onBlur: function () {
            this._inhibitFileListHandling = false;
            this.inherited(arguments);

            array.forEach(this.menuBar.getChildren(), function (child) {
                child._setSelected(false);
            });
        },

        // callbacks - dialog handlers
        _onSubmitSaveClick: function () {
            var shortFileName = lang.trim(this.fileNameTextBox.get('value'));
            var longFileName = this._fileListAccessor.getLongFileName(shortFileName);
            if (File.verifyQnxFileName(shortFileName) && !Identity.listIncludes(this._blackList, longFileName)) {
                this._fileState.staticName = longFileName ? longFileName : shortFileName + '.' + this._extensionMap.getExtension(this._fileState.fileType);
                this.onSaveFile(lang.hitch(this, this._xmlReceiver));
            }
            else {
                var notice = 'is either running on a resource or not a valid file name. Valid length and characters:' +
                                '<br>1-40 chars' +
                                '<br>A-Z' +
                                '<br>a-z' +
                                '<br>0-9' +
                                '<br>" "' +
                                '<br>"_"' +
                                '<br>"-"';

                 this.fadeoutAlertBox.show('"' + shortFileName + '" ' + notice);
            }

            this._queueCall(this._onBlur, null, true);
        },

        _onCancelSaveClick: function () {
            this.saveDialog.hide();
            this._queueCall(this._onBlur, null, true);
        },

        _onSubmitDeleteClick: function () {
            var shortFileName = this.deleteAlertBox.innerHTML;
            var longFileName = this._fileListAccessor.getLongFileName(shortFileName);
            var queryObj = { FILE_NAME: longFileName };
            lang.mixin(queryObj, this._fileActionCmd);
            this.xhrDelete(queryObj);

            this._queueCall(this._onBlur, null, true);
            this._refetchFileList();
        },

        _onCancelDeleteClick: function () {
            this.deleteDialog.hide();
            this._queueCall(this._onBlur, null, true);
        },

        _onSubmitNewClick: function () {
            this._clearLoadedFileBox();
            this._initFileState();
            this.setNewContentOptions(false, true);
            this.onNewFile();

            this._queueCall(this._onBlur, null, true);
        },

        _onCancelNewClick: function () {
            this.newDialog.hide();
            this._queueCall(this._onBlur, null, true);
        },

        _onFileUpload: function (evt) {
            this.clientLoadDialog.hide();
            this._queueCall(this._onBlur, null, true);

            // file from client so wouldn't be in file list: need to validate fileType
            var file = evt.target.files[0];
            var fileType = this._extensionMap.getType(File.getExtension(file.name));
            var filterObj = this._getFileTypeFilterObj(this._showFileOption);
            var blockedByFilter = filterObj && (filterObj.fileType != fileType);

            var validFileType = (fileType != null) && !blockedByFilter;
            if (validFileType) {
                if (this._hasFullFunctionality()) {
                    this._fileState.staticName = file.name;
                }
                else {
                    this._fileState.volatileName = file.name;
                }

                var reader = new FileReader();
                reader.onload = lang.hitch(this, this._onGetClientFile);
                reader.readAsText(file);
            }
            else {
                // signal operation complete, nothing retrieved
                this.onGetFile();
            }
        },

        _onGetClientFile: function (evt) {
            switch (this._showFileOption) {
                case (fmDto.ShowFileOptionType.All):
                case (fmDto.ShowFileOptionType.AllScripts):
                    this._fileState.loaded = true;
                    this._updateLoadedFileBox();
                    this.setNewContentOptions(true, false);
                    var rootElement = parser.parse(evt.target.result);
                    this.onGetFile(this._fileState.staticName, rootElement);
                    break;

                case (fmDto.ShowFileOptionType.LoadScripts):
                    this.setNewContentOptions(true, false);
                    var rootElement = parser.parse(evt.target.result);
                    this.onGetFile(this._fileState.volatileName, rootElement);
                    break;

                case (fmDto.ShowFileOptionType.LoadDataNoImport):
                    // immediately forward data file to server instead of importing into client
                    var queryObj = { FILE_NAME: this._fileState.volatileName };
                    lang.mixin(queryObj, this._fileActionCmd);
                    this.xhrPost(queryObj, this._handleDataXhrError, this._handleDataXhrLoad, null, evt.target.result);
                    break;
            }
        },

        // callbacks - inserted as event args
        _editStateReceiver: function (/*bool*/isEdited) {
            if (isEdited) {
                this.newDialog.show();
            }
            else {
                this._onSubmitNewClick();
            }
        },

        _xmlReceiver: function (/*XmlElement*/xmlElement) {
            var xmlStr = File.serializeXml(xmlElement);
            var queryObj = { FILE_NAME: this._fileState.staticName };
            lang.mixin(queryObj, this._fileActionCmd);
            this.xhrPost(queryObj, null, null, null, xmlStr);

            this._fileState.loaded = true;
            this._updateLoadedFileBox();
            this._refetchFileList();
        },

        // defers publishing event until success
        _handleDataXhrLoad: function (response, ioArgs) {
            this._handleXhrLoad(response, ioArgs);
            this.onGetFile(this._fileState.volatileName);

            return response;
        },

        // defers publishing event until error to support parent cleanup
        _handleDataXhrError: function (response, ioArgs) {
            this._handleXhrError(response, ioArgs);
            this.onGetFile('');

            return response;
        },

        // public events
        onGetFileList: function (/*string[]*/fileNames) {
        },

        // event payload: filename, xml file contents
        onGetFile: function (/*string*/fileName, /*XmlElement*/rootElem) {
        },

        // event payload: callback takes client supplied XmlElement to deliver to destination
        onSaveFile: function (/*callback(XmlElement)*/xmlReceiver) {
        },

        // callback arg: true = unsaved edits exist
        onNewFileRequest: function (/*callback(isEdited)*/editStateReceiver) {
        },

        onNewFile: function () {
        }
    });
});