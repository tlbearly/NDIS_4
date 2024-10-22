class myCustomLayerList{
    constructor(){
        const layerList = document.createElement("calcite-popover");
        layerList.heading = "Map Layers";
        layerList.label = "Map layers";
        layerList.setAttribute("reference-element", "layerListExpand");
        layerList.closable=true;
        layerList.className = "esri-layer-list esri-widget esri-widget--panel";
        //const flow = document.createElement("calcite-flow");
        //layerList.appendChild(flow);
        
        // content
        //const content = document.createElement("calcite-flow-item");
        //content.style.padding = "10px";
        //flow.appendChild(content);
        
        // tabs
        const tabs = document.createElement("calcite-tabs");
        tabs.style.width = "300px";
        tabs.style.padding = "10px";
        tabs.style.maxHeight = "70vh";
        layerList.appendChild(tabs);
        const tabNav = document.createElement("calcite-tab-nav");
        tabNav.slot = "title-group";
        tabs.appendChild(tabNav);
        const tabTitle1 = document.createElement("calcite-tab-title");
        tabTitle1.select = true;
        tabTitle1.innerHTML = "Layers";
        tabTitle1.style.border = "none";
        tabNav.appendChild(tabTitle1);
        const tabTitle2 = document.createElement("calcite-tab-title");
        tabTitle2.innerHTML = "Basemaps";
        tabNav.appendChild(tabTitle2);
        
        
        // Layer List
        const tab1 = document.createElement("calcite-tab");
        tab1.select = true;
        const list = document.createElement("calcite-list");
        tab1.appendChild(list);
        list.addEventListener("calciteListChange", (event) => {
            //alert("clicked on layer");
        });
        const nonLayers = ["Graphics Layer", "World Hillshade", "World Imagery", "USGSTopo", "USA Topo Maps", "USGSImageryTopo","", "World Topo Map", "World Basemap", "World Basemap v2"];
        view.on("layerview-create", function(event){
            const layer = event.layer;
            // layers that should not be included in the layer list
            if (nonLayers.includes(layer.title) ) return;
            const listItem = document.createElement("calcite-list-item");
            listItem.label = layer.title;
            listItem.value = layer.title;
            if (layer.title === "Game Species"){
                const accord=document.createElement("calcite-accordion");
                const accItem=document.createElement("calcite-accordion-item");
                accItem.heading="Big Game Species";
                accord.appendChild(accItem);
                accord.slot="content";
                accord.open=false;
                accord.style.margin = "-8px -12px";
                //listItem.content.style.padding = "0";
                listItem.appendChild(accord);
                const radioGroup = document.createElement("calcite-radio-button-group");
                radioGroup.name="radioBtns";
                radioGroup.layout = "vertical";
                radioGroup.style.padding = "10px";
                accItem.appendChild(radioGroup);
                radioGroup.addEventListener("calciteRadioButtonGroupChange", (event) => {
                    event.target.parentNode.description = event.target.selectedItem.label;
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

                 /*const gameSp = document.createElement("calcite-combobox");
                gameSp.overlayPositioning="absolute";
                gameSp.selectionMode="single";
                gameSp.selectionDisplay="single";
                layer.sublayers.items.forEach(element => {
                    const item = document.createElement("calcite-combobox-item");
                    item.value = element.title;
                    item.heading = element.title;
                    item.label = element.title;
                    item.textLabel = element.title;
                    if (element.visible){
                        gameSp.value = element.title;
                        item.selected = true;
                    }
                    gameSp.appendChild(item);
                });
                
                gameSp.slot="content-end";
                listItem.appendChild(gameSp);
                */
                
            }
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

        //tab1.appendChild(tab1Content);
        tabs.appendChild(tab1);
        
        
        // Basemaps
        const tab2 = document.createElement("calcite-tab");
        const tab2Content = document.createElement("div");
        tab2Content.id = "bmGallery";
        tab2Content.style.overflowY = "auto";
        tab2Content.innerHTML = myCustomBasemaps();
        tab2.appendChild(tab2Content);
        tabs.appendChild(tab2);
        
        return layerList;
    }
}