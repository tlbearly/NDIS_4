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

        // Sublayer Popup Event
       
        /*list.addEventListener("calciteListChange", (event) => {
            alert("clicked on layer "+event.target.selectedItem[0].title);
        });*/
        
        const nonLayers = ["Graphics Layer", "World Hillshade", "World Imagery", "USGSTopo", "USA Topo Maps", "USGSImageryTopo","", "World Topo Map", "World Basemap", "World Basemap v2"];
        view.on("layerview-create", function(event){
            const layer = event.layer;
            // layers that should not be included in the layer list
            if (nonLayers.includes(layer.title) ) return;
            const listItem = document.createElement("calcite-list-item");
            const listHeader = document.createElement("h3");
            listHeader.innerHTML = layer.title; // title displayed
            listHeader.slot = "actions-start";
            listItem.value = layer.title;
            listItem.heading = layer.title;
            listHeader.id = layer.title.replace(/ /g,"_") +"_popover";
            listItem.appendChild(listHeader);
            
            // Define each sublayer popup
            layer.sublayers.items.forEach(element => {
                var sublayerPopover = document.createElement("calcite-popover");
                sublayerPopover.referenceElement=layer.title.replace(/ /g,"_") +"_popover";
                if (layer.title === "Game Species"){
                    sublayerPopover.heading = gameSpecies;
                    sublayerPopover.label = gameSpecies;
                }else {
                    sublayerPopover.heading = layer.title;
                    sublayerPopover.label = layer.title;
                }
                sublayerPopover.closable = true;
                const accord=document.createElement("calcite-accordion");
                const accItem1=document.createElement("calcite-accordion-item");
                accItem1.heading="Description:";
                const item1Notice=document.createElement("calcite-notice");
                item1Notice.open="true";
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
                accItem2.appendChild(item2Notice);
                const item2Div=document.createElement("div");
                item2Div.slot="message";
                item2Div.innerHTML = "";
                //element.sublayers.items.forEach(item => {
                //    item2Div.innerHTML += item.title;
                //});
                
                item2Notice.appendChild(item2Div);
                accord.appendChild(accItem2);
                
                sublayerPopover.appendChild(accord);
                document.getElementById("viewDiv").appendChild(sublayerPopover);
                
            });
            

            // Add Accordion with Radio Buttons
            if (layer.title === "Game Species"){
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
            }

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
        const tab2Content = document.createElement("div");
        tab2Content.id = "bmGallery";
        tab2Content.style.overflowY = "auto";
        tab2Content.innerHTML = myCustomBasemaps();
        tab2.appendChild(tab2Content);
        tabs.appendChild(tab2);
        
        return mapLayersWidget;
    }
}