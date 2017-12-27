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

    KMLLayer.prototype.getPlacemarks = function() {
        var self = this;

        // collect all placemarks
        // - collect styleurl info
        // - - follow the closest document backwards.
        // create the placemark
        // http://docs.opengeospatial.org/is/12-007r2/12-007r2.html
        var masterStyles = [];
        $.each(result, function(index, item) {
            if (index === "styleUrl") {
                masterStyles.push(item);
            }
        });
        
        var styleList = [];
        var placemarks = [];
        $.each(result, function(index, item) {
            if ((index === "Document") || (index === "Folder")) {

            } else 
            if (index === "Placemark") {
                placemark.push(item);
            }
        });
    }

    return KMLLayer;
})();
