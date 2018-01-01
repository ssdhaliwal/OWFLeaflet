requirejs.config({
    urlArgs: "ver=" + (new Date()).getTime(),
    baseUrl: "widget",
    paths: {
        main: "main",
        jquery: "../vendor/js/jquery-3.2.1.min",
        lodash: "../vendor/js/lodash-4.17.4.min",
        handlebars: "../vendor/js/handlebars-4.0.11.min",
        bootstrap: "../vendor/js/bootstrap-3.3.7.min",
        smartmenus: "../vendor/js/jquery.smartmenus",
        smartmenus2: "../vendor/js/jquery.smartmenus.bootstrap",
        //underscore: "../vendor/js/underscore-1.8.3.min",
        //backbone: "../vendor/js/backbone.min",
        leaflet: "../vendor/js/leaflet-1.2.0.min"
    },
    shim: {
        //'underscore': {
        //    exports: '_'
        //},
        //'backbone': {
        //    deps: ['jquery', 'underscore'],
        //    exports: 'Backbone'
        //},
        "smartmenus2": {
            "deps": ['smartmenus']
        },
        "smartmenus": {
            "deps": ['jquery']
        },
        "bootstrap": {
            "deps": ["jquery"]
        },
        "handlebars": {
            exports: "Handlebars"
        }
    }
});

requirejs(['jquery', 'lodash', 'handlebars', 'leaflet', 'main',
        'bootstrap', 'smartmenus', 'smartmenus2'
    ],
    function ($, lo, handlebars, L, main) {
        owfdojo.addOnLoad(function () {
            $(document).ready(function () {
                window.Handlebars = handlebars;

                var widget = new main.WidgetObject();
                widget.initialize(main.XMLObject, main.KMLLayerObject);
            });
        });
    }
);