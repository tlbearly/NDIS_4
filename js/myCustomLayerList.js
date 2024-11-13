function myCustomLayerList(){
    //constructor(){
        var gameSpecies = "Elk"; // title for game species sublayer popover
        // TOC parent layers list
        //const mapLayersWidget = document.createElement("calcite-popover");
        //mapLayersWidget.setAttribute("reference-element", "layerListExpand");
        //mapLayersWidget.closable=true;
        
        const mapLayersWidget = document.createElement("calcite-dialog");
        mapLayersWidget.id = "layerlist";
        mapLayersWidget.heading = "Map Layers";
        mapLayersWidget.label = "Map layers";
        
        mapLayersWidget.placement = "top-end";
        mapLayersWidget.overlayPositioning="absolute";
        mapLayersWidget.offsetDistance="15px";
        mapLayersWidget.style.borderRadius = "12px!important";
        mapLayersWidget.style.maxWidth = "350px!important";

        //mapLayersWidget.className = "esri-layer-list esri-widget esri-widget--panel";
        
        // tabs
        const tabs = document.createElement("calcite-tabs");
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
        
        //----------------
        // Layer List Tab
        //----------------
        const tab1 = document.createElement("calcite-tab");
        tab1.select = true;
        // LIST of Root Layers
        const list = document.createElement("calcite-list");
        //list.selectionMode = "single";
        tab1.appendChild(list);

        //const nonLayers = ["Graphics Layer", "World Hillshade", "World Imagery", "USGSTopo", "USA Topo Maps", "USGSImageryTopo","", "World Topo Map", "World Basemap", "World Basemap v2"];
        for (var i=0; i<mapLayers.length;i++){
            const layer = mapLayers[i]; // rootLayers
            
            // layers that should not be included in the layer list
            //if (nonLayers.includes(layer.title) ) return;

            // LISTITEM of each Root Layer (click shows popup dialog)
            const listItem = document.createElement("calcite-list-item");
            const listHeader = document.createElement("h3");
            listHeader.style.fontWeight = "normal";
            listHeader.innerHTML = layer.title; // title displayed
            listHeader.id = layer.title.replace(/ /g,"_") +"_listItem";
            listHeader.slot = "actions-start";
            listItem.value = layer.title;
            listItem.heading = layer.title;
            // for calcite-dialog
            listHeader.addEventListener("click",() => {
                document.getElementById(layer.title.replace(/ /g,"_") +"_dialog").open=true;
            });
            listItem.appendChild(listHeader);
            const listStatus = document.createElement("calcite-icon");
            listStatus.slot = "actions-end";
            listStatus.icon = "offline";
            listStatus.style.marginRight = "5px";
            listStatus.className = "waitingForConnection";
            listItem.appendChild(listStatus);

            // POPUP DIALOG for each Root Layer
            //var sublayerDialog = document.createElement("calcite-popover");
            //sublayerDialog.setAttribute("closable",true);

            var sublayerDialog = document.createElement("calcite-dialog");
            sublayerDialog.setAttribute("modal",false);

            sublayerDialog.setAttribute("open",false);
            sublayerDialog.setAttribute("heading-level",3);
            sublayerDialog.overlayPositioning="fixed";
            sublayerDialog.offsetDistance="10px";

            // for dialog
            sublayerDialog.setAttribute("modal",false);
            sublayerDialog.id=layer.title.replace(/ /g,"_") +"_dialog";
            sublayerDialog.setAttribute("width-scale","s");
            // for popover
            //sublayerDialog.setAttribute("reference-element", layer.title.replace(/ /g,"_") +"_listItem");
            
            sublayerDialog.setAttribute("placement","top-end");

            if (layer.title === "Game Species"){
                //sublayerDialog.heading = "Game Species";
                sublayerDialog.label = layer.title;
                // add image to header
                var img = document.createElement("img");
                img.src="assets/images/home_hunt.jpg";
                img.title = "Game Species map image";
                img.slot = "header-actions-start";
                img.style.height = "3rem";
                img.style.width = "auto";
                sublayerDialog.appendChild(img);
            }else {
                sublayerDialog.heading = layer.title;
                sublayerDialog.label = layer.title;
            }
            

            
            // Description
            var block=document.createElement("calcite-block");
            block.heading="Description:";
            block.description="The "+layer.title+" layer description goes here... blah blah blah...";
            block.setAttribute("collapsible",true);
            var item1Notice=document.createElement("calcite-notice");
            item1Notice.open=true;
            item1Notice.style.overflowY = "auto";
            item1Notice.style.height = "auto"; 
            item1Notice.style.maxHeight = "300px";
            block.appendChild(item1Notice);
            var item1Div=document.createElement("div");
            item1Div.slot="message";
            item1Div.innerHTML = "more descritpion stuff here...";
            item1Notice.appendChild(item1Div);
            sublayerDialog.appendChild(block);
                
            // Game Species list
            if (layer.title === "Game Species"){
                // Add dropdown with Radio Buttons
                sublayerDialog.heading = gameSpecies;
                const combo=document.createElement("calcite-combobox");
                combo.selectionMode = "single";
                combo.slot="header-actions-end";
                //combo.name="Game Species";
                combo.label="Select game species";
                combo.placeholder = gameSpecies;
                combo.selectionDisplay = "single";
                combo.clearDisabled = true;
                layer.sublayers.items.forEach(species => {
                    const comboItem = document.createElement("calcite-combobox-item");
                    comboItem.heading = species.title;
                    comboItem.value = species.title;
                    comboItem.name = species.title;
                    comboItem.layer = species;
                    if (species.visible) comboItem.selected = true;
                    combo.appendChild(comboItem);
                });
                combo.addEventListener("calciteComboboxItemChange",function(event){
                    // set game species layers to hidden
                    for(var i=0; i<event.target.parentNode.childNodes.length; i++)
                        event.target.layer.visible = false;
                    event.target.placeholder = event.target.value;
                    event.target.parentElement.parentElement.heading = event.target.value;
                    event.target.layer.visible = true;
                    

                    document.getElementById(gameSpecies).style.visibility = "collapse";
                    document.getElementById(event.target.value).style.visibility = "visible";
                    gameSpecies = event.target.value;
                });
                sublayerDialog.appendChild(combo);

                /*const accItem0=document.createElement("calcite-combobox-item");
                //accItem0.heading="Game Species";
                accItem0.value = "Game Species";
                accItem0.textLabel = "Game Species";
                accItem0.style.fontSize = "1.17em";
                //combo.open=false;
                //combo.style.margin = "0 60px 20px 20px";
                combo.slot="header-actions-start";
                combo.appendChild(accItem0);
                
                const radioGroup = document.createElement("calcite-radio-button-group");
                radioGroup.name="radioBtns";
                radioGroup.layout = "vertical";
                radioGroup.style.padding = "10px";
                accItem0.appendChild(radioGroup);
                radioGroup.addEventListener("calciteRadioButtonGroupChange", (event) => {
                    event.target.parentNode.parentNode.placeholder = event.target.selectedItem.label;
                    // set game species layers to hidden
                    for(var i=0; i<event.target.parentNode.childNodes[0].childNodes.length; i++)
                        event.target.parentNode.childNodes[0].childNodes[i].layer.visible = false;
                    event.target.selectedItem.parentNode.layer.visible = true;
                    event.target.parentNode.expanded = false;
                });
                sublayerDialog.appendChild(combo);
            
                
                layer.sublayers.items.forEach(species => {
                    const radio = document.createElement("calcite-label");
                    radio.layout="inline";
                    if (species.visible){
                        radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"' checked></calcite-radio-button> "+species.title;
                        accItem0.description = species.title;
                        gameSpecies = species.title;
                    }
                    else
                        radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"'></calcite-radio-button> "+species.title;
                    radio.layer = species;
                    radio.addEventListener("click",() =>{
                        document.getElementById(gameSpecies).style.visibility = "collapse";
                        document.getElementById(species.title).style.visibility = "visible";
                        gameSpecies = species.title;
                    });
                    radioGroup.appendChild(radio); 
                });*/

                // Game Species List
                var subLayerListItem, subLayerListHeader, subLayeronOffBtn;
                // Visibility list in sublayer popup
                if (layer.sublayers){
                    layer.sublayers.items.forEach(element => {
                        // Visible List
                        var subLayerList = document.createElement("calcite-list");
                        subLayerList.style.overflowY = "auto";
                        subLayerList.style.height = "auto";
                        subLayerList.style.maxHeight = "300px";
                        subLayerList.id = element.title;
                        if (element.title === gameSpecies) subLayerList.style.visibility = "visible";
                        else subLayerList.style.visibility = "collapse";
                        //subLayerList.style.marginTop = "2px";
                        if (element.sublayers && element.sublayers.items){
                            element.sublayers.items.forEach(item => {
                                subLayerListItem = document.createElement("calcite-list-item");
                                subLayerListHeader = document.createElement("h3");
                                subLayerListHeader.style.padding = "0 15px";
                                subLayerListHeader.style.fontWeight = "normal";
                                subLayerListHeader.innerHTML = item.title; // title displayed
                                subLayerListHeader.slot = "actions-start";
                                subLayerListItem.value = item.title;
                                subLayerListItem.heading = item.title;
                                subLayerListItem.appendChild(subLayerListHeader);

                                // Add Switch to actions-end of list Item
                                subLayeronOffBtn = document.createElement("calcite-switch");
                                subLayeronOffBtn.slot = "actions-end";
                                subLayeronOffBtn.layer = item;
                                subLayeronOffBtn.style.paddingRight = "4px";
                                subLayeronOffBtn.setAttribute("scale","l"); // large
                                if (item.visible) subLayeronOffBtn.checked = true;
                                // Set value when clicked
                                subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                    event.target.layer.visible = event.target.checked;
                                });
                                subLayerListItem.appendChild(subLayeronOffBtn);
                                subLayerList.appendChild(subLayerListItem);
                            
                            });
                        }
                        sublayerDialog.appendChild(subLayerList);
                    });
                }
            }

            // Not radio buttons (Game Species)
            else{
                // Visible List
                var subLayerList = document.createElement("calcite-list");
                subLayerList.style.overflowY = "auto";
                subLayerList.style.height = "auto";
                subLayerList.style.maxHeight = "300px";
                var subLayerListItem, subLayerListHeader, subLayeronOffBtn;
                // Visibility list in sublayer popup
                // MapImageLayers have sublayers. FeatureLayers have indexs             
                if (layer.sublayers){
                    layer.sublayers.items.forEach(element => {
//console.log("-->"+element.title);
                        if (element.listMode === "show"){
                            // 1st level group layer
                            subLayerListItem = document.createElement("calcite-list-item");
                            subLayerListHeader = document.createElement("h3");
                            subLayerListHeader.style.padding = "0 15px";
                            subLayerListHeader.style.fontWeight = "normal";
                            subLayerListHeader.innerHTML = element.title; // title displayed
                            subLayerListHeader.slot = "actions-start";
                            subLayerListItem.value = element.title;
                            subLayerListItem.heading = element.title;
                            
                            subLayerListItem.appendChild(subLayerListHeader);
                            subLayerList.appendChild(subLayerListItem);
                            // Add Switch to actions-end of list Item
                            subLayeronOffBtn = document.createElement("calcite-switch");
                            subLayeronOffBtn.slot = "actions-end";
                            subLayeronOffBtn.layer = element;
                            subLayeronOffBtn.style.paddingRight = "4px";
                            subLayeronOffBtn.setAttribute("scale","l"); // large
                            if (element.layer.visible) subLayeronOffBtn.checked = true;
                            // Set value when clicked
                            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                event.target.layer.visible = event.target.checked;
                            });
                            subLayerListItem.appendChild(subLayeronOffBtn);
                            
                            // 2nd level group layers
                            if (element.sublayers && element.sublayers.items){
                                element.sublayers.items.forEach(item => {
    //console.log("--> -->"+item.title);
                                    subLayerListItem = document.createElement("calcite-list-item");
                                    subLayerListHeader = document.createElement("h3");
                                    subLayerListHeader.style.padding = "0 15px";
                                    subLayerListHeader.style.fontWeight = "normal";
                                    subLayerListHeader.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp"+item.title; // title displayed
                                    subLayerListHeader.slot = "actions-start";
                                    subLayerListItem.value = item.title;
                                    subLayerListItem.heading = item.title;
                                    subLayerListItem.appendChild(subLayerListHeader);

                                    // Add Switch to actions-end of list Item
                                    subLayeronOffBtn = document.createElement("calcite-switch");
                                    subLayeronOffBtn.slot = "actions-end";
                                    subLayeronOffBtn.layer = item;
                                    subLayeronOffBtn.style.paddingRight = "4px";
                                    subLayeronOffBtn.setAttribute("scale","l"); // large
                                    if (item.layer.visible) subLayeronOffBtn.checked = true;
                                    // Set value when clicked
                                    subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                        event.target.layer.visible = event.target.checked;
                                    });
                                    subLayerListItem.appendChild(subLayeronOffBtn);
                                    subLayerList.appendChild(subLayerListItem);
                                });
                            }
                        }
                        /*else {
                            subLayerListItem = document.createElement("calcite-list-item");
                            subLayerListHeader = document.createElement("h3");
                            subLayerListHeader.style.padding = "0 15px";
                            subLayerListHeader.style.fontWeight = "normal";
                            subLayerListHeader.innerHTML = element.title; // title displayed
                            //subLayerListHeader.slot = "actions-start";
                            subLayerListItem.value = element.title;
                            subLayerListItem.heading = element.title;
                            subLayerListItem.appendChild(subLayerListHeader);

                            // Add Switch to actions-end of list Item
                            subLayeronOffBtn = document.createElement("calcite-switch");
                            subLayeronOffBtn.slot = "actions-end";
                            subLayeronOffBtn.layer = element;
                            subLayeronOffBtn.style.paddingRight = "4px";
                            subLayeronOffBtn.setAttribute("scale","l"); // large
                            if (element.layer.visible) subLayeronOffBtn.checked = true;
                            // Set value when clicked
                            subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                                event.target.layer.visible = event.target.checked;
                            });
                            subLayerListItem.appendChild(subLayeronOffBtn);
                            subLayerList.appendChild(subLayerListItem);
                        }*/
                    });
                }
                sublayerDialog.appendChild(subLayerList);
            } // not radio layer
            
            document.getElementById("viewDiv").appendChild(sublayerDialog);
            //view.ui.add(sublayerDialog); // Does not work!!!!! makes dialogs the entire screen size and prohibits click events!!!!!!

            // Add Switch to actions-end of list Item
            const onOffBtn = document.createElement("calcite-switch");
            onOffBtn.slot = "actions-end";
            onOffBtn.layer = layer;
            onOffBtn.style.paddingRight = "4px";
            onOffBtn.setAttribute("scale","l"); // large
            if (layer.visible) onOffBtn.checked = true;
            // Set value when clicked
            onOffBtn.addEventListener("calciteSwitchChange", event => {
                event.target.layer.visible = event.target.checked;
            });
            listItem.appendChild(onOffBtn);
            list.appendChild(listItem);

            // ADD STATUS LOADING
            view.whenLayerView(layer)
            .then(function(layerView) {
                // The layerview for the layer
                console.log(layerView.layer.title+" loaded");
                listItem.removeChild(listStatus);
            })
            .catch(function(error) {
                // An error occurred during the layerview creation
                var layer = error.details.layer;
                console.log(layer.title+" failed to load");
                
                // flash status icon
                listItem.removeChild(listStatus);
                setTimeout(function(){
                    listItem.insertBefore(listStatus,onOffBtn); // not loaded icon
                    // try to reload map layer
                    map.add(layer);
                    console.log("whenLayerView error--> reloading layer "+layer.title);
                },500);
            });
            // This function fires each time an error occurs during the creation of a layerview
            view.on("layerview-create-error", function(event) {
                console.error("LayerView failed to create for layer: ", event.layer.title);
                // flash status icon
                listItem.removeChild(listStatus);
                setTimeout(function(){
                    listItem.insertBefore(listStatus,onOffBtn);
                    // try to reload map layer
                    map.add(event.layer);
                    console.log("layerview-create-error--> reloading layer "+layer.title);
                },500);
            });

        }
        //view.on("layerview-create", function(event){
            
        //});

        tabs.appendChild(tab1);
        
        
        // Basemaps
        const tab2 = document.createElement("calcite-tab");
        const br = document.createElement("br");
        tab2.appendChild(br);
        const tab2Content = document.createElement("div");
        tab2Content.style.textAlign = "center";
        tab2Content.id = "bmGallery2";
        tab2Content.style.overflowY = "auto";
        tab2Content.innerHTML = myCustomBasemaps();
        tab2.appendChild(tab2Content);
        tabs.appendChild(tab2);
        

        mapLayersWidget.addEventListener("click", function (event) {
          if (basemapLayers.includes(event.target.id)) myToggleBasemap(event);
        });
        view.ui.add(mapLayersWidget,"top-right");

        // Map Layers Button
        const layerListExpand = document.createElement("calcite-button");
        layerListExpand.id = "layerListExpand";
        layerListExpand.iconStart = "layers";
        layerListExpand.className="esri-widget--button";
        layerListExpand.title = "Map Layers";
        layerListExpand.label = "Map Layers";
        layerListExpand.alignment="center";
        layerListExpand.appearance="solid";
        layerListExpand.kind ="neutral";
        layerListExpand.scale = "s";
        layerListExpand.style.width = "120px";
        const layerListLabel = document.createElement("span");
        layerListLabel.innerHTML = "Map Layers";
        layerListLabel.style.fontWeight = "bold";
        layerListExpand.appendChild(layerListLabel);
        layerListExpand.addEventListener("click", function(event){
            document.getElementById("layerlist").open = true;
        });
        //layerListExpand.content = customLayerList;
        view.ui.add(layerListExpand, "top-right");
        //return mapLayersWidget;
    //}
}