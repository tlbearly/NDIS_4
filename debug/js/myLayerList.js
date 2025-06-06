function myLayerList() {
    // Dialog with 3 tabs: Layer List, Basemaps, and Legend
    const tabs = document.createElement("calcite-tabs");
    const mapLayersWidget = document.createElement("calcite-dialog");
    mapLayersWidget.appendChild(tabs);
    var listFontSize = "1rem";
    try { 
        mapLayersWidget.id = "layerlist";
        mapLayersWidget.heading = "Map Layers";
        mapLayersWidget.label = "Map layers";
        mapLayersWidget.placement = "top-end";
        mapLayersWidget.overlayPositioning = "absolute";
        mapLayersWidget.offsetDistance = "15px";
        mapLayersWidget.style.maxWidth = "350px!important";
        // set border radius and max-height for mobile in index.html

        // Tabs
        tabs.style.padding = "10px";
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
        const tabTitle3 = document.createElement("calcite-tab-title");
        tabTitle3.innerHTML = "Legend";
        tabNav.appendChild(tabTitle3);
    }catch(err){
        alert("Problem creating tabs in Map Layers dialog in myLayerList.js. Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
    }

    //----------------
    // Layer List Tab
    //----------------
    const tab1 = document.createElement("calcite-tab");
    tab1.selected = true;
    // LIST of Root Layers
    const list = document.createElement("table");
    list.style.backgroundColor = "white";
    list.style.width = "100%";
    list.style.borderCollapse = "collapse";
    list.label = "Map Layers";
    tab1.appendChild(list);
    list.id = "customLayerList";

    // Add each root layer to layer list
    //for (var i = 0; i < mapLayers.length; i++) {
    for (var i=mapLayers.length-1; i>-1; i--) {
        if (mapLayers[i].listMode === "hide") continue;
        const rootlayer = mapLayers[i]; // rootLayers
        
        const listItem = document.createElement("tr");
        if (i != mapLayers.length-1) listItem.style.borderTop = "1px solid #efefef";
        listItem.style.cursor = "pointer"; // hand
        try {
            // layers that should not be included in the layer list
            //if (nonLayers.includes(layer.title) ) return;

            // LISTITEM of each Root Layer (click shows popup dialog)
            // Image
            const listImg = document.createElement("td");
            const img = document.createElement("img");
            img.src = "assets/images/"+rootlayer.title+".jpg";
            img.width = "60";
            img.height = "45";
            img.label = rootlayer.title+" image";
            img.title = "Show "+rootlayer.title+" layers.";
            img.style.borderRadius = "15px";
            img.style.padding = "10px 5px";
            //listImg.slot = "content";
            listImg.appendChild(img);
            listItem.appendChild(listImg);
            
            // Clickable root layer name
            const listHeader = document.createElement("td");
            listHeader.style.fontWeight = "normal";
            listHeader.style.fontSize = listFontSize;
            listHeader.style.padding = "20px 5px";
            listHeader.style.margin = "0";
            listHeader.title = "Show "+rootlayer.title+" layers.";
            listHeader.innerHTML = rootlayer.title; // title displayed
            listHeader.label = "Show "+rootlayer.title+" layers.";
            listHeader.id = rootlayer.title.replace(/ /g, "_") + "_listItem";
            //listHeader.slot = "content";//actions-start";
            listItem.appendChild(listHeader);
            //listItem.value = rootlayer.title;
            listItem.label = rootlayer.title;
            // Open sub-dialog on click
            listHeader.addEventListener("click", () => {
                if(document.getElementById(rootlayer.title.replace(/ /g, "_") + "_dialog")){
                    document.getElementById(rootlayer.title.replace(/ /g, "_") + "_dialog").open = true;
                }
            });
            // Open sub-dialog on click
            listImg.addEventListener("click", () => {
                if(document.getElementById(rootlayer.title.replace(/ /g, "_") + "_dialog")){
                    document.getElementById(rootlayer.title.replace(/ /g, "_") + "_dialog").open = true;
                }
            });
        }catch(err){
            alert("Problem creating root layer in layer list. Layer title: "+rootlayer.title+" Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
        }
            
        // Status for root layers. If group layer display loading icon in subdialog
        try {
            const listStatus = document.createElement("td");
            const icon = document.createElement("calcite-icon");
            /*if (rootlayer.type === "group"){
                icon.icon = "chevron-right"; //.removeChild(listItems[i].children[2]);
                icon.className=""; // remove loading fading
                icon.label = "Show "+rootlayer.title+" layers";
                icon.title = "Show "+rootlayer.title+" layers."
            }else {*/
                icon.icon = "offline";
                icon.className = "waitingForConnection";
                icon.label = rootlayer.title + " loading...";
                icon.title = rootlayer.title + " loading...";
            //}
            
            icon.style.marginRight = "5px";
            
            listStatus.appendChild(icon)
            listItem.appendChild(listStatus);
            // Open sub-dialog on click
            listStatus.addEventListener("click", () => {
                if(document.getElementById(rootlayer.title.replace(/ /g, "_") + "_dialog")){
                    document.getElementById(rootlayer.title.replace(/ /g, "_") + "_dialog").open = true;
                }
            });
        }catch(err){
            alert("Problem creating status icon for root layer in layer list. Layer title: "+layer.title+" Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
        }

        // Add Switch to actions-end of list Item
        const listVisibility = document.createElement("td");
        const onOffBtn = document.createElement("calcite-switch");
        onOffBtn.slot = "actions-end";
        onOffBtn.layer = rootlayer;
        onOffBtn.style.paddingRight = "4px";
        onOffBtn.setAttribute("scale", "l"); // large
        onOffBtn.label = rootlayer.title + " visibility";
        onOffBtn.title = rootlayer.title + " visibility";
        listVisibility.appendChild(onOffBtn);
        if (rootlayer.visible) onOffBtn.checked = true;
        // Set value when clicked
        onOffBtn.addEventListener("calciteSwitchChange", event => {
            event.target.layer.visible = event.target.checked;
            
            if (document.getElementById(event.target.layer.title.replace(/ /g, "_") + "_dialog")){
                // Set switch on popup dialog Visibility
                document.getElementById(event.target.layer.title.replace(/ /g, "_") + "_dialog").querySelectorAll("calcite-block")[1].querySelector("calcite-switch").checked = event.target.checked;
            
                // Set opacity of layer list in sub dialog
                var tables = document.getElementById(event.target.layer.title.replace(/ /g, "_") + "_dialog").querySelectorAll("table");
                var opacity = 0.4;
                if (event.target.checked)
                    opacity=1.0;
                for (var i=0; i<tables.length; i++)
                    tables[i].style.opacity = opacity;
            }
        });
        listItem.appendChild(listVisibility);
        list.appendChild(listItem);  
    }
    tabs.appendChild(tab1);


    // Basemaps
    const tab2 = document.createElement("calcite-tab");
    let br = document.createElement("br");
    tab2.appendChild(br);
    const tab2Content = document.createElement("div");
    tab2Content.style.textAlign = "center";
    tab2Content.id = "bmGallery2";
    tab2Content.style.overflowY = "auto";
    tab2Content.innerHTML = myBasemaps();
    tab2.appendChild(tab2Content);
    tabs.appendChild(tab2);


    // legend
    require(["esri/widgets/Legend"], function (Legend) {
        const tab3 = document.createElement("calcite-tab");
        br = document.createElement("br");
        tab3.appendChild(br);
        const tab3Content = document.createElement("div");
        tab3Content.id = "legend";
        tab3Content.style.overflowY = "auto";
        new Legend({
            view: view,
            container: tab3Content
        });
        tab3.appendChild(tab3Content);
        tabs.appendChild(tab3);
    });

    mapLayersWidget.addEventListener("click", function (event) {
        if (basemapLayers.includes(event.target.id)) myToggleBasemap(event);
    });
    view.ui.add(mapLayersWidget, "top-right");

    // Map Layers Button
    const layerListExpand = document.createElement("calcite-button");
    layerListExpand.id = "layerListExpand";
    layerListExpand.iconStart = "layers";
    layerListExpand.className = "esri-widget--button";
    layerListExpand.title = "Layers, Basemaps, Legend";
    layerListExpand.label = "Layers, Basemaps, Legend";
    layerListExpand.alignment = "center";
    layerListExpand.appearance = "solid";
    layerListExpand.kind = "neutral";
    layerListExpand.scale = "m";
    layerListExpand.style.marginRight = "0px";
    layerListExpand.style.marginTop = "-10px";
    layerListExpand.setAttribute("aria-label","Open the layer list dialog box to set visibility of map layers, set basemap, or show legend.");
    layerListExpand.setAttribute("aria-selected","false");
    if (window.innerWidth > 768){
        const layerListLabel = document.createElement("span");
        layerListLabel.innerHTML = "Map Layers";
        layerListLabel.style.fontSize = "medium";
        layerListExpand.appendChild(layerListLabel);
        layerListExpand.style.width = "140px";
    }    
    layerListExpand.addEventListener("click", function (event) {
        document.getElementById("layerlist").open = true;
    });
    view.ui.add(layerListExpand, "top-right");
}

function addToLayerListIfAllLoaded(layer){
    // check that all group sublayers have loaded then remove loading icon from layer list root layers
    //console.log("checking if all sublayers have loaded: "+layer.title);
    var items=null;
    if (layer.layers) items = layer.layers.items;
    else if (layer.sublayers) items = layer.sublayers.items;
    var loaded = true;

    // transportation is not work!!! so remove loading icon and continue
    /*if (layer.title === "Transportation") {
        const list = document.getElementById("customLayerList");
        if (list) {
            const listItems = list.children;
            for (var i = 0; i < listItems.length; i++) {
                if (listItems[i].label === layer.title) {
                    // children: picture, title, status, switch
                    listItems[i].children[2].children[0].icon = "chevron-right";
                    listItems[i].children[2].children[0].className=""; // remove loading fading
                    listItems[i].children[2].children[0].title = "Show "+listItems[i].children[1].innerHTML+" layers.";
                    break;
                }
            }
        }
        return true;
    }*/
    // Make sure the layer has been added to the customLayerList and has 4 children: image, title, wait icon, switch
    /*const list = document.getElementById("customLayerList");
    if (!list) loaded = false;
    const listItems = list.children;
    for (var i = 0; i < listItems.length; i++) {
        if (listItems[i].value === layer.title) {
            if (listItems[i].children.length < 4) loaded = false;
            break;
        }
    }*/
    
    // make sure each group and sublayer has loaded: Game Species/Elk/Elk Winter Range
    if (loaded && items){
        for (i=0; i<items.length; i++){
            // group name (eg Elk)
            if(items[i].loaded){
                
                var items2=null;
                if (items[i].layers) items2 = items[i].layers.items;
                else if (items[i].sublayers) items2 = items[i].sublayers.items;
                // layers in the group (eg Elk Winter Range)
                if (items2){
                    for(var j=0; j<items2.length; j++) {
                        if (items2[j].title === "Status")continue; // skip MVUM Status
                        if (items2[j].title === "Visitor Map Symbology")continue;
                        
                        if(!items2[j].loaded) {
                            loaded=false;
                            console.log(items2[j].title+" "+items2[j].loadStatus);
                            if (items2[j].loadError && items2[j].loadError.details && items2[j].loadError.details.messages) console.log(" Error message: "+items2[j].loadError.details.messages);
                            i = items.length;// break out of both loops
                            break;
                        }
                    }
                }
            } else {
                // group layer continue
                continue;
            }
        }
    }
    
    if (loaded) {
        // Remove loading status icon in parent dialog
        // search for listItem
        const list = document.getElementById("customLayerList");
        if (list) {
            const listItems = list.children;
            for (var i = 0; i < listItems.length; i++) {
                if (listItems[i].label === layer.title) {
                    // children: picture, title, status, switch
                    listItems[i].children[2].children[0].icon = "chevron-right";
                    listItems[i].children[2].children[0].className=""; // remove loading fading
                    listItems[i].children[2].children[0].title = "Show "+listItems[i].children[1].innerHTML+" layers.";
                    break;
                }
            }
        }
        return true;
    }else{
        // wait 1 second and try again
        setTimeout(function(myLayer){
            layerListAddSublayerDialogs(null,myLayer);
            console.log("Waiting for "+myLayer.title+ " to load.");
        },1000,layer);
        return false;
    }
}

var goatFL=null,bighornFL=null; 
function setGMU(item){
    // change the search widget GMU layer to ELK Bighorn or Mountain Goat
    // display the gmu layer on the map
    if (app.toLowerCase() != "huntingatlas") return;
    // set gmu species && display GMU layer
    var gmuIndex = findGMUIndex();
    if (item.title === "Bighorn Sheep") {
        gmu = "Bighorn GMU";

        // switch searchWidget GMU layer to Bighorn GMUs
        // find the index of the Find a Place GMUs
        if (gmuIndex != -1) {
        if (!bighornFL){
            // Must be FeatureLayer for Search Widget!
            require(["esri/layers/FeatureLayer"], function(FeatureLayer){
                bighornFL = new FeatureLayer({
                    url: settings.sheepUrl
                });
            });
        }
        searchWidget.sources.items[gmuIndex].layer = bighornFL;
        searchWidget.sources.items[gmuIndex].searchFields = [settings.sheepField];
        searchWidget.sources.items[gmuIndex].displayField = settings.sheepField;
        searchWidget.sources.items[gmuIndex].outFields = [settings.sheepField];
        searchWidget.sources.items[gmuIndex].name = "Bighorn Sheep GMUs";
        searchWidget.sources.items[gmuIndex].placeholder = "Search Bighorn GMUs";
        }
    }
    else if (item.title === "Mountain Goat") {
        gmu = "Goat GMU";
        // find the index of the Find a Place GMUs
        if (gmuIndex != -1) {
        if (!goatFL){
            // Must be FeatureLayer for Search Widget!
            require(["esri/layers/FeatureLayer"], function(FeatureLayer){
                goatFL = new FeatureLayer({
                    url: settings.goatUrl
                });
            });
        }
        searchWidget.sources.items[gmuIndex].layer = goatFL;
        searchWidget.sources.items[gmuIndex].searchFields = [settings.goatField];
        searchWidget.sources.items[gmuIndex].displayField = settings.goatField;
        searchWidget.sources.items[gmuIndex].outFields = [settings.goatField];
        searchWidget.sources.items[gmuIndex].name = "Mountain Goat GMUs";
        searchWidget.sources.items[gmuIndex].placeholder = "Search Goat GMUs";
        }
    }
    else {
        gmu = "Big Game GMU";
        // find the index of the Find a Place GMUs
        if (gmuIndex != -1) {
        searchWidget.sources.items[gmuIndex].layer = gmuFL;
        searchWidget.sources.items[gmuIndex].searchFields = [settings.elkField];
        searchWidget.sources.items[gmuIndex].displayField = settings.elkField;
        searchWidget.sources.items[gmuIndex].outFields = [settings.elkField];
        searchWidget.sources.items[gmuIndex].name = "Big Game GMUs";
        searchWidget.sources.items[gmuIndex].placeholder = "Search GMUs";
        }
    }
    // Show correct GMU layer, hide others
    var landLayer = document.getElementById("Land and Access".replace(/ /g, "_") + "_dialog");
    var gmuLayer = landLayer.querySelectorAll("tr");
    for (var i=0; i< gmuLayer.length; i++){
        if(gmuLayer[i].querySelectorAll("calcite-switch")[0].layer.title === "GMU boundary (Hunting Units)"){
            gmuLayer[i].querySelectorAll("calcite-switch")[0].layer.sublayers.items.forEach((gmuScale) => {
                // Big Game GMU, Bighorn GMU, and Goat GMU
                gmuScale.sublayers.items.forEach((gmuAnimal) => {
                    switch (gmu) {
                    case "Big Game GMU":
                        if (gmuAnimal.title === "Big Game GMU") {
                        gmuAnimal.visible = true;
                        }
                        else {
                        gmuAnimal.visible = false; // don't show on map
                        }
                        break;
                    case "Bighorn GMU":
                        if (gmuAnimal.title === "Bighorn GMU") {
                        gmuAnimal.visible = true;
                        }
                        else {
                        gmuAnimal.visible = false; // don't show on map
                        }
                        break;
                    case "Goat GMU":
                        if (gmuAnimal.title === "Goat GMU") {
                        gmuAnimal.visible = true;
                        }
                        else {
                        gmuAnimal.visible = false; // don't show on map
                        }
                        break;
                    }
                });
            });
            break;
        }
    }
}

// Add Sublayer Dialogs once the layer has loaded
function layerListAddSublayerDialogs(event,theLayer){
    require(["esri/core/reactiveUtils"],function(reactiveUtils){
        var listFontSize = "1rem";
        var hLevel = 3;
        let layer;
        var subLayeronOffBtn;
        if (event)
            layer = event.layerView.layer; // rootLayers
        else
            layer = theLayer;

        if(layer.listMode === "hide")return;
        // Make sure all sublayers have loaded
        //if (!addToLayerListIfAllLoaded(layer)) return;
        // remove loading on parent root layer if loaded
        // Remove loading status icon in parent dialog
        
        // search for layer in listItem and removing waiting icon (layer has loaded)
        const list = document.getElementById("customLayerList");
        if (list) {
            const listItems = list.children;
            for (var i = 0; i < listItems.length; i++) {
                if (listItems[i].label === layer.title) {
                    // children: picture, title, status, switch
                    listItems[i].children[2].children[0].icon = "chevron-right";
                    listItems[i].children[2].children[0].className=""; // remove loading fading
                    listItems[i].children[2].children[0].title = "Show "+listItems[i].children[1].innerHTML+" layers.";
                    break;
                }
            }
        }

        // then create sub-layer dialogs
        //console.log("creating layer dialog for: "+layer.title);
        // POPUP DIALOG for each Root Layer
        try {
            var sublayerDialog = document.createElement("calcite-dialog");
            //sublayerDialog.setAttribute("modal", false); // makes map unclickable!!!!!!!!!!!!!
            sublayerDialog.setAttribute("open", false);
            sublayerDialog.setAttribute("heading-level", 3);
            sublayerDialog.setAttribute("width-scale", "m");
            sublayerDialog.setAttribute("placement", "top-end");
            sublayerDialog.id = layer.title.replace(/ /g, "_") + "_dialog";
            sublayerDialog.overlayPositioning = "absolute";
            sublayerDialog.className="esri-component";
            sublayerDialog.offsetDistance = "10px";
            sublayerDialog.style.width=0;
            sublayerDialog.style.height=0;
            // on close, open parent dialog
            sublayerDialog.addEventListener("calciteDialogBeforeClose", function () {
                document.getElementById("layerlist").open = true;
            });
            // on open, close parent dialog
            sublayerDialog.addEventListener("calciteDialogBeforeOpen", function () {
                document.getElementById("layerlist").open = false;
            });
        }catch(err){
            alert("Problem creating sub layer dialog in layer list in myLayerList.js/layerListAddSublayerDialogs. For layer title: "+layer.title+". Error: "+err+" Message: "+err.message+" Stack: "+err.stack,"Error");
        }

        // set sub-dialog header
        try {
            sublayerDialog.label = layer.title;
            sublayerDialog.heading = layer.title;
            // image in header     
            /*if (layer.visibilityMode === "exclusive") {
                // add image to header
                var img = document.createElement("img");
                img.src = "assets/images/home_hunt.jpg";
                img.title = "Game Species map image";
                img.slot = "header-actions-start";
                img.style.height = "3rem";
                img.style.width = "auto";
                img.style.margin = "0";
                sublayerDialog.appendChild(img);
            }*/
        }catch(err){
            alert("Problem creating sublayer-dialog title in layer list in myLayerList.js/layerListAddSublayerDialogs. For layer title: "+layer.title+". Error: "+err+" Message: "+err.message+" Stack: "+err.stack,"Error");
        }

        // Radio button list
        if (layer.visibilityMode === "exclusive" || (radioLayers && radioLayers.indexOf(layer.title)>-1 )) {
            var selectedItem; // default title for radio button sublayer popover
            var selectedLayer;
            // Add dropdown combo box
            const combo = document.createElement("calcite-combobox");
            var radioArr;
            try {
                combo.selectionMode = "single";
                combo.menuPlacement = "header-actions-end";
                //combo.label = selectedItem; // set this below when find the visible one
                //combo.placeholder = selectedItem;
                combo.style.marginTop = "10px";
                //combo.heading=selectedItem;//layer.title;
                //combo.selectionDisplay = "single";
                combo.clearDisabled = true;

                if (layer.sublayers) radioArr = layer.sublayers.items; // MapImageLayer
                else if (layer.layers) radioArr = layer.layers.items; // FeatureLayer
                else {
                    alert(layer.title +" is not a MapImageLayer or FeatureLayer! Unknown layer type. In myLayerList.js/layerListAddSublayerDialogs","Error");
                    return; // process next root layer
                }
            }catch(err){
                alert("Problem creating drop down for "+layer.title+" sub dialog in layer list. In myLayerList.js/layerListAddSublayerDialogs Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
            }

            // add alphabetized list of radio buttons
            radioArr.sort(function (a, b) {
                if (a.title < b.title) return -1;
                if (a.title > b.title) return 1;
                return 0;
            });
            sublayerDialog.appendChild(combo);
            combo.slot="header-actions-end";
            
            const radioGroup = document.createElement("calcite-radio-button-group");
            radioGroup.name="radioBtns";
            radioGroup.layout = "vertical";
            radioGroup.style.padding = "10px";
            combo.appendChild(radioGroup);
            sublayerDialog.appendChild(combo);
            let iframe1 = null;

            // drop down list of radio buttons
            radioArr.forEach(species => {
                const radio = document.createElement("calcite-label");
                radio.layout="inline";
                if (species.visible){
                    radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"' checked></calcite-radio-button> "+species.title;
                    //accItem0.description = species.title;
                    selectedItem = species.title;
                    selectedLayer = species;
                    combo.label = selectedItem;
                    combo.placeholder = selectedItem;
                }
                else
                    radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"'></calcite-radio-button> "+species.title;
                radio.layer = species;
                radio.addEventListener("click",() =>{
                    document.getElementById(selectedItem).style.visibility = "collapse";
                    document.getElementById(species.title).style.visibility = "visible";
                    selectedLayer.visible = false; // turn off last layer
                    species.visible = true; // turn on selected layer
                    selectedItem = species.title;
                    selectedLayer = species;
                    radioGroup.parentNode.placeholder = selectedItem;
                    radioGroup.parentNode.open = false;
                    // Update layer description
                    iframe1.src = "layer-desc/" + selectedItem + ".html";
                    if (layer.title === "Game Species")
                        setGMU(species); // update search widget and map
                    // Update opacity is whole block is visible or not
                    if (document.getElementById(selectedItem).parentNode.querySelector("calcite-switch").checked){
                        document.getElementById(selectedItem).style.opacity = 1.0;
                    } else document.getElementById(selectedItem).style.opacity = 0.4;
                });
                radioGroup.appendChild(radio); 
            });

            // Description drop down
            var block = document.createElement("calcite-block");
            block.heading = "Layer Descriptions:";
            block.headingLevel = hLevel;
            block.setAttribute("collapsible", true);
            
            // Description
            var notice = document.createElement("calcite-notice");
            notice.open = true;
            //notice.style.overflowY = "auto";
            notice.style.height = "auto";
            notice.style.padding="0";
            iframe1 = document.createElement("iframe");
            iframe1.style.height = "300px"; 
            iframe1.style.width = "100%";
            iframe1.slot="message";
            iframe1.src = "layer-desc/" + selectedItem + ".html";
            iframe1.setAttribute("frameborder",0);
            //iframe.style.border = "none";
            iframe1.style.margin = "0";
            iframe1.title = "Description of " + selectedItem + " map layer(s)";
            // Add magnify button
            var openBtn = document.createElement("calcite-icon");
            openBtn.icon = "search";
            openBtn.style.padding = "0";
            openBtn.slot = "title";
            openBtn.scale = "m";
            openBtn.addEventListener("click", function (event) {
                window.open("layer-desc/" + selectedItem + ".html", "_blank");
            });
            notice.appendChild(openBtn);
            notice.appendChild(iframe1);
            block.appendChild(notice);
            sublayerDialog.appendChild(block);

            // Radio List Visiblity
            block = document.createElement("calcite-block");
            block.headingLevel = hLevel;
            block.heading = "Visibility:";
            block.style.border = "none";
            block.setAttribute("collapsible", false);
            block.setAttribute("open",true);

            // Add Switch to actions-end of Visibility label
            subLayeronOffBtn = document.createElement("calcite-switch");
            subLayeronOffBtn.slot = "actions-end";
            subLayeronOffBtn.layer = layer;
            subLayeronOffBtn.style.padding = "10px 14px 0 10px";
            subLayeronOffBtn.setAttribute("scale", "l"); // large
            if (layer.visible) {
                subLayeronOffBtn.checked = true;
            } else {
                subLayeronOffBtn.checked = false;
            }
            // Set value when clicked
            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                event.target.layer.visible = event.target.checked;
                // gray out options if not visible
                if (event.target.checked){
                    document.getElementById(selectedItem).style.opacity = 1.0;
                }else {
                    document.getElementById(selectedItem).style.opacity = 0.4;
                }
                // Set switch on parent dialog Visibility
                if (document.getElementById("customLayerList")){
                    var switches = document.getElementById("customLayerList").querySelectorAll("tr");
                    switches.forEach(mySwitch => {
                        if (mySwitch.children[1].innerHTML === event.target.layer.title){
                            mySwitch.querySelector("calcite-switch").checked = event.target.checked;
                        }
                    });
                }
            });
            block.appendChild(subLayeronOffBtn);
            
            var subLayerListItem, subLayerListHeader;
            // Visibility list in sublayer popup
            if (radioArr) {
                radioArr.forEach(element => {
                    // Visible List
                    var subLayerList = document.createElement("table");
                    subLayerList.style.backgroundColor = "white";
                    subLayerList.style.width = "100%";
                    subLayerList.style.borderCollapse = "collapse";
                    // set the opacity of the layer list. Gray out if switch is off.
                    if (!layer.visible) subLayerList.style.opacity = 0.4;
                    subLayerList.id = element.title;
                    if (element.title === selectedItem) subLayerList.style.visibility = "visible";
                    else subLayerList.style.visibility = "collapse";
                    //subLayerList.style.marginTop = "2px";
                    var speciesSubArr;
                    if (element.sublayers) {
                        //element.sublayers.items = element.sublayers.items.reverse();
                        speciesSubArr = element.sublayers;
                    }
                    else if (element.layers) {
                        //element.layers.items = element.layers.items.reverse();
                        speciesSubArr = element.layers;
                    }

                    if (speciesSubArr && speciesSubArr.items) {
                        let item = speciesSubArr.items;
                        //speciesSubArr.items.forEach(item => {
                        for (var i=item.length-1; i>-1; i--) {
                            subLayerListItem = document.createElement("tr");
                            if (i != item.length-1)
                                subLayerListItem.style.borderTop = "1px solid #efefef";

                            // Add legend 
                            // TODO add picture of legend ??????? Maybe **********************
                            var subLayerIcon = document.createElement("td");
                            var img = document.createElement("img");
                            subLayerIcon.appendChild(img);
                            subLayerIcon.style.width = "0px";
                            subLayerListItem.appendChild(subLayerIcon);
                            // end picture of legend
                            
                            // Layer Name
                            subLayerListHeader = document.createElement("td");
                            subLayerListItem.style.fontSize=listFontSize;
                            // set opacity visible at scale?
                            if((view.scale <= item[i].minScale || item[i].minScale == 0) && 
                            (view.scale >= item[i].maxScale || item[i].maxScale==0)){
                                subLayerListHeader.style.opacity="1";
                            }else {
                                subLayerListHeader.style.opacity="0.3";
                            }
                            const theItem = item[i];
                            // Event handler for scale change
                            reactiveUtils.watch(
                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                    if (stationary) {
                                        if((scale <= theItem.minScale || theItem.minScale == 0) && 
                                        (scale >= theItem.maxScale || theItem.maxScale==0)){
                                            subLayerListHeader.style.opacity="1";
                                        }else {
                                            subLayerListHeader.style.opacity="0.3";
                                        }
                                    }
                            });
                            subLayerListHeader.style.fontWeight = "normal";
                            subLayerListHeader.style.fontSize = listFontSize;
                            subLayerListHeader.style.margin = "0";
                            subLayerListHeader.innerHTML = item[i].title.replace("CPWSpeciesData -",""); // title displayed
                            subLayerListItem.label = item[i].title.replace("CPWSpeciesData -","");
                            subLayerListItem.appendChild(subLayerListHeader);

                            // Status has layer loaded?
                            var statusColumn = document.createElement("td");
                            const icon = document.createElement("calcite-icon");
                            icon.id = "statusIcon";
                            if (item[i].loaded){
                                icon.icon = "";
                            }else {
                                icon.icon = "offline";
                                icon.className = "waitingForConnection";
                                icon.label = "loading...";
                                icon.title = "loading...";
                                icon.style.marginRight = "5px";
                            
                                item[i].on("layerview-create", function(event){
                                    icon.icon = "";
                                    icon.label = "";
                                    icon.title = "";
                                    icon.className = "";
                                });
                            }
                            statusColumn.appendChild(icon)
                            subLayerListItem.appendChild(statusColumn);

                            // Add Switch to actions-end of list Item
                            subLayerVisibility = document.createElement("td");
                            subLayeronOffBtn = document.createElement("calcite-switch");
                            subLayeronOffBtn.slot = "actions-end";
                            subLayeronOffBtn.layer = item[i];
                            subLayeronOffBtn.label = item[i].title + " visibility";
                            subLayeronOffBtn.title = item[i].title + " visibility";
                            subLayeronOffBtn.style.paddingTop = "10px";
                            subLayeronOffBtn.setAttribute("scale", "l"); // large
                            if (item[i].visible) subLayeronOffBtn.checked = true;
                            // Set value when clicked
                            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                event.target.layer.visible = event.target.checked;
                            });
                            subLayerVisibility.appendChild(subLayeronOffBtn);
                            subLayerListItem.appendChild(subLayerVisibility);
                            subLayerList.appendChild(subLayerListItem);
                        }
                    }
                    block.appendChild(subLayerList);
                });
                sublayerDialog.appendChild(block);
            }
        }

        // Not radio buttons
        else {
            try{
                //-------------
                // Description
                //-------------
                var block = document.createElement("calcite-block");
                block.heading = "Layer Descriptions:";
                block.headingLevel = hLevel;
                block.setAttribute("collapsible", true);

                var notice = document.createElement("calcite-notice");
                notice.open = true;
                notice.style.padding="0";
                notice.description = layer.title;
                block.appendChild(notice);

                // Description File <layer.title>.html
                var iframe1 = document.createElement("iframe");
                iframe1.style.height = "300px"; 
                iframe1.style.width = "100%";
                iframe1.slot="message";
                iframe1.src = "layer-desc/" + layer.title + ".html";
                iframe1.setAttribute("frameborder",0);
                //iframe.style.border = "none";
                iframe1.style.margin = "0";
                iframe1.title = "Description of " + layer.title + " map layer(s)";
                
                // Add open layer description in new window button
                var openBtn = document.createElement("calcite-icon");
                openBtn.icon = "search";
                openBtn.style.padding = "0";
                openBtn.slot = "title";
                openBtn.scale = "m";
                openBtn.addEventListener("click", function (event) {
                    window.open("layer-desc/" + layer.title + ".html", "_blank");
                });
                notice.appendChild(openBtn);
                notice.appendChild(iframe1);
                block.appendChild(notice);
                sublayerDialog.appendChild(block);

                //--------------
                // Visiblility
                //--------------
                block = document.createElement("calcite-block");
                block.heading = "Visibility:";
                block.headingLevel = hLevel;
                block.style.border = "none";
                block.setAttribute("collapsible", false);
                block.setAttribute("open",true);

                // Add on/off switch to end of Visibility
                subLayeronOffBtn = document.createElement("calcite-switch");
                subLayeronOffBtn.slot = "actions-end";
                subLayeronOffBtn.layer = layer;
                subLayeronOffBtn.style.padding = "10px 14px 0 4px";
                subLayeronOffBtn.setAttribute("scale", "l"); // large
                if (layer.visible) {
                    subLayeronOffBtn.checked = true;
                }
                else {
                    subLayeronOffBtn.checked = false;
                }

                // Set visibility when clicked on on/off switch
                subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                    event.target.layer.visible = event.target.checked;
                    // gray out options if not visible
                    if (event.target.checked){
                        subLayerList.style.opacity = "1.0";
                    }else {
                        subLayerList.style.opacity = "0.4";
                    }
                    // Set switch on parent dialog visibility
                    if (document.getElementById("customLayerList")){
                        var switches = document.getElementById("customLayerList").querySelectorAll("tr");
                        switches.forEach(mySwitch => {
                            if (mySwitch.children[1].innerHTML === event.target.layer.title){
                                mySwitch.querySelector("calcite-switch").checked = event.target.checked;
                            }
                        });
                    }
                });
                block.appendChild(subLayeronOffBtn);

                //----------------
                // List of layers
                //----------------
                let subLayerList = document.createElement("table");
                subLayerList.style.backgroundColor = "white";
                subLayerList.style.width = "100%";
                subLayerList.style.borderCollapse = "collapse";

                // set the opacity of the layer list. Gray out if switch is off.
                if (!layer.visible) subLayerList.style.opacity = 0.4;
                var subLayerListItem;
                //var layerCount = -1; // id of sublayer to fill in if layer has not loaded yet
                // Visibility list in sublayer popup
                // MapImageLayers have sublayers. FeatureLayers have layers
                var sublayerArr;
                if (layer.sublayers) sublayerArr = layer.sublayers;
                else if (layer.layers) sublayerArr = layer.layers;       
                if (sublayerArr && sublayerArr.items) {
                    //------------------------
                    // 1st level group layers
                    //------------------------
                    let element = sublayerArr.items;
                    for (var i=element.length-1; i>-1; i--) {
                        //console.log("-->"+element[i].title);
                        if (element[i].listMode === "show") {
                            //-----------------
                            // 2nd level group
                            //-----------------

                            if (layer.title === element[i].title) {
                                let row = document.createElement("tr");
                                if (i != element.length-1)
                                    row.style.borderTop = "1px solid #efefef";
                                subLayerList.appendChild(row);
                                //layerCount++;
                                //col.id = layer.title+layerCount;
                                if (element[i].loaded == false) {
                                    //alert("need to wait for layer to load, "+element[i].title);
                                    var tim2 = setInterval(function(layer){
                                        // call function to add layer and sublayers
                                        if (layer.layers || layer.sublayers){
                                            clearInterval(tim2);
                                            addToLayerList(row, layer, false, listFontSize,hLevel);
                                        }
                                    },500,element[i]);
                                }else
                                    addToLayerList(row, element[i], false, listFontSize,hLevel); // false = do not add expandable block

                            }
                            // if it has sublayers make it an expandable block
                            // tr td calcite-block
                            //  <p (subLayerListItem2)><span (subLayerListHeader2)>layer title</span><calcite-switch (subLayeronOffBtn)></p>
                            else if (hideGroupSublayers.indexOf(element[i].title) == -1 && (element[i].layers || element[i].sublayers)){
                                let blockRow = document.createElement("tr");
                                if (i != element.length-1)
                                    blockRow.style.borderTop = "1px solid #efefef";
                                let blockCol = document.createElement("td");
                                blockCol.colSpan = "3";
                                blockRow.appendChild(blockCol);
                                let subLayerGroup = document.createElement("calcite-block");
                                subLayerGroup.heading = element[i].title;
                                subLayerGroup.value = element[i].title;
                                subLayerGroup.headingLevel = hLevel;
                                subLayerGroup.style.fontWeight = "normal";
                                subLayerGroup.style.border = "none";
                                subLayerGroup.setAttribute("collapsible", true);
                                // if open or opensublayer was set to true in config.xml
                                if (openTOCgroups.indexOf(element[i].title) > -1)
                                    subLayerGroup.setAttribute("open",true);
                                else    
                                    subLayerGroup.setAttribute("open",false);
                                subLayerGroup.style.marginLeft = "-12px";
                                blockCol.appendChild(subLayerGroup);

                                // if all of it's children are out of scale gray out
                                // event listener for scale change
                                const theElement = element[i];
                                reactiveUtils.watch(
                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                    if (stationary) {
                                        var items;
                                        if (theElement.layers) items=theElement.layers.items;
                                        else if (theElement.sublayers) items=theElement.sublayers.items;
                                        var visibleItems = false; // Are any items in this block visible?
                                        items.forEach(item => {
                                            if((scale <= item.minScale || item.minScale == 0) && 
                                                (scale >= item.maxScale || item.maxScale==0)){
                                                    visibleItems = true;
                                            }
                                        });
                                        if (visibleItems) subLayerGroup.style.opacity="1";
                                        else subLayerGroup.style.opacity="0.3";

                                    }
                                });
                                // Set the first time, if all of it's children are out of scale gray out
                                var items;
                                if (element[i].layers) items=element[i].layers.items;
                                else if (element[i].sublayers) items=element[i].sublayers.items;
                                var visibleItems = false; // Are any items in this block visible?
                                items.forEach(item => {
                                    if((view.scale <= item.minScale || item.minScale == 0) && 
                                        (view.scale >= item.maxScale || item.maxScale==0)){
                                            visibleItems = true;
                                    }
                                });
                                if (visibleItems) subLayerGroup.style.opacity="1";
                                else subLayerGroup.style.opacity="0.3";

                                subLayerList.appendChild(blockRow);
                                // Add Switch to actions-end of list Item
                                let subLayeronOffBtn = document.createElement("calcite-switch");
                                subLayeronOffBtn.slot = "actions-end";
                                subLayeronOffBtn.layer = element[i];
                                subLayeronOffBtn.style.paddingRight = "4px";
                                subLayeronOffBtn.style.paddingTop = "10px";
                                subLayeronOffBtn.setAttribute("scale", "l"); // large
                                if (element[i].visible) subLayeronOffBtn.checked = true;
                                else subLayeronOffBtn.checked = false;
                                // Set value when clicked
                                subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                    event.target.layer.visible = event.target.checked;
                                    
                                });
                                subLayerGroup.appendChild(subLayeronOffBtn);
                                
                                // 2nd level group layers
                                var subSublayerArr;
                                if (element[i].loaded == false){
                                // wait and then call routine again
                                    //alert(element[i].title+" not loaded. TODO in myLayerList.js");




                                }
                                if (element[i].sublayers) subSublayerArr = element[i].sublayers;
                                else if (element[i].layers) subSublayerArr = element[i].layers;
                                if (subSublayerArr && subSublayerArr.items) {
                                    const item = subSublayerArr.items;
                                    for (var j=item.length-1; j>-1; j--) {
                                        //console.log("--> -->"+item[j].title);

                                        // Don't include MVUM Status or Visitor Map Symbology
                                        if ((element[i].title === "Motor Vehicle Use Map" || element[i].title === "MVUM") &&
                                        (item[j].title === "Status" || item[j].title === "Visitor Map Symbology")){
                                            item[j].listMode = "hide";
                                            item[j].legendEnabled = false;
                                        }
                                        if (item[j].listMode === "show") {
                                            var subLayerListItem2 = document.createElement("div");
                                            subLayerListItem2.style = "display:grid;align-items:stretch;grid-template-columns:auto 24px 48px;grid-gap:5px;";
                                            //subLayerListItem2.style.marginTop = "-5px";
                                            let subLayerListHeader2 = document.createElement("div");
                                            subLayerListHeader2.style.maxWidth = "220px";
                                            subLayerListHeader2.style.fontSize=listFontSize;
                                            // if out of scale range, gray out.
                                            if((view.scale <= item[j].minScale || item[j].minScale == 0) && 
                                            (view.scale >= item[j].maxScale || item[j].maxScale==0)){
                                                subLayerListHeader2.style.opacity="1";
                                            }else {
                                                subLayerListHeader2.style.opacity="0.3";
                                            }
                                            // Event handler for scale change
                                            const theItem = item[j];
                                            reactiveUtils.watch(
                                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                                    if (stationary) {
                                                        if((scale <= theItem.minScale || theItem.minScale == 0) && 
                                                        (scale >= theItem.maxScale || theItem.maxScale==0)){
                                                            subLayerListHeader2.style.opacity="1";
                                                        }else {
                                                            subLayerListHeader2.style.opacity="0.3";
                                                        }
                                                    }
                                            });
                                            // remove "CPWAdminData - " from the title
                                            if (item[j].title.indexOf("CPWAdminData - ")>-1)
                                                item[j].title = item[j].title.substring(15);
                                            subLayerListHeader2.innerHTML = item[j].title; // title displayed
                                            subLayerListHeader2.style.fontWeight = "normal";
                                            subLayerListHeader2.style.padding = "0 0 0 30px";
                                            subLayerListHeader2.style.float = "left";
                                            //subLayerListHeader2.slot = "content";
                                            subLayerListItem2.label = item[j].title;
                                            //subLayerListItem2.heading = item[j].title;
                                            subLayerListItem2.appendChild(subLayerListHeader2);

                                            // Status has layer loaded?
                                            const iconDiv = document.createElement("div");
                                            if(item[j].type != "group"){
                                                const icon = document.createElement("calcite-icon");
                                                icon.id = "statusIcon";
                                                var testLayer = item[j];
                                                if (item[j].type === "sublayer") testLayer = item[j].parent;
                                                if (testLayer.type === "sublayer") testLayer = item[j].parent.parent;
                                                if (testLayer.loaded){
                                                    icon.icon = "";
                                                }else {
                                                    icon.icon = "offline";
                                                    icon.className = "waitingForConnection";
                                                    icon.label = "loading...";
                                                    icon.title = "loading...";
                                                    icon.style.marginRight = "5px";
                                                
                                                    console.log (item[j].title+" "+item[j].type);
                                                    // TODO !!!!!!!!!!!!!!!!!!!!!!!! not working for all layers (sublayers)
                                                    if(testLayer.on !== undefined) {
                                                        testLayer.on("layerview-create", function(event){
                                                            icon.icon = "";
                                                            icon.label = "";
                                                            icon.title = "";
                                                            icon.className = "";
                                                        });
                                                    }else {
                                                        alert("Failed to test if layer loaded: "+item[j].title);
                                                    }
                                                }
                                                iconDiv.appendChild(icon);
                                            }
                                            subLayerListItem2.appendChild(iconDiv);
                                            
                                            // Add Switch to actions-end of list Item
                                            const switchDiv = document.createElement("div");
                                            let subLayeronOffBtn = document.createElement("calcite-switch");
                                            //subLayeronOffBtn.slot = "actions-end";
                                            subLayeronOffBtn.layer = item[j];
                                            subLayeronOffBtn.style.float = "right";
                                            subLayeronOffBtn.style.paddingLeft = "4px";
                                            subLayeronOffBtn.style.marginRight = "-12px";
                                            subLayeronOffBtn.setAttribute("scale", "l"); // large
                                            if (item[j].visible) subLayeronOffBtn.checked = true;
                                            else subLayeronOffBtn.checked = false;
                                            // Set value when clicked
                                            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                                event.target.layer.visible = event.target.checked;
                                            });
                                            switchDiv.appendChild(subLayeronOffBtn);
                                            subLayerListItem2.appendChild(switchDiv);
                                            subLayerGroup.appendChild(subLayerListItem2); // Append to the calcite-block
                                        }
                                    }
                                }
                            }
                            // 1st level list item
                            // <tr (subLayerListItem)><td (subLayerListHeader)>layer title</td><td (subLayerVisibility)><calcite-switch (subLayerVisibility)></td></tr>
                            else {  
                                subLayerListItem = document.createElement("tr");
                                if (i != element.length-1)
                                    subLayerListItem.style.borderTop = "1px solid #efefef";
                                subLayerListItem.style.fontSize=listFontSize;
                                subLayerListItem.style.margin="0";
                                let subLayerListHeader = document.createElement("td");
                                subLayerListHeader.style.fontSize=listFontSize;
                                // gray out if not at scale
                                if (element[i].minScale != 0 || element[i].maxScale != 0){
                                    if((view.scale <= element[i].minScale || element[i].minScale == 0) && 
                                        (view.scale >= element[i].maxScale || element[i].maxScale==0)){
                                        subLayerListHeader.style.opacity="1";
                                    }else {
                                        subLayerListHeader.style.opacity="0.3";
                                    }
                                    // event listener for scale change
                                    const theElement = element[i];
                                    reactiveUtils.watch(
                                        () => [view.stationary, view.scale], ([stationary, scale]) => {
                                            if (stationary) {
                                                if((scale <= theElement.minScale || theElement.minScale == 0) && 
                                                    (scale >= theElement.maxScale || theElement.maxScale==0)){
                                                    subLayerListHeader.style.opacity="1";
                                                }else {
                                                    subLayerListHeader.style.opacity="0.3";
                                                }
                                            }
                                        });
                                }
                                subLayerListHeader.style.fontWeight = "normal";
                                subLayerListHeader.style.margin = "0";
                                subLayerListHeader.innerHTML = element[i].title; // title displayed
                                //subLayerListHeader.slot = "content";
                                subLayerListItem.appendChild(subLayerListHeader);
                                subLayerList.appendChild(subLayerListItem);
                                
                                // add status icon
                                const iconDiv = document.createElement("td");
                                if(element[i].type != "group"){
                                    const icon = document.createElement("calcite-icon");
                                    icon.id = "statusIcon";
                                    var testLayer = element[i];
                                    if (element[i].type === "sublayer") testLayer = element[i].parent;
                                    if (testLayer.type === "sublayer") testLayer = element[i].parent.parent;
                                    if (testLayer.loaded){
                                        icon.icon = "";
                                    }else {
                                        icon.icon = "offline";
                                        icon.className = "waitingForConnection";
                                        icon.label = "loading...";
                                        icon.title = "loading...";
                                        icon.style.marginRight = "5px";
                                    
                                        console.log (element[i].title+" "+element[i].type);
                                        if(testLayer.on !== undefined) {
                                            testLayer.on("layerview-create", function(event){
                                                icon.icon = "";
                                                icon.label = "";
                                                icon.title = "";
                                                icon.className = "";
                                            });
                                        }else {
                                            alert("Failed to test if layer loaded: "+element[i].title);
                                        }
                                    }
                                    iconDiv.appendChild(icon);
                                }
                                subLayerListItem.appendChild(iconDiv);
                                            






                                // Add Switch to actions-end of list Item
                                let subLayerVisibility = document.createElement("td");
                                subLayerVisibility.style.float = "right";
                                let subLayeronOffBtn = document.createElement("calcite-switch");
                                subLayeronOffBtn.slot = "actions-end";
                                subLayeronOffBtn.layer = element[i];
                                subLayeronOffBtn.style.paddingRight = "4px";
                                subLayeronOffBtn.setAttribute("scale", "l"); // large
                                if (element[i].visible) subLayeronOffBtn.checked = true;
                                else subLayeronOffBtn.checked = false;
                                // Set value when clicked
                                subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                    event.target.layer.visible = event.target.checked;
                                });
                                subLayerVisibility.appendChild(subLayeronOffBtn);
                                subLayerListItem.appendChild(subLayerVisibility);
                            }
                        }
                    }
                }
                block.appendChild(subLayerList);
                sublayerDialog.appendChild(block);

                // add legend symbol before name
                /*if (!layer.url){
                    var items;
                    if (layer.layers) items = layer.layers.items;
                    else if (layer.sublayers) items = layer.sublayers.items;
                    items.forEach(item => {
                        getLegendInfo(item);
                    });
                }else
                    getLegendInfo(layer);*/
            }catch(err){
                alert("Problem adding layer, "+layer.title+", to LayerList widget in myLayerList.js, layerListAddSublayerDialogs. "+err);
            }
        }
        view.ui.add(sublayerDialog,"top-right");
        
        // set font size for drop down blocks
        const tim = setInterval(function () {
            var blocks = document.querySelectorAll("calcite-block");
            if (!blocks[0]) return;
            if (!blocks[0].shadowRoot) return;
            if (!blocks[0].shadowRoot.children) return;
            if (blocks[0].shadowRoot.children.length < 1) return;
            clearInterval(tim);
            blocks.forEach(block => {
                if (block.shadowRoot.querySelector("h3")){
                    block.shadowRoot.querySelector("h3").style.fontSize = listFontSize;
                    if (block.shadowRoot.querySelector("h3").innerText !== "Visibility:" &&
                        block.shadowRoot.querySelector("h3").innerText !== "Layer Descriptions:")
                        block.shadowRoot.querySelector("h3").style.fontWeight = "normal";
                }
            });
        },500);
    });
}
function addToLayerList(row,element,block, listFontSize,hLevel){
    require(["esri/core/reactiveUtils"],function(reactiveUtils){
        // if it has sublayers dont't make it an expandable block
        // tr td calcite-block
        //  <p (subLayerListItem2)><span (subLayerListHeader2)>layer title</span><calcite-switch (subLayeronOffBtn)></p>
        if (!block && (element.layers || element.sublayers)){
            var subSublayerArr;
            if (element.sublayers) subSublayerArr = element.sublayers;
            else if (element.layers) subSublayerArr = element.layers;
            if (subSublayerArr && subSublayerArr.items) {
                var lastRow = null;
                const item = subSublayerArr.items;
                for (var j=item.length-1; j>-1; j--) {
                    //console.log("--> -->"+item[j].title);

                    // Don't include MVUM Status or Visitor Map Symbology
                    if ((element.title === "Motor Vehicle Use Map" || element.title === "MVUM") &&
                    (item[j].title === "Status" || item[j].title === "Visitor Map Symbology")){
                        item[j].listMode = "hide";
                        item[j].legendEnabled = false;
                    }
                    if (item[j].listMode === "show") {
                        // first tr is passed in
                        if (!row){
                            row = document.createElement("tr");
                            if (j != item.length-1)
                                row.style.borderTop = "1px solid #efefef";
                        }
                        // is it expandable block?
                        if (hideGroupSublayers.indexOf(item[j].title) == -1 && (item[j].layers || item[j].sublayers)){
                            addBlock(row,item[j],listFontSize,hLevel);
                            if (lastRow)
                                lastRow.after(row);
                            lastRow = row;
                            row = null;
                            continue;
                        }
                        row.style.fontSize=listFontSize;
                        row.style.margin="0";
                        let subLayerListHeader = document.createElement("td");
                        subLayerListHeader.style.fontSize=listFontSize;
                        // gray out if not at scale
                        if (item[j].minScale != 0 || item[j].maxScale != 0){
                            if((view.scale <= item[j].minScale || item[j].minScale == 0) && 
                                (view.scale >= item[j].maxScale || item[j].maxScale==0)){
                                subLayerListHeader.style.opacity="1";
                            }else {
                                subLayerListHeader.style.opacity="0.3";
                            }
                            // event listener for scale change
                            const theElement = item[j];
                            reactiveUtils.watch(
                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                    if (stationary) {
                                        if((scale <= theElement.minScale || theElement.minScale == 0) && 
                                            (scale >= theElement.maxScale || theElement.maxScale==0)){
                                            subLayerListHeader.style.opacity="1";
                                        }else {
                                            subLayerListHeader.style.opacity="0.3";
                                        }
                                    }
                                });
                        }
                        subLayerListHeader.style.fontWeight = "normal";
                        subLayerListHeader.style.margin = "0";
                        subLayerListHeader.innerHTML = item[j].title; // title displayed
                        //subLayerListHeader.slot = "content";
                        row.appendChild(subLayerListHeader);
                        //subLayerList.appendChild(row);
                        
                        // add status icon
                        const iconDiv = document.createElement("td");
                        if(item[j].type != "group"){
                            const icon = document.createElement("calcite-icon");
                            icon.id = "statusIcon";
                            var testLayer = item[j];
                            if (item[j].type === "sublayer") testLayer = item[j].parent;
                            if (testLayer.type === "sublayer") testLayer = item[j].parent.parent;
                            if (testLayer.loaded){
                                icon.icon = "";
                            }else {
                                icon.icon = "offline";
                                icon.className = "waitingForConnection";
                                icon.label = "loading...";
                                icon.title = "loading...";
                                icon.style.marginRight = "5px";
                            
                                console.log (item[j].title+" "+item[j].type);
                                if(testLayer.on !== undefined) {
                                    testLayer.on("layerview-create", function(event){
                                        icon.icon = "";
                                        icon.label = "";
                                        icon.title = "";
                                        icon.className = "";
                                    });
                                }else {
                                    alert("Failed to test if layer loaded: "+item[j].title);
                                }
                            }
                            iconDiv.appendChild(icon);
                        }
                        row.appendChild(iconDiv);
                    
                        // Add Switch to actions-end of list Item
                        let subLayerVisibility = document.createElement("td");
                        subLayerVisibility.style.float = "right";
                        let subLayeronOffBtn = document.createElement("calcite-switch");
                        subLayeronOffBtn.slot = "actions-end";
                        subLayeronOffBtn.layer = item[j];
                        subLayeronOffBtn.style.paddingRight = "4px";
                        subLayeronOffBtn.setAttribute("scale", "l"); // large
                        if (item[j].visible) subLayeronOffBtn.checked = true;
                        else subLayeronOffBtn.checked = false;
                        // Set value when clicked
                        subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                            event.target.layer.visible = event.target.checked;
                        });
                        subLayerVisibility.appendChild(subLayeronOffBtn);
                        row.appendChild(subLayerVisibility);
                        // first row was appended to the table before this routine was called
                        if (lastRow)
                            lastRow.after(row);
                        lastRow = row;
                        row = null;
                    }
                }
            }
        }             
        else if (hideGroupSublayers.indexOf(element.title) == -1 && (element.layers || element.sublayers)){
            addBlock(row,element,listFontSize,hLevel);
        }


                            // 1st level list item
                            // <tr (row)><td (subLayerListHeader)>layer title</td><td (subLayerVisibility)><calcite-switch (subLayerVisibility)></td></tr>
                            else {  
                                //subLayerListItem = document.createElement("tr");
                                //if (i != element.length-1)
                                //    subLayerListItem.style.borderTop = "1px solid #efefef";
                                row.style.fontSize=listFontSize;
                                row.style.margin="0";
                                let subLayerListHeader = document.createElement("td");
                                subLayerListHeader.style.fontSize=listFontSize;
                                // gray out if not at scale
                                if (element.minScale != 0 || element.maxScale != 0){
                                    if((view.scale <= element.minScale || element.minScale == 0) && 
                                        (view.scale >= element.maxScale || element.maxScale==0)){
                                        subLayerListHeader.style.opacity="1";
                                    }else {
                                        subLayerListHeader.style.opacity="0.3";
                                    }
                                    // event listener for scale change
                                    const theElement = element;
                                    reactiveUtils.watch(
                                        () => [view.stationary, view.scale], ([stationary, scale]) => {
                                            if (stationary) {
                                                if((scale <= theElement.minScale || theElement.minScale == 0) && 
                                                    (scale >= theElement.maxScale || theElement.maxScale==0)){
                                                    subLayerListHeader.style.opacity="1";
                                                }else {
                                                    subLayerListHeader.style.opacity="0.3";
                                                }
                                            }
                                        });
                                }
                                subLayerListHeader.style.fontWeight = "normal";
                                subLayerListHeader.style.margin = "0";
                                subLayerListHeader.innerHTML = element.title; // title displayed
                                //subLayerListHeader.slot = "content";
                                row.appendChild(subLayerListHeader);
                                //subLayerList.appendChild(subLayerListItem);
                                
                                // add status icon
                                const iconDiv = document.createElement("td");
                                if(element.type != "group"){
                                    const icon = document.createElement("calcite-icon");
                                    icon.id = "statusIcon";
                                    var testLayer = element;
                                    if (element.type === "sublayer") testLayer = element.parent;
                                    if (testLayer.type === "sublayer") testLayer = element.parent.parent;
                                    if (testLayer.loaded){
                                        icon.icon = "";
                                    }else {
                                        icon.icon = "offline";
                                        icon.className = "waitingForConnection";
                                        icon.label = "loading...";
                                        icon.title = "loading...";
                                        icon.style.marginRight = "5px";
                                    
                                        console.log (element.title+" "+element.type);
                                        if(testLayer.on !== undefined) {
                                            testLayer.on("layerview-create", function(event){
                                                icon.icon = "";
                                                icon.label = "";
                                                icon.title = "";
                                                icon.className = "";
                                            });
                                        }else {
                                            alert("Failed to test if layer loaded: "+element.title);
                                        }
                                    }
                                    iconDiv.appendChild(icon);
                                }
                                row.appendChild(iconDiv);
                                            






                                // Add Switch to actions-end of list Item
                                let subLayerVisibility = document.createElement("td");
                                subLayerVisibility.style.float = "right";
                                let subLayeronOffBtn = document.createElement("calcite-switch");
                                subLayeronOffBtn.slot = "actions-end";
                                subLayeronOffBtn.layer = element;
                                subLayeronOffBtn.style.paddingRight = "4px";
                                subLayeronOffBtn.setAttribute("scale", "l"); // large
                                if (element.visible) subLayeronOffBtn.checked = true;
                                else subLayeronOffBtn.checked = false;
                                // Set value when clicked
                                subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                    event.target.layer.visible = event.target.checked;
                                });
                                subLayerVisibility.appendChild(subLayeronOffBtn);
                                row.appendChild(subLayerVisibility);
                            }
    });
}
function addBlock(row,element,listFontSize,hLevel){
    require(["esri/core/reactiveUtils"],function(reactiveUtils){
        let blockCol = document.createElement("td");
        blockCol.colSpan = "3";
        row.appendChild(blockCol);
        let subLayerGroup = document.createElement("calcite-block");
        subLayerGroup.heading = element.title;
        subLayerGroup.value = element.title;
        subLayerGroup.headingLevel = hLevel;
        subLayerGroup.style.fontWeight = "normal";
        subLayerGroup.style.border = "none";
        subLayerGroup.setAttribute("collapsible", true);
        // if open or opensublayer was set to true in config.xml
        if (openTOCgroups.indexOf(element.title) > -1)
            subLayerGroup.setAttribute("open",true);
        else    
            subLayerGroup.setAttribute("open",false);
        subLayerGroup.style.marginLeft = "-12px";
        blockCol.appendChild(subLayerGroup);

        // if all of it's children are out of scale gray out
        // event listener for scale change
        const theElement = element;
        reactiveUtils.watch(
        () => [view.stationary, view.scale], ([stationary, scale]) => {
            if (stationary) {
                var items;
                if (theElement.layers) items=theElement.layers.items;
                else if (theElement.sublayers) items=theElement.sublayers.items;
                var visibleItems = false; // Are any items in this block visible?
                items.forEach(item => {
                    if((scale <= item.minScale || item.minScale == 0) && 
                        (scale >= item.maxScale || item.maxScale==0)){
                            visibleItems = true;
                    }
                });
                if (visibleItems) subLayerGroup.style.opacity="1";
                else subLayerGroup.style.opacity="0.3";

            }
        });
        // Set the first time, if all of it's children are out of scale gray out
        var items;
        if (element.layers) items=element.layers.items;
        else if (element.sublayers) items=element.sublayers.items;
        var visibleItems = false; // Are any items in this block visible?
        items.forEach(item => {
            if((view.scale <= item.minScale || item.minScale == 0) && 
                (view.scale >= item.maxScale || item.maxScale==0)){
                    visibleItems = true;
            }
        });
        if (visibleItems) subLayerGroup.style.opacity="1";
        else subLayerGroup.style.opacity="0.3";

        
        // Add Switch to actions-end of list Item
        let subLayeronOffBtn = document.createElement("calcite-switch");
        subLayeronOffBtn.slot = "actions-end";
        subLayeronOffBtn.layer = element;
        subLayeronOffBtn.style.paddingRight = "4px";
        subLayeronOffBtn.style.paddingTop = "10px";
        subLayeronOffBtn.setAttribute("scale", "l"); // large
        if (element.visible) subLayeronOffBtn.checked = true;
        else subLayeronOffBtn.checked = false;
        // Set value when clicked
        subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
            event.target.layer.visible = event.target.checked;
            
        });
        subLayerGroup.appendChild(subLayeronOffBtn);


        // 2nd level group layers
        var subSublayerArr;
        if (element.sublayers) subSublayerArr = element.sublayers;
        else if (element.layers) subSublayerArr = element.layers;
        if (subSublayerArr && subSublayerArr.items) {
            const item = subSublayerArr.items;
            for (var j=item.length-1; j>-1; j--) {
                //console.log("--> -->"+item[j].title);

                // Don't include MVUM Status or Visitor Map Symbology
                if ((element.title === "Motor Vehicle Use Map" || element.title === "MVUM") &&
                (item[j].title === "Status" || item[j].title === "Visitor Map Symbology")){
                    item[j].listMode = "hide";
                    item[j].legendEnabled = false;
                }
                if (item[j].listMode === "show") {
                    var subLayerListItem2 = document.createElement("div");
                    subLayerListItem2.style = "display:grid;align-items:stretch;grid-template-columns:auto 24px 48px;grid-gap:5px;";
                    //subLayerListItem2.style.marginTop = "-5px";
                    let subLayerListHeader2 = document.createElement("div");
                    subLayerListHeader2.style.maxWidth = "220px";
                    subLayerListHeader2.style.fontSize=listFontSize;
                    // if out of scale range, gray out.
                    if((view.scale <= item[j].minScale || item[j].minScale == 0) && 
                    (view.scale >= item[j].maxScale || item[j].maxScale==0)){
                        subLayerListHeader2.style.opacity="1";
                    }else {
                        subLayerListHeader2.style.opacity="0.3";
                    }
                    // Event handler for scale change
                    const theItem = item[j];
                    reactiveUtils.watch(
                        () => [view.stationary, view.scale], ([stationary, scale]) => {
                            if (stationary) {
                                if((scale <= theItem.minScale || theItem.minScale == 0) && 
                                (scale >= theItem.maxScale || theItem.maxScale==0)){
                                    subLayerListHeader2.style.opacity="1";
                                }else {
                                    subLayerListHeader2.style.opacity="0.3";
                                }
                            }
                    });
                    // remove "CPWAdminData - " from the title
                    if (item[j].title.indexOf("CPWAdminData - ")>-1)
                        item[j].title = item[j].title.substring(15);
                    subLayerListHeader2.innerHTML = item[j].title; // title displayed
                    subLayerListHeader2.style.fontWeight = "normal";
                    subLayerListHeader2.style.padding = "0 0 0 30px";
                    subLayerListHeader2.style.float = "left";
                    //subLayerListHeader2.slot = "content";
                    subLayerListItem2.label = item[j].title;
                    //subLayerListItem2.heading = item[j].title;
                    subLayerListItem2.appendChild(subLayerListHeader2);

                    // Status has layer loaded?
                    const iconDiv = document.createElement("div");
                    if(item[j].type != "group"){
                        const icon = document.createElement("calcite-icon");
                        icon.id = "statusIcon";
                        var testLayer = item[j];
                        if (item[j].type === "sublayer") testLayer = item[j].parent;
                        if (testLayer.type === "sublayer") testLayer = item[j].parent.parent;
                        if (testLayer.loaded){
                            icon.icon = "";
                        }else {
                            icon.icon = "offline";
                            icon.className = "waitingForConnection";
                            icon.label = "loading...";
                            icon.title = "loading...";
                            icon.style.marginRight = "5px";
                        
                            console.log (item[j].title+" "+item[j].type);
                            // TODO !!!!!!!!!!!!!!!!!!!!!!!! not working for all layers (sublayers)
                            if(testLayer.on !== undefined) {
                                testLayer.on("layerview-create", function(event){
                                    icon.icon = "";
                                    icon.label = "";
                                    icon.title = "";
                                    icon.className = "";
                                });
                            }else {
                                alert("Failed to test if layer loaded: "+item[j].title);
                            }
                        }
                        iconDiv.appendChild(icon);
                    }
                    subLayerListItem2.appendChild(iconDiv);
                    
                    // Add Switch to actions-end of list Item
                    const switchDiv = document.createElement("div");
                    let subLayeronOffBtn = document.createElement("calcite-switch");
                    //subLayeronOffBtn.slot = "actions-end";
                    subLayeronOffBtn.layer = item[j];
                    subLayeronOffBtn.style.float = "right";
                    subLayeronOffBtn.style.paddingLeft = "4px";
                    subLayeronOffBtn.style.marginRight = "-12px";
                    subLayeronOffBtn.setAttribute("scale", "l"); // large
                    if (item[j].visible) subLayeronOffBtn.checked = true;
                    else subLayeronOffBtn.checked = false;
                    // Set value when clicked
                    subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                        event.target.layer.visible = event.target.checked;
                    });
                    switchDiv.appendChild(subLayeronOffBtn);
                    subLayerListItem2.appendChild(switchDiv);
                    subLayerGroup.appendChild(subLayerListItem2)
                }
            }
        }
    });
}

function findGMUIndex() {
    // search Find a place widget sources to find index of GMU source
    for (var i = 0; i < searchWidget.sources.items.length; i++) {
      if (searchWidget.sources.items[i].name.indexOf("GMUs") > -1) {
        return i;
      }
    }
    return -1;
}