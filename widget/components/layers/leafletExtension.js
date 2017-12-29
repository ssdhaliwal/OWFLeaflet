// extension for leaflet components to support passing properties
var marker2 = L.Marker.extend({
    options: {
        iconNormal: L.icon({
            iconUrl: '',
            iconSize: [38, 95],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
            shadowUrl: '',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        }),
        iconHighlight: L.icon({
            iconUrl: '',
            iconSize: [38, 95],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
            shadowUrl: '',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        })
    }
});