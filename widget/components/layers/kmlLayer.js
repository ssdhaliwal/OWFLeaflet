// widget object wrapper
var KMLLayerObject = (function () {
    // static variables

    // static objects

    var KMLLayer = function (content, options) {
        this._config = {};
        this._initialize(content, options);
    }

    KMLLayer.prototype._initialize = function (conent, options) {
        var self = this;

        // part the options and update config
        $.each(options, function (index, item) {
            self._config[index] = item;
        });

        // store the content
        self.setProperty("content", content);
    }

    KMLLayer.prototype.getProperty = function (key) {
        var self = this;

        if (self._config.hasOwnProperty(key)) {
            return self._config[key];
        }
    }

    KMLLayer.prototype.setProperty = function (key, value) {
        var self = this;

        if (key && value) {
            self._config[key] = value;
        } else {
            if (key) {
                delete self._config[key];
            }
        }
    }

    KMLLayer.prototype._getStyle = function (container, styleId) {
        var self = this;

        // loop through the container styles
        var styleFound = false;
        console.log(container, styleId);
        if (container.StyleMap) {
            if (container.StyleMap._attr.id === styleId) {
                console.log(".. .. SM-" + container.StyleMap);
                styleFound = true;
                $.each(container.StyleMap.Pair, function (index, item) {
                    self._getStyle(container, item.styleUrl._text.replace("#", ""));
                });
            }
        }

        if (!styleFound && container.Style) {
            $.each(container.Style, function (index, item) {
                if (item._attr.id === styleId) {
                    console.log(".. .. ST-" + item);
                    styleFound = true;
                    return false;
                }
            });

            if (!styleFound && container.parentContainer) {
                self._getStyle(container.parentContainer, styleId);
            }
        }
    }

    KMLLayer.prototype._processPlacemark = function (placemark) {
        var self = this;

        // different geometry types
        // Point, LineString, LinearRing, Polygon, MultiGeometry, <gx:MultiTrack>, <Model>, <gx:Track>

        // Point
        var style;
        if (placemark instanceof Array) {
            $.each(placemark, function (index, item) {
                if ((index === "container") || (index === "parentContainer")) {

                } else {
                    console.log(item);
                    self._processPlacemark(item);
                    console.log("+++++-----+++++-----+++++-----+++++-----+++++-----+++++-----");
                }
            });
        } else {
            if (placemark.Point) {
                if (placemark.styleUrl) {
                    console.log("--> Pt-" + placemark.styleUrl._text.replace("#", ""));
                    style = self._getStyle(placemark.container, placemark.styleUrl._text.replace("#", ""));
                } else {
                    console.log("--> Pt-no style");
                }
            }
            else if (placemark.LineString) {
                if (placemark.styleUrl) {
                    console.log("--> LS-" + placemark.styleUrl._text.replace("#", ""));
                    style = self._getStyle(placemark.container, placemark.styleUrl._text.replace("#", ""));
                } else {
                    console.log("--> LS-no style");
                }
            }
            else if (placemark.LinearRing) {
                if (placemark.styleUrl) {
                    console.log("--> LR-" + placemark.styleUrl._text.replace("#", ""));
                    style = self._getStyle(placemark.container, placemark.styleUrl._text.replace("#", ""));
                } else {
                    console.log("--> LR-no style");
                }
            }
            else if (placemark.Polygon) {
                if (placemark.styleUrl) {
                    console.log("--> Pg-" + placemark.styleUrl._text.replace("#", ""));
                    style = self._getStyle(placemark.container, placemark.styleUrl._text.replace("#", ""));
                } else {
                    console.log("--> pg-no style");
                }
            }
            else if (placemark.MultiGeometry) {
                if (placemark.styleUrl) {
                    console.log("--> MG-" + placemark.styleUrl._text.replace("#", ""));
                    style = self._getStyle(placemark.container, placemark.styleUrl._text.replace("#", ""));
                } else {
                    console.log("--> MG-no style");
                }
            }
        }
    }

    KMLLayer.prototype.getPlacemarks = function (node, adjLevel) {
        var self = this;

        // make sure node is instance of object or array
        //if ((!node) || (node instanceof String) || (node instanceof Number) ||
        //    (node instanceof Boolean)) {
        //    return;
        //}

        // collect all placemarks
        // - collect styleurl info
        // - - follow the closest document backwards.
        // create the placemark
        // http://docs.opengeospatial.org/is/12-007r2/12-007r2.html     
        var prop, level = 1;
        $.each(node, function (index, item) {
            if (item) {
                if ((index === "container") || (index === "parentContainer")) {

                } else {
                    if (index === "Placemark") {
                        self._processPlacemark(item);
                        console.log("------------------------------------------------------------");
                    }

                    if ((item instanceof Object) || (item instanceof Array)) {
                        if (item.hasOwnProperty("level")) {
                            level = item.level;
                            adjLevel = level;
                        }

                        //console.log(Array(adjLevel).join(' ') + index);
                        adjLevel++;
                        self.getPlacemarks(item, adjLevel);
                        adjLevel--;
                    }
                }
            }
        });
    }

    return KMLLayer;
})();