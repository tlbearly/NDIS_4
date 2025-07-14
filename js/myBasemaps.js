// store each basemap layer for switching
var natgeo,streets,aerial,topo,fsTopo,imagery_topo,topo2,high_contrast_light,high_contrast_dark;
// array of basemap layer ids
const basemapLayers = ["natgeo","streets","aerial","topo","fsTopo","imagery_topo","topo2","high_contrast_light","high_contrast_dark"];
function myBasemaps() {
    try {
        const bmGallery = document.createElement("div"); // needed so that we can pass back innerHTML
        const tileGroup =  document.createElement("calcite-tile-group");
        tileGroup.setAttribute("label","Select the basemap");
        tileGroup.setAttribute("layout","horizontal");
        tileGroup.setAttribute("alignment","center");
        tileGroup.setAttribute("selection-mode","single");
        tileGroup.setAttribute("selection-appearance","border");
        tileGroup.setAttribute("scale","s");
        tileGroup.style.width = "290px";
        bmGallery.appendChild(tileGroup);

        setupBasemapLayers();
        // add basemap layers
        add(tileGroup, "streets","Streets","assets/images/basemaps_streets.jpg",true); //https://www.arcgis.com/sharing/rest/content/items/2ea9c9cf54cb494187b03a5057d1a830/info/thumbnail/Jhbrid_thumb_b2.jpg",true)
        add(tileGroup, "aerial","Aerial Photo","assets/images/basemaps_aerial_photo.jpg",false);
        add(tileGroup, "topo2","ESRI Digital Topo","assets/images/basemaps_esri_digital_topo.jpg",false);
        add(tileGroup, "natgeo","USGS Digital Topo","assets/images/basemaps_USGS_digital_topo.jpg",false);//assets/images/basemaps_natgeothumb.jpg",false);
        //add(tileGroup, "imagery_topo","Aerial Topo","assets/images/basemaps_aerial_topo.jpg",false);
        add(tileGroup, "high_contrast_light","High Contrast Light","assets/images/basemaps_high_constrast_light.jpg",false);//"https://www.arcgis.com/sharing/rest/content/items/084291b0ecad4588b8c8853898d72445/info/thumbnail/thumbnail1655848049464.png?f=json",false);
        add(tileGroup, "high_contrast_dark","High Contrast Dark","assets/images/basemaps_high_constrast_dark.jpg",false);//"https://www.arcgis.com/sharing/rest/content/items/3e23478909194c54992eaaee78b5f754/info/thumbnail/thumbnail1655848922604.png?f=json",false);
        add(tileGroup, "topo","USGS Scanned Topo","assets/images/basemaps_USGS_scanned_topo.jpg",false);
        return bmGallery.innerHTML;
    }catch (e) {
            alert("Error in myBasemapGallery. "+e.getMessage, "Error");
    }
    
    async function setupBasemapLayers() {
        require(["esri/Basemap", "esri/layers/TileLayer",  "esri/layers/VectorTileLayer"],
        function(Basemap, TileLayer, VectorTileLayer) {
            
            try {
                // -------------------------
                //  Create Basemap Services
                // -------------------------
                const hillShadeLayer = new TileLayer({
                    url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer"
                });
                // streets-vector
                var layer = new VectorTileLayer({
                    url:"https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer",
                    opacity: 0.75,
                });
                // World Streets Vector with Hillshade
                streets = new Basemap({
                    baseLayers:[hillShadeLayer,layer],
                    title:"Streets",
                    id:"streets"
                    //thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/2ea9c9cf54cb494187b03a5057d1a830/info/thumbnail/Jhbrid_thumb_b2.jpg"
                });
                map.basemap = streets;

                // open street map --- Fails to load!!!! need apikey??
                /*layer = new VectorTileLayer({
                    url: "https://www.arcgis.com/home/item.html?id=8978501dcd724175be8913ed87166b2f",
                    opacity: 0.75
                });
                streets = new Basemap({
                    basemapLayers:[hillShadeLayer,layer],
                    title: "Streets",
                    id: "streets"
                });
                map.basemap = streets;*/

                // Aerial Photo
                var layers=[];
                layer = new TileLayer({
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
                    id:"aerial"
                    //thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/f81bc478e12c4f1691d0d7ab6361f5a6/info/thumbnail/street_thumb_b2wm.jpg"
                });

                // Add USGS Digital Topo back in. ESRI removed it 6-30-19
                layer = new TileLayer({
                    url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
                    opacity: 0.75
                });
                natgeo = new Basemap({
                    baseLayers:[hillShadeLayer,layer],
                    title:"USGS Digital Topo",
                    id:"natgeo"
                    //thumbnailUrl:"https://usfs.maps.arcgis.com/sharing/rest/content/items/6d9fa6d159ae4a1f80b9e296ed300767/info/thumbnail/thumbnail.jpeg"
                });

                // USGS Scanned Topo
                // thumbnail moved no longer esists: //"https://www.arcgis.com/sharing/rest/content/items/931d892ac7a843d7ba29d085e0433465/info/thumbnail/usa_topo.jpg"
                layer=new TileLayer({
                    url:"https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer",
                    dpi:300,
                    opacity: 0.75
                });
                topo = new Basemap({
                    baseLayers:[hillShadeLayer,layer],
                    title:"USGS Topo",
                    id:"topo"
                    //thumbnailUrl:"assets/images/USA_topo.png"
                });

                // Aerial with Topos
                /*layer=new TileLayer({url:"https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer",opacity:0.75,dpi:300});
                imagery_topo = new Basemap({
                    baseLayers:[hillShadeLayer,layer],
                    title:"Aerial Photo with USGS Contours",
                    id: "imagery_topo",
                    dpi:300
                });*/

                // ESRI Digital Topo
                layer=new TileLayer({url:"https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",opacity:0.75});
                // old thumb thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/30e5fe3149c34df1ba922e6f5bbf808f/info/thumbnail/ago_downloaded.jpg"
                topo2 = new Basemap({
                    baseLayers:[hillShadeLayer,layer],
                    title:"ESRI Digital Topo",
                    id:"topo2"
                    //thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/588f0e0acc514c11bc7c898fed9fc651/info/thumbnail/topo_thumb_b2wm.jpg"
                });

                // Hight Contrast Light
                /*layer = new VectorTileLayer({
                    url: "https://www.arcgis.com/sharing/rest/content/items/084291b0ecad4588b8c8853898d72445/resources/styles/root.json",
                    title: "High Contrast Light"
                });*/
                high_contrast_light = new Basemap({
                    portalItem: {
                      id: "084291b0ecad4588b8c8853898d72445"
                    },
                   // baseLayers: [layer], //url:"https://www.arcgis.com/sharing/rest/content/items/084291b0ecad4588b8c8853898d72445",
                    title: "High contrast light theme",
                    id: "high_contrast_light"
                    //thumbnailUrl: "https://www.arcgis.com/sharing/rest/content/items/084291b0ecad4588b8c8853898d72445/info/thumbnail/thumbnail1655848049464.png?f=json"
                  });
                  
                  high_contrast_dark = new Basemap({
                    portalItem: {
                        id: "3e23478909194c54992eaaee78b5f754",
                    },
                    //url: "https://cdn.arcgis.com/sharing/rest/content/items/3e23478909194c54992eaaee78b5f754", //"https://www.arcgis.com/home/item.html?id=3e23478909194c54992eaaee78b5f754", //"https://hub.arcgis.com/maps/3e23478909194c54992eaaee78b5f754",
                    title: "High contrast dark theme",
                    id: "high_contrast_dark"
                    //thumbnailUrl:"https://www.arcgis.com/sharing/rest/content/items/588f0e0acc514c11bc7c898fed9fc651/info/thumbnail/topo_thumb_b2wm.jpg"
                  });
            }catch(error){
                //console.log(error.message);
            }
        });
    }
    async function add(tileGroup, id, title, thumbnail, selected){
        // id - internal basemap title, used in toggleBasemap()
        // title - display title
        // thumbnail - thumbnail image
        // selected - true or false
        try {
            const basemap = document.createElement("calcite-tile");
            basemap.style.border = "1px solid lightgray";
            basemap.setAttribute("heading",title);
            basemap.setAttribute("title",title);
            basemap.setAttribute("label",title);
            basemap.setAttribute("selection-mode","single");
            basemap.setAttribute("selection-appearance","border");
            basemap.setAttribute("alignment","center");
            basemap.id=id;
            const img = document.createElement("img");
            img.src=thumbnail;
            img.slot = "content-top";
            img.id=id;
            if (selected) {
                basemap.setAttribute("selected",true);
                //basemap.className="bmSelected";
            }
            else {
                basemap.setAttribute("selected",false);
                //basemap.className="bmUnselected";
            }
            basemap.appendChild(img);
            /*const label = document.createElement("div");
            label.style.textAlign="center";
            label.innerHTML=title;
            label.id=id;
            basemap.appendChild(label);*/
            tileGroup.appendChild(basemap);
        } catch(error){
            alert("Problem adding basemap gallery layers: "+error.message);
        }
    }
}
function myToggleBasemap(event){
    const name = event.target.id;
    // unselect all tiles
    var nodes;
    if (event.target.tagName === "CALCITE-TILE")
        nodes = event.target.parentNode.childNodes; // calcite-tiles
    else // clicked on image
        nodes = event.target.parentNode.parentNode.childNodes; // calcite-tiles
    for(var i=0;i<nodes.length;i++){
        nodes[i].setAttribute("selected",false);
    }
    if (event.target.tagName === "CALCITE-TILE") // clicked on tile
        event.target.setAttribute("selected",true);
    else // clicked on image
        event.target.parentNode.setAttribute("selected",true);
    //document.getElementsByClassName("bmSelected")[0].className = "bmUnselected";
    //document.getElementById(name).className = "bmSelected";
    map.basemap = window[name]; // get variable
    //basemapExpand.expanded = false;
}