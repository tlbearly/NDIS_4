// -- Measure --
function addMeasure(graphicsLayer){
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