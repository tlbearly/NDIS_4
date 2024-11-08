class myCustomLayerList{
    constructor(){
        var gameSpecies = "Elk"; // title for game species sublayer popover
        // TOC parent layers list
        const mapLayersWidget = document.createElement("calcite-popover");
        mapLayersWidget.heading = "Map Layers";
        mapLayersWidget.label = "Map layers";
        mapLayersWidget.setAttribute("reference-element", "layerListExpand");
        mapLayersWidget.closable=true;
        mapLayersWidget.className = "esri-layer-list esri-widget esri-widget--panel";
        
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
        const list = document.createElement("calcite-list");
        //list.selectionMode = "single";
        tab1.appendChild(list);
        
        const nonLayers = ["Graphics Layer", "World Hillshade", "World Imagery", "USGSTopo", "USA Topo Maps", "USGSImageryTopo","", "World Topo Map", "World Basemap", "World Basemap v2"];
        view.on("layerview-create", function(event){
            const layer = event.layer; // rootLayers
            console.log(layer.title + " loaded");
            // layers that should not be included in the layer list
            if (nonLayers.includes(layer.title) ) return;
            const listItem = document.createElement("calcite-list-item");
            const listHeader = document.createElement("h3");
            listHeader.style.fontWeight = "normal";
            listHeader.innerHTML = layer.title; // title displayed
            listHeader.slot = "actions-start";
            listItem.value = layer.title;
            listItem.heading = layer.title;
            listHeader.id = layer.title.replace(/ /g,"_") +"_popover";
            listItem.appendChild(listHeader);
            const accord=document.createElement("calcite-accordion");
            var sublayerPopover = document.createElement("calcite-popover");
            sublayerPopover.style.width = "322px";
            sublayerPopover.referenceElement=layer.title.replace(/ /g,"_") +"_popover";
            if (layer.title === "Game Species"){
                sublayerPopover.heading = gameSpecies;
                sublayerPopover.label = gameSpecies;            
            }else {
                sublayerPopover.heading = layer.title;
                sublayerPopover.label = layer.title;
            }
            sublayerPopover.closable = true;
            // Description
            const accItem1=document.createElement("calcite-accordion-item");
            accItem1.heading="Description:";
            const item1Notice=document.createElement("calcite-notice");
            item1Notice.open="true";
            item1Notice.style.overflowY = "auto";
            item1Notice.style.height = "auto"; 
            item1Notice.style.maxHeight = "300px";
            accItem1.appendChild(item1Notice);
            const item1Div=document.createElement("div");
            item1Div.slot="message";
            item1Div.innerHTML = "stuff here...";
            item1Notice.appendChild(item1Div);
            accord.appendChild(accItem1);

            // Visibilities
            const accItem2=document.createElement("calcite-accordion-item");
            accItem2.heading="Visibilities:";
            const item2Notice=document.createElement("calcite-notice");
            item2Notice.open="true";
            item2Notice.expanded="true";
            
            accItem2.appendChild(item2Notice);
            const subLayerList = document.createElement("calcite-list");
            subLayerList.style.overflowY = "auto";
            subLayerList.style.height = "auto";
            subLayerList.style.maxHeight = "300px";
            subLayerList.style.marginRight = "-15px";
            subLayerList.slot="message";

            // Visibility list in sublayer popup
            layer.sublayers.items.forEach(element => {
                
                // Game Species list
                if (layer.title === "Game Species"){
                    // Add Accordion with Radio Buttons
                    const accItem0=document.createElement("calcite-accordion-item");
                    accItem0.heading="Select Species:";
                    accord.appendChild(accItem0);
                    //accord.slot="content-bottom";
                    //accord.open=false;
                    //accord.style.margin = "0 60px 20px 20px";
                    const radioGroup = document.createElement("calcite-radio-button-group");
                    radioGroup.name="radioBtns";
                    radioGroup.layout = "vertical";
                    radioGroup.style.padding = "10px";
                    accItem0.appendChild(radioGroup);
                    radioGroup.addEventListener("calciteRadioButtonGroupChange", (event) => {
                        event.target.parentNode.description = event.target.selectedItem.label;
                        gameSpecies = event.target.selectedItem.label;
                        // set game species layers to hidden
                        for(var i=0; i<event.target.parentNode.childNodes[0].childNodes.length; i++)
                            event.target.parentNode.childNodes[0].childNodes[i].layer.visible = false;
                        event.target.selectedItem.parentNode.layer.visible = true;
                        event.target.parentNode.expanded = false;
                    });
                
                    
                    /*layer.sublayers.items.forEach(species => {
                        const radio = document.createElement("calcite-label");
                        radio.layout="inline";
                        if (species.visible){
                            radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"' checked></calcite-radio-button> "+species.title;
                            accItem.description = element.title;
                        }
                        else
                            radio.innerHTML = "<calcite-radio-button id='radio"+species.title+"' value='"+species.title+"' label='"+species.title+"'></calcite-radio-button> "+species.title;
                        radio.layer = species;
                        radioGroup.appendChild(radio); 
                    });*/
                }

                
                if (element.sublayers && element.sublayers.items){
                    element.sublayers.items.forEach(item => {
                        const subLayerListItem = document.createElement("calcite-list-item");
                        const subLayerListHeader = document.createElement("h3");
                        subLayerListHeader.style.fontWeight = "normal";
                        subLayerListHeader.innerHTML = item.title; // title displayed
                        subLayerListHeader.slot = "actions-start";
                        subLayerListItem.value = item.title;
                        subLayerListItem.heading = item.title;
                        subLayerListItem.appendChild(subLayerListHeader);

                        // Add Switch to actions-end of list Item
                        const subLayeronOffBtn = document.createElement("calcite-switch");
                        subLayeronOffBtn.slot = "actions-end";
                        subLayeronOffBtn.layer = item.layer;
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
                else {
                    const subLayerListItem = document.createElement("calcite-list-item");
                    const subLayerListHeader = document.createElement("h3");
                    subLayerListHeader.style.fontWeight = "normal";
                    subLayerListHeader.innerHTML = element.title; // title displayed
                    subLayerListHeader.slot = "actions-start";
                    subLayerListItem.value = element.title;
                    subLayerListItem.heading = element.title;
                    subLayerListItem.appendChild(subLayerListHeader);

                    // Add Switch to actions-end of list Item
                    const subLayeronOffBtn = document.createElement("calcite-switch");
                    subLayeronOffBtn.slot = "actions-end";
                    subLayeronOffBtn.layer = element.layer;
                    subLayeronOffBtn.style.paddingRight = "4px";
                    subLayeronOffBtn.setAttribute("scale","l"); // large
                    if (element.layer.visible) subLayeronOffBtn.checked = true;
                    // Set value when clicked
                    subLayeronOffBtn.addEventListener("calciteSwitchChange", event => {
                        event.target.layer.visible = event.target.checked;
                    });
                    subLayerListItem.appendChild(subLayeronOffBtn);
                    subLayerList.appendChild(subLayerListItem);
                }
                
                item2Notice.appendChild(subLayerList);
                accord.appendChild(accItem2);
                
                sublayerPopover.appendChild(accord);
                document.getElementById("viewDiv").appendChild(sublayerPopover);  
            });
            

            // Add Accordion with Radio Buttons
            /*if (layer.title === "Game Species"){
                const accord=document.createElement("calcite-accordion");
                const accItem=document.createElement("calcite-accordion-item");
                accItem.heading="Select Species:";
                accord.appendChild(accItem);
                accord.slot="content-bottom";
                accord.open=false;
                accord.style.margin = "0 60px 20px 20px";
                listItem.appendChild(accord);
                const radioGroup = document.createElement("calcite-radio-button-group");
                radioGroup.name="radioBtns";
                radioGroup.layout = "vertical";
                radioGroup.style.padding = "10px";
                accItem.appendChild(radioGroup);
                radioGroup.addEventListener("calciteRadioButtonGroupChange", (event) => {
                    event.target.parentNode.description = event.target.selectedItem.label;
                    gameSpecies = event.target.selectedItem.label;
                    // set game species layers to hidden
                    for(var i=0; i<event.target.parentNode.childNodes[0].childNodes.length; i++)
                        event.target.parentNode.childNodes[0].childNodes[i].layer.visible = false;
                    event.target.selectedItem.parentNode.layer.visible = true;
                    event.target.parentNode.expanded = false;
                });
               
                
                layer.sublayers.items.forEach(element => {
                    const radio = document.createElement("calcite-label");
                    radio.layout="inline";
                    if (element.visible){
                        radio.innerHTML = "<calcite-radio-button id='radio"+element.title+"' value='"+element.title+"' label='"+element.title+"' checked></calcite-radio-button> "+element.title;
                        accItem.description = element.title;
                    }
                    else
                        radio.innerHTML = "<calcite-radio-button id='radio"+element.title+"' value='"+element.title+"' label='"+element.title+"'></calcite-radio-button> "+element.title;
                    radio.layer = element;
                    radioGroup.appendChild(radio);
                    
                });
            }*/

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
        });

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
        
        return mapLayersWidget;
    }
}