//***********
// Identify
//***********
//var identifyParams = null;
var identify = null;
var tasks;
var clickPoint;
var promiseNumber = 0;
var thePromises = [];
var features = []; // number of features found
var numDatabaseCalls = 0;
var processedDatabaseCalls = 0;
var folder = [];
var identifyGroup;
var theEvt;
var identifyGroups = [];
var identifyLayers = {};
//var groupContent = {}; // Cache the popup content for each group for a map click
var groupObj=[]; // Cache the popup content for each group for a map click. Array of objects for each identify tab that has been viewed. title, content, highlightID (features array id), features [], identifyGroup (tab name)
//var highlightID = 0;
var theTitle = [];
var identifyLayerIds = []; // handles the identify tasks for each group. [GroupName][{url, layerIds, geometryType}]
var show_elevation = false;
var elevation_url = null;
var driving_directions = false;
var tooManyRequests = false;
var firstClick = false; // 4-1-22
var secondClick = false; // 4-1-22
var lastIdentifyTime=0; // 4-1-22
var alllayers=null; // layers that has a minscale or maxscale set. Used to identify a layer if it is visible
//"esri/rest/support/IdentifyParameters",
require(["esri/rest/identify"
], function(Identify) {
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


function closeIdentify(){
    view.graphics.removeAll();
    document.getElementById("identifyPopup").style.display = "none";
}

function readIdentifyWidget() {
    // Read the IdentifyWidget.xml file
    var xmlhttp = createXMLhttpRequest();
    var settingsFile = app + "/IdentifyWidget.xml?v=" + Date.now();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                    var xmlIDDoc = createXMLdoc(xmlhttp);

                    //---------------
                    // Read Globals
                    //---------------
                    // Load user saved XY projection
                    if (xmlIDDoc.getElementsByTagName("xy_projection")[0] && xmlIDDoc.getElementsByTagName("xy_projection")[0].childNodes[0] &&
                    (xmlIDDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue !== "dd" && xmlIDDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue !== "32613"))
                        alert("Error in "+app+"/IdentifyWidget.xml file. Tag, xy_projection, must be 'dd' or '32613'.","Data Error");
                    var myPrj = getCookie("prj");
                    if (myPrj !== "" && (myPrj === "dd" || myPrj === "32613"))
                        settings = { "XYProjection": myPrj };
                    else{
                        if (xmlIDDoc.getElementsByTagName("xy_projection")[0].childNodes[0]) {
                            settings = { "XYProjection": xmlIDDoc.getElementsByTagName("xy_projection")[0].childNodes[0].nodeValue };
                        }
                        else alert("Missing tag: xy_projection in "+app+"/IdentifyWidget.xml", "Data Error");
                    }

                    // Map Link Not Used
                    /*use_map_link = xmlIDDoc.getElementsByTagName("use_map_link")[0] && xmlIDDoc.getElementsByTagName("use_map_link")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (use_map_link) {
                        document.getElementById("mapLinkBtn").style.display = "block";
                    }*/

                    // Get Extent Not Used
                    //use_get_extent = xmlIDDoc.getElementsByTagName("use_get_extent") && xmlIDDoc.getElementsByTagName("use_get_extent")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    //if (use_get_extent) document.getElementById("showExtentBtn").style.display = "block";

                    var use_gmus = xmlIDDoc.getElementsByTagName("use_gmus")[0] && xmlIDDoc.getElementsByTagName("use_gmus")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
                    if (use_gmus) {
                        settings.useGMUs = true;
                        if (!xmlIDDoc.getElementsByTagName("gmu_url")[0])
                            alert("Missing tag: gmu_url in " + app + "/IdentifyWidget.xml", "Data Error");
                        else
                            settings.elkUrl = xmlIDDoc.getElementsByTagName("gmu_url")[0].childNodes[0].nodeValue;
                        if (!xmlIDDoc.getElementsByTagName("gmu_field")[0])
                            alert("Missing tag: gmu_field in " + app + "/IdentifyWidget.xml", "Data Error");
                        else
                            settings.elkField = xmlIDDoc.getElementsByTagName("gmu_field")[0].childNodes[0].nodeValue;
                        if (!xmlIDDoc.getElementsByTagName("sheep_gmu_url")[0])
                            alert("Missing tag: sheep_gmu_url in " + app + "/IdentifyWidget.xml", "Data Error");
                        else
                            settings.sheepUrl = xmlIDDoc.getElementsByTagName("sheep_gmu_url")[0].childNodes[0].nodeValue;
                        if (!xmlIDDoc.getElementsByTagName("sheep_gmu_field")[0])
                            alert("Missing tag: sheep_gmu_field in " + app + "/IdentifyWidget.xml", "Data Error");
                        else
                            settings.sheepField = xmlIDDoc.getElementsByTagName("sheep_gmu_field")[0].childNodes[0].nodeValue;
                        if (!xmlIDDoc.getElementsByTagName("goat_gmu_url")[0])
                            alert("Missing tag: goat_gmu_url in " + app + "/IdentifyWidget.xml", "Data Error");
                        else
                            settings.goatUrl = xmlIDDoc.getElementsByTagName("goat_gmu_url")[0].childNodes[0].nodeValue;
                        if (!xmlIDDoc.getElementsByTagName("goat_gmu_field")[0])
                            alert("Missing tag: goat_gmu_field in " + app + "/IdentifyWidget.xml", "Data Error");
                        else
                            settings.goatField = xmlIDDoc.getElementsByTagName("goat_gmu_field")[0].childNodes[0].nodeValue;
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

                    driving_directions = xmlIDDoc.getElementsByTagName("driving_directions")[0] && xmlIDDoc.getElementsByTagName("driving_directions")[0].childNodes[0].nodeValue == "true" ? 1 : 0;
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

                    if (xmlIDDoc.getElementsByTagName("elevation")[0] && xmlIDDoc.getElementsByTagName("elevation")[0].firstChild.nodeValue)
                        show_elevation = xmlIDDoc.getElementsByTagName("elevation")[0].firstChild.nodeValue == "true" ? 1 : 0;
                    if (show_elevation && xmlIDDoc.getElementsByTagName("elevation_url")[0]) {
                        if (xmlIDDoc.getElementsByTagName("elevation_url")[0].firstChild.nodeValue)
                            elevation_url = xmlIDDoc.getElementsByTagName("elevation_url")[0].firstChild.nodeValue;
                        else alert("Missing elevation_url tag in IdentifyWidget.xml.", "Data Error");
                    /*    view.popup.actions.push( 
                            {
                                id: "elevation",
                                className: "esri-icon-elevation",
                                title: "Elevation: loading..."
                            }
                        );*/
                    }
                    // Read the Identify Groups from the folder tags
                    folder = xmlIDDoc.getElementsByTagName("folder");
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
                                alert("Error in " + app + "/IdentifyWidget.xml. Missing pre_title in folder: " + identifyGroups[f] + ". <folder label='' pre_title='GMU Number ' layer-title='layer name to use as identify title'>", "Data Error");
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
                                alert("Error in " + app + "/IdentifyWidget.xml. Missing label in folder: " + identifyGroups[f] + ".", "Data Error");
                            else
                                label = layer[i].getAttribute("label");

                            // Make sure vis_url and vis_id are set if id_vis_only is true
                            if (folder[f].getAttribute("id_vis_only") && folder[f].getAttribute("id_vis_only").toLowerCase() == "true") {
                                if (!layer[i].getElementsByTagName("vis_url")[0] || !layer[i].getElementsByTagName("vis_id")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. When vis_id_only is set in a folder, every layer in the folder must have a vis_id and vis_url tag for the layer that is in the map to check if it is visible or not. Missing vis_url and vis_id tags in folder: " + identifyGroups[f] + ".", "Data Error");
                            }
                            identifyLayers[identifyGroups[f]][label] = {};
                            // label to display, if display_label attribute is not found use label
                            if (layer[i].getAttribute("display_label")) 
                                identifyLayers[identifyGroups[f]][label].display_label = layer[i].getAttribute("display_label");
                            else identifyLayers[identifyGroups[f]][label].display_label = label;

                            // Create list of ids for this layer
                            var found = false;
                            if (!layer[i].getElementsByTagName("url")[0] || !layer[i].getElementsByTagName("id")[0])
                                alert("Error in " + app + "/IdentifyWidget.xml. Missing url or id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                            else {
                                // build array of unique buffer radius, id_vis_only, url, and geometry. These layers can be called all at once in identify. Query will need to call each layer indepently.
                                for (var j = 0; j < identifyLayerIds[identifyGroups[f]].length; j++) {
                                    // Buffer points and
                                    // Identify only visible layers. Each layer in this folder in IdentifyWidget.xml must have a vis_id and vis_url tags
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
                                    // Identify only visible layers. Each layer in this folder in IdentifyWidget.xml must have a vis_id and vis_url tags
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
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing url or id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
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
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing url in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].url = layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("id")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].id = layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("geometry")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing geometry in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].geometry = layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("fields")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing fields in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].fields = layer[i].getElementsByTagName("fields")[0].childNodes[0].nodeValue.split(",");
                                if (!layer[i].getElementsByTagName("displaynames")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing displaynames in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].displaynames = layer[i].getElementsByTagName("displaynames")[0].childNodes[0].nodeValue.split(",");
                                if (layer[i].getElementsByTagName("position")[0])
                                    identifyLayers[identifyGroups[f]][label].position = layer[i].getElementsByTagName("position")[0].childNodes[0].nodeValue;
                                else
                                    identifyLayers[identifyGroups[f]][label].position = 0;
                                if (!layer[i].getElementsByTagName("database")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing database in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].database = layer[i].getElementsByTagName("database")[0].childNodes[0].nodeValue;

                                if (!layer[i].getElementsByTagName("filename")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing filename in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
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
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing url in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].url = layer[i].getElementsByTagName("url")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("id")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing id in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].id = layer[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("geometry")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing geometry in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].geometry = layer[i].getElementsByTagName("geometry")[0].childNodes[0].nodeValue;
                                if (!layer[i].getElementsByTagName("fields")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing fields in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].fields = layer[i].getElementsByTagName("fields")[0].childNodes[0].nodeValue.split(",");
                                if (!layer[i].getElementsByTagName("displaynames")[0])
                                    alert("Error in " + app + "/IdentifyWidget.xml. Missing displaynames in folder: " + identifyGroups[f] + " for layer: " + label + ".", "Data Error");
                                else
                                    identifyLayers[identifyGroups[f]][label].displaynames = layer[i].getElementsByTagName("displaynames")[0].childNodes[0].nodeValue.split(",");

                                // Add ability to identify sheep and goat GMUs. 4-18-18 change label to Big Game GMU Boundaries for use with AssetReport_Data mapservice
	                              if (label == "Big Game GMU") {
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"] = {};
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].display_label = "Bighorn GMU";
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].url = settings.sheepUrl.slice(0, settings.sheepUrl.length - 2);
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].id = settings.sheepUrl.substring(settings.sheepUrl.lastIndexOf("/")+1);
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].geometry = "polygon";
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].fields = [settings.sheepField];
                                    identifyLayers[identifyGroups[f]]["Bighorn GMU"].displaynames = ["GMU Number"];
                                    identifyLayers[identifyGroups[f]]["Goat GMU"] = {};
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].display_label = "Goat GMU";
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].url = settings.goatUrl.slice(0, settings.goatUrl.length - 2);
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].id = settings.goatUrl.substring(settings.goatUrl.lastIndexOf("/")+1);
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].geometry = "polygon";
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].fields = [settings.goatField];
                                    identifyLayers[identifyGroups[f]]["Goat GMU"].displaynames = ["GMU Number"];
                                }
                            }
                        }
                    }

                    // Call draw init here since it needs the XYprojection value which was read from user cookie or IdentifyWidget.xml
 // TODO drawing widget
 //                 drawInit();
                //});
            } catch (e) {
                alert("Error reading " + app + "/IdentifyWidget.xml in javascript/identify.js readSettingsWidget(): " + e.message, "Data Error", e);
                hideLoading();
            }
        }
        // if missing file
        else if (xmlhttp.status === 404) {
            alert("Error: Missing " + app + "/IdentifyWidget.xml file.", "Data Error");
            hideLoading();
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 500) {
            alert("Error reading " + app + "/IdentifyWidget.xml.", "Code Error");
            hideLoading();
        }
    };
    xmlhttp.open("GET", settingsFile, true);
    xmlhttp.send();
}

function doIdentify(evt){
    //helpWidget.open = false;
    if (drawing)return;
    closeHelp();
    showLoading();
    view.graphics.removeAll();//all in closeIdentify() //(view.graphics.items[view.graphics.items.length-1]); // remove last marker symbol
        
    if (typeof gtag === 'function')gtag('event','widget_click',{'widget_name': 'Identify'});

    // Called for each map click or identify group change
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    numHighlightFeatures = 0;
    features = [];
    thePromises = [];
    //highlightID = -1;
    theEvt = evt; // Save the click point so we can call this again from changeIdentifyGroup

    // Reset array of popupTemplate content for each group to null
    //if (groupContent["Way Point"]) delete groupContent["Way Point"]; // remove way point since we don't know if there is a way point here
    groupObj = [];
    for (var i = 0; i < identifyGroups.length; i++) {
        //groupContent[identifyGroups[i]] = null;
        theTitle[identifyGroups[i]] = null;
    }
    clickPoint = evt.mapPoint;
    addClickPoint();
    theTitle[identifyGroup] = identifyGroup;
    //view.popup.title = identifyGroup;
    document.getElementById("identifyTitle").innerHTML = identifyGroup;

    displayContent();
}

function isMapLayerInIdentify(url,id){
    // check if this url is an identify visible only layer
    for (var i=0; i<identifyGroups.length; i++){
        for (var j=0; j<identifyLayerIds[identifyGroups[i]].length;j++){
            // debug
            //if (identifyLayerIds[identifyGroups[i]][j].vis_url !== null) {
            //    console.log (identifyLayerIds[identifyGroups[i]][j].vis_url+" =? "+url +" id="+id+ " > -1 "+ identifyLayerIds[identifyGroups[i]][j].vis_ids.indexOf(id.toString()));
            //}
            if (identifyLayerIds[identifyGroups[i]][j].vis_url !== null && (identifyLayerIds[identifyGroups[i]][j].vis_url.indexOf(url) > -1 ||
                url.indexOf(identifyLayerIds[identifyGroups[i]][j].vis_url) > -1)
                && identifyLayerIds[identifyGroups[i]][j].vis_ids.indexOf(id.toString()) > -1){
                //console.log("true");
                return true;
            }
            else if (url === identifyLayerIds[identifyGroups[i]][j].url){
                //console.log("false");
                return false;
            }
        }
    }
    return false;
}
function displayContent() {
    // Display cached content if available
    // Else loop through each layer found at the map click and call accumulate & handleQueryResults to handle each
    // Use cached content if available
    const obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
    if (obj.length > 0){
        //view.popup.title = obj[0].title;
        document.getElementById("identifyTitle").innerHTML = obj[0].title;
        displayInfoWindow(obj[0].content.replace(/ style=\"display:none;\"/g,"")); // make data visible
        removeHighlight();
        features = obj[0].features;
        // add each highlight
        for (var i=0; i<features.length; i++)
            highlightFeature(i,false);
        return;
    }

    require(["esri/rest/support/IdentifyParameters", "esri/rest/identify", "esri/rest/query", "esri/rest/support/Query"], 
    function(IdentifyParameters, Identify, query, Query) {
        try{
            var skip = false; // if id_vis_only and the top layer is hidden this will be true

            //var deferreds = [];
            var i;
            // create thePromise array of promise numbers. Used to see if there was no data found in accumulateData
            var count = promiseNumber+1;
            for (i=0;i < identifyLayerIds[identifyGroup].length; i++) {
                thePromises.push(count);
                count++;
            }

            if (alllayers == null){
                alllayers = [];
                // Get array of all layers that have a minscale or maxscale set -- MOVE THIS TO TOP only do once
                for (var k=0; k<map.layers.items.length; k++){
                    var items=null;
                    if (map.layers.items[k].sublayers) items = map.layers.items[k].sublayers.items;
                    else if (map.layers.items[k].layers !== undefined) items = map.layers.items[k].layers.items;
                    if (items){
                        for(var m=0; m<items.length; m++){
                            var items2=null;
                            if(items[m].layers !== undefined) items2 = items[m].layers.items;
                            else if (items[m].sublayers) items2 = items[m].sublayers.items;
                            if (items2){
                                for(var n=0; n<items2.length; n++){
                                    var items3=null;
                                    if(items2[n].layers !== undefined) items3 = items2[n].layers.items;
                                    else if( items2[n].sublayers) items3 = items2[n].sublayers.items;
                                    if (items3){
                                        for(var p=0; p<items3.length; p++){
                                            if(items3[p].layers !== undefined || items3[p].sublayers){
                                                //alert("Need to add code to identify.js line 490 to check for visible layers to identify.");
                                                //console.log("Identify visible only layers is ignoring "+items3[p].title+" Need to add code to identify.js line 490 to check for visible layers to identify.");
                                            }else{
                                                //console.log(items3[p].title);
                                                if (items3[p].url.toLowerCase().indexOf("featureserver") > -1){
                                                    if (items3[p].url !== undefined && items3[p].url !== null && isMapLayerInIdentify(items3[p].url,items3[p].layerId)){
                                                        if (items3[p].minScale == 0 && items3[p].parent.parent.minScale != 0){
                                                            //console.log ("set minScale of "+items3[p].title+" "+items3[p].minScale+" to minScale of "+items3[p].parent.parent.title+" "+items3[p].parent.parent.minScale);
                                                            items3[p].minScale = items3[p].parent.parent.minScale;
                                                        }
                                                        alllayers.push(items3[p]);
                                                    }
                                                }else{
                                                    if (items3[p].url !== undefined && items3[p].url !== null && isMapLayerInIdentify(items3[p].url,items3[p].id)){
                                                        if (items3[p].minScale == 0 && items3[p].parent.parent.minScale != 0){
                                                            console.log ("set minScale of "+items3[p].title+" "+items3[p].minScale+" to minScale of "+items3[p].parent.parent.title+" "+items3[p].parent.parent.minScale);
                                                            items3[p].minScale = items3[p].parent.parent.minScale;
                                                        }
                                                        alllayers.push(items3[p]);
                                                    }
                                                }
                                            }
                                        }      
                                    }else{
                                        //console.log(items2[n].title);
                                        if (items2[n].url.toLowerCase().indexOf("featureserver") > -1){
                                            if (items2[n].url !== undefined && items2[n].url !== null && isMapLayerInIdentify(items2[n].url,items2[n].layerId)){
                                                if (items2[n].minScale == 0 && items2[n].parent.minScale != 0){
                                                    //console.log ("set minScale of "+items2[n].title+" "+items2[n].minScale+" to minScale of "+items2[n].parent.title+" "+items2[n].parent.minScale);
                                                    items2[n].minScale = items2[n].parent.minScale;
                                                }
                                                alllayers.push(items2[n]);
                                            }
                                        }else{
                                            if (items2[n].url !== undefined && items2[n].url !== null && isMapLayerInIdentify(items2[n].url,items2[n].id)){
                                                if (items2[n].minScale == 0 && items2[n].parent.minScale != 0){
                                                    //console.log ("set minScale of "+items2[n].title+" "+items2[n].minScale+" to minScale of "+items2[n].parent.title+" "+items2[n].parent.minScale);
                                                    items2[n].minScale = items2[n].parent.minScale;
                                                }
                                                alllayers.push(items2[n]);
                                            }
                                        }
                                    }
                                }
                            }else{
                                //console.log(items[m].title);
                                if (items[m].url.toLowerCase().indexOf("featureserver") > -1){
                                    if (items[m].url !== undefined && items[m].url !== null && isMapLayerInIdentify(items[m].url,items[m].layerId))
                                        alllayers.push(items[m]);
                                }else{
                                    if (items[m].url !== undefined && items[m].url !== null && isMapLayerInIdentify(items[m].url,items[m].id))
                                        alllayers.push(items[m]);
                                }
                            }
                        }
                    }else{
                        //console.log(map.layers.items[k].title);
                        if (map.layers.items[k].url !== undefined && map.layers.items[k].url !== null && isMapLayerInIdentify(map.layers.items[k].url))
                            alllayers.push(map.layers.items[k]);
                    }
                }
            }

            // Loop through each layer in this identifyGroup folder and call handleQueryResults to write result to identifyPopup div
            for (i = 0; i < identifyLayerIds[identifyGroup].length; i++) {
                var item = identifyLayerIds[identifyGroup][i];
                if (item) {

                    // Show only visible items for identifyGroup when id_vis_only="true" in IdentifyWidget.xml
                    // NOTE: IdentifyParameters option LAYER_OPTION_VISIBLE is supposed to do this but is not working 1-9-18
                    skip = false;
                    var url;
                    if (item.id_vis_only) {
                       // identifyParams.layerOption = "visible"; // this is not working so get visible layers manually and set identifyParams.layerIds ????????????????
                        url = item.vis_url;
                        // trim off last /
                        if (item.vis_url[item.vis_url.length - 1] === "/") 
                            url = item.vis_url.substr(0, item.vis_url.length - 1);
                        
                        //var vis_layers = [];
                        //identifyParams.layerIds = item.vis_ids.slice(); // get list of ids used in the map
                        // Loop through each top layer in the TOC that is visible at this scale
                        for(k=0; k<alllayers.length; k++) {
                            // check if id of this layer matches
                            if (alllayers[k].type === "feature"){
                                if (item.vis_ids.indexOf(alllayers[k].layerId.toString()) == -1)
                                    continue;
                            }else if (item.vis_ids.indexOf(alllayers[k].id.toString()) == -1)
                                continue;
                            // check if url matches
                            if (alllayers[k].url && (alllayers[k].url.toLowerCase().indexOf(url.toLowerCase()) > -1 ||
                                url.toLowerCase().indexOf(alllayers[k].url.toLowerCase()) > -1)) {
                                // check if not visible and not visible at this scale
                                if (alllayers[k].visible == false || (alllayers[k].visible === true &&
                                    ((alllayers[k].minScale != 0 && alllayers[k].minScale < view.scale) ||
                                    (alllayers[k].maxScale != 0 && alllayers[k].maxScale > view.scale)))) {
                                    skip = true;
                                    thePromises.pop();// remove the last promise number from the promises array. Used to show no data.
                                    break;
                                }

                                /*if (layer.visible == true) {
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
                                }*/
                            }
                        } // for each layer
                        
                    } else {
                        //skip = false;
                        url = item.url;
                    }
                    if (skip) continue;



                    

                    // Query FeatureServer - Identify does not work
                    if (item.url.toLowerCase().indexOf("featureserver") > -1){
                        for (var j=0; j<item.labels.length; j++){ 
                            let params = new Query({
                                returnGeometry: true,
                                geometry: clickPoint,
                                spatialRelationship: "intersects",
                                outSpatialReference: map.spatialReference
                            });
                            if (item.buffer) params.distance = parseFloat(item.buffer);
                            else if (item.geometry === "line"){
                                // 10k
                                if (view.scale <= 9028)
                                    params.distance = 50;
                                // 24k
                                else if (view.scale <= 36112)
                                    params.distance = 50;
                                // 50k
                                else if (view.scale <= 72224)
                                    params.distance = 100;
                                // 100k
                                else if (view.scale <= 144448)
                                    params.distance = 300;
                                // > 100k
                                else 
                                    params.distance = 1;
                                params.units = "meters";
                            } else if (item.geometry === "point"){
                                // 24k
                                if (view.scale <= 36112)
                                    params.distance = 0.2;
                                // 50k
                                else if (view.scale <= 72224)
                                    params.distance = 0.3;
                                // 100k
                                else if (view.scale <= 144448)
                                    params.distance = 0.75;
                                // 500k
                                else if (view.scale <= 577791)
                                    params.distance = 1;
                                // 2m
                                else if (view.scale <= 2311162)
                                    params.distance = 4;
                                else
                                    params.distance = 10;
                                params.units = "miles";
                            } else {
                                params.distance = 1;
                                params.units = "meters";
                            }

                            // limit query by expression
                            if (item.url.indexOf("CPWAdminData")>0 && item.url.indexOf(15)>-1){
                                params.where = "type<>'Road'";
                            }

                            const theLayerName = item.labels[j];
                            params.outFields = identifyLayers[identifyGroup][item.labels[j]].fields;
                            skip = true;
                            promiseNumber++;
                            const thePromise = promiseNumber;
                            // console.log("Query "+theLayerName+" loading  - promise #"+thePromise+" distance="+params.distance);
                            // first time add div with promise number
                            //accumulateContent(thePromise,"<div id='promise"+thePromise+"' style='display:none;'><span class='idTitle'>"+theLayerName+"</span><div style='padding: 0 0 20px 10px;'><calcite-icon class='waitingForConnection' title='Loading' aria-hidden='true' icon='offline' scale='m' calcite-hydrated='' style='margin-right: 5px;'></calcite-icon><span style='vertical-align:text-top;'>Loading...</span></div></div>");
                            accumulateContent(thePromise,"<div id='promise"+thePromise+"' style='display:none;'><span class='idTitle'>"+identifyLayers[identifyGroup][[theLayerName]].display_label+"</span><div style='padding: 0 0 20px 10px;'><calcite-icon class='waitingForConnection' title='Loading' aria-hidden='true' icon='offline' scale='m' calcite-hydrated='' style='margin-right: 5px;'></calcite-icon><span style='vertical-align:text-top;'>Loading...</span></div></div>");
                            
                            query.executeQueryJSON(item.url, params) //.then(identifySuccess).catch(handleQueryError);
                            .then((response) => {
                                // console.log("Query "+theLayerName+" response - promise #"+thePromise);
                                if (response.results) {
                                    response.results.layerName = theLayerName;
                                    handleQueryResults(response.results,thePromise);
                                }
                                else{                                        
                                    response.layerName = theLayerName;
                                    handleQueryResults(response,thePromise);
                                }
                            })
                            .catch((e) => {
                                //console.log("Query "+theLayerName+" failed   - promise #"+thePromise+ " error="+e.message);
                                if (e.message === "Cannot perform query. Invalid query parameters."){
                                    err = e.message;
                                    if (e.details.url) err += " URL="+e.details.url;
                                    if (e.details.requestOptions.query.outFields) err += " outFields="+e.details.requestOptions.query.outFields;
                                    //accumulateContent(thePromise,"<span class='idSubValue'>"+theLayerName+"</span><div style='padding:0 0 20px 10px;'><span class='idSubTitle'>Import failed: </span><span class='idSubTitle'>"+err+"</span><br/></div>");
                                    accumulateContent(thePromise,"<span class='idSubValue'>"+identifyLayers[identifyGroup][[theLayerName]].display_label+"</span><div style='padding:0 0 20px 10px;'><span class='idSubTitle'>Import failed: </span><span class='idSubTitle'>"+err+"</span><br/></div>");
                                }else {
                                    //accumulateContent(thePromise,"<span class='idTitle'>"+theLayerName+"</span><div style='padding:0 0 20px 10px;'><span class='idSubTitle'>Import failed: </span><span class='idSubTitle'>External map service is unavailable.</span><br/></div>");
                                    accumulateContent(thePromise,"<span class='idTitle'>"+identifyLayers[identifyGroup][[theLayerName]].display_label+"</span><div style='padding:0 0 20px 10px;'><span class='idSubTitle'>Import failed: </span><span class='idSubTitle'>External map service is unavailable.</span><br/></div>");
                                }
                            });
                        }
                        continue;
                    }


                    // 10-19-20 Add identify Wildfires
                    /*
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
                            alert("In IdentifyWidget.xml tag Wildfire folder, must contain layers with the following names: Wildfire Incidents or Wildfire Perimeters.", "Data Error");
                        skip = true;
                        deferreds.push(new Promise((identifySuccess, handleQueryError) => {
                            query.executeQueryJSON(item.url, params) //.then(identifySuccess).catch(handleQueryError);
                            .then((response) => {
                                if (response.results)
                                    identifySuccess(response.results);
                                else
                                    identifySuccess(response);
                            })
                            .catch((e) => {
                                myhandleQueryError(e);
                            });
                        }));
                        //deferreds.push(query.executeQueryJSON(item.url, params).then(identifySuccess).catch(handleQueryError));
                        continue;
                    }*/

                    let identifyParams = new IdentifyParameters();
                    identifyParams.returnGeometry = true;
                    identifyParams.layerOption = "all"; // top, visible, all, popup
                    identifyParams.geometry = clickPoint; 
                    identifyParams.mapExtent = view.extent;
                    identifyParams.width = view.width;
                    identifyParams.height = view.height;                
                    identifyParams.layerIds = item.ids.slice(); // make a copy of this array since we change it for bighorn or goat gmu
                    if (item.buffer) identifyParams.tolerance = item.buffer;
                    else if (item.geometry === "point") {
                        // Used to be 15,10,5
                        // 24k
                        if (view.scale <= 36113)
                            identifyParams.tolerance = 25;
                        // 50, 100, 250k
                        else if (view.scale <= 288896)
                            identifyParams.tolerance = 25;
                        // 500k
                        else if (view.scale <= 577791)
                            identifyParams.tolerance = 15;
                        else
                            identifyParams.tolerance = 1;
                    } else if (item.geometry === "line") {
                        // Used to be 15,10,5
                        if (view.scale <= 36113)
                            identifyParams.tolerance = 30;
                        // 50k
                        else if (view.scale <= 72224)
                            identifyParams.tolerance = 15;
                        // 100k, 250k
                        else if (view.scale <= 288896)
                            identifyParams.tolerance = 10;
                        else if (view.scale <= 577791)
                            identifyParams.tolerance = 4;
                        else
                            identifyParams.tolerance = 1;
                    } else
                        identifyParams.tolerance = 1;

                    // Show only visible items for identifyGroup when id_vis_only="true" in IdentifyWidget.xml
                    // NOTE: IdentifyParameters option LAYER_OPTION_VISIBLE is supposed to do this but is not working 1-9-18
                    /*var url;
                    if (item.id_vis_only) {
                        identifyParams.layerOption = "visible"; // this is not working so get visible layers manually and set identifyParams.layerIds ????????????????
                        url = item.vis_url;
                        // trim off last /
                        if (item.vis_url[item.vis_url.length - 1] === "/") url = item.vis_url.substr(0, item.vis_url.length - 1);
                        skip = false;


                        // Get array of all layers
                        var layers=[];
                        for (var k=0; k<map.layers.items.length; k++){
                            if (map.layers.items[k].layers !== undefined){
                                for(var m=0; m<map.layers.items[k].layers.items.length; m++){
                                    if(map.layers.items[k].layers.items[m].layers !== undefined){
                                        for(var n=0; n<map.layers.items[k].layers.items[m].length; n++){
                                            if(map.layers.items[k].layers.items[m].layers.items[n].layers !== undefined){
                                                alert("Need to add code to identify.js line 659 to check for visible layers to identify.");
                                            }else{
                                                layers.push(map.layers.items[k].layers.items[m].layers.items[n]);
                                            }
                                        }
                                    }else{
                                        layers.push(map.layers.items[k].layers.items[m]);
                                    }
                                }
                            }else
                                layers.push(map.layers.items[k]);
                        }
                        
                        //var layers = map.getLayersVisibleAtScale(map.getScale());
                        var vis_layers = [];
                        identifyParams.layerIds = item.vis_ids.slice(); // get list of ids used in the map
                        // Loop through each top layer in the TOC that is visible at this scale
                        layers.forEach(function(layer) {
                            if (layer.url && layer.url.toLowerCase() == url.toLowerCase()) {
                               // if (layer.url === url && layer.visible == false) skip = true;

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
                        
                    } else {
                        skip = false;
                        url = item.url;
                    }*/

                    var url = item.url;
                    // Remove Big Game GMU if this is identifying Bighorn or Goat GMU
                    // TODO maybe make bighorn and goat show all the time when big game is showing?
                    if (settings.elkUrl && item.url == settings.elkUrl.slice(0, settings.elkUrl.lastIndexOf("/") + 1) && gmu != "Big Game GMU") {
                        // Find the index to the layerId for Big Game GMU and remove it from the layer ids.
                        var elkID = parseInt(settings.elkUrl.slice(settings.elkUrl.lastIndexOf("/") +1));
                        var index = identifyParams.layerIds.indexOf(elkID);
                        if (index > -1) {
                            identifyParams.layerIds.splice(index, 1);
                            if (gmu == "Bighorn GMU") {
                                identifyParams.layerIds.push(parseInt(settings.sheepUrl.slice(settings.sheepUrl.lastIndexOf("/") + 1)));
                            }
                            else if (gmu == "Goat GMU") {
                                identifyParams.layerIds.push(parseInt(settings.goatUrl.slice(settings.goatUrl.lastIndexOf("/") + 1)));
                            }
                        }
                    }
                    if (identifyParams.layerIds.length == 0) skip = true;
                    if (!skip){
                        promiseNumber++;
                        const thePromise=promiseNumber;
                        const theLayerNames = item.labels;
                        // first time add div with promise number
                        var str = "<div id='promise"+thePromise+"' style='display:none;'>";
                        for (var k=0;k<theLayerNames.length;k++){
                            // console.log("Identify "+theLayerNames[k]+" loading  - promise #"+thePromise+" tolerance="+identifyParams.tolerance);    
                            str += "<span class='idTitle'>"+theLayerNames[k]+"</span><div style='padding: 0 0 20px 10px;'><calcite-icon class='waitingForConnection' title='Loading' aria-hidden='true' icon='offline' scale='m' calcite-hydrated='' style='margin-right: 5px;'></calcite-icon><span style='vertical-align:text-top;'>Loading...</span></div>";
                        }
                        str += "</div>";
                        accumulateContent(thePromise,str);
                        Identify.identify(url,identifyParams)
                        .then((response) => {
                            //for (var k=0;k<theLayerNames.length;k++)
                            // console.log("Identify "+theLayerNames[k]+" response - promise #"+thePromise+" tolerance="+identifyParams.tolerance);
                            if (response.results){
                                handleQueryResults(response.results,thePromise);
                            }
                            else{
                                handleQueryResults(response,thePromise);
                            }
                        })
                        .catch((e) => {
                            var str = ""; //"<div id='promise"+thePromise+"'>";
                            if (e.message === "Cannot perform query. Invalid query parameters."){
                                str += "<span class='idTitle'>";
                                for (var k=0;k<theLayerNames.length;k++){
                                    if (k>0)
                                        str += ", "+theLayerNames[k];
                                    else str += theLayerNames[k];
                                }
                                str += "</span><div style='padding: 0 0 20px 10px;'><span class='idSubTitle'>Import failed:  </span><span class='idSubTitle'>Cannot perform query. Invalid query parameters.</span><br/></div></div>";
                            }else {
                                for (var k=0;k<theLayerNames.length;k++){
                                    //console.log("Identify "+theLayerNames[k]+" failed  - promise #"+thePromise+" tolerance="+identifyParams.tolerance+" Error="+e.message);

                                    str += "<span class='idTitle'>"+theLayerNames[k]+"</span><div style='padding: 0 0 20px 10px;'><span class='idSubTitle'>Import failed: </span><span class='idSubTitle'>External map service is unavailable.</span><br/></div></div>";
                                }
                            }
                            accumulateContent(thePromise,str);                                
                        });
                    }     
                }
            }

           if (thePromises.length == 0){
                numDatabaseCalls = 0;
                processedDatabaseCalls = 0;
                features = [];
                theTitle[identifyGroup] = "No "+identifyGroup;
                document.getElementById("identifyTitle").innerHTML="No "+identifyGroup;
                accumulateContent(-1,"No visible "+identifyGroup+" at this point.");
           }
        } catch (e){
            alert("Problem trying to identify. Error message: "+e.message,"Warning");
			hideLoading();
        }
    });
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function handleQueryResults(results,thePromise) {
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

            //theTitle[identifyGroup] = identifyGroup;

            // Set info Content Header
            var tmpStr = "";
	        var str = "";
            //highlightID = -1;
            // 10-19-20 Handle Wildfire
            if (identifyGroup.indexOf("Wildfire") > -1){
                //for (var r=0; r<results.length; r++){
                    if (!results.features) tooManyRequests=true;
                //}
                if (tooManyRequests) {
                    displayInfoWindow("<p>Too many people are requesting this data. Please try again.</p>");
                    tooManyRequests = false;
                    return;
                }
                else tooManyRequests = false;

                if (results.layerName === "Wildfire Incidents") 
                    str = "The wildfire map layers are maintained and imported on demand from ESRI's USA Current Wildfires layer. They present the best-known point and perimeter locations of wildfire occurrences within the United States over the past 7 days from IRWIN and NIFC information.<br/><br/>";
                // add each attribute to str
                //if (results.forEach){
                //    results.forEach(function(result) {
                    if (results.features && results.features.length > 0) {
                        //if (result.features.length > 0) noData = false;
                        results.features.forEach(function(feature){
                            var r = results;
                            features.push(feature);
                            highlightFeature(features.length-1,false);
                            var layerName = "Wildfire Incidents";
                            if (feature.geometry.type === "polygon") layerName = "Wildfire Perimeters";
                            if (feature.attributes.IncidentName) {
                                str += "<h3 style='margin-bottom: 5px;margin-top: 5px;'>"+feature.attributes.IncidentName+"</h3><span class='idTitle'>"+layerName+"</span><div style='padding-left: 10px;'>";
                                // set the title, use the first wildfire
                                //if (theTitle[identifyGroup] === identifyGroup){
                                //    theTitle[identifyGroup] = feature.attributes.IncidentName;
                                //    view.popup.title = theTitle[identifyGroup];
                                //}
                                // set header with the layer specified in IdentifyWidget.xml file with preTitle, titleField or identifyGroup as title
                                if (theTitle[identifyGroup] === identifyGroup){
                                    if (identifyLayers[identifyGroup].preTitle !== null && identifyLayers[identifyGroup].titleLayer !== null){
                                        if(r.layerName.indexOf(identifyLayers[identifyGroup].titleLayer) != -1){
                                            //view.popup.title = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                            document.getElementById("identifyTitle").innerHTML = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                            theTitle[identifyGroup] = identifyLayers[identifyGroup].preTitle+r.feature.attributes[identifyLayers[identifyGroup].titleField];
                                            //highlightFeature(features.length-1,false);
                                            //highlightID = features.length-1;
                                            // update groupObj title (cached tab)
                                            let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
                                            if (obj.length != 0){
                                                obj[0].title = theTitle[identifyGroup];
                                            }
                                        }
                                    }else {
                                        theTitle[identifyGroup] = feature.attributes.IncidentName;
                                        //highlightFeature(features.length-1,false);
                                        //highlightID = features.length-1;
                                    }
                                    //view.popup.title = theTitle[identifyGroup];
                                    document.getElementById("identifyTitle").innerHTML = theTitle[identifyGroup];
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
                                        (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].substring(0, 4) === "http"))
                                        tmpStr = "<a href='" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "' class='idSubValue' target='_blank'>" + identifyLayers[identifyGroup][layerName].displaynames[i] + "</a><br/>";
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("percent") > -1){
                                        tmpStr = "<span class='idSubTitle'>"+ identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "%</span><br/>";
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
                                                tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +days+" "+dayStr+" "+hours+" "+hourStr+" ago</span><br/>";
                                            else
                                                tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +days+" "+dayStr+" ago</span><br/>";
                                        } else if (hours >= 1){
                                            if (minutes >= 1)
                                                tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +hours+" "+hourStr+" "+minutes+" "+minStr+" ago</span><br/>";
                                            else
                                                tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +hours+" "+hourStr+" ago</span><br/>";
                                        } else
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>"+minutes+" "+minStr+" ago</span><br/>";
                                    }
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("date") > -1){
                                        d = new Date(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]);
                                        tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + (d.getMonth()+1) + "/"+ d.getDate() +"/"+ d.getFullYear() +"</span><br/>";
                                    }
                                    else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("acre") > -1 ||
                                        identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("size") > -1 ||
                                        identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("final") > -1 ||
                                        identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("burned") > -1 ){
                                        if (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] >= 1)
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + numberWithCommas(Math.round(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]])) + " Acres</span><br/>";
                                        else
                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + numberWithCommas(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(2)) + " Acres</span><br/>";
                                    }
                                    else {
                                        tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</span><br/>";
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
                        //});
                    });
                
                    //if (numHighlightFeatures == 0){
                    //    highlightFeature(0,false);
                    //    highlightID = 0;
                    //}
                    // add a link to data source
                    if (results.layerName == "Wildfire Incidents") {
                        str += "<span class='idSubTitle'>Inciweb: </span><a href='https://inciweb.wildfire.gov/state/colorado' class='idSubValue' target='_blank'>https://inciweb.wildfire.gov/state/colorado</a><br/>";
                    }
                }
                else if (results && results.layerName == "Wildfire Incidents"){
                    str = "No wildfire incidents at this point.";
                    theTitle[identifyGroup] = "No Wildfires";
                    document.getElementById("identifyTitle").innerHTML = "No Wildfires";
                    //view.popup.title = "No Wildfires";
                    
                    let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
                    if (obj.length === 0){
                        // cache content
                        groupObj.push({
                            identifyGroup: identifyGroup,
                            title: "No Wildfires",
                            content: str,
                            //highlightID: -1,
                            features: [],
                            promises: [] // array of promise numbers for this tab
                        });
                    } else {
                        obj[0].title = "No Wildfires";
                        obj[0].content = str;
                    }
                }
                
                accumulateContent(thePromise,str);
                return;
            }

            /*if (results.forEach === undefined){
                str += "No results for "+identifyGroup; // TODO add layer name
                accumulateContent(thePromise,str);
                return;
            }*/
            // Count database calls
            if (results.length && results.length > 0){
                results.forEach(function(result) {
                    //if (result && result.length > 0) {
                    //    result.forEach(function(r) {
                            if (typeof identifyLayers[identifyGroup][result.layerName] != 'undefined')
                                if (typeof identifyLayers[identifyGroup][result.layerName].database != 'undefined') numDatabaseCalls++;
                        //});
                    //}
                });
            }else {
                if (typeof identifyLayers[identifyGroup][results.layerName] != 'undefined')
                    if (typeof identifyLayers[identifyGroup][results.layerName].database != 'undefined') numDatabaseCalls++;
            }

            // Clear old database call info
            // move to writeFeatureContent()
            /*xmlIndex = 0;
            if (XMLHttpRequestObjects){
                while (XMLHttpRequestObjects.length > 0) {
                    XMLHttpRequestObjects.pop();
                }
            }*/

            // Write the content for the identify
            var countResults = -1;
            //results.forEach(function(result) {
                //countResults++; // to get result layerName for buffered points
                if (results.length && results.length > 0) {
                    results.forEach(function(r) {
                        var tmpStr = writeFeatureContent(r.feature,r.layerName,thePromise);
                        if (str.indexOf(tmpStr) == -1 && tmpStr !== undefined && tmpStr !== "undefined") 
                            str += tmpStr;
                    });
                }
                // Feature Server uses Query not Identify
                else if (results.features) {
                    noData = false;
                    const theLayerName = results.layerName;
                    results.features.forEach(function(feature){
                        var tmpStr = writeFeatureContent(feature,theLayerName,thePromise);
                        if (str.indexOf(tmpStr) == -1 && tmpStr !== undefined && tmpStr !== "undefined") 
                            str += tmpStr;
                    });
                }
            //});
            // add error messages
            if (tooManyRequests) {
                str+= "<br/><p>Too many people are requesting this data. Please try again.</p>";
            }
            // highlight first feature if none were specified by pre_title title title_field in IdentifyWidget.xml file
            /*if (numHighlightFeatures == 0){
                highlightFeature(0,false);
                highlightID = 0;
            }
            // preTitle and title used in config.xml but geometry was not clicked on. For example Goat GMU clicked outside gmu polygon
            else if (numHighlightFeatures == -1 && highlightID == -1){
                highlightFeature(-1,false);
                //highlightID = -1;
            }*/
            // If it has database calls, str will be undefined. writeFeatureContent will call accumulateContent.
            if (tmpStr !== undefined && tmpStr !== "undefined")
                accumulateContent(thePromise,str);
        } catch (e) {
            alert(e.message + " in javascript/identify.js handleQueryResults().", "Code Error", e);
            hideLoading();
        }
    //});
}

function writeFeatureContent(feature,layerName,thePromise){
    // Return a string with the feature attributes
    // Highlight the features
    var str = "";
    var tmpStr = "";
    feature.attributes.layerName = layerName;

    if (typeof identifyLayers[identifyGroup][layerName] != 'undefined') {
        // Layer with database call
        if (typeof identifyLayers[identifyGroup][layerName].database != 'undefined') {
            try {
                createMultiXMLhttpRequest();
                var url = app + "/" + identifyLayers[identifyGroup][layerName].database + "?v=" + ndisVer + "&key=" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                XMLHttpRequestObjects[xmlIndex].open("GET", url, true); // configure object (method, url, async)
                // register a function to run when the state changes, if the request
                // has finished and the stats code is 200 (OK) write result
                XMLHttpRequestObjects[xmlIndex].onreadystatechange = function(arrIndex) {
                    return function() {
                        if (XMLHttpRequestObjects[arrIndex].readyState == 4) {
                            if (XMLHttpRequestObjects[arrIndex].status == 200) {
                                //tmpStr = "<span class='idTitle'>"+layerName + "</span><div style='padding-left: 10px;'>";
                                tmpStr = "<span class='idTitle'>"+identifyLayers[identifyGroup][[layerName]].display_label + "</span><div style='padding-left: 10px;'>";

                                features.push(feature);
                                // highlight all features (polygons are turned off)
                                highlightFeature(features.length-1,false);
                                var xmlDBDoc = createXMLdoc(XMLHttpRequestObjects[arrIndex]);
                                
                                // set header with the layer specified in IdentifyWidget.xml file or use first field value
                                if (theTitle[identifyGroup] == identifyGroup){
                                    if (identifyLayers[identifyGroup].preTitle !== null && identifyLayers[identifyGroup].titleLayer !== null){
                                        if(layerName.indexOf(identifyLayers[identifyGroup].titleLayer) != -1){
                                            theTitle[identifyGroup] = identifyLayers[identifyGroup].preTitle+feature.attributes[identifyLayers[identifyGroup].titleField];
                                            //highlightFeature(features.length-1,false);
                                            //highlightID = features.length-1;
                                            // update groupObj title (cached tab)
                                            let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
                                            if (obj.length != 0){
                                                obj[0].title = theTitle[identifyGroup];
                                            }
                                        }
                                        // handle Bighorn and Goat GMU
                                        else if (identifyLayers[identifyGroup].titleLayer.indexOf("GMU") != 1 && layerName.indexOf("GMU") != -1) {
                                            theTitle[identifyGroup] = layerName+" Number "+feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                                            //highlightFeature(features.length-1,false);
                                            //highlightID = features.length-1;
                                            // update groupObj title (cached tab)
                                            let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
                                            if (obj.length != 0){
                                                obj[0].title = theTitle[identifyGroup];
                                            }
                                        }
                                    }
                                    //else {
                                    //    theTitle[identifyGroup] = feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                                    //}
                                }
                                //view.popup.title = theTitle[identifyGroup];
                                document.getElementById("identifyTitle").innerHTML = theTitle[identifyGroup];
                                // set the popup title
                                //if (layerName.indexOf("GMU") != -1) theTitle[identifyGroup] = "GMU "+feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                                //else theTitle[identifyGroup] = feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                                //view.popup.title = theTitle[identifyGroup];
                                
                                for (i = 0; i < identifyLayers[identifyGroup][layerName].displaynames.length; i++) {
                                    //if ((feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] &&
                                    if ((i > 0 && feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] &&
                                            feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== " " &&
                                            feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "Null" &&
                                            feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "")) {
                                        // link
                                        if ((typeof feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "string") &&
                                                (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].substring(0, 4) == "http"))
                                            tmpStr += "<a href='" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "' class='idSubValue' target='_blank'>" + identifyLayers[identifyGroup][layerName].displaynames[i] + "</a>";
                                        else {
                                            if ((typeof(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]) === "string" && feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].substring(0, 7) == "<a href") && (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].indexOf("target") == -1))
                                                tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ":</span><span class='idSubValue'> " + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].replace(">", " target='_blank'>")+"</span>";
                                            else{
                                                if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("updated") > -1){
                                                    // subtract 6 hours from Greenwich time
                                                    var d = (Date.now() - feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]);
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
                                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +days+" "+dayStr+" "+hours+" "+hourStr+" ago</span><br/>";
                                                        else
                                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +days+" "+dayStr+" ago</span><br/>";
                                                    } else if (hours >= 1){
                                                        if (minutes >= 1)
                                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +hours+" "+hourStr+" "+minutes+" "+minStr+" ago</span><br/>";
                                                        else
                                                            tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span classs='idSubValue'>" +hours+" "+hourStr+" ago</span><br/>";
                                                    } else
                                                        tmpStr = "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>"+minutes+" "+minStr+" ago</span><br/>";
                                                }else {
                                                // format numbers to 1 decimal place TODO *******************
                                                //if(!isNaN(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]])){
                                                //    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ":</span><span class='idSubValue'> " + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(1)+"</span>";
                                                //} else
                                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ":</span><span class='idSubValue'> " + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]+"</span>";
                                                }
                                            }
                                        }
                                        tmpStr += "<br/>";
                                    }
                                    // add the database info at position specified
                                    if (identifyLayers[identifyGroup][layerName].position == i) {
                                        //features.push(feature);
                                        // one2one_display: one2one_fields values
                                        if (typeof identifyLayers[identifyGroup][layerName].one2one_fields != "undefined") {
                                            for (j = 0; j < identifyLayers[identifyGroup][layerName].one2one_fields.length; j++) {
                                                if (xmlDBDoc.getElementsByTagName(identifyLayers[identifyGroup][layerName].one2one_fields[j]).length > 0) {
                                                    var one2one_field = xmlDBDoc.getElementsByTagName(identifyLayers[identifyGroup][layerName].one2one_fields[j])[0];
                                                    if ((one2one_field.getElementsByTagName("linkname").length > 0) && (one2one_field.getElementsByTagName("linkurl").length > 0)) {
                                                        tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].one2one_display[j] + ": </span>";
                                                        tmpStr += "<a href='" + one2one_field.getElementsByTagName("linkurl")[0].firstChild.nodeValue + "' class='idSubValue'>" + one2one_field.getElementsByTagName("linkname")[0].firstChild.nodeValue + "</a>";
                                                        tmpStr += "<br/>";
                                                    }
                                                    // Make title bold and values not bold if greater than 5 words
                                                    //else if (one2one_field.childNodes.length > 0 && (identifyLayers[identifyGroup][layerName].one2one_display[j].toLowerCase().indexOf("regulations")>-1 ||
                                                    //    identifyLayers[identifyGroup][layerName].one2one_display[j].toLowerCase().indexOf("specific area")>-1)) {
                                                    else if (one2one_field.childNodes.length > 0 && (one2one_field.childNodes[0].nodeValue.match(/(\w+)/g).length > 5)) {
                                                        tmpStr += "<span class='idSubValue'>"+identifyLayers[identifyGroup][layerName].one2one_display[j] + ": </span>";
                                                        tmpStr += "<span class='idSubTitle'>"+one2one_field.childNodes[0].nodeValue+"</span>";
                                                        tmpStr += "<br/>";

                                                    } else if (one2one_field.childNodes.length > 0) {
                                                        tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].one2one_display[j] + ": </span>";
                                                        tmpStr += "<span class='idSubValue'>"+one2one_field.childNodes[0].nodeValue+"</span>";
                                                        tmpStr += "<br/>";
                                                    }
                                                }
                                            }
                                        }
                                        // one2many bulleted list
                                        if (typeof identifyLayers[identifyGroup][layerName].one2many_fields != "undefined") {
                                            for (j = 0; j < identifyLayers[identifyGroup][layerName].one2many_fields.length; j++) {
                                                var one2many = xmlDBDoc.getElementsByTagName(identifyLayers[identifyGroup][layerName].one2many_fields[j]);
                                                // Make regulation title bold and values not bold
                                                if (identifyLayers[identifyGroup][layerName].displaynames[0].toLowerCase().indexOf("regulations")>-1 ||
                                                    identifyLayers[identifyGroup][layerName].displaynames[0].toLowerCase().indexOf("restrictions")>-1)
                                                    tmpStr += "<span class='idSubValue'>"+identifyLayers[identifyGroup][layerName].displaynames[0] + ":</span><ul style='margin-top: 0px; margin-bottom: 0px;'>";
                                                else
                                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[0] + ":</span><ul style='margin-top: 0px; margin-bottom: 0px;'>";
                                                for (var h = 0; h < one2many.length; h++) {
                                                    //if (typeof one2many[h].children[0] != "undefined" && one2many[h].children[0].nodeName == "linkname" && one2many[h].children[1].nodeName == "linkurl") {
                                                    if ((one2many[h].getElementsByTagName("linkname").length > 0) && (one2many[h].getElementsByTagName("linkurl").length > 0)) {
                                                        tmpStr += "<li><a href='" + one2many[h].getElementsByTagName("linkurl")[0].firstChild.nodeValue + "' class='idSubValue' target='_blank'>" + one2many[h].getElementsByTagName("linkname")[0].firstChild.nodeValue + "</a></li>";
                                                    }
                                                    // No html links, linkname and linkurl tags not used in returned XML
                                                    else {
                                                        // Make regulation title bold and values not bold
                                                        if (identifyLayers[identifyGroup][layerName].displaynames[0].toLowerCase().indexOf("regulations")>-1)
                                                            tmpStr += "<li class='idSubTitle'>" + one2many[h].childNodes[0].nodeValue + "</li>";
                                                        else
                                                            tmpStr += "<li class='idSubValue'>" + one2many[h].childNodes[0].nodeValue + "</li>";
                                                    }
                                                }
                                                tmpStr += "</ul>";
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
                                //features.push(feature);
                            }
                            // if failed
                            else {
                                if (XMLHttpRequestObjects[arrIndex].status == 404) {
                                    alert("Identify failed. File not found: " + url, "Data Error");
                                    processedDatabaseCalls = numDatabaseCalls;
                                    accumulateContent(thePromise,str);
                                } else {
                                    alert("Identify failed for call to " + url + ". Make sure it exists and does not have errors. Must be in the same directory as index.html or a lower directory. XMLHttpRequestObjects[" + arrIndex + "].status was " + XMLHttpRequestObjects[arrIndex].status, "Data Error");
                                    processedDatabaseCalls = numDatabaseCalls;
                                    accumulateContent(thePromise,str);
                                }
                            }
                            
                            accumulateContent(thePromise,str);
                            // Check if all have finished
                            var isAllComplete = true;
                            // used to be numDatabaseCalls
                            for (var i = 0; i < XMLHttpRequestObjects.length; i++) {
                                if ((!XMLHttpRequestObjects[i]) || (XMLHttpRequestObjects[i].readyState !== 4)) {
                                    isAllComplete = false;
                                    break;
                                }
                            }
                            if (isAllComplete) {
                                //accumulateContent(thePromise,str);
                                // highlight first feature if none were specified by pre_title title title_field in IdentifyWidget.xml file
                                //if (numHighlightFeatures == 0){
                                //    highlightFeature(0,true);
                                //}

                                // Clear old database call info
                                xmlIndex = 0;
                                if (XMLHttpRequestObjects){
                                    while (XMLHttpRequestObjects.length > 0) {
                                        XMLHttpRequestObjects.pop();
                                    }
                                }
                            }
                        }
                    };
                }(xmlIndex);
                XMLHttpRequestObjects[xmlIndex].send();
            } catch (error) {
                alert("Identify on " + layerName + " failed with error: " + error.message + " in javascript/identify.js handleQueryResults().", "Data Error");
                //console.log(error.message);
                hideLoading();
            }
        }
        // Layer without database call
        else {
            features.push(feature);
            // highlight all features (polygons are turned off)
            highlightFeature(features.length-1,false);
            //tmpStr = "<span class='idTitle'>"+ layerName + "</span><div style='padding-left: 10px;'>";
            tmpStr = "<span class='idTitle'>"+identifyLayers[identifyGroup][[layerName]].display_label + "</span><div style='padding-left: 10px;'>";
            var first = true;
            // set header with the layer specified in IdentifyWidget.xml file with preTitle, titleField or identifyGroup as title
            if (theTitle[identifyGroup] == identifyGroup){
                if (identifyLayers[identifyGroup].preTitle !== null && identifyLayers[identifyGroup].titleLayer !== null){
                    //numHighlightFeatures=-1;
                    if(layerName.indexOf(identifyLayers[identifyGroup].titleLayer) != -1){
                        theTitle[identifyGroup] = identifyLayers[identifyGroup].preTitle+feature.attributes[identifyLayers[identifyGroup].titleField];
                        // only highlight if has feature title
                        //highlightFeature(features.length-1,false);
                        //highlightID = features.length-1;
                        // update groupObj title (cached tab)
                        let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
                        if (obj.length != 0){
                            obj[0].title = theTitle[identifyGroup];
                        }
                    }
                    // handle Bighorn and Goat GMU
                    else if (identifyLayers[identifyGroup].titleLayer.indexOf("GMU") != 1 && layerName.indexOf("GMU") != -1 && layerName === gmu){
                        theTitle[identifyGroup] = layerName +" Number "+feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                        // only highlight if has feature title
                        //highlightFeature(features.length-1,false);
                        //highlightID = features.length-1;
                        // update groupObj title (cached tab)
                        let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
                        if (obj.length != 0){
                            obj[0].title = theTitle[identifyGroup];
                        }
                    }
                }
                else {
                    //theTitle[identifyGroup] = feature.attributes[identifyLayers[identifyGroup][layerName].fields[0]];
                }
            }
            //view.popup.title = theTitle[identifyGroup];
            document.getElementById("identifyTitle").innerHTML = theTitle[identifyGroup];

            var minElev = -1;
            var maxElev = -1;
            var yearlong = false; // seasonal roads if open year long do not display dates open
            for (i = 0; i < identifyLayers[identifyGroup][layerName].displaynames.length; i++) {
                if ((feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] &&
                        feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== " " &&
                        feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "Null" &&
                        feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "")) {
                    // the first line does not need a carriage return
                    if (first) first = false;
                    else if(tmpStr.substring(tmpStr.length - 5) != "</ul>")
                        tmpStr += "<br/>";
                    // Handle a link. Can't do substring on a number!
                    if ((typeof feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "string") &&
                        (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].substring(0, 4) == "http"))
                        tmpStr += "<a href='" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "' class='idSubValue' target='_blank'>" + identifyLayers[identifyGroup][layerName].displaynames[i] + "</a>";
                    else{

                        // Convert Min & Max Elevation display name values to ft and display only 1 decimal place
                        if (identifyLayers[identifyGroup][layerName].displaynames[i] === "Min Elevation"){
                            minElev =  feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] *3.2808;
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + minElev.toFixed(1)+"'</span>";
                        }
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i] === "Max Elevation"){
                            maxElev =  feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] *3.2808;
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + maxElev.toFixed(1)+"'</span>";
                        }
                        // Trail or Road Segment Length round
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i] === "Segment Length"){
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>";
                            tmpStr +=  feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(1)+"mi</span>";
                        }
                        // Flow (cfs) round
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i] === "Flow (cfs)"){
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>";
                            tmpStr +=  feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(2)+"</span>";
                        }
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("updated") > -1){
                            // subtract 6 hours from Greenwich time
                            var d = (Date.now() - feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]);
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
                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +days+" "+dayStr+" "+hours+" "+hourStr+" ago</span>";
                                else
                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +days+" "+dayStr+" ago</span>";
                            } else if (hours >= 1){
                                if (minutes >= 1)
                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +hours+" "+hourStr+" "+minutes+" "+minStr+" ago</span>";
                                else
                                    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" +hours+" "+hourStr+" ago</span>";
                            } else
                                tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>"+minutes+" "+minStr+" ago</span>";
                        }
                        // Name make proper case, some were all upper case
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Name") > -1){
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + toTitleCase(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toLowerCase())+"</span>";
                        }
                        // If greater than 5 words in the text, make title bold and text not bold
                        else if ((typeof feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "string") &&
                            feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].match(/(\w+)/g).length > 5 &&
                            identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Address") == -1 &&
                            identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Inspection Station") == -1 &&
                            identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Station Name") == -1 &&
                            identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Phone") == -1 &&
                            identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Hours") == -1) { //identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("restrictions")>-1 ){
                            tmpStr += "<span class='idSubValue'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubTitle'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] +"</span>";
                        }
                        // MVUM Seasonal Roads
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i] === "Seasonal"){
                            // If MVUM SEASONAL is yearlong do not display the dates January = December
                            if (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] === "yearlong"){
                                yearlong = true;
                            }
                            tmpStr = tmpStr.substring(0,tmpStr.length - 5); // remove blank line
                            tmpStr += "<ul class='vertical-meta-list'>";
                        }
                        // MVUM Seasonal Roads Motorcycle Dates Open yearlong
                        else if (yearlong && identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Motorcycle Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(118, 176, 83);"><img alt="" width="32" height="32" src="./assets/images/activity-motorcycle-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows Motorcycles</dt>';
                            tmpStr += "<dd class='idSubValue'>Yes</dd></dl></li>";
                            //tmpStr = tmpStr.substring(0,tmpStr.length - 5); // remove blank line
                        }
                        // MVUM Seasonal Roads Motorcycle Dates Open, Seasonal dates
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Motorcycle Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(202, 160, 76);"><img alt="" width="32" height="32" src="./assets/images/activity-motorcycle-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows Motorcycles</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + " · Seasonally</dd></dl></li>";
                        }
                        
                        // MVUM Seasonal Roads ATVs Dates Open yearlong
                        else if (yearlong && identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("ATV Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(118, 176, 83);"><img alt="" width="32" height="32" src="./assets/images/activity-atv-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows ATVs</dt>';
                            tmpStr += "<dd class='idSubValue'>Yes</dd></dl></li>";
                            //tmpStr = tmpStr.substring(0,tmpStr.length - 5); // remove blank line
                        }
                        // MVUM Seasonal Roads ATVs Dates Open, Seasonal dates
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("ATV Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(202, 160, 76);"><img alt="" width="32" height="32" src="./assets/images/activity-atv-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows ATVs</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + " · Seasonally</dd></dl></li>";
                        }
                        
                        // MVUM Seasonal Roads OHVs > 50 Dates Open yearlong
                        else if (yearlong && identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("OHV > 50 Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(118, 176, 83);"><img alt="" width="32" height="32" src="./assets/images/activity-dune-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows OHVs&gt;50"</dt>';
                            tmpStr += "<dd class='idSubValue'>Yes</dd></dl></li>";
                            //tmpStr = tmpStr.substring(0,tmpStr.length - 5); // remove blank line
                        }
                        // MVUM Seasonal Roads Highway Vehicles Dates Open, Seasonal dates
                        else if ( identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("OHV > 50 Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(202, 160, 76);"><img alt="" width="32" height="32" src="./assets/images/activity-dune-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows OHVs&gt;50"</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + " · Seasonally</dd></dl></li>";
                        }
                        // MVUM Seasonal Roads Highway Vehicles Dates Open yearlong
                        else if (yearlong && identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Passenger Vehicle Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(118, 176, 83);"><img alt="" width="32" height="32" src="./assets/images/activity-drive-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows Highway Vehicles</dt>';
                            tmpStr += "<dd class='idSubValue'>Yes</dd></dl></li></ul>";
                            //tmpStr = tmpStr.substring(0,tmpStr.length - 5); // remove blank line
                        }
                        // MVUM Seasonal Roads Highway Vehicles Dates Open, Seasonal dates
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Passenger Vehicle Dates Open")>-1){
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(202, 160, 76);"><img alt="" width="32" height="32" src="./assets/images/activity-drive-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>Allows Highway Vehicles</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + " · Seasonally</dd></dl></li></ul>";
                        }
                        // phone number
                        else if ( identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Phone")>-1){
                            tmpStr += "<ul class='vertical-meta-list'>";
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(37, 126, 7);"><img alt="" width="32" height="32" src="./assets/images/phone.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>'+identifyLayers[identifyGroup][layerName].displaynames[i]+'</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</dd></dl></li></ul>";
                        }
                        // forest
                        /*else if ( feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toString().indexOf("Forest")>-1){
                            tmpStr += "<ul class='vertical-meta-list'>";
                            tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(37, 126, 7);"><img alt="" width="32" height="32" src="./assets/images/forest.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>'+identifyLayers[identifyGroup][layerName].displaynames[i]+'</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</dd></dl></li></ul>";
                        }*/
                        // BLM Office
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i] === "BLM Office"){
                            tmpStr += "<ul class='vertical-meta-list'>";
                            tmpStr += '<li><span class="vertical-meta-list-ico"><img alt="" src="./assets/images/blm_sm.svg" class="fs_blm_icons"></span>';
                            tmpStr += '<dl><dt>'+identifyLayers[identifyGroup][layerName].displaynames[i]+'</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</dd></dl></li></ul>";
                        }
                        // USFS Ranger District
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i] === "USFS District"){
                            tmpStr += "<ul class='vertical-meta-list'>";
                            tmpStr += '<li><span class="vertical-meta-list-ico"><img alt="USFS logo" src="./assets/images/usfs_sm.svg" class="fs_blm_icons"></span>';
                            tmpStr += '<dl><dt>'+identifyLayers[identifyGroup][layerName].displaynames[i]+'</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</dd></dl></li></ul>";
                        }
                        // CPW Field Office
                        else if (layerName === "Contact Info" && identifyLayers[identifyGroup][layerName].displaynames[i] === "Office Name"){
                            tmpStr += "<ul class='vertical-meta-list'>";
                            tmpStr += '<li><span class="vertical-meta-list-ico"><img alt="CPW logo" src="./assets/images/cpw_sm.svg" class="fs_blm_icons"></span>';
                            tmpStr += '<dl><dt>'+identifyLayers[identifyGroup][layerName].displaynames[i]+'</dt>';
                            tmpStr += "<dd class='idSubValue'>"+feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] + "</dd></dl></li></ul>";
                        }
                        // Allows dogs, horses, hiking
                        else if ( identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Allows")>-1){
                            tmpStr += "<ul class='vertical-meta-list'>";
                            if (feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toLowerCase() != "no")
                                tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(37, 126, 7);"><img alt="" width="32" height="32" src="./assets/images/activity-';
                            else
                                 tmpStr += '<li><span class="vertical-meta-list-ico" style="background: rgb(202, 160, 76);"><img alt="" width="32" height="32" src="./assets/images/activity-';
                            if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("horses")>-1)
                                tmpStr+='horseback-sm-ffffff.svg" class="class-ico"></span>';
                            else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("hiking")>-1)
                                tmpStr+='hike-sm-ffffff.svg" class="class-ico"></span>';
                            else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("dogs")>-1)
                                tmpStr+='dogwalking-sm-ffffff.svg" class="class-ico"></span>';
                            else if (identifyLayers[identifyGroup][layerName].displaynames[i].toLowerCase().indexOf("motorcycles")>-1)
                                tmpStr+='motorcycle-sm-ffffff.svg" class="class-ico"></span>';
                            tmpStr += '<dl><dt>'+identifyLayers[identifyGroup][layerName].displaynames[i]+'</dt>';
                            tmpStr += "<dd class='idSubValue'>"+toTitleCase(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]) + "</dd></dl></li></ul>";
                        }
                        else if (identifyLayers[identifyGroup][layerName].displaynames[i].indexOf("Surface Type")>-1){
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + toTitleCase(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]])+"</span>";
                        }
                        // Trail number
                        //<li><span class="vertical-meta-list-ico" style="background: rgb(237, 241, 234);"><i class="si s--meta s--meta--trail-number"></i></span><dl><dt>Trail Number</dt><dd>#943</dd></dl></li>

                        // format numbers to 1 decimal place TODO? ************************
                        //if(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== "" &&
                        //   feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]] !== " " && 
                        //   !isNaN(feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]])){
                        //    tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]].toFixed(1)+"</span>";
                        //}
                        else
                            tmpStr += "<span class='idSubTitle'>"+identifyLayers[identifyGroup][layerName].displaynames[i] + ": </span><span class='idSubValue'>" + feature.attributes[identifyLayers[identifyGroup][layerName].fields[i]]+"</span>";
                    }
                }
            }
            if (minElev !== -1 && maxElev !== -1) {
                tmpStr += "<br/><span class='idSubTitle'>Elevation Gain: </span><span class='idSubValue'>" + (maxElev - minElev).toFixed(1)+"'</span>";
            }

            // don't add it twice, but add it to the features geometry array
            if (str.indexOf(tmpStr) == -1) {
                // highlight polygon/point on mouse over, hide highlight on mouse out
                // str += "<div onMouseOver='javascript:highlightFeature(\""+(features.length-1)+"\",true)' onMouseOut='javascript:removeHighlight()'>"+tmpStr+"</div></div><br/>";
                // needed if not using highlight
                str += tmpStr+"</div><br/>";
            }
            return str;
        }
    }
    else if (layerName.indexOf("GMU") > -1) alert("In IdentifyWidget.xml, Big Game GMU layer label must be equal to 'Big Game GMU', or else Bighorn and Mountain Goat will not identify.","Data Error")    
}

function addClickPoint(){
    // Add click point to view.graphics
    // add marker pin at clickpoint
    require(["esri/Graphic"], function ( Graphic) {
        var pinImg;
        if (document.getElementsByTagName("body")[0].className.indexOf("green")>-1) pinImg = "green-pin.png";
        else if (document.getElementsByTagName("body")[0].className.indexOf("blue")>-1) pinImg = "blue-pin.png";
        else if (document.getElementsByTagName("body")[0].className.indexOf("orange")>-1) pinImg = "orange-pin.png";
        else alert("Missing picture marker symbol assets/images/color-pin.png where color is the color-theme specified in the body tag of index.html.","Error");
        const symbol = {
            type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
            url: "./assets/images/"+pinImg, // SVG documents must include a definition for width and height to load properly in Firefox. svg does not work in FireFox!!!!! SVG does not work on FireFox!!!!!!
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
    });
}
var numHighlightFeatures=0;
function highlightFeature(id,fade) {
    // highlight geometry, fade: true will fade, false will not fade
    // if id is -1 do not highlight geometry.
    if (id > -1){
        if (features[id] && features[id].geometry && (features[id].geometry != undefined && features[id].geometry.type)) { 
            if (features[id].geometry.type === "polyline") {
                //console.log("highlight line numHighlight="+numHighlightFeatures);
                addTempLine(features[id],fade);
                numHighlightFeatures++;
            }
            //else if (features[id].geometry.type === "point" ) {
            //    addHighlightPoint(features[id],fade);
            //    numHighlightFeatures++;
            //}else if (features[id].geometry.type === "polygon" && view.scale <= 4000000) {
                //addTempPolygon(features[id],fade);
                //numHighlightFeatures++;
            //}
        }
    }
}

function removeHighlight() {
    // remove old highlight  but don't remove pin at clickpoint
    for (var i=0; i<numHighlightFeatures; i++)
        view.graphics.remove(view.graphics.items[view.graphics.items.length-1]);
    numHighlightFeatures=0;
    //console.log("remove all highlights");
}

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
                        }else alert("Missing elevation_url in IdentifyWidget.xml file.","Data Error");
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
    document.getElementById("identifyContent").innerHTML = "<p align='center'>Loading...</p>";
    //view.popup.content = "<p align='center'>Loading...</p>";
    //view.popupEnabled = false;
    features = [];
    thePromises = [];
    //highlightID = -1;
    numDatabaseCalls = 0;
    processedDatabaseCalls = 0;
    theTitle[identifyGroup] = identifyGroup;
    //view.popup.title = identifyGroup;
    document.getElementById("identifyTitle").innerHTML = identifyGroup;
    displayContent();
}

function accumulateContent(thePromise,theContent){
    // get data for the currently selected idenitfyGroup

    // check if this is an old promise
    if(thePromises.length > 0 && thePromises.indexOf(thePromise) === -1) 
        return;

    // Delay showing loading for 1/2 second
    if (thePromise > -1){
        var loadTimer = setInterval(function() {
            if (document.getElementById('myPopupContent')) {
                clearInterval(loadTimer);
                if (document.getElementById("promise"+thePromise))
                    document.getElementById("promise"+thePromise).style.display = "block";
            }
        },250);
    }

    // cache the identify group. Create the array item if it does not exist. Each identify map click will recreate groupObj array.
    let obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
    if (obj.length === 0){
        // 1st time: cache content in groupObj[identify tab name] and display identify popup
        groupObj.push({
            identifyGroup: identifyGroup,
            title: theTitle[identifyGroup],
            content: theContent.replace(/ style=\'display:none;\'/g,""),
            //highlightID: highlightID,
            features: features,
            promises: thePromises // array of promise numbers for this tab
        });
        obj = groupObj.filter(item => item.identifyGroup === identifyGroup);
        // Fills view.popup.content with tabs menu and theContent
        displayInfoWindow(theContent); // update identify popup
    }
    // Accumulate content
    else {
        // update cached values
        if (features != []) obj[0].features = features; // update features array
        //if(highlightID != -1) obj[0].highlightID = highlightID;
        obj[0].promises = thePromises;
               
            // update view.popup.content by adding to myPopupupContent div element. It flashes horribly if call view.popup.content = ....
            // wait for content to populate
            var existCondition = setInterval(function() {
                if (document.getElementById('myPopupContent')) {
                    clearInterval(existCondition);
                    // each promise will be in a div inside myPopupContent
                    // Replace loading... message with content
                    if (document.getElementById("promise"+thePromise) && document.getElementById("promise"+thePromise).innerHTML.indexOf("Loading...") > -1)
                        document.getElementById("promise"+thePromise).innerHTML = theContent;
                    // Append to existing content but don't add it twice
                    else if (document.getElementById("promise"+thePromise)) { 
                        if (document.getElementById("promise"+thePromise).innerHTML.replace(/\<br\>/g,"<br/>").indexOf(theContent.replace(/\'/g,"\"").replace(/\<br\>/g,"<br/>").replace(/\&/g,"&amp;")) == -1)
                            document.getElementById("promise"+thePromise).innerHTML += theContent;
                    }
                    // first time add each promise to top level (Loading...)
                    else{
                        document.getElementById("myPopupContent").innerHTML+=theContent; // append new content
                    }
                    // update cache but make each promise div visible
                    obj[0].content = document.getElementById("myPopupContent").innerHTML.replace(/ style=\'display:none;\'/g,""); // accumulate content
                    
                    // Check for no data
                    var allPromisesDone = true;
                    var promiseContent = "";
                    for(var i=0; i<thePromises.length;i++){
                        // if this promise has loaded
                        if (document.getElementById("promise"+thePromises[i])){
                            promiseContent += document.getElementById("promise"+thePromises[i]).innerHTML;
                        } else {
                            allPromisesDone = false;
                        }
                    }
                    if (allPromisesDone && promiseContent === ""){
                        if (document.getElementById("myPopupContent").innerHTML.indexOf(" at this point.") > -1) return; // don't show it twice!
                        var visible = "";
                        if (identifyLayerIds[identifyGroup][0].id_vis_only) visible = "visible "; // 1-10-18 add word visible if identifying visible only
                        document.getElementById("myPopupContent").innerHTML+="<div id='noData'>No " + visible + identifyGroup + " at this point.<br/></div>";
                        obj[0].content = document.getElementById("myPopupContent").innerHTML.replace(/ style=\'display:none;\'/g,""); // accumulate content
                        obj[0].lastTitle = theTitle[identifyGroup];
                        theTitle[identifyGroup] = "No "+identifyGroup;
                        obj[0].title = "No "+identifyGroup;
                        document.getElementById("identifyTitle").innerHTML="No "+identifyGroup;
                    }
                    // a promise returned from the database lookup. It may have assumed that there was not data. Remove this message.
                    else if (allPromisesDone && promiseContent != "" && document.getElementById("myPopupContent").querySelector("#noData")){
                        // hide the no data message: No <identifyGroup> at this point.
                        const noDataDiv = document.getElementById("myPopupContent").querySelector("#noData");
                        noDataDiv.remove();
                        obj[0].content = document.getElementById("myPopupContent").innerHTML.replace(/ style=\'display:none;\'/g,""); // accumulate content
                        theTitle[identifyGroup] = obj[0].lastTitle;
                        obj[0].title = obj[0].lastTitle;
                        document.getElementById("identifyTitle").innerHTML=obj[0].lastTitle;
                    }
                }
            }, 100); // check every 100ms
    }

    if (numDatabaseCalls == processedDatabaseCalls) {
        numDatabaseCalls = 0;
        processedDatabaseCalls = 0;
    }

    // No info found, just display XY coordinates
    /*if (features.length == 0 && obj[0].content=="") {
        var str;
        var visible = "";
        // find the index
        for (var i=0; i<groupObj.length; i++){
            if (groupObj[i].identifyGroup === identifyGroup) break;
        }
        if (identifyLayerIds[identifyGroup][0].id_vis_only) visible = "visible "; // 1-10-18 add word visible if identifying visible only
        if (identifyLayers[identifyGroup].desc) {
            str = "<div id='noData'><p style='font-style:italic;top:-15px;position:relative;'>" + identifyLayers[identifyGroup].desc + "</p>No " + visible + identifyGroup + " at this point.<br/></div>";
            theContent = str;
            // cache content
            groupObj[i]={
                identifyGroup: identifyGroup,
                title: theTitle[identifyGroup],
                content: str,
                highlightID: -1,
                features: []
            };
            theTitle[identifyGroup] = identifyGroup;
            view.popup.title = identifyGroup;
            str = null;
        } else {
            str = "<div id='noData'>No " + visible + identifyGroup + " at this point.<br/></div>";
            theContent = str;
            // cache content
            groupObj[i] = {
                identifyGroup: identifyGroup,
                title:  theTitle[identifyGroup],
                content: str,
                highlightID: -1,
                features: []
            };
            theTitle[identifyGroup] = identifyGroup;
            view.popup.title = identifyGroup;
            str = null;
        }
        // write no data message to view.popup.content when it is populated
        var existCondition = setInterval(function() {
            if (document.getElementById('myPopupContent')) {
                clearInterval(existCondition);
                document.getElementById("myPopupContent").innerHTML+=theContent; // append new content
            }
        }, 100); // check every 100ms
    }*/
}

function setPrj(){
    setIdentifyFooter(clickPoint);
    settings.XYProjection=document.getElementById("idxycoords").value;
    setCookie("prj",document.getElementById("idxycoords").value);
}
function customStuff(theContent){
    // add a drop down list and footer to the popup content
    const outerDiv = document.createElement("calcite-tabs");
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
            // Content
            content += " select='true' class='myIdTab'>";
            content += "<div id='myPopupContent' style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'>"+theContent+"</div>";
            
            // Footer
            // XY point
            content += "<div style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'><calcite-icon aria-hidden='true' icon='pin-tear-f' scale='m' style='color:var(--press);vertical-align:middle;'></calcite-icon> <span class='idTitle' style='margin-right:-20px;'>Location:</span> <span style='white-space:nowrap;margin-left:25px;'><input type='text' value='Loading XY...' id='idXY' disabled='true'> <a href=\"javascript:copyText('idXY')\" style='font-weight:bold;margin-left:0;padding-left:0;font-size:1.1em;text-decoration:none;color:var(--press)'><calcite-icon aria-hidden='true' icon='copy' scale='m' style='vertical-align:middle;margin-right: 5px;'></calcite-icon></a></span> <span id='copyNote'></span>";
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
            content += "<div style='padding:12px;'><a href='javascript:zoomToPt()' style='float:left;font-weight:600;margin-right:20px;'><calcite-icon aria-hidden='true' icon='magnifying-glass-plus' scale='s' style='color:var(--press);vertical-align:middle;margin-right: 5px;'></calcite-icon><span style='color:var(--press)'> Zoom To</span></a> ";
            
            // Get Directions
            if (driving_directions){
                content += "<a href='javascript:getDirections()' style='float:left;font-weight:600;'><span aria-hidden='true' class='esri-features__icon esri-icon-directions2' style='color:var(--press);vertical-align:middle;margin-right: 5px;'></span><span style='color:var(--press)'> Get Directions</span></a></div>";
            }
        } else {
            content += "><div style='border-bottom: 1px solid var(--calcite-color-border-3);padding:12px;'></div>";
        }

        content += "</calcite-tab>";
    }
    outerDiv.innerHTML = content;
    return outerDiv;
}
function displayInfoWindow(theContent) {
    // open popup and set content to string theContent
    //view.popup.content = customStuff(theContent);
    document.getElementById("identifyContent").innerHTML = "<calcite-tabs>" +customStuff(theContent).innerHTML+"</calcite-tabs>";
    document.getElementById("identifyPopup").style.display = "block";
    //view.openPopup();

    //if (view.popup){
    //    view.popup.when(() => {
          //  document.getElementsByClassName("esri-popup__main-container")[0].style.marginTop = "90px"; // place below title and search
            // add tab menu to hidden slot content-top TODO cannot get the slot!!!!!
            /*let readyDOM = this.querySelector('*[slot=content-top]');
            var content = '<calcite-tabs><calcite-tab-nav slot="title-group">';// style="position:fixed;background-color:white;height:50px;width:444px;margin-top:-12px;padding:10px;">';
            for (var i = 0; i < identifyGroups.length; i++) {
                content += '<calcite-tab-title onclick="changeIdentifyGroup(this)"';
                if (identifyGroup == identifyGroups[i]) content += " selected";
                content+= ">" + identifyGroups[i] + '</calcite-tab-title>'
            }
            content += "</calcite-tab-nav></calcite-tabs>";
            // add menu tabs to hidden slot content-top
            //const contentTop = document.getElementsByClassName("esri-popup__main-container")[0].querySelector('*[slot=content-top');
            readyDOM.innerHTML = content;
            readyDOM.style.display = "block";*/

        // document.getElementsByClassName("esri-popup__main-container")[0].getElementsByClassName("esri-features__container")[0].style.overflow="hidden"; // remove double scroll bar
    //    });
    //}

 // not using esri popup   view.popup.viewModel.location = clickPoint;
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
        var geoPt = webMercatorUtils.webMercatorToGeographic(clickPoint);
        var url = "http://google.com/maps?output=classic&q=" + geoPt.y + "," + geoPt.x;
        window.open(url, "_blank");
    });
}

function zoomToPt() {
    var level = 100000;
    if (view.scale < level) level = view.scale; // don't zoom out!!!
    // zoom to point
    view.goTo({
        target: clickPoint,
        scale: level
    });
}

function getInputArea(){
    alert("Set Input Area point | buffered point | freehand");
}
//// End Identify Widget ////