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

        // create default icon
        self._config.DefaultIcon = L.icon({
            iconUrl: "https://localhost:7443/OWFLeaflet/vendor/images/marker-icon.png"
        });

        // create storage for placemarks
        self._config.Placemarks = [];
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
        var style = {};

        if (container.StyleMap) {
            if (container.StyleMap._attr.id === styleId) {
                styleFound = true;

                // now find the individual styles for the styleMap
                style[styleId] = {};
                $.each(container.StyleMap.Pair, function (index, item) {
                    var id = item.styleUrl._text.replace("#", "");
                    style[styleId][id] = self._getStyle(container, id);
                });
            }
        }

        if (!styleFound && container.Style) {
            $.each(container.Style, function (index, item) {
                if (item._attr.id === styleId) {
                    style[styleId] = item;
                    styleFound = true;
                }
            });
        }

        if (!styleFound && container.parentContainer) {
            return self._getStyle(container.parentContainer, styleId);
        } else {
            return style;
        }
    }

    KMLLayer.prototype._processPlacemark = function (placemark) {
        var self = this;

        // different geometry types
        // Point, LineString, LinearRing, Polygon, MultiGeometry, <gx:MultiTrack>, <Model>, <gx:Track>

        // Point
        var styleId, style, marker, options = {},
            coords, coordsArray;
        if (placemark instanceof Array) {
            $.each(placemark, function (index, item) {
                if ((index === "container") || (index === "parentContainer")) {

                } else {
                    self._processPlacemark(item);
                }
            });
        } else {
            if (placemark.Point) {
                if (placemark.styleUrl) {
                    styleId = placemark.styleUrl._text.replace("#", "");

                    style = self._getStyle(placemark.container, styleId);
                }

                // create marker and store it
                if (style) {
                    if (Object.keys(style[styleId]).length === 2) {
                        $.each(style[styleId], function (index, item) {
                            if (item[index].IconStyle) {
                                if (index.toLowerCase().startsWith("normal")) {
                                    options.iconNormal = L.icon({
                                        iconUrl: item[index].IconStyle.Icon.href._text
                                    });

                                    options.icon = options.iconNormal;
                                } else {
                                    options.iconHighlight = L.icon({
                                        iconUrl: item[index].IconStyle.Icon.href._text
                                    });
                                }
                            }
                        });
                    } else {
                        if (style[styleId].IconStyle) {
                            options.iconNormal = L.icon({
                                iconUrl: style[styleId].IconStyle.Icon.href._text
                            });
                            options.icon = options.iconNormal;
                        }
                    }
                } else {
                    options.icon = self.getProperty("DefaultIcon");
                }
                coords = placemark.Point.coordinates._text.split(",");
                if (placemark.name) {
                    options.title = placemark.name._text;
                }
                //marker = L.marker([coords[1], coords[0]], options);
                marker = new marker2([coords[1], coords[0]], options);
                marker.on("mouseover", function (e) {
                    if (e.target.options.iconHighlight.options.iconUrl != "") {
                        e.target.setIcon(e.target.options.iconHighlight);
                    }
                });
                marker.on("mouseout", function (e) {
                    if (e.target.options.iconHighlight.options.iconUrl != "") {
                        e.target.setIcon(e.target.options.iconNormal);
                    }
                });
                self._config.Placemarks.push(marker);
            } else if (placemark.LineString) {
                if (placemark.styleUrl) {
                    var id = placemark.styleUrl._text.replace("#", "");

                    style = self._getStyle(placemark.container, id);
                }
            } else if (placemark.LinearRing) {
                if (placemark.styleUrl) {
                    var id = placemark.styleUrl._text.replace("#", "");

                    style = self._getStyle(placemark.container, id);
                }
            } else if (placemark.Polygon) {
                if (placemark.styleUrl) {
                    var id = placemark.styleUrl._text.replace("#", "");

                    style = self._getStyle(placemark.container, id);
                }
            } else if (placemark.MultiGeometry) {
                if (placemark.styleUrl) {
                    var id = placemark.styleUrl._text.replace("#", "");

                    style = self._getStyle(placemark.container, id);
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