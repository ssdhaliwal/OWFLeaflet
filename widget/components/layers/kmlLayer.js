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

        // create default styles for icon, lines, etc.
        self._config.DefaultIconStyle = L.icon({
            iconUrl: "https://localhost:7443/OWFLeaflet/vendor/images/marker-icon.png"
        });
        self._config.DefaultLineStyle = {
            smoothFactory: 1.0,
            stroke: true,
            color: "#3388ff",
            weight: 1,
            opacity: 1.0
        }
        self._config.DefaultPolygonStyle = {
            smoothFactory: 1.0,
            stroke: true,
            color: "#3388ff",
            weight: 1,
            opacity: 1.0,
            fill: true,
            fillColor: "#3388ff",
            fillOpacity: 0.2,
            fillRule: "evenodd"
        }

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
            if (Array.isArray(container.Style)) {
                $.each(container.Style, function (index, item) {
                    if (item._attr.id === styleId) {
                        style[styleId] = item;
                        styleFound = true;
                    }
                });
            } else {
                if (container.Style._attr.id === styleId) {
                    style[styleId] = container.Style;
                    styleFound = true;
                } else {
                    if (container.Style.parentContainer) {
                        return self._getStyle(container.Style.parentContainer, styleId);
                    }
                }
            }
        }

        if (!styleFound && container.parentContainer) {
            return self._getStyle(container.parentContainer, styleId);
        } else {
            return style;
        }
    }

    KMLLayer.prototype._getPoint = function(point, name, styleId, style) {
        var self = this;
        var result, options = {}, coords;
        
        // create marker and return it
        options.icon = self.getProperty("DefaultIconStyle");
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
        }

        if (name) {
            options.title = name;
        }

        coords = kml2lfCoords(point.coordinates._text);

        //marker = L.marker([coords[1], coords[0]], options);
        result = new marker2(coords, options);
        result.on("mouseover", function (e) {
            if (e.target.options.iconHighlight.options.iconUrl != "") {
                e.target.setIcon(e.target.options.iconHighlight);
            }
        });
        result.on("mouseout", function (e) {
            if (e.target.options.iconHighlight.options.iconUrl != "") {
                e.target.setIcon(e.target.options.iconNormal);
            }
        });

        return result;
    }

    KMLLayer.prototype._getLineString = function(lineString, name, styleId, style) {
        var self = this;
        var result, options = {}, coordsArray;
        
        // create lineString and return it
        options = self.getProperty("DefaultLineStyle");
        if (style) {
            if (style[styleId].LineStyle) {
                if (style[styleId].LineStyle.color) {
                    options.color = kml2lfColor(style[styleId].LineStyle.color._text);
                }
                if (style[styleId].LineStyle.width) {
                    options.weight = style[styleId].LineStyle.width._text;
                }
            }
        }

        if (name) {
            options.title = name;
        }

        coordsArray = kml2lfLineCoords(lineString.coordinates._text);
        result = L.polyline(coordsArray, options);

        return result;
    }

    KMLLayer.prototype._getLinearRing = function(linearString, name, styleId, style) {
        var self = this;
        var result, options = {}, coordsArray = [];
        
        // create polygon and return it
        var options = self.getProperty("DefaultPolygonStyle");
        if (style) {
            if (style[styleId].PolyStyle) {
                if (style[styleId].PolyStyle.color) {
                    options.color = kml2lfColor(style[styleId].PolyStyle.color._text);
                }
                if (style[styleId].PolyStyle.width) {
                    options.weight = style[styleId].PolyStyle.width._text;
                }
                if (style[styleId].PolyStyle.fill) {
                    options.weight = style[styleId].PolyStyle.fill._text;
                }
            }
        }

        if (name) {
            options.title = name;
        }

        coordsArray.push(kml2lfLineCoords(linearString.coordinates._text));

        result = L.polygon(coordsArray, options);
        return result;
    }

    KMLLayer.prototype._getPolygon = function(polygon, name, styleId, style) {
        var self = this;
        var result, options = {}, coordsArray = [];
        
        // create polygon and return it
        // always outerBoundaryIs
        var options = self.getProperty("DefaultPolygonStyle");
        if (style) {
            if (style[styleId].PolyStyle) {
                if (style[styleId].PolyStyle.color) {
                    options.color = kml2lfColor(style[styleId].PolyStyle.color._text);
                }
                if (style[styleId].PolyStyle.width) {
                    options.weight = style[styleId].PolyStyle.width._text;
                }
                if (style[styleId].PolyStyle.fill) {
                    options.weight = style[styleId].PolyStyle.fill._text;
                }
            }
        }

        if (name) {
            options.title = name;
        }

        coordsArray.push(kml2lfLineCoords(polygon.outerBoundaryIs.LinearRing.coordinates._text));

        // 0..n innerBoundaryIs
        if (polygon.innerBoundaryIs) {
            $.each(polygon.innerBoundaryIs, function(index, item) {
                if (index === "LinearRing") {
                    coordsArray.push(kml2lfLineCoords(item.coordinates._text));
                }
            });
        }

        result = L.polygon(coordsArray, options);
        return result;
    }

    KMLLayer.prototype._getMultiGeometry = function(multiGeometry, name, styleId, style) {
        var self = this;
        var result = [];

        // multiGeometry can be collections of collections.
        $.each(multiGeometry, function(index, item) {
            if (index === "Point") {
                if (Array.isArray(item)) {
                    $.each(item, function(subItemIndex, subItem) {
                        result.push(self._getPoint(subItem, name, styleId, style));
                    });
                } else {
                    result.push(self._getPoint(item, name, styleId, style));
                }
            } else
            if (index === "LineStyle") {
                if (Array.isArray(item)) {
                    $.each(item, function(subItemIndex, subItem) {
                        result.push(self._getLineStyle(subItem, name, styleId, style));
                    });
                } else {
                    result.push(self._getLineStyle(item, name, styleId, style));
                }
            } else
            if (index === "LinearRing") {
                if (Array.isArray(item)) {
                    $.each(item, function(subItemIndex, subItem) {
                        result.push(self._getLinearRing(subItem, name, styleId, style));
                    });
                } else {
                    result.push(self._getLinearRing(item, name, styleId, style));
                }
            } else
            if (index === "Polygon") {
                if (Array.isArray(item)) {
                    $.each(item, function(subItemIndex, subItem) {
                        result.push(self._getPolygon(subItem, name, styleId, style));
                    });
                } else {
                    result.push(self._getPolygon(item, name, styleId, style));
                }
            } else
            if (index === "MultiGeometry") {
                if (Array.isArray(item)) {
                    $.each(item, function(subItemIndex, subItem) {
                        result.push(self._getMultiGeometry(subItem, name, styleId, style));
                    });
                } else {
                    result.push(self._getMultiGeometry(item, name, styleId, style));
                }
            }
        });

        return result;
    }
    
    KMLLayer.prototype._processPlacemark = function (placemark) {
        var self = this;

        // different geometry types
        // Point, LineString, LinearRing, Polygon, MultiGeometry, <gx:MultiTrack>, <Model>, <gx:Track>

        var name, styleId, style, result;
        if (placemark instanceof Array) {
            $.each(placemark, function (index, item) {
                if ((index === "container") || (index === "parentContainer")) {

                } else {
                    self._processPlacemark(item);
                }
            });
        } else {
            // get style for placemark
            if (placemark.styleUrl) {
                styleId = placemark.styleUrl._text.replace("#", "");

                style = self._getStyle(placemark.container, styleId);
            }

            if (placemark.name) {
                name = placemark.name._text;
            }

            if (placemark.Point) {
                result = self._getPoint(placemark.Point, name, styleId, style);
                self._config.Placemarks.push(result);
            } else if (placemark.LineString) {
                result = self._getLineString(placemark.LineString, name, styleId, style);
                self._config.Placemarks.push(result);
            } else if (placemark.LinearRing) {
                result = self._getLinearRing(placemark.LinearRing, name, styleId, style);
            } else if (placemark.Polygon) {
                result = self._getPolygon(placemark.Polygon, name, styleId, style);
                self._config.Placemarks.push(result);
            } else if (placemark.MultiGeometry) {
                result = self._getMultiGeometry(placemark.MultiGeometry, name, styleId, style);
                $.each(result, function(index, item) {
                    self._config.Placemarks.push(item);
                });
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