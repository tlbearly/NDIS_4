var xmlDoc; // config.xml document json
var ext;
var initExtent;
openTOCgroups=[];
var tries={}; // number of times we have tried to load each map layer
var loadedFromCfg; // true when the layer has loaded and set the visiblelayers when setting layers from URL
var labelFromURL = false;

function addGraphicsAndLabels() {
    //----------------------------------------------------------------
    // Add Points, Lines, Polygons, Rectangles, Labels
    //----------------------------------------------------------------
    require(["esri/geometry/SpatialReference"], (SpatialReference) => {
        try {
            var sr;
            if (!queryObj.prj || queryObj.prj == "")
                sr = new SpatialReference(3857);
            else
                sr = new SpatialReference(parseInt(queryObj.prj));

            //----------------------------
            //        Add points
            //----------------------------
            // points = circle|size|color|alpha(transparency)|outline color|outline width|x|y|
            //   text|font|font size|color|bold as t or f|italic as t or f|underline as t or f|placement|offset, next point...
            // For example: circle|10|4173788|1|0|1|-11713310|4743885|480;779; 4;333;990|1|12|4173788|t|f|f|above|5
            if (queryObj.point && queryObj.point != "") {
                points(queryObj.point, sr);
            }
            
            //----------------------------
            //        Add lines
            //----------------------------
            // &line= style | color | alpha | lineWidth | number of paths | [number of points | x | y | x | y |... repeat for each path] 
            // |x|y|label|font|font-size|color|bold|italic|underline|placement|offset, repeat for each line
            // &line=solid|4173788|1|5|1|3|-11900351|4800983|-11886749|4805344|-11883462|4812449|-11891907|4806716|10.5 mi|1|12|4173788|t|f|f|above|5
            if (queryObj.line && queryObj.line != "") {
                addLines(queryObj.line, sr);
            }
            //----------------------------
            //        Add polygons
            //----------------------------
            // &poly=  fillStyle | fillColor | fillAlpha | lineStyle | lineColor | lineWidth | 
            // number of rings | number of points | x | y | x | y |... repeat for each ring , repeat for each polygon
            // fillAlpha is now in fillColor (was used in flex), lineStyle = solid, lineWidth = 2
            if (queryObj.poly && queryObj.poly != "") {
                addPolys(queryObj.poly, sr);
            }
            //----------------------------
            //        Add rectangles
            //----------------------------
            // &rect=  fillStyle | fillColor | fillAlpha | lineStyle | lineColor | lineWidth | 
            // number of rings | number of points | x | y | x | y |... repeat for each ring , repeat for each polygon
            // fillAlpha is now in fillColor (was used in flex), lineStyle = solid, lineWidth = 2
            if (queryObj.rect && queryObj.rect != "") {
                addRects(queryObj.rect, sr);
            }
            //----------------------------
            //        Add labels
            //----------------------------
            // &text=x|y|text|font|font size|color|bold as t or f|italic as t or f|underline as t or f
            // font, color, bold, italic, and underline are not used in this version. They default to Helvetica, black, bold
            if (queryObj.text && queryObj.text != "") {
                addLabels(queryObj.text, sr);
            }
            sr = null;
        } catch (e) {
            alert("Error loading graphics from the URL. In js/addMapLayers.js addGraphicsAndLabels(). Error message: " + e.message, "URL Graphics Error", e);
        }
    });
}

		
function addMapLayers(){
    //******************
    //  ADD MAP LAYERS
    //
    //  addMapLayers calls creatLayer for each layer in the operationallayers tag in the config.xml file.
    //  createLayer calls layerLoadFailedHandler
    //  layerLoadFailedHandler waits then calls createLayer again, reports error after 5 tries and increases time between calls to 30 seconds.
    //  map.on("layer-add-result") listens for layer to load to map. Updates the toc with new layers. Waits for all to have tried to load,
    //  reorders legendLayers and map layers
    //******************
    // 3-21-22 use layer.on("load") and layer.on("error") to make sure layers have loaded

    require([
        "esri/layers/MapImageLayer",
        "esri/layers/FeatureLayer","esri/layers/GroupLayer",], (MapImageLayer, FeatureLayer, GroupLayer) => {
        // Create Layer 3-21-22
        // Get layers from url of config.xml
        function createLayer(layer){
            // layer could be the operational layer read from config.xml as an xml document (need to use getAttribute)
            // or event.layer (need to use layer.element)
            //console.log("Creating layer: ");
            var id,url,alpha,visible,listMode,legendEnabled,minScale=null,maxScale=null;
            if (layer.id){
                id = layer.id;
                url = layer.url;
                alpha = layer.opacity;
                visible = layer.visible;
                listMode = layer.listMode;
                legendEnabled = layer.legendEnabled;
                minScale = layer.minScale;
                maxScale = layer.maxScale;
            }else if (layer.getAttribute){
                id = layer.getAttribute("label");
                url = layer.getAttribute("url");
                alpha = layer.getAttribute("alpha");
                visible = layer.getAttribute("visible");
                if (layer.getAttribute("minScale") !== null)
                    minScale = layer.getAttribute("minScale");
                if (layer.getAttribute("maxScale") !== null)
                    maxScale = layer.getAttribute("maxScale");
                listMode = layer.getAttribute("listMode");
                if (listMode === null) listMode = "show";
                legendEnabled = layer.getAttribute("legendEnabled");
                if (legendEnabled === null) legendEnabled = true;
            }
            else {
                alert("Failed to load layer. layer.id and layer.getAttribute do not exist.", "Error");
                return;
            }
            //console.log(id);
            
            // if already loaded return
            for (var i=0;i<view.allLayerViews.items.length;i++){
                if (id === view.allLayerViews.items[i].layer.id && view.allLayerViews.items[i].layer.loaded) 
                    return;
            }

            var myLayer;
            tries[id]++;

            // Set layer properties on startup if specified on url
            // From link to current map. For example: 
            //      https://ndismaps.nrel.colostate.edu/index.html?app=HuntingAtlas&prj=102100
            //      &extent=-11915180,4735706,-11800601,4794104&layer=streets|Hunter%20Reference|0.8|0-1-13-18-19-79-88-89-101-102-103,
            //      Game%20Species|0.7|9-11-12-13-15-16
            if (queryObj.layer && queryObj.layer != "") {
                if (url.toLowerCase().indexOf("mapserver") > -1) {
                    if (layerObj[id]){
                        myLayer = new MapImageLayer({
                            "url": url,
                            "opacity": layerObj[id].opacity,
                            "title": id,
                            "id":id,
                            "visible": layerObj[id].visible,
                            "listMode": listMode,
                            "legendEnabled": legendEnabled,
                            ///TODO this does not exist in v4.24**********  "visibleLayers": layerObj[id].visLayers
                            "sublayers": layerObj[id].visLayers // remove this, it will delete data. Loop through and set these layers to visible other to not visible.
                        });
                    // not found on url, not visible
                    }else {
                        myLayer = new MapImageLayer({
                            "url": url,
                            "opacity": Number(alpha),
                            "title": id,
                            "id":id,
                            "visible": false,
                            "listMode": listMode,
                            "legendEnabled": legendEnabled
                        });
                    }
                }
                // FeatureServer tlb 10/19/20
                else if (url.toLowerCase().indexOf("featureserver") > -1){
                    if (layerObj[id]) 
                        myLayer = new FeatureLayer({
                            "url": url,
                            "opacity": Number(alpha),
                            "title": id,
                            "listMode": listMode,
                            "legendEnabled": legendEnabled,
                            "visible" : layerObj[id].visible
                            //TODO this does not exist in v4.24********** "visibleLayers" : layerObj[id].visLayers
                        });
                    else
                        myLayer = new FeatureLayer({
                            "url": url,
                            "opacity": Number(alpha),
                            "title": id,
                            "listMode": listMode,
                            "legendEnabled": legendEnabled,
                            "visible": false
                        });
                }
                else {
                    alert("Unknown operational layer type. It must be of type MapServer or FeatureServer. Or edit addMapLayers.js line 183 to add new type.");
                    return;
                }
            // Set layer properties from config.xml file
            } else {
                // MapServer
                if (url.toLowerCase().indexOf("mapserver") > -1){
                        myLayer = new MapImageLayer({
                            url: url,
                            opacity: Number(alpha),
                            title: id,
                            id: id,
                            listMode: listMode,
                            legendEnabled: legendEnabled,
                            visible: visible == "true"
                            // Example popup template for each sublayer
                            /*sublayers: [{
                                id: 0,
                                popupTemplate: {
                                    title: "{COUNTY}",
                                    content: "{POP2007} people lived in this county in 2007"
                                }
                                }]*/
                        });
                } 
                // FeatureServer tlb 9/28/20
                else if (url.toLowerCase().indexOf("featureserver") > -1){
                    myLayer = new FeatureLayer({
                        url: url,
                        opacity: Number(alpha),
                        title: id,
                        id: id,
                        listMode: listMode,
                        legendEnabled: legendEnabled,
                        visible: visible == "true"
                    });
                    
                    // add identify popup template
                    var xmlLayer=null;
                    for(i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
                        if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label") === myLayer.id){
                            xmlLayer = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i];
                            break;
                        }
                    }
                    if (xmlLayer.getAttribute("popup_fields") && xmlLayer.getAttribute("popup_labels")){
                        const template = addPopupTemplate(xmlLayer.getAttribute("label"),xmlLayer.getAttribute("popup_fields").split(","),xmlLayer.getAttribute("popup_labels").split(","));
                        if (template != null) myLayer.popupTemplate = template;
                    }

                }
                else {
                    alert("Layer: "+id+" Unknown operational layer type. It must be of type MapServer or FeatureServer. Or edit addMapLayers.js line 175 to add new type.");
                    return;
                }
            }
            // set min and max scale if it was set in config.xml
            if (minScale !== null) myLayer.minScale = minScale;
            if (maxScale !== null) myLayer.maxScale = maxScale;

            // set Symbols
            // TODO: testing adding symbols
            if (myLayer.url.indexOf("CPWAdminData")>0 && id == 15){
                myLayer.renderer = {
                        type: "simple",
                        symbol: {
                            color: {a: 1,
                                r: 80,
                                g: 255,
                                b: 80
                            },
                            join: "round",
                            miterLimit: 2,
                            style: "dash",
                            type: "simple-line",
                            width: 2
                        },
                    };
            }
            // label trailheads
            if (myLayer.url.indexOf("CPWAdminData")>0 && id==14){ 
                const labelClass = {
                    // autocasts as new LabelClass()
                    symbol: {
                      type: "text", // autocasts as new TextSymbol()
                      color: "black",
                      haloColor: [255,255,153,1.0],
                      haloSize: "2px",
                      xoffset: -23,
                      yoffset: -30,
                      horizontalAlignment: "center",
                      verticalAlignment: "baseline",
                      font: {
                        //autocasts as new Font()
                        family: "Arial",
                        size: 10
                      }
                    },
                    labelPlacement: "always-horizontal", //below-center for points
                    text: label,
                    labelExpressionInfo: {
                        expression: "$feature.name"
                    }
                };
                // TODO needs to be featureservice to add labels!!!!
                myLayer.labelingInfo=[labelClass];
            }
            // end set Symbols

            // Add MapService or FeatureLayer to mapLayers if it was not added already. mapLayers is definded in index.html
            var found = false;
            for (var i=0; i<mapLayers.length; i++){
                if (mapLayers[i].id === myLayer.id) {
                    found = true;
                    break;
                }
            }
            if (!found)
                mapLayers.push(myLayer);
            map.add(myLayer);
        }

        function layerLoadFailedHandler(event){
            console.log("layer failed to load: "+event.layer.id);
            // Layer failed to load 3-21-22
            // Wait 2 seconds, retry up to 5 times, then report the error and continue trying every 30 seconds
            // 3-10-22 NOTE: MVUM is sometimes missing some of the sublayers. Contacted victoria.smith-campbell@usda.gov
            // at USFS and they restarted one of their map services and it fixed the problem.
            
            // Call subgroup layer load failed handler
            if (event.layer.parent.type && event.layer.parent.type === "group") {
                subGroupLayerLoadFailed(event);
                return;
            }
            //if baselayer return
            var found = false;
            for (var i=0; i<mapLayers.length; i++){
                if (mapLayers[i].id === event.layer.id){
                    found = true;
                    break;
                }
            }
            if (!found) return; // not in mapLayers (all operational layers). This is a basemap. It will reload on it's own.

            // if already loaded return
            for (i=0;i<view.allLayerViews.items.length;i++){
                if (event.layer.id === view.allLayerViews.items[i].layer.id && view.allLayerViews.items[i].loaded) 
                    return;
            }
    console.log(event.layer.id+" failed to load!!!!!!! ");
    if (event.layer.loadError && event.layer.loadError.message) console.log("Error: "+event.layer.loadError.message+" Status: "+event.layer.loadStatus);
    console.log("tries="+tries[event.layer.title]);
            /*var layer=null;
            for(i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
                if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label") === event.layer.id){
                    layer = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i];
                    break;
                }
            }*/
            // Try every 2 seconds for up to 5 times 
            if (tries[event.layer.title] < 4){
                console.log("Retrying to load (every 2 seconds): "+event.layer.id);
                setTimeout(function(){createLayer(event.layer);},2000);
            } 
            // Greater than 5 tries, give warning
            /*else if (tries[event.layer.title] == 4){
                //if (event.layer.id.indexOf("Motor Vehicle") > -1 || event.layer.id.indexOf("Wildfire") > -1 || event.layer.id.indexOf("BLM") > -1)
                //    alert("The external map service that provides "+event.layer.id+" is experiencing problems.  This issue is out of CPW control. We will continue to try to load it. We apologize for any inconvenience.","External (Non-CPW) Map Service Error");
                //else
                //    alert(event.layer.id+" service is busy or not responding. We will continue to try to load it.","Data Error");
                //if (layer){
                    console.log("Retrying to load: "+event.layer.id);
                    setTimeout(function(){createLayer(event.layer);},30000);
                //}
            }*/
            // Greater than 5 tries. Keep trying every 30 seconds
            else {
    //DEBUG
    
    //if(layer.getAttribute("url").indexOf("oooo")>-1)
    //layer.setAttribute("url", layer.getAttribute("url").substring(0,layer.getAttribute("url").length-4));
    //console.log("url="+layer.getAttribute("url"));
                //if (layer){
                    console.log("Retrying to load (every 30 seconds): "+event.layer.id);
                    setTimeout(function(){createLayer(event.layer);},30000);
                //}
            }
        }

        async function layerLoadHandler(event){
            if (!isNaN(event.layer.id[0]))
                console.log(event.layer.title +" loaded in layerLoadHandler.");
            else
                console.log(event.layer.id +" loaded in layerLoadHandler.");
            
            // Set the arcade context for Wildfire Incidents to print at correct size
            // the input feature's geometry is expected
            // to be in the spatial reference of the view
            //*************************TODO tried to fix printing wildfire symbols did not work */
            /*if (event.layer.id === "Wildfire Incidents"){
                const labelVariableExpressionInfo = arcadeUtils
                .getExpressionsFromLayer(event.layer)
                .filter(expressionInfo => expressionInfo.profileInfo.context === "label-class")[0];
                const wildfireLabelArcadeScript = labelVariableExpressionInfo.expression;

                const rendererVariableExpressionInfo = arcadeUtils
                .getExpressionsFromLayer(event.layer)
                .filter(expressionInfo => expressionInfo.profileInfo.context === "unique-value-renderer")[0];
                const wildfireRendererArcadeScript = rendererVariableExpressionInfo.expression;

                // Arcade expression used by size visual variable
                const sizeVariableExpressionInfo = arcadeUtils
                .getExpressionsFromLayer(event.layer)
                .filter(expressionInfo => expressionInfo.profileInfo.context === "size-variable")[0];

                const wildfireSizeArcadeScript = sizeVariableExpressionInfo.expression;
                const wildfireSizeArcadeTitle = sizeVariableExpressionInfo.title;
        
                //const color
                // Define the visualization profile variables
                // Spec documented here:
                // https://developers.arcgis.com/arcade/profiles/visualization/
                const visualizationProfile = arcade.createArcadeProfile("visualization");
        
                // Compile the color variable expression and create an executor
                const wildfireLabelArcadeExecutor =
                    await arcade.createArcadeExecutor(wildfireLabelArcadeScript, visualizationProfile);
                const wildfireRendererArcadeExecutor =
                    await arcade.createArcadeExecutor(wildfireRendererArcadeScript, visualizationProfile);
                const wildfireSizeArcadeExecutor =
                    await arcade.createArcadeExecutor(wildfireSizeArcadeScript, visualizationProfile);
            }*/
            //*******************end wildfire *****************************/

            // remove MVUM Status
            if (event.layer.title === "Motor Vehicle Use Map" || event.layer.title === "MVUM"){
                event.layer.sublayers.items[0].visible = false;
                event.layer.sublayers.items[0].listMode = "hide";
                event.layer.sublayers.items[0].legendEnabled = false;
            }
            // reorder layers (top layers and top groups) if it failed
            if (tries[event.layer.id] && tries[event.layer.id] > 1){
                var j;
                
                // load the correct layer order from config.xml file
                // opLayerObj = top level layer of group
                // opGroupLayerObj = a groupLayer with layerids, ignor sub groups with no sublayers
                if (opLayerObj.length == 0){
                    for(var i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
                        // add top level layer or group
                        if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("parentGroup")===null){
                            if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label")){
                                opLayerObj.push({
                                    title: xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label"),
                                    type: "layer",
                                    parentId: null
                                });
                            }
                            else if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("group")){
                                opLayerObj.push({
                                    title: xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("group"),
                                    type: "group",
                                    parentId: null
                                });
                            }
                        }
                    }
                }

                // reorder top level layers and groups
                var found=false;
                for(i=0;i<opLayerObj.length;i++){
                    //console.log(i+" "+opLayerObj[i].title);
                    if (opLayerObj[i].title === event.layer.id){
                        found = true;
                        break;
                    }
                }
                // this is a top level layer
                if (found){
                    // i=index of layer just added to map in opLayerObj
                    // if last in array add it to end
                    if (i+1 == opLayerObj.length)
                        map.reorder(event.layer,i+1);
                    else{
                        // loop through all layers above this layer in case not all layers have been added
                        var reordered = false;
                        for (j=i+1;j<opLayerObj.length;j++){
                            if (reordered)break;
                            // loop through all layers added to the map to find index to insert it at
                            // look for each item that is after it
                            for (var k=0; k<view.layerViews.items.length;k++){
                                if(opLayerObj[j].title === view.layerViews.items[k].layer.title){
                                    map.reorder(event.layer,k+1);
                                    reordered=true;
                                    //console.log(event.layer.id+" reordered to "+k);
                                    //debug  for (var m=0; m<view.layerViews.items.length;m++){
                                    //	console.log("map view: "+m+" "+view.layerViews.items[m].layer.title);
                                    //}
                                    break;
                                }
                            }
                        }
                        if (!reordered)map.reorder(event.layer,view.layerViews.items.length);
                    }
                }
                
                //alert("Was able to sucessfully load: "+event.layer.id);
                event.layer.refresh;
                
            }
            // create sub-dialog in layer list for root layers (in mapLayers)
            for (var i=0; i<mapLayers.length; i++){
                if (mapLayers[i].id == event.layer.id){ // make sure it is a root layer
                    layerListAddSublayerDialogs(event,null);
                    break;
                }
            }
        }
        
        function getLayerIds(layerIds){
            // Return array of integers
            //  layerIds: array of integers, or string "10-15,17", id of each layer
            var ids = [];
            if(typeof layerIds === "string"){
                var items = layerIds.split(",");  
                for(var i=0;i<items.length;i++){
                if (items[i].indexOf("-")>-1){
                    let firstLast = items[i].split("-"); // "3-5" -> [3],[5]
                    for(var j=parseInt(firstLast[0]);j<parseInt(firstLast[1])+1;j++){
                    ids.push(parseInt(j)); // push all the numbers 3,4,5
                    }
                }
                else ids.push(parseInt(items[i]));
                }
            }
            else ids = layerIds.split(",");
            // layers display in reverse order, so reverse our arrays here
            ids = ids.reverse();
            return ids;
        }
        function addGroupLayer(groupName, vis, opacity, radio, featureservice, portal, minScale, maxScale, layerIds, layerVis, layerNames, listMode, legendEnabled, popupFields,popupLabels){
            // Creates a group and adds feature service layers in layerVis. Returns the GroupLayer
            // groupName: string, name of this group
            // vis: boolean, is this group visible?
            // radio: boolean, radio buttons?
            // featureservice: string, url
            // layerIds: array of integers, or string "10-15,17", id of each layer
            // layerVis: array of true, false for visibility of each layer
            // layerNames: array of strings, names of each layer
            // popupFields: field names in the feature service to display in identify popup template
            // popupLabels: labels for above fields
            var visMode = "independent";
            if(radio) visMode="exclusive";
            vis = vis.toLowerCase() === "true";
            var groupLayer;
            // Portal
            if (portal){
                groupLayer = new GroupLayer({
                    portalItem: {  // autocasts new PortalItem()
                        id:portal //"1073fc11057c4ba3bc93c7898b3f18bc" // Bob's Test Elk
                    },
                    title: groupName,
                    id: groupName,
                    opacity: Number(opacity),
                    visible: vis
                });
            }else{
                if (opacity){
                    groupLayer = new GroupLayer({
                        title: groupName,
                        id: groupName,
                        visible: vis,
                        opacity: parseFloat(opacity),
                        visibilityMode: visMode // radio buttons?
                    });
                } else {
                    groupLayer = new GroupLayer({
                        title: groupName,
                        id: groupName,
                        visible: vis,
                        visibilityMode: visMode // radio buttons?
                    });
                }
            }
            if (!featureservice) return groupLayer;

            // add / to end of feature service
            if (featureservice.substr(featureservice.length-1) != "/")
                featureservice += "/";
            var ids = getLayerIds(layerIds); // convert strings like "3-5" to integer array 3,4,5
            layerVis = layerVis.reverse();
            if (layerVis.length != ids.length){
                alert("Error in "+app+"/config.xml operationallayers. In layer group "+groupName+", list of layerIds and layerVis must have the same number of elements.");
                return groupLayer;
            }
            if (layerNames != null){
                layerNames = layerNames.reverse();
                if (layerVis.length != layerNames.length){
                    alert("Error in "+app+"/config.xml operationallayers. In layer group "+groupName+", list of layerIds, layerVis, and layerNames must have the same number of elements.");
                    return groupLayer;
                }
            }

            // Add each featureservice layer to this group
            for(var i=0;i<ids.length;i++){
                if (layerVis[i] == null) alert("Missing layerVis item ("+i+") for "+groupName+" in config.xml. Should be true or false.","Data Error");
                vis = layerVis[i].toLowerCase() === "true";
                tries[groupLayer.title+ids[i]]=0;
                // use layer names from config.xml 
                if (layerNames != null){
                    createSubGroupLayer(groupLayer,featureservice,vis,ids[i],minScale,maxScale,layerNames[i],listMode,legendEnabled,popupFields,popupLabels);
                } 
                // Use feature service layer names 
                else {
                    createSubGroupLayer(groupLayer,featureservice,vis,ids[i],minScale,maxScale,null,listMode,legendEnabled,popupFields,popupLabels);
                }
            }
            return groupLayer;
        }
        
        function subGroupLayerLoadFailed(event){
            // called from layerLoadFailedHandler from view.on("create-layer-error")
            // tries to reload it every 30 seconds
            var layer = event.layer;
            tries[layer.parent.title+layer.id]++;
            setTimeout(function(){
                // get popup template from config.xml
                var popupFields = [];
                var popupLabels = [];
                var listMode = "show";
                var legendEnabled = true;
                for(var i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
                    if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("group") === layer.parent.title){
                        //layer = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i];
                        if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("popup_fields")){
                            popupFields = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("popup_fields").split(",");
                            popupLabels = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("popup_labels").split(",");
                        }
                        if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("listMode")){
                            listMode = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("listMode");
                        }
                        if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("legendEnabled")){
                            legendEnabled = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("legendEnabled");
                        }
                        break;
                    }
                }

                //debug
                console.log("trying to load layer again: "+layer.parent.title+" "+layer.id);
                /* layer.id is not a number!!!!! not working
                if (layer.id == 1900) {
                tries[layer.parent.title+"19"]=1;
                //createSubGroupLayer(layer.parent,layer.url,layer.visible,19,minScale,maxScale,layer.title,listMode,legendEnabled,popupFields,popupLabels);
                }*/
                createSubGroupLayer(layer.parent,layer.url,layer.visible,layer.id,minScale,maxScale,layer.title,listMode,legendEnabled,popupFields,popupLabels);
                layer.parent.remove(layer);
            },30000);
            
        }

        function createSubGroupLayer(groupLayer,url,visible,id,minScale,maxScale,title,listMode,legendEnabled,popupFields,popupLabels){		
            var fsUrl;
            if (url[url.length-1]==="/")
                fsUrl = url + id;
            else	
                fsUrl = url +"/"+ id;
            var subGroupLayer;
            var pos = url.indexOf("/services/")+10;
            var str = url.substr(pos);
            pos = str.indexOf("/");
            var fsName = str.substr(0,pos); // trim out feature service name ie. CPWSpeciesData
            if (title !== null && title !== fsName){
                if (url.toLowerCase().indexOf("mapserver") > -1){
                    subGroupLayer = new MapImageLayer({
                        url: url,
                        //opacity: Number(alpha),
                        title: title,
                        id: id,
                        listMode: listMode,
                        legendEnabled: legendEnabled,
                        visible: visible
                    });
                }else{
                    subGroupLayer = new FeatureLayer({
                        url: fsUrl,
                        visible: visible,
                        title: title,
                        listMode: listMode,
                        legendEnabled: legendEnabled
                        //id: id, // do not use id, let it create this on it's own
                    });
                }   
                // identify popup template
                if (popupFields && popupLabels){
                    const template = addPopupTemplate(title,popupFields,popupLabels);
                    if (template != null) subGroupLayer.popupTemplate = template;
                }
            }
            else{
                if (url.toLowerCase().indexOf("mapserver") > -1){
                    subGroupLayer = new MapImageLayer({
                        url: url,
                        //opacity: Number(alpha),
                        title: title,
                        id: id,
                        listMode: listMode,
                        legendEnabled: legendEnabled,
                        visible: visible
                    });
                }else {
                    subGroupLayer = new FeatureLayer({
                        url: fsUrl,
                        visible: visible,
                        //id: id, // do not use id, let it create this on it's own
                        listMode: listMode,
                        legendEnabled: legendEnabled
                    });
                }

                // Wait until layer loads then the title will be assigned. Then remove feature service name from the title (eg. "CPWSpeciesData -")
                subGroupLayer.on("layerview-create", function(event){
                    var layer = event.layerView.layer;
                    // get the feature service name (CPWSpeciesData), and remove it from the layer name. e.g. CPWSpeciesData - Elk Winter Range
                    // featureservice = .../ArcGIS/rest/services/CPWSpeciesData/FeatureServer/
                    // remove the feature service name from the title (eg. CPWSpeciesData - )
                    if (fsName.indexOf(" - ") == -1)
                        fsName += " - ";
                    var title = layer.title.substring(fsName.length);
                    layer.title = title;
                    // identify popup template
                    if (popupFields && popupLabels){
                        const template = addPopupTemplate(title,popupFields,popupLabels);
                        if (template != null) subGroupLayer.popupTemplate = template;
                    }
                    //console.log("sub group layer loaded: "+layer.parent.title+" "+title+" url="+fsUrl);
                });
            }
            if (groupLayer.title && tries[groupLayer.title+id]>0){
                subGroupLayer.on("layerview-create", function(event){
                    var layer = event.layerView.layer;
                    // load the correct layer order from config.xml file for all group layers
                    // opGroupLayerObj = a groupLayer with layerids, ignor sub groups with no sublayers
                    if (opGroupLayerObj.length == 0){
                        for(var i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
                            // add group layer with sublayers
                            if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("layerIds")){
                                var ids = getLayerIds(xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("layerIds"));
                                for(j=0;j<ids.length;j++){
                                    //DEBUG if (ids[j] == 1900)ids[j]=19;
                                    opGroupLayerObj.push({
                                        title: ids[j],
                                        type: "layer",
                                        parentId: xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("group"),
                                        grandparentId: xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("parentGroup")
                                    });
                                }
                            }

                        }
                    }
                    // Get an array of the ids in this group, in the correct order
                    var correctOrder = [];
                    var index=0;
                    for (var i=0; i<opGroupLayerObj.length; i++){
                        if (opGroupLayerObj[i].parentId === layer.parent.title){
                            correctOrder.push(opGroupLayerObj[i].title.toString());
                            if (opGroupLayerObj[i].title.toString() === layer.id) index= correctOrder.length-1;
                        }
                    }
                    index++; // Set it to the id that should be after it.
                    if (index == correctOrder.length) layer.parent.reorder(layer,layer.parent.layers.items.length); // insert at end
                    else{
                        var reordered=false;
                        do{
                            for (i=0; i<layer.parent.layers.items.length; i++){
                                if (correctOrder[index] === layer.parent.layers.items[i].id){
                                    layer.parent.reorder(layer,i);
                                    reordered=true;
                                    break;
                                }
                            }
                            index++;
                        } while (!reordered && index < correctOrder.length);
                    }
                    //console.log("reorder group layer "+layer.title);
                });
            }

            // Add min and max Scale from config.xml
            if (minScale > 0 || maxScale > 0){
                subGroupLayer.minScale = minScale;
                subGroupLayer.maxScale = maxScale;
            }

            // TODO: testing adding definition expression (filter) and symbols. Hard coded for testing. Eventually read from config.xml
            if (fsUrl.indexOf("CPWAdminData")>0 && id == 15){
                subGroupLayer.definitionExpression = "type <> 'Road'";
                
                /*    subGroupLayer.renderer = {
                        type: "simple",
                        symbol: {
                            color: {a: 1,
                                r: 80,
                                g: 255,
                                b: 80
                            },
                            join: "round",
                            miterLimit: 2,
                            style: "dash",
                            type: "simple-line",
                            width: 2
                        },
                    };*/

            }
            // label trailheads
            /*if (fsUrl.indexOf("CPWAdminData")>0 && id==14){ 
                const labelClass = {
                    // autocasts as new LabelClass()
                    symbol: {
                      type: "text", // autocasts as new TextSymbol()
                      color: "black",
                      haloColor: [255,255,153,1.0],
                      haloSize: "2px",
                      xoffset: -23,
                      yoffset: -30,
                      horizontalAlignment: "center",
                      verticalAlignment: "baseline",
                      font: {
                        //autocasts as new Font()
                        family: "Arial",
                        size: 10
                      }
                    },
                    labelPlacement: "always-horizontal", //below-center for points
                    text: label,
                    labelExpressionInfo: {
                        expression: "$feature.name"
                    }
                };
                // TODO needs to be featureservice to add labels!!!!
                subGroupLayer.labelingInfo=[labelClass];
            }*/
            groupLayer.add(subGroupLayer);
        }

        function addPopupTemplate(title,popupFields,popupLabels){
            // For feature services can add an identify popup template
            // in config.xml layer tag add: popup_fields="field1,field2,..."
            //    popup_labels="label1,label2,..."
            if (popupFields.length > 0){
                const template ={
                    // autocasts as new PopupTemplate()
                    title: title,
                    content: [{
                        type: "fields"
                    }]
                }
                
                var fieldInfos = [];
                for (var j=0; j<popupFields.length;j++){
                    if (popupFields[j] && popupLabels[j]){
                        var info = {
                            fieldName: popupFields[j],
                            label: popupLabels[j]
                        }
                        fieldInfos.push(info);
                    } else {
                        alert("Error in config.xml missing popup_fields or popup_labels for layer "+title);
                        return null;
                    }
                }
                template.content[0].fieldInfos = fieldInfos;
                return template;
            }else {
                return null;
            }
        }

        //-----------
        // Variables
        //-----------
        loadedFromCfg = true; // the layer is loaded from config.xml. If false loaded from url &layers.
        var i;
        var opLayerObj = []; // array of top level layers/groups in the config.xml file, so we can reorder correctly if a layer fails to load
        var opGroupLayerObj = []; // array of group layers with sublayers in the config.xml file, so we can reorder correctly if a layer fails to load
        var layerObj;

        // layer create error
        view.on("layerview-create-error", layerLoadFailedHandler);		
        view.on("layerview-create", layerLoadHandler);

        // Store layers from URL into layerObj
        // 		&layer= basemap | id | opacity | visible layers , id | opacity | visible layers , repeat...
        // 		&layer= streets|layer2|.8|3-5-12,layer3|.65|2-6-10-12
        // 		get array of layers without the basemap stuff;
        if (queryObj.layer && queryObj.layer != "") {
            loadedFromCfg = false; // the layer is loaded from config.xml. If false loaded from url &layers.
            var layersArr = queryObj.layer.substring(queryObj.layer.indexOf("|") + 1).split(",");
            layerObj = {};
            //if (layersArr.length == 1) layersArr.pop(); // remove empty element if no layers are visible
            for (i = 0; i < layersArr.length; i++) {
                // build an array of objects indexed by layer id
                var layerArr = layersArr[i].split("|");
                if (layerArr[0] == "") continue;// tlb 1-5-18 if no layers are visible 
                layerArr[0] = layerArr[0].replace(/~/g, " ");
                if (layerArr.length == 3)
                    layerArr.push(true);
                if (layerArr[2] == -1)
                    layerObj[layerArr[0]] = {
                        "opacity": layerArr[1],
                        "visLayers": [], // tlb 1-5-18 used to be [-1],
                        "visible": true
                    };
                else
                    layerObj[layerArr[0]] = {
                        "opacity": layerArr[1],
                        "visLayers": layerArr[2].split("-"),
                        "visible": layerArr[3] == "1" ? true : false
                    };
                // Convert visLayers from strings to int using bitwise conversion
                for (j = 0; j < layerObj[layerArr[0]].visLayers.length; j++)
                    layerObj[layerArr[0]].visLayers[j] = layerObj[layerArr[0]].visLayers[j] | 0;
            }
        }

        // Get hide GroupSublayers & radioLayers from config.xml
        try {
            if (xmlDoc.getElementsByTagName("hideGroupSublayers")[0] && xmlDoc.getElementsByTagName("hideGroupSublayers")[0].firstChild)
                hideGroupSublayers = xmlDoc.getElementsByTagName("hideGroupSublayers")[0].firstChild.nodeValue.split(",");
        } catch (e) {
            alert("Warning: Missing hideGroupSublayers tag in " + app + "/config.xml file. " + e.message, "Data Error");
        }
        try {
            if (xmlDoc.getElementsByTagName("radiolayers")[0] && xmlDoc.getElementsByTagName("radiolayers")[0].firstChild)
                radioLayers = xmlDoc.getElementsByTagName("radiolayers")[0].firstChild.nodeValue.split(",");
        } catch (e) {
            alert("Warning: Missing radiolayers tag in " + app + "/config.xml file. " + e.message, "Data Error");
        }
        
        // ---------------------------------------------------
        //  Load each Layer from config.xml operationallayers
        // ---------------------------------------------------
        var layer = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer");
        
        // DEBUG: make if fail
        //layer[0].setAttribute("url","https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_Base_Map2/MapServer");
        //layer[1].setAttribute("url","https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_BigGame_Map2/MapServer");
        //layer[2].setAttribute("url","https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MVUM_03/MapServer");


        var groupLayers = [];
        var groupName;
        var maxScale; // The maximum scale (most zoomed in) at which the layer is visible in the view.
        var minScale; // The minimum scale (most zoomed out) at which the layer is visible in the view.
        var regexp = /([^a-zA-Z0-9 \-,\._\/:])/g;
        var popupFields = [];
        var popupLabels = [];
        var listMode = "show";
        var legendEnabled = true;
        for (i = 0; i < layer.length; i++) {
            minScale=0;
            maxScale=0;
            var url=null,layerIds=null,layerVis=null,parentGroupName = null,layerNames=null,portal=null;	
            if (layer[i].getAttribute("maxScale"))
                maxScale = layer[i].getAttribute("maxScale").replace(regexp,"");
            if (layer[i].getAttribute("minScale"))
                minScale = layer[i].getAttribute("minScale").replace(regexp,"");			
            // group layer with or without sub layers
            if (layer[i].getAttribute("group") && layer[i].getAttribute("group") != ""){
                //console.log("loading group "+layer[i].getAttribute("group")+" i="+i);
                try{
                    var groupOpacity=1,groupVis="false",groupOpen="false",radio=false;
                    groupName = layer[i].getAttribute("group").replace(regexp,"");
                    if (layer[i].getAttribute("parentGroup")){
                        parentGroupName = layer[i].getAttribute("parentGroup").replace(regexp,"");
                        if (groupLayers[parentGroupName] == undefined) {
                            alert("Invalid parentGroup ("+parentGroupName+") in layer group="+layer[i].getAttribute("group")+" in "+app+"/config.xml file.","Data Error");
                            continue;
                        }
                    }
                    if (layer[i].getAttribute("visible"))
                        groupVis = layer[i].getAttribute("visible").replace(regexp,"");
                    if (layer[i].getAttribute("open")){
                        groupOpen = layer[i].getAttribute("open").replace(regexp,"");
                        if (groupOpen === "true") openTOCgroups.push(groupName);
                    }
                    if (layer[i].getAttribute("alpha"))
                        groupOpacity = layer[i].getAttribute("alpha").replace(regexp,"");
                    if (layer[i].getAttribute("radio"))
                        radio = layer[i].getAttribute("radio").replace(regexp,"") === "true";
                    
                    // portal
                    if (layer[i].getAttribute("portal")){
                        portal = layer[i].getAttribute("portal").replace(regexp,"");
                    }
                    // Group with layers
                    if (layer[i].getAttribute("url")) {
                        url = layer[i].getAttribute("url").replace(regexp,""); // feature service
                        if (layer[i].getAttribute("layerIds"))
                            layerIds = layer[i].getAttribute("layerIds").replace(regexp,""); // string of ids 2-7,14,20
                        else {
                            alert("Missing layerIds tag in layer group, "+groupName+", in "+app+"/config.xml file.", "Data Error");
                            continue;
                        }
                        if (layer[i].getAttribute("layerVis"))
                            layerVis = layer[i].getAttribute("layerVis").replace(regexp,"").split(","); // array of visibility
                        else {
                            alert("Missing layerVis tag in layer group, "+groupName+", in "+app+"/config.xml file.", "Data Error");
                            continue;
                        }
                        if (layer[i].getAttribute("layerNames"))
                            layerNames = layer[i].getAttribute("layerNames").replace(regexp,"").split(",");
                        if (layer[i].getAttribute("popup_fields"))
                            popupFields = layer[i].getAttribute("popup_fields").split(",");
                        if (layer[i].getAttribute("popup_labels"))
                            popupLabels = layer[i].getAttribute("popup_labels").split(",");
                        if (layer[i].getAttribute("listMode")){
                            listMode = layer[i].getAttribute("listMode");
                            if (listMode !== "show" || listMode !== "hide") alert("Error in config.xml file. listMode must be show or hide for layer label: "+layer[i].label,"Data Error");
                        }
                        if (layer[i].getAttribute("legendEnabled")){
                            legendEnabled = layer[i].getAttribute("legendEnabled");
                            if (legendEnabled !== "true" || legendEnabled !== "false") alert("Error in config.xml file. legendEnabled must be true or false for layer label: "+layer[i].label,"Data Error");
                        }
                    }
                    
                    // returns a GroupLayer with feature layers added to to it. Use for group layer Elk and feature layers species data for elk.
                    groupLayers[groupName] = {"layer": addGroupLayer(groupName,groupVis,groupOpacity,radio,url,portal,minScale,maxScale,layerIds,layerVis,layerNames,listMode,legendEnabled,popupFields,popupLabels)};
                    if (parentGroupName != null && parentGroupName != "")
                        groupLayers[parentGroupName].layer.add(groupLayers[groupName].layer);
                    else{
                        mapLayers.push(groupLayers[groupName].layer);
                        map.add(groupLayers[groupName].layer);
                    }
                } catch(e) {
                    alert("Warning: misconfigured operational group layer, "+groupName+", in config.xml file. " + e.message, "Data Error");
                }
            }
            // sub layer in parent group
            else if (layer[i].getAttribute("label") && layer[i].getAttribute("parentGroup")) {
                var popupFields=[];
                var popupLabels=[];
                //console.log("loading layer "+layer[i].getAttribute("label")+" into group "+layer[i].getAttribute("parentGroup")+" i="+i);
                var label="";
                if (layer[i].getAttribute("parentGroup") && layer[i].getAttribute("parentGroup") != "")
                    parentGroupName = layer[i].getAttribute("parentGroup").replace(regexp,"");
                else {
                    alert("Missing parentGroup attribute in layer group, "+groupName+", in "+app+"/config.xml file.", "Data Error");
                    continue;
                }
                if (layer[i].getAttribute("label")){
                    label = layer[i].getAttribute("label").replace(regexp,"");
                } else {
                    alert("Missing label attribute in layer, "+i+", in operationallayers tag in "+app+"/config.xml file.", "Data Error");
                    continue;
                }
                if (layer[i].getAttribute("url")){
                    url = layer[i].getAttribute("url").replace(regexp,""); // feature service
                } else {
                    alert("Missing url attribute in layer, "+label+", in group, "+layer[i].getAttribute("parentGroup")+", in "+app+"/config.xml file.", "Data Error");
                    continue;
                }
                if (layer[i].getAttribute("alpha"))
                    var opacity = layer[i].getAttribute("alpha").replace(regexp,"");
                if (layer[i].getAttribute("visible"))
                    layerVis = layer[i].getAttribute("visible").replace(regexp,"");//.split(","); // array of visibility
                else {
                    alert("Missing visible attribute in layer, "+groupName+", in "+app+"/config.xml file.", "Data Error");
                    continue;
                }
                if (layer[i].getAttribute("popup_fields")) popupFields = layer[i].getAttribute("popup_fields").split(",");
                if (layer[i].getAttribute("popup_labels")) popupLabels = layer[i].getAttribute("popup_labels").split(",");
                var fsLayer;
                if (url.toLowerCase().indexOf("mapserver") > -1){
                    //alert("Group layer cannot be a map service at this time. Need to reprogram addMapLayer.js");
                    fsLayer = new MapImageLayer({
                        visible: layerVis === "true",
                        url: url,
                        title: label,
                        opacity: Number(opacity),
                        //layerId: label, // do not use layerId, it sets this from url
                        id: label
                    });
                }else {
                    fsLayer = new FeatureLayer({
                        visible: layerVis === "true",
                        url: url,
                        title: label,
                        opacity: Number(opacity),
                        //layerId: label, // do not use layerId, it sets this from url
                        id: label
                    });
                }
                if (minScale > 0 || maxScale > 0){
                    fsLayer.minScale = minScale;
                    fsLayer.maxScale = maxScale;
                }
            
                
                // set Symbols
                // TODO: testing adding symbols
                if (fsLayer.url.indexOf("CPWAdminData")>-1 && url.indexOf(15) > -1){
                    fsLayer.renderer = {
                            type: "simple",
                            symbol: {
                                color: {a: 1,
                                    r: 80,
                                    g: 255,
                                    b: 80
                                },
                                join: "round",
                                miterLimit: 2,
                                style: "dash",
                                type: "simple-line",
                                width: 2
                            },
                        };
                }
                // label trailheads
                if (fsLayer.url.indexOf("CPWAdminData")>-1 && url.indexOf(14) > -1){ 
                    const labelClass = {
                        // autocasts as new LabelClass()
                        symbol: {
                        type: "text", // autocasts as new TextSymbol()
                        color: "black",
                        haloColor: [255,255,153,1.0],
                        haloSize: "2px",
                        xoffset: -23,
                        yoffset: -30,
                        horizontalAlignment: "center",
                        verticalAlignment: "baseline",
                        font: {
                            //autocasts as new Font()
                            family: "Arial",
                            size: 10
                        }
                        },
                        labelPlacement: "always-horizontal", //below-center for points
                        text: label,
                        labelExpressionInfo: {
                            expression: "$feature.name"
                        }
                    };
                    // TODO needs to be featureservice to add labels!!!!
                    fsLayer.labelingInfo=[labelClass];
                }
                // end set Symbols

                // identify popup template
                if (popupFields && popupLabels){
                    const template = addPopupTemplate(label,popupFields,popupLabels);
                    if (template != null) fsLayer.popupTemplate = template;
                }

                if (groupLayers[parentGroupName])
                    groupLayers[parentGroupName].layer.add(fsLayer);
                else alert("Error in "+app+"/config.xml file. parentGroup name of "+parentGroupName+" does not exist. Must have a layer with group="+parentGroupName);
            }
            // root layer
            else if (layer[i].getAttribute("label")) {
                tries[layer[i].getAttribute("label")] = 0;
                // DEBUG make it fail
                //layer[i].setAttribute("url",layer[i].getAttribute("url")+"oooo");
                //console.log("loading layer "+layer[i].getAttribute("label")+" i="+i);				
                createLayer(layer[i]);
            }		
        }
        // -- Layer List --
        myLayerList();
    });
}


function readURLParmeters(){
    try {
        var xycoords_format = getCookie("xycoords");
        if (xycoords_format == "")
            document.getElementById('xycoords_combo').value = "dms";
        else
            document.getElementById('xycoords_combo').value = xycoords_format;
        
        // preserve new lines in way point descriptions (For future changes, if we decide to add them like the Mobile version.)
        //var location = document.location.search.replace(/\%0D/g,"newline");
        // TODO **************************** location
        //queryObjParams = new URL(window.location.toLocaleString()).searchParams;
        
        // Sanitize user input. Protect against XSS attacks.
        // test for XSS attack. Pattern contains allowed characters. [^ ] means match any character that is not
        // in the is set. \ escapes characters used by regex like .-'"|\
        var regexp;
        // For labels allow ' " for degrees minutes seconds
        // Points
        if (queryObjParams.get("point")){
            queryObjParams.get("point") = queryObjParams.get("point").replace(/~/g, " "); // for email from mobile app
            regexp=/([^a-zA-Z0-9 °\-\'\"\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("point"))) alert("Illegal characters were removed from way point labels.","Warning");
            regexp=/([^a-zA-Z0-9 °\-\'\"\|;,\.!_\*()])/g;
            queryObjParams.get("point")=queryObjParams.get("point").replace(regexp,""); // clean it
            queryObj.point = queryObjParams.get("point").replace(/newline/g,"\n"); // preserve new line characters in point description used on mobile
        }

        // Lines
        if (queryObjParams.get("line")){
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("line"))) alert("Illegal characters were removed from the line labels.","Warning");
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
            queryObj.line=queryObjParams.get("line").replace(regexp,""); // clean it
        }

        // Polygons
        if (queryObjParams.get("poly")){
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("poly"))) alert("Illegal characters were removed from the shape (polygon) labels.","Warning");
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
            queryObj.poly=queryObjParams.get("poly").replace(regexp,""); // clean it
        }

        // Rectangles
        if (queryObjParams.get("rect")){
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("rect"))) alert("Illegal characters were removed from the rectangle labels.","Warning");
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
            queryObj.rect=queryObjParams.get("rect").replace(regexp,""); // clean it
        }
        
        // Text
        if (queryObjParams.get("text")){
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("text"))) alert("Illegal characters were removed from the point labels.","Warning");
            regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
            queryObj.text=queryObjParams.get("text").replace(regexp,""); // clean it
        }

        // Layer
        if (queryObjParams.get("layer")){
            queryObjParams.get("layer") = queryObjParams.get("layer").replace(/~/g, " "); // for email from mobile app
            regexp=/([^a-zA-Z0-9 \-\|,\._()])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("layer"))) alert("Illegal characters were found on the URL. Layers may not load properly.","Warning");
            //regexp=/([^a-zA-Z0-9 \-,\._()])/g; // Used if testing for \\ above
            queryObj.layer=queryObjParams.get("layer").replace(regexp,""); // clean it
        }

        // keyword
        if (queryObjParams.get("keyword")){
            regexp=/([^a-zA-Z0-9 \-\._()])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("keyword"))) alert("Illegal characters were found on the URL. Location may not load properly.","Warning");
            //regexp=/([^a-zA-Z0-9 \-\._()])/g; // Used if testing for \\ above
            queryObj.keyword=queryObjParams.get("keyword").replace(regexp,""); // clean it
        }

        // value
        if (queryObjParams.get("value")){
            // 8-18-20 added # and / as safe characters in the value
            //regexp=/([^a-zA-Z0-9 \-\',\.!_\*()\\])/g; // allow \ for the test \" but remove it for the clean
            regexp=/([^a-zA-Z0-9 \-\',\.!_\*()\\#/&])/g; // allow \ for the test \" but remove it for the clean
            if (regexp.test(queryObjParams.get("value"))) alert("Illegal characters were found on the URL. Location may not load properly.","Warning");
            regexp=/([^a-zA-Z0-9 \-\',\.!_\*()#/&])/g;
            queryObj.value=queryObjParams.get("value").replace(regexp,""); // clean it
            // 8-18-20 single quote is used in the SQL expression, replace it with '' and it will be used as '.
            var quote = /'/g;
            queryObj.value = queryObjParams.get("value").replace(quote,"''");
        }

        // label
        if (queryObjParams.get("label")){
            regexp=/([^a-zA-Z0-9 \-\',\.!_\*()#&/\\])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("label"))) alert("Illegal characters were found on the URL. Point labels may not load properly.","Warning");
            regexp=/([^a-zA-Z0-9 \-\',\.!_\*()#&/])/g;
            queryObj.label=queryObjParams.get("label").replace(regexp,""); // clean it
        }

        // map
        if (queryObjParams.get("map")){
            regexp=/([^a-zA-Z0-9 \-,\._():\/])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("map"))) alert("Illegal characters were found on the URL. Map may not load properly.","Warning");
            //regexp=/([^a-zA-Z0-9 \-\=,\._():\/])/g; // Used if testing for \\ above
            queryObj.map=queryObjParams.get("map").replace(regexp,""); // clean it
        }

        // field
        if (queryObjParams.get("field")){
            regexp=/([^a-zA-Z0-9 \-_])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("field"))) alert("Illegal characters were found on the URL. Map may not load properly.","Warning");
            //regexp=/([^a-zA-Z0-9 \-\=,\._():\/])/g; // Used if testing for \\ above
            queryObj.field=queryObjParams.get("field").replace(regexp,""); // clean it
        }

        // projection Only allow integers.
        if (queryObjParams.get("prj") && isNaN(queryObjParams.get("prj"))) {
            queryObj.prj = 102100;
            alert("Problem reading map projection from the URL, defaulting to WGS84. addMapLayers.js/readURLParmeters","Warning");
        }else if (queryObjParams.get("prj"))
            queryObj.prj = queryObjParams.get("prj");

        // Extent
        if (queryObjParams.get("extent")){
            regexp=/([^0-9 \-,\.])/g; // allow \ for the test (\' \") but remove it for the clean
            if (regexp.test(queryObjParams.get("extent"))) alert("Illegal characters were found on the URL. Map extent may not load properly.","Warning");
            queryObj.extent=queryObjParams.get("extent").replace(regexp,""); // clean it
        }

        // Place
        if (queryObjParams.get("place")){
            regexp=/([^a-zA-Z0-9 \-\',\.!_*():#&/\\])/g; // allow \ for the test (\' \") but remove it for the clean, : used in degree, min, sec point
            if (regexp.test(queryObjParams.get("place"))) alert("Illegal characters were found on the URL. Location may not load properly.","Warning");
            regexp=/([^a-zA-Z0-9 \-\',\.!_*():#&/])/g;
            queryObj.place=queryObjParams.get("place").replace(regexp,""); // clean it
        }
    }catch (err) {
        alert("Problem reading URL parameters. addMapLayers.js/readURLParmeters.\n\n"+err,"Error")
    }
    addMapLayers();
    addGraphicsAndLabels();
    zoomToQueryParams();
}

function readConfig(){
    // read config.xml
    require(["esri/geometry/Extent"],Extent => {
        try{
            var xmlhttp = createXMLhttpRequest();
            var configFile = app + "/config.xml?v=" + Date.now(); //+ ndisVer;
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status === 200) {
                    xmlDoc = createXMLdoc(xmlhttp);
                    // Set Geometry ServicenURL
                    try{
                        geometryService = xmlDoc.getElementsByTagName("geometryservice")[0].getAttribute("url");
                    } catch (e) {
                        alert('Missing tag: geometryservice in ' + app + '/config.xml.\n\nTag should look like: &lt;geometryservice url="https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/Utilities/Geometry/GeometryServer"/&gt;\n\nWill use that url for now.', 'Data Error');
                        geometryService = "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/Utilities/Geometry/GeometryServer";
                    }
                    // Set Print Service for PrintTask				  
                    try {
                        printServiceUrl = xmlDoc.getElementsByTagName("printservice")[0].firstChild.nodeValue;
                    } catch (e) {
                        alert('Missing tag: printservice in ' + app + '/config.xml.\n\nTag should look like: &lt;printservice&gt;https://ndismaps.nrel.colostate.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task&lt;/printservice&gt;\n\nWill use that url for now.', 'Data Error');
                        printServiceUrl = "https://ndismaps.nrel.colostate.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";
                    }
                    try {
                        printGeoServiceUrl = xmlDoc.getElementsByTagName("printservicegeo")[0].firstChild.nodeValue;
                    } catch (e) {
                        alert('Missing tag: printservicegeo in ' + app + '/config.xml.\n\nTag should look like: &lt;printservicegeo&gt;https://ndismaps.nrel.colostate.edu/arcgis/rest/services/PrintTemplate/georefPrinting/GPServer/georefPrinting&lt;/printservice&gt;\n\nWill use that url for now.', 'Data Error');
                        printGeoServiceUrl = "https://ndismaps.nrel.colostate.edu/arcgis/rest/services/PrintTemplate/georefPrinting/GPServer/georefPrinting";
                    }
                    var title;
                    try {
                        title = xmlDoc.getElementsByTagName("title")[0].firstChild.nodeValue;
                    } catch (e) {
                        alert("Warning: Missing title tag in " + app + "/config.xml file. " + e.message, "Data Error");
                    }
                    try {
                        if (screen.width <= 768)
                            title = title.replace("Colorado","CO");
                        document.getElementById("title").innerHTML = title;
                        
                        document.title = title;
                        //document.getElementById("subtitle").innerHTML = xmlDoc.getElementsByTagName("subtitle")[0].firstChild.nodeValue;
                        document.getElementById("logo").src = xmlDoc.getElementsByTagName("logo")[0].firstChild.nodeValue;
                        //document.getElementById("logourl").href = xmlDoc.getElementsByTagName("logourl")[0].firstChild.nodeValue;
                    } catch (e) {
                        alert("Warning: Missing title, subtitle, logo, or logurl tag in " + app + "/config.xml file. " + e.message, "Data Error");
                    }
                    if (xmlDoc.getElementsByTagName("noDisclaimer") && xmlDoc.getElementsByTagName("noDisclaimer")[0] && xmlDoc.getElementsByTagName("noDisclaimer")[0].firstChild.nodeValue == "true") {}
                    else if (getCookie("noDisclaimer") != 1)
                        loadDisclaimer(title);
                    // Set up Find a Place												   
                    try {
                        myFindService = xmlDoc.getElementsByTagName("findplaceservice")[0].getAttribute("url");
                    } catch (e) {
                        alert('Missing tag: findplaceservice in ' + app + '/config.xml.\n\nTag should look like: &lt;findplaceservice url="https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/GNIS_Loc/GeocodeServer"/&gt;\n\nWill use that url for now.', 'Data Error');
                        myFindService = "https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/GNIS_Loc/GeocodeServer";
                    }
                    /*try {
                        findPlaceInit();
                    } catch (e) {
                        alert("Error in javascript/FindPlace.js " + e.message, "Code Error", e);
                    }*/
                    // Set initial/full map extent
                    try {
                        ext = xmlDoc.getElementsByTagName("map")[0].getAttribute("initialextent").split(" ");
                        wkid = parseInt(xmlDoc.getElementsByTagName("map")[0].getAttribute("wkid").trim());
                        // save Colorado extent. This is used in print to see if they are trying to print outside of Colorado.
                        // initExtent is not always the full extent. For example if they had an extent on the URL it does not use this one.
                        fullExtent = new Extent({
                            "xmin": parseFloat(ext[0]),
                            "ymin": parseFloat(ext[1]),
                            "xmax": parseFloat(ext[2]),
                            "ymax": parseFloat(ext[3]),
                            "spatialReference": {
                                "wkid": wkid
                            }
                        });
                    } catch (e) {
                        alert("Warning: Missing tag attributes initalextent or wkid for the map tag in " + app + "/config.xml file. " + e.message, "Data Error");
                    }
                    // Add Links to Help
                    var helplink = [];
                    if (!xmlDoc.getElementsByTagName("links")[0])
                        alert("Fatal Error: Missing links tag in config.xml file.","Data Error");
                    if (xmlDoc.getElementsByTagName("links")[0].getElementsByTagName("helplink"))
                        helplink = xmlDoc.getElementsByTagName("links")[0].getElementsByTagName("helplink");
                    var size = "30px";
                    if (xmlDoc.getElementsByTagName("links")[0].getElementsByTagName("iconsize"))
                        size = xmlDoc.getElementsByTagName("links")[0].getElementsByTagName("iconsize")[0].innerHTML;
                    var linkStr = "";
                    for (var i = 0; i < helplink.length; i++) {
                        linkStr += '<p><a href="' + helplink[i].getAttribute("url").replace("%3F", "?").replace("%26", "&");
                        linkStr += '" target="_new"><img src="' + helplink[i].getAttribute("icon") + '" aria-hidden="true" style="width:'+size+';vertical-align:middle;margin-right:10px;"/><span>' + helplink[i].getAttribute("label") + '</span></a> ';
                        if (helplink[i].getAttribute("text"))
                            linkStr += '<span>'+helplink[i].getAttribute("text")+'</span>';
                        linkStr += '</p>';
                    }
                    linkStr += '<h3 style="border-bottom:1px solid lightgray;">Links</h3>';
                    var link = xmlDoc.getElementsByTagName("links")[0].getElementsByTagName("link");
                    for (var i = 0; i < link.length; i++) {
                        // link that goes to current map extent
                        if (link[i].getAttribute("extent")){
                            linkStr += '<p><a class="link" onclick="javascript:linkWithExtent(\''+link[i].getAttribute("url").replace("%3F", "?").replace("%26", "&") + "')";
                        }
                        else linkStr += '<p><a href="'+link[i].getAttribute("url").replace("%3F", "?").replace("%26", "&");
                        linkStr += '" target="_new"><img src="' + link[i].getAttribute("icon") + '" aria-hidden="true" style="width:'+size+';vertical-align:middle;margin-right:10px;"/><span>' + link[i].getAttribute("label") + '</span></a> ';
                        if (link[i].getAttribute("text"))
                            linkStr += '<span>'+link[i].getAttribute("text")+'</span>';
                        linkStr += '</p>';
                    }
                    const linkDiv = document.createElement("div");
                    linkDiv.innerHTML = linkStr;
                    // add links to help
                    helpContent.appendChild(linkDiv);

                    readURLParmeters(); // calls addMapLayers
                } 
                // if missing file
                else if (xmlhttp.status === 404) {
                    alert("Error: Missing config.xml file in " + app + " directory.", "Data Error");
                    hideLoading();
                } else if (xmlhttp.readyState === 4 && xmlhttp.status === 500) {
                    alert("Make sure your application name is correct on the URL. app=" + app, "Warning");
                    hideLoading();
                }
            };
            xmlhttp.open("GET", configFile, true);
            xmlhttp.send(null);
        } catch (e) {
            alert("Error in js/addMapLayers.js readConfig. " + e.message, "Code Error", e);
        }
    });
}

function linkWithExtent(url){
    // Add current extent to the url and open in a new tab
    url +=  "&extent="+view.extent.xmin+","+view.extent.ymin+","+view.extent.xmax+","+view.extent.ymax+"&prj=102100";
    window.open(url,"_blank");
}

function zoomToQueryParams(){
    require(["esri/geometry/Extent","esri/geometry/SpatialReference","esri/rest/support/ProjectParameters", "esri/rest/geometryService"],
        function(Extent,SpatialReference,ProjectParameters,GeometryService){
        // Zoom to extent on startup if specified on url
        if (queryObj.extent && queryObj.extent != "") {
            var extArr = [];
            if (Object.prototype.toString.call(queryObj.extent) === '[object Array]')
                extArr = queryObj.extent[0].split(",");
            else
                extArr = queryObj.extent.split(",");
            var prj;
            if (queryObj.prj && queryObj.prj != ""){
                prj = queryObj.prj;
            }
            else {
                // check for lat long
                if (extArr[0] < 0 && extArr[0] > -200) {
                    prj = 4326;
                } else
                    prj = 26913;
            }
            const myExtent = new Extent({
                    "xmin": parseFloat(extArr[0]),
                    "ymin": parseFloat(extArr[1]),
                    "xmax": parseFloat(extArr[2]),
                    "ymax": parseFloat(extArr[3]),
                    "spatialReference": {
                        "wkid": parseInt(prj)
                    }
            });
            var params = new ProjectParameters();
            params.geometries = [myExtent];
            params.outSpatialReference = new SpatialReference(wkid);
            GeometryService.project(geometryService,params).then((newExt) => {
                initExtent = newExt[0];
                view.extent = initExtent;
            }).catch ( (error) => {
                let msg = "There was a problem converting the extent read from the URL to Web Mercator projection. extent=" + extArr[0] + ", " + extArr[1] + ", " + extArr[2] + ", " + extArr[3] + "  prj=" + prj + "  " + error.message;
                alert(msg, "URL Extent Error", error,"Data Error");
            });
            
        // Use initextent read from config.xml file
        } else {
            initExtent = new Extent({
                    "xmin": parseFloat(ext[0]),
                    "ymin": parseFloat(ext[1]),
                    "xmax": parseFloat(ext[2]),
                    "ymax": parseFloat(ext[3]),
                    "spatialReference": {
                        "wkid": wkid
                    }
                });
            view.extent = initExtent;
        }
        
        // Zoom to a place on startup
        if (queryObj.place && queryObj.place != "") {
            var place = queryObj.place.replace("%20", " ");
            if (queryObj.prj && queryObj.prj != ""){
                settings = {
                    XYProjection: queryObj.prj
                };
            }
            // check if it is a xy coordinate
            var digits = "0123456789-";
            if (digits.indexOf(place.substring(0, 1)) > -1 && place.indexOf(",") > -1) {
                handleCoordinate(place);
            }
            else{
                if (place.toLowerCase().indexOf("gmu ") == 0) place = place.substring(4);
                if (place.toLowerCase().indexOf(" county") > -1) place = place.substring(0,place.length-7);
                if (queryObj.label)labelFromURL = true;
                if(searchWidget && searchWidget.search)
                    searchWidget.search(place);
                else{
                    var tim = setInterval(function(){
                        if(searchWidget && searchWidget.search) {
                            searchWidget.search(place);
                            clearInterval(tim);
                        }
                    },500);
                }
            }
        }
        
        // Zoom to a keyword and value on startup
        if (queryObj.keyword && queryObj.keyword != "") {
            if (!queryObj.value || queryObj.value == "")
                alert("When &keyword is used on the URL, there must be a &value also.", "URL Keyword/Value Error");
            else {
                require(["esri/rest/query", "esri/rest/support/Query"], function (query, Query) {
                    var urlFile = app + "/url.xml?v=" + ndisVer;
                    var xmlurl = createXMLhttpRequest();
                    xmlurl.onreadystatechange = function () {
                        if (xmlurl.readyState == 4 && xmlurl.status === 200) {
                            var xmlDoc = createXMLdoc(xmlurl);
                            var layer = xmlDoc.getElementsByTagName("layer");
                            for (var i = 0; i < layer.length; i++) {
                                if (!layer[i].getElementsByTagName("keyword")[0] || !layer[i].getElementsByTagName("keyword")[0].firstChild)
                                    alert("Missing tag keyword or blank, in " + app + "/url.xml file.", "Data Error");
                                if (queryObj.keyword == layer[i].getElementsByTagName("keyword")[0].firstChild.nodeValue)
                                    break;
                            }
                            if (i == layer.length)
                                alert("Keyword [" + queryObj.keyword + "] is not defined in " + app + "/url.xml file.", "Data Error");
                            else {
                                if (!layer[i].getElementsByTagName("url")[0] || !layer[i].getElementsByTagName("url")[0].firstChild)
                                    alert("Missing tag url or blank, in " + app + "/url.xml file for keyword: " + queryObj.keyword + ".", "Data Error");
                                if (!layer[i].getElementsByTagName("expression")[0] || !layer[i].getElementsByTagName("expression")[0].firstChild)
                                    alert("Missing tag expression, in " + app + "/url.xml file for keyword: " + queryObj.keyword, "Data Error");
                                else {
                                    var expr = layer[i].getElementsByTagName("expression")[0].firstChild.nodeValue.replace("[value]", queryObj.value);
                                    
                                    const params = new Query({
                                        returnGeometry: true,
                                        where: expr
                                    });
                                    query.executeQueryJSON(layer[i].getElementsByTagName("url")[0].firstChild.nodeValue, params).then((response) =>  {
                                        if (response.features.length == 0) {
                                            gotoLocation(queryObj.value, true);
                                        } else {
                                            // Zoom to point or polygon
                                            require(["esri/geometry/Point", "esri/Graphic"],
                                            function (Point, Graphic) {
                                                var pt;
                                                if (response.geometryType === "point") {
                                                    var level = 24000; // 4-21-17 Updated lods, used to be 14
                                                    if (layer[i].getElementsByTagName("mapscale")[0] && layer[i].getElementsByTagName("mapscale")[0].firstChild){
                                                        level = parseInt(layer[i].getElementsByTagName("mapscale")[0].firstChild.nodeValue);
                                                        if (level < 1000){
                                                            switch (level){
                                                                case (7):
                                                                    level = 50000
                                                                case (6):
                                                                    level = 100000
                                                                case (5):
                                                                    level = 250000
                                                                default:
                                                                    level = 24000
                                                            }
                                                        }
                                                    }
                                                    pt = new Point(response.features[0].geometry.x, response.features[0].geometry.y, response.spatialReference);
                                                    // zoom to point
                                                    view.goTo({
                                                        target: pt,
                                                        scale: level
                                                    });
                                                    // add point symbol
                                                    addTempPoint(pt);
                                                    if (queryObj.label && queryObj.label != "") {
                                                        // add label view.graphics
                                                        addTempLabel(pt,queryObj.label,11,true);
                                                    }
                                                } else if (response.geometryType === "polygon") {
                                                    var union=false;
                                                    if (layer[i].getElementsByTagName("union")[0] && layer[i].getElementsByTagName("union")[0].firstChild &&
                                                        layer[i].getElementsByTagName("union")[0].firstChild.nodeValue.toLowerCase() === "true"){
                                                            union=true;
                                                    }
                                                    // zoom to extent of first feature
                                                    if (!union){
                                                        pt = response.features[0].geometry.centroid;
                                                        view.extent = response.features[0].geometry.extent.clone().expand(1.5);
                                                        addTempPolygon(response.features[0]);
                                                    }

                                                    // zoom to extent of all features 1-14-19
                                                    else{
                                                        var newExtent = response.features[0].geometry.extent;//new Extent(response.features[0].geometry.getExtent());
                                                        //var largestArea = 0;
                                                        //var indexLgArea = 0; // feature index for the largest area to center the label over
                                                        for (var j = 0; j < response.features.length; j++) { 
                                                            var thisExtent = response.features[j].geometry.extent;
                                                            // center label over largest polygon
                                                            /*area = thisExtent.width * thisExtent.height;
                                                            if (area > largestArea){
                                                                largestArea = area;
                                                                indexLgArea = j;
                                                            }*/
                                                            // making a union of all polygon extents
                                                            newExtent = newExtent.union(thisExtent);
                                                            // highlight polygons
                                                            addTempPolygon(response.features[j]);
                                                            // label each polygon
                                                            if (queryObj.label && queryObj.label != "") {
                                                                // add label to view.graphics
                                                                addTempLabel(response.features[j],queryObj.label,11,true);
                                                            }
                                                        }
                                                        view.extent = newExtent.clone().expand(1.5);
                                                        //pt = response.features[indexLgArea].geometry.extent.center;
                                                    }	

                                                    
                                                } else {
                                                    // not a point or polygon
                                                    view.extent = response.features[0].geometry.extent;
                                                    //map.setExtent(response.features[0].geometry.getExtent(), true);
                                                    poly[0] = new Graphic({
                                                        geometry: view.extent,
                                                        symbol: polySymbol
                                                    });
                                                    view.graphics.add(poly[0]);
                                                    setTimeout(function(){
                                                        view.graphics.remove(poly[0]);
                                                    },10000);
                                                    pt = view.extent.center;
                                                    if (queryObj.label && queryObj.label != "") {
                                                        addTempLabel(pt,queryObj.label,12,true);
                                                    }
                                                }
                                            });
                                        }
                                    }).catch ( (error) => {
                                        if (error.responseText) {
                                            alert("Error: Failed to zoom to keyword=" + queryObj.keyword + " value=" + queryObj.value + " " + error.message + error.responseText, "URL Keyword/Value Error", error);
                                        } else {
                                            alert("Error: Failed to zoom to keyword=" + queryObj.keyword + " value=" + queryObj.value + " " + error.message, "URL Keyword/Value Error", error);
                                        }
                                    });
                                }
                            }
                        } else if (xmlurl.status === 404)
                            alert("Missing url.xml file in " + app + " directory.", "Data Error");
                        else if (xmlurl.readyState === 4 && xmlurl.status === 500)
                            alert("Error: had trouble reading " + app + "/url.xml file in readConfig.js.", "Data Error");
                    };
                    xmlurl.open("GET", urlFile, true);
                    xmlurl.send(null);
                });
            }
        }
        if (queryObj.map && queryObj.map != "") {
            if (!queryObj.value || queryObj.value == "" || !queryObj.field || queryObj.field == "")
                alert("When &map is used on the URL, there must also be an &field and &value.", "URL Map/Value Error");
            else {
                //require(["esri/request", "esri/tasks/QueryTask", "esri/tasks/query"], function (esriRequest, QueryTask, Query) {
                require(["esri/rest/query", "esri/rest/support/Query"], function (query, Query) {
                    var expr;	
                    //var queryTask = new QueryTask(queryObj.map);
                    //var query = new Query();
                    if (Number(queryObj.value))
                        expr = queryObj.field + "=" + queryObj.value;
                    else
                        expr = "UPPER(" + queryObj.field + ") LIKE UPPER('" + queryObj.value + "')";
                    const params = new Query({
                        returnGeometry: true,
                        where: expr
                    });
                    query.executeQueryJSON(queryObj.map, params).then((response) =>  {

                    //queryTask.execute(query, function (response) {
                        // Zoom to point or polygon
                        require(["esri/geometry/Point"], function (Point) {
                            if (response.features.length == 0)
                                alert("Cannot zoom to " + queryObj.value + ". The feature was not found in " + queryObj.map + " for field " + queryObj.field, "URL Map/Value Error");
                            else {
                                if (response.geometryType == "point"){
                                    let pt = new Point(response.features[0].geometry.x, response.features[0].geometry.y, response.spatialReference);
                                    view.goTo({
                                        target: pt,
                                        scale: 24000
                                    });
                                    addTempPoint(pt);
                                    //map.centerAndZoom(new Point(response.features[0].geometry.x, response.features[0].geometry.y, response.spatialReference), 8);
                                }
                                else  {
                                    view.extent = response.features[0].geometry.extent.clone().expand(1.5);
                                    addTempPolygon(response.features[0]);
                                }
                            }
                        });
                    }, function (error) {
                        if (error.responseText)
                            alert("Error: QueryTask failed for map=" + queryObj.map + " " + error.message + error.responseText, "URL Map/Value Error", error);
                        else
                            alert("Error: QueryTask failed for map=" + queryObj.map + " " + error.message, "URL Map/Value Error", error);
                    });
                });
            }
        }
    });
}






// NOT USED ********
function getLegendInfo(rootLayer){
    var url;
    const layer = rootLayer;
    try{
        // without ?f=pjson it returns html
        url = rootLayer.url + '/legend?f=pjson';
        if (rootLayer.url.toLowerCase().indexOf("featureserver") > -1)
            url = rootLayer.url+"/"+rootLayer.layerId+"?f=pjson";      
    
    } catch(e){
        alert(e.getMessage);
        return;
    }
    // DEBUG
    //console.log("Loading legend: "+url);
    
    require(["esri/request"], (esriRequest) => {
        esriRequest(url, {
            responseType: "json"
        }).then((response) => {
            // The requested data
            let geoJson = response.data;
            const layerlist = document.getElementById(layer.title.replace(/ /g,"_") +"_dialog").querySelector("calcite-list");
            const layerlistitems = layerlist.children;
            for (var i=0; i<layerlistitems.length; i++){
                let legendObj = geoJson.layers.find(obj => {
                    if (layerlistitems[i].value)
                        return obj.layerName === layerlistitems[i].value;
                    else if (layerlistitems[i].textContent)
                        return obj.layerName === layerlistitems[i].textContent;
                });
                if(legendObj && legendObj.legend){
                    for (var j=0; j<legendObj.legend.length; j++){
                        const img = document.createElement("img");
                        const src = "data:"+legendObj.legend[j].contentType+";base64,"+legendObj.legend[j].imageData;
                        img.src = src;
                        img.id = "legendImage";
                        img.width = legendObj.legend[j].width;
                        img.height = legendObj.legend[j].height;
                        
                        if (legendObj.legend.length == 1){
                            img.slot = "actions-start";
                            img.style.marginLeft = "10px";
                            layerlistitems[i].appendChild(img);
                        } else {
                            img.slot = "content-bottom";
                            img.style.marginLeft = "30px";
                            layerlistitems[i].appendChild(img);
                            const label = document.createElement("span");
                            label.innerHTML = legendObj.legend[j].label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                            label.slot = "content-bottom";
                            label.style.marginLeft = "60px";
                            label.style.top = "-"+img.width+"px";
                            label.style.position = "relative";
                            layerlistitems[i].appendChild(label);
                        }

                    }
                }
                else {
                    legendObj = geoJson.layers.find(obj => {
                        return obj.name === layerlistitems[i].value;
                    });
                    if(legendObj && legendObj.drawingInfo){
                        console.log("feature layer legend TODO *******");
                    }
                }
            };
        }).catch((err) => {
            if (err.details && err.details.messages)
              console.error('Error encountered loading legend for ', err.details.url, err.details.messages[0], ' Trying again.');
            else console.error('Error encountered loading legend for ', err.details.url, ' Trying again.');
            setTimeout(function(rootLayer){
                // debug don't keep calling right now!!!!!!!
                //getLegendInfo(rootLayer);
            },30000, rootLayer);
        });
    });
}