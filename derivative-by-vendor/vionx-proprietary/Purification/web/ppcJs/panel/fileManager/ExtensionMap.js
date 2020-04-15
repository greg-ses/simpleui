// ~/panel/fileManager/ExtensionMap
// file extension to type conversion
// extensions normalized to lower case

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/array', 'dojox/collections/Dictionary', 'dojox/string/Builder',
        '../../utilities/File', '../../utilities/Reflection', './fmDto'],
function (declare, lang, array, Dictionary, Builder,
        File, Reflection, fmDto) {
    return declare([],
    {
        _defaultType: fmDto.FileType.Script,    // returned if no extension is given
        _fileExtMaps: null, // 2 way dictionary: extension : fileType
        _mimeTypes: null,

        // lifecycle methods
        constructor: function (/*fmDto.FileExtensionMap[]*/fileExtMaps) {
            this._fileExtMaps = new Dictionary();

            array.forEach(fileExtMaps, function (map) {
                // validate and normalize before adding
                var validMap = (map && map.extension && Reflection.validateEnumValue(map.fileType, fmDto.FileType));
                if (validMap) {
                    var extension = map.extension.toLowerCase();
                    this._fileExtMaps.add(extension, map.fileType);
                    this._fileExtMaps.add(map.fileType, extension);
                }
                else {
                    console.warn('/panel/fileManager/ExtensionMap: invalid FileExtensionMap. Check <fileExtensions> in the template.');
                }
            }, this);

            var numFileTypes = Reflection.fieldCount(fmDto.FileType);
            this._mimeTypes = new Array(numFileTypes);
            this._mimeTypes[fmDto.FileType.Script] = 'text/xml';
            this._mimeTypes[fmDto.FileType.Data] = 'text/csv';
        },

        // public methods
        // returns string
        getExtension: function (/*fmDto.FileType*/fileType) {
            return this._fileExtMaps.item(fileType);
        },

        getType: function (/*string*/extension) {
            // normalize to lowercase
            if (extension) {
                var key = extension.toLowerCase();
                return this._fileExtMaps.item(key);
            }
            else {
                return this._defaultType;
            }
        },

        // returns string containing one or more comma separated mime types
        getMimeTypes: function (/*optional fmDto.FileType*/fileType) {
            if ((fileType != null) && Reflection.validateEnumValue(fileType, fmDto.FileType)) {
                return this._mimeTypes[fileType];
            }
            else {
                var mimeTypes = new Builder();
                array.forEach(this._mimeTypes, function (mimeType, i) {
                    mimeTypes.append(mimeType);
                    if (i < (this._mimeTypes.length - 1)) {
                        mimeTypes.append(',');
                    }
                }, this);

                return mimeTypes.toString();
            }
        }
    });
});