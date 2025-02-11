//**********************
//   Add Search Widget
//**********************
function addFindPlace() {
    // Find a Place Widget ESRI default
    //define layers for boundaries
    require(["esri/layers/FeatureLayer","esri/widgets/Search","esri/geometry/Extent"],function(FeatureLayer,Search,Extent){
        var countyFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_FindAPlaceTool_Data/MapServer/1",
            popupTemplate: {
            // autocasts as new PopupTemplate()
            title: "{COUNTYNAME} County",
            overwriteActions: true
            }
        });
        var propertyFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/3"
        });
        // global variable used in myLayerList.js
        gmuFL = new FeatureLayer({
            url: settings.elkUrl //"https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/2"
        });
        var forestFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/5"
        });
        var wildernessFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/4"
        });

        searchWidget = new Search({
            view: view,
            includeDefaultSources: false, // include ESRI geocode service "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            searchAllEnabled: true, // if true has drop down list of sources includeing ESRI's
            popupEnabled: false,
            locationEnabled: false, // Adds option to go to current location
            resultGraphicEnabled: false, // Disable ESRI's graphic symbol, we will handle this below
            maxResults: 6,
            maxSuggestions: 50,
            suggestionsEnabled: true,
            minSuggestCharacters: 2,
            allPlaceholder: "Search",
            sources: [
            {
                layer: propertyFL,
                searchFields: ["PropName"],
                displayField: "PropName",
                exactMatch: false,
                maxSuggestions: 1000,
                outFields: ["PropName"],
                name: "CPW Properties (STL, SWA, SFU, or WWA)",
                placeholder: "Search CPW Properties"
            },
            {
                layer: gmuFL,
                searchFields: [settings.elkField],
                displayField: settings.elkField,
                exactMatch: false,
                maxResults: 6,
                maxSuggestions: 100,
                minSuggestCharacters: 1,
                outFields: [settings.elkField],
                name: "Big Game GMUs",
                placeholder: "Search GMUs"
            },
            {
                layer: forestFL,
                searchFields: ["MapName"],
                displayField: "MapName",
                exactMatch: false,
                outFields: ["MapName"],
                name: "Forests or Grasslands",
                placeholder: "Search Forests/Grasslands"
            },
            {
                layer: wildernessFL,
                searchFields: ["NAME"],
                displayField: "NAME",
                exactMatch: false,
                outFields: ["NAME"],
                name: "Wilderness",
                placeholder: "Search Wildernesses"
            },
            {
                layer: countyFL,
                searchFields: ["COUNTYNAME"],
                displayField: "COUNTYNAME",
                exactMatch: false,
                outFields: ["COUNTYNAME"],
                name: "Counties",
                placeholder: "Search Counties"
            },
            // Colorado Place GNIS
            {
                url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/GNIS_Loc/GeocodeServer",
                singleLineFieldName: "SingleLine",
                outFields: ["*"],
                name: "Colorado Places",
                placeholder: "Search Colorado Places"
            },
            // Address 
            {
                //limit search to Colorado
                filter: {
                    geometry: new Extent({
                        //-12350000 4250000 -11150000 5250000
                        xmax: -11359101, //-11150000,
                        xmin: -12140593, //-12350000,
                        ymax: 5012943, //5250000,
                        ymin: 443828, //4250000,
                        spatialReference: {
                            wkid: 102100
                        }
                    })
                },
                url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/",
                singleLineFieldName: "SingleLine",
                outFields: ["*"],
                name: "Address",
                placeholder: "Search Address"
            }
            ]
        });

        searchWidget.goToOverride = function (view, goToParams) {
            // Don't zoom in, we will handle it below
            return null;
        };

        searchWidget.on("search-complete", function (event) {
            // The results are stored in the event Object[]
            // Highlight and label the result for 10 seconds
            // Find which source layer matches name exactly or up to the comma. eg. Fort Collins, Larimer
            var index = 0;
            for (var i = 0; i < event.results.length; i++) {
            if (event.results[i].results.length == 0) continue;
            var name = event.results[i].results[0].name.toLowerCase();
            if (event.searchTerm.toLowerCase() === name.substring(0, name.indexOf(",")) ||
                event.searchTerm.toLowerCase() === name) {
                index = i;
                break;
            }
            }
            const obj = event.results[index];
            var newExtent = obj.results[0].extent;
            var pt;
            var fontsize = 11;
            for (i = 0; i < obj.results.length; i++) {
            if (obj.results[i].feature.geometry.type === "point") {
                require(["esri/geometry/Point"], function (Point) {
                    pt = new Point(obj.results[i].feature.geometry.x, obj.results[i].feature.geometry.y, obj.results[i].feature.geometry.spatialReference);
                    addTempPoint(pt, true);
                    if (labelFromURL) {
                        addTempLabel(pt, queryObj.get("label"), fontsize, true);
                        labelFromURL = false;
                    }
                    else addTempLabel(pt, obj.results[i].name, fontsize, true);
                });
            }
            else if (obj.results[i].feature.geometry.type === "polygon") {
                addTempPolygon(obj.results[i].feature, true);
                if (labelFromURL) {
                addTempLabel(obj.results[i].feature, queryObj.get("label"), fontsize, true);
                labelFromURL = false;
                }
                else if (obj.results[i].feature.sourceLayer.title.indexOf("GMU") > -1)
                addTempLabel(obj.results[i].feature, "GMU " + obj.results[i].name, fontsize, true); // label each GMU polygon
                else if (obj.results[i].feature.sourceLayer.title.indexOf("County") > -1) {
                var label = obj.results[i].name.toLowerCase();
                var ch = label.substring(0, 1).toUpperCase();
                label = ch + label.substring(1) + " County";
                addTempLabel(obj.results[i].feature, label, fontsize, true); // label each county polygon
                }
                else addTempLabel(obj.results[i].feature, obj.results[i].name, fontsize, true); // label each polygon
                var thisExtent = obj.results[i].feature.geometry.extent;
                // making a union of the polygon extents  
                newExtent = newExtent.union(thisExtent);
            }
            }
            this.clear();
            if (obj.results[0].feature.geometry.type === "point")
            view.goTo({
                target: pt,
                scale: 24000
            });
            else
            view.extent = newExtent;
        });
        
        
        // Center in title div
        searchWidget.when(()=>{
            // if identify is showing close it when click on search widget
            searchWidget.container.addEventListener("click", function(event) {
            view.closePopup();
            });

            // change filter icon from down arrow to filter
            searchWidget.container.children[0].querySelector(".esri-icon-down-arrow").className = "esri-icon-filter";
            // change tool tip for filter button
            searchWidget.container.children[0].querySelector(".esri-icon-filter").parentNode.title = "Filter search";
            // change tool tip of submit button
            //searchWidget.container.children[0].querySelector(".esri-icon-search").parentNode.title = "Submit search";
            // hide submit button (magnifying glass)
            searchWidget.container.children[0].querySelector(".esri-icon-search").parentNode.style.display = "none";
            // change tool tip for search input box
            searchWidget.container.children[0].querySelector("input").title = "Search for a Colorado place or address";
            searchWidget.container.children[0].querySelector("input").parentNode.parentNode.style.borderRadius  = "12px";
            searchWidget.container.children[0].querySelector("input").parentNode.parentNode.style.paddingRight  = "12px";

            if (screen.width > 768) {
                searchWidget.container.style.left = "85px";
                searchWidget.container.style.position = "relative";
                searchWidget.container.style.top = "-2px";
                searchWidget.container.style.width = "195px";
            }
            else {
                searchWidget.container.style.left = "30px";
                searchWidget.container.style.marginRight = "30px";
                searchWidget.container.style.marginLeft = "7px";
                searchWidget.container.style.width = "195px";
            }
        });
        // Adds the search widget below other elements in
        // the top left corner of the view
        view.ui.add(searchWidget, {
            position: "top-left",
            index: 2
        });

        // Home button
        require(["esri/widgets/Home"], (Home) => { 
            let homeWidget = new Home({
                view: view
            });
            homeWidget.when(() =>{
                if (screen.width > 768) {
                    homeWidget.container.style.position = "relative";
                    homeWidget.container.style.left = "285px";
                    homeWidget.container.style.top = "-52px";
                }else {
                    homeWidget.container.style.position = "relative";
                    homeWidget.container.style.left = "209px";
                    homeWidget.container.style.top = "-51px";
                }
            });
            
            // adds the home widget to the top left corner of the MapView
            view.ui.add(homeWidget, "top-left");
        });
    });
}