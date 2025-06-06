var openTOCgroups = ["Elk"]; // which group layers should be open in TOC
var gmuIndex = -1;
var layerList;
function myMapLayers(){
   // -- Layer List and Basemap tabs using esri widgets
   const mapLayersExpand = document.createElement("calcite-button");
   mapLayersExpand.id = "layerListExpand2";
   mapLayersExpand.iconStart = "layers";
   mapLayersExpand.className="esri-widget--button";
   mapLayersExpand.title = "Map Layers";
   mapLayersExpand.label = "Map Layers";
   mapLayersExpand.alignment="center";
   mapLayersExpand.appearance="solid";
   mapLayersExpand.kind ="neutral";
   mapLayersExpand.scale = "s";
   mapLayersExpand.style.width = "120px";
   const mapLayersLabel = document.createElement("span");
   mapLayersLabel.innerHTML = "Map Layers";
   mapLayersLabel.style.fontWeight = "bold";
   mapLayersExpand.appendChild(mapLayersLabel);
   //mapLayersExpand.content = customLayerList;
   view.ui.add(mapLayersExpand, "top-right");
  
        require(["esri/widgets/LayerList"],function (LayerList){
            // TOC parent layers list
            const mapLayersWidget = document.createElement("calcite-popover");
            mapLayersWidget.addEventListener("click", function (event) {
                if (basemapLayers.includes(event.target.id)) myToggleBasemap(event);
            });
            mapLayersWidget.heading = "Map Layers";
            mapLayersWidget.label = "Map layers";
            mapLayersWidget.setAttribute("reference-element", "layerListExpand2");
            mapLayersWidget.closable=true;
            
            // tabs
            const tabs = document.createElement("calcite-tabs");
            tabs.style.width = "300px";
            tabs.style.padding = "10px";
            tabs.style.maxHeight = "70vh";
            mapLayersWidget.appendChild(tabs);
            const tabNav = document.createElement("calcite-tab-nav");
            tabNav.slot = "title-group";
            tabs.appendChild(tabNav);
            
            // Tab Titles: Layers  Basemaps
            const tabTitle1 = document.createElement("calcite-tab-title");
            tabTitle1.select = true;
            tabTitle1.innerHTML = "Layers";
            tabNav.appendChild(tabTitle1);
            const tabTitle2 = document.createElement("calcite-tab-title");
            tabTitle2.innerHTML = "Basemaps";
            tabNav.appendChild(tabTitle2);
            
            // Layer List
            const tab1 = document.createElement("calcite-tab");
            tab1.select = true;
            const tab1Content = document.createElement("div");
            tab1Content.id = "layers";
            tab1Content.style.overflowY = "auto";
            tab1.style.height="auto";
            tab1.appendChild(tab1Content)
            tabs.appendChild(tab1);

            layerList = new LayerList({
                view: view,
                title: "Map Layers",
                dragEnabled: false, // add drag layers to re-arrange draw order
                //visibilityAppearance: "checkbox",
                listItemCreatedFunction: defineActions2,
                visibleElements: {
                    catalogLayerList: true,
                    closeButton: false,
                    //collapseButton: true,
                    errors: true,
                    //filter: true,
                    heading: false,
                    statusIndicators: true
                },
                container: tab1Content
            });
            tab1.className = "";

           
            //    tab1.appendChild(layerList.innerHTML);
            
           

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
                    window.open(layer.url);
                    window.open("/"+app+"/definitions.html");
                }else if (id === "increase-opacity") {
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



            // Basemaps
            const tab2 = document.createElement("calcite-tab");
            const br = document.createElement("br");
            tab2.appendChild(br);
            const tab2Content = document.createElement("div");
            tab2Content.id = "bmGallery";
            tab2Content.style.overflowY = "auto";
            tab2Content.style.textAlign = "center";
            tab2Content.innerHTML = myCustomBasemaps();
            tab2.appendChild(tab2Content);
            tabs.appendChild(tab2);
            
            view.ui.add(mapLayersWidget);
        
        });
    }

    // *********************************
    // Creates actions in the LayerList.
    // *********************************
    function findGMUIndex(){
        // search Find a place widget sources to find index of GMU source
        for (var i=0; i<searchWidget.sources.items.length; i++){
            if (searchWidget.sources.items[i].name.indexOf("GMUs")>-1){
                return i;
            }
        }
        return -1;
    }

    async function defineActions2(event) {
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
        // radio buttons
        if (item.title === "Game Species") item.visibilityMode2 = "exclusive";

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


        // Watch for layer change to visible. For exclusive layers, open selected layer and toggle other layers closed.
        // V Game Species (visibilityMode = exclusive)
        //     > Bighorn
        //     V Elk
        //     > Moose
        item.watch("visible", (event) => {
            require(["esri/layers/FeatureLayer"],function (FeatureLayer){
                if (app.toLowerCase() != "huntingatlas") return;

                // set gmu species && display GMU layer
                if (item.title === "Bighorn Sheep" && item.visible == true) {
                    gmu = "Bighorn GMU";

                    // switch searchWidget GMU layer to Bighorn GMUs
                    // find the index of the Find a Place GMUs
                    if (this.gmuIndex == -1){
                        this.gmuIndex=findGMUIndex();
                    }
                    if (this.gmuIndex != -1){
                        var bighornFL = new FeatureLayer({
                            url: settings.sheepUrl
                        });
                        searchWidget.sources.items[this.gmuIndex].layer = bighornFL;
                        searchWidget.sources.items[this.gmuIndex].searchFields = [settings.sheepField];
                        searchWidget.sources.items[this.gmuIndex].displayField = settings.sheepField;
                        searchWidget.sources.items[this.gmuIndex].outFields = [settings.sheepField];
                        searchWidget.sources.items[this.gmuIndex].name = "Bighorn Sheep GMUs";
                        searchWidget.sources.items[this.gmuIndex].placeholder = "Search Bighorn GMUs";
                    }
                }	
                else if (item.title === "Mountain Goat" && item.visible == true){
                    gmu = "Goat GMU";
                    // find the index of the Find a Place GMUs
                    if (this.gmuIndex == -1){
                        this.gmuIndex=findGMUIndex();
                    }
                    if (this.gmuIndex != -1){
                        var goatFL = new FeatureLayer({
                            url: settings.goatUrl
                        });
                        searchWidget.sources.items[this.gmuIndex].layer = goatFL;
                        searchWidget.sources.items[this.gmuIndex].searchFields = [settings.goatField];
                        searchWidget.sources.items[this.gmuIndex].displayField = settings.goatField;
                        searchWidget.sources.items[this.gmuIndex].outFields = [settings.goatField];
                        searchWidget.sources.items[this.gmuIndex].name = "Mountain Goat GMUs";
                        searchWidget.sources.items[this.gmuIndex].placeholder = "Search Goat GMUs";
                    }
                }
                else {
                    gmu = "Big Game GMU";
                    // find the index of the Find a Place GMUs
                    if (this.gmuIndex == -1){
                        this.gmuIndex=findGMUIndex();
                    }
                    if (this.gmuIndex != -1){
                        var elkFL = new FeatureLayer({
                            url: settings.elkUrl
                        });
                        searchWidget.sources.items[this.gmuIndex].layer = elkFL;
                        searchWidget.sources.items[this.gmuIndex].searchFields = [settings.elkField];
                        searchWidget.sources.items[this.gmuIndex].displayField = settings.elkField;
                        searchWidget.sources.items[this.gmuIndex].outFields = [settings.elkField];
                        searchWidget.sources.items[this.gmuIndex].name = "Big Game GMUs";
                        searchWidget.sources.items[this.gmuIndex].placeholder = "Search GMUs";
                    }
                }
                // Show correct GMU layer, hide others
                layerList.operationalItems.items.every((opLayer) => { //every break on return false
                    if (opLayer.title==="Hunter Reference"){
                    opLayer.children.items.every((layerView) => {
                        if (layerView.title==="GMU boundary (Hunting Units)"){
                        layerView.children.items.forEach((gmuScale) => {
                            // Big Game GMU, Bighorn GMU, and Goat GMU
                            gmuScale.children.items.forEach((gmuAnimal) => {
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
                layerList.operationalItems.items.forEach((opLayer) => {
                    opLayer.children.items.forEach((layerView) => {
                        if ((item.parent && item.parent.title === layerView.parent.title) && (item.parent.visibilityMode2 === "exclusive")){
                            if (layerView.layer.id != item.layer.id) {
                                layerView.open = false;
                            }else{
                                layerView.open = true;
                            }
                        }
                    });
                });
            });
        });

        // open the layer if specified in config.xml
        if (openTOCgroups.includes(item.title))
            item.open = true;

        // Adds a slider for updating a top level group or individual layer's opacity
        require([ "esri/widgets/Slider"], function(Slider){
            for (var i=0; i<item.children.items.length;i++){
                //if(item.children.length == 0 && item.parent) { // || item.parent === null ){
                const slider = new Slider({
                    min: 0,
                    max: 1,
                    precision: 2,
                    //values: [ item.layer.opacity ],
                    values: [ item.children.items[i].layer.opacity],
                    visibleElements: {
                    labels: true,
                    rangeLabels: true
                    },
                    index: i // tlb save the child index children.items[index]
                });

                item.children.items[i].panel = {
                    content: slider,
                    className: "esri-icon-sliders-horizontal",
                    title: "Change layer opacity"
                };

                slider.on("thumb-drag", (event) => {
                    const { value } = event;
                    item.children.items[slider.key.index].layer.opacity = value;
                });
            }
        });



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

        // show legend  
        if (item.layer.type != "group") {
            //if (item.parent == null){
            // don't show legend twice
            item.panel = {
                content: "legend",
                open: false,
                title: "Legend"
            };
        }
    }
