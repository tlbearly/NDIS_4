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
var polySymbol, pointSymbol, lineSymbol;
var irwin_to_inciweb_url = "";
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
    polySymbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0]), 1
        ),
        new Color([125, 125, 125, 0.35])
    );
    pointSymbol = new PictureMarkerSymbol("assets/images/i_flag.png", 40, 40);
    lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 10]), 1);
});

// TEST ********************************

  // Executes each time the view is clicked
  function executeIdentify(event) {
    // Set the geometry to the location of the view click
    identifyParams.geometry = event.mapPoint;
    identifyParams.width = view.width;
    identifyParams.height = view.height;
    identifyParams.mapExtent = view.extent;
    identifyParams.tolerance = 1;

    document.getElementById("mapDiv").style.cursor = "wait";

    for(var g=0; g<identifyLayerIds[identifyGroup].length; g++){
        var identifyURL = identifyLayerIds[identifyGroup][g].url;
        identifyParams.layerIds = identifyLayerIds[identifyGroup][g].ids.slice();

        // This function returns a promise that resolves to an array of features
        // A custom popupTemplate is set for each feature based on the layer it
        // originates from
        identify
        .identify(identifyURL, identifyParams)
        .then(function (response) {
            const results = response.results;

            return results.map(function (result) {
            let feature = result.feature;
            let layerName = result.layerName;

            feature.attributes.layerName = layerName;
            feature.popupTemplate = {
                title: "<button>"+identifyGroup+"</button>"
            };
            feature.popupTemplate.content = "<b>"+layerName+"</b><br>";
            // add displayname: field value</br>
            for (var i=0; i<identifyLayers[identifyGroup][layerName].displaynames.length; i++){
                if (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "") continue;
                feature.popupTemplate.content += identifyLayers[identifyGroup][layerName].displaynames[i] + ": " +
                "{"+identifyLayers[identifyGroup][layerName].fields[i] + "}<br>";
            }

            // drop down list of identify groups
            feature.popupTemplate.content += "<br><select id='id_group' name='id_group' style='margin: 5px;color:black;' onChange='changeIdentifyGroup(this)'>";
                for (var j=0; j < identifyGroups.length; j++) {
                    feature.popupTemplate.content += "<option";
                    if (identifyGroup == identifyGroups[j]) feature.popupTemplate.content += " selected";
                    feature.popupTemplate.content += ">" + identifyGroups[j] + "</option>";
                }
                feature.popupTemplate.content += "</select>";
            return feature;
            });
        })
        .then(showPopup); // Send the array of features to showPopup()

        // Shows the results of the identify in a popup once the promise is resolved
        function showPopup(response) {
            if (response.length > 0) {
                /*for (var i=0; i<response.length; i++){
                    response[i].popupTemplate.title = "test";
                    response[i].popupTemplate.content += "<br><select id='id_group' name='id_group' style='margin: 5px;color:black;' onChange='changeIdentifyGroup(this)'>";
                    for (var j=0; j < identifyGroups.length; j++) {
                        response[i].popupTemplate.content += "<option";
                        if (identifyGroup == identifyGroups[j]) response[i].popupTemplate.content += " selected";
                        response[i].popupTemplate.content += ">" + identifyGroups[j] + "</option>";
                    }
                    response[i].popupTemplate.content += "</select>";
                }*/
                view.openPopup({
                    features: response,
                    location: event.mapPoint
                });
            }
            document.getElementById("mapDiv").style.cursor = "auto";
        }
    }
  }

// END TEST ****************************

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
                    var driving_directions = xmlDoc.getElementsByTagName("driving_directions")[0] && xmlDoc.getElementsByTagName("driving_directions")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (driving_directions) {
                        // Add a link into the InfoWindow Actions panel
                        // Get Directions
                        view.popup.actions = [
                            {
                                id: "directions",
                                className: "esri-icon-directions2",
                                title: "Get Directions"
                            }
                        ];
                    }
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

                            // Get Wildfire Perimeters IRWIN_to_Inciweb url if. This contains the report info. 6/24/21
							if (layer[i].getAttribute("label") === "Wildfire Perimeters"){
								if (layer[i].getElementsByTagName("irwin_to_inciweb") && layer[i].getElementsByTagName("irwin_to_inciweb")[0])
									irwin_to_inciweb_url = layer[i].getElementsByTagName("irwin_to_inciweb")[0].childNodes[0].nodeValue;
								else
									alert("Error in "+ app + "/readSettingsWidget.xml. Missing irwin_to_inciweb tag in Wildfire Perimeters layer. This contains the report info.");
							}

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
    // Loop through each layer found at the map click
    //"esri/rest/query", "esri/rest/support/Query", query, Query
    require(["esri/rest/identify", "dojo/promise/all"], 
    function(Identify, all) {
        try{
            if (identifyGroup.indexOf("Wildfire")>-1){
                view.closePopup();
                view.popupEnabled = true;
                try {
                    view.popup.open({
                        location: clickPoint, // <- use map point of the click event
                        fetchFeatures: true // <- fetch the selected features (if any)
                    });
                } catch (e){
                    alert("Problem trying to identify wildfire. "+e.message,"Warning");
                    return;
                }
                var count = 0;
                // wait up to 2 seconds for popup to open, if it doesn't assume there is not data here
                let tim = setInterval(function(){
                    count++;
					if (count < 2 && document.getElementsByClassName("esri-popup__main-container")[0]){
						clearInterval(tim);
                        setIdentifyHeader();
						setIdentifyFooter();
						hideLoading();
					}
					else {
                        clearInterval(tim);
						view.popup.location = clickPoint;
						view.popup.title = "Wildfire Perimeters";
						view.popup.content = "No Wildfire incidents at this location.";
						view.openPopup();
                        hideLoading();
                        var count2=0;
						let tim2 = setInterval(function(){
							count2++;
							if (count2 < 2 && document.getElementsByClassName("esri-popup__main-container")[0]){
						        clearInterval(tim2);
                                setIdentifyHeader();
						        setIdentifyFooter();
                            } else{
                                clearInterval(tim2);
                            }
                        },500);
					}
                },500);
               
                return;
            }
            // use cached content if available
            if (groupContent[identifyGroup]) {
                view.popup.content = groupContent[identifyGroup];
                hideLoading("");
                return;
            }

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
                    /*if (item.url.indexOf("Wildfire")>-1){
                        // OLD *************************************
                        // 11-11-20 if wildfire feature service failed to load display error message
                        var mapLayers = map.getLayersVisibleAtScale();
                        var found = 0;
                        for (var g=0; g < mapLayers.length; g++){
                            if (mapLayers[g].id.indexOf("Wildfire") > -1){
                                found = 1;
                                break;
                            }
                        }
                        if (!found) {
                            alert("Cannot display incident report at this time. The external map service that provides Wildfire Perimeters is experiencing problems. This issue is out of CPW control. We will make the National Interagency Fire Center aware of this issue.","Notice");
                            continue;
                        }

                        // new 6-12-24
                        params = new Query({
                            returnGeometry: true,
                            geometry: clickPoint,
                            spatialRelationship: "intersects",
                            outSpatialReference: map.spatialReference
                        });
                        //task = new QueryTask(item.url);
                        //var query = new Query();
                        if (identifyLayers[identifyGroup][identifyGroup].url === item.url){
                            //query.outFields = identifyLayers[identifyGroup][identifyGroup].fields;
                            params.outFields = identifyLayers[identifyGroup][identifyGroup].fields;
                        }
                        else if (identifyLayers[identifyGroup]["Wildfire Incidents"].url === item.url){
                            //query.outFields = identifyLayers[identifyGroup]["Wildfire Incidents"].fields;
                            //query.distance =2;
                            //query.units = "miles";
                            params.outFields = identifyLayers[identifyGroup]["Wildfire Incidents"].fields;
                            params.distance = 2;
                            params.units = "miles";
                        }
                        else
                            alert("In SettingsWidget.xml tag Wildfire Perimeters folder, must contain layers with the following names: Wildfire Perimeters or Wildfire Incidents.", "Data Error");
                        //query.geometry = clickPoint;
                        //query.returnGeometry = true;
                        //query.spatialRelationship = "esriSpatialRelIntersects";
                        //query.outSpatialReference = map.spatialReference;
                        skip = true;
                    
                        deferreds.push(query.executeQueryJSON(item.url, params).then(identifySuccess).catch(handleQueryError));  // new 6-13-24
                        
                        //deferreds.push(task.execute(query, identifySuccess, handleQueryError));
                        continue;
                    }*/
                                        
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
                // Set header drop down
            // setIdentifyHeader();
                displayInfoWindow();
            }
        } catch (e){
            alert("Problem trying to identify. Error message: "+e.message,"Warning");
        }
    });
}

function identifySuccess(response) {
    return response.results;
    /*const results = response.results;

    return results.map(function (result) {
        // add popups
        let feature = result.feature;
        let layerName = result.layerName;

        feature.attributes.layerName = layerName;
    });
*/
    
}

function handleQueryError(e) {
    if (e.details)
        alert("Error in identify.js/doIdentify.  " + e.details + " " + e.message + " Check " + app + "/SettingsWidget.xml urls.", "Data Error");
    else
        alert("Error in identify.js/doIdentify.  " + e.message + " Check " + app + "/SettingsWidget.xml urls.", "Data Error");
    hideLoading("");
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
                alert("Error in identify.js/handleQueryResults. IdentifyTask returned null.", "Data Error");
                return;
            }
            var title;
            // Set info Content Header
            var tmpStr;
	        var str = "";//setIdentifyContentHeader(identifyGroup);

            // 10-19-20 Handle Wildfire
            /*if (identifyGroup == "Wildfire Perimeters"){
                require(["esri/tasks/query", "esri/tasks/QueryTask"],
                function(Query, QueryTask) {
                    var i;
                    if (results[0].features.length == 0 && results[1].features.length == 0){
                        //title = "No " + identifyGroup;
                        //view.popup.title = title;
                        //map.infoWindow.setTitle(title);
                        
                        view.popup.content = "No Wildfire Perimeters/Incidents at this point.<br/><br/>";
                        view.openPopup();
                        setIdentifyHeader();
                        setIdentifyFooter();
                        groupContent[identifyGroup] = "No Wildfire Perimeters/Incidents at this point."; // cache 
                        hideLoading("");
                        return;
                    }
                    // results[0] = Wildfire Perimeters
                    // results[1] = Wildfire Incidents
                    if (results[0].features.length > 0)i=0;
                    else i=1;
                    //title = results[i].features[0].attributes.IncidentName;
                    //view.popup.title = title;
                    //map.infoWindow.setTitle(title);
                    tmpStr = results[i].features[0].attributes.IncidentName + "</strong><div style='padding-left: 10px;'>";
                    // lookup irwinid to get incident report
                    var queryTask = new QueryTask(irwin_to_inciweb_url);//"https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/IRWIN_to_Inciweb_View/FeatureServer/0");
                    var query = new Query();
                    var irwinid;
                    if (i==0) irwinid = results[i].features[0].attributes.IRWINID.substr(1,results[i].features[0].attributes.IRWINID.length -2).toLocaleLowerCase();
                    else irwinid = results[i].features[0].attributes.IrwinID.substr(1,results[i].features[0].attributes.IrwinID.length -2).toLocaleLowerCase();
                    query.where = "IrwinID='"+irwinid+"'";
                    query.outFields = ["LinkURI","IrwinID"];
                    query.returnGeometry = false;
                    queryTask.execute(query, function(featureSet){
                        if (featureSet.features.length == 0 || !featureSet.features[0].attributes ||
                            !featureSet.features[0].attributes.LinkURI) {
                            tmpStr+= "<br/>No incident report found";
                        }
                        else {
                            tmpStr+="<br/><a href='" + featureSet.features[0].attributes.LinkURI + "' target='_blank'>Incident Report</a>";
                        }
                        tmpStr += "</div><br/>";
                        str += "<div><strong>" + tmpStr;
                        groupContent[identifyGroup] = str; // cache content
                        view.popup.content = str;
                        view.openPopup();
                        setIdentifyHeader();
                        setIdentifyFooter();
                        hideLoading("");
                    }, function (error){ 
                        alert("Error in javascript/identify.js/handleQueryResults/queryTask.execute, url="+queryLayer+". Where irwinID='"+irwinid+"'. Error message: "+error.message,"Code Error",error);
                    });
                });
                return;
            }*/
                                

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

            // Set info Content Header
            var str = "";//setIdentifyContentHeader(identifyGroup);
            var tmpStr;

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
                                                        //str += "<div onMouseOver='javascript:highlightFeature(\""+features.length+"\")' onMouseOut='javascript:removeHighlight()'><strong>"+tmpStr;
                                                        str += "<div><strong>" + tmpStr;
                                                        groupContent[identifyGroup] = str; // cache content
                                                        view.popup.content = str;
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
                                                        displayInfoWindow();
                                                    } else {
                                                        alert("Identify failed for call to " + url + ". Make sure it exists and does not have errors. Must be in the same directory as index.html or a lower directory. XMLHttpRequestObjects[" + arrIndex + "].status was " + XMLHttpRequestObjects[arrIndex].status, "Data Error");
                                                        processedDatabaseCalls = numDatabaseCalls;
                                                        displayInfoWindow();
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
                                                    displayInfoWindow();
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
                                    //str += "<div onMouseOver='javascript:highlightFeature(\""+features.length+"\")' onMouseOut='javascript:removeHighlight()'><strong>"+tmpStr;
                                    str += "<div><strong>" + tmpStr;
                                    groupContent[identifyGroup] = str; // cache content
                                    view.popup.content = str;
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
            displayInfoWindow();
        } catch (e) {
            alert(e.message + " in javascript/identify.js handleQueryResults().", "Code Error", e);
            hideLoading("");
        }
    //});
}

function highlightFeature(id) {
    require(["esri/graphic", "esri/layers/GraphicsLayer"],
        function(Graphic, GraphicsLayer) {
            var highlightSymbol;
            if (features[id].geometry.type === "polygon") {
                highlightSymbol = polySymbol;
            } else if (features[id].geometry.type === "point") {
                highlightSymbol = pointSymbol;
            } else if (features[id].geometry.type === "line") {
                highlightSymbol = lineSymbol;
            }
            var identifyGraphicsLayer = newGraphicsLayer();
            identifyGraphicsLayer.id = "identifygraphics";
            for (var i = 0; i < features.length; i++) {
                if (features[i].attributes.layerName == features[id].attributes.layerName)
                    identifyGraphicsLayer.add(new Graphic(features[id].geometry, highlightSymbol));
            }
            map.addLayer(identifyGraphicsLayer);
            identifyGraphicsLayer = null;
            highlightSymbol = null;
        });
}

function removeHighlight() {
    // remove old highlight
    if (map.getLayer("identifygraphics"))
        map.removeLayer(map.getLayer("identifygraphics"));
}

/*function setIdentifyContentHeader(name) {
     // tlb 6-8-18 Fix bug on ipad, info window not scrolling. Add <div style='height:100%;'>
    if (identifyLayers[name].desc) return "<div style='height:100%;'><div class='esriPopupItemTitle'>" + name + " found at map click:</div><br/><p style='font-style:italic;top:-15px;position:relative;'>" + identifyLayers[name].desc + "</p>";
    else
        return "<div style='height:100%;'><div class='esriPopupItemTitle'>" + name + " found at map click:</div><br/>";
}*/

function setIdentifyFooter() {
    // Set XY click info
    var h = document.getElementsByClassName("esri-popup__main-container")[0];
    if (!h) return;
    var contentNode = h.childNodes[0];
    //if ( document.getElementsByClassName("esri-feature__content-node")[0].parentNode.parentNode.parentNode.parentNode)
    //    contentNode = document.getElementsByClassName("esri-feature__content-node")[0].parentNode.parentNode.parentNode.parentNode;
    //else contentNode = document.getElementsByClassName("esri-feature__content-node")[0].parentNode.parentNode.parentNode;
    require(["esri/geometry/support/webMercatorUtils", "esri/geometry/SpatialReference", "esri/rest/support/ProjectParameters", "esri/rest/geometryService", "esri/request"],
        function(webMercatorUtils, SpatialReference, ProjectParameters, GeometryService, esriRequest) {
            try {
                var geoPt;
                var myPrj = document.getElementById("settings_xycoords_combo").value;

                var footer = document.getElementsByClassName("idFooter")[0];
                if (footer)
                    footer.remove();
                footer = document.createElement("div");
                footer.className = "idFooter";
                
                // Add XY location
                var point = document.createElement("div");
                if (myPrj === "dd") {
                    geoPt = webMercatorUtils.webMercatorToGeographic(clickPoint);
                    //dom.byId("identifyPoint").innerHTML = "Map clicked at (X/Y): " + geoPt.y.toFixed(5) + " N, " + geoPt.x.toFixed(5)+" W</br>&nbsp;&nbsp;&nbsp;&nbsp;Lat/Long Decimal Degrees";
                    //dom.byId("identifyPoint").innerHTML = "Lat Long: " + geoPt.y.toFixed(5) + " N, " + geoPt.x.toFixed(5) + " W";
                    point.innerHTML = "Lat Long: " + geoPt.y.toFixed(5) + " N, " + geoPt.x.toFixed(5) + " W";
                } else if (myPrj === "dms") {
                    geoPt = mappoint_to_dms(clickPoint, true);
                    //dom.byId("identifyPoint").innerHTML = "Map clicked at (X/Y): " + geoPt[0] + " N, " + geoPt[1]+" W</br>&nbsp;&nbsp;&nbsp;&nbsp;Lat/Long Degrees, Min, Sec";
                    //dom.byId("identifyPoint").innerHTML = "Lat Long: " + geoPt[0] + " N, " + geoPt[1] + " W";
                    point.innerHTML = "Lat Long: " + geoPt[0] + " N, " + geoPt[1] + " W";
                } else if (myPrj === "dm") {
                    geoPt = mappoint_to_dm(clickPoint, true);
                    //dom.byId("identifyPoint").innerHTML = "Map clicked at (X/Y): " + geoPt[0] + " N, " + geoPt[1]+" W</br>&nbsp;&nbsp;&nbsp;&nbsp;Lat/Long Degrees, Decimal Min";
                    //dom.byId("identifyPoint").innerHTML = "Lat Long: " + geoPt[0] + " N, " + geoPt[1] + " W";
                    point.innerHTML = "Lat Long: " + geoPt[0] + " N, " + geoPt[1] + " W";
                } else { // utm
                    var outSR = new SpatialReference(Number(myPrj));
                    // converts point to selected projection
                    var params = new ProjectParameters({
                        outSpatialReference: outSR,
                        geometries: [clickPoint]
                    });
                    GeometryService.project(geometryService,params).then( (feature) => {
                        var units;
                        if (outSR.wkid == 32612) units = "WGS84 UTM Zone 12N";
                        else if (outSR.wkid == 32613) units = "WGS84 UTM Zone 13N";
                        else if (outSR.wkid == 26912) units = "NAD83 UTM Zone 12N";
                        else if (outSR.wkid == 26913) units = "NAD83 UTM Zone 13N";
                        else if (outSR.wkid == 26712) units = "NAD27 UTM Zone 12N";
                        else if (outSR.wkid == 26713) units = "NAD27 UTM Zone 13N";
                        else units = "unknown units";
                        //dom.byId("identifyPoint").innerHTML = "Map clicked at (X/Y): " + feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0)+"</br>&nbsp;&nbsp;&nbsp;&nbsp;"+units;
                        //dom.byId("identifyPoint").innerHTML = units + ": " + feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0);
                        point.innerHTML = units + ": " + feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0);
                    }).catch ( (err) => {
                        if (err.details)
                            alert("Problem projecting point. " + err.message + " " + err.details[0], "Warning");
                        else
                            alert("Problem projecting point. " + err.message, "Warning");
                    });
                    footer.appendChild(point);
                }
                
                // display elevation
                // use our raster map service
                if (elevation_url) {  
                    var ext = '{"xmin":' + view.extent.xmin + ',"ymin":' + view.extent.ymin + ',"xmax":' + view.extent.xmax + ',"ymax":' + view.extent.ymax + ',"spatialReference":{"wkid":102100,"latestWkid":102100}}';
                    // find the index of the elevation action
                    /*var index=0;
                    for (var i=0; i<view.popup.actions.items.length; i++){
                        if (view.popup.actions.items[i].title.indexOf("Elevation")>-1){
                            index = i;
                            break;
                        }
                    }*/
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
                                //view.popup.actions.items[index].title = "Elevation: data not available";
                                elev.innerHTML = "Elevation: data not available";
                                footer.appendChild(elev);
                                return;
                            }
                            //view.popup.actions.items[index].title = "Elevation: " + Math.round(response.data.results[0].attributes["Pixel Value"]) + " ft " + Math.round(response.data.results[0].attributes["Pixel Value"] * 0.3048) + " m";
                            elev.innerHTML = "Elevation: " + Math.round(response.data.results[0].attributes["Pixel Value"]) + " ft " + Math.round(response.data.results[0].attributes["Pixel Value"] * 0.3048) + " m";
                            footer.appendChild(elev);
                        },
                        function(error) {
                            //view.popup.actions.items[index].title = "Elevation: data not available";
                            var footer = document.getElementsByClassName("idFooter")[0];
                            var elev = document.createElement("div");
                            elev.innerHTML = "Elevation: data not available";
                            footer.appendChild(elev);
                            hideLoading("");
                        }

                    );
                }
                contentNode.appendChild(footer);

            } catch (e) {
                alert(e.message + " in javascript/identify.js setIdentifyFooter().", "Code Error", e);
            }
        });
}

function changeIdentifyGroup(sel) {
    identifyGroup = sel.options[sel.selectedIndex].value;
    view.popup.content = "<p align='center'>Loading...</p>";
    //map.infoWindow.setContent("<p align='center'>Loading...</p>");

    features = [];
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    displayContent();
    //doIdentify(theEvt);
}

function displayInfoWindow() {
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
                view.popup.content = str;
                //map.infoWindow.setContent(str);
                groupContent[identifyGroup] = str; // cache content
                str = null;
            } else {
                str = "<div>No " + visible + identifyGroup + " at this point.<br/><br/></div>";
                view.popup.content = str;
                //map.infoWindow.setContent(str);
                groupContent[identifyGroup] = str; // cache content
                str = null;
            }
        }
        else {
            // tlb 6-8-18 added + "</div>" to the end of infowindow content for scrolling on ipad.
            // TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

           /* if (map.infoWindow._contentPane.innerHTML.indexOf("Loading") != -1){
                var str1 = map.infoWindow.map.infoWindow._contentPane.innerHTML+"</div>";
                map.infoWindow.setContent(str1);
            }*/
        }

        view.openPopup();
        setIdentifyHeader();
        setIdentifyFooter(); // Add Map Clicked at (X/Y) and elevation to footer
        hideLoading("");
    }
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

function getDirections(evt) {
    // Example of changeing link text			dom.byId("dirLink).innerHTML = "Calculating...";
    require(["esri/geometry/support/webMercatorUtils"], function(webMercatorUtils) {
        var geoPt = webMercatorUtils.webMercatorToGeographic(clickPoint);
        var url = "http://google.com/maps?output=classic&q=" + geoPt.y + "," + geoPt.x;
        window.open(url, "_blank");
    });
}

function zoomToPt() {
    var level = 5; //4-19-17 used to be 11, but I changed lods from 19 levels to 14. Changed the next line from "> 11" to "> 5" ;
    if (map.getLevel() > 5) level = map.getLevel();
    map.centerAndZoom(clickPoint, level);
}
//// End Identify Widget ////