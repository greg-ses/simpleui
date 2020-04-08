// ~/panel/fileManager/FileListAccessor
// provides access to a list of fmDto.FileIdentifiers

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array',
         '../../utilities/Identity', './fmDto'],
function (declare, lang, array,
        Identity, fmDto) {
    return declare([],
    {
        _fileList: null,

        // lifecycle methods
        constructor: function () {
            this._fileList = new Array();
        },

        // public methods
        // returns true if fileList changed since previous update
        update: function (/*fmDto.FileIdentifier[]*/fileList) {
            if (!Identity.isArray(fileList)) {
                fileList = new Array();
            }

            var fileNamesChanged = !Identity.areEqualArrays(fileList, this._fileList);
            if (fileNamesChanged) {
                this._fileList = lang.clone(fileList);
            }
            return fileNamesChanged;
        },

        getLongFileName: function (shortName) {
            var longName = '';
            array.some(this._fileList, function (fileIdentifier) {
                if (shortName == fileIdentifier.shortName) {
                    longName = fileIdentifier.longName;
                    return true;
                }
                else {
                    return false;
                }
            }, this);

            return longName;
        },

        getShortFileName: function (longName) {
            var shortName = '';
            array.some(this._fileList, function (fileIdentifier) {
                if (longName == fileIdentifier.longName) {
                    shortName = fileIdentifier.shortName;
                    return true;
                }
                else {
                    return false;
                }
            }, this);

            return shortName;
        },

        getFileType: function (longName) {
            var fileType = null;
            array.some(this._fileList, function (fileIdentifier) {
                if (longName == fileIdentifier.longName) {
                    fileType = fileIdentifier.fileType;
                    return true;
                }
                else {
                    return false;
                }
            }, this);

            return fileType;
        },

        // if filterObj is not null, filters by filterObj.fileType
        getFileNames: function (/*bool*/getLongFileNames, /*optional, {(FileType) fileType}*/filterObj) {
            var fileNames = new Array();

            array.forEach(this._fileList, function (fileIdentifier) {
                var fileName = getLongFileNames ? fileIdentifier.longName : fileIdentifier.shortName;
                var blockedByFilter = filterObj && (filterObj.fileType != fileIdentifier.fileType);
                if (!blockedByFilter) {
                    fileNames.push(fileName);
                }
            });

            return fileNames;
        }
    });
});