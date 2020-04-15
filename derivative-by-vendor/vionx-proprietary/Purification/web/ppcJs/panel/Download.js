// Subpanel wrapper for downloadify object, directory
// supports Panel lifecycle because downloadify only supports single instance on page

//dojo.declare('ppcJs.DownloadPanel', [dijit._Widget, dijit._Templated],
//{
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/request/script',
        './_Panel', 'dojo/text!./download/template/download.html'],
function (declare, lang, script,
        _Panel, template) {
    return declare([_Panel],
    {
        // dijit variables
        name: 'Download Panel',
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'downloadPanel',

        // private variables
        _contentCallback: '',
        _filenameCallback: '',


        // Panel API
        load: function (urlVal, resourceId, serverProcess, /*function returns string*/contentCallback, /*(optional) function returns string*/filenameCallback) {
            this._contentCallback = contentCallback;
            this._filenameCallback = filenameCallback;

            // fetch Downloadify library consisting of two modules (chain 2 deferreds)
            // - a partial function loads the second module; 
            var url1 = require.toUrl('ppcJs/panel/download/downloadify/js/swfobject.js');
            var url2 = require.toUrl('ppcJs/panel/download/downloadify/js/downloadify.min.js');
            var deferred = script.get(url1)
                .then(lang.hitch(script, 'get', url2));

            // create the widget once the files loaded
            deferred.then(lang.hitch(this, '_createDownloadify'), function () {
                console.log('DownloadPanel: downloadify load error.');
            });
        },

        unload: function () {
        },


        // Events
        onMouseEnter: function (evt) {
        },


        // private methods
        _createDownloadify: function () {
            var contentCallBack = lang.hitch(this, this._contentCallback);
            var filenameCallback = (this._filenameCallback) ? lang.hitch(this, this._filenameCallback) : lang.hitch(this, this._getDefaultFilename);
            var swfUrl = require.toUrl('ppcJs/panel/download/downloadify/media/downloadify.swf');
            var imageUrl = require.toUrl('ppcJs/panel/download/downloadify/images/download.png');

            Downloadify.create(this.downloadifyDiv, {
                filename: filenameCallback,
                data: contentCallBack,
                onComplete: function () { alert('Your File Has Been Saved.'); },
                onCancel: function () { /*silent cancel*/ },
                onError: function () { alert('Error: no contents to download.'); },
                swf: swfUrl,
                downloadImage: imageUrl,
                width: 100,
                height: 30,
                transparent: true,
                append: false
            });
        },

        _getDefaultFilename: function () {
            return 'download.csv';
        }
    });
});

