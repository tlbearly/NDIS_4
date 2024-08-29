//***********
// Identify
//***********
var identifyParams = null;
var identify = null;
var tasks;
var clickPoint;
var features = []; // number of features found
var numDatabaseCalls = 0;
var processedDatabaseCalls = 0;
var folder = [];
var identifyGroup;
var theEvt;
var identifyGroups = [];
var identifyLayers = {};
var groupContent = {}; // Cache the infoWindow content for each group for a map click
var identifyLayerIds = []; // handles the identify tasks for each group. [GroupName][{url, layerIds, geometryType}]
var show_elevation = false;
var elevation_url = null;
var driving_directions = false;
var tooManyRequests = false;
var firstClick = false; // 4-1-22
var secondClick = false; // 4-1-22
var lastIdentifyTime=0; // 4-1-22
require(["esri/rest/support/IdentifyParameters", "esri/rest/identify", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/PictureMarkerSymbol",
    "dojo/_base/Color"
], function(IdentifyParameters, Identify, SimpleLineSymbol, SimpleFillSymbol, PictureMarkerSymbol, Color) {
    //setup generic identify parameters
    identifyParams = new IdentifyParameters();
    identifyParams.returnGeometry = true;
    identifyParams.layerOption = "all"; // top, visible, all, popup
   
    identify = Identify;

    // Set up symbols for highlight on mouse over
    /*polySymbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0]), 1
        ),
        new Color([125, 125, 125, 0.35])
    );
    pointSymbol = new PictureMarkerSymbol("assets/images/i_flag.png", 40, 40);
    lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 10]), 1);*/
});

function readSettingsWidget() {
    // Read the SettingsWidget.xml file
    var xmlhttp = createXMLhttpRequest();
    var settingsFile = app + "/SettingsWidget.xml?v=" + ndisVer;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                require(["dojo/dom", "dijit/registry", "dojo/query", "dojo/dom-construct", "dojo/on"], function(dom, registry, query, domConstruct, on) {
                    //var xmlDoc=xmlhttp.responseXML;
                    var xmlDoc = createXMLdoc(xmlhttp);

                    //---------------
                    // Read Globals
                    //---------------
                    // Load user saved XY projection
                    var myPrj = getCookie("prj");
                    if (myPrj !== "")
                        settings = { "XYProjection": myPrj };
                    else
                        settings = { "XYProjection": xmlDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue };
                    //registry.byId("settings_xycoords_combo").set("value", settings.XYProjection); // Settings Widget
                    document.getElementById("settings_xycoords_combo").value = settings.XYProjection; // Settings Widget
                    //registry.byId("help_xy_proj").set("value", settings.XYProjection); // Find a Place Help				

                    use_map_link = xmlDoc.getElementsByTagName("use_map_link")[0] && xmlDoc.getElementsByTagName("use_map_link")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (use_map_link) {
                        document.getElementById("mapLinkBtn").style.display = "block";
                    }
                    use_get_extent = xmlDoc.getElementsByTagName("use_get_extent") && xmlDoc.getElementsByTagName("use_get_extent")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (use_get_extent) document.getElementById("showExtentBtn").style.display = "block";

                    var use_gmus = xmlDoc.getElementsByTagName("use_gmus")[0] && xmlDoc.getElementsByTagName("use_gmus")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (use_gmus) {
                        settings.useGMUs = true;
                        if (!xmlDoc.getElementsByTagName("gmu_url")[0])
                            alert("Missing tag: gmu_url in " + app + "/SettingsWidget.xml", "Data Error");
                        else
                            settings.elkUrl = xmlDoc.getElementsByTagName("gmu_url")[0].childNodes[0].nodeValue;
                        if (!xmlDoc.getElementsByTagName("gmu_field")[0])
                            alert("Missing tag: gmu_field in " + app + "/SettingsWidget.xml", "Data Error");
                        else
                            settings.elkField = xmlDoc.getElementsByTagName("gmu_field")[0].childNodes[0].nodeValue;
                        if (!xmlDoc.getElementsByTagName("sheep_gmu_url")[0])
                            alert("Missing tag: sheep_gmu_url in " + app + "/SettingsWidget.xml", "Data Error");
                        else
                            settings.sheepUrl = xmlDoc.getElementsByTagName("sheep_gmu_url")[0].childNodes[0].nodeValue;
                        if (!xmlDoc.getElementsByTagName("sheep_gmu_field")[0])
                            alert("Missing tag: sheep_gmu_field in " + app + "/SettingsWidget.xml", "Data Error");
                        else
                            settings.sheepField = xmlDoc.getElementsByTagName("sheep_gmu_field")[0].childNodes[0].nodeValue;
                        if (!xmlDoc.getElementsByTagName("goat_gmu_url")[0])
                            alert("Missing tag: goat_gmu_url in " + app + "/SettingsWidget.xml", "Data Error");
                        else
                            settings.goatUrl = xmlDoc.getElementsByTagName("goat_gmu_url")[0].childNodes[0].nodeValue;
                        if (!xmlDoc.getElementsByTagName("goat_gmu_field")[0])
                            alert("Missing tag: goat_gmu_field in " + app + "/SettingsWidget.xml", "Data Error");
                        else
                            settings.goatField = xmlDoc.getElementsByTagName("goat_gmu_field")[0].childNodes[0].nodeValue;
                        if (gmu == "Big Game GMU")
                            showGMUCombo(settings.elkUrl, settings.elkField);
                        else if (gmu == "Bighorn GMU")
                            showGMUCombo(settings.sheepUrl, settings.sheepField);
                        else if (gmu == "Goat GMU")
                            showGMUCombo(settings.goatUrl, settings.goatField);
                    } else {
                        settings.useGMUs = false;
                    }
                    driving_directions = xmlDoc.getElementsByTagName("driving_directions")[0] && xmlDoc.getElementsByTagName("driving_directions")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    /*if (driving_directions) {
                        // Add a link into the InfoWindow Actions panel
                        // Get Directions
                        view.popup.actions = [
                            {
                                id: "directions",
                                className: "esri-icon-directions2",
                                title: "Get Directions"
                            }
                        ];
                    }*/
                    if (xmlDoc.getElementsByTagName("elevation")[0] && xmlDoc.getElementsByTagName("elevation")[0].firstChild.nodeValue)
                        show_elevation = xmlDoc.getElementsByTagName("elevation")[0].firstChild.nodeValue == "true" ? 1 : 0;
                    if (show_elevation && xmlDoc.getElementsByTagName("elevation_url")[0]) {
                        if (xmlDoc.getElementsByTagName("elevation_url")[0].firstChild.nodeValue)
                            elevation_url = xmlDoc.getElementsByTagName("elevation_url")[0].firstChild.nodeValue;
                        else alert("Missing elevation_url tag in SettingsWidget.xml.", "Data Error");
                    /*    view.popup.actions.push( 
                            {
                                id: "elevation",
                                className: "esri-icon-elevation",
                                title: "Elevation: loading..."
                            }
                        );*/
                    }
                    // Read the Identify Groups from the folder tags
                    folder = xmlDoc.getElementsByTagName("folder");
                    for (var f = 0; f < folder.length; f++) {
                        // Set default identifyGroup to first in the list
                        if (f == 0) identifyGroup = folder[f].getAttribute("label");
                        identifyGroups.push(folder[f].getAttribute("label"));
                        // Initialize array for layer urls, layerIds, and geometry for identify task
                        identifyLayerIds[identifyGroups[f]] = [];

                        // Read the layer tags for each group
                        var layer = folder[f].getElementsByTagName("layer");
                        identifyLayers[identifyGroups[f]] = {};
                        // Description
                        if (folder[f].getElementsByTagName("desc")[0])
                            identifyLayers[identifyGroups[f]].desc = folder[f].getElementsByTagName("desc")[0].firstChild.nodeValue;
                        // Layers
                        var label = "missing label";
                        for (var i = 0; i < layer.length; i++) {
                            if (!layer[i].getAttribute("label"))
                                alert("Error in " + app + "/SettingsWidget.xml. Missing label in folder: " + identifyGroups[f] + ".", "Data Error");
                            else
                                label = layer[i].getAttribute("label");

                            // Make sure vis_url and vis_id are set if id_vis_only is true
                            if (folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true") {
                                if (!layer[i].getElementsByTagName("vis_url")[0] || !layer[i].getElementsByTagName("vis_id")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. When vis_id_only is set in a folder, every layer in the folder must have a vis_id and vis_url tag for the layer that is in the map to check if it is visible or not. Missing vis_url and vis_id tags in folder: " + identifyGroups[f] + ".", "Data Error");
                            }
                            identifyLayers[identifyGroups[f]][label] = {};

                            // Create list of ids for this layer
                            var found = false;
                            if (!layer[i].getElementsByTagName("url")[0] || !layer[i].getElementsByTagName("id")[0])
                                alert("Error in " + app + "/SettingsWidget.xml. Missing url or id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                            else {
                                for (var j = 0; j < identifyLayerIds[identifyGroups[f]].length; j++) {
                                    // Identify only visible layers. Each layer in this folder in SettingsWidget.xml must have a vis_id and vis_url tags
                                    if ((folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true") &&
                                        identifyLayerIds[identifyGroups[f]][j].url == layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].vis_url == layer[i].getElementsByTagName("vis_url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].geometry == layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase()) {
                                            identifyLayerIds[identifyGroups[f]][j].ids.push(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].vis_ids.push(layer[i].getElementsByTagName("vis_id")[0].childNodes[0].nodeValue);
                                            found = true;
                                    } else if (identifyLayerIds[identifyGroups[f]][j].url == layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].geometry == layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase()) {
                                            identifyLayerIds[identifyGroups[f]][j].ids.push(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue);
                                            found = true;
                                    }
                                }
                            }
                            if (!found) {
                                // url was not found in list, add it
                                if (!layer[i].getElementsByTagName("url")[0] || !layer[i].getElementsByTagName("id")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing url or id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else {
                                    // Add id_vis_only for layer identify option LAYER_OPTION_ALL or LAYER_OPTION_VISIBLE at the folder level 1-9-18
                                    var vis_url = null,
                                        vis_ids = [];
                                    if (folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true") {
                                        vis_url = layer[i].getElementsByTagName("vis_url")[0].childNodes[0].nodeValue;
                                        vis_ids.push(layer[i].getElementsByTagName("vis_id")[0].childNodes[0].nodeValue);
                                    }
                                    identifyLayerIds[identifyGroups[f]].push({
                                        url: layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue,
                                        ids: new Array(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue),
                                        geometry: layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase(),
                                        id_vis_only: folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true" ? true : false,
                                        vis_url: vis_url,
                                        vis_ids: vis_ids
                                    });
                                }
                            }

                            // Add a layer that has a database call
                            if (layer[i].getElementsByTagName("database")[0]) {
                                if (!layer[i].getElementsByTagName("url")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing url in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].url = layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("id")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].id = layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("geometry")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing geometry in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].geometry = layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("fields")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing fields in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].fields = layer[i].getElementsByTagName("fields")[0].childNodes[0].nodeValue.split(",");
                                if (!layer[i].getElementsByTagName("displaynames")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing displaynames in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].displaynames = layer[i].getElementsByTagName("displaynames")[0].childNodes[0].nodeValue.split(",");
                                if (layer[i].getElementsByTagName("position")[0])
                                    identifyLayers[identifyGroups[f]][label].position = layer[i].getElementsByTagName("position")[0].childNodes[0].nodeValue;
                                else
                                    identifyLayers[identifyGroups[f]][label].position = 0;
                                if (!layer[i].getElementsByTagName("database")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing database in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].database = layer[i].getElementsByTagName("database")[0].childNodes[0].nodeValue;

                                if (!layer[i].getElementsByTagName("filename")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing filename in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].filename = layer[i].getElementsByTagName("filename")[0].childNodes[0].nodeValue;
                                if (layer[i].getElementsByTagName("one2one_fields")[0] && layer[i].getElementsByTagName("one2one_fields")[0].childNodes.length > 0)
                                    identifyLayers[identifyGroups[f]][label].one2one_fields = layer[i].getElementsByTagName("one2one_fields")[0].childNodes[0].nodeValue.split(",");
                                if (layer[i].getElementsByTagName("one2one_display")[0] && layer[i].getElementsByTagName("one2one_display")[0].childNodes.length > 0)
                                    identifyLayers[identifyGroups[f]][label].one2one_display = layer[i].getElementsByTagName("one2one_display")[0].childNodes[0].nodeValue.split(",");
                                if (layer[i].getElementsByTagName("one2many_fields")[0] && layer[i].getElementsByTagName("one2many_fields")[0].childNodes.length > 0)
                                    identifyLayers[identifyGroups[f]][label].one2many_fields = layer[i].getElementsByTagName("one2many_fields")[0].childNodes[0].nodeValue.split(",");
                            }
                            // Add layer without database call
                            else {
                                if (!layer[i].getElementsByTagName("url")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing url in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].url = layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("id")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].id = layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("geometry")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing geometry in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].geometry = layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("fields")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing fields in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].fields = layer[i].getElementsByTagName("fields")[0].childNodes[0].nodeValue.split(",");
                                if (!layer[i].getElementsByTagName("displaynames")[0])
                                    alert("Error in " + app + "/SettingsWidget.xml. Missing displaynames in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].displaynames = layer[i].getElementsByTagName("displaynames")[0].childNodes[0].nodeValue.split(",");

                                // Add ability to identify sheep and goat GMUs. 4-18-18 change label to Big Game GMU Boundaries for use with AssetReport_Data mapservice
	                              if (label == "Big Game GMU Boundaries") {
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"] = {};
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].url = settings.sheepUrl.slice(0, settings.sheepUrl.length - 2);
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].id = settings.sheepUrl.slice(settings.sheepUrl.length - 1);
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].geometry = "polygon";
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].fields = [settings.sheepField];
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].displaynames = ["GMU Number"];
                                    identifyLayers[identifyGroups[f]]["Goat GMU"] = {};
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].url = settings.goatUrl.slice(0, settings.goatUrl.length - 2);
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].id = settings.goatUrl.slice(settings.goatUrl.length - 1);
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].geometry = "polygon";
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].fields = [settings.goatField];
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].displaynames = ["GMU Number"];
                                }
                            }
                        }
                    }
                    // Call draw init here since it needs the XYprojection value which was read from user cookie or settingsWidget.xml
 // TODO drawing widget
 //                 drawInit();
                });
            } catch (e) {
                alert("Error reading " + app + "/SettingsWidget.xml in javascript/identify.js readSettingsWidget(): " + e.message, "Data Error", e);
                hideLoading("");
            }
        }
        // if missing file
        else if (xmlhttp.status === 404) {
            alert("Error: Missing " + app + "/settingsWidget.xml file.", "Data Error");
            hideLoading();
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 500) {
            alert("Error reading " + app + "/settingsWidget.xml.", "Code Error");
            hideLoading();
        }
    };
    xmlhttp.open("GET", settingsFile, true);
    xmlhttp.send();
}

/*function doIdentify1(evt) {
    if (drawing) return; // If using Draw, Label, Measure widget return;
    // 3-30-22 Allow double click to zoom in. Don't show identify popup if time since last click was < a 1/4 second
    if (firstClick) secondClick = true;
    else firstClick = true;
    var d = new Date();
    var now = d.getTime();
    setTimeout(function(){
        // if 2nd click was < a 1/4 second zoom in
        if (secondClick && (now - lastIdentifyTime) < 250){
            firstClick=false;
            secondClick=false;
            if (map.infoWindow.isShowing){
                map.infoWindow.hide();
                map.infoWindow.setTitle("");
                hideLoading("");
            }        
            return; // double click
        }
        else if (!firstClick) return;
        else if (!secondClick) {           
            firstClick=false;
            secondClick=false;
            doIdentify2(evt);
        }
    },250);
    lastIdentifyTime = now;
    return;
}*/
// 6-11/24 userd to be doIdentify2
function doIdentify(evt){
    showLoading();
    /*if (view.popup.isShowing){
        map.infoWindow.hide();
        map.infoWindow.setTitle("");
        hideLoading("");
        return;
    }*/
    if (typeof gtag === 'function')gtag('event','widget_click',{'widget_name': 'Identify'});

    // Called for each map click or identify group change
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    features = [];
    theEvt = evt; // Save the click point so we can call this again from changeIdentifyGroup
    
    // Reset array of popupTemplate content for each group to null
    //if (groupContent["Way Point"]) delete groupContent["Way Point"]; // remove way point since we don't know if there is a way point here
    for (var i = 0; i < identifyGroups.length; i++) {
        groupContent[identifyGroups[i]] = null;
    }
    clickPoint = evt.mapPoint;
    displayContent();
}

function setIdentifyHeader() {
    // Set title drop down
    // Called by displayContent on empty content and handleQueryResults
    var h = document.getElementsByClassName("esri-popup__main-container")[0];
    if (!h) return;
    title = "<span style='float:left;text-overflow:ellipsis;'>Show: <select id='id_group' name='id_group' style='margin: 5px;color:black;' onChange='changeIdentifyGroup(this)'>";
    for (var i = 0; i < identifyGroups.length; i++) {
        title += "<option";
        if (identifyGroup == identifyGroups[i]) title += " selected";
        title += ">" + identifyGroups[i] + "</option>";
    }
    title += "</select></span>";
    if (h.childNodes[0].childNodes[0].childNodes[0].innerHTML.indexOf("<h") == 0){
        h = h.childNodes[0].childNodes[0].childNodes[0].childNodes[0];
        h.innerHTML = title;
    }
    else {
        h = h.childNodes[0].childNodes[0].childNodes[0].childNodes[0];
        var h2 = document.createElement("h2");
        h2.slot = "header-content";
        h2.ariaLevel = "2";
        h2.classList = "esri-widget__heading esri-features__heading";
        h2.role="heading";
        h2.innerHTML = title;
        h.parentNode.insertBefore(h2, h);
    }
}

function displayContent() {
    // Display cached content if available
    // Else loop through each layer found at the map click and call identifySuccess & handleQueryResults to handle each
    // Use cached content if available
    if (groupContent[identifyGroup]) {
        displayInfoWindow(groupContent[identifyGroup]);
        return;
    }

    require(["esri/rest/identify", "dojo/promise/all", "esri/rest/query", "esri/rest/support/Query"], 
    function(Identify, all, query, Query) {
        try{
            identifyParams.geometry = clickPoint; 
            identifyParams.mapExtent = view.extent;
            identifyParams.width = view.width;
            identifyParams.height = view.height;

            var skip = -1; // if id_vis_only and the top layer is hidden this will be true

            var deferreds = [];
            for (var i = 0; i < identifyLayerIds[identifyGroup].length; i++) {
                var item = identifyLayerIds[identifyGroup][i];
                if (item) {
                    // 10-19-20 Add identify Wildfires
                    if (item.url.indexOf("Wildfire")>-1 || item.url.indexOf("WFIGS")>-1){
                        params = new Query({
                            returnGeometry: true,
                            geometry: clickPoint,
                            spatialRelationship: "intersects",
                            outSpatialReference: map.spatialReference
                        });
                        if (identifyLayers[identifyGroup]["Wildfire Incidents"] && identifyLayers[identifyGroup]["Wildfire Incidents"].url === item.url){
                            params.outFields = identifyLayers[identifyGroup]["Wildfire Incidents"].fields;
                            if (view.scale <= 36112)
								params.distance = 0.25;
							else if (view.scale <= 144448)
								 params.distance = 0.5;
							else if (view.scale <= 577791)
								params.distance = 1;
							else if (view.scale <= 2311162)
								params.distance = 4;
							else
								params.distance = 10;
                            params.units = "miles";
                        }
                        else if (identifyLayers[identifyGroup]["Wildfire Perimeters"] && identifyLayers[identifyGroup]["Wildfire Perimeters"].url === item.url){
                            params.outFields = identifyLayers[identifyGroup]["Wildfire Perimeters"].fields;
                        }
                        else
                            alert("In SettingsWidget.xml tag Wildfire folder, must contain layers with the following names: Wildfire Incidents or Wildfire Perimeters.", "Data Error");
                        skip = true;
                        deferreds.push(query.executeQueryJSON(item.url, params).then(identifySuccess).catch(handleQueryError));
                        continue;
                    }
                                        
                    identifyParams.layerIds = item.ids.slice(); // make a copy of this array since we change it for bighorn or goat gmu
                    if (item.geometry != "polygon") {
                        // Used to be 15,10,5
                        if (view.scale <= 36112)
                            identifyParams.tolerance = 25;
                        else if (view.scale <= 288895)
                            identifyParams.tolerance = 20;
                        else
                            identifyParams.tolerance = 10;
                    } else
                        identifyParams.tolerance = 1;

                    // Show only visible items for identifyGroup when id_vis_only="true" in SettingsWidget.xml
                    // NOTE: IdentifyParameters option LAYER_OPTION_VISIBLE is supposed to do this but is not working 1-9-18
                    var url;
                    if (item.id_vis_only) {
                        identifyParams.layerOption = "visible"; // this is not working so get visible layers manually and set identifyParams.layerIds ????????????????
                        url = item.vis_url;
                        // trim off last /
                        if (item.vis_url[item.vis_url.length - 1] == "/") url = item.vis_url.substr(0, item.vis_url.length - 1);
                        skip = false;


                        // Get list of visible layers
                        /*var layers = map.getLayersVisibleAtScale(map.getScale());
                        var vis_layers = [];
                        identifyParams.layerIds = item.vis_ids.slice(); // get list of ids used in the map
                        // Loop through each top layer in the TOC that is visible at this scale
                        layers.forEach(function(layer) {
                            if (layer.url && layer.url.toLowerCase() == url.toLowerCase()) {
                                if (layer.visible == true) {
                                    skip = false;
                                    //var found = false;
                                    for (var i = 0; i < identifyParams.layerIds.length; i++) {
                                        var id = identifyParams.layerIds[i];
                                        // Make sure it and all it's parents are visible
                                        while (layer.layerInfos[id].visible == true) {
                                            if (layer.layerInfos[id].parentLayerId == -1) {
                                                vis_layers.push(identifyParams.layerIds[i]);
                                                break;
                                            } else {
                                                id = layer.layerInfos[id].parentLayerId;
                                            }
                                        }
                                    }
                                    identifyParams.layerIds = vis_layers;
                                } else if (skip == -1) {
                                    skip = true;
                                }
                            }
                        }); // for each layer
                        */
                    } else {
                        skip = false;
                        url = item.url;
                    }

                    // remove Big Game GMU if this is identifying Bighorn or Goat GMU
                    if (settings.elkUrl && item.url == settings.elkUrl.slice(0, settings.elkUrl.lastIndexOf("/") + 1) && gmu != "Big Game GMU") {
                        // Find the index to the layerId for Big Game GMU and remove it from the layer ids.
                        var index = identifyParams.layerIds.indexOf(settings.elkUrl.slice(settings.elkUrl.lastIndexOf("/") + 1));
                        if (index > -1) identifyParams.layerIds.splice(index, 1);
                    }
                    if (identifyParams.layerIds.length == 0) skip = true;
                    if (!skip){
                        deferreds.push(Identify.identify(url,identifyParams).then(identifySuccess).catch(handleQueryError)); // new 6-13-24
                        // deferreds.push(task.execute(identifyParams, identifySuccess, handleQueryError));
                    }     
                }
            }
            // Add goat and sheep gmus
            if (identifyGroup === "GMU and Land Management") {
                if (gmu == "Bighorn GMU") {
                    identifyParams.tolerance = 1;
                    identifyParams.layerIds = [settings.sheepUrl.slice(settings.sheepUrl.lastIndexOf("/") + 1)];
                    //task = new IdentifyTask(settings.sheepUrl.slice(0, settings.sheepUrl.lastIndexOf("/") + 1));
                    //deferreds.push(task.execute(identifyParams, identifySuccess, handleQueryError));
                    deferreds.push(Identify.identify(settings.sheepUrl.slice(0, settings.sheepUrl.lastIndexOf("/") + 1),identifyParams).then(identifySuccess).catch(handleQueryError));
                } else if (gmu == "Goat GMU") {
                    identifyParams.tolerance = 1;
                    identifyParams.layerIds = [settings.goatUrl.slice(settings.goatUrl.lastIndexOf("/") + 1)];
                    //task = new IdentifyTask(settings.goatUrl.slice(0, settings.goatUrl.lastIndexOf("/") + 1));
                    //deferreds.push(task.execute(identifyParams, identifySuccess, handleQueryError));
                    deferreds.push(Identify.identify(settings.goatUrl.slice(0, settings.goatUrl.lastIndexOf("/") + 1),identifyParams).then(identifySuccess).catch(handleQueryError));
                }
            }
            if (deferreds && deferreds.length > 0) {
                var dlist = all(deferreds);
                dlist.then(handleQueryResults);
            } else {
                // display empty info popup
                numDatabaseCalls = 0;
                processedDatabaseCalls = 0;
                features = [];
                accumulateContent("");
            }
        } catch (e){
            alert("Problem trying to identify. Error message: "+e.message,"Warning");
			 hideLoading("");
        }
    });
}

function identifySuccess(response) {
    if (response.results)
        return response.results;
    else return response; // for wildfire
}

function handleQueryError(e) {
    if (e.message.indexOf("Too many requests") > -1) {
        tooManyRequests = true;
        return;
    }
    if (e.details)
        alert("Error in identify.js/doIdentify.  " + e.details + " " + e.message + " Check " + app + "/SettingsWidget.xml urls.", "Data Error");
    else
        alert("Error in identify.js/doIdentify.  " + e.message + " Check " + app + "/SettingsWidget.xml urls.", "Data Error");
    hideLoading("");
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function handleQueryResults(results) {
    // results contains an array of identifyGroups
    // in which results[i] contains an array of objects:
    // 	displayFieldName
    //	feature: attributes, geometry, popupTemplate, symbol
    //	geometryType
    //	layerId
    //	layerName
    //	value
    //require(["dojo/_base/array"], function(array) {
        try {
            if (!results) {
                alert("Error in identify.js/handleQueryResults. Identify returned null.", "Data Error");
                return;
            }

            // Set info Content Header
            var tmpStr = "";
	        var str = "";

            // 10-19-20 Handle Wildfire
            if (identifyGroup.indexOf("Wildfire") > -1){
                require(["esri/rest/query", "esri/rest/support/Query"], function (query, Query) {
                    for (var r=0; r<results.length; r++){
						if (!results[r].features) tooManyRequests=true;
					}
					if (tooManyRequests) {
                        displayInfoWindow("<p>Too many people are requesting this data. Please try again.</p>");
						tooManyRequests = false;
                        return;
                    }
                    else tooManyRequests = false;
                    var noData = true;
					str = "The wildfire map layers are maintained and imported on demand from ESRI's USA Current Wildfires layer. They present the best-known point and perimeter locations of wildfire occurrences within the United States over the past 7 days from IRWIN and NIFC information.<br/><br/>";
                    // add each attribute to str
                    results.forEach(function(result) {
						if (result.features.length > 0) noData = false;
                        result.features.forEach(function(feature){
                            var layerName = "Wildfire Incidents";
							if (feature.attributes.GISAcres != undefined || feature.attributes.poly_GISAcres != undefined) layerName = "Wildfire Perimeters";
                            //if (feature.attributes && feature.attributes.IncidentName)
                            //    str += "<strong>"+ feature.attributes.IncidentName + "</strong><div style='padding-left: 10px;'>";
                            //else
							if (feature.attributes.IncidentName)
								str += "<h3 style='margin-bottom: 5px;margin-top: 5px;'>"+feature.attributes.IncidentName+"</h3><strong>"+layerName+"</strong><div style='padding-left: 10px;'>";
                            else str += "<h3 style='margin-bottom: 5px;margin-top: 5px;'>"+feature.attributes.poly_IncidentName+"</h3><strong>"+layerName+"</strong><div style='padding-left: 10px;'>";
                            var d;
                            
                            for (var i = 0; i < identifyLayers[identifyGroup][layerName].displaynames.length; i++) {
								tmpStr = "";
                                if ((feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] &&
									identifyLayers[identifyGroup][layerName].fields[i] !== "IncidentName" &&
									identifyLayers[identifyGroup][layerName].fields[i] !== "poly_IncidentName" &&
                                    identifyLayers[identifyGroup][layerName].fields[i].toLowerCase() !== "irwinid" &&
                                    feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== " " &&
                                    feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "Null" &&
                                    feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "")) {
                                    //https link (can't do substring on a number!)
                                    if ((typeof feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "string") &&
                                        (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].substring(0, 4) == "http"))
                                        tmpStr = "<a href='" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "' target='_blank'>" + identifyLayers[identifyGroup][layerName].displaynames[i] + "</a><br/>";
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("percent") > -1){
                                        tmpStr =identifyLayers[identifyGroup][layerName].displaynames[i] + ": " + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "%<br/>";
                                    }
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("updated") > -1){
                                        // subtract 6 hours from Greenwich time
                                        d = (Date.now() - feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]);
                                        const days = Math.trunc(d/1000/60/60/24);
                                        const hours = Math.trunc(d/1000/60/60 - days*24);
                                        const minutes = Math.trunc(d/1000/60 - hours*60);
											var dayStr = "days";
										if (days == 1) dayStr = "day";
										var hourStr = "hours";
										if (hours == 1) hourStr = "hour";
										var minStr = "minutes";
										if (minutes == 1) minStr = "minute";
										if (days >= 1) {
											if (hours >= 1)
												tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " +days+" "+dayStr+" "+hours+" "+hourStr+" ago<br/>";
											else
												tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " +days+" "+dayStr+" ago<br/>";
										} else if (hours >= 1){
											if (minutes >= 1)
												tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " +hours+" "+hourStr+" "+minutes+" "+minStr+" ago<br/>";
											else
												tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " +hours+" "+hourStr+" ago<br/>";
										} else
											tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": "+minutes+" "+minStr+" ago<br/>";
                                    }
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("date") > -1){
                                        d = new Date(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]);
                                        tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " + (d.getMonth()+1) + "/"+ d.getDate() +"/"+ d.getFullYear() +"<br/>";
                                    }
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("acre") > -1 ||
                                        identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("size") > -1 ||
                                        identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("final") > -1 ||
                                        identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("burned") > -1 ){
                                        if (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] >= 1)
                                            tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " + numberWithCommas(Math.round(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]])) + " Acres<br/>";
                                        else
											tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " + numberWithCommas(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(2)) + " Acres<br/>";
                                    }
                                    else {
                                        tmpStr = identifyLayers[identifyGroup][layerName].displaynames[i] + ": " + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "<br/>";
                                    }
                                }
                            
                                // don't add it twice, but add it to the features geometry array
                                //if (tmpStr != "" && str.indexOf(tmpStr) == -1) {
                                    // highlight polygon/point on mouse over, hide highlight on mouse out
                                    //str += "<div onMouseOver='javascript:highlightFeature(\""+features.length+"\")' onMouseOut='javascript:removeHighlight()'><strong>"+tmpStr;
                                    //str += "<div>" + tmpStr;
                                    str += tmpStr;
                                //}
                            }
							str += "</div><br/>";
                        });
                    });
					if (noData){
                        displayInfoWindow("No wildfires at this point.");
                        groupContent[identifyGroup] = "No wildfires at this point."; // cache 
                    }else {
						str += "Inciweb: <a href='https://inciweb.wildfire.gov/state/colorado' target='_blank'>https://inciweb.wildfire.gov/state/colorado</a><br/><br/>";
						groupContent[identifyGroup] = str; // cache content
						displayInfoWindow(str);
					}
                });
                return;
            }

            // Count database calls
            results.forEach(function(result) {
                if (result && result.length > 0) {
                    result.forEach(function(r) {
                        if (typeof identifyLayers[identifyGroup][r.layerName] != 'undefined')
                            if (typeof identifyLayers[identifyGroup][r.layerName].database != 'undefined') numDatabaseCalls++;
                    });
                }
            });

            // Clear old database call info
            index = 0;
            while (XMLHttpRequestObjects.length > 0) {
                XMLHttpRequestObjects.pop();
            }

            // Write the content for the identify 
            results.forEach(function(result) {
                if (result.length > 0) {
                    result.forEach(function(r) {
                        var feature = r.feature;
                        feature.attributes.layerName = r.layerName;

                        if (typeof identifyLayers[identifyGroup][r.layerName] != 'undefined') {
                            // Layer with database call
                            if (typeof identifyLayers[identifyGroup][r.layerName].database != 'undefined') {
                                try {
                                    createMultiXMLhttpRequest();
                                    var url = app + "/" + identifyLayers[identifyGroup][r.layerName].database + "?v=" + ndisVer + "&key=" + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                    XMLHttpRequestObjects[index].open("GET", url, true); // configure object (method, url, async)
                                    // register a function to run when the state changes, if the request
                                    // has finished and the stats code is 200 (OK) write result
                                    XMLHttpRequestObjects[index].onreadystatechange = function(arrIndex) {
                                        return function() {
                                            if (XMLHttpRequestObjects[arrIndex].readyState == 4) {
                                                if (XMLHttpRequestObjects[arrIndex].status == 200) {
                                                    tmpStr = r.layerName + "</strong><div style='padding-left: 10px;'>";

                                                    var xmlDoc = createXMLdoc(XMLHttpRequestObjects[arrIndex]);
                                                    for (i = 0; i < identifyLayers[identifyGroup][r.layerName].displaynames.length; i++) {
                                                        if ((i > 0 && r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] &&
                                                                r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== " " &&
                                                                r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== "Null" &&
                                                                r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== "")) {
                                                                if ((typeof r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] === "string") &&
                                                                    (r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].substring(0, 4) == "http"))
                                                                tmpStr += "<a href='" + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] + "' target='_blank'>" + identifyLayers[identifyGroup][r.layerName].displaynames[i] + "</a>";
                                                            else {
                                                                if ((r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].substring(0, 7) == "<a href") && (r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].indexOf("target") == -1))
                                                                    tmpStr += identifyLayers[identifyGroup][r.layerName].displaynames[i] + ": " + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].replace(">", " target='_blank'>");
                                                                else
                                                                    tmpStr += identifyLayers[identifyGroup][r.layerName].displaynames[i] + ": " + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]];
                                                            }
                                                            tmpStr += "<br/>";
                                                        }
                                                        // add the database info at position specified
                                                        if (identifyLayers[identifyGroup][r.layerName].position == i) {
                                                            // one2one_display: one2one_fields values
                                                            if (typeof identifyLayers[identifyGroup][r.layerName].one2one_fields != "undefined") {
                                                                for (j = 0; j < identifyLayers[identifyGroup][r.layerName].one2one_fields.length; j++) {
                                                                    if (xmlDoc.getElementsByTagName(identifyLayers[identifyGroup][r.layerName].one2one_fields[j]).length > 0) {
                                                                        var one2one_field = xmlDoc.getElementsByTagName(identifyLayers[identifyGroup][r.layerName].one2one_fields[j])[0];
                                                                        if ((one2one_field.getElementsByTagName("linkname").length > 0) && (one2one_field.getElementsByTagName("linkurl").length > 0)) {
                                                                            tmpStr += identifyLayers[identifyGroup][r.layerName].one2one_display[j] + ": ";
                                                                            tmpStr += "<a href='" + one2one_field.getElementsByTagName("linkurl")[0].firstChild.nodeValue + "'>" + one2one_field.getElementsByTagName("linkname")[0].firstChild.nodeValue + "</a>";
                                                                            tmpStr += "<br/>";
                                                                        } else if (one2one_field.childNodes.length > 0) {
                                                                            tmpStr += identifyLayers[identifyGroup][r.layerName].one2one_display[j] + ": ";
                                                                            tmpStr += one2one_field.childNodes[0].nodeValue;
                                                                            tmpStr += "<br/>";
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            // one2many bulleted list
                                                            if (typeof identifyLayers[identifyGroup][r.layerName].one2many_fields != "undefined") {
                                                                for (j = 0; j < identifyLayers[identifyGroup][r.layerName].one2many_fields.length; j++) {
                                                                    var one2many = xmlDoc.getElementsByTagName(identifyLayers[identifyGroup][r.layerName].one2many_fields[j]);
                                                                    tmpStr += identifyLayers[identifyGroup][r.layerName].displaynames[0] + ":<ul style='margin-top: 0px; margin-bottom: 0px;'>";
                                                                    for (var h = 0; h < one2many.length; h++) {
                                                                        //if (typeof one2many[h].children[0] != "undefined" && one2many[h].children[0].nodeName == "linkname" && one2many[h].children[1].nodeName == "linkurl") {
                                                                        if ((one2many[h].getElementsByTagName("linkname").length > 0) && (one2many[h].getElementsByTagName("linkurl").length > 0)) {
                                                                            tmpStr += "<li><a href='" + one2many[h].getElementsByTagName("linkurl")[0].firstChild.nodeValue + "' target='_blank'>" + one2many[h].getElementsByTagName("linkname")[0].firstChild.nodeValue + "</a></li>";
                                                                        }
                                                                        // No html links, linkname and linkurl tags not used in returned XML
                                                                        else {
                                                                            tmpStr += "<li>" + one2many[h].childNodes[0].nodeValue + "</li>";
                                                                        }
                                                                    }
                                                                    tmpStr += "</ul style='margin-bottom: 0px; margin-top: 0px;'>";
                                                                }
                                                            }
                                                        }
                                                    }
                                                    tmpStr += "</div><br/>";
                                                    processedDatabaseCalls++;
                                                    // don't add it twice, but add it to the features geometry array
                                                    if (str.indexOf(tmpStr) == -1) {
                                                        // highlight polygon/point on mouse over, hide highlight on mouse out
                                                        str += "<div onMouseOver='javascript:highlightFeature(\""+features.length+"\")' onMouseOut='javascript:removeHighlight()'><strong>"+tmpStr;
                                                        //str += "<div><strong>" + tmpStr;
                                                        groupContent[identifyGroup] = str; // cache content
                                                        //view.popup.content = str;
                                                        //view.openPopup();
                                                        //map.infoWindow.setContent(str);
                                                        //map.infoWindow.show(clickPoint);
                                                    }
                                                    features.push(r.feature);
                                                }
                                                // if failed
                                                else {
                                                    if (XMLHttpRequestObjects[arrIndex].status == 404) {
                                                        alert("Identify failed. File not found: " + url, "Data Error");
                                                        processedDatabaseCalls = numDatabaseCalls;
                                                        accumulateContent(str);
                                                    } else {
                                                        alert("Identify failed for call to " + url + ". Make sure it exists and does not have errors. Must be in the same directory as index.html or a lower directory. XMLHttpRequestObjects[" + arrIndex + "].status was " + XMLHttpRequestObjects[arrIndex].status, "Data Error");
                                                        processedDatabaseCalls = numDatabaseCalls;
                                                        accumulateContent(str);
                                                    }
                                                }
                                                // Check if all have finished
                                                var isAllComplete = true;
                                                for (var i = 0; i < numDatabaseCalls; i++) {
                                                    if ((!XMLHttpRequestObjects[i]) || (XMLHttpRequestObjects[i].readyState !== 4)) {
                                                        isAllComplete = false;
                                                        break;
                                                    }
                                                }
                                                if (isAllComplete) {
                                                    accumulateContent(str);
                                                }
                                            }
                                        };
                                    }(index);
                                    XMLHttpRequestObjects[index].send();
                                } catch (error) {
                                    alert("Identify on " + r.layerName + " failed with error: " + error.message + " in javascript/identify.js handleQueryResults().", "Data Error");
                                    console.log(error.message);
                                    hideLoading("");
                                }
                            }
                            // Layer without database call
                            else {
                                tmpStr = r.layerName + "</strong><div style='padding-left: 10px;'>";
                                var first = true;
                                for (i = 0; i < identifyLayers[identifyGroup][r.layerName].displaynames.length; i++) {
                                    if ((r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] &&
                                            r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== " " &&
                                            r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== "Null" &&
                                            r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== "")) {
                                        // the first line does not need a carriage return
                                        if (first) first = false;
                                        else tmpStr += "<br/>";
                                        // can't do substring on a number!
                                        if ((typeof r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] === "string") &&
                                            (r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].substring(0, 4) == "http"))
                                            tmpStr += "<a href='" + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] + "' target='_blank'>" + identifyLayers[identifyGroup][r.layerName].displaynames[i] + "</a>";
                                        else
                                            tmpStr += identifyLayers[identifyGroup][r.layerName].displaynames[i] + ": " + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]];
                                    }
                                }
                                tmpStr += "</div></div><br/>";
                                // don't add it twice, but add it to the features geometry array
                                if (str.indexOf(tmpStr) == -1) {
                                    // highlight polygon/point on mouse over, hide highlight on mouse out
                                    str += "<div onMouseOver='javascript:highlightFeature(\""+features.length+"\")' onMouseOut='javascript:removeHighlight()'><strong>"+tmpStr;
                                    //str += "<div><strong>" + tmpStr;
                                    groupContent[identifyGroup] = str; // cache content
                                    //displayContent(str);
                                    //view.popup.content = str;
                                    //view.openPopup();
                                    //map.infoWindow.setContent(str);
                                    //map.infoWindow.show(clickPoint);
                                }
                                features.push(r.feature);
                            }
                        }
                    });
                }
            });
             
            accumulateContent(str);
        } catch (e) {
            alert(e.message + " in javascript/identify.js handleQueryResults().", "Code Error", e);
            hideLoading("");
        }
    //});
}

function highlightFeature(id) {
    // highlight geometry on mouse over, no fade = true
    if (features[id].geometry === undefined || !features[id].geometry) return;
    if (features[id].geometry.type === undefined || !features[id].geometry.type) return;
    if (features[id].geometry.type === "point" ) {
        addHighlightPoint(features[id],true);
    }else if (features[id].geometry.type === "polygon") {
        addTempPolygon(features[id],true);
    } else if (features[id].geometry.type === "polyline") {
        addTempLine(features[id],true);
    }
}

function removeHighlight() {
    // remove old highlight
    view.graphics.remove(view.graphics.items[view.graphics.items.length-1]);
}

/*function setIdentifyContentHeader(name) {
     // tlb 6-8-18 Fix bug on ipad, info window not scrolling. Add <div style='height:100%;'>
    if (identifyLayers[name].desc) return "<div style='height:100%;'><div class='esriPopupItemTitle'>" + name + " found at map click:</div><br/><p style='font-style:italic;top:-15px;position:relative;'>" + identifyLayers[name].desc + "</p>";
    else
        return "<div style='height:100%;'><div class='esriPopupItemTitle'>" + name + " found at map click:</div><br/>";
}*/

function setIdentifyFooter(clickPt) {
    // Set XY click info
    //var h = document.getElementsByClassName("esri-popup__main-container")[0];
    //if (!h) return;
    //var contentNode = h.childNodes[0];

    require(["esri/request"],
        function(esriRequest) {
            try {
                // Get XY point in user specified projection (from Settings)
                // Wait for popup to show
                const tim = setInterval(function(){
                    if (document.getElementById("idXY")){
                        clearInterval(tim);
                        // set click point
                        projectPoint(clickPoint,document.getElementById("idXY"));
                    
                        // display elevation (use our raster map service)
                        if (elevation_url) {  
                            var ext = '{"xmin":' + view.extent.xmin + ',"ymin":' + view.extent.ymin + ',"xmax":' + view.extent.xmax + ',"ymax":' + view.extent.ymax + ',"spatialReference":{"wkid":102100,"latestWkid":102100}}';
                            var layersRequest = esriRequest(elevation_url + "/identify", {
                                responseType: "json",
                                query: {
                                    geometry: JSON.stringify(clickPt),
                                    geometryType: "point",
                                    tolerance: "5",
                                    mapExtent: ext,
                                    imageDisplay: view.width + "," + view.height + ",96",
                                    returnGeometry: false,
                                    sr: "102100",
                                    f: "json"
                                },
                                responseType: "json"
                            });
                            layersRequest.then(
                                function(response) { 
                                    var elev = document.getElementById("idElevation");
                                    // If user clicks outsite colorado there is no data. Was throwing an error. tlb 6-28-18
                                    if (response.data.results.length == 0 || isNaN(response.data.results[0].attributes["Pixel Value"])) {
                                        elev.innerHTML = "Elevation: data not available";
                                        return;
                                    }
                                    elev.innerHTML = "Elevation: " + Math.round(response.data.results[0].attributes["Pixel Value"]) + " ft " + Math.round(response.data.results[0].attributes["Pixel Value"] * 0.3048) + " m";
                                },
                                function(error) {
                                    var elev = getElementById("idElevation");
                                    elev.innerHTML = "Elevation: data not available";
                                    hideLoading("");
                                }

                            );
                        }
                    }
                }, 100); 
            } catch (e) {
                alert(e.message + " in javascript/identify.js setIdentifyFooter().", "Code Error", e);
            }
        });
}

function changeIdentifyGroup(sel) {
    identifyGroup = sel.options[sel.selectedIndex].value;
    view.popup.content = "<p align='center'>Loading...</p>";
    view.popupEnabled = false;
    features = [];
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    displayContent();
    //doIdentify(theEvt);
}

function accumulateContent(theContent){
    if (numDatabaseCalls == processedDatabaseCalls) {
        numDatabaseCalls = 0;
        processedDatabaseCalls = 0;

        // No info found, just display XY coordinates
        if (features.length == 0) {
            var str;
            var visible = "";
            if (identifyLayerIds[identifyGroup][0].id_vis_only) visible = "visible "; // 1-10-18 add word visible if identifying visible only
            if (identifyLayers[identifyGroup].desc) {
                str = "<div><p style='font-style:italic;top:-15px;position:relative;'>" + identifyLayers[identifyGroup].desc + "</p>No " + visible + identifyGroup + " at this point.<br/><br/></div>";
                theContent = str;
                groupContent[identifyGroup] = str; // cache content
                str = null;
            } else {
                str = "<div>No " + visible + identifyGroup + " at this point.<br/><br/></div>";
                theContent = str;
                groupContent[identifyGroup] = str; // cache content
                str = null;
            }
        }
        displayInfoWindow(theContent);
    }
}

function customStuff(theContent){
    // add a drop down list and footer to the popup content
    const outerDiv = document.createElement("div");
    outerDiv.style.margin = "-12px";
    outerDiv.style.display = "grid";
    outerDiv.style.gridTemplateRows = "min-content auto min-content";
    outerDiv.style.height = "100%";
    // header drop down
    /*var content = "<div class='dialogTitle' style='border:none;float:left;height:fit-content;text-overflow:ellipsis;border-bottom: 1px solid #dfdfdf;width: 100%;padding: 5px 12px;'><strong>Show:</strong> <select id='id_group' name='id_group' style='margin: 5px;color:black;' onChange='changeIdentifyGroup(this)'>";
    for (var i = 0; i < identifyGroups.length; i++) {
        content += "<option";
        if (identifyGroup == identifyGroups[i]) content += " selected";
        content+= ">" + identifyGroups[i] + "</option>";
    }
    content += "</select></div>";*/

    // content
    var content = "<div style='overflow:auto;border-bottom: 1px solid #dfdfdf;padding:12px;'>"+theContent+"</div>";

    // footer
    content += "<div style='height:fit-content;padding:5px 12px 2px;'>";
    // Zoom To
    content += "<a href='javascript:zoomToPt()' style='color:black;margin-right:20px;'><button><calcite-icon aria-hidden='true' icon='magnifying-glass-plus' scale='s' style='vertical-align:middle;'></calcite-icon> Zoom to</button></a> ";
    // Get Directions
    if (driving_directions){
        content += "<a href='javascript:getDirections()' style='color:black;'><button><span aria-hidden='true' class='esri-features__icon esri-icon-directions2' style='vertical-align:middle;'></span> Get Directions</button></a>";
    }
    // XY point
    content += "<p style='margin: 5px 0;'>Location: <span id='idXY'>Loading click point...</span></p>";
    // Elevation
    content += "<p id='idElevation' style='margin: 2px 0;'>Loading elevation...</p>"
    content += "</div>";
    outerDiv.innerHTML = content;
    return outerDiv;
}
function displayInfoWindow(theContent) {
    // open popup and set content to string theContent
    view.popup.content = customStuff(theContent);
    view.openPopup();    
    setIdentifyHeader();
    setIdentifyFooter(clickPoint); // add xy point and elevation to footer
    hideLoading("");
}

/*function displayElevation(){
    // use our raster map service
    if (elevation_url) {
        require(["esri/request"], function(esriRequest) {
            var ext = '{"xmin":' + view.extent.xmin + ',"ymin":' + view.extent.ymin + ',"xmax":' + view.extent.xmax + ',"ymax":' + view.extent.ymax + ',"spatialReference":{"wkid":102100,"latestWkid":102100}}';
            // find the index of the elevation action
            var index=0;
            for (var i=0; i<view.popup.actions.items.length; i++){
                if (view.popup.actions.items[i].title.indexOf("Elevation")>-1){
                    index = i;
                    break;
                }
            }
            var layersRequest = esriRequest(elevation_url + "/identify", {
                responseType: "json",
                query: {
                    geometry: JSON.stringify(clickPoint),
                    geometryType: "point",
                    tolerance: "5",
                    mapExtent: ext,
                    imageDisplay: view.width + "," + view.height + ",96",
                    returnGeometry: false,
                    sr: "102100",
                    f: "json"
                  },
                  responseType: "json"
            });
            layersRequest.then(
                function(response) {
                    var footer = document.getElementsByClassName("idFooter")[0];
                    var elev = document.createElement("div");
                    // If user clicks outsite colorado there is no data. Was throwing an error. tlb 6-28-18
                    if (response.data.results.length == 0 || isNaN(response.data.results[0].attributes["Pixel Value"])) {
                        view.popup.actions.items[index].title = "Elevation: data not available";
                        elev.innerHTML = "Elevation: data not available";
                        footer.appendChild(elev);
                        return;
                    }
                    view.popup.actions.items[index].title = "Elevation: " + Math.round(response.data.results[0].attributes["Pixel Value"]) + " ft " + Math.round(response.data.results[0].attributes["Pixel Value"] * 0.3048) + " m";
                    elev.innerHTML = "Elevation: " + Math.round(response.data.results[0].attributes["Pixel Value"]) + " ft " + Math.round(response.data.results[0].attributes["Pixel Value"] * 0.3048) + " m";
                    footer.appendChild(elev);
                },
                function(error) {
                    view.popup.actions.items[index].title = "Elevation: data not available";
                    var footer = document.getElementsByClassName("idFooter")[0];
                    var elev = document.createElement("div");
                    elev.innerHTML = "Elevation: data not available";
                    footer.appendChild(elev);
                    hideLoading("");
                }

            );
        });
    }*/
    /* using google.maps.ElevationService see google-developers.appspot.com/maps/documentation/javascript/examples/elevation-simple */
        /* returns elevation in meters */
        /*if (show_elevation){
        	require(["esri/urlUtils","esri/geometry/webMercatorUtils"], function(urlUtils,webMercatorUtils) {
        		var geoPt = webMercatorUtils.webMercatorToGeographic(clickPoint);
        		var location=[];
        		location.push({
        			"lat": parseFloat(geoPt.y),
        			"lng":parseFloat(geoPt.x)
        		});
        		var pos = {
        			"locations": location
        		};
        		var elev = new google.maps.ElevationService();
        		elev.getElevationForLocations(pos, function(results, status){
        			if (status == google.maps.ElevationStatus.OK && results[0]){
        				require(["dojo/dom-attr","dojo/dom-construct", "dojo/query", "dojo/dom", "dojo/on", "dojo/domReady!"],
        				  function(domAttr,domConstruct, query, dom, on){
        					if (query(".actionList #elevation", map.infoWindow.domNode)[0]) {
        						domConstruct.empty(query(".actionList #elevation", map.infoWindow.domNode)[0]);
        						domConstruct.place(
        						  domConstruct.toDom("Elevation: "+ Math.round(results[0].elevation*3.28084) + " ft, "+Math.round(results[0].elevation) + " m"),
        						  query(".actionList #elevation", map.infoWindow.domNode)[0] );
        					}
        					else {
        						domConstruct.create("span", {
        						  "class": "action",
        						  "id": "elevation",
        						  "innerHTML":  "Elevation: "+ Math.round(results[0].elevation*3.28084) + " ft, "+Math.round(results[0].elevation) + " m"
        						}, query(".actionList", map.infoWindow.domNode)[0] );
        					}
        				});
        			}
        			else {
        				require(["dojo/dom-attr","dojo/dom-construct", "dojo/query", "dojo/dom", "dojo/on", "dojo/domReady!"],
        				  function(domAttr,domConstruct, query, dom, on){
        					if (query(".actionList #elevation", map.infoWindow.domNode)[0]) {
        						domConstruct.empty(query(".actionList #elevation", map.infoWindow.domNode)[0]);
        						domConstruct.place(
        						  domConstruct.toDom("Elevation: data not available "+status.toLowerCase()),
        						  query(".actionList #elevation", map.infoWindow.domNode)[0] );
        					}
        					else {
        						domConstruct.create("span", {
        						  "class": "action",
        						  "id": "elevation",
        						  "innerHTML":  "Elevation: data not available "+status.toLowerCase()
        						}, query(".actionList", map.infoWindow.domNode)[0] );
        					}
        				});
        				hideLoading("");
        			}
        		});
        	});
        }*/

        // Esri's elevation data, requires a password and fee
        /*
        if (elevation_url) {
        	require(["esri/request","esri/urlUtils"], function(esriRequest,urlUtils) { 
        		//since imagery service identify has unique parameters, we use esriRequest instead of an IdentifyTask
        		urlUtils.addProxyRule({
        			urlPrefix: "elevation.arcgis.com",  
        			proxyUrl: "/proxy/DotNet/proxy.ashx"
        		});					
        		var layersRequest = esriRequest({
        			url : elevation_url,
        			content : {
        				f : "json",
        				geometry : JSON.stringify(clickPoint),
        				geometryType: "esriGeometryPoint",
        				sr: "3857",
        				returnGeometry: false
        			},
        			handleAs : "json",
        			callbackParamName : "callback"
        		});
        		layersRequest.then(
        			 function (response) {
        			  require(["dojo/dom-attr","dojo/dom-construct", "dojo/query", "dojo/dom", "dojo/on", "dojo/domReady!"],
        			  function(domAttr,domConstruct, query, dom, on){
        				if (query(".actionList #elevation", map.infoWindow.domNode)[0]) {
        					domConstruct.empty(query(".actionList #elevation", map.infoWindow.domNode)[0]);
        					domConstruct.place(
        					  domConstruct.toDom("Elevation: "+ Math.round(response.value*3.28084) + " ft "+Math.round(response.value) + " m"),
        					  query(".actionList #elevation", map.infoWindow.domNode)[0] );
        				}
        				else {
        					domConstruct.create("span", {
        					  "class": "action",
        					  "id": "elevation",
        					  "innerHTML":  "Elevation: "+ Math.round(response.value*3.28084) + " ft "+Math.round(response.value) + " m"
        					}, query(".actionList", map.infoWindow.domNode)[0] );
        				}
        			  });
        			}, function (error) {
        				require(["dojo/dom-attr","dojo/dom-construct", "dojo/query", "dojo/dom", "dojo/on", "dojo/domReady!"],
        				  function(domAttr,domConstruct, query, dom, on){
        					if (query(".actionList #elevation", map.infoWindow.domNode)[0]) {
        						domConstruct.empty(query(".actionList #elevation", map.infoWindow.domNode)[0]);
        						domConstruct.place(
        						  domConstruct.toDom("Elevation: data not available"),
        						  query(".actionList #elevation", map.infoWindow.domNode)[0] );
        					}
        					else {
        						domConstruct.create("span", {
        						  "class": "action",
        						  "id": "elevation",
        						  "innerHTML":  "Elevation: data not available"
        						}, query(".actionList", map.infoWindow.domNode)[0] );
        					}
        				});
        				hideLoading("");
        			}
        			
        		);
        	});
        }*/
//}

function getDirections() {
    // Open Google maps directions to point
    require(["esri/geometry/support/webMercatorUtils"], function(webMercatorUtils) {
        var geoPt = webMercatorUtils.webMercatorToGeographic(view.popup.viewModel.location);
        var url = "http://google.com/maps?output=classic&q=" + geoPt.y + "," + geoPt.x;
        window.open(url, "_blank");
    });
}

function zoomToPt() {
    var level = 250000;
    if (view.scale < 250000) level = view.scale; // don't zoom out!!!
    // zoom to point
    view.goTo({
        target: view.popup.viewModel.location,
        scale: level
    });
}
//// End Identify Widget ////