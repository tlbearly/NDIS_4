function myLayerList() {
    // Dialog with 3 tabs: Layer List, Basemaps, and Legend
    const tabs = document.createElement("calcite-tabs");
    const mapLayersWidget = document.createElement("calcite-dialog");
    var listFontSize = "1rem";
    try { 
        mapLayersWidget.id = "layerlist";
        mapLayersWidget.heading = "Map Layers";
        mapLayersWidget.label = "Map layers";
        mapLayersWidget.placement = "top-end";
        mapLayersWidget.overlayPositioning = "absolute";
        mapLayersWidget.offsetDistance = "15px";
        //mapLayersWidget.style.borderRadius = "12px!important";
        //mapLayersWidget.style.marginRight = "-10px!important";
        //mapLayersWidget.style.marginTop = "-10px!important";
        mapLayersWidget.style.maxWidth = "350px!important";

        // Tabs
        tabs.style.padding = "10px";
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
    tab1.select = true;
    // LIST of Root Layers
    const list = document.createElement("calcite-list");
    list.id = "customLayerList";
    //list.selectionMode = "single";
    tab1.appendChild(list);

    //const nonLayers = ["Graphics Layer", "World Hillshade", "World Imagery", "USGSTopo", "USA Topo Maps", "USGSImageryTopo","", "World Topo Map", "World Basemap", "World Basemap v2"];

    // Add each root layer to layer list
    for (var i = 0; i < mapLayers.length; i++) {
        const rootlayer = mapLayers[i]; // rootLayers
        const listItem = document.createElement("calcite-list-item");
        try {
            // layers that should not be included in the layer list
            //if (nonLayers.includes(layer.title) ) return;

            // LISTITEM of each Root Layer (click shows popup dialog)
            // Image
            const listImg = document.createElement("img");
            listImg.src = "assets/images/"+rootlayer.title+".jpg";//aerial_topo.png";
            listImg.width = "60";
            listImg.style.borderRadius = "15px";
            listImg.style.padding = "10px 5px";
            listImg.slot = "actions-start";
            listItem.appendChild(listImg);
            // Clickable root layer name
            const listHeader = document.createElement("h3");
            listHeader.style.fontWeight = "normal";
            listHeader.style.fontSize = listFontSize;
            listHeader.style.padding = "20px 5px";
            listHeader.style.margin = "0";
            listHeader.innerHTML = rootlayer.title; // title displayed
            listHeader.id = rootlayer.title.replace(/ /g, "_") + "_listItem";
            listHeader.slot = "actions-start";
            listItem.value = rootlayer.title;
            //listItem.label = rootlayer.title; // duplicates the name
            listItem.style.fontSize = "16px";
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
            listItem.appendChild(listHeader);
        }catch(err){
            alert("Problem creating root layer in layer list. Layer title: "+rootlayer.title+" Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
        }
            
        // Status
        try {
            const listStatus = document.createElement("calcite-icon");
            listStatus.slot = "actions-end";
            listStatus.icon = "offline";
            listStatus.style.marginRight = "5px";
            listStatus.className = "waitingForConnection";
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
        const onOffBtn = document.createElement("calcite-switch");
        onOffBtn.slot = "actions-end";
        onOffBtn.layer = rootlayer;
        onOffBtn.style.paddingRight = "4px";
        onOffBtn.setAttribute("scale", "l"); // large
        if (rootlayer.visible) onOffBtn.checked = true;
        // Set value when clicked
        onOffBtn.addEventListener("calciteSwitchChange", event => {
            event.target.layer.visible = event.target.checked;
            // Set switch on popup dialog Visibility
            if (document.getElementById(event.target.layer.title.replace(/ /g, "_") + "_dialog")){
                document.getElementById(event.target.layer.title.replace(/ /g, "_") + "_dialog").querySelectorAll("calcite-block")[1].querySelector("calcite-switch").checked = event.target.checked;
            }
        });
        listItem.appendChild(onOffBtn);
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
    tab2Content.innerHTML = myCustomBasemaps();
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
    layerListExpand.title = "Map Layers";
    layerListExpand.label = "Map Layers";
    layerListExpand.alignment = "center";
    layerListExpand.appearance = "solid";
    layerListExpand.kind = "neutral";
    layerListExpand.scale = "m";
    layerListExpand.style.marginRight = "0px";
    layerListExpand.style.marginTop = "-10px";
    if (screen.width > 768){
        const layerListLabel = document.createElement("span");
        layerListLabel.innerHTML = "Map Layers";
        layerListLabel.style.fontSize = "16px";
        layerListExpand.appendChild(layerListLabel);
        layerListExpand.style.width = "140px";
    }    
    layerListExpand.addEventListener("click", function (event) {
        document.getElementById("layerlist").open = true;
    });
    view.ui.add(layerListExpand, "top-right");
}

function addToLayerListIfAllLoaded(layer){
    // check that all group sublayers have loaded then add to layer list
    console.log("checking if all sublayers have loaded: "+layer.title);
    var items=null;
    if (layer.layers) items = layer.layers.items;
    else if (layer.sublayers) items = layer.sublayers.items;
    var loaded = true;
    
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
                        if(!items2[j].loaded) {
                            loaded=false;
                            i = items.length;// break out of both loops
                            break;
                        }
                    }
                }
            } else break;
        }
    }
    
    if (loaded) return true;
    else{
        // wait 1/2 a second and try again
        setTimeout(function(myLayer){
            layerListAddSublayerDialogs(null,myLayer);
        },500,layer);
        return false;
    }
}

// Add Sublayer Dialogs once the layer has loaded
function layerListAddSublayerDialogs(event,theLayer){
    require(["esri/core/reactiveUtils"],function(reactiveUtils){
        var listFontSize = "1rem";
        var hLevel = 1;
        var layer;
        var subLayeronOffBtn;
        if (event)
            layer = event.layerView.layer; // rootLayers
        else
            layer = theLayer;

        // Make sure all sublayers have loaded
        if (!addToLayerListIfAllLoaded(layer)) return;

        // Wait for the layer to load, then create sub-layer dialogs
        console.log("creating layer dialog for: "+layer.title);

        // Remove loading status icon
        // search for listItem
        const list = document.getElementById("customLayerList");
        if (list) {
            const listItems = list.children;
            for (var i = 0; i < listItems.length; i++) {
                if (listItems[i].value === layer.title) {
                    // children: picture, title, status, switch
                    listItems[i].children[2].icon = "chevron-right"; //.removeChild(listItems[i].children[2]);
                    listItems[i].children[2].className=""; // remove loading fading
                    break;
                }
            }
        }

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
            if (layer.visibilityMode === "exclusive") {
                // add image to header
                var img = document.createElement("img");
                img.src = "assets/images/home_hunt.jpg";
                img.title = "Game Species map image";
                img.slot = "header-actions-start";
                img.style.height = "3rem";
                img.style.width = "auto";
                img.style.margin = "0";
                sublayerDialog.appendChild(img);
            }
        }catch(err){
            alert("Problem creating sublayer-dialog title in layer list in myLayerList.js/layerListAddSublayerDialogs. For layer title: "+layer.title+". Error: "+err+" Message: "+err.message+" Stack: "+err.stack,"Error");
        }

        // Radio button list
        if (layer.visibilityMode === "exclusive" || radioLayers.indexOf(layer.title)>-1 ) {
            var selectedItem; // default title for radio button sublayer popover
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
            
            /*radioArr.forEach(species => {
                try {
                    const comboItem = document.createElement("calcite-combobox-item");
                    comboItem.heading = species.title;
                    comboItem.value = species.title;
                    comboItem.name = species.title;
                    comboItem.layer = species;
                    if (species.visible) comboItem.selected = true;
                    combo.appendChild(comboItem);
                }catch(err){
                    alert("Problem creating drop down in "+layer.title+" layer list. For species: "+species.title+" In myLayerList.js/layerListAddSublayerDialogs Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
                }
            });
        
            var calledAlready = false;
            combo.addEventListener("calciteComboboxItemChange", function (event) {
                try{
                    // set game species layers to hidden
                    // Fix bug on item change this is called twice, once with correct species then with old species name
                    if (calledAlready) {
                        calledAlready = false;
                        return;
                    }
                    else calledAlready = true;
                    for (var i = 0; i < event.target.parentNode.childNodes.length; i++)
                        event.target.parentNode.childNodes[i].layer.visible = false;
                    event.target.layer.visible = true;
                    event.target.parentElement.parentElement.heading = event.target.value;

                    document.getElementById(selectedItem).style.visibility = "collapse";
                    document.getElementById(event.target.value).style.visibility = "visible";
                    selectedItem = event.target.value;
                    // update description file
                    event.target.parentElement.parentElement.querySelector("iframe").src = "layer-desc/layer-description.pdf";//+selectedItem+".html";
                }catch(err){
                    alert("Problem in Game Species dropdown item change event calciteComboboxItemChange in layer list. In myLayerList.js/layerListAddSublayerDialogs Error: "+err+" Message:"+err.message+" Stack:"+err.stack,"Error");
                }
            });*/
            sublayerDialog.appendChild(combo);

            
            // start test radio buttons **********
            //const accItem0=document.createElement("calcite-combobox-item");
            //accItem0.heading="Game Species";
            //accItem0.value = "Game Species";
            //accItem0.textLabel = "Game Species";
            //accItem0.style.fontSize = listFontSize;
            //combo.open=false;
            //combo.style.margin = "0 60px 20px 20px";
            combo.slot="header-actions-end";
            //combo.appendChild(accItem0);
            
            const radioGroup = document.createElement("calcite-radio-button-group");
            radioGroup.name="radioBtns";
            radioGroup.layout = "vertical";
            radioGroup.style.padding = "10px";
            //accItem0.appendChild(radioGroup);
            combo.appendChild(radioGroup);
            /*radioGroup.addEventListener("calciteRadioButtonGroupChange", (event) => {
                event.target.parentNode.parentNode.placeholder = event.target.selectedItem.label;
                // set game species layers to hidden
                for(var i=0; i<event.target.parentNode.childNodes[0].childNodes.length; i++)
                    event.target.parentNode.childNodes[0].childNodes[i].layer.visible = false;
                event.target.selectedItem.parentNode.layer.visible = true;
                event.target.parentNode.expanded = false;
            });*/
            sublayerDialog.appendChild(combo);
        
            radioArr.forEach(species => {
                const radio = document.createElement("calcite-label");
                radio.layout="inline";
                if (species.visible){
                    radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"' checked></calcite-radio-button> "+species.title;
                    //accItem0.description = species.title;
                    selectedItem = species.title;
                    combo.label = selectedItem;
                    combo.placeholder = selectedItem;
                }
                else
                    radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"'></calcite-radio-button> "+species.title;
                radio.layer = species;
                radio.addEventListener("click",() =>{
                    document.getElementById(selectedItem).style.visibility = "collapse";
                    document.getElementById(species.title).style.visibility = "visible";
                    selectedItem = species.title;
                    radioGroup.parentNode.placeholder = selectedItem;
                    radioGroup.parentNode.open = false;
                });
                radioGroup.appendChild(radio); 
            });

            // end test radio buttons*********************

            // Description
            var block = document.createElement("calcite-block");
            block.heading = "Layer Descriptions:";
            block.headingLevel = hLevel;
            block.setAttribute("collapsible", true);
            // Add print button
            var printBtn = document.createElement("calcite-icon");
            printBtn.icon = "print";
            printBtn.style.padding = "15px 10px";
            printBtn.slot = "actions-end";
            printBtn.scale = "s";
            printBtn.addEventListener("click", function (event) {
                window.open("layer-desc/layer-description.html","_blank");// + selectedItem + ".html", "_blank");
            });
            block.appendChild(printBtn);
            
            // Description
            var notice = document.createElement("calcite-notice");
            notice.open = true;
            notice.style.overflowY = "auto";
            notice.style.height = "auto";
            notice.style.padding="0";
            var iframe1 = document.createElement("iframe");
            iframe1.style.height = "300px"; 
            iframe1.style.width = "100%";
            iframe1.slot="message";
            iframe1.src = "layer-desc/layer-description.html";// + selectedItem + ".html";
            iframe1.setAttribute("frameborder",0);
            //iframe.style.border = "none";
            iframe1.style.margin = "0";
            iframe1.title = "Description of " + selectedItem + " map layer(s)";
            notice.appendChild(iframe1);
            block.appendChild(notice);

            // Description pdf too small!!!
            /*var iframe = document.createElement("iframe");
            iframe.style.height = "300px"; 
            iframe.style.width = "100%";
            iframe.src = "layer-desc/layer-description.pdf";// + selectedItem + ".html";
            iframe.setAttribute("frameborder",0);
            //iframe.style.border = "none";
            iframe.style.margin = "0";
            iframe.title = "Description of " + selectedItem + " map layer(s)";
            block.appendChild(iframe);*/

            sublayerDialog.appendChild(block);

            // Radio List Visiblity
            block = document.createElement("calcite-block");
            block.headingLevel = hLevel;
            block.heading = "Visibility:";
            block.setAttribute("collapsible", false);
            block.setAttribute("open",true);

            // Add Switch to actions-end of list Item
            subLayeronOffBtn = document.createElement("calcite-switch");
            subLayeronOffBtn.slot = "actions-end";
            subLayeronOffBtn.layer = layer;
            subLayeronOffBtn.style.padding = "10px 10px 0 10px";
            subLayeronOffBtn.setAttribute("scale", "l"); // large
            if (layer.visible) subLayeronOffBtn.checked = true;
            else subLayeronOffBtn.checked = false;
            // Set value when clicked
            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                event.target.layer.visible = event.target.checked;
                // Set switch on parent dialog Visibility
                if (document.getElementById("layerlist")){
                    var switches = document.getElementById("layerlist").querySelectorAll("calcite-list-item");
                    switches.forEach(mySwitch => {
                        if (mySwitch.querySelector("h3").innerHTML === event.target.layer.title){
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
                    var subLayerList = document.createElement("calcite-list");
                    subLayerList.id = element.title;
                    if (element.title === selectedItem) subLayerList.style.visibility = "visible";
                    else subLayerList.style.visibility = "collapse";
                    //subLayerList.style.marginTop = "2px";
                    var speciesSubArr;
                    if (element.sublayers) speciesSubArr = element.sublayers;
                    else if (element.layers) speciesSubArr = element.layers;
                    if (speciesSubArr && speciesSubArr.items) {
                        speciesSubArr.items.forEach(item => {
                            subLayerListItem = document.createElement("calcite-list-item");
                            subLayerListHeader = document.createElement("h3");
                            subLayerListItem.style.fontSize=listFontSize;
                            // Event handler for scale change
                            reactiveUtils.watch(
                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                    if (stationary) {
                                        if((scale <= item.minScale || item.minScale == 0) && 
                                        (scale >= item.maxScale || item.maxScale==0)){
                                            subLayerListHeader.style.color="#4a4a4a";
                                            subLayerListHeader.style.fontWeight="500";
                                            //console.log(item.title+" visible");
                                        }else {
                                            //console.log(item.title+" hidden");
                                            subLayerListHeader.style.color="lightgray";
                                            subLayerListHeader.style.fontWeight="100";
                                        }
                                    }
                            });
                            subLayerListHeader.style.fontWeight = "normal";
                            subLayerListHeader.style.fontSize = listFontSize;
                            subLayerListHeader.style.margin = "0";
                            subLayerListHeader.innerHTML = item.title.replace("CPWSpeciesData -",""); // title displayed
                            subLayerListHeader.slot = "content";
                            subLayerListItem.value = item.title.replace("CPWSpeciesData -","");
                            subLayerListItem.heading = item.title.replace("CPWSpeciesData -","");
                            subLayerListItem.appendChild(subLayerListHeader);

                            // Add Switch to actions-end of list Item
                            subLayeronOffBtn = document.createElement("calcite-switch");
                            subLayeronOffBtn.slot = "actions-end";
                            subLayeronOffBtn.layer = item;
                            subLayeronOffBtn.style.paddingTop = "10px";
                            subLayeronOffBtn.setAttribute("scale", "l"); // large
                            if (item.visible) subLayeronOffBtn.checked = true;
                            // Set value when clicked
                            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                event.target.layer.visible = event.target.checked;
                            });
                            subLayerListItem.appendChild(subLayeronOffBtn);
                            subLayerList.appendChild(subLayerListItem);
                        });
                    }
                    block.appendChild(subLayerList);
                });
                sublayerDialog.appendChild(block);
            }
        }

        // Not radio buttons
        else {
            try{
                // Description
                var block = document.createElement("calcite-block");
                block.heading = "Layer Descriptions:";
                block.headingLevel = hLevel;
                block.setAttribute("collapsible", true);
                //block.iconEnd = "print";

                var notice = document.createElement("calcite-notice");
                notice.open = true;
                //notice.style.overflowY = "auto";
                //notice.style.height = "auto";
                //notice.style.maxHeight = "300px";
                notice.description = layer.title;
                block.appendChild(notice);
                // Add print button
                var printBtn = document.createElement("calcite-icon");
                printBtn.icon = "print";
                printBtn.style.padding = "15px 10px";
                printBtn.slot = "actions-end";
                printBtn.scale = "s";
                printBtn.addEventListener("click", function (event) {
                    window.open("layer-desc/layer-description.pdf","_blank");// + layer.title + ".html", "_blank");
                });
                block.appendChild(printBtn);

                // html description
                var notice = document.createElement("calcite-notice");
                notice.open = true;
                notice.style.overflowY = "auto";
                notice.style.height = "auto";
                notice.style.padding="0";
                var iframe1 = document.createElement("iframe");
                iframe1.style.height = "300px"; 
                iframe1.style.width = "100%";
                iframe1.slot="message";
                iframe1.src = "layer-desc/layer-description.html";// + selectedItem + ".html";
                iframe1.setAttribute("frameborder",0);
                //iframe.style.border = "none";
                iframe1.style.margin = "0";
                iframe1.title = "Description of " + selectedItem + " map layer(s)";
                notice.appendChild(iframe1);
                block.appendChild(notice);

                // add pdf description file in an iframe
            /* var iframe = document.createElement("iframe");
                iframe.slot = "message";
                iframe.src = "layer-desc/layer-description.pdf"; //" + layer.title + ".html";
                //iframe.style.border = "none";
                iframe.style.height = "300px"; 
                iframe.style.width = "100%";
                iframe.setAttribute("frameborder",0);
                iframe.style.margin = "-12px";
                iframe.title = "Description of " + layer.title + " map layer(s)";
                notice.appendChild(iframe);*/

                sublayerDialog.appendChild(block);


                // Visible List
                block = document.createElement("calcite-block");
                block.heading = "Visibility:";
                block.headingLevel = hLevel;
                block.setAttribute("collapsible", false);
                block.setAttribute("open",true);

                // Add Switch to actions-end of list Item
                subLayeronOffBtn = document.createElement("calcite-switch");
                subLayeronOffBtn.slot = "actions-end";
                subLayeronOffBtn.layer = layer;
                subLayeronOffBtn.style.padding = "10px 10px 0 4px";
                subLayeronOffBtn.setAttribute("scale", "l"); // large
                if (layer.visible) subLayeronOffBtn.checked = true;
                else subLayeronOffBtn.checked = false;
                // Set value when clicked
                subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                    event.target.layer.visible = event.target.checked;
                    // Set switch on parent dialog Visibility
                    if (document.getElementById("layerlist")){
                        var switches = document.getElementById("layerlist").querySelectorAll("calcite-list-item");
                        switches.forEach(mySwitch => {
                            if (mySwitch.querySelector("h3").innerHTML === event.target.layer.title){
                                mySwitch.querySelector("calcite-switch").checked = event.target.checked;
                            }
                        });
                    }
                });
                block.appendChild(subLayeronOffBtn);

                var subLayerList = document.createElement("calcite-list");
                //subLayerList.style.overflowY = "auto";
                //subLayerList.style.height = "auto";
                //subLayerList.style.maxHeight = "300px";
                var subLayerListItem;
                // Visibility list in sublayer popup
                // MapImageLayers have sublayers. FeatureLayers have layers
                var sublayerArr;
                if (layer.sublayers) sublayerArr = layer.sublayers;
                else if (layer.layers) sublayerArr = layer.layers;       
                if (sublayerArr && sublayerArr.items) {
                    sublayerArr.items.forEach(element => {
                        //console.log("-->"+element.title);
                        if (element.listMode === "show") {
                            // 1st level group layer
                            // if it has sublayers make it an expandable block
                            if (element.layers || element.sublayers){
                                let subLayerGroup = document.createElement("calcite-block");
                                subLayerGroup.heading = element.title;
                                subLayerGroup.value = element.title;
                                subLayerGroup.headingLevel = hLevel;

                                // if all of it's children are out of scale gray out
                                // event listener for scale change
                                reactiveUtils.watch(
                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                    if (stationary) {
                                        var items;
                                        if (element.layers) items=element.layers.items;
                                        else if (element.sublayers) items=element.sublayers.items;
                                        var visibleItems = false; // Are any items in this block visible?
                                        items.forEach(item => {
                                            if((scale <= item.minScale || item.minScale == 0) && 
                                                (scale >= item.maxScale || item.maxScale==0)){
                                                    visibleItems = true;
                                                //console.log(item.title+" visible");
                                            }
                                        });
                                        if (visibleItems) subLayerGroup.style.opacity="1";
                                        else subLayerGroup.style.opacity="0.3";

                                    }
                                });
                                subLayerGroup.style.opacity="1";
                                subLayerGroup.setAttribute("collapsible", true);

                                subLayerGroup.setAttribute("open",false);
                                subLayerList.appendChild(subLayerGroup);
                                // Add Switch to actions-end of list Item
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
                                subLayerGroup.appendChild(subLayeronOffBtn);
                                // 2nd level group layers
                                var subSublayerArr;
                                if (element.sublayers) subSublayerArr = element.sublayers;
                                else if (element.layers) subSublayerArr = element.layers;
                                if (subSublayerArr && subSublayerArr.items) {
                                    subSublayerArr.items.forEach(item => {
                                        //console.log("--> -->"+item.title);
                                        if (item.listMode === "show") {
                                            var subLayerListItem2 = document.createElement("calcite-list-item");
                                            let subLayerListHeader2 = document.createElement("h3");
                                            subLayerListHeader2.style.fontSize=listFontSize;
                                            if((view.scale <= item.minScale || item.minScale == 0) && 
                                            (view.scale >= item.maxScale || item.maxScale==0)){
                                                //subLayerListHeader2.style.color="#4a4a4a";
                                                //subLayerListHeader2.style.fontWeight="500";
                                                subLayerListHeader2.style.opacity="1";
                                                console.log(item.title+' visible');
                                            }else {
                                                //subLayerListHeader2.style.color="lightgray";
                                                //subLayerListHeader2.style.fontWeight="100";
                                                subLayerListHeader2.style.opacity="0.3";
                                                console.log(item.title+' hidden');
                                            }
                                            // Event handler for scale change
                                            reactiveUtils.watch(
                                                () => [view.stationary, view.scale], ([stationary, scale]) => {
                                                    if (stationary) {
                                                        if((scale <= item.minScale || item.minScale == 0) && 
                                                        (scale >= item.maxScale || item.maxScale==0)){
                                                            subLayerListHeader2.style.opacity="1";
                                                            //console.log(item.title+' visible');
                                                        }else {
                                                            subLayerListHeader2.style.opacity="0.3";
                                                            //console.log(item.title+' hidden');
                                                        }
                                                    }
                                            });
                                            
                                            subLayerListHeader2.innerHTML = item.title; // title displayed
                                            subLayerListHeader2.style.fontWeight = "normal";
                                            subLayerListHeader2.style.margin = "0 0 0 40px";
                                            subLayerListHeader2.slot = "content";
                                            subLayerListItem2.value = item.title;
                                            subLayerListItem2.heading = item.title;
                                            subLayerListItem2.appendChild(subLayerListHeader2);

                                            // Add Switch to actions-end of list Item
                                            let subLayeronOffBtn = document.createElement("calcite-switch");
                                            subLayeronOffBtn.slot = "actions-end";
                                            subLayeronOffBtn.layer = item;
                                            subLayeronOffBtn.style.paddingRight = "4px";
                                            subLayeronOffBtn.style.paddingTop = "5px";
                                            subLayeronOffBtn.setAttribute("scale", "l"); // large
                                            if (item.visible) subLayeronOffBtn.checked = true;
                                            else subLayeronOffBtn.checked = false;
                                            // Set value when clicked
                                            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                                event.target.layer.visible = event.target.checked;
                                            });
                                            subLayerListItem2.appendChild(subLayeronOffBtn);
                                            subLayerGroup.appendChild(subLayerListItem2); // Append to the calcite-block
                                            
                                        }
                                    });
                                }
                            }
                            // 1st level list item
                            else {  
                                subLayerListItem = document.createElement("calcite-list-item");
                                subLayerListItem.style.fontSize=listFontSize;
                                subLayerListItem.style.margin="0";
                                let subLayerListHeader = document.createElement("h3");
                                subLayerListHeader.style.fontSize=listFontSize;
                                // gray out if not at scale
                                if (element.minScale != 0 || element.maxScale != 0){
                                    if((view.scale <= element.minScale || element.minScale == 0) && 
                                        (view.scale >= element.maxScale || element.maxScale==0)){
                                        console.log(element.title+" visible");
                                        subLayerListHeader.style.opacity="1";
                                    }else {
                                        console.log(element.title+" hidden");
                                        subLayerListHeader.style.opacity="0.3";
                                    }
                                    // event listener for scale change
                                    reactiveUtils.watch(
                                        () => [view.stationary, view.scale], ([stationary, scale]) => {
                                            if (stationary) {
                                                if((scale <= element.minScale || element.minScale == 0) && 
                                                    (scale >= element.maxScale || element.maxScale==0)){
                                                    //console.log(element.title+" visible");
                                                    subLayerListHeader.style.opacity="1";
                                                }else {
                                                    //console.log(element.title+" hidden");
                                                    subLayerListHeader.style.opacity="0.3";
                                                }
                                            }
                                        });
                                }
                                subLayerListHeader.style.fontWeight = "normal";
                                subLayerListHeader.style.margin = "0";
                                subLayerListHeader.innerHTML = element.title; // title displayed
                                subLayerListHeader.slot = "content";
                                subLayerListItem.appendChild(subLayerListHeader);
                                subLayerList.appendChild(subLayerListItem);
                            
                                // Add Switch to actions-end of list Item
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
                                subLayerListItem.appendChild(subLayeronOffBtn);
                            }

                            
                        }
                    });
                }
                block.appendChild(subLayerList);
                sublayerDialog.appendChild(block);
            }catch(err){
                alert("Problem adding layer, "+layer.title+" to layer list  in myLayerList.js/layerListAddSublayerDialogs."+err);
            }
        }
        view.ui.add(sublayerDialog,"top-right");
    });
}