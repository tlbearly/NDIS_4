// -- Measure --
function addMeasure(graphicsLayer){
    require(["esri/widgets/Sketch","esri/widgets/Expand",
        "esri/geometry/geometryEngine"], function (Sketch,Expand,geometryEngine) {
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
        view.ui.add(sketchExpand, "bottom-right");
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
            /*textSymbol.text = geodesicArea.toFixed(2) + " mi\xB2";
            var g = new Graphic({
                geometry: polygon,
                symbol: textSymbol
            });
            graphicsLayer.graphics.add(g);*/
        }

        function getLength(line) {
            // if WGS94(4326) or WebMercator (3857) use geodesic Area
            const geodesicLength = geometryEngine.geodesicLength(line, "miles"); //kilometers");
            //const planarLength = geometryEngine.planarLength(line, "kilometers");
            measurements.innerHTML =
            "<b>Length</b>:  " + geodesicLength.toFixed(2) + " miles";
            /*textSymbol.text = geodesicLength.toFixed(2) + " mi";
            var g = new Graphic({
                geometry: line,
                symbol: textSymbol
            });
            graphicsLayer.graphics.add(g);*/
        }






        async function projectPoint(pt, div){
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
        }

        function mappoint_to_dms(point, leadingZero) {
            // Convert a map point to degrees, minutes, seconds. 
            // Return an array of latitude = arr[0] = 40° 30' 2.12345", longitude = arr[1]= 103° 25' 33.1122"
            // if leadingZero is true add 0 to left of min and sec
            var ddPoint;
            require(["esri/geometry/support/webMercatorUtils"],function(webMercatorUtils){
            ddPoint = webMercatorUtils.webMercatorToGeographic(point); // convert to lat long decimal degrees
            });
            return dd_to_dms(ddPoint, leadingZero);
        }

        function dd_to_dms(ddPoint, leadingZero) {
            // Convert a decimal degree point to degrees, minutes, seconds. 
            // Return an array of latitude = arr[0] = 40° 30' 2.12345", longitude = arr[1]= 103° 25' 33.1122"
            // if leadingZero is true add 0 to left of min and sec
            var lonAbs = Math.abs(Math.round(ddPoint.x * 1000000.0));
            var latAbs = Math.abs(Math.round(ddPoint.y * 1000000.0));
            var degY = Math.floor(latAbs / 1000000) + '° ';
            var minY = Math.floor(  ((latAbs/1000000) - Math.floor(latAbs/1000000)) * 60)  + '\' ';
            var secY = Math.floor( Math.floor(((((latAbs/1000000) - Math.floor(latAbs/1000000)) * 60) - Math.floor(((latAbs/1000000) - Math.floor(latAbs/1000000)) * 60)) * 100000) *60/100000 ) + '"'; // latitude
            if (leadingZero && minY.length == 3) minY = "0" + minY; // add leading zero so it does not shake
            if (leadingZero && secY.length == 2) secY = "0" + secY; // add leading zero so it does not shake
            var y = degY + minY + secY;
            var	degX = Math.floor(lonAbs / 1000000) + '° ';
            var minX = Math.floor(  ((lonAbs/1000000) - Math.floor(lonAbs/1000000)) * 60)  + '\' ';
            var secX = Math.floor( Math.floor(((((lonAbs/1000000) - Math.floor(lonAbs/1000000)) * 60) - Math.floor(((lonAbs/1000000) - Math.floor(lonAbs/1000000)) * 60)) * 100000) *60/100000 ) + '"'; // longitude
            if (leadingZero && minX.length == 3) minX = "0" + minX; // add leading zero so it does not shake
            if (leadingZero && secX.length == 2) secX = "0" + secX; // add leading zero so it does not shake
            var x = degX + minX + secX;
            return [y,x];
        }

        function mappoint_to_dm(point, leadingZero) {
            // Convert a map point to degrees, decimal minutes.
            // Return an array of latitude = arr[0] = 40° 30.12345', longitude = arr[1]= 103° 25.24567'
            // if leadingZero is true add 0 to left of min and sec
            var ddPoint;
            require(["esri/geometry/support/webMercatorUtils"],function(webMercatorUtils){
            ddPoint = webMercatorUtils.webMercatorToGeographic(point);
            });
            let pointArr = [];
            pointArr = dd_to_dm(ddPoint, leadingZero);
            return pointArr;
        }

        function dd_to_dm(ddPoint, leadingZero) {
            // Convert a decimal degree point to degrees, decimal minutes.
            // Return an array of latitude = arr[0] = 40° 30.12345', longitude = arr[1]= 103° 25.24567'
            // if leadingZero is true add 0 to left of min and sec
            var lonAbs = Math.abs(Math.round(ddPoint.x * 1000000.0));
            var latAbs = Math.abs(Math.round(ddPoint.y * 1000000.0));
            var degY = Math.floor(latAbs / 1000000) + '° ';
            //var minY = Math.floor(  ((latAbs/1000000) - Math.floor(latAbs/1000000)) * 60)  + '\' '; // truncate minutes
            var minY = (((latAbs/1000000) - Math.floor(latAbs/1000000)) * 60).toFixed(5)  + '\' '; // decimal minutes
            if (leadingZero && minY.indexOf(".") == 1) minY = "0" + minY; // add leading zero so it does not shake
            var y = degY + minY;
            var	degX = Math.floor(lonAbs / 1000000) + '° ';
            //var minX = Math.floor(  ((lonAbs/1000000) - Math.floor(lonAbs/1000000)) * 60)  + '\' '; // truncate minutes
            var minX = (((lonAbs/1000000) - Math.floor(lonAbs/1000000)) * 60).toFixed(5)  + '\' '; // decimal minutes
            if (leadingZero && minX.indexOf(".") == 1) minX = "0" + minX; // add leading zero so it does not shake
            var x = degX + minX;
            return [y,x];
        }

        function dms_or_dm_to_dd(str) {
            // takes a degree, minute, second point as "40:30:20.44,104:20:5"
            // or a degree, decimal minute as "40:30.1,104:20.01"
            // and returns and array. 
            // array[0] is lat in decimal degrees
            // array[1] is long in decimal degrees
            // array[2] is label in deg, min, sec as: 40° 30' 20.44" N, 104° 20' 5" W 
            // or in degrees, decimal minutes as: 40° 30.1' N, 104° 20.01' W
            var pos,pos2,pointX,pointY;

            pointY = str.substring(0,str.indexOf(","));
            pointX = str.substring(str.indexOf(",")+1,str.length);
            pos = pointX.indexOf(":");
            if (pos == -1) {
            alert("Missing ':'. Must be in the formate 40:0:0,103:0:0 or 40:0,103:0","Warning");
            return null;
            }
            var degX = Number(pointX.substring(0,pos));
            // switch from long, lat to lat, long
            if (!((degX >= -110 && degX <= -100) || (degX >= 100 && degX <= 110))) {
            var tmp;
            tmp = pointY;
            pointY = pointX;
            pointX = tmp;
            pos = pointX.indexOf(":");
            degX = Number(pointX.substring(0,pos));
            }
            var secX = 0;
            var minX;

            // if Seconds. Check if dms or degrees decimal minutes
            pos2 = pointX.substring(pos+1).indexOf(":");
            if (pos2 > -1) {
            minX = Number(pointX.substr(pos+1, pos2));
            secX = Number(pointX.substring(pos+pos2+2));
            }
            else minX = Number(pointX.substring(pos+1));
            // if degX is the longitude value and it is negative subtract the numbers 11/6/20
            if (degX < 0)
            pointX = Number(degX) - Number(minX)/60 - Number(secX)/3600;
            else
            pointX = Number(degX) + Number(minX)/60 + Number(secX)/3600;
            if (pointX >= 100 && pointX <= 110) pointX = pointX*-1;

            pos = pointY.indexOf(":");
            if (pos == -1) {
            alert("Missing ':'. Must be in the formate 40:0:0,103:0:0 or 40:0,103:0","Warning");
            return null;
            }
            var degY = Number(pointY.substring(0,pos));
            var secY = 0;
            var minY;

            // if Seconds. Check if dms or degrees decimal minutes
            pos2 = pointY.substring(pos+1).indexOf(":");
            if (pos2 > -1) {
            minY = Number(pointY.substr(pos+1, pos2));
            secY = Number(pointY.substring(pos+pos2+2));
            }
            else minY = Number(pointY.substring(pos+1));
            // if degY is the longitude value and it is negative subtract the numbers 11/6/20
            if (degY < 0)
            pointY = Number(degY) - Number(minY)/60 - Number(secY)/3600;
            else
            pointY = Number(degY) + Number(minY)/60 + Number(secY)/3600;
            label = degY+'° ' +minY+ '\' ';
            if (secY > 0) label += secY + '" N, ';
            else label += " N, ";
            if (pointY >= 100 && pointY <= 110) pointY = pointY*-1;
            label += degX+'° ' +minX+ '\' ';
            if (secX > 0) label += secX + '" W';
            else label += " W";

            if (!((pointX >= -110 && pointX <= -100) && (pointY >= 35 && pointY <= 42))) {
                alert("This point is not in Colorado. Latitude of 35 - 42. Longitude of 100 - 110.","Warning");
                return null;
            }
            return [pointY,pointX,label];
        }
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
            view.closePopup();
            const geometry = e.graphics[0].geometry;

            if (e.state === "start") {
            switchType(geometry);
            }

            if (e.state === "complete") {
            // remove label
            //graphicsLayer.remove(graphicsLayer.graphics.getItemAt(1));
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