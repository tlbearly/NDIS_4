//
// Basemaps Gallery
//        Moved to readConfig.js because could not load on mobile!!!!!!! 
class My_BasemapGallery {

    constructor(){
        alert("call setupLayers");
        try{
        // create basemap services
        this.setupLayers();
        alert("after setupLayers");
        this.menu =  document.createElement("ul");
        this.bmGallery = document.createElement("div");
        this.bmGallery.style.backgroundColor = "#fff";
        this.bmGallery.style.width = "300px";
        this.bmGallery.className ="esri-legend";
        this.bmGallery.appendChild(this.menu);
        this.menu.role = "menu";
        this.bmGallery.id = "bmGallery";

        // add basemap layers
        alert("before add basemap");
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

    setupLayers(){
        require([
        "esri/Basemap",
        "esri/layers/VectorTileLayer",
        "esri/layers/MapImageLayer",
        "esri/layers/FeatureLayer"
        ], (Basemap,VectorTileLayer,MapImageLayer,FeatureLayer)  => {
            var layer;
alert("in myBasemap");
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
        //this.bmGallery.appendChild(basemap);
        this.menu.appendChild(basemap);
    }
    toggleBasemap(event){
        const name = event.target.id;
        document.getElementsByClassName("bmSelected")[0].className = "bmUnselected";
        document.getElementById(name).className = "bmSelected";
        map.basemap = window[name]; // get variable
    }
}