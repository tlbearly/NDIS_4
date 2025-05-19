// -- Measure --
var measure,areaBtn,distBtn;
function closeMeasure(){
    if (document.getElementById("measureDiv")){
        document.getElementById("measureDiv").style.display = "none";
        drawing = false;
        distBtn.classList.remove("active");
        areaBtn.classList.remove("active");
        measure.activeTool=null;
        measure.clear();
    }
}
function addMeasure(graphicsLayer){
    require(["esri/widgets/Measurement","esri/widgets/Expand","esri/core/reactiveUtils"],function(Measurement,Expand,reactiveUtils){
        // To create the Measurement widget with SceneView's direct-line tool active.
        
        measure = new Measurement({
            view: view,
            activeTool: null,
            label: "Measure",
            linearUnit: "imperial",
            areaUnit: "imperial"
        });
        // create div to hold measure buttons: distance, area, clear
        const measureDiv = document.createElement("div");
        measureDiv.id = "measureDiv";
        measureDiv.className = "myDialog";//"esri-component esri-widget";
        measureDiv.style.margin="0px";
        measureDiv.style.position="absolute";
        measureDiv.style.display="none";
        const header=document.createElement("div");
        header.className="myHeader";
        measureDiv.appendChild(header);
        const measureTitle = document.createElement("h2");
        measureTitle.style.textAlign="center";
        measureTitle.style.padding="10px";
        measureTitle.style.margin="0";
        measureTitle.innerHTML='<span id="helpTitle">Measure</span>';
        const measureClose = document.createElement("button");
        measureClose.id = "measureClose";
        measureClose.className = "myCloseButton";
        measureClose.setAttribute("aria-busy",false);
        measureClose.setAttribute("aria-label","Close");
        measureClose.setAttribute("aria-pressed","false");
        measureClose.innerHTML = "X";
        measureClose.addEventListener("click",closeMeasure);

        measureTitle.appendChild(measureClose);
        header.appendChild(measureTitle);
        const btnP = document.createElement("p");
        btnP.style.padding="0 10px";
        btnP.style.textAlign="center";
        
        // Distance Button
        distBtn = document.createElement("button");
        distBtn.id= "distance";
        distBtn.className="esri-widget--button esri-interactive esri-icon-measure-line active";
        distBtn.style.display="inline";
        distBtn.style.marginRight="5px";
        distBtn.style.fontSize="24px";
        distBtn.title = "Distance Measurement Tool";
        btnP.appendChild(distBtn);
        // Area Button
        areaBtn = document.createElement("button");
        areaBtn.id="area";
        areaBtn.className="esri-widget--button esri-interactive esri-icon-measure-area";
        areaBtn.style.display="inline";
        areaBtn.style.marginRight="5px";
        areaBtn.style.fontSize="24px";
        areaBtn.title = "Area Measurement Tool";
        btnP.appendChild(areaBtn);
        // Clear Button
        /*var clearBtn = document.createElement("button");
        clearBtn.id="clear";
        clearBtn.className="esri-widget--button esri-interactive esri-icon-trash";
        clearBtn.style.display="inline";
        clearBtn.style.marginRight="5px";
        clearBtn.style.fontSize="24px";
        clearBtn.title = "Clears Measurements";
        btnP.appendChild(clearBtn);*/
        measureDiv.appendChild(btnP);

        distBtn.addEventListener("click", () => {
            distanceMeasurement();
        });
        areaBtn.addEventListener("click", () => {
            areaMeasurement();
        });
        //clearBtn.addEventListener("click", () => {
        //    clearMeasurements();
        //});
        function distanceMeasurement() {
            measure.activeTool = "distance";
            measure.active = true;
            distBtn.classList.add("active");
            areaBtn.classList.remove("active");
            // Add double click to end to instructions
            const tim = setInterval(function (){
                if (document.querySelector(".esri-measurement-widget-content__hint-text") != undefined){
                    clearTimeout(tim);
                    document.querySelector(".esri-measurement-widget-content__hint-text").innerHTML = "Start to measure by clicking in the map to place your first point. Double click to end.";
                }
            },500);
        }
  
        // Call the appropriate AreaMeasurement2D or AreaMeasurement3D
        function areaMeasurement() {
            measure.activeTool = "area";
            measure.active = true;
            distBtn.classList.remove("active");
            areaBtn.classList.add("active");
            // Add double click to end to instructions
            const tim = setInterval(function (){
                if (document.querySelector(".esri-measurement-widget-content__hint-text") != undefined){
                    clearTimeout(tim);
                    document.querySelector(".esri-measurement-widget-content__hint-text").innerHTML = "Start to measure by clicking in the map to place your first point. Double click to end.";
                }
            },500);
        }
  
        // Clears all measurements
        function clearMeasurements() {
            var active = measure.activeTool;
            distBtn.classList.remove("active");
            areaBtn.classList.remove("active");
            measure.activeTool=null;
            measure.clear();
            if (active == "distance") distanceMeasurement();
            else areaMeasurement();
        }

        //view.ui.add(measure, "bottom-left");
        measure.container = measureDiv;

        const measureBtn = document.createElement("button");
        measureBtn.className = "esri-widget--button";
        measureBtn.style.border = "none";
        measureBtn.style.boxShadow = "1px 1px 1px #ccc";
        
        const icon = document.createElement("calcite-icon");
        icon.id = "measureIcon";
        icon.icon = "measure";
        measureBtn.appendChild(icon);
        
        measureBtn.addEventListener("click",function(){
            document.getElementById("measureDiv").style.display = "block";
            drawing = true;
            distanceMeasurement();
            closeIdentify();
            closeHelp();
            //document.getElementById("measureIcon").icon = "chevrons-right";
        });
       
        measureBtn.setAttribute("aria-label","Measure");

        view.ui.add(measureBtn, "bottom-right");
        view.ui.add(measureDiv,"top-right");
    });

    return;

    // old sketch draw and measure
    require(["esri/widgets/Sketch","esri/widgets/Expand","esri/Graphic",
        "esri/geometry/geometryEngine"], function (Sketch,Expand,Graphic,geometryEngine) {
        const sketch = new Sketch({
            view,
            title: "Measure",
            layer: graphicsLayer,
            availableCreateTools: ["point", "polyline", "polygon", "rectangle"],
            creationMode: "update",
            updateOnGraphicClick: true,
            visibleElements: {
            heading:  true,
                createTools: {
                    circle: false
                },
                selectionTools:{
                    "lasso-selection": false,
                    "rectangle-selection":false,
                },
                settingsMenu: false,
                undoRedoMenu: false,
                closeButton: true,
                collapseButton: true,								
                heading: true
            }
        });
        const sketchExpand = new Expand({
            view,
            content: sketch,
            expandTooltip: "Measure",
            expandIconClass: "esri-icon-measure"
        });
        //view.ui.add(sketchExpand, "bottom-right");
        const measurements = document.createElement("div");
        measurements.id = "measurements";
        measurements.innerHTML = "Measurement Results";
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
            textSymbol.text = geodesicArea.toFixed(2) + " mi\xB2";
            var g = new Graphic({
                geometry: polygon,
                symbol: textSymbol
            });
            graphicsLayer.graphics.add(g);
        }

        function getLength(line) {
            // if WGS94(4326) or WebMercator (3857) use geodesic Area
            const geodesicLength = geometryEngine.geodesicLength(line, "miles"); //kilometers");
            //const planarLength = geometryEngine.planarLength(line, "kilometers");
            measurements.innerHTML =
            "<b>Length</b>:  " + geodesicLength.toFixed(2) + " miles";
            textSymbol.text = geodesicLength.toFixed(2) + " mi";
            var g = new Graphic({
                geometry: line,
                symbol: textSymbol
            });
            graphicsLayer.graphics.add(g);
        }





        // in utilFunc.js
        /*async function projectPoint(pt, div){
            require(["esri/geometry/support/webMercatorUtils", "esri/geometry/SpatialReference", "esri/rest/support/ProjectParameters", "esri/rest/geometryService"],
            function(webMercatorUtils, SpatialReference, ProjectParameters, GeometryService) {
                // Project point pt to user selected projection from Settings
                var geoPt;

                var myPrj = document.getElementById("settings_xycoords_combo").value; // user defined projection
                if (myPrj === "dd") {
                    geoPt = webMercatorUtils.webMercatorToGeographic(pt);
                    if (div && div.value != undefined){
                        div.value = geoPt.y.toFixed(5) + " N, " + geoPt.x.toFixed(5) + " W";
                        div.setAttribute("size",div.value.length);
                    }
                    else if (div)
                        div.innerHTML = geoPt.y.toFixed(5) + " N, " + geoPt.x.toFixed(5) + " W";
                    else alert("Warning", "Undefined DOM node id="+div);			
                } else if (myPrj === "dms") {
                    geoPt = mappoint_to_dms(pt, true);
                    if (div && div.value != undefined){
                        div.value = geoPt[0] + " N, " + geoPt[1] + " W";
                        div.setAttribute("size",div.value.length);
                    }
                    else if (div)
                        div.innerHTML =  geoPt[0] + " N, " + geoPt[1] + " W";
                    else alert("Warning", "Undefined DOM node id="+div);
                } else if (myPrj === "dm") {
                    geoPt = mappoint_to_dm(pt, true);
                    if (div && div.value != undefined){
                        div.value = geoPt[0] + " N, " + geoPt[1] + " W";
                        div.setAttribute("size",div.value.length);
                    }
                    else if (div)
                        div.innerHTML = geoPt[0] + " N, " + geoPt[1] + " W";
                    else alert("Warning", "Undefined DOM node id="+div);
                } else { // utm
                    var outSR = new SpatialReference(Number(myPrj));
                    // converts point to selected projection
                    var params = new ProjectParameters({
                        outSpatialReference: outSR,
                        geometries: [pt]
                    });
                    GeometryService.project(geometryService,params).then( (feature) => {
                        var units;
                        if (outSR.wkid == 32612) units = "WGS84 UTM Zone 12N";
                        else if (outSR.wkid == 32613) units = "WGS84 UTM Zone 13N";
                        else if (outSR.wkid == 26912) units = "NAD83 UTM Zone 12N";
                        else if (outSR.wkid == 26913) units = "NAD83 UTM Zone 13N";
                        else if (outSR.wkid == 26712) units = "NAD27 UTM Zone 12N";
                        else if (outSR.wkid == 26713) units = "NAD27 UTM Zone 13N";
                        else units = "unknown units: "+outSR.wkid+" in utilFuncs.js projectPoint()";
                        if (div && div.value != undefined){
                            div.value = feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0) + " " + units;
                            div.setAttribute("size",div.value.length);
                        }
                        else if (div)
                            div.innerHTML = feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0) + " " + units;
                        else alert("Warning", "Undefined DOM node id="+div);
                    }).catch ( (err) => {
                        if (err.details)
                            alert("Problem projecting point. " + err.message + " " + err.details[0], "Warning");
                        else
                            alert("Problem projecting point. " + err.message, "Warning");					
                    });
                }
            });
        }*/

        
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
            //view.closePopup();
            closeIdentify();
            const geometry = e.graphics[0].geometry;

            if (e.state === "start") {
            switchType(geometry);
            }

            if (e.state === "complete") {
            // remove label
            graphicsLayer.remove(graphicsLayer.graphics.getItemAt(1));
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
    });
}