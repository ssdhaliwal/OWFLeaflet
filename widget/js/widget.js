//The location is assumed to be at /<context>/js/eventing/rpc_relay.uncompressed.html if it is not set
OWF.relayFile = "../../vendor/js/eventing/rpc_relay.uncompressed.html";
owfdojo.config.dojoBlankHtmlUrl = '../../vendor/js/dojo-1.5.0-windowname-only/dojo/resources/blank.html';

// widget object wrapper
var WidgetObject = (function () {
    // static variables

    // static objects

    var Widget = function () {
        // global class variables
        this._Logger = OWF.Log.getDefaultLogger();
        this._LoggerAppender = this._Logger.getEffectiveAppenders()[0];

        // interval/workers trackking
        this._WidgetStateController = null;

        // user object
        this._state = {};
        this._overlays = {};
        this._overlayFeatureList = [];
        this._featureOverlayList = [];

        this._tvOverlayData = [];

        // timer tracking
        this._Interval = {};

        // OWF event subscriptions
        this._subscriptions = {
            mapStatusRequest: "map.status.request",
            mapViewZoom: "map.view.zoom",
            mapViewCenterOverlay: "map.view.center.overlay",
            mapViewCenterFeature: "map.view.center.feature",
            mapViewCenterLocation: "map.view.center.location",
            mapViewCenterBounds: "map.view.center.bounds",
            mapViewAreaSelected: "map.view.area.selected",
            mapOverlayCreate: "map.overlay.create",
            mapOverlayRemove: "map.overlay.remove",
            mapOverlayHide: "map.overlay.hide",
            mapoverlayShow: "map.overlay.show",
            mapOverlayUpdate: "map.overlay.update"
        };

        // waiting image
        this._menuClickOK = true;
        this._WaitingIcon = $("#waitingImage");

        // external objects

        // widget elements
        this._divMap = $("#divMap");
        this._divStatus = $("#divStatus");
        this._baseMapTile = null;
        this._map = null;

        // widget buttons
        this._btnMaps = $("#btnMaps");
        this._btnLayers = $("#btnLayers");
        this._btnDraw = $("#btnDraw");
        this._btnQuery = $("#btnQuery");
        this._btnOptions = $("#btnOptions");
        this._btnStatus = $("#btnStatus");
        this._btnReset = $("#btnReset");

        // overlay view
        this._tvOverlay = null;
    }

    // ----- start ----- common widget functions ----- start ----
    // Enable logging
    Widget.prototype.setLogThreshold = function () {
        this._LoggerAppender.setThreshold(log4javascript.Level.INFO);
        OWF.Log.setEnabled(false);
    }

    // shared functions
    Widget.prototype.ajaxCall = function (url, data, callback, stateChange, type,
        contentType) {
        var self = this;

        // fix input vars if not defined
        if ((data === undefined) || (data === null) || (!data)) {
            data = {};
        }

        if ((callback === undefined) || (callback === null) || (!callback)) {
            callback = function () {};
        }

        if ((stateChange === undefined) || (stateChange === null) || (!stateChange)) {
            stateChange = function () {};
        }

        if ((type === undefined) || (type === null) || (!type)) {
            //default to a GET request
            type = 'GET';
        }

        // initiate the call
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            stateChange({
                state: req.readyState,
                status: req.status
            });

            if (req.readyState === 4 && req.status === 200) {
                return callback(req.responseText);
            }
        };
        req.open(type, url, true);
        req.withCredentials = true;

        //req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //req.setRequestHeader("Content-type", "application/json");
        if (!contentType) {
            req.setRequestHeader("Content-type", contentType);
        } else {
            req.setRequestHeader("Content-type", "text/plain");
        }

        if (type === 'GET') {
            req.send();
        } else {
            req.send(JSON.stringify(data));
        }

        // return the object
        return req;
    }

    // document level events
    Widget.prototype.getState = function (key) {
        var self = this;

        if (self._state.hasOwnProperty(key)) {
            return self._state[key];
        } else {
            return undefined;
        }
    }
    Widget.prototype.setState = function (key, value) {
        var self = this;

        self._state[key] = value;
    }

    Widget.prototype.resizeMap = function () {
        $('#divMap').css("height", ($('body').height() - $(".navbar")[0].clientHeight) - 2);
    }

    Widget.prototype.documentBindings = function () {
        var self = this;
        // prevent document to show contextmenu
        //$(document).bind("contextmenu",function(event)
        //{
        //  return false;
        //});

        // global resize event
        $(window).resize(function () {
            self.resizeMap();
        });

        // global click event
        $('body').on('click', function (e) {
            // manage the drop-down close
            self._menuCloseOK = true;

            // if this is a node-treeView; then we don't want to close
            if (e.target.parentNode) {
                if ($(e.target.parentNode).hasClass("node-treeView")) {
                    self._menuCloseOK = false;
                } else {
                    $('.dropdown.open').removeClass('open');
                }
            }
        });
    }

    // component level events
    Widget.prototype.componentBindings = function () {
        var self = this;

        // detect change to navbar size
        $(".navbar-toggle").on('click', function (e) {});
        $(".navbar-collapse").on('shown.bs.collapse', function (e) {
            $("body").addClass("body-overflow");
        });
        $(".navbar-collapse").on('hidden.bs.collapse', function (e) {
            $("body").removeClass("body-overflow");
        });

        // detect change to drop-down close and ignore it
        $(".navbar-collapse").on('hide.bs.dropdown', function (e) {
            var target = $(e.target);

            if (target.hasClass("keepopen") || target.parents(".keepopen").length) {
                if (self._menuCloseOK) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        });

        // detect change to the div

        // click handler for userInfo button
        self._btnMaps.click(function () {});

        // click handler for reset button
        self._btnLayers.click(function () {});

        // click handler for UUID button
        self._btnDraw.click(function () {});

        // click handler for Widgets button
        self._btnQuery.click(function () {});

        // click handler for Counts button
        self._btnOptions.click(function () {});

        // click handler for Group button
        self._btnStatus.click(function () {});

        // click handler for Dashboards button
        self._btnReset.click(function () {});
    }

    // configure the popup for alerts
    Widget.prototype.displayNotification = function (message, type, statusMessage) {
        var d = new Date();
        var dtg = d.format(dateFormat.masks.isoTime);

        $("#infoDiv").append(dtg + ", " + type + ", " + message +
            ((statusMessage === undefined) ? "" : ", " + statusMessage));
        $("#infoDiv").append("<br/>");

        if ((message !== undefined) && (message !== null) && (message.length !== 0)) {
            if ((type !== undefined) && (type !== null) && (type.length !== 0)) {
                $("#notification").css('color', 'white');
                $("#notification").html(dtg + " " + message);
            }
        }

        if ((statusMessage !== undefined) && (statusMessage !== null) &&
            (statusMessage.length !== 0)) {
            if ((type !== undefined) && (type !== null) && (type.length !== 0)) {
                if (type === "success") { // this._reen background-#DFF0D8
                    $("#notification").css('color', '#468847');
                } else if (type === "info") { // blue background-#D9EDF7
                    $("#notification").css('color', '#3A87AD');
                } else if (type === "warn") { // yellow background-#FCF8E3
                    $("#notification").css('color', '#C09853');
                } else if (type === "error") { // red background-#F2DEDE
                    $("#notification").css('color', '#B94A48');
                } else {
                    $("#notification").css('color', 'white');
                }
            }

            $("#notification").html(dtg + " " + message + ", " + statusMessage);
        }
    }

    // waiting image
    Widget.prototype.waitingStatus = function (state) {
        var self = this;

        if ((state !== undefined) && (state !== null) && (state.length !== 0)) {
            self._WaitingIcon.show();
        } else {
            self._WaitingIcon.hide();
        }
    }

    // main initialize and run functions for OWF
    Widget.prototype.shutdownWidget = function (sender, msg) {
        var self = this;

        // remove listener override to prevent looping
        self._WidgetStateController.removeStateEventOverrides({
            events: ['beforeclose'],
            callback: function () {
                // unsubcribe the events
                self.setState("initialization", "teardown");
                self.sendMapStatusInitialization("teardown");
                self.clearCMAPISubscriptions();

                // close widget
                self._WidgetStateController.closeWidget();
            }
        });
    }

    // add basemap links to the menu
    Widget.prototype.addBaseMaps = function () {
        var self = this;

        // load basemaps
        $.each(gConfigObject.map.basemaps, function (index, item) {
            $("#mapMenuItems").append("<li><a class='mapOverlay' href='#' data-mapid='" + index + "'>" + item[0] + "</a></li>");
        });

        $(".mapOverlay").on('click', function (e) {
            var mapId = $(e.target).data("mapid");
            var mapConfig = gConfigObject.map.basemaps[mapId];

            // remove current
            if (self._baseMapTile) {
                self._baseMapTile.removeFrom(self._map);
                self._baseMapTile = undefined;
            }

            // update options
            var options = {};
            if (mapConfig[3]) {
                $.each(mapConfig[3], function (index, item) {
                    options[index] = item;
                });
            }
            options.attribution = mapConfig[2];

            // add new
            self._baseMapTile = L.tileLayer(mapConfig[1], options).addTo(self._map);
        });
    }

    // add layer links to the menu
    Widget.prototype.addLayerMaps = function () {
        var self = this;

        // overlay/feature layers
        //$("#layerMenuItems").append("<li><a href='#'>Layer #1</a></li>");
        self._tvOverlay = $('#treeView').treeview({
            data: self._tvOverlayData,
            showIcon: false,
            showCheckbox: true,
            onNodeChecked: function (event, node) {
                //$('#checkable-output').prepend('<p>' + node.text + ' was checked</p>');
                console.log(node.text);
            },
            onNodeUnchecked: function (event, node) {
                //$('#checkable-output').prepend('<p>' + node.text + ' was unchecked</p>');
                console.log(node.text);
            }
        });
    }

    // initialize for class (fixes the html components)
    Widget.prototype.initialize = function (XMLObject, KMLLayerObject) {
        var self = this;

        // set initial state of the controls
        self.displayNotification("initializing widget", "info");
        self.sendMapStatusInitialization("init");
        self.setState("initialization", "init");

        // widget state controller
        self._WidgetStateController = Ozone.state.WidgetState.getInstance({
            widgetEventingController: Ozone.eventing.Widget.getInstance(),
            autoInit: true,

            // this is fired on any event that you are registered for.
            // the msg object tells us what event it was
            onStateEventReceived: function (sender, msg) {
                if (msg.eventName == "beforeclose") {
                    self.shutdownWidget(null, null);
                }
            }
        });

        self._WidgetStateController.addStateEventOverrides({
            events: ["beforeclose"]
        });

        // initialize external objects
        self.setState("XMLObject", XMLObject);
        self.setState("KMLLayerObject", KMLLayerObject);
        self.setState("instanceId", OWF.getInstanceId());
        self.setState("widgetGuid", OWF.getWidgetGuid());

        // wait for card library to be loaded
        // use below code to make sure document is fully loaded due to template
        // loading javascript before the entire page is loaded
        self.owner = this;
        self._Interval.t1 = setInterval(function () {
            clearInterval(self._Interval.t1);
            self.waitingStatus();

            // register all document/component event bindings
            self.documentBindings();
            self.componentBindings();

            // show the leaflet map
            L.Icon.Default.imagePath = '../vendor/images';

            // set initial view and onload handler
            self._map = L.map('divMap').on('load', function (event) {
                self.onMapLoad(event);
            }).setView([39.8283, -98.5795], 4);

            // link map events
            self.setCMAPIPublications();
            self._baseMapTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            }).addTo(self._map);
            self.setCMAPISubscriptions();

            // notify widget is ready
            OWF.notifyWidgetReady();
            self.resizeMap();

            // add basemaps in a second
            self._Interval.t1 = setInterval(function () {
                clearInterval(self._Interval.t1);

                self.addBaseMaps();
                self.addLayerMaps();
            }, 1000);

            self.displayNotification("widget initialization complete", "info");
            self.waitingStatus();
        }, 1000);
    }
    // -----  end  ----- common widget functions -----  end  ----

    // ----- start ----- widget UI functions     ----- start ----
    // -----  end  ----- widget UI functions     -----  end  ----

    // ----- start ----- widget functions        ----- start ----
    Widget.prototype.onClick = function (event) {
        var self = this;

        var latlngFixed = self._map.wrapLatLng(event.latlng);
        var message = {
            "lat": latlngFixed.lat,
            "lon": latlngFixed.lng,
            "buttons": event.originalEvent.buttons,
            "type": event.type,
            "keys": [],
            "time": {
                "timeStamp": event.originalEvent.timeStamp
            }
        };

        // fix alt keys
        if (event.originalEvent.altKey) {
            message.keys.push("alt");
        }
        if (event.originalEvent.ctrlKey) {
            message.keys.push("ctrl");
        }
        if (event.originalEvent.shiftKey) {
            message.keys.push("shift");
        }
        if (event.originalEvent.metaKey) {
            message.keys.push("meta");
        }

        // fix event type
        var eventType = message.type;
        if ((message.type === "click") || (message.type === 'dblclick')) {
            eventType = 'clicked';
        }
        self.sendChannelMessage("map.view." + eventType, message);
    }
    Widget.prototype.onMouseMove = function (event) {
        var self = this;

        var latlngFixed = self._map.wrapLatLng(event.latlng);
        var message = {
            "container": {
                "x": event.containerPoint.x,
                "y": event.containerPoint.y
            },
            "map": {
                "lat": latlngFixed.lat,
                "lon": latlngFixed.lng
            }
        };

        self._divStatus.html(JSON.stringify(message));

        // check if mousemove event is set to broadcast
        if (gConfigObject.map.events.mousemove) {
            self.sendChannelMessage("map.view.mousemove", message);
        }
    }
    Widget.prototype.onMapLoad = function (event) {
        var self = this;

        self.setState("initialization", "load");
        self.sendMapStatusInitialization("load");
    }

    Widget.prototype.sendMapStatusInitialization = function (status, payload) {
        var self = this;

        // format channel message
        var message = {
            "status": status
        };
        if (!payload) {
            message["payload"] = payload;
        }

        // send message
        self.sendChannelMessage("map.status.initialization", message);
    }

    Widget.prototype.sendChannelMessage = function (channel, message) {
        OWF.Eventing.publish(channel, JSON.stringify(message));
    };

    Widget.prototype.sendChannelErrorMessage = function (sender, type, message, error) {
        var result = {
            "sender": sender,
            "type": type,
            "message": message,
            "error": error
        }

        OWF.Eventing.publish("map.error", JSON.stringify(result));
    };

    Widget.prototype.setCMAPIPublications = function () {
        var self = this;

        //var kml = self.getState("KMLLayerObject");
        //var kmlLayer = new kml("TEST CONTENT", {
        //    opt1: "test",
        //    opt2: "test2"
        //});

        //var xml = self.getState("XMLObject");
        //var xmlObject = new xml(xmlContent, {
        //        valueNode: "_value",
        //        textNode: "_text",
        //        attributeNode: "_attr"
        //    });

        //var level = 0;
        //var result = xmlObject.toJSON(null, level, "");
        //console.log(result);

        // map.feature.plot
        // map.feature.plot.url
        // map.feature.unplot
        // map.feature.hide
        // map.feature.show
        // map.feature.selected
        // map.feature.deselected
        // map.feature.update

        // map.view.zoom
        // map.view.center.layer
        // map.view.center.feature
        // map.view.center.location
        // map.view.center.bounds
        // map.view.clicked
        self._map.on('click dblclick mousedown mouseup', function (event) {
            self.onClick(event);
        });

        // map.view.mousemove
        self._map.on('mousemove', function (event) {
            self.onMouseMove(event);
        });

        // map.status.request
        // map.status.[request_type | view | about | selected | query ]
        // map.status.[events | popupopen | popupclose | tooltipopen | tooltipclose | locationerror | locationfound ]

        // map.initialization [ options | init | load | reset | unload ]

        // map.feature.edit
        // map.feature.draw
        // map.feature.edit.complete
        // map.feature.draw.complete
        // map.message.cancel

        // internal items for map control
        // when moveend or zoomend is triggered and state has pending zoom set zoom
        self._map.on('moveend zoomend', function (event) {
            var zoom = self.getState("pendingZoom");
            if (zoom !== undefined) {
                self.setState("pendingZoom", undefined);
                self._map.setZoom(zoom);
            }
        });
    }

    Widget.prototype.onRecvMapStatusRequest = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);

        // process each item in the status array
        $.each(payload.types, function (index, item) {
            if (item === "view") {
                var result = {};
                var bounds = self._map.getBounds();
                var boundsFixed =
                    self._map.wrapLatLngBounds([
                        [bounds._southWest.lat, bounds._southWest.lng],
                        [bounds._northEast.lat, bounds._northEast.lng]
                    ]);

                result.bounds = {};
                result.bounds.southWest = {}
                result.bounds.southWest.lat = boundsFixed._southWest.lat;
                result.bounds.southWest.lon = boundsFixed._southWest.lng;
                result.bounds.northEast = {}
                result.bounds.northEast.lat = boundsFixed._northEast.lat;
                result.bounds.northEast.lon = boundsFixed._northEast.lng;

                var latlng = self._map.wrapLatLng(self._map.getCenter());
                result.center = latlng;

                result.range = {};
                result.range.current = self._map.getZoom();
                result.range.min = self._map.getMinZoom();
                result.range.max = self._map.getMaxZoom();

                result.requester = JSON.parse(sender);

                self.sendChannelMessage("map.status.view", result);
            } else if (item === "format") {
                var result = {
                    format: ["none"]
                }

                self.sendChannelMessage("map.status.format", result);
            } else if (item === "selected") {
                var result = {
                    selected: undefined
                }

                self.sendChannelMessage("map.status.selected", result);
            } else if (item === "about") {
                var result = {
                    version: "0.1",
                    type: "2-D",
                    widgetName: "OWFLeaflet Map Widget",
                    instanceName: "",
                    universalName: "",
                    extensions: ""
                }

                self.sendChannelMessage("map.status.about", result);
            } else if (item === "initialization") {
                self.sendMapStatusInitialization(self.getState("initialization"));
            }
        });
    }

    Widget.prototype.checkZoomRange = function (range) {
        var self = this;

        // validate and set zoom
        var lmin = self._map.getMinZoom();
        var lmax = self._map.getMaxZoom();

        if ((range >= lmin) && (range <= lmax)) {
            return range;
        } else {
            self.sendChannelErrorMessage(JSON.parse(sender),
                self._subscriptions.mapViewCenterBounds,
                payload,
                "zoom is outside the map supported zoom limits - (" + lmin + ".." + lmax + ")");

            return undefined;
        }
    }

    Widget.prototype.onRecvMapViewZoom = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);
        var zoom = self.checkZoomRange(payload.zoom);

        if (zoom) {
            self._map.setZoom(payload.zoom);
        }
    }

    /* pending */
    Widget.prototype.onRecvMapViewCenterOverlay = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);
    }

    /* pending */
    Widget.prototype.onRecvMapViewCenterFeature = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);
    }

    Widget.prototype.onRecvMapViewCenterLocation = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);

        // adjust zoom as needed
        var zoom = self.checkZoomRange(payload.zoom);

        // adjust map to bounds provided
        self._map.setView(
            [payload.location.lat, payload.location.lon], zoom
        );

        // zoom will need to be triggered after zoom/move end event
        if (zoom) {
            self.setState("pendingZoom", zoom);
        }
    }

    Widget.prototype.onRecvMapViewCenterBounds = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);

        // adjust zoom as needed
        var zoom = self.checkZoomRange(payload.zoom);

        // adjust map to bounds provided
        self._map.flyToBounds(
            [
                [payload.bounds.southWest.lat, payload.bounds.southWest.lon],
                [payload.bounds.northEast.lat, payload.bounds.northEast.lon]
            ]
        );

        // zoom will need to be triggered after zoom/move end event
        if (zoom) {
            self.setState("pendingZoom", zoom);
        }
    }

    /* pending */
    Widget.prototype.onRecvMapViewAreaSelected = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);
    }

    Widget.prototype.onRecvMapOverlayCreate = function (sender, message) {
        var self = this;

        var requestor = JSON.parse(sender);
        var payload = JSON.parse(message);

        // parse message, if overlay exists - ignore, else add
        if (!payload.hasOwnProperty("overlayId")) {
            payload["overlayId"] = requestor.id;
        }
        if (!payload.hasOwnProperty("name")) {
            payload["name"] = payload["overlayId"];
        }

        // if parent id is empty
        var nodes, parentFound, nodeFound;
        // find all nodes matching parentId
        if (payload.hasOwnProperty("parentId")) {
            nodes = $('#treeView').treeview('findNodes', ['^'+payload.parentId+'$', 'overlayId']);
            $.each(nodes, function(index, item) {
                if (item.overlayId === payload.parentId) {
                    parentFound = item;
                    return;
                }
            });
        }

        // search for name in list
        nodes = $('#treeView').treeview('findNodes', ['^'+payload.name+'$', 'text']);
        $.each(nodes, function(index, item) {
            if (item.text === payload.name) {
                nodeFound = item;
                return;
            }
        });

        // name not found, add
        if (!nodeFound) {
            $('#treeView').treeview('addNode', [{text: payload.name,
                overlayId: payload.overlayId}, parentFound]);
        }
    }

    /* pending */
    Widget.prototype.onRecvMapOverlayRemove = function (sender, message) {
    }

    /* pending */
    Widget.prototype.onRecvMapOverlayHide = function (sender, message) {
    }

    /* pending */
    Widget.prototype.onRecvMapOverlayShow = function (sender, message) {
    }

    /* pending */
    Widget.prototype.onRecvMapOverlayUpdate = function (sender, message) {
    }

    Widget.prototype.clearCMAPISubscriptions = function () {
        var self = this;

        // for all subscriptions - remove subscription
        $.each(self._subscriptions, function (index, item) {
            OWF.Eventing.unsubscribe(item);
        });
    }
    Widget.prototype.setCMAPISubscriptions = function () {
        var self = this;

        OWF.Eventing.subscribe(self._subscriptions.mapStatusRequest,
            owfdojo.hitch(self, "onRecvMapStatusRequest"));

        OWF.Eventing.subscribe(self._subscriptions.mapViewZoom,
            owfdojo.hitch(self, "onRecvMapViewZoom"));

        OWF.Eventing.subscribe(self._subscriptions.mapViewCenterOverlay,
            owfdojo.hitch(self, "onRecvMapViewCenterOverlay"));

        OWF.Eventing.subscribe(self._subscriptions.mapViewCenterFeature,
            owfdojo.hitch(self, "onRecvMapViewCenterFeature"));

        OWF.Eventing.subscribe(self._subscriptions.mapViewCenterLocation,
            owfdojo.hitch(self, "onRecvMapViewCenterLocation"));

        OWF.Eventing.subscribe(self._subscriptions.mapViewCenterBounds,
            owfdojo.hitch(self, "onRecvMapViewCenterBounds"));

        OWF.Eventing.subscribe(self._subscriptions.mapViewAreaSelected,
            owfdojo.hitch(self, "onRecvMapViewAreaSelected"));

        OWF.Eventing.subscribe(self._subscriptions.mapOverlayCreate,
            owfdojo.hitch(self, "onRecvMapOverlayCreate"));

        OWF.Eventing.subscribe(self._subscriptions.mapOverlayRemove,
            owfdojo.hitch(self, "onRecvMapOverlayRemove"));

        OWF.Eventing.subscribe(self._subscriptions.mapOverlayHide,
            owfdojo.hitch(self, "onRecvMapOverlayHide"));

        OWF.Eventing.subscribe(self._subscriptions.mapOverlayShow,
            owfdojo.hitch(self, "onRecvMapOverlayShow"));

        OWF.Eventing.subscribe(self._subscriptions.mapOverlayUpdate,
            owfdojo.hitch(self, "onRecvMapOverlayUpdate"));
    }
    // -----  end  ----- widget functions        -----  end  ----

    return Widget;
})();