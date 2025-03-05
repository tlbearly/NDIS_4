//***********
// Identify
//***********
//var identifyParams = null;
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
var groupContent = {}; // Cache the popup content for each group for a map click
// groupObj = [{
//  identifyGroup: tab name
//  title: popup title
//  content: popup content
//  highlightID: features id
//  features: [] of features at click point
// }]
var groupObj=[]; // Cache the popup content for each group for a map click. Array of objects for each identify tab that has been viewed. title, content, highlightID (features array id), features [], identifyGroup (tab name)
var highlightID = 0;
var theTitle = [];
var identifyLayerIds = []; // handles the identify tasks for each group. [GroupName][{url, layerIds, geometryType}]
var show_elevation = false;
var elevation_url = null;
var driving_directions = false;
var tooManyRequests = false;
var firstClick = false; // 4-1-22
var secondClick = false; // 4-1-22
var lastIdentifyTime=0; // 4-1-22
//"esri/rest/support/IdentifyParameters",
require(["esri/rest/identify"
], function(Identify) {
    //setup generic identify parameters
    //identifyParams = new IdentifyParameters();
    //identifyParams.returnGeometry = true;
    //identifyParams.layerOption = "all"; // top, visible, all, popup
   
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
    var settingsFile = app + "/SettingsWidget.xml?v=" + Date.now();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                //require(["dojo/dom", "dijit/registry", "dojo/query", "dojo/dom-construct", "dojo/on"], function(dom, registry, query, domConstruct, on) {
                    //var xmlDoc=xmlhttp.responseXML;
                    var xmlDoc = createXMLdoc(xmlhttp);

                    //---------------
                    // Read Globals
                    //---------------
                    // Load user saved XY projection
                    if (xmlDoc.getElementsByTagName("xy_projection")[0] && xmlDoc.getElementsByTagName("xy_projection")[0].childNodes[0] &&
                    (xmlDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue !== "dd" && xmlDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue !== "32613"))
                        alert("Error in "+app+"/SettingsWidget.xml file. Tag, xy_projection, must be 'dd' or '32613'.","Data Error");
                    var myPrj = getCookie("prj");
                    if (myPrj !== "")
                        settings = { "XYProjection": myPrj };
                    else{
                        if (xmlDoc.getElementsByTagName("xy_projection")[0].childNodes[0]) {
                            settings = { "XYProjection": xmlDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue };
                        }
                        else alert("Missing tag: xy_projection in "+app+"/SettingsWidget.xml", "Data Error");
                    }

                    // Map Link Not Used
                    /*use_map_link = xmlDoc.getElementsByTagName("use_map_link")[0] && xmlDoc.getElementsByTagName("use_map_link")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (use_map_link) {
                        document.getElementById("mapLinkBtn").style.display = "block";
                    }*/

                    // Get Extent Not Used
                    //use_get_extent = xmlDoc.getElementsByTagName("use_get_extent") && xmlDoc.getElementsByTagName("use_get_extent")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    //if (use_get_extent) document.getElementById("showExtentBtn").style.display = "block";

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
                        //if (gmu == "Big Game GMU")
                        //    showGMUCombo(settings.elkUrl, settings.elkField);
                        //else if (gmu == "Bighorn GMU")
                        //    showGMUCombo(settings.sheepUrl, settings.sheepField);
                        //else if (gmu == "Goat GMU")
                        //    showGMUCombo(settings.goatUrl, settings.goatField);
                    } else {
                        settings.useGMUs = false;
                    }

                    addSearch(); // adds help, search, and home button. Adds links to help.

                    driving_directions = xmlDoc.getElementsByTagName("driving_directions")[0] && xmlDoc.getElementsByTagName("driving_directions")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    /*if (driving_directions) {
                        // Add a link into the InfoWindow Actions panel
                        // Get Directions
                         view.popup.actions = [
                            {
                                id: "directions",
                                className: "esri-icon-directions2",
                                title: "Get Directions",

                            },
                            // input area point, buffered point, freehand polygon
                            {
                                id: "input-area",
                                className: "esri-icon-map-pin",
                                title: "Input Area"
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
                        
                        // Title to use for this group's identify title
                        if (folder[f].getAttribute("title_layer")) {
                            identifyLayers[identifyGroups[f]].titleLayer = folder[f].getAttribute("title_layer");
                            if (!folder[f].getAttribute("pre_title"))
                                alert("Error in " + app + "/SettingsWidget.xml. Missing pre_title in folder: " + identifyGroups[f] + ". <folder label='' pre_title='GMU Units ' layer-title='layer name to use as identify title'>", "Data Error");
                            else
                                identifyLayers[identifyGroups[f]].preTitle = folder[f].getAttribute("pre_title");
                        }
                        else
                            identifyLayers[identifyGroups[f]].titleLayer = null;

                        // Filed to use for this group's identify title
                        if (folder[f].getAttribute("title_field")) {
                            identifyLayers[identifyGroups[f]].titleField = folder[f].getAttribute("title_field");
                        }
                        else
                            identifyLayers[identifyGroups[f]].titleField = null;

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
                                // build array of unique buffer radius, id_vis_only, url, and geometry. These layers can be called all at once in identify. Query will need to call each layer indepently.
                                for (var j = 0; j < identifyLayerIds[identifyGroups[f]].length; j++) {
                                    // Buffer points and
                                    // Identify only visible layers. Each layer in this folder in SettingsWidget.xml must have a vis_id and vis_url tags
                                    if ((folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true") &&
                                        layer[i].getElementsByTagName("buffer")[0] !== undefined &&
                                        identifyLayerIds[identifyGroups[f]][j].buffer == parseFloat(layer[i].getElementsByTagName("buffer")[0].childNodes[0].nodeValue) &&  
                                        identifyLayerIds[identifyGroups[f]][j].url == layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].vis_url == layer[i].getElementsByTagName("vis_url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].geometry == layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase()) {
                                            identifyLayerIds[identifyGroups[f]][j].ids.push(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].vis_ids.push(layer[i].getElementsByTagName("vis_id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].labels.push(layer[i].getAttribute("label"));
                                            found = true;
                                    } 
                                    // Buffer points
                                    // Identify visible and hidden layers
                                    else if (layer[i].getElementsByTagName("buffer")[0] !== undefined &&
                                        identifyLayerIds[identifyGroups[f]][j].buffer == parseFloat(layer[i].getElementsByTagName("buffer")[0].childNodes[0].nodeValue) &&  
                                        identifyLayerIds[identifyGroups[f]][j].url == layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].geometry == layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase()) {
                                            identifyLayerIds[identifyGroups[f]][j].ids.push(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].labels.push(layer[i].getAttribute("label"));
                                            found = true;
                                    }
                                    // Do not buffer points and
                                    // Identify only visible layers. Each layer in this folder in SettingsWidget.xml must have a vis_id and vis_url tags
                                    else if (layer[i].getElementsByTagName("buffer")[0] === undefined && !identifyLayerIds[identifyGroups[f]][j].buffer &&
                                        (folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true") &&
                                        identifyLayerIds[identifyGroups[f]][j].url == layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].vis_url == layer[i].getElementsByTagName("vis_url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].geometry == layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase()) {
                                            identifyLayerIds[identifyGroups[f]][j].ids.push(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].vis_ids.push(layer[i].getElementsByTagName("vis_id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].labels.push(layer[i].getAttribute("label"));
                                            found = true;
                                    }
                                    // Do not buffer points
                                    // Identify visible and hidden layers
                                    else if (layer[i].getElementsByTagName("buffer")[0] === undefined && !identifyLayerIds[identifyGroups[f]][j].buffer &&
                                        identifyLayerIds[identifyGroups[f]][j].url == layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue &&
                                        identifyLayerIds[identifyGroups[f]][j].geometry == layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase()) {
                                            identifyLayerIds[identifyGroups[f]][j].ids.push(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue);
                                            identifyLayerIds[identifyGroups[f]][j].labels.push(layer[i].getAttribute("label"));
                                            found = true;
                                    } 
                                }
                            }
                            if (!found) {
                                // url was not found in list, add it. It had unique values for buffer, id_vis_only, url, and geometry
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

                                    // buffer point by x miles TODO***********************
                                    var buffer = null; // buffer distance around point
                                    if(layer[i].getElementsByTagName("buffer")[0] !== undefined)
                                        buffer = parseFloat(layer[i].getElementsByTagName("buffer")[0].innerHTML);

                                    identifyLayerIds[identifyGroups[f]].push({
                                        url: layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue,
                                        ids: new Array(layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue),
                                        geometry: layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue.toLowerCase(),
                                        id_vis_only: folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true" ? true : false,
                                        vis_url: vis_url,
                                        vis_ids: vis_ids,
                                        buffer: buffer,
                                        labels: [layer[i].getAttribute("label")]
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
                //});
            } catch (e) {
                alert("Error reading " + app + "/SettingsWidget.xml in javascript/identify.js readSettingsWidget(): " + e.message, "Data Error", e);
                hideLoading();
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
                hideLoading();
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
    helpWidget.open = false;
    showLoading();
    view.graphics.removeAll();//(view.graphics.items[view.graphics.items.length-1]); // remove last marker symbol
        
    if (typeof gtag === 'function')gtag('event','widget_click',{'widget_name': 'Identify'});

    // Called for each map click or identify group change
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    numHighlightFeatures = 0;
    features = [];
    theEvt = evt; // Save the click point so we can call this again from changeIdentifyGroup
    view.popup.title = "Identify";

    // Reset array of popupTemplate content for each group to null
    //if (groupContent["Way Point"]) delete groupContent["Way Point"]; // remove way point since we don't know if there is a way point here
    groupObj = [];
    for (var i = 0; i < identifyGroups.length; i++) {
        //groupContent[identifyGroups[i]] = null;
        theTitle[identifyGroups[i]] = null;
    }
    clickPoint = evt.mapPoint;

    displayContent();
}

/*function setIdentifyHeader() {
    // Set title drop down
    // Called by displayContent on empty content and handleQueryResults
    var h = document.getElementsByClassName("esri-popup__main-container")[0];
    if (!h || h.childNodes.length == 0) return;
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
}*/

function displayContent() {
    // Display cached content if available
    // Else loop through each layer found at the map click and call identifySuccess & handleQueryResults to handle each
    // Use cached content if available
    const obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
    if (obj.length > 0){
        view.popup.title = obj[0].title;
        displayInfoWindow(obj[0].content); // do we need featues of highlightID? pass obj
        removeHighlight();
        features = obj[0].features;
        highlightFeature(obj[0].highlightID,false);
        return;
    }

// 2/12/25 old way
    /*if (groupContent[identifyGroup]) {
        view.popup.title = theTitle[identifyGroup];
        displayInfoWindow(groupContent[identifyGroup]);
        return;
    }*/

    require(["esri/rest/support/IdentifyParameters", "esri/rest/identify", "esri/rest/query", "esri/rest/support/Query"], 
    function(IdentifyParameters, Identify, query, Query) {
        try{
            var skip = -1; // if id_vis_only and the top layer is hidden this will be true

            var deferreds = [];
            var showIncidents = false;
            for (var i = 0; i < identifyLayerIds[identifyGroup].length; i++) {
                var item = identifyLayerIds[identifyGroup][i];
                if (item) {
                    let identifyParams = new IdentifyParameters();
                    identifyParams.returnGeometry = true;
                    identifyParams.layerOption = "all"; // top, visible, all, popup
                    identifyParams.geometry = clickPoint; 
                    identifyParams.mapExtent = view.extent;
                    identifyParams.width = view.width;
                    identifyParams.height = view.height;

                    // 10-19-20 Add identify Wildfires
                    if (item.url.indexOf("Wildfire")>-1 || item.url.indexOf("WFIGS")>-1){
                        let params = new Query({
                            returnGeometry: true,
                            geometry: clickPoint,
                            spatialRelationship: "intersects",
                            outSpatialReference: map.spatialReference
                        });
                        if (!showIncidents && identifyLayers[identifyGroup]["Wildfire Incidents"] && identifyLayers[identifyGroup]["Wildfire Incidents"].url === item.url){
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
                            showIncidents = true;
                        }
                        else if (identifyLayers[identifyGroup]["Wildfire Perimeters"] && identifyLayers[identifyGroup]["Wildfire Perimeters"].url === item.url){
                            params.outFields = identifyLayers[identifyGroup]["Wildfire Perimeters"].fields;
                        }
                        else
                            alert("In SettingsWidget.xml tag Wildfire folder, must contain layers with the following names: Wildfire Incidents or Wildfire Perimeters.", "Data Error");
                        skip = true;
                        deferreds.push(new Promise((identifySuccess, handleQueryError) => {
                            query.executeQueryJSON(item.url, params) //.then(identifySuccess).catch(handleQueryError);
                            .then((response) => {
                                if (response.results)
                                    identifySuccess(response.results);
                                else
                                    identifySuccess(response);
                            })
                            .catch(handleQueryError);
                        }));
                        //deferreds.push(query.executeQueryJSON(item.url, params).then(identifySuccess).catch(handleQueryError));
                        continue;
                    }
                    if (item.buffer){
                        let params = new Query({
                            returnGeometry: true,
                            geometry: clickPoint,
                            spatialRelationship: "intersects",
                            outSpatialReference: map.spatialReference
                        });
                        for (var j=0; j<identifyLayerIds[identifyGroup][i].ids.length; j++){
                            params.outFields = identifyLayers[identifyGroup][identifyLayerIds[identifyGroup][i].labels[j]].fields;
                            params.distance = parseFloat(item.buffer);
                            params.units = "miles";
                            skip = true;
                            deferreds.push(new Promise((identifySuccess, handleQueryError) => {
                                query.executeQueryJSON(item.url+"/"+identifyLayerIds[identifyGroup][i].ids[j], params)
                                .then((response) => {
                                    if (response.results)
                                        identifySuccess(response.results);
                                    else
                                        identifySuccess(response);
                                })
                                .catch(handleQueryError);
                            }));
                        }
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
                        var elkID = parseInt(settings.elkUrl.slice(settings.elkUrl.lastIndexOf("/") +1));
                        var index = identifyParams.layerIds.indexOf(elkID);
                        if (index > -1) identifyParams.layerIds.splice(index, 1);
                    }
                    if (identifyParams.layerIds.length == 0) skip = true;
                    if (!skip){
                        deferreds.push(new Promise((identifySuccess, handleQueryError) => {
                            Identify.identify(url,identifyParams)
                            .then((response) => {
                                if (response.results)
                                    identifySuccess(response.results);
                                else
                                    identifySuccess(response);
                            })
                            .catch(handleQueryError);
                        }));
                        //deferreds.push(Identify.identify(url,identifyParams).then(identifySuccess).catch(handleQueryError)); // new 6-13-24
                    }     
                }
            }
            // Add goat and sheep gmus
            if (identifyGroup === "Hunter Resources") { // ***************** TODO which group is GMU in?????? GMU and Land Management") {
                if (gmu == "Bighorn GMU") {
                    let identifyParams = new IdentifyParameters();
                    identifyParams.returnGeometry = true;
                    identifyParams.layerOption = "all"; // top, visible, all, popup
                    identifyParams.geometry = clickPoint; 
                    identifyParams.mapExtent = view.extent;
                    identifyParams.width = view.width;
                    identifyParams.height = view.height;
                    identifyParams.tolerance = 1;
                    identifyParams.layerIds = [settings.sheepUrl.slice(settings.sheepUrl.lastIndexOf("/") + 1)];
                    deferreds.push(new Promise((identifySuccess, handleQueryError) => {
                        Identify.identify(settings.sheepUrl.slice(0, settings.sheepUrl.lastIndexOf("/") + 1),identifyParams)
                        .then((response) => {
                            if (response.results)
                                identifySuccess(response.results);
                            else
                                identifySuccess(response);
                        })
                        .catch(handleQueryError);
                    }));
                    //deferreds.push(Identify.identify(settings.sheepUrl.slice(0, settings.sheepUrl.lastIndexOf("/") + 1),identifyParams).then(identifySuccess).catch(handleQueryError));
                } else if (gmu == "Goat GMU") {
                    let identifyParams = new IdentifyParameters();
                    identifyParams.returnGeometry = true;
                    identifyParams.layerOption = "all"; // top, visible, all, popup
                    identifyParams.geometry = clickPoint; 
                    identifyParams.mapExtent = view.extent;
                    identifyParams.width = view.width;
                    identifyParams.height = view.height;
                    identifyParams.tolerance = 1;
                    identifyParams.layerIds = [settings.goatUrl.slice(settings.goatUrl.lastIndexOf("/") + 1)];
                    deferreds.push(new Promise((identifySuccess, handleQueryError) => {
                        Identify.identify(settings.goatUrl.slice(0, settings.goatUrl.lastIndexOf("/") + 1),identifyParams)
                        .then((response) => {
                            if (response.results)
                                identifySuccess(response.results);
                            else
                                identifySuccess(response);
                        })
                        .catch(handleQueryError);
                    }));
                    //deferreds.push(Identify.identify(settings.goatUrl.slice(0, settings.goatUrl.lastIndexOf("/") + 1),identifyParams).then(identifySuccess).catch(handleQueryError));
                }
            }

            if (deferreds && deferreds.length > 0) {
                Promise.all(deferreds).then((response) => {
                   handleQueryResults(response);
                  });
                //var dlist = all(deferreds);
                //dlist.then(handleQueryResults);
            } else {
                // display empty info popup
                numDatabaseCalls = 0;
                processedDatabaseCalls = 0;
                features = [];
                accumulateContent("");
            }
        } catch (e){
            alert("Problem trying to identify. Error message: "+e.message,"Warning");
			hideLoading();
        }
    });
}

/* moved to promise
function identifySuccess(response) {
    console.log("identifySuccess");
    if (response.results)
        return response.results;
    else return response; // for wildfire
}*/

// not used???????????????????
function handleQueryError(e) {
    if (e.message.indexOf("Too many requests") > -1) {
        tooManyRequests = true;
        return;
    }
    if (e.details)
        alert("Error in identify.js/doIdentify.  " + e.details + " " + e.message + " Check " + app + "/SettingsWidget.xml urls.", "Data Error");
    else
        alert("Error in identify.js/doIdentify.  " + e.message + " Check " + app + "/SettingsWidget.xml urls.", "Data Error");
    hideLoading();
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

            theTitle[identifyGroup] = identifyGroup;

            // Set info Content Header
            var tmpStr = "";
	        var str = "";
            highlightID = -1;
            // 10-19-20 Handle Wildfire
            if (identifyGroup.indexOf("Wildfire") > -1){
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
                        features.push(feature);
                        var layerName = "Wildfire Incidents";
                        if (feature.geometry.type === "polygon") layerName = "Wildfire Perimeters";
                        if (feature.attributes.IncidentName) {
                            str += "<h3 style='margin-bottom: 5px;margin-top: 5px;'>"+feature.attributes.IncidentName+"</h3><span class='idTitle'>"+layerName+"</span><div style='padding-left: 10px;'>";
                            // set the title, use the first wildfire
                            //if (theTitle[identifyGroup] === identifyGroup){
                            //    theTitle[identifyGroup] = feature.attributes.IncidentName;
                            //    view.popup.title = theTitle[identifyGroup];
                            //}
                            // set header with the layer specified in SettingsWidget.xml file or use first field value
                            if (theTitle[identifyGroup] == identifyGroup){
                                if (identifyLayers[identifyGroup].preTitle !== null && identifyLayers[identifyGroup].titleLayer !== null){
                                    if(r.layerName.indexOf(identifyLayers[identifyGroup].titleLayer) != -1){
                                        view.popup.title = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                        theTitle[identifyGroup] = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                        highlightFeature(features.length-1,false);
                                        highlightID = features.length-1;
                                    }
                                }else {
                                    theTitle[identifyGroup] = feature.attributes.IncidentName;
                                    highlightFeature(features.length-1,false);
                                    highlightID = features.length-1;
                                }
                                view.popup.title = theTitle[identifyGroup];
                            }
                        }
                        var d;
                        
                        // popup content
                        for (var i = 0; i < identifyLayers[identifyGroup][layerName].displaynames.length; i++) {
                            tmpStr = "";
                            if ((feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] &&
                                identifyLayers[identifyGroup][layerName].fields[i] !== "IncidentName" &&
                                identifyLayers[identifyGroup][layerName].fields[i].toLowerCase() !== "irwinid" &&
                                feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== " " &&
                                feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "Null" &&
                                feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "")) {
                                //https link (can't do substring on a number!)
                                if ((typeof feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "string") &&
                                    (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].substring(0, 4) == "http"))
                                    tmpStr = "<a href='" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "' class='idSubValue' target='_blank'>" + identifyLayers[identifyGroup][layerName].displaynames[i] + "</a><br/>";
                                else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("percent") > -1){
                                    tmpStr = "<span class='idSubTitle'>"+ identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "%</span><br/>";
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
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" +days+" "+dayStr+" "+hours+" "+hourStr+" ago</span><br/>";
                                        else
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" +days+" "+dayStr+" ago</span><br/>";
                                    } else if (hours >= 1){
                                        if (minutes >= 1)
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" +hours+" "+hourStr+" "+minutes+" "+minStr+" ago</span><br/>";
                                        else
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" +hours+" "+hourStr+" ago</span><br/>";
                                    } else
                                        tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>"+minutes+" "+minStr+" ago</span><br/>";
                                }
                                else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("date") > -1){
                                    d = new Date(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]);
                                    tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" + (d.getMonth()+1) + "/"+ d.getDate() +"/"+ d.getFullYear() +"</span><br/>";
                                }
                                else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("acre") > -1 ||
                                    identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("size") > -1 ||
                                    identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("final") > -1 ||
                                    identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("burned") > -1 ){
                                    if (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] >= 1)
                                        tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" + numberWithCommas(Math.round(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]])) + " Acres</span><br/>";
                                    else
                                        tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" + numberWithCommas(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(2)) + " Acres</span><br/>";
                                }
                                else {
                                    tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span id='idSubValue'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</span><br/>";
                                }
                            }
                        
                            // don't add it twice, but add it to the features geometry array
                            //if (tmpStr != "" && str.indexOf(tmpStr) == -1) {
                                // highlight polygon/point on mouse over, hide highlight on mouse out
                                //str += "<div onMouseOver='javascript:highlightFeature(\""+(features.length-1)+"\", true)' onMouseOut='javascript:removeHighlight()'><strong>"+tmpStr;
                                //str += "<div>" + tmpStr;
                                str += tmpStr;
                            //}
                        }
                        str += "</div><br/>";
                    });
                });
                if (numHighlightFeatures == 0){
                    highlightFeature(0,false);
                    highlightID = 0;
                }
                if (noData){
                    displayInfoWindow("No wildfires at this point.");
                    theTitle[identifyGroup] = "No Wildfires";
                    view.popup.title = "No Wildfires";
                    groupObj.push({
                        identifyGroup: identifyGroup,
                        title: theTitle[identifyGroup],
                        content: "No wildfires at this point.",
                        highlightID: -1,
                        features: []
                    });
                    //groupContent[identifyGroup] = "No wildfires at this point."; // cache 
                }else {
                    str += "<span class='idSubTitle'>Inciweb: </span><a href='https://inciweb.wildfire.gov/state/colorado' class='idSubValue' target='_blank'>https://inciweb.wildfire.gov/state/colorado</a><br/>";
                    groupObj.push({
                        identifyGroup: identifyGroup,
                        title: theTitle[identifyGroup],
                        content: str,
                        highlightID: highlightID,
                        features: features
                    });
                    //groupContent[identifyGroup] = str; // cache content
                    displayInfoWindow(str);
                }
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
            if (XMLHttpRequestObjects){
                while (XMLHttpRequestObjects.length > 0) {
                    XMLHttpRequestObjects.pop();
                }
            }

            // Write the content for the identify
            var countResults = -1;
            results.forEach(function(result) {
                countResults++; // to get result layerName for buffered points
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
                                                    tmpStr = "<span class='idTitle'>"+r.layerName + "</span><div style='padding-left: 10px;'>";

                                                    features.push(r.feature);
                                                    var xmlDoc = createXMLdoc(XMLHttpRequestObjects[arrIndex]);
                                                    
                                                    // set header with the layer specified in SettingsWidget.xml file or use first field value
                                                    if (theTitle[identifyGroup] == identifyGroup){
                                                        if (identifyLayers[identifyGroup].preTitle !== null && identifyLayers[identifyGroup].titleLayer !== null){
                                                            if(r.layerName.indexOf(identifyLayers[identifyGroup].titleLayer) != -1){
                                                                theTitle[identifyGroup] = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                                                highlightFeature(features.length-1,false);
                                                                highlightID = features.length-1;
                                                            }
                                                            // handle Bighorn and Goat GMU
                                                            else if (identifyLayers[identifyGroup].titleLayer.indexOf("GMU") != 1 && r.layerName.indexOf("GMU") != -1) theTitle[identifyGroup] = "GMU Unit "+r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                                        }else {
                                                            theTitle[identifyGroup] = r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                                        }
                                                    }
                                                    view.popup.title = theTitle[identifyGroup];
                                                    // set the popup title
                                                    //if (r.layerName.indexOf("GMU") != -1) theTitle[identifyGroup] = "GMU "+r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                                    //else theTitle[identifyGroup] = r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                                    //view.popup.title = theTitle[identifyGroup];
                                                    
                                                    for (i = 0; i < identifyLayers[identifyGroup][r.layerName].displaynames.length; i++) {
                                                        if ((i > 0 && r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] &&
                                                                r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== " " &&
                                                                r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== "Null" &&
                                                                r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] !== "")) {
                                                                if ((typeof r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] === "string") &&
                                                                    (r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].substring(0, 4) == "http"))
                                                                tmpStr += "<a href='" + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] + "' class='idSubValue' target='_blank'>" + identifyLayers[identifyGroup][r.layerName].displaynames[i] + "</a>";
                                                            else {
                                                                if ((r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].substring(0, 7) == "<a href") && (r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].indexOf("target") == -1))
                                                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][r.layerName].displaynames[i] + ":</span><span class='idSubValue'> " + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]].replace(">", " target='_blank'>")+"</span>";
                                                                else
                                                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][r.layerName].displaynames[i] + ":</span><span class='idSubValue'> " + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]]+"</span>";
                                                            }
                                                            tmpStr += "<br/>";
                                                        }
                                                        // add the database info at position specified
                                                        if (identifyLayers[identifyGroup][r.layerName].position == i) {
                                                            //features.push(r.feature);
                                                            // one2one_display: one2one_fields values
                                                            if (typeof identifyLayers[identifyGroup][r.layerName].one2one_fields != "undefined") {
                                                                for (j = 0; j < identifyLayers[identifyGroup][r.layerName].one2one_fields.length; j++) {
                                                                    if (xmlDoc.getElementsByTagName(identifyLayers[identifyGroup][r.layerName].one2one_fields[j]).length > 0) {
                                                                        var one2one_field = xmlDoc.getElementsByTagName(identifyLayers[identifyGroup][r.layerName].one2one_fields[j])[0];
                                                                        if ((one2one_field.getElementsByTagName("linkname").length > 0) && (one2one_field.getElementsByTagName("linkurl").length > 0)) {
                                                                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][r.layerName].one2one_display[j] + ": </span>";
                                                                            tmpStr += "<a href='" + one2one_field.getElementsByTagName("linkurl")[0].firstChild.nodeValue + "' class='idSubValue'>" + one2one_field.getElementsByTagName("linkname")[0].firstChild.nodeValue + "</a>";
                                                                            tmpStr += "<br/>";
                                                                        } else if (one2one_field.childNodes.length > 0) {
                                                                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][r.layerName].one2one_display[j] + ": </span>";
                                                                            tmpStr += "<span class='idSubValue'>"+one2one_field.childNodes[0].nodeValue+"</span>";
                                                                            tmpStr += "<br/>";
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            // one2many bulleted list
                                                            if (typeof identifyLayers[identifyGroup][r.layerName].one2many_fields != "undefined") {
                                                                for (j = 0; j < identifyLayers[identifyGroup][r.layerName].one2many_fields.length; j++) {
                                                                    var one2many = xmlDoc.getElementsByTagName(identifyLayers[identifyGroup][r.layerName].one2many_fields[j]);
                                                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][r.layerName].displaynames[0] + ":</span><ul style='margin-top: 0px; margin-bottom: 0px;'>";
                                                                    for (var h = 0; h < one2many.length; h++) {
                                                                        //if (typeof one2many[h].children[0] != "undefined" && one2many[h].children[0].nodeName == "linkname" && one2many[h].children[1].nodeName == "linkurl") {
                                                                        if ((one2many[h].getElementsByTagName("linkname").length > 0) && (one2many[h].getElementsByTagName("linkurl").length > 0)) {
                                                                            tmpStr += "<li><a href='" + one2many[h].getElementsByTagName("linkurl")[0].firstChild.nodeValue + "' class='idSubValue' target='_blank'>" + one2many[h].getElementsByTagName("linkname")[0].firstChild.nodeValue + "</a></li>";
                                                                        }
                                                                        // No html links, linkname and linkurl tags not used in returned XML
                                                                        else {
                                                                            tmpStr += "<li class='idSubValue'>" + one2many[h].childNodes[0].nodeValue + "</li>";
                                                                        }
                                                                    }
                                                                    tmpStr += "</ul style='margin-bottom: 0px; margin-top: 0px;'>";
                                                                }
                                                            }
                                                        }
                                                    }
                                                    processedDatabaseCalls++;
                                                    // don't add it twice, but add it to the features geometry array
                                                    if (str.indexOf(tmpStr) == -1) {
                                                        // highlight polygon/point on mouse over, hide highlight on mouse out
                                                        //str += "<div onMouseOver='javascript:highlightFeature(\""+(features.length-1)+"\",true)' onMouseOut='javascript:removeHighlight()'>"+tmpStr+"</div></div><br/>";
                                                        str += tmpStr+"</div><br/>";
                                                        //groupContent[identifyGroup] = str; // cache content
                                                    }
                                                    //features.push(r.feature);
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
                                                    // highlight first feature if none were specified by pre_title title title_field in SettingsWidget.xml file
                                                    //if (numHighlightFeatures == 0){
                                                    //    highlightFeature(0,true);
                                                    //}
                                                }
                                            }
                                        };
                                    }(index);
                                    XMLHttpRequestObjects[index].send();
                                } catch (error) {
                                    alert("Identify on " + r.layerName + " failed with error: " + error.message + " in javascript/identify.js handleQueryResults().", "Data Error");
                                    console.log(error.message);
                                    hideLoading();
                                }
                            }
                            // Layer without database call
                            else {
                                features.push(r.feature);
                                tmpStr = "<span class='idTitle'>"+ r.layerName + "</span><div style='padding-left: 10px;'>";
                                var first = true;
                                // set header with the layer specified in SettingsWidget.xml file or use first field value
                                if (theTitle[identifyGroup] == identifyGroup){
                                    if (identifyLayers[identifyGroup].preTitle !== null && identifyLayers[identifyGroup].titleLayer !== null){
                                        if(r.layerName.indexOf(identifyLayers[identifyGroup].titleLayer) != -1){
                                            theTitle[identifyGroup] = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                            highlightFeature(features.length-1,false);
                                            highlightID = features.length-1;
                                        }
                                        // handle Bighorn and Goat GMU
                                        else if (identifyLayers[identifyGroup].titleLayer.indexOf("GMU") != 1 && r.layerName.indexOf("GMU") != -1) theTitle[identifyGroup] = "GMU Unit "+r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                    }else {
                                        theTitle[identifyGroup] = r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[0]];
                                    }
                                }
                                view.popup.title = theTitle[identifyGroup];

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
                                            tmpStr += "<a href='" + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]] + "' class='idSubValue' target='_blank'>" + identifyLayers[identifyGroup][r.layerName].displaynames[i] + "</a>";
                                        else
                                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][r.layerName].displaynames[i] + ": </span><span class='idSubValue'>" + r.feature.attributes[identifyLayers[identifyGroup][r.layerName].fields[i]]+"</span>";
                                    }
                                }
                                // don't add it twice, but add it to the features geometry array
                                if (str.indexOf(tmpStr) == -1) {
                                    // highlight polygon/point on mouse over, hide highlight on mouse out
                                    // str += "<div onMouseOver='javascript:highlightFeature(\""+(features.length-1)+"\",true)' onMouseOut='javascript:removeHighlight()'>"+tmpStr+"</div></div><br/>";
                                    // needed if not using highlight
                                    str += tmpStr+"</div><br/>";
                                    //groupContent[identifyGroup] = str; // cache content
                                }
                                //features.push(r.feature);
                            }
                        }
                    });
                    groupObj.push({
                        identifyGroup: identifyGroup,
                        title: theTitle[identifyGroup],
                        content: str,
                        highlightID: highlightID,
                        features: features
                    });
                }
                // buffered point Query not Identify
                else if (result.features && result.features.length > 0) {
                    noData = false;
                    result.features.forEach(function(feature){
                        // Get distance from click point to feature
                        require(["esri/geometry/Point","esri/geometry/support/geodesicUtils"],
                            function (Point, geodesicUtils){
                            var pt2 = new Point(feature.geometry.x, feature.geometry.y, map.spatialReference);
                            const join = geodesicUtils.geodesicDistance
                            (
                                new Point({ x: clickPoint.longitude, y: clickPoint.latitude }),
                                new Point({ x: pt2.longitude, y: pt2.latitude }),
                                "miles"
                            );
                            const { distance, azimuth } = join;
                            console.log("Campground: "+feature.attributes['name']+" Distance: ", distance, ", Direction: ", azimuth);
                        });  
                        
                    });
                }
            });
            // highlight first feature if none were specified by pre_title title title_field in SettingsWidget.xml file
            if (numHighlightFeatures == 0){
                highlightFeature(0,true);
                highlightID = 0;
            }
            accumulateContent(str);
        } catch (e) {
            alert(e.message + " in javascript/identify.js handleQueryResults().", "Code Error", e);
            hideLoading();
        }
    //});
}

var numHighlightFeatures=0;
function highlightFeature(id,fade) {
    // highlight geometry on mouse over, no fade = true
    if (features[id] && features[id].geometry && (features[id].geometry != undefined && features[id].geometry.type)) {
        //if (features[id].geometry.type === undefined || !features[id].geometry.type) return;
        if (features[id].geometry.type === "point" ) {
            addHighlightPoint(features[id],fade);
            numHighlightFeatures++;
        }else if (features[id].geometry.type === "polygon" && view.scale <= 4000000) {
            addTempPolygon(features[id],fade);
            numHighlightFeatures++;
        } else if (features[id].geometry.type === "polyline") {
            addTempLine(features[id],fade);
            numHighlightFeatures++;
        }
    }

    // add marker pin at clickpoint
    require(["esri/Graphic"], function ( Graphic) {
        const symbol = {
            type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
            url: "./assets/images/pin.svg",
            width: 24,
            height: 24,
            xoffset: 0,
            yoffset: 8
        };
        let point = new Graphic({
            geometry: clickPoint,
            symbol: symbol
        });

        view.graphics.add(point);
        numHighlightFeatures++;
    });
}

function removeHighlight() {
    // remove old highlight  but don't remove pin at clickpoint
    for (var i=0; i<numHighlightFeatures; i++)
        view.graphics.remove(view.graphics.items[view.graphics.items.length-1]);
    numHighlightFeatures=0;
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
                    let idXY = document.getElementById("idXY");
                    if (idXY){
                        clearInterval(tim);
                        // set click point
                        projectPoint(clickPoint,idXY);
                        /*require(["esri/widgets/CoordinateConversion"],
                            function(CoordinateConversion){
                            const ccWidget = new CoordinateConversion({
                                view: view,
                                formats: ["xy","utm","dd","ddm","dms","basemap"],
                                currentLocation: clickPt,
                                container: "idXYlocation",
                                mode: "capture",
                                multipleConversions: false
                            });
                        
                        });*/

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
                                        elev.innerHTML = "<span class='idTitle'>Elevation:</span> data not available";
                                        return;
                                    }
                                    elev.innerHTML = "<span class='idTitle'>Elevation:</span> " + Math.round(response.data.results[0].attributes["Pixel Value"]) + " ft, " + Math.round(response.data.results[0].attributes["Pixel Value"] * 0.3048) + " m";
                                },
                                function(error) {
                                    var elev = getElementById("idElevation");
                                    elev.innerHTML = "<span class='idTitle'>Elevation:</span> data not available";
                                    hideLoading();
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
    removeHighlight();
    identifyGroup = sel.innerText;
    view.popup.content = "<p align='center'>Loading...</p>";
    view.popupEnabled = false;
    features = [];
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    displayContent();
}

function accumulateContent(theContent){
    if (numDatabaseCalls == processedDatabaseCalls) {
        numDatabaseCalls = 0;
        processedDatabaseCalls = 0;

        // No info found, just display XY coordinates
        if (features.length == 0) {
            var str;
            var visible = "";
            const obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
            if (identifyLayerIds[identifyGroup][0].id_vis_only) visible = "visible "; // 1-10-18 add word visible if identifying visible only
            if (identifyLayers[identifyGroup].desc) {
                str = "<div><p style='font-style:italic;top:-15px;position:relative;'>" + identifyLayers[identifyGroup].desc + "</p>No " + visible + identifyGroup + " at this point.<br/></div>";
                theContent = str;
                // cache content
                groupObj.push({
                    identifyGroup: identifyGroup,
                    title: "No "+theTitle[identifyGroup],
                    content: str,
                    highlightID: -1,
                    features: []
                });
                //groupContent[identifyGroup] = str; // cache content
                theTitle[identifyGroup] = "No "+identifyGroup;
                view.popup.title = "No "+identifyGroup;
                str = null;
            } else {
                str = "<div>No " + visible + identifyGroup + " at this point.<br/></div>";
                theContent = str;
                // cache content
                groupObj.push({
                    identifyGroup: identifyGroup,
                    title:  "No "+ theTitle[identifyGroup],
                    content: str,
                    highlightID: -1,
                    features: []
                });
                //groupContent[identifyGroup] = str; // cache content
                theTitle[identifyGroup] = "No "+identifyGroup;
                view.popup.title = "No "+identifyGroup;
                str = null;
            }
        }
        displayInfoWindow(theContent);
    }
}

function setPrj(){
    setIdentifyFooter(clickPoint);
    settings.XYProjection=document.getElementById("idxycoords").value;
    setCookie("prj",document.getElementById("idxycoords").value);
}
function customStuff(theContent){
    // add a drop down list and footer to the popup content
    const outerDiv = document.createElement("calcite-tabs");
    //outerDiv.style.marginLeft = "-12px";
    //outerDiv.style.marginRight = "-12px";
 
    /*var content = "<div style='padding:12px;'><strong>Show:</strong> <select id='id_group' name='id_group' style='margin:5px;color:black;' onChange='changeIdentifyGroup(this)'>";
    for (var i = 0; i < identifyGroups.length; i++) {
        content += "<option";
        if (identifyGroup == identifyGroups[i]) content += " selected";
        content+= ">" + identifyGroups[i] + "</option>";
    }
    content += "</select></div>";*/
    
    var content = '<calcite-tab-nav slot="title-group">';// style="position:fixed;background-color:white;height:50px;width:444px;margin-top:-12px;padding:10px;">';
    var i,j;
    for (i = 0; i < identifyGroups.length; i++) {
        content += '<calcite-tab-title onclick="changeIdentifyGroup(this)"';
        if (identifyGroup == identifyGroups[i]) content += " selected";
        content+= ">" + identifyGroups[i] + '</calcite-tab-title>'
    }
    content += "</calcite-tab-nav>";

    // content
    for (i = 0; i < identifyGroups.length; i++) {
        content += "<calcite-tab";
        if (identifyGroup == identifyGroups[i]){
            content += " select='true'>";// style='margin-top:30px;'>";// style='overflow:auto;'>";
            content += "<div style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'>"+theContent+"</div>";
            // XY point
            content += "<div style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'><calcite-icon aria-hidden='true' icon='pin-tear-f' scale='m' style='color:var(--press);vertical-align:middle;'></calcite-icon> <span class='idTitle'>Location:</span> <input type='text' value='Loading XY...' id='idXY' disabled='true'> <a href=\"javascript:copyText('idXY')\" style='font-weight:bold;margin-left:0;padding-left:0;font-size:1.1em;text-decoration:none;color:var(--press)'><calcite-icon aria-hidden='true' icon='copy' scale='m' style='vertical-align:middle;margin-right: 5px;'></calcite-icon></a> <span id='copyNote'></span>";
            content += '<div id="xycoordsDialog" title="Change Display Format" style="margin-left:25px;margin-top:10px;">';
            content += '    <label for="idxycoords" class="idSubValue">Format: </label><select id="idxycoords" size="1" onChange="setPrj()">';
            // XY point format
            //const xyValue=["mercator","dd","dms","dm","32612","32613","26912","26913","26712","26713"];
            //const xyDisplay=["WGS84 Web Mercator","Decimal Degrees","Degrees, Minutes, Seconds","Degrees, Minutes","WGS84 UTM Zone 12N","WGS84 UTM Zone 13N","NAD83 UTM Zone 12N","NAD83 UTM Zone 13N","NAD27 UTM Zone 12N","NAD27 UTM Zone 13N"];
            const xyValue=["dd","32613"];
            const xyDisplay=["Decimal Degrees","WGS 84/UTM zone 13N"];

            for (j=0; j<xyValue.length;j++){
                content += '        <option value="'+xyValue[j]+'"';
                if (settings.XYProjection === xyValue[j])content += ' selected="selected"';
                content += '>'+xyDisplay[j]+'</option>';
            }
            content += '    </select>';
            content += '</div></div>';
            content += "<div id='idXYlocation'></div>";
            
            // Elevation
            content += "<div style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'><calcite-icon aria-hidden='true' icon='altitude' scale='l' style='color:var(--press);vertical-align:middle;'></calcite-icon> <span id='idElevation'>Loading elevation...</span></div>"
            // Zoom To
            content += "<div style='padding:12px;'><a href='javascript:zoomToPt()' style='float:left;margin-right:20px;'><calcite-icon aria-hidden='true' icon='magnifying-glass-plus' scale='s' style='color:var(--press);vertical-align:middle;margin-right: 5px;'></calcite-icon><span style='color:var(--press)'> Zoom To</span></a> ";
            // Get Directions
            if (driving_directions){
                content += "<a href='javascript:getDirections()' style='float:left;'><span aria-hidden='true' class='esri-features__icon esri-icon-directions2' style='color:var(--press);vertical-align:middle;margin-right: 5px;'></span><span style='color:var(--press)'> Get Directions</span></a></div>";
            }
        } else {
            content += "><div style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'></div>"; //overflow:auto;
        }

        content += "</calcite-tab>";
    }
    //content += "</calcite-tabs>";


    // footer
    //content += "<div style='padding:0;margin:0;border:none;'>";
    //content += "<div style='height:fit-content;padding:5px 12px 5px;'>";
    
    
    outerDiv.innerHTML = content;
    return outerDiv;
}
function displayInfoWindow(theContent) {
    // open popup and set content to string theContent
    view.popup.content = customStuff(theContent);
    
    view.openPopup();
    if (view.popup){
        view.popup.when(() => {
            document.getElementsByClassName("esri-popup__main-container")[0].style.marginTop = "90px"; // place below title and search
        // document.getElementsByClassName("esri-popup__main-container")[0].getElementsByClassName("esri-features__container")[0].style.overflow="hidden"; // remove double scroll bar
        });
    }
    // wait for popup to populate header then add drop down
    /*var h = document.getElementsByClassName("esri-popup__main-container")[0];
    if (!h || h.childNodes.length == 0) {
        var tim = setInterval(function(){
            if (h && h.childNodes.length != 0) {
                clearInterval(tim);
                setIdentifyHeader();
            }
        },500);
    }
    else setIdentifyHeader();*/
    view.popup.viewModel.location = clickPoint;
    setIdentifyFooter(clickPoint); // add xy point and elevation to footer
    hideLoading();
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
                    hideLoading();
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
        				hideLoading();
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
        				hideLoading();
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
    var level = 100000;
    if (view.scale < level) level = view.scale; // don't zoom out!!!
    // zoom to point
    view.goTo({
        target: view.popup.viewModel.location,
        scale: level
    });
}

function getInputArea(){
    alert("Set Input Area point | buffered point | freehand");
}
//// End Identify Widget ////