//**********************
//   Add Search Widget
//**********************
function addSearch() {
    // Find a Place Widget ESRI default
    //define layers for boundaries
    require(["esri/layers/FeatureLayer","esri/widgets/Search","esri/geometry/Extent","esri/geometry/Point","esri/geometry/SpatialReference"],
        function(FeatureLayer,Search,Extent,Point,SpatialReference){
        var sources = [];
        
        var propertyFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/3"
        });
        sources.push({
            layer: propertyFL,
            searchFields: ["PropName"],
            displayField: "PropName",
            //exactMatch: false,
            //maxSuggestions: 1000,
            //outFields: ["PropName"],
            name: "CPW Properties (STL, SWA, SFU, or WWA)",
            placeholder: "Search CPW Properties"
        });
        // global variable used in myLayerList.js
        if (settings.elkUrl){
            gmuFL = new FeatureLayer({
                url: settings.elkUrl //"https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/2"
            });
            sources.push( {
                layer: gmuFL,
                searchFields: [settings.elkField],
                displayField: settings.elkField,
                //exactMatch: false,
                //maxResults: 6,
                //maxSuggestions: 100,
                minSuggestCharacters: 1,
                //outFields: [settings.elkField],
                name: "Big Game GMUs",
                placeholder: "Search GMUs"
            });
        }
        /*var forestFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/5"
        });
        sources.push({
            layer: forestFL,
            searchFields: ["MapName"],
            displayField: "MapName",
            exactMatch: false,
            outFields: ["MapName"],
            name: "Forests or Grasslands",
            placeholder: "Search Forests/Grasslands"
        });
        var wildernessFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/4"
        });
        sources.push({
            layer: wildernessFL,
            searchFields: ["NAME"],
            displayField: "NAME",
            exactMatch: false,
            outFields: ["NAME"],
            name: "Wilderness",
            placeholder: "Search Wildernesses"
        });*/
        // County
        /*var countyFL = new FeatureLayer({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_FindAPlaceTool_Data/MapServer/1",
            popupTemplate: {
            // autocasts as new PopupTemplate()
            title: "{COUNTYNAME} County",
            overwriteActions: true
            }
        });
        sources.push({
            layer: countyFL,
            searchFields: ["COUNTYNAME"],
            displayField: "COUNTYNAME",
            exactMatch: false,
            outFields: ["COUNTYNAME"],
            name: "Counties",
            placeholder: "Search Counties"
        });*/
         // Colorado Place GNIS
        sources.push({
            url: "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/GNIS_Loc/GeocodeServer",
            singleLineFieldName: "SingleLine",
            outFields: ["*"],
            name: "Colorado Places",
            placeholder: "Search Colorado Places"
        });
        // Address
        sources.push({
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
            sources:sources
        });

        searchWidget.goToOverride = function (view, goToParams) {
            // Don't zoom in, we will handle it below
            return null;
        };

        searchWidget.on("search-complete", function (event) {
            // The results are stored in the event Object[]
            // Highlight and label the result for 10 seconds
            
            // Zoom to point
            const regexp = /^-?\d*\.?\d*, *-?\d*\.?\d*$/;
            if (event.searchTerm.match(regexp)){
                const xy = event.searchTerm.split(",");
                var pt;
                // if decimal degrees Latitude, Longitude
                var lat, long;
                if (((xy[1] >= -110 && xy[1] <= -100) || (xy[1] >= 100 && xy[1] <= 110)) && (xy[0] >= 35 && xy[0] <= 42)) {
                    if (xy[1] > 0) xy[1] = -1 * xy[1];
                    pt = new Point(xy[1],xy[0]);
                }
                else if (((xy[0] >= -110 && xy[0] <= -100) || (xy[0] >= 100 && xy[0] <= 110)) && (xy[1] >= 35 && xy[1] <= 42)) {
                    if (xy[0] > 0) xy[0] = -1 * xy[0];
                    pt = new Point(xy[0],xy[1]);
                }
                else if ((xy[0] < 770000 && xy[0] > 130000) && (xy[1] > 4100000 && xy[1] < 4600000)) {
                    pt = new Point(xy[0],xy[1],new SpatialReference({wkid:32613}));
                }
                else if ((xy[1] < 770000 && xy[1] > 130000) && (xy[0] > 4100000 && xy[0] < 4600000)) {
                    pt = new Point(xy[1],xy[0],new SpatialReference({wkid:32613}));
                }
                document.getElementsByClassName("esri-search__warning-menu")[0].style.visibility="hidden";
                this.clear();
                if (pt){
                    addTempPoint(pt, true);
                    view.goTo({
                        target: pt,
                        scale: 100000
                    });
                } else alert("Point is not in know projection. Must be lat, long decimal degrees or WSG84 UTM Zone 13.");
                return;
            }

            // zoom to place or address
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
                    break;
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
                scale: 100000
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
                searchWidget.container.style.top = "-20px";
                searchWidget.container.style.width = "195px";
            }
            else {
                searchWidget.container.style.left = "30px";
                searchWidget.container.style.marginRight = "30px";
                searchWidget.container.style.marginLeft = "7px";
                searchWidget.container.style.top = "-20px";
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
        // esri/widgets/Home is deprecated!!!
        let homeWidget = document.createElement("button");
        homeWidget.setAttribute("aria-busy","false");
        homeWidget.setAttribute("aria-label","Home");
        homeWidget.setAttribute("aria-live","polite");
        homeWidget.className="esri-widget--button";
        homeWidget.style.border="1px solid #6e6e6e77";
        homeWidget.type="button";
        if (screen.width > 768) {
            homeWidget.style.position = "absolute";
            homeWidget.style.left = "285px";
            homeWidget.style.top = "38px";//-52px";
        }else {
            homeWidget.style.position = "absolute";
            homeWidget.style.left = "209px";
            homeWidget.style.top = "39px";//-51px";
        }
        let homeIcon = document.createElement("calcite-icon");
        homeIcon.className="icon,icon--start";
        homeIcon.setAttribute("aria-hidden","true");
        homeIcon.scale="s";
        homeIcon.icon="home";
        homeWidget.appendChild(homeIcon);
        homeWidget.addEventListener("click",function(){
            view.goTo(fullExtent);
        });
        view.ui.add(homeWidget, "top-left");
        
        /*require(["esri/widgets/Home"], (Home) => { 
            let homeWidget = new Home({
                view: view
            });
            homeWidget.when(() =>{
                if (screen.width > 768) {
                    homeWidget.container.style.position = "absolute";
                    homeWidget.container.style.left = "285px";
                    homeWidget.container.style.top = "38px";//-52px";
                }else {
                    homeWidget.container.style.position = "absolute";
                    homeWidget.container.style.left = "209px";
                    homeWidget.container.style.top = "39px";//-51px";
                }
            });
            
            // adds the home widget to the top left corner of the MapView
            view.ui.add(homeWidget, "top-left");
        });*/

        // Add Help Widget
        view.ui.add(helpWidget, "top-left");
    });
}