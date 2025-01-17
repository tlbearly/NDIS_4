
        // TEST reading data from database
        /*layer = new FeatureLayer({
              portalItem: { // autocasts as esri/portal/PortalItem
                id: "02513fefd87149b4b09b5df4dcd6f5ec" //
              } 
            }),
            // Test identify from database looking up ancestry data from a table joined to the map service
            new FeatureLayer({
              url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/AGP/Census/MapServer",
              title: "United States Population",
              visible: false,
              popupTemplate: {
                title: "{states.STATE_NAME}",
                content: "{expression/per_ancestry}% of the {states.POP2007} people in {states.STATE_NAME} have "
                  + "Norwegian ancestry.",
                expressionInfos: [{
                  name: "per_ancestry",
                  expression: "Round( ( $feature['ancestry.norwegian'] / $feature['states.POP2007'] ) * 100, 1)"
                }],
                fieldInfos: [{
                  fieldName: "states.POP2007",
                  format: {
                    digitSeparator: true,
                    places: 0
                  }
                }]
              },
              dynamicDataSource: {
                type: "data-layer",
                dataSource: {
                  type: "join-table",
                  leftTableSource: {
                    type: "map-layer",
                    mapLayerId: 3
                  },
                  rightTableSource: {
                    type: "data-layer",
                    dataSource: {
                      type: "table",
                      workspaceId: "CensusFileGDBWorkspaceID",
                      dataSourceName: "ancestry"
                    }
                  },
                  leftTableKey: "STATE_NAME",
                  rightTableKey: "State",
                  joinType: "left-outer-join"
                }
              }
            }),*/




        // Hunter Reference
        // TileLayer sublayers are read only except for legendEnabled, popupEnabled, popupTemplate, and title. Error incompatible with basemap spatial reference
        /*var layer = new MapImageLayer({
          title: "Hunter Reference", // must be named Hunter Reference
          url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_Base_Map/MapServer"
        });
        layer.when((event) => {
          for (var i = 0; i < event.sublayers.items.length; i++) {
            if (event.sublayers.items[i].title.indexOf("Land Management") > -1) {
              event.sublayers.items[i].popupTemplate = {
                title: "Land Management",
                content: "{NAME}<br>{MANAGER}"
              };
              event.sublayers.items[i].opacity = 0.4;
            }
          }

          console.log("Hunter Reference loaded");
        });
        mapLayers.push(layer);



        layer = new MapImageLayer({
          title: "Hunter Reference2", // must be named Hunter Reference
          url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_Base_Map/MapServer",
          sublayers: [
            {
              title: "Land Management (COMaP v20240702)",
              id: 103,
              popupTemplate: {
                title: "Land Management",
                content: "{NAME}<br>{MANAGER}"
              }
            },
            {
              title: "Township Range Sections",
              id: 97,
              visible: false,
              listMode: "show",
              legendEnabled: true,
              sublayers: [
                {
                  title: "Township Range boundary",
                  id: 99,
                  listMode: "hide",
                  legendEnabled: true,
                  visible: true
                },
                {
                  title: "Section boundary",
                  id: 98,
                  listMode: "hide",
                  legendEnabled: true,
                  visible: true
                }
              ]
            },
            {
              title: "Continental Divide",
              id: 96,
              listMode: "hide",
              legendEnabled: true,
              minScale: 250000
            },
            {
              title: "License Agent",
              id: 2,
              listMode: "show", // visible in TOC? show|hide|hide-children
              legendEnabled: true, // visible in legend? true|false
              popupTemplate: {
                title: "{License Agent}",
                content: "{Name}<br>{Manager}<br>{Address}<br>{City}<br>{Phone}"
              }
            },
            {
              title: "CPW Public Access Properties",
              id: 102,
              listMode: "show", // visible in TOC? show|hide|hide-children
              legendEnabled: true, // visible in legend? true|false
              popupTemplate: {
                title: "CPW Public Access Properties",
                content: "Name: {PropName}<br>Property type: {PropType}"
              }
            }
          ]
        });
        mapLayers.push(layer);

        // Game Species
        layer = new MapImageLayer({
          title: "Game Species",
          url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_BigGame_Map/MapServer",
          visible: false
        });
        layer.when((event) => {
          console.log("Game Species loaded");
        });
        mapLayers.push(layer);

        // BLM Roads and Trails
        layer = new MapImageLayer({
          title: "BLM Roads and Trails",
          url: "https://gis.blm.gov/coarcgis/rest/services/transportation/BLM_CO_GTLF/MapServer",
          visible: false
        });
        mapLayers.push(layer);

        // MVUM Roads and Trails
        layer = new MapImageLayer({
          title: "MVUM",
          url: "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_02/MapServer",
          visible: true,
          sublayers: [
            {
              id: 2,
              title: "Trails",
              visible: true,
              minScale: 250000,
              popupTemplate: {
                title: "{NAME}",
                content: "{NAME}<br>Segment length: {expression/seg-length} mi.<br>{JURISDICTION}<br>Seasonal: {SEASONAL}",
                // format segment length to one decimal place
                expressionInfos: [{
                  name: "seg-length",
                  expression: "Round($feature.SEG_LENGTH , 1)"
                }]
              }
            },
            {
              id: 1,
              title: "Roads",
              visible: true,
              minScale: 250000,
              popupTemplate: {
                title: "{NAME}",
                content: "Segment length: {expression/seg-length} mi.<br>{JURISDICTION}<br>Seasonal: {SEASONAL}" +
                  "Passenger vehicle: {PASSENGERVEHICLE}",
                // format segment length to one decimal place
                expressionInfos: [{
                  name: "seg-length",
                  expression: "Round($feature.SEG_LENGTH , 1)"
                }]
              }
            }
          ]
        });
        mapLayers.push(layer);

        // wildfire
        layer = new FeatureLayer({
          title: "Wildfire points",
          url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0",
          visible: true
        });
        mapLayers.push(layer);
        layer = new FeatureLayer({
          title: "Wildfire perimeter",
          url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/1",
          visible: true
        });
        mapLayers.push(layer);

        /* new GroupLayer({
          title: "Game Species",
          id: "Game Species",
          visible: false,
          opacity: 0.7,
          visibilityMode: "exclusive", // radio buttons
          layers: [
            new GroupLayer({
              title: "Mountain Goat",
              visible: false,
              layers: []
            }),
            new GroupLayer({
              title: "Elk",
              visible: true,
              layers: [
              new FeatureLayer({
                  title: "Overall Range",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/44",
                  visible: false,
                  legendEnabled: true,
                  popupTemplate: {
                    title: "Elk",
                    content: "Elk overall range. Last updated: {EDIT_DATE}"
                  }
                }),
                new FeatureLayer({
                  title: "Resident Population Area",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/39",
                  visible: true,
                  legendEnabled: true,
                  popupTemplate: {
                    title: "Elk",
                    content: "Elk resident population area. Last updated: {EDIT_DATE}"
                  }
                }),
                new FeatureLayer({
                  title: "Summer Range",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/36",
                  visible: true,
                  legendEnabled: true,
                  popupTemplate: {
                    title: "Elk",
                    content: "Elk summer range. Last updated: {EDIT_DATE}"
                  }
                }),
                new FeatureLayer({
                  title: "Summer Concentration Area",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/35",
                  visible: false,
                  legendEnabled: true
                }),
                new FeatureLayer({
                  title: "Winter Range",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/43",
                  visible: true,
                  legendEnabled: true
                }),
                new FeatureLayer({
                  title: "Winter Concentration Area",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/42",
                  visible: true,
                  legendEnabled: true
                }),
                new FeatureLayer({
                  title: "Migration Corridors",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/40",
                  visible: true,
                  legendEnabled: true
                }),
                new FeatureLayer({
                  title: "Migration Patterns",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/33",
                  visible: false,
                  legendEnabled: true
                })
              ]
            }),
            new GroupLayer({
              title: "Bighorn", // Must be named Bighorn
              visible: false,
              layers: [
                new FeatureLayer({
                  title: "Migration Patterns",
                  url:"https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/8",
                  visible: false,
                  legendEnabled: true
                }),
                new FeatureLayer({
                  title: "Migration Corridors",
                  url: "https://services5.arcgis.com/ttNGmDvKQA7oeDQ3/ArcGIS/rest/services/CPWSpeciesData/FeatureServer/9",
                  visible: true,
                  legendEnabled: true
                })
              //layerIds="8,9,15-17,10,11,18"
              //layerVis="false,true,true,true,true,false,true,false"                     
              ]
            })
          ]
        })*/


        // Hunter Reference
        /*let layer = 
        layer.popupTemplate = {
          expressionInfos: [{
            name: "participation-rate",
            title: "% of population 16+ participating in the labor force",
            expression: "Round(($feature.CIVLBFR_CY / $feature.POP_16UP)*100,2)"
          }],
          content: "In {NAME} county, {expression/participation-rate}% of the population"
            + " participates in the labor force."
        };*/