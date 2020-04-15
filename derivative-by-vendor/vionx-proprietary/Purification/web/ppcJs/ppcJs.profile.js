var profile = (function () {
    copyOnly = function (filename, mid) {
        var list = {
            'ppcJs/dojo.profile': 1,
            'ppcJs/package.json': 1,
            'ppcJs/downloadify': 1
        };
        return (mid in list) || /^dojo\/_base\/config\w+$/.test(mid) || (/^dojo\/resources\//.test(mid) && !/\.css$/.test(filename)) || /(png|jpg|jpeg|gif|tiff)$/.test(filename);
    };

    return {
        resourceTags: {
            test: function (filename, mid) {
                return false;
            },

            copyOnly: function (filename, mid) {
                return copyOnly(filename, mid);
            },

            amd: function (filename, mid) {
                return false;
            }
        },

        trees: [
			['.', '.', /(\/\.)|(~$)/]
		]
    };
})();