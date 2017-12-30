// function to convert kml coords to leaflet coords
var kml2lfCoords = function (coords) {
    var cArray = coords.split(",");

    return [cArray[1], cArray[0]];
}

// function to convert kml line coords to leaflet coords
var kml2lfLineCoords = function (coords) {
    var cArray = coords.split(" ");
    var coordsArray = [];

    $.each(cArray, function (index, item) {
        if (item.trim().length > 0) {
            coordsArray.push(kml2lfCoords(item));
        }
    });

    return coordsArray;
}

// function to return color from kml 8-digit codes
var kml2lfColor = function (color) {
    if (color.startsWith("#")) {
        return color;
    } else
    if (color.length <= 6) {
        return "#" + color;
    } else {
        return "#" + color.substring(2);
    }
}
