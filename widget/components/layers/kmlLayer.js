// widget object wrapper
var KMLLayerObject = (function () {
    // static variables

    // static objects

    var KMLLayer = function (content, options) {
        this._config = {};
        this._initialize(content, options);
    }

    KMLLayer.prototype._initialize = function(conent, options) {
        var self = this;

        // part the options and update config
        $.each(options, function(index, item) {
            self._config[index] = item;
        });

        // store the content
        self._config.content = content;
    }

    return KMLLayer;
})();
