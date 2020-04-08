// ~/panel/fileManager/fmDto

define([], function () {
    return {
        // enum for configuring FileManager functionality
        ShowFileOptionType: {
            All: 0,             // all operations on static file state
            AllScripts: 1,      // all operations on static file state, filter to Enum.FileType.Script
            LoadScripts: 2,     // load operations (no change to static file state), filter to Enum.FileType.Script
            LoadDataNoImport: 3 // load operations (no change to static file state), no xmlElements returned to parent, filter to FileType.Data
        },

        // maps file extension to a FileType
        FileExtensionMap: function (/*string, less dot*/extension, /*FileType*/fileType) {
            this.extension = extension;
            this.fileType = fileType;
        },

        // API "type" attribute
        FileType: {
            Script: 0,
            Data: 1
        },

        // file name with metadata for filter by consumers
        FileIdentifier: function (longName, /*w/o extension*/shortName, /*FileType*/fileType) {
            this.longName = longName;
            this.shortName = shortName;
            this.fileType = fileType;
        },

        // for tracking file lifecycle
        FileState: function (name, /*bool, true= this file exists on both client & server*/loaded) {
            this.staticName = name;     // long file name used through lifecycle of file being handled by FileManager
            this.loaded = loaded;
            this.volatileName = '';     // long file name used once for transient action (when staticName shouldn't change)
            this.fileType = 0;
        }
    };
});