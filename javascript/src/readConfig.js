// Read config.xml file and also URL paramaters

//const { regexpDot } = require("jshint/src/reg");

// globals
var locator;
var addressGraphicsCount = []; // store names of graphics layers used to display address.
var addressGraphicsCounter = 0;
var layerObj; // holds layer id, visiblelayers, visible when read from url &layer=...
var searchWidget;

//**********************
// Read config.xml file
//**********************
function readConfig() {
	//"esri/widgets/Sketch",
	// "agsjs/dijit/TOC", "esri/tasks/locator", "esri/widget/Popup",
	require(["dojo/dom", "dojo/io-query", "esri/core/promiseUtils", "esri/core/reactiveUtils", "esri/layers/GroupLayer", "esri/layers/MapImageLayer",
	 "esri/layers/FeatureLayer", "esri/rest/geometryService",
	 "esri/geometry/SpatialReference", "esri/Graphic", "esri/Map", "esri/views/MapView","esri/widgets/Print","esri/geometry/Extent",
	 "esri/widgets/Home", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/Legend", "esri/widgets/Bookmarks", "esri/widgets/Locate", "esri/widgets/Search", "esri/widgets/ScaleBar", "esri/widgets/Slider", "esri/rest/support/ProjectParameters",
	 "dijit/TitlePane", "esri/widgets/Sketch", "esri/geometry/geometryEngine", "esri/layers/GraphicsLayer"], 
	 function (dom, ioquery, promiseUtils, reactiveUtils, GroupLayer, MapImageLayer, FeatureLayer, GeometryService, SpatialReference,
		Graphic, Map, MapView, Print, Extent, Home, Expand, LayerList, Legend, Bookmarks, Locate, Search, ScaleBar, Slider, ProjectParameters,
		TitlePane, Sketch, geometryEngine, GraphicsLayer) {
		var xmlDoc; // config.xml document json
		var ext;
		openTOCgroups=[];
		var tries={}; // number of times we have tried to load each map layer
		var loadedFromCfg; // true when the layer has loaded and set the visiblelayers when setting layers from URL
		var labelFromURL = false;
		var basemapExpand;

		// adjust title for mobile
        if (screen.width < 768){
			var title = document.getElementById("title").innerHTML;
			if (title.indexOf("Colorado") > -1){
			  title = "CO " + title.substring(title.indexOf(" ")+1);
			  document.getElementById("title").innerHTML = title;
			}
		}

		setupBasemapLayers();

		// ------------------
		//  Basemaps Gallery
		// ------------------
		function setupBasemapLayers(){
			require([
			"esri/Basemap",
			"esri/layers/VectorTileLayer",
			"esri/layers/MapImageLayer",
			"esri/layers/FeatureLayer"
			], (Basemap,VectorTileLayer,MapImageLayer,FeatureLayer)  => {
				var layer;
				// Old world streets
				/*layer = new MapImageLayer({url:"https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"});
				streets = new Basemap({
					baseLayers:[layer],
					title:"Streets",
					id:"streets",
					thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/2ea9c9cf54cb494187b03a5057d1a830/info/thumbnail/Jhbrid_thumb_b2.jpg"
				});*/

				// World Streets Vector with Hillshade
				//var layer1 = new VectorTileLayer({url:"https://tiledbasemaps.arcgis.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer"});//requires username and password
				layer = new VectorTileLayer({url:"https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer"});
				streets = new Basemap({
					baseLayers:[layer],
					title:"Streets",
					id:"streets",
					thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/2ea9c9cf54cb494187b03a5057d1a830/info/thumbnail/Jhbrid_thumb_b2.jpg"
				});

				/*esri jsapi 4 examples
				let vtlLayer = new VectorTileLayer({
				// URL to the style of vector tiles
					url: "https://www.arcgis.com/sharing/rest/content/items/4cf7e1fb9f254dcda9c8fbadb15cf0f8/resources/styles/root.json"
				});

				let vtlLayer = new VectorTileLayer({
				// URL to the vector tile service
					url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer"
				});*/
				
				
				// Old Streets
				/*let streetsLayer = new VectorTileLayer({url:"https://www.arcgis.com/sharing/rest/content/items/b266e6d17fc345b498345613930fbd76/resources/styles/root.json"});
				let streets = new Basemap({
					baseLayers:[streetsLayer],
					title:"Streets",
					id:"streets",
					thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/f81bc478e12c4f1691d0d7ab6361f5a6/info/thumbnail/street_thumb_b2wm.jpg"
				});*/

				// Aerial Photo
				var layers=[];
				layer = new MapImageLayer({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
				});
				layers.push(layer);
				layer = new VectorTileLayer({
					url: "https://www.arcgis.com/sharing/rest/content/items/30d6b8271e1849cd9c3042060001f425/resources/styles/root.json"
				});
				layers.push(layer);
				aerial = new Basemap({
					baseLayers:layers,
					title:"Aerial Photo",
					id:"aerial",
					thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/f81bc478e12c4f1691d0d7ab6361f5a6/info/thumbnail/street_thumb_b2wm.jpg"
				});

				// Add USGS Digital Topo back in. ESRI removed it 6-30-19
				// try id: f33a34de3a294590ab48f246e99958c9 esri nat geo
				layer = new MapImageLayer({
					//url: "https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer"  // no topo
					url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer"
				});
				natgeo = new Basemap({
					baseLayers:[layer],
					title:"USGS Digital Topo",
					id:"natgeo",
					thumbnailUrl:"https://usfs.maps.arcgis.com/sharing/rest/content/items/6d9fa6d159ae4a1f80b9e296ed300767/info/thumbnail/thumbnail.jpeg"
				});

				// USGS Scanned Topo
				// thumbnail moved no longer esists: //"https://www.arcgis.com/sharing/rest/content/items/931d892ac7a843d7ba29d085e0433465/info/thumbnail/usa_topo.jpg"
				layer=new MapImageLayer({
					url:"https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer",
					dpi:300
				});
				topo = new Basemap({
					baseLayers:[layer],
					title:"USGS Scanned Topo",
					id:"topo",
					thumbnailUrl:"assets/images/USA_topo.png"
				});

				// Aerial with Topos
				layer=new MapImageLayer({url:"https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer",dpi:300});
				imagery_topo = new Basemap({
				baseLayers:[layer],
				title:"Aerial Photo with USGS Contours",
				id: "imagery_topo",
				dpi:300,
				thumbnailUrl:"assets/images/aerial_topo.png"
				});

				// ESRI Digital Topo
				layer=new MapImageLayer({url:"https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"});
				// old thumb thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/30e5fe3149c34df1ba922e6f5bbf808f/info/thumbnail/ago_downloaded.jpg"
				topo2 = new Basemap({
				baseLayers:[layer],
				title:"ESRI Digital Topo",
				id:"topo2",
				thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/588f0e0acc514c11bc7c898fed9fc651/info/thumbnail/topo_thumb_b2wm.jpg"
				});
			});
		}

		class My_BasemapGallery {

			constructor(){
				try{
				// create basemap services
				//this.setupLayers();
				this.menu =  document.createElement("ul");
				this.bmGallery = document.createElement("div");
				this.bmGallery.style.backgroundColor = "#fff";
				this.bmGallery.className ="esri-widget";
				this.bmGallery.appendChild(this.menu);
				this.menu.role = "menu";
				this.bmGallery.id = "bmGallery";

				// add basemap layers
				this.add("streets","Streets","assets/images/streets_thumb.jpg",true);
				this.add("aerial","Aerial Photo","assets/images/aerial_thumb.jpg",false);
				this.add("topo","USGS Scanned Topo","assets/images/USA_topo.png",false);
				this.add("natgeo","USGS Digital Topo","assets/images/natgeothumb.jpg",false);
				this.add("imagery_topo","Aerial Photo with USGS Contours","assets/images/aerial_topo.png",false);
				this.add("topo2","ESRI Digital Topo","assets/images/topo2_thumb.jpg",false);
				return this.bmGallery;
				}catch (e) {
					alert("Error in myBasemapGallery. "+e.getMessage, "Error");
				}
			}

			add(id, title, thumbnail, selected){
				// id - internal basemap title, used in toggleBasemap()
				// title - display title
				// thumbnail - thumbnail image
				// selected - true or false
				const basemap = document.createElement("li");
				basemap.id = id;
				if (selected) basemap.className="bmSelected";
				else basemap.className="bmUnselected";
				basemap.ariaSelected="true";
				basemap.role="menu-item";
				basemap.title=title;
				const img = document.createElement("img");
				img.src=thumbnail;
				img.addEventListener("click",this.toggleBasemap);
				img.id=id;
				basemap.appendChild(img);
				const label = document.createElement("div");
				label.style.textAlign="center";
				label.innerHTML=title;
				label.id=id;
				basemap.appendChild(label);
				this.menu.appendChild(basemap);
			}
			toggleBasemap(event){
				const name = event.target.id;
				document.getElementsByClassName("bmSelected")[0].className = "bmUnselected";
				document.getElementById(name).className = "bmSelected";
				map.basemap = window[name]; // get variable
				basemapExpand.expanded = false;
			}
		}


		//----------------------------------------------------------------
		// Add Points, Lines, Polygons, Rectangles, Labels
		//----------------------------------------------------------------
		function addGraphicsAndLabels() {
			try {
				var sr;
				if (!queryObj.prj || queryObj.prj == "")
					sr = new SpatialReference(102100);
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
				alert("Error loading graphics from the URL. In javascript/readConfig.js. Error message: " + e.message, "URL Graphics Error", e);
			}
		}

		//******************
		//  ADD MAP LAYERS
		//
		//  addMapLayers calls creatLayer for each layer in the operationallayers tag in the config.xml file.
		//  createLayer calls layerLoadFailedHandler
		//  layerLoadFailedHandler waits then calls createLayer again, reports error after 5 tries and increases time between calls to 30 seconds.
		//  map.on("layer-add-result") listens for layer to load to map. Updates the toc with new layers. Waits for all to have tried to load,
		//  reorders legendLayers and map layers
		//******************
		function addMapLayers(){
			// 3-21-22 use layer.on("load") and layer.on("error") to make sure layers have loaded

			// Create Layer 3-21-22
			// Get layers from url of config.xml
			function createLayer(layer){
				var id = layer.getAttribute("label");
				
				// if already loaded return
				for (var i=0;i<view.allLayerViews.items.length;i++){
					if (id === view.allLayerViews.items[i].layer.id && view.allLayerViews.items[i].layer.loaded) 
						return;
				}

				var myLayer;
				tries[id]++;
				// Set layer properties on startup if specified on url
				if (queryObj.layer && queryObj.layer != "") {
					if (layer.getAttribute("url").toLowerCase().indexOf("mapserver") > -1) {
						if (layerObj[id]){
							myLayer = new MapImageLayer({
								"url": layer.getAttribute("url"),
								"opacity": layerObj[id].opacity,
								"title": id,
								"id":id,
								"visible": layerObj[id].visible,
								///TODO this does not exist in v4.24**********  "visibleLayers": layerObj[id].visLayers
								"sublayers": layerObj[id].visLayers // remove this, it will delete data. Loop through and set these layers to visible other to not visible.
							});
						// not found on url, not visible
						}else {
							myLayer = new MapImageLayer({
								"url": layer.getAttribute("url"),
								"opacity": Number(layer.getAttribute("alpha")),
								"title": id,
								"id":id,
								"visible": false
							});
						}
					}
					// FeatureServer tlb 10/19/20
					else if (layer.getAttribute("url").toLowerCase().indexOf("featureserver") > -1){
						if (layerObj[id]) 
							myLayer = new FeatureLayer({
								"url": layer.getAttribute("url"),
								"opacity": Number(layer.getAttribute("alpha")),
								"title": id,
								"visible" : layerObj[id].visible
								//TODO this does not exist in v4.24********** "visibleLayers" : layerObj[id].visLayers
							});
						else
							myLayer = new FeatureLayer({
								"url": layer.getAttribute("url"),
								"opacity": Number(layer.getAttribute("alpha")),
								"title": id,
								"visible": false
							});
					}
					else {
						alert("Unknown operational layer type. It must be of type MapServer or FeatureServer. Or edit readConfig.js line 600 to add new type.");
						return;
					}
				// Set layer properties from config.xml file
				} else {
					// MapServer
					if (layer.getAttribute("url").toLowerCase().indexOf("mapserver") > -1){
							myLayer = new MapImageLayer({
								url:layer.getAttribute("url"),
								opacity: Number(layer.getAttribute("alpha")),
								title: id,
								id: id,
								visible: layer.getAttribute("visible") == "true"
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
					else if (layer.getAttribute("url").toLowerCase().indexOf("featureserver") > -1){	
						myLayer = new FeatureLayer({
							url: layer.getAttribute("url"),
							opacity: Number(layer.getAttribute("alpha")),
							title: id,
							id: id,
							visible: layer.getAttribute("visible") == "true",
							legendEnabled: true
						});
						
						// identify popup template
						if (layer.getAttribute("popup_fields") && layer.getAttribute("popup_labels")){
							const template = addPopupTemplate(layer.getAttribute("label"),layer.getAttribute("popup_fields").split(","),layer.getAttribute("popup_labels").split(","));
							if (template != null) myLayer.popupTemplate = template;
						}
					}
					else {
						alert("Unknown operational layer type. It must be of type MapServer or FeatureServer. Or edit readConfig.js line 600 to add new type.");
						return;
					}
				}
				map.add(myLayer);
	 		}

			function layerLoadFailedHandler(event){
				// Layer failed to load 3-21-22
				// Wait 2 seconds, retry up to 5 times, then report the error and continue trying every 30 seconds
				// 3-10-22 NOTE: MVUM is sometimes missing some of the sublayers. Contacted victoria.smith-campbell@usda.gov
				// at USFS and they restarted one of their map services and it fixed the problem.
				
				// Call subgroup layer load failed handler
				if (event.layer.parent.type && event.layer.parent.type === "group") {
					subGroupLayerLoadFailed(event);
					return;
				}

				// if already loaded return
				for (var i=0;i<view.allLayerViews.items.length;i++){
					if (event.layer.id === view.allLayerViews.items[i].layer.id && view.allLayerViews.items[i].loaded) 
						return;
				}
console.log(event.layer.id+" failed to load!!!!!!!");
console.log("tries="+tries[event.layer.title]);
				var layer;
				for(i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
					if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label") === event.layer.id){
						layer = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i];
						break;
					}
				}
				// Try every 2 seconds for up to 5 times 
				if (tries[event.layer.title] < 4){
					setTimeout(function(){createLayer(layer);},2000);
				} 
				// Greater than 5 tries, give warning
				else if (tries[event.layer.title] == 4){
					if (event.layer.id.indexOf("Motor Vehicle") > -1 || event.layer.id.indexOf("Wildfire") > -1 || event.layer.id.indexOf("BLM") > -1)
						alert("The external map service that provides "+event.layer.id+" is experiencing problems.  This issue is out of CPW control. We will continue to try to load it. We apologize for any inconvenience.","External (Non-CPW) Map Service Error");
					else
						alert(event.layer.id+" service is busy or not responding. We will continue to try to load it.","Data Error");
					setTimeout(function(){createLayer(layer);},30000);
				}
				// Greater than 5 tries. Keep trying every 30 seconds
				else {
//DEBUG
console.log("Retrying to load: "+event.layer.id);
if(layer.getAttribute("url").indexOf("oooo")>-1)
layer.setAttribute("url", layer.getAttribute("url").substring(0,layer.getAttribute("url").length-4));
console.log("url="+layer.getAttribute("url"));
					setTimeout(function(){createLayer(layer);},30000);
				}
			}

			async function layerLoadHandler(event){
				//console.log(event.layer.id +" loaded.");
				
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
			function addGroupLayer(groupName, vis, opacity, radio, featureservice, portal, layerIds, layerVis, layerNames,popupFields,popupLabels){
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
						createSubGroupLayer(groupLayer,featureservice,vis,ids[i],layerNames[i],popupFields,popupLabels);
					} 
					// Use feature service layer names 
					else {
						createSubGroupLayer(groupLayer,featureservice,vis,ids[i],null,popupFields,popupLabels);
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

var popupFields = [];
var popupLabels = [];
for(var i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
	if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("group") === layer.parent.title){
		//layer = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i];
		if (xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("popup_fields")){
			popupFields = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("popup_fields").split(",");
			popupLabels = xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("popup_labels").split(",");
		}
		break;
	}
}
//debug
console.log("trying to load layer again: "+layer.parent.title+" "+layer.id);
/* layer.id is not a number!!!!! not working
if (layer.id == 1900) {
	tries[layer.parent.title+"19"]=1;
	
	//createSubGroupLayer(layer.parent,layer.url,layer.visible,19,layer.title,popupFields,popupLabels);
}*/
					createSubGroupLayer(layer.parent,layer.url,layer.visible,layer.id,layer.title,popupFields,popupLabels);
					layer.parent.remove(layer);
				},30000);
				
			}
			function createSubGroupLayer(groupLayer,url,visible,id,title,popupFields,popupLabels){		
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
					subGroupLayer = new FeatureLayer({
						url: fsUrl,
						visible: visible,
						title: title,
						//id: id, // do not use id, let it create this on it's own
						legendEnabled: true
					});
					// identify popup template
					if (popupFields && popupLabels){
						const template = addPopupTemplate(title,popupFields,popupLabels);
						if (template != null) subGroupLayer.popupTemplate = template;
					}
				}
				else{
					subGroupLayer = new FeatureLayer({
						url: fsUrl,
						visible: visible,
						//id: id, // do not use id, let it create this on it's own
						legendEnabled: true
					});

					// Wait until layer loads then the title will be assigned. Then remove feature service name from the title (eg. "CPWSpeciesData -")
					subGroupLayer.on("layerview-create", function(event){
						var layer = event.layerView.layer;
						// get the feature service name (CPWSpeciesData), and remove it from the layer name. e.g. CPWSpeciesData - Elk Winter Range
						// featureservice = .../ArcGIS/rest/services/CPWSpeciesData/FeatureServer/
						// remove the feature service name from the title (eg. CPWSpeciesData - )
						if (fsName.indexOf(" - ") == -1)
							fsName += " - ";
						var title = layer.title.substr(fsName.length);
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
//if (ids[j] == 1900)ids[j]=19;
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
			var regexp = /([^a-zA-Z0-9 \-,\._\/:])/g;
			var popupFields = [];
			var popupLabels = [];
			for (i = 0; i < layer.length; i++) {	
				var url=null,layerIds=null,layerVis=null,parentGroupName = null,layerNames=null,portal=null;				
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
							if (layer[i].getAttribute("layerName"))
								layerNames = layer[i].getAttribute("layerNames").replace(regexp,"");
							if (layer[i].getAttribute("popup_fields"))
								popupFields = layer[i].getAttribute("popup_fields").split(",");
							if (layer[i].getAttribute("popup_labels"))
								popupLabels = layer[i].getAttribute("popup_labels").split(",");
						}
						
						// returns a GroupLayer with feature layers added to to it. Use for group layer Elk and feature layers species data for elk.
						groupLayers[groupName] = {"layer": addGroupLayer(groupName,groupVis,groupOpacity,radio,url,portal,layerIds,layerVis,layerNames,popupFields,popupLabels)};
						if (parentGroupName != null && parentGroupName != "")
							groupLayers[parentGroupName].layer.add(groupLayers[groupName].layer);
						else
							map.add(groupLayers[groupName].layer);
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
						layerVis = layer[i].getAttribute("visible").replace(regexp,"").split(","); // array of visibility
					else {
						alert("Missing visible attribute in layer, "+groupName+", in "+app+"/config.xml file.", "Data Error");
						continue;
					}
					if (layer[i].getAttribute("popup_fields")) popupFields = layer[i].getAttribute("popup_fields").split(",");
					if (layer[i].getAttribute("popup_labels")) popupLabels = layer[i].getAttribute("popup_labels").split(",");
					var fsLayer = new FeatureLayer({
						visible: layerVis === "true",
						url: url,
						title: label,
						opacity: Number(opacity),
						layerId: label,
						id: label
					});
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
			addWidgets();
		}

		function findGMUIndex(){
			// search Find a place widget sources to find index of GMU source
			for (var i=0; i<searchWidget.sources.items.length; i++){
				if (searchWidget.sources.items[i].name.indexOf("GMUs")>-1){
					break;
				}
			}
			return i;
		}
		// *********************************
		// Creates actions in the LayerList.
		// *********************************
		var layerList;
		var gmuIndex = -1;
        async function defineActions(event) {
            // The event object contains an item property.
            // is is a ListItem referencing the associated layer
            // and other properties. You can control the visibility of the
            // item, its title, and actions using this object.

            const item = event.item;
			await item.layer.when();

			if(item.title === "Graphics Layer"){
				item.hidden = true;
				return;
			}

			// hide group sub layers
			//if (item.title === "Hunter Reference"){
				item.children.forEach((subLayer) => {
					// hide children 2 layers deep if found in hideGroupSublayers
					if (hideGroupSublayers.includes(subLayer.title)){
						// hide child layers
						subLayer.children.forEach((subSubLayer) => {
							subSubLayer.hidden = true;
							console.log("hiding "+subSubLayer.title);
						});
					}
					// hide children 3 layers deep if found in hideGroupSublayers
					subLayer.children.forEach((subSubLayer) => {
						if (hideGroupSublayers.includes(subSubLayer.title)){
							// hide child layers
							subSubLayer.children.forEach((subSubSubLayer) => {
								subSubSubLayer.hidden = true;
								console.log("hiding "+subSubSubLayer.title);
							});
						}
					});
				});
			//}
			

			// Watch for layer change to visible. For exclusive layers, open selected layer and toggle other layers closed.
			// V Game Species (visibilityMode = exclusive)
			//     > Bighorn
			//     V Elk
			//     > Moose
			item.watch("visible", (event) => {
				// set gmu species && display GMU layer
				if (item.title === "Bighorn" && item.visible == true) {
					gmu = "Bighorn GMU";
					// find the index of the Find a Place GMUs
					if (gmuIndex == -1){
						gmuIndex=findGMUIndex();
					}
					var bighornFL = new FeatureLayer({
						url: settings.sheepUrl
					});
					searchWidget.sources.items[gmuIndex].layer = bighornFL;
					searchWidget.sources.items[gmuIndex].searchFields = [settings.sheepField];
					searchWidget.sources.items[gmuIndex].displayField = settings.sheepField;
					searchWidget.sources.items[gmuIndex].outFields = [settings.sheepField];
					searchWidget.sources.items[gmuIndex].name = "Bighorn Sheep GMUs (S10)";
					searchWidget.sources.items[gmuIndex].placeholder = "Search Bighorn GMUs";
				}	
				else if (item.title === "Mountain Goat" && item.visible == true){
					gmu = "Goat GMU";
					// find the index of the Find a Place GMUs
					if (gmuIndex == -1){
						gmuIndex=findGMUIndex();
					}
					var goatFL = new FeatureLayer({
						url: settings.goatUrl
					});
					searchWidget.sources.items[gmuIndex].layer = goatFL;
					searchWidget.sources.items[gmuIndex].searchFields = [settings.goatField];
					searchWidget.sources.items[gmuIndex].displayField = settings.goatField;
					searchWidget.sources.items[gmuIndex].outFields = [settings.goatField];
					searchWidget.sources.items[gmuIndex].name = "Mountain Goat GMUs (G12)";
					searchWidget.sources.items[gmuIndex].placeholder = "Search Goat GMUs";
				}
				else {
					gmu = "Big Game GMU";
					// find the index of the Find a Place GMUs
					if (gmuIndex == -1){
						gmuIndex=findGMUIndex();
					}
					var elkFL = new FeatureLayer({
						url: settings.elkUrl
					});
					searchWidget.sources.items[gmuIndex].layer = elkFL;
					searchWidget.sources.items[gmuIndex].searchFields = [settings.elkField];
					searchWidget.sources.items[gmuIndex].displayField = settings.elkField;
					searchWidget.sources.items[gmuIndex].outFields = [settings.elkField];
					searchWidget.sources.items[gmuIndex].name = "Big Game GMUs (38)";
					searchWidget.sources.items[gmuIndex].placeholder = "Search GMUs";
				}
				// Show correct GMU layer, hide others
				layerList.operationalItems.every((opLayer) => { //every break on return false
					if (opLayer.title==="Hunter Reference"){
						opLayer.children.every((layerView) => {
							if (layerView.title==="GMU boundary (Hunting Units)"){
								layerView.children.forEach((gmuScale) => {
									// Big Game GMU, Bighorn GMU, and Goat GMU
									gmuScale.children.forEach((gmuAnimal) => {
										switch (gmu) {
											case "Big Game GMU":
												if (gmuAnimal.title === "Big Game GMU"){
													gmuAnimal.visible = true;
												}
												else {
													gmuAnimal.visible = false; // don't show on map
												}
												break;
											case "Bighorn GMU":
												if (gmuAnimal.title === "Bighorn GMU"){
													gmuAnimal.visible = true;
												}
												else {
													gmuAnimal.visible = false; // don't show on map
												}
												break;
											case "Goat GMU":
												if (gmuAnimal.title === "Goat GMU"){
													gmuAnimal.visible = true;
												}
												else {
													gmuAnimal.visible = false; // don't show on map
												}
												break;
										}	
									});
								});
								return false; // "GMU boundary (Hunting Units)" found, quit loop
							}
							return true; // "GMU boundary (Hunting Units)" not found yet
						});
						return false; // Hunter Reference found, quit loop
					}
					return true; // Hunter Reference not found yet
				});
				
				// open the selected radio button layers and close other radio buttons
				layerList.operationalItems.forEach((opLayer) => {
					opLayer.children.forEach((layerView) => {
						if ((item.parent && item.parent.title === layerView.parent.title) && (item.parent.visibilityMode === "exclusive")){
							if (layerView.layer.id != item.layer.id) {
								layerView.open = false;
							}else{
								layerView.open = true;
							}
						}
					});
				});
			});

			// open the layer if specified in config.xml
			if (openTOCgroups.includes(item.title))
				item.open = true;

			// Adds a slider for updating a top level group or individual layer's opacity
			if((item.children.length == 0 && item.parent) || item.parent === null ){
				const slider = new Slider({
					min: 0,
					max: 1,
					precision: 2,
					values: [ item.layer.opacity ],
					visibleElements: {
					labels: true,
					rangeLabels: true
					}    
				});

				item.panel = {
					content: slider,
					className: "esri-icon-sliders-horizontal",
					title: "Change layer opacity"
				};
				
				slider.on("thumb-drag", (event) => {
					const { value } = event;
					item.layer.opacity = value;
				});
			}
			
			// show legend  
			/*if (item.layer.type != "group") {
				// don't show legend twice
				item.panel = {
				  content: "legend",
				  open: true,
				  title: "Legend"
				};
			}*/

            // An array of objects defining actions to place in the LayerList.
            // By making this array two-dimensional, you can separate similar
            // actions into separate groups with a breaking line.

			// Add Information icon to top layers
			if(item.parent === null ){
				item.actionsSections = [
					[
						{
							title: "Layer information",
							className: "esri-icon-description",
							id: "information"
						}
					]
				];
			}
        }

		//*************
		// Add Widgets	
		//*************
		function addWidgets() {
			require(["dojo/dom", "dijit/registry"], function (dom, registry) {
				var str;
				var widgetStr = "";
				for (var w = 0; w < xmlDoc.getElementsByTagName("widget").length; w++) {
					var preload = xmlDoc.getElementsByTagName("widget")[w].getAttribute("preload") == "open" ? true : false;
					var label = xmlDoc.getElementsByTagName("widget")[w].getAttribute("label");
					var widgetHeight = xmlDoc.getElementsByTagName("widget")[w].getAttribute("height");
					var video = xmlDoc.getElementsByTagName("widget")[w].getAttribute("video");
					var icon = xmlDoc.getElementsByTagName("widget")[w].getAttribute("icon");
					if (label == null)
						continue;
					widgetStr += label;
					if (label == "Map Layers & Legend") {
						/*var tocPane = new TitlePane({
							title: "<img id='tocIcon' role='presentation' alt='map layers icon' src='assets/images/i_layers.png'/> Map Layers",
							open: preload,
							content: document.getElementById("tocContent")
							 //"<div id='tocContent' style='position:relative'><img id='tocHelpBtn' role='button' alt='map layers help' class='help_icon help_icon_dialog' src='assets/images/i_help.png'></div>"
						},"tocPane");
						tocPane.startup();
						document.getElementById("tocHelpBtn").addEventListener("click",function(){show("tocHelpDialog");});*/
					
						// Layer List
						layerList = new LayerList({
							view: view,
							title: "Map Layers",
							dragEnabled: false, // add drag layers to re-arrange draw order
        					visibilityAppearance: "checkbox",
							listItemCreatedFunction: defineActions
							//container: document.getElementById('layersContent') //tocPane.containerNode.id
						});
						const layerListExpand = new Expand({
							view,
							content: layerList,
							expandTooltip: "Map Layers",
							expandIconClass: "esri-icon-layers"
						});
						view.ui.add(layerListExpand, "top-right");
			
						// Event listener that fires each time an action is triggered
						layerList.on("trigger-action", (event) => {
							// The layer visible in the view at the time of the trigger.
							const layer = event.item.layer;
				
							// Capture the action id.
							const id = event.action.id;
				
							if (id === "full-extent") {
								// if the full-extent action is triggered then navigate
								// to the full extent of the visible layer
								view.goTo(visibleLayer.fullExtent)
								.catch((error) => {
								if (error.name != "AbortError"){
									console.error(error);
								}
								});
							} else if (id === "information") {
								// if the information action is triggered, then
								// open the item details page of the service layer
								//window.open(layer.url);
								window.open("/"+app+"/definitions.html");
							} else if (id === "increase-opacity") {
								// if the increase-opacity action is triggered, then
								// increase the opacity of the GroupLayer by 0.25
				
								if (layer.opacity < 2) {
								layer.opacity += 0.25;
								}
							} else if (id === "decrease-opacity") {
								// if the decrease-opacity action is triggered, then
								// decrease the opacity of the GroupLayer by 0.25
								if (layer.opacity > 0) {
								layer.opacity -= 0.25;
								}
							}
						});
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget Map Layers & Legend.", "Data Error");
						dom.byId("tocHelp").href = video;
						if (icon)
							document.getElementById("tocIcon").src = icon;
						dom.byId("tocPane").style.display = "block";
						dom.byId("tocPane").style.visibility = "visible";
						//if (widgetHeight && widgetHeight != "") //cuts off the toc!!!!!
						//	document.getElementById("tocContent").style.maxHeight = widgetHeight + "px";
					}
					
					/*else if (label == "HB1298 Report") {
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget Map Layers & Legend.", "Data Error");
							dom.byId("hb1298Help").href = video;
						if (icon)
							document.getElementById("hb1298Icon").src = icon;
						document.getElementById("hb1298Pane").style.display = "block";
						if (preload) {
							openedHB1298 = true;
							loadjscssfile("javascript/hb1298.js", "js");
						}
					}*/ 
					else if (label.indexOf("Report") > 0) {
						var reportPane = new TitlePane({
							title: "<img id='reportIcon' role='presentation' alt='report icon' src='assets/images/i_table.png'/> "+label,
							open: preload,
							content: document.getElementById("reportContent")
						});
						reportPane.startup();
						document.getElementById("reportDiv").appendChild(reportPane.domNode);
						document.getElementById("reportHelpBtn").addEventListener("click",function(){show("reportHelpDialog");});
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget " + label + ".", "Data Error");
							dom.byId("reportHelp").href = video;
						if (icon)
							document.getElementById("reportIcon").src = icon;
						//dom.byId("reportTitle").innerHTML = label;
						
						dom.byId("reportDiv").style.display = "block";
						dom.byId("reportDiv").style.visibility = "visible";
	// TODO*****					reportInit();
					} else if (label == "Feature Search") {
						var searchPane = new TitlePane({
							title: "<img id='searchIcon' role='presentation' alt='feature search icon' src='assets/images/i_search.png'/> "+label,
							open: preload,
							content: document.getElementById("searchContent")
						});
						searchPane.startup();
						document.getElementById("searchDiv").appendChild(searchPane.domNode);
						document.getElementById("searchHelpBtn").addEventListener("click",function(){show("featureSearchHelpDialog");});
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget Feature Search.", "Data Error");
							dom.byId("searchHelp").href = video;
						if (icon)
							document.getElementById("searchIcon").src = icon;
						if (preload) {
							openedFeatureSearch = true;
							// TODO *********** searchInit();
						}
						dom.byId("searchDiv").style.display = "block";
						dom.byId("searchDiv").style.visibility = "visible";
					}
					 else if (label == "Draw, Label, & Measure") {
						var drawPane = new TitlePane({
							title: "<img id='drawIcon' role='presentation' alt='feature search icon' src='assets/images/i_measure.png'/> "+label,
							open: preload,
							content: document.getElementById("drawContent")
						});
						drawPane.startup();
						document.getElementById("drawDiv").appendChild(drawPane.domNode);
						document.getElementById("drawHelpBtn").addEventListener("click",function(){show("drawHelpDialog");});
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget Draw, Label, & Measure.", "Data Error");
						dom.byId("drawHelp").href = video;
						if (icon)
							document.getElementById("drawIcon").src = icon;
						
						//drawInit(); // in javascript/draw.js called in identify.js/readSettingsWidget because it needs XYProjection from this file.
						dom.byId("drawDiv").style.display = "block";
						dom.byId("drawDiv").style.visibility = "visible";
						
						// Test new V4 sketch widtet
						// create a new sketch widget
						let drawTitle = document.createElement("h3");
						drawTitle.innerText = "ESRI default Sketch tool";
						document.getElementById('drawContent').appendChild(drawTitle);
						
						const graphicsLayer = new GraphicsLayer();
						graphicsLayer.title="Graphics Layer";
						map.add(graphicsLayer);

						const sketch = new Sketch({
							view,
							layer: graphicsLayer,
							container: document.getElementById('drawContent'),
							availableCreateTools: ["point", "polyline", "polygon", "rectangle"],
							creationMode: "update",
							updateOnGraphicClick: true,
							visibleElements: {
								createTools: {
									circle: false
								},
								selectionTools:{
									"lasso-selection": false,
									"rectangle-selection":false,
								},
								settingsMenu: false,
								undoRedoMenu: false
							}
						});
						const measurements = document.createElement("div");
						measurements.id = "measurements";
						measurements.innerHTML = "Measurement Results";
						sketch.when(() => {
							document.getElementById('drawContent').appendChild(measurements);
						});

						var textSymbol = {
							type: "text",  // autocasts as new TextSymbol()
							color: "white",
							haloColor: "black",
							haloSize: "1px",
							xoffset: 3,
							yoffset: 3,
							font: {  // autocasts as new Font()
								size: 12,
								weight: "bold"
							}
						};
						function getArea(polygon) {
							// if WGS94(4326) or WebMercator (3857) use geodesic Area
							const geodesicArea = geometryEngine.geodesicArea(polygon, "square-miles");//"square-kilometers");
							//const planarArea = geometryEngine.planarArea(polygon, "square-kilometers");
							measurements.innerHTML =
							"<b>Area</b>:  " + geodesicArea.toFixed(2) + " mi\xB2";
							/*textSymbol.text = geodesicArea.toFixed(2) + " mi\xB2";
							var g = new Graphic({
								geometry: polygon,
								symbol: textSymbol
							});
							graphicsLayer.graphics.add(g);*/
						  }
				  
						  function getLength(line) {
							// if WGS94(4326) or WebMercator (3857) use geodesic Area
							const geodesicLength = geometryEngine.geodesicLength(line, "miles"); //kilometers");
							//const planarLength = geometryEngine.planarLength(line, "kilometers");
							measurements.innerHTML =
							  "<b>Length</b>:  " + geodesicLength.toFixed(2) + " miles";
							/*textSymbol.text = geodesicLength.toFixed(2) + " mi";
							var g = new Graphic({
								geometry: line,
								symbol: textSymbol
							});
							graphicsLayer.graphics.add(g);*/
						  }
						  function switchType(geom) {
							switch (geom.type) {
							  case "polygon":
								getArea(geom,);
								break;
							  case "polyline":
								getLength(geom);
								break;
								case "point":
									projectPoint(geom, measurements);
							  default:
								console.log("No defined geometry type found. Must be polygon, polyline, or point.");
							}
						  }
						  sketch.on("update", (e) => {
							view.closePopup();
							const geometry = e.graphics[0].geometry;
				  
							if (e.state === "start") {
							  switchType(geometry);
							}
				  
							if (e.state === "complete") {
							  // remove label
							  //graphicsLayer.remove(graphicsLayer.graphics.getItemAt(1));
							  graphicsLayer.remove(graphicsLayer.graphics.getItemAt(0));
							  measurements.innerHTML = null;
							}
				  
							if (
							  e.toolEventInfo &&
							  (e.toolEventInfo.type === "scale-stop" ||
								e.toolEventInfo.type === "reshape-stop" ||
								e.toolEventInfo.type === "move-stop")
							) {
							  switchType(geometry);
							}
				  
						  });
						// Listen to sketch widget's create event.
						/*sketch.on("create", function(event) {
							// check if the create event's state has changed to complete indicating
							// the graphic create operation is completed.
							var textSymbol = {
								type: "text",  // autocasts as new TextSymbol()
								color: "white",
								haloColor: "black",
								haloSize: "1px",
								xoffset: 3,
								yoffset: 3,
								font: {  // autocasts as new Font()
									size: 12,
									weight: "bold"
								}
							};
							if (event.state === "complete"){
								var gra;
								if (event.graphic && (event.graphic.geometry.type === 'polygon' || event.graphic.geometry.type === 'extent')) {
									var area = geometryEngine.geodesicArea(event.graphic.geometry, 'square-miles');
									//console.log(area);
									textSymbol.text = area.toFixed(2)+' SqMi.';
									gra = new Graphic({
										geometry: event.graphic.geometry,
										symbol: textSymbol
									});
									sketch.layer.add(gra);
								}
								else if (event.graphic && (event.graphic.geometry.type === 'polyline' )){
									var distance = geometryEngine.distance(event.graphic.geometry, "miles");
									textSymbol.text = distance+' Mi.';
									gra = new Graphic({
										geometry: event.graphic.geometry,
										symbol: textSymbol
									});
									sketch.layer.add(gra);
								} else if (event.graphic && (event.graphic.geometry.type === 'point' )){
									textSymbol.text = "XY";
									gra = new Graphic({
										geometry: event.graphic.geometry,
										symbol: textSymbol
									});
									sketch.layer.add(gra);
									projectPoint(event.graphic.geometry, null, gra);
								}
							}
						});*/
						
					} else if (label == "Bookmark") {
						var bookmarkPane = new TitlePane({
							title: "<img id='bookmarkIcon' role='presentation' alt='bookmark icon' src='assets/images/i_bookmark.png'/> "+label,
							open: preload,
							content: document.getElementById("bookmarkContent")
						});
						bookmarkPane.startup();
						document.getElementById("bookmarkDiv").appendChild(bookmarkPane.domNode);
						document.getElementById("bookmarkHelpBtn").addEventListener("click",function(){show("bookmarkHelpDialog");});
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget Bookmark.", "Data Error");
						dom.byId("bookmarkHelp").href = video;
						if (icon)
							document.getElementById("bookmarkIcon").src = icon;
						// TODO ***********setBookmarks(); // in javascript/bookmarks.js
						
						dom.byId("bookmarkDiv").style.display = "block";
						dom.byId("bookmarkDiv").style.visibility = "visible";
					} else if (label == "Settings") {
						var showTools = true;//" checked";
						if (screen.width < 768) showTools=false;//"";
						var settingsPane = new TitlePane({
							title: "<img id='settingsIcon' alt='settings icon' src='assets/images/i_resources.png'/> "+label,
							open: false,
							content: document.getElementById("settingsContent")
							//content: new ContentPane({
							//	content:"<input id='toolsMenuChkBox' class='largeCheckbox' onclick='javascript:showHideTools()' type='checkbox'"+showTools+"/><label for='toolsMenuChkBox'>Show tools menu?</label>"
							//})
						});
						settingsPane.startup();
						document.getElementById("settingsDiv").appendChild(settingsPane.domNode);
						document.getElementById("settingsHelpBtn").addEventListener("click",function(){show("settingsHelpDialog");});
						document.getElementById("toolsMenuChkBox").checked = showTools;
						if (video == null)
							alert("Warning: Missing help video in " + app + "/config.xml file for widget Settings.", "Data Error");
							dom.byId("settingsHelp").href = video;
						if (icon)
							document.getElementById("settingsIcon").src = icon;
						
						dom.byId("settingsDiv").style.display = "block";
						dom.byId("settingsDiv").style.visibility = "visible";
					}
					 else if (label == "Identify") {}
					else if (label == "MapLink") {
						if (icon)
							document.getElementById("linkIcon").src = icon;
					} else {
						alert("Error in " + app + "/config.xml widget. Label: " + label + " was not found.  \n\nAvailable options include:\n\tMap Layers & Legend\n\t" + "<something> Resource Report \n\tFeature Search\n\tAddress\n\tDraw, Label, & Measure\n\tBookmark\n\tFind a Place\n\tPrint\n\t" + "Settings\n\tIdentify\n Edit javascript/readConfig.js to change this.", "Data Error");
					}
				}
				// add print widget
				var printPane = new TitlePane({
					title: "<img id='printIcon' role='presentation' src='assets/images/i_print.png'/> Print",
					open: preload,
					content: document.getElementById("printContent")
				});
				printPane.startup();
				document.getElementById("printDiv").appendChild(printPane.domNode);
				document.getElementById("printHelpBtn").addEventListener("click",function(){show("printHelpDialog");});
				if (video == null)
					alert("Warning: Missing help video in " + app + "/config.xml file for widget print.", "Data Error");
				//dom.byId("printHelp").href = video;
				//if (icon)
				//	document.getElementById("printIcon").src = icon;
				// TODO ***********setprints(); // in javascript/prints.js
				dom.byId("printDiv").style.display = "block";
				dom.byId("printDiv").style.visibility = "visible";
				// read the PrintPdfWidget.xml file
				printInit();


				// Hide widgets
				if (widgetStr.indexOf("Map Layers & Legend") == -1)
					dom.byId("tocPane").style.display = "none";
				else if (widgetStr.indexOf("Report") == -1)
					dom.byId("reportDiv").style.display = "none";
				else if (widgetStr.indexOf("Feature Search") == -1)
					dom.byId("searchDiv").style.display = "none";
				else if (widgetStr.indexOf("Draw, Label, & Measure") == -1)
					dom.byId("drawDiv").style.display = "none";
				else if (widgetStr.indexOf("Bookmark") == -1)
					dom.byId("bookmarkDiv").style.display = "none";
				else if (widgetStr.indexOf("Settings") == -1)
					dom.byId("settingsDiv").style.display = "none";
				
				// Add Links
				var linkStr = '<span class="link"><a href="' + app + '/help.html" target="help"><img src="assets/images/i_help.png"/>Help</a></span>';
				var link = xmlDoc.getElementsByTagName("links")[0].getElementsByTagName("link");
				var licenseURL="";
				for (var i = 0; i < link.length; i++) {
					// load mobile app with url parameters
					if (link[i].getAttribute("label") == "Go Mobile"){
						continue;
					}
					else if (link[i].getAttribute("label") == "Buy License!"){
						licenseURL = link[i].getAttribute("url").replace("%3F", "?").replace("%26", "&");
						linkStr += '<span class="link"><a id="licenseLink"><img src="' + link[i].getAttribute("icon") + '"/>' + link[i].getAttribute("label") + '</a></span>';
					}
					else
						linkStr += '<span class="link"><a href="' + link[i].getAttribute("url").replace("%3F", "?").replace("%26", "&") + '" target="_new"><img src="' + link[i].getAttribute("icon") + '"/>' + link[i].getAttribute("label") + '</a></span>';
				}
				dom.byId("links").innerHTML = linkStr;
				// Add Google Analytics tracking
				if (document.getElementById("licenseLink")){
					document.getElementById("licenseLink").addEventListener("click",function(){
						// open CPW buy license page and count how many times it is clicked on
						// Google Analytics count how many times Buy License is clicked on
						window.open(licenseURL, "_new");
						if (typeof gtag === "function")gtag('event','widget_click',{'widget_name': 'Buy License'});

					});
				}
			});
		}

		//***********************
		// Add Print
		//***********************
		function addPrint(){
			// Get the disclaimer and create the print widget by calling createPrintWidget.

			// Read the PrintPdfWidget.xml file to get the disclaimer
			var prtDisclaimer="disclaimer";
			var xmlhttp = createXMLhttpRequest();
			var xmlFile = app+"/PrintPdfWidget.xml?v="+ndisVer;
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState===4 && xmlhttp.status === 200) {
					var xmlDoc=createXMLdoc(xmlhttp);
					if (xmlDoc.getElementsByTagName("disclaimer")[0]){
						prtDisclaimer=xmlDoc.getElementsByTagName("disclaimer")[0].firstChild.nodeValue;
					}
					else
						alert("Missing tag, disclaimer, in "+app+"/PrintPdfWidget.xml file.","Data Error");
					if (xmlDoc.getElementsByTagName("helpvideo")[0])
						document.getElementById("printVideo").innerHTML="<a target='help' href="+xmlDoc.getElementsByTagName("helpvideo")[0].firstChild.nodeValue+">Click here to view help video.</a><br/><br/>";
					createPrintWidget(prtDisclaimer);
				}
				else if (xmlhttp.status === 404) {
					alert("Cannot add print widget. Missing PrintPdfWidget.aspx file in "+app+ " directory.","Data Error");
				}
				else if (xmlhttp.readyState===4 && xmlhttp.status===500) {
					alert("Cannot add print widget. Missing PrintPdfWidget.aspx file in "+app+ " directory.","Data Error");
				}
			};
			xmlhttp.open("GET",xmlFile,true);
			xmlhttp.send();
		}
		function createPrintWidget(prtDisclaimer){
			const print = new Print({
				view: view,
				// specify your own print service
				//printServiceUrl: printServiceUrl, // our print service does not print wildfire icons correctly (visual variables)
				allowedFormats: ["pdf","jpg"],
				allowedLayouts: ["Letter ANSI A landscape", "Letter ANSI A portrait", "Tabloid ANSI B landscape", "Tabloid ANSI B portrait"],
				templateOptions: {
					author: prtDisclaimer,
					legendEnabled: true,
					dpi: 300
				},
				templateCustomTextElements: {
					"Subtitle": "subtitle"
				}
			});
			const printExpand = new Expand({
				view,
				content: print,
				expandTooltip: "Print",
				expandIconClass: "esri-icon-printer"
			});
			view.ui.add(printExpand, "top-right");
		}

		//**********************
		//   Add Find a Place
		//**********************
		function addFindPlace(){
			// Find a Place Widget ESRI default
			//define layers for boundaries
			var countyFL = new FeatureLayer({
				url:"https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_FindAPlaceTool_Data/MapServer/1"
				/*popupTemplate: {
					// autocasts as new PopupTemplate()
					title: "{COUNTYNAME} County",
					overwriteActions: true
				}*/
			});
			var propertyFL = new FeatureLayer({
				url:"https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/HuntingAtlas/HuntingAtlas_AssetReport_Data/MapServer/3"
			});
			var gmuFL = new FeatureLayer({
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
				includeDefaultSources:false, // include ESRI geocode service "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer"
				searchAllEnabled:true, // if true has drop down list of sources includeing ESRI's
				popupEnabled:false,
				locationEnabled:false, // Adds option to go to current location
				resultGraphicEnabled:false, // Disable ESRI's graphic symbol, we will handle this below
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
						name: "Big Game GMUs (e.g. 38)",
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
						name: "Wildernesses",
						placeholder: "Search Wildernesses"
					},
					{
						layer: countyFL,
						searchFields: ["COUNTYNAME"],
						displayField: "COUNTYNAME",
						exactMatch: false,
						outFields: ["COUNTYNAME"],
						name: "Counties (Douglas)",
						placeholder: "Search Counties"
					},
					// Colorado Place GNIS
					{
						url: myFindService, //https://ndismaps.nrel.colostate.edu/ArcGIS/rest/services/GNIS_Loc/GeocodeServer 
						singleLineFieldName: "SingleLine",
						outFields: ["*"],
						name: "Colorado Places",
						placeholder: "Search Colorado Places"
					},
					// Address limit search to Colorado
					{
						filter: {
							geometry: new Extent({
								//-12350000 4250000 -11150000 5250000
							  xmax: -11150000,
							  xmin: -12350000,
							  ymax: 5250000,
							  ymin: 4250000,
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
				
			searchWidget.goToOverride = function(view, goToParams) {
				// Don't zoom in, we will handle it below
				return null;
			};
			
			searchWidget.on("search-complete", function(event){
				// The results are stored in the event Object[]
				// Highlight and label the result for 10 seconds

				// Check if no results were found for all layers
				var noResults = true;
				for (var i=0; i<event.results.length; i++){
					if(event.results[i].results.length != 0){
						noResults = false;
						break;
					}
				}
				if (noResults){
					alert(event.searchTerm+" was not found. Please try your search again.","Note");
					return;
				}
				// Find which source layer matches name exactly or up to the comma. eg. Fort Collins, Larimer
				var index = 0;
				for (var i=0; i<event.results.length; i++){
					if (event.results[i].results.length == 0) continue;
					var name = event.results[i].results[0].name.toLowerCase();
					if (event.searchTerm.toLowerCase() === name.substring(0,name.indexOf(",")) ||
						event.searchTerm.toLowerCase() === name) {
						index = i;
						break;
					}
				}
				const obj = event.results[index];
				var newExtent = obj.results[0].extent;
				var pt;
				for(i=0; i<obj.results.length; i++){
					if (obj.results[i].feature.geometry.type === "point"){
						require(["esri/geometry/Point"],function(Point){
							pt = new Point(obj.results[i].feature.geometry.x, obj.results[i].feature.geometry.y, obj.results[i].feature.geometry.spatialReference);
							addTempPoint(pt);
							if (labelFromURL){
								addTempLabel(pt, queryObj.label);
								labelFromURL = false;
							}
							else addTempLabel(pt, obj.results[i].name);
						});
					}
					else if (obj.results[i].feature.geometry.type === "polygon"){
						addTempPolygon(obj.results[i].feature);
						if (labelFromURL){
							addTempLabel(obj.results[i].feature, queryObj.label);
							labelFromURL = false;
						}
						else if (obj.results[i].feature.sourceLayer.title.indexOf("GMU")>-1)
							addTempLabel(obj.results[i].feature, "GMU "+obj.results[i].name); // label each GMU polygon
						else if (obj.results[i].feature.sourceLayer.title.indexOf("County")>-1){
							var label = obj.results[i].name.toLowerCase();
							var ch = label.substring(0,1).toUpperCase();
							label = ch+label.substring(1)+" County";
							addTempLabel(obj.results[i].feature, label); // label each county polygon
						}
						else addTempLabel(obj.results[i].feature, obj.results[i].name); // label each polygon
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
				// Adds the search widget below other elements in
				// the top left corner of the view
				view.ui.add(searchWidget, {
				position: "top-right",
				index: 2
			});	
		}
		//********************
		//  Add OverviewMap
		//********************
		var extentGraphic, dragging=false, overviewMap,extentDebouncer;
		function addOverviewMap(){
			// Create another Map, to be used in the overview "view"
			const ovMap = new Map({
				basemap: window["streets"]
			});

			//const overviewDiv = document.getElementById("overviewDiv");
			const overviewContainer = document.getElementById("overviewContainer");
			overviewMap = new MapView({
				container: "overviewDiv",
				map: ovMap,
				extent: fullExtent,
				constraints: {
					rotationEnabled: false
				}
		 	});
			
			overviewMap.when(() => {
				setupOverviewMap();
			});
			const ovExpand = new Expand({
				view: view,
				content: overviewContainer,
				id: "overviewBtn",
				expandTooltip: "Overview Map",
				expandIconClass: "esri-icon-overview-arrow-bottom-right",
				label: "Show Overview"
				});
			view.ui.add(ovExpand, "top-left");

			// set up initial extent on overview map
			extentDebouncer = promiseUtils.debounce(() => {
				if (view.stationary) {
					overviewMap.goTo({
					center: view.center,
					//extent: view.extent.expand(2)
					scale:view.scale * 2 *
						Math.max(
						view.width / overviewMap.width,
						view.height / overviewMap.height
						)
					});
				}
			});
		}

        function setupOverviewMap() {
          // Overview map extent graphic
          extentGraphic = new Graphic({
            geometry: null,
            symbol: {
              type: "simple-fill",
              color: [0, 0, 0, 0.5],
              outline: null
            }
          });
          overviewMap.graphics.add(extentGraphic);

         /* overviewDiv.style.border="1px solid gray";
		  overviewDiv.style.display="flex";
		  overviewDiv.style.flexDirection="column";
		  var title = document.createElement("h3");
		  title.className = "dialogTitle";
		  title.style.margin = 0;
		  title.style.padding = "10px";
		  title.innerHTML = "Overview Map";
		  overviewDiv.insertBefore(title,overviewDiv.firstChild);*/
		  

         // Disable all zoom gestures on the overview map
          overviewMap.popup.dockEnabled = true;
          // Removes the zoom action on the popup
          overviewMap.popup.actions = [];
          // stops propagation of default behavior when an event fires
          //function stopEvtPropagation(event) {
          //  event.stopPropagation();
          //}
          // exlude the zoom widget from the default UI
          // Remove the default widgets
          overviewMap.ui.components = [];
          // disable mouse wheel scroll zooming on the view
          overviewMap.on("mouse-wheel", function(event){
            if(overviewDiv.style.visibility == "hidden")return;
            event.stopPropagation();
          });
          // disable zooming via double-click on the view
          overviewMap.on("double-click", function(event){
            if(overviewDiv.style.visibility == "hidden")return;
            event.stopPropagation();
          });
          // disable zooming out via double-click + Control on the view
          overviewMap.on("double-click", ["Control"], function(event){
            if(overviewDiv.style.visibility == "hidden")return;
            event.stopPropagation();
          });

          // pan the overview graphic to move main map
          // disables pinch-zoom and panning on the view
          var start, update, diffX, diffY;
          let tempGraphic;
          let draggingGraphic;
          overviewMap.on("drag",(event) => {
            if(overviewDiv.style.visibility == "hidden")return;
            if (event.action === "start") {
                // if this is the starting of the drag, do a hitTest
                overviewMap.hitTest(event).then(resp => {
                    if (resp.results.length > 0 && resp.results[0].graphic && resp.results[0].graphic.geometry && resp.results[0].graphic.geometry.type === 'extent'){
                      event.stopPropagation();
                      dragging=true;
                      // if the hitTest returns an extent graphic, set dragginGraphic
                      draggingGraphic = resp.results[0].graphic;
                      start =  overviewMap.toMap({x: event.x, y: event.y});
                    }
                });
            }
            if (event.action === "update") {
                // on drag update events, only continue if a draggingGraphic is set
                if (draggingGraphic){
                    event.stopPropagation();
                    // if there is a tempGraphic, remove it
                    if (tempGraphic) {
                        overviewMap.graphics.remove(tempGraphic);
                    } else {
                        // if there is no tempGraphic, this is the first update event, so remove original graphic
                        overviewMap.graphics.remove(draggingGraphic);
                    }
                    // create new temp graphic and add it
                    tempGraphic = draggingGraphic.clone();
                    // Calculate new extent
                    update = overviewMap.toMap({x: event.x, y: event.y});
                    diffX = update.x - start.x;
                    diffY = update.y - start.y;
                    start = update;
                    const extent = extentGraphic.geometry;
                    extent.xmin += diffX;
                    extent.xmax += diffX; 
                    extent.ymin += diffY;
                    extent.ymax += diffY; 
                    tempGraphic.geometry = extent;
                    overviewMap.graphics.add(tempGraphic);
                }
            }
            else if (event.action === "end") {
                // on drag end, continue only if there is a draggingGraphic
                if (draggingGraphic){
                  event.stopPropagation();
                  // rm temp
                  if (tempGraphic) overviewMap.graphics.remove(tempGraphic);
                  // fix double image bug
                  if (draggingGraphic) overviewMap.graphics.remove(draggingGraphic);
                  // create new graphic based on original dragging graphic
                  extentGraphic = draggingGraphic.clone();
                  if (tempGraphic)
                    extentGraphic.geometry = tempGraphic.geometry.clone();
                  else
                    extentGraphic.geometry = draggingGraphic.geometry.clone();
                  
                  // add replacement graphic
                  overviewMap.graphics.add(extentGraphic);
                  
                  // reset vars
                  draggingGraphic = null;
                  tempGraphic = null;
                  
                  // Adjust main map
                  view.center = extentGraphic.geometry.extent.center;
                  dragging=false;
                }
            }
          });

          // disable the view's zoom box to prevent the Shift + drag
          // and Shift + Control + drag zoom gestures.
          overviewMap.on("drag", ["Shift"], function(event){
            if(overviewDiv.style.visibility == "hidden")return;
            event.stopPropagation();
          });
          overviewMap.on("drag", ["Shift", "Control"], function(event){
            if(overviewDiv.style.visibility == "hidden")return;
            event.stopPropagation();
          });

          // prevents zooming with the + and - keys
          overviewMap.on("key-down", (event) => {
            if(overviewDiv.style.visibility == "hidden")return;
            const prohibitedKeys = ["+", "-", "Shift", "_", "=", "ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"];
            const keyPressed = event.key;
            if (prohibitedKeys.indexOf(keyPressed) !== -1) {
              event.stopPropagation();
            }
          });
          
          reactiveUtils.watch(
            () => view.extent,
            (extent) => {
              // Sync the overview map location
              // whenever the view is stationary
              if(dragging) return;
              extentDebouncer().then(() => {
                extentGraphic.geometry = extent;
              });
              overviewMap.scale = view.scale * 2 * Math.max(
                  view.width / overviewMap.width,
                  view.height / overviewMap.height
                );
              overviewMap.center = view.center;
            },
            {
              initial: true
            }
          );

		  //overviewDiv.style.border="1px solid gray";
        }

		

		//********************
		//     Add Map
		//********************
		function addMap() {
			require(["dojo/dom", "dijit/registry", "dojo/sniff", "dojo/on"], function (dom, registry, has, on) {
				try {
					// labels for slider scale bar
					//var labels = [9244,4622,2311,1155,577,288,144,72,36,18,9,4,2,1];
					//var labels = [4622,1155,288,72,18,4,1];
					//var labels = [9244,2311,577,144,36,9,2];
					// set sliderStyle: "large" for long slider
					// Set initial basemap. Available basemaps:  streets-vector, hybrid, topo-vector, streets-relief-vector		
					// showAttribution=true shows the name of the basemap next to the logo.
					// displayGraphicsOnPan=false for IE may speed up pans
					//			basemap: "streets",
					// 	sliderLabels: labels,
					mapBasemap = window["streets"];
					if (queryObj.layer && queryObj.layer != "") {
						var basemapArr = queryObj.layer.substring(0, queryObj.layer.indexOf("|")).split(",");
							// old version used 0,1,2|... and first one was selected basemap.
							if (basemapArr[0] == 0)
								mapBasemap = window["streets"];
							else if (basemapArr[0] == 1)
								mapBasemap = window["aerial"];
							else if (basemapArr[0] == 2)
								mapBasemap = window["topo"];
							else
								mapBasemap = basemapArr[0];
							basemapArr = null;
					}
					//10-11-22					map.infoWindow.resize(330, 350);
					// print preview map
					// 4-19-17 added custom lods from 9M to 1K. Used to have 19 levels, now it has 12.
					/*customLods = [{
							"level": 6,
							"resolution": 2445.98490512499,
							"scale": 9244648.868618
						}, {
							"level": 7,
							"resolution": 1222.992452562495,
							"scale": 4622324.434309
						}, {
							"level": 8,
							"resolution": 611.4962262813797,
							"scale": 2311162.217155
						}, {
							"level": 9,
							"resolution": 305.74811314055756,
							"scale": 1155581.108577
						}, {
							"level": 10,
							"resolution": 152.87405657041106,
							"scale": 577790.554289
						}, {
							"level": 11,
							"resolution": 76.43702828507324,
							"scale": 288895.277144
						}, {
							"level": 12,
							"resolution": 38.21851414253662,
							"scale": 144447.638572
						}, {
							"level": 13,
							"resolution": 19.10925707126831,
							"scale": 72223.819286
						}, {
							"level": 14,
							"resolution": 9.554628535634155,
							"scale": 36111.909643
						}, {
							"level": 15,
							"resolution": 4.77731426794937,
							"scale": 18055.954822
						}
					];
					previewMap = new Map("printPreviewMap", {
							extent: initExtent,
							autoResize: true,
							showAttribution: false,
							logo: false,
							basemap: "streets",
							isRubberBandZoom: true,
							isScrollWheelZoom: true,
							isShiftDoubleClick: true,
							displayGraphicsOnPan: !has("ie"),
							sliderStyle: "large",
							minScale: 9244649,
							lods: customLods
						});
					customLods = null;*/
					
					// set lods
					// 4-19-17 added custom lods from 9M to 1K. Used to have 19 levels, now it has 12.
					var customLods = [
						{
							"level": 6,
							"resolution": 2445.98490512499,
							"scale": 9244648.868618
						}, {
							"level": 7,
							"resolution": 1222.992452562495,
							"scale": 4622324.434309
						}, {
							"level": 8,
							"resolution": 611.4962262813797,
							"scale": 2311162.217155
						}, {
							"level": 9,
							"resolution": 305.74811314055756,
							"scale": 1155581.108577
						}, {
							"level": 10,
							"resolution": 152.87405657041106,
							"scale": 577790.554289
						}, {
							"level": 11,
							"resolution": 76.43702828507324,
							"scale": 288895.277144
						}, {
							"level": 12,
							"resolution": 38.21851414253662,
							"scale": 144447.638572
						}, {
							"level": 13,
							"resolution": 19.10925707126831,
							"scale": 72223.819286
						}, {
							"level": 14,
							"resolution": 9.554628535634155,
							"scale": 36111.909643
						}, {
							"level": 15,
							"resolution": 4.77731426794937,
							"scale": 18055.954822
						}, {
							"level": 16,
							"resolution": 2.388657133974685,
							"scale": 9027.977411
						}, {
							"level": 17,
							"resolution": 1.1943285668550503,
							"scale": 4513.988705
						}, {
							"level": 18,
							"resolution": 0.5971642835598172,
							"scale": 2256.994353
						}, {
							"level": 19,
							"resolution": 0.29858214164761665,
							"scale": 1128.497176
						}
					];
					
					//require(["dojo/_base/Color", "dojo/dom-construct"], function (Color, domConstruct) {
					// standard info window
					// 10-11/22							var popup = new Popup({
					//									fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
					//								}, domConstruct.create("div"));
					map = new Map({
						basemap: mapBasemap,
						lods: customLods
						});
					view = new MapView({
						container: "mapDiv",
						extent: fullExtent,
						map: map,
						constraints: {
							maxScale: 9244649,
							minScale: 1128
						}
					});
					
				} catch (e) {
					alert("Error creating map in readConfig.js addMap. " + e.message, "Code Error", e);
				}







				// 3-21-22
				// load legend/layer list. Fires after one layer is added to the map using the map.addLayer method.
/*					var toc;
				var legendChkBox;
				map.on('layer-add-result', function (event) {
					var errFlag = false;
					var i,j;
//console.log("map.on layer add result: "+event.layer.id);
					try {	
						if (event.error) {
							errFlag = true;
							alert("Problem adding layer to map: " + event.layer.url + ". Reason: " + event.error.message + ". At javascript/readConfig.js", "Code Error");
						}
						// Turn off MVUM extra layers
						else if (event.layer.url && event.layer.url.indexOf("MVUM") > -1){
							for (j = 0; j < event.layer.layerInfos.length; j++) {
								if (event.layer.layerInfos[j].name == "Visitor Map Symbology") {
									event.layer.layerInfos[j].defaultVisibility = false;
								}
								else if (event.layer.layerInfos[j].name =="Status") {
									event.layer.layerInfos[j].defaultVisibility = false;
								}
							}
						}
					} catch (e) {
						alert("Error loading layer, "+event.layer.id+", to map. Reason: " + e.message + " in javascript/readConfig.js layer-add-result", "Code Error", e);
					}

					// if event.layer is in legendLayer and toc exists remove TOC and add again
					var layerInTOC = false;
					for(i=0; i<legendLayers.length;i++){
						if(event.layer.id === legendLayers[i].title){
							layerInTOC = true;
							break;
						}
					}
					if (layerInTOC){
						// check if all layers have tried to load
						var allTriedToLoad = true;
						for (i=0;i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
							if (tries[xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label")] == 0)
								allTriedToLoad = false;
						}
						// Reorder TOC and map layers. map.reorderLayer(layer, index) index=0 is bottom most
						if (allTriedToLoad){
							// reorder layers according to config.xml operationallayers
							var copyLegendLayers = [];
							var copyMapLayers = [];
							// copy legend
							for (i=0;i<legendLayers.length;i++){
								copyLegendLayers[i] = Object.assign({}, legendLayers[i]);
							}
							// copy map layers
							var numBasemaps=0; // count number of basemaps
							for (i=0;i<map.layerIds.length;i++){
								copyMapLayers[i] = Object.assign({}, map.getLayer(map.layerIds[i]));
								if (map.getLayer(map.layerIds[i]).id.indexOf("layer") > -1) numBasemaps++;
							}
							var k=0;
							var n=0;
							for (i=0; i<xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer").length;i++){
								// put legend in reverse order
								for (j=0; j<legendLayers.length;j++){
									if (copyLegendLayers[j].title === xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label")){
										legendLayers[k++] = Object.assign({}, copyLegendLayers[j]);
										break;
									}
								}
								// put map layers in order
								for (var m=0;m<copyMapLayers.length;m++){
									if (copyMapLayers[m].id === xmlDoc.getElementsByTagName("operationallayers")[0].getElementsByTagName("layer")[i].getAttribute("label")){
										// map.reorderLayer(layer, index) The basemap is 0.
										map.reorderLayer(Object.assign({}, copyMapLayers[m]), i+numBasemaps);
										break;
									}
								}
							}
							legendLayers.reverse();
						}
						
						
					
						if (!calledFlag) {
							calledFlag = true;
							try{
								readSettingsWidget(); // initialize Identify, found in identify.js
							} catch(e){
								alert("Error reading SettingsWidget.xml. Reason: " + e.message + " in javascript/readConfig.js", "SettingsWidget Error", e);
							}
							try {
								addGraphicsAndLabels();
							} catch (e) {
								alert("Error loading graphics and labels from the URL: " + e.message + " in javascript/readConfig.js", "URL Graphics Error", e);
							}
						}
					}
				});

*/

				function zoomToQueryParams(){
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
						ext = new Extent({
								"xmin": parseFloat(extArr[0]),
								"ymin": parseFloat(extArr[1]),
								"xmax": parseFloat(extArr[2]),
								"ymax": parseFloat(extArr[3]),
								"spatialReference": {
									"wkid": parseInt(prj)
								}
							});
						var params = new ProjectParameters();
						params.geometries = [ext];
						params.outSpatialReference = new SpatialReference(wkid);
						GeometryService.project(geometryService,params).then((newExt) => {
							initExtent = newExt[0];
							view.extent = initExtent;
						}).catch ( (error) => {
							let msg = "There was a problem converting the extent read from the URL to Web Mercator projection. extent=" + extArr[0] + ", " + extArr[1] + ", " + extArr[2] + ", " + extArr[3] + "  prj=" + prj + "  " + error.message;
							alert(msg, "URL Extent Error", error);
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
							searchWidget.search(place);
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
																	addTempLabel(pt,queryObj.label);
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
																			addTempLabel(response.features[j],queryObj.label);
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
																	addTempLabel(pt,queryObj.label,12);
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
				}
	
				readSettingsWidget(); // initialize Identify, found in identify.js. Needed for FindPlace SearchWidget      moved 9-19-24
				
				// Update the theme to use slightly transparent green graphics and green text
				view.theme = {
					accentColor: [55, 200, 100, 0.75],
					textColor: "green"
				};


				// Load listener function for when the first or base layer has been successfully added
				view.when(() => {
					// Update mouse coordinates
					view.on('pointer-move', (event)=>{
						showCoordinates(event);  
					});
					
					// Identify
					view.popup.visibleElements = {
						actionBar: false
						//heading: false
						//featureNavigation: false
					};
					
					view.on('click', (event)=>{
						view.popupEnabled = false;
						view.popup.location = event.mapPoint;
						view.popup.content = "<p align='center'>Loading...</p>";
						view.popup.visible = true;
						view.openPopup();
						doIdentify(event);
					});

					// Overview window was showing on startup. It is hidden now so now make it visible
					setTimeout(function(){
						document.getElementById("overviewContainer").style.display = "block";
						document.getElementById("OVtitle").style.display = "block";
					},2000);

									
					// Watch for map scale change
					// Providing `initial: true` in ReactiveWatchOptions
					// checks immediately after initialization
					// Equivalent to watchUtils.init()
					reactiveUtils.watch(
						() => view?.extent?.xmin,
						(xmin) => {
							showMapScale(parseInt(view.scale));
						},
						{
							initial: true
					});
					  
					// Show hide loading image
					view.on("update-start", showLoading);
					view.on("update-end", hideLoading);
					// display current map scale
					showMapScale(view.scale);
					addMapLayers();
					addOverviewMap();
					addFindPlace();

					// Add Legend
					let legend = new Legend({
						view: view
					});
					const legendExpand = new Expand({
						view,
						content: legend,
						expandTooltip: "Legend",
						expandIconClass: "esri-icon-legend"
					});
					view.ui.add(legendExpand, "top-right");
					// add a title bar
					legendExpand.when(() =>{
						var title = document.createElement("h3");
						title.className = "dialogTitle";
						title.style.margin = 0;
						title.style.padding = "10px";
						title.style.position = "sticky";
						title.style.top = "0px";
						title.style.position = "-webkit-sticky";
						title.style.zIndex = 1;
						title.innerHTML = "Legend";
						const legendWidget = document.getElementsByClassName("esri-legend")[0];
						legendWidget.insertBefore(title,legendWidget.firstChild);
					});
			
					// Add Basemap Gallery
					try{
						let basemap = new My_BasemapGallery();
						basemapExpand = new Expand({
							view,
							content: basemap,
							expandTooltip: "Basemap",
							expandIconClass: "esri-icon-basemap"
						});
						view.ui.add(basemapExpand, "top-right");
						// add a title bar
						basemapExpand.when(() =>{
							var title = document.createElement("h3");
							title.className = "dialogTitle";
							title.style.margin = 0;
							title.style.padding = "10px";
							title.style.position = "sticky";
							title.style.top = "0px";
							title.style.position = "-webkit-sticky";
							title.style.zIndex = 1;
							title.innerHTML = "Basemaps";
							const basemapWidget = document.getElementById("bmGallery");
							basemapWidget.insertBefore(title,basemapWidget.firstChild);
						});
					}catch (e){
						alert("Problem creating basemaps. Error message: "+e.getMessage, "Error");
					}
					
					// Add Bookmarks
					try {
						const storeBookmarks = (bookmarks) => {
							window.localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
						};
						const bookmarks = new Bookmarks({
							view,
							container: "bookmarks-container",
							// allows bookmarks to be added, edited, or deleted
							dragEnabled: true,
							visibleElements: {
							addBookmarkButton: true,
							editBookmarkButton: true,
							filter: true // add search button
							}
						});
						//load bookmarks from local storage
						if (window.localStorage.getItem('bookmarks')) {
							const bms = JSON.parse(window.localStorage.getItem('bookmarks'));
							bms?.forEach(bm => bm.viewpoint.targetGeometry.type = 'extent');
							bookmarks.bookmarks = bms;
						}
						//store bookmarks when added or removed or reordered
						bookmarks.bookmarks.on('after-changes', () => storeBookmarks(bookmarks.bookmarks));
						//store boomarks when a bookmark is edited
						bookmarks.on('bookmark-edit', () => storeBookmarks(bookmarks.bookmarks));
					}catch (e){
						alert("Problem creating bookmarks. Error message: "+e.getMessage, "Error");
					}

					// Add Scalebar
					let scalebar = new ScaleBar({
						view: view,
						// "dual" displays both miles and kilmometers
						// "non-metric"|"metric"|"dual"
						unit: "dual"
					});
					
					view.ui.add(scalebar, "bottom-left");
					
					// Home
					const homeBtn = new Home({
						view: view,
						expandTooltip: "Full Extent",
					});
					// Add the home button to the top left corner of the view
					view.ui.add(homeBtn, "top-left");

					// Add You Location
					const locateBtn = new Locate({
						view: view
					});
			
					// Add the locate widget to the top left corner of the view
					view.ui.add(locateBtn, "top-left");

					addPrint();
					
					zoomToQueryParams();
					addGraphicsAndLabels();
					//readSettingsWidget(); // initialize Identify, found in identify.js      moved 6-13-24
					hideLoading();
				});
			});
		}

		try {
			var xycoords_format = getCookie("xycoords");
			if (xycoords_format == "")
				document.getElementById('xycoords_combo').value = "dms";
			else
				document.getElementById('xycoords_combo').value = xycoords_format;
			
			// preserve new lines in way point descriptions (For future changes, if we decide to add them like the Mobile version.)
			var location = document.location.search.replace(/\%0D/g,"newline");
			queryObj = ioquery.queryToObject(location.substring((location[0] === "?" ? 1 : 0)));
			
			// Sanitize user input. Protect against XSS attacks.
			// test for XSS attack. Pattern contains allowed characters. [^ ] means match any character that is not
			// in the is set. \ escapes characters used by regex like .-'"|\
			var regexp;
			// For labels allow ' " for degrees minutes seconds
			// Points
			if (queryObj.point){
				queryObj.point = queryObj.point.replace(/~/g, " "); // for email from mobile app
				regexp=/([^a-zA-Z0-9 °\-\'\"\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.point)) alert("Illegal characters were removed from way point labels.","Warning");
				regexp=/([^a-zA-Z0-9 °\-\'\"\|;,\.!_\*()])/g;
				queryObj.point=queryObj.point.replace(regexp,""); // clean it
				queryObj.point = queryObj.point.replace(/newline/g,"\n"); // preserve new line characters in point description used on mobile
			}

			// Lines
			if (queryObj.line){
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.line)) alert("Illegal characters were removed from the line labels.","Warning");
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
				queryObj.line=queryObj.line.replace(regexp,""); // clean it
			}

			// Polygons
			if (queryObj.poly){
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.poly)) alert("Illegal characters were removed from the shape (polygon) labels.","Warning");
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
				queryObj.poly=queryObj.poly.replace(regexp,""); // clean it
			}

			// Rectangles
			if (queryObj.rect){
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.rect)) alert("Illegal characters were removed from the rectangle labels.","Warning");
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
				queryObj.rect=queryObj.rect.replace(regexp,""); // clean it
			}
			
			// Text
			if (queryObj.text){
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()\\])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.text)) alert("Illegal characters were removed from the point labels.","Warning");
				regexp=/([^a-zA-Z0-9 \-\'\|;,\.!_\*()])/g;
				queryObj.text=queryObj.text.replace(regexp,""); // clean it
			}

			// Layer
			if (queryObj.layer){
				queryObj.layer = queryObj.layer.replace(/~/g, " "); // for email from mobile app
				regexp=/([^a-zA-Z0-9 \-\|,\._()])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.layer)) alert("Illegal characters were found on the URL. Layers may not load properly.","Warning");
				//regexp=/([^a-zA-Z0-9 \-,\._()])/g; // Used if testing for \\ above
				queryObj.layer=queryObj.layer.replace(regexp,""); // clean it
			}

			// keyword
			if (queryObj.keyword){
				regexp=/([^a-zA-Z0-9 \-\._()])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.keyword)) alert("Illegal characters were found on the URL. Location may not load properly.","Warning");
				//regexp=/([^a-zA-Z0-9 \-\._()])/g; // Used if testing for \\ above
				queryObj.keyword=queryObj.keyword.replace(regexp,""); // clean it
			}

			// value
			if (queryObj.value){
				// 8-18-20 added # and / as safe characters in the value
				//regexp=/([^a-zA-Z0-9 \-\',\.!_\*()\\])/g; // allow \ for the test \" but remove it for the clean
				regexp=/([^a-zA-Z0-9 \-\',\.!_\*()\\#/&])/g; // allow \ for the test \" but remove it for the clean
				if (regexp.test(queryObj.value)) alert("Illegal characters were found on the URL. Location may not load properly.","Warning");
				regexp=/([^a-zA-Z0-9 \-\',\.!_\*()#/&])/g;
				queryObj.value=queryObj.value.replace(regexp,""); // clean it
				// 8-18-20 single quote is used in the SQL expression, replace it with '' and it will be used as '.
				var quote = /'/g;
				queryObj.value = queryObj.value.replace(quote,"''");
			}

			// label
			if (queryObj.label){
				regexp=/([^a-zA-Z0-9 \-\',\.!_\*()#&/\\])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.label)) alert("Illegal characters were found on the URL. Point labels may not load properly.","Warning");
				regexp=/([^a-zA-Z0-9 \-\',\.!_\*()#&/])/g;
				queryObj.label=queryObj.label.replace(regexp,""); // clean it
			}

			// map
			if (queryObj.map){
				regexp=/([^a-zA-Z0-9 \-,\._():\/])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.map)) alert("Illegal characters were found on the URL. Map may not load properly.","Warning");
				//regexp=/([^a-zA-Z0-9 \-\=,\._():\/])/g; // Used if testing for \\ above
				queryObj.map=queryObj.map.replace(regexp,""); // clean it
			}

			// field
			if (queryObj.field){
				regexp=/([^a-zA-Z0-9 \-_])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.field)) alert("Illegal characters were found on the URL. Map may not load properly.","Warning");
				//regexp=/([^a-zA-Z0-9 \-\=,\._():\/])/g; // Used if testing for \\ above
				queryObj.field=queryObj.field.replace(regexp,""); // clean it
			}

			// projection Only allow integers.
			if (queryObj.prj && isNaN(queryObj.prj)) {
				queryObj.prj = 102100;
				alert("Problem reading map projection from the URL, defaulting to WGS84.","Warning");
			}

			// Extent
			if (queryObj.extent){
				regexp=/([^0-9 \-,\.])/g; // allow \ for the test (\' \") but remove it for the clean
				if (regexp.test(queryObj.extent)) alert("Illegal characters were found on the URL. Map extent may not load properly.","Warning");
				queryObj.extent=queryObj.extent.replace(regexp,""); // clean it
			}

			// Place
			if (queryObj.place){
				regexp=/([^a-zA-Z0-9 \-\',\.!_*():#&/\\])/g; // allow \ for the test (\' \") but remove it for the clean, : used in degree, min, sec point
				if (regexp.test(queryObj.place)) alert("Illegal characters were found on the URL. Location may not load properly.","Warning");
				regexp=/([^a-zA-Z0-9 \-\',\.!_*():#&/])/g;
				queryObj.place=queryObj.place.replace(regexp,""); // clean it
			}

			document.getElementById("mapDescFile").href = app + "/definitions.html";
			var xmlhttp = createXMLhttpRequest();
			var configFile = app + "/config.xml?v=" + ndisVer;
			var calledFlag = false; // 3-21-22 call readSettingsWidget and addGraphicsAndLabels only once
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
						dom.byId("title").innerHTML = title;
						document.title = title;
						dom.byId("subtitle").innerHTML = xmlDoc.getElementsByTagName("subtitle")[0].firstChild.nodeValue;
						dom.byId("logo").src = xmlDoc.getElementsByTagName("logo")[0].firstChild.nodeValue;
						dom.byId("logourl").href = xmlDoc.getElementsByTagName("logourl")[0].firstChild.nodeValue;
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
						
						addMap();
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
			alert("Error in javascript/readConfig.js. " + e.message, "Code Error", e);
		}
	});
}