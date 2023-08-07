let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let stamenTerrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
    attribution: '&copy; <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    ext: 'png'
});

var earthquakeLayer = L.layerGroup();
var tectonicPlatesLayer = L.layerGroup();

var mapLayer = L.layerGroup()
var map = L.map("map", {
    center: [39.05, 0],
    zoom: 3,
    layers: [streetmap, mapLayer]
});

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(data) {

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: .5
        };
    }


    function getColor(magnitude) {
        switch (true) {
            case magnitude > 5:
                return "#ea2c2c";
            case magnitude > 4:
                return "#ea822c";
            case magnitude > 3:
                return "#ee9c00";
            case magnitude > 2:
                return "#eecc00";
            case magnitude > 1:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }

    var baseMaps = {
        "Street Map": streetmap,
        "Satellite": satellite,
        "Terrain": stamenTerrain
        };

    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },

        style: styleInfo,
        onEachFeature: function(feature, layer) {
            var depth = feature.geometry.coordinates[2];
            layer.bindPopup("Magnitude: " + feature.properties.mag + 
                            "<br>Location: " + feature.properties.place +
                            "<br>Depth: " + depth + " km");
        }
    }).addTo(earthquakeLayer);

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(platesData) {
    L.geoJson(platesData, {
        color: "#ff7800",
        weight: 2
    }).addTo(tectonicPlatesLayer);
    });

    var overlayMaps = {
        "Earthquakes": earthquakeLayer,
        "Tectonic Plates": tectonicPlatesLayer
    };

    earthquakeLayer.addTo(map);
    tectonicPlatesLayer.addTo(map);

    L.control.layers(baseMaps, overlayMaps).addTo(map);
});
