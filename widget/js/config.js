var gConfigObject = {
    widgetVersion: "v1.0.b5@20171110",
    license: "MIT",
    preferenceServiceUrl: "https://localhost:7443/PreferenceService/rest/preferences",
    map: {
        events: {
            mousemove: false
        },
        basemaps: {
            ESRI: {
                ESRI_Streets: [
                    'ESRI Streets',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                ],
                ESRI_Topographic: [
                    'ESRI Topographic',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                ],
                ESRI_Oceans: [
                    'ESRI Oceans',
                    'https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                ],
                ESRI_OceansRef: [
                    'ESRI Oceans Reference',
                    'https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri'
                ],
                ESRI_NationalGeographic: [
                    'ESRI National Geographic',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: National Geographic, DeLorme, HERE, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, increment P Corp.'
                ],
                ESRI_DarkGray: [
                    'ESRI Dark Gray',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                    '&copy; OpenStreetMap contributors &mdash; Source: ESRI, HERE, DeLorme, MapmyIndia'
                ],
                ESRI_DarkGrayRef: [
                    'ESRI Dark Gray Reference',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
                    '&copy; OpenStreetMap contributors &mdash; Source: ESRI, HERE, DeLorme, MapmyIndia'
                ],
                ESRI_Gray: [
                    'ESRI Gray',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                    '&copy; OpenStreetMap contributors &mdash; Source: ESRI, HERE, DeLorme, MapmyIndia'
                ],
                ESRI_GrayRef: [
                    'ERSI Gray Reference',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
                    '&copy; OpenStreetMap contributors &mdash; Source: ESRI, HERE, DeLorme, MapmyIndia'
                ],
                ESRI_Imagery: [
                    'ESRI Imagery',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'
                ],
                ESRI_ImageryRef: [
                    'ESRI Imagery Reference',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'
                ],
                ESRI_ImageryTransportation: [
                    'ESRI Imagery Transportation',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community'
                ],
                ESRI_ShadedRelief: [
                    'ESRI Shaded Relief',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS'
                ],
                ESRI_ShadedReliefRef: [
                    'ESRI Shaded Relief Reference',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS'
                ],
                ESRI_Terrain: [
                    'ESRI Terrain',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                ],
                ESRI_TerrainRef: [
                    'ESRI Terrain Reference',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                ],
                ESRI_USATopo: [
                    'ESRI USA Topographic',
                    'https://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}',
                    '&copy; Esri &mdash; Source: Esri, USGS, National Geographic Society, i-cubed'
                ]
            },
            OSM: {
                OSM_Mapnik: [
                    'OSM Mapnik',
                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    '&copy; OpenStreetMap &mdash; Source: OSM'
                ],
                OSM_MapnikBW: [
                    'OSM BW Mapnik',
                    'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                    '&copy; OpenStreetMap &mdash; Source: OSM'
                ],
                OSM_TopoMap: [
                    'Open Topo Map',
                    'https://tile.opentopomap.org/{z}/{x}/{y}.png',
                    '&copy; OpenStreetMap &mdash; Source: OSM; Contributors: SRTM; Style: (CC-BY-SA)'
                ]
            }
        }
    }
}

// 20171105 - added peferenceService url