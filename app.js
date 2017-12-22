requirejs.config({
    urlArgs: "ver=" + (new Date()).getTime(),
    baseUrl: "widget",
    paths: {
        main: "main",
        jquery: "../vendor/js/jquery-3.2.1.min",
        lodash: "../vendor/js/lodash-4.17.4.min",
        handlebars: "../vendor/js/handlebars-4.0.11.min",
        bootstrap: "../vendor/js/bootstrap-3.3.7.min",
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
        "bootstrap": {
            "deps": ["jquery"]
        },
        "handlebars": {
            exports: "Handlebars"
        }
    }
});

requirejs(['jquery', 'lodash', 'handlebars', 'leaflet', 'main',
        'bootstrap'
    ],
    function ($, lo, handlebars, L, main) {
        owfdojo.addOnLoad(function () {
            $(document).ready(function () {
                window.Handlebars = handlebars;

                var widget = new main.WidgetObject();
                widget.initialize();
            });
        });
    }
);