// Cookies and localStorage. localStorage works in HTML5 and does not have the limit of 4k of data per domain. It can hold 5MB.
function getCookie(cname) {
    // returns null if not found. Make it return "" like it used to.
    if (typeof(Storage) == "undefined") 
        getCookie2(cname);
    else {
        try {
            var result = localStorage.getItem(cname);
            if (!result) return "";
            else return result;
        }
        catch(e){
            alert("Warning: Your browser doesn't accept cookies. Failed to read user preferences and bookmarks. See Help/Troubleshooting/Losing Your Saved Preferences for help on how to set your browser to accept cookies.","Warning");
            return "";
        }
    }
}
  
  function setCookie(cname, cvalue) {
    if (typeof(Storage) == "undefined") 
        setCookie2(cname);
    else {
      try{
        localStorage.setItem(cname,cvalue);
      }
      catch(e){
        alert("Warning: Saving user preferences and bookmarks requires non-private browser mode. Please set this mode and try again. Also, this may be caused by your browser not accepting cookies. See Help/Troubleshooting/Losing Your Saved Preferences for help on how to set your browser to accept cookies.","Warning");
      }
    }
  }
  
  function deleteCookie(cname) {
    if (typeof(Storage) == "undefined") 
        deleteCookie2(cname);
    else {
        localStorage.removeItem(cname);
    }
  }
  
  // Use the old html cookie
  function getCookie2(cname)
  {
    try{
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++)
        {
          var c = ca[i].trim();
          if (c.indexOf(name)==0) return c.substring(name.length,c.length);
        }
        return "";
    }
    catch(e){
        alert("Warning: Your browser doesn't accept cookies. Failed to read user preferences and bookmarks. See Help/Troubleshooting/Losing Your Saved Preferences for help on how to set your browser to accept cookies.","Warning");
        return "";
    }
  }
  
  function deleteCookie2( name ) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
  }
  
  function setCookie2(cname, cvalue) {
    try{
        // Delete if already exists
        if (getCookie2(cname) != "") deleteCookie2(cname);
        // Add or replace cookie
        var exdate=new Date();
        // Set expire date to 20 years from now
        exdate.setDate(exdate.getDate() + 20*365);
        cvalue = cvalue+"; expires="+exdate.toUTCString();
        document.cookie = cname + "=" + cvalue;
    }
    catch(e){
        alert("Warning: Saving user preferences and bookmarks requires non-private browser mode. Please set this mode and try again. Also, this may be caused by your browser not accepting cookies. See Help/Troubleshooting/Losing Your Saved Preferences for help on how to set your browser to accept cookies.","Warning");
    }
  }

  //**************************
	// Show/Hide loading image
	//**************************
	function showLoading() {
		document.getElementById("loadingImg").style.display = "block"; 
	}
	function hideLoading() {
		document.getElementById("loadingImg").style.display = "none";          
	}
	// end show loading image functions

    function copyText(id){
        // Get the text field
        var copyText = document.getElementById(id);
      
        copyText.style.backgroundColor = "var(--brand)";
        // Select the text field
        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices
      
         // Copy the text inside the text field
        navigator.clipboard.writeText(copyText.value);
      
        // Alert the copied text
        //document.getElementById("copyNote").innerHTML = "copied";
        setTimeout(function(){
          copyText.style.backgroundColor = "light-dark(rgba(239, 239, 239, 0.3), rgba(59, 59, 59, 0.3))";
            //document.getElementById("copyNote").innerHTML = "";
        }, 1000);

    }
    
    //*****************
    // Projection
    // ***************/
  async function projectPoint(pt, div){
    require(["esri/geometry/support/webMercatorUtils", "esri/geometry/SpatialReference", "esri/rest/support/ProjectParameters", "esri/rest/geometryService"],
    function(webMercatorUtils, SpatialReference, ProjectParameters, GeometryService) {
        // Project point pt to user selected projection from Settings
        var geoPt;

        var myPrj = settings.XYProjection; // user defined projection. Used to be "settings_xycoords_combo"
        if (myPrj === "mercator") {
          if (div && div.value != undefined){
            //div.value = pt.y.toFixed(5) + " N, " + pt.x.toFixed(5) + " W";
            div.value = pt.y.toFixed(5) + ", " + pt.x.toFixed(5);
            div.setAttribute("size",div.value.length);
          }
          else if (div)
              div.innerHTML = pt.y.toFixed(5) + ", " + pt.x.toFixed(5);
          else alert("Warning", "Undefined DOM node id="+div);
        }
        else if (myPrj === "dd") {
            geoPt = webMercatorUtils.webMercatorToGeographic(pt);
            if (div && div.value != undefined){
                div.value = geoPt.y.toFixed(5) + ", " + geoPt.x.toFixed(5);
                div.setAttribute("size",div.value.length);
            }
            else if (div)
                div.innerHTML = geoPt.y.toFixed(5) + ", " + geoPt.x.toFixed(5);
            else alert("Warning", "Undefined DOM node id="+div);			
        } else if (myPrj === "dms") {
            geoPt = mappoint_to_dms(pt, true);
            if (div && div.value != undefined){
                div.value = geoPt[0] + ", " + geoPt[1];
                div.setAttribute("size",div.value.length);
            }
            else if (div)
                div.innerHTML =  geoPt[0] + ", " + geoPt[1];
            else alert("Warning", "Undefined DOM node id="+div);
        } else if (myPrj === "dm") {
            geoPt = mappoint_to_dm(pt, true);
            if (div && div.value != undefined){
                div.value = geoPt[0] + ", " + geoPt[1];
                div.setAttribute("size",div.value.length);
            }
            else if (div)
                div.innerHTML = geoPt[0] + ", " + geoPt[1];
            else alert("Warning", "Undefined DOM node id="+div);
        } else { // utm
          if (myPrj !== "32613") alert("Unknown projection in SettingsWidget.xml file of "+myPrj+". dd or 32613 are the only allowed projections. Change this in js/identify.js.","Data Error");
            var outSR = new SpatialReference(Number(myPrj));
            // converts point to selected projection
            var params = new ProjectParameters({
                outSpatialReference: outSR,
                geometries: [pt]
            });
            GeometryService.project(geometryService,params).then( (feature) => {
                /*var units;
                if (outSR.wkid == 32612) units = "WGS84 UTM Zone 12N";
                else if (outSR.wkid == 32613) units = "WGS84 UTM Zone 13N";
                else if (outSR.wkid == 26912) units = "NAD83 UTM Zone 12N";
                else if (outSR.wkid == 26913) units = "NAD83 UTM Zone 13N";
                else if (outSR.wkid == 26712) units = "NAD27 UTM Zone 12N";
                else if (outSR.wkid == 26713) units = "NAD27 UTM Zone 13N";
                else units = "unknown units: "+outSR.wkid+" in utilFuncs.js projectPoint()";*/
                if (div && div.value != undefined){
                    div.value = feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0);
                    div.setAttribute("size",div.value.length);
                }
                else if (div)
                    div.innerHTML = feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0);
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
  /*async function projectPoint(pt){
    // returns projected point
    require(["esri/geometry/support/webMercatorUtils", "esri/geometry/SpatialReference", "esri/rest/support/ProjectParameters", "esri/rest/geometryService"],
    function(webMercatorUtils, SpatialReference, ProjectParameters, GeometryService) {
        // Project point pt to user selected projection from Settings
        var geoPt;

        var myPrj = document.getElementById("settings_xycoords_combo").value; // user defined projection
        if (myPrj === "dd") {
            geoPt = webMercatorUtils.webMercatorToGeographic(pt);
            return geoPt.y.toFixed(5) + " N, " + geoPt.x.toFixed(5) + " W";	
        } else if (myPrj === "dms") {
            geoPt = mappoint_to_dms(pt, true);
            return geoPt[0] + " N, " + geoPt[1] + " W";
        } else if (myPrj === "dm") {
            geoPt = mappoint_to_dm(pt, true);
            return geoPt[0] + " N, " + geoPt[1] + " W";
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
                return feature[0].x.toFixed(0) + ", " + feature[0].y.toFixed(0) + " " + units;
            }).catch ( (err) => {
                if (err.details)
                    alert("Problem projecting point. " + err.message + " " + err.details[0], "Warning");
                else
                    alert("Problem projecting point. " + err.message, "Warning");					
            });
        }
    });
}*/

// change text to title case
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

//*************
//  Drawing   
//*************/
function addTempLabel(point, label, fontSize, shouldFade) {
    // Add text at a point. Fade out after 10 seconds.
    // point: Point, label: text, fontSize: int
    // if point is a polygon use the centroid
    // shouldFade: should it fade away?
    require(["esri/symbols/TextSymbol", "esri/Graphic"], function (TextSymbol, Graphic) {
      label = label.replace(/''/g, "'");
      let textSymbol = new TextSymbol({
        text: label,
        color: "black",//[255, 255, 255],
        haloColor: [255, 255, 153, 1.0],//[1, 68, 33],
        haloSize: "2px",
        yoffset: -35,//-23,//-1 * (fontSize) - 3,
        font: {
          family: "Arial Unicode MS",
          size: fontSize
        }
      });
      if (point.geometry && point.geometry.type === "polygon")
        point = point.geometry.centroid;
      let pointText = new Graphic({
        geometry: point,
        symbol: textSymbol
      });
      view.graphics.add(pointText);
      let fade = 1.0; // starting transparency
      let width = pointText.symbol.haloSize / 4;
      // should fade out?
      if (shouldFade) {
        setTimeout(function () {
          let tim = setInterval(function () {
            fade = fade - 0.25;
            pointText.symbol.color.a = fade;
            pointText.symbol.haloSize = pointText.symbol.haloSize - width;
            pointText.symbol.haloColor.a = fade;
            if (fade == 0) {
              clearTimeout(tim);
              view.graphics.remove(pointText);
            }
          }, 2000);
        }, 5000);
      }
    });
  }
  function addTempPoint(pt, shouldFade) {
    // pt: Point
    // add point and remove it in 10 seconds
    // if noFade is passed in do not fade
    require(["esri/symbols/PictureMarkerSymbol", "esri/Graphic"], function (PictureMarkerSymbol, Graphic) {
      var pinImg;
      if (document.getElementsByTagName("body")[0].className.indexOf("green")>-1) pinImg = "green-pin.png";
      else if (document.getElementsByTagName("body")[0].className.indexOf("blue")>-1) pinImg = "blue-pin.png";
      else if (document.getElementsByTagName("body")[0].className.indexOf("orange")>-1) pinImg = "orange-pin.png";
      else alert("Missing picture marker symbol assets/images/color-pin.png where color is the color-theme specified in the body tag of index.html.","Error");
      const symbol = {
        type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
        url: "./assets/images/"+pinImg, // svg does not work in FireFox!!!!!
        size: 24,
        width: 24,
        height: 24,
        xoffset: 0,
        yoffset: -12
      };
      let point = new Graphic({
        geometry: pt,
        symbol: symbol
      });
      view.graphics.add(point);
      if (shouldFade == undefined || shouldFade) {
        setTimeout(function () {
          view.graphics.remove(point);
        }, 13000);
      }
    });
  }
  function addHighlightPoint(pt){
    require (["esri/Graphic","esri/geometry/Circle"],(Graphic,Circle) => {
        let r = 2;
        if (view.scale > 24000) r = .5;
        else if (view.scale <= 24000) r = .25;

        const circle = new Circle({
            center: pt.geometry,
            geodesic: false,
            numberOfPoints: 100,
            radius: r,
            radiusUnit: "kilometers"
          });
        let point = new Graphic({
            geometry: circle,
            symbol: {
                type: "simple-fill",
                color: "#d4dbbe" + "9C", // 40% tranparency
                style: "solid",
                outline: {
                  width: 1,
                  color: "#d4dbbe"
                }
            }
        });
        view.graphics.add(point);
    });
  }
  const polySymbol = {
    type: "simple-fill",
    color: "#d4dbbe" + "9C", // 40% tranparency
    style: "solid",
    outline: {  // autocasts as new SimpleLineSymbol()
      color: "#778743",
      width: 2
    }
  }
  function addTempPolygon(feature, shouldFade) {
    // add polygon outline and remove it in 10 seconds
    // if shouldFade is false do not fade
    // if shouldFade is not passed or is true it fades
    require(["esri/geometry/Polygon", "esri/Graphic"],
      function (Polygon, Graphic) {

        const polygon = new Polygon({
          rings: feature.geometry.rings,
          spatialReference: feature.geometry.spatialReference
        });
        const poly = new Graphic({
          geometry: polygon,
          symbol: polySymbol
        });
        view.graphics.add(poly);
        if (shouldFade == undefined || shouldFade) {
          setTimeout(function () {
            view.graphics.remove(poly);
          }, 13000);
        }
      });
  }
  function addTempLine(feature,shouldFade){
    // add polygon outline and remove it in 10 seconds
    // if noFade is passed in do not fade
    // called by Identify highlight
    require(["esri/geometry/Polyline", "esri/Graphic"],
        function (Polyline, Graphic) {
        const lineSymbol = {
            type: "simple-line",  // autocasts as SimpleLineSymbol()
            color: "#778743"+"9C", // 40% tranparency
            width: 4,
            style: "solid"
        }
        
        const line = new Polyline({
            paths: feature.geometry.paths,
            spatialReference: feature.geometry.spatialReference
        });
        const lineGraphic = new Graphic({
            geometry: line,
            symbol: lineSymbol
        });
        view.graphics.add(lineGraphic);
        if (shouldFade == undefined || shouldFade){
            setTimeout(function(){
                view.graphics.remove(lineGraphic);
            },13000);
        }
    });
  }
  
  function addLabel(point, label, graphicsLayer, fontsize) {
      // Adds a label to the map at the given point, fontsize = "11pt"
      // graphicsName is the name for this graphics layer. For example: searchgraphics or drawgraphics
      // graphicsCounter is the searchGraphicsCounter or drawGraphicsCounter so it can erase the last added layer
      // graphicsArr is an array of graphics names
      require(["esri/Graphic", "esri/symbols/Font", "esri/symbols/TextSymbol",
            "dojo/_base/Color"], function (
            Graphic, Font, TextSymbol, Color) {
        label = label.replace("/n"," "); // replace carriage returns with space for flex bookmarks
        
        const labelClass = {
            // autocasts as new LabelClass()
            symbol: {
              type: "text", // autocasts as new TextSymbol()
              color: "black",
              haloColor: [255,255,153,1.0],
                haloSize: "2px",
              yoffset: -23,
              font: {
                //autocast as new Font()
                family: "Arial Bold",
                size: fontsize
              }
            },
            labelPlacement: "always-horizontal", //below-center for points
            text: label,
            labelExpressionInfo: {
                expression: "$feature.NAME" //"$feature.Team + TextFormatting.NewLine + $feature.Division"
            }
        };
        // TODO needs to be featureservice to add labels!!!!
        graphicsLayer.labelingInfo=[labelClass];

        /*var yellow = new Color([255,255,153,1.0]);
        var font = new Font(
            fontsize,
            Font.STYLE_NORMAL, 
            Font.VARIANT_NORMAL,
            Font.WEIGHT_BOLDER,
            "Helvetica"
        );
        
        var text = new TextSymbol(label,font,new Color("black"));
        text.setOffset(0,-23);
        var highlight1 = new TextSymbol(label,font,yellow);
        highlight1.setOffset(1,-25);
        var highlight2 = new TextSymbol(label,font,yellow);
        highlight2.setOffset(0,-24);
        var highlight3 = new TextSymbol(label,font,yellow);
        highlight3.setOffset(0,-22);
        var highlight4 = new TextSymbol(label,font,yellow);
        highlight4.setOffset(-1,-21);
        var highlight5 = new TextSymbol(label,font,yellow);
        highlight5.setOffset(2,-23);
        var highlight6 = new TextSymbol(label,font,yellow);
        highlight6.setOffset(-2,-23);
        
        graphicsLayer.add(new Graphic(point.geometry, highlight1));
        graphicsLayer.add(new Graphic(point.geometry, highlight2));
        graphicsLayer.add(new Graphic(point.geometry, highlight3));
        graphicsLayer.add(new Graphic(point.geometry, highlight4));
        graphicsLayer.add(new Graphic(point.geometry, highlight5));
        graphicsLayer.add(new Graphic(point.geometry, highlight6));
        graphicsLayer.add(new Graphic(point.geometry, text));*/
        //map.add(graphicsLayer);
        //graphicsLayer.refresh();
    });
}

//************
	// Map Scale
	//************
	function showMapScale(scale) {
		const list = document.getElementById("mapscaleList");
    if(!list)return;
		var done = false;
		for (var i=0; i<list.length-2;i++){
			if (list[i+1].value < scale) {
				list.selectedIndex = i;
				done = true;
				break;
			} 
		}
		if(!done) list.selectedIndex = list.length-1;
	}
	function setMapScale() {
    const list = document.getElementById("mapscaleList");
    if(!list)return;
		view.scale = list[list.selectedIndex].value;
		if (typeof ga === 'function')ga('send', 'event', "mapscale", "click", "Map Scale", "1");
		if (typeof gtag === 'function')gtag('event','widget_click',{'widget_name': 'Map Scale'});
	}

//**************
	// Coordinates 
	//**************
	function handleCoordinate(label) {
		// Zoom to and label a coordinate, Called from &place on URL
		require(["esri/geometry/SpatialReference", "esri/rest/geometryService", "esri/rest/support/ProjectParameters", "esri/geometry/Point"], 
      function (SpatialReference, GeometryService, ProjectParameters, Point) {
			var point;
			var inSR,
			pointX,
			pointY;
			const lodLevel = 24000; //10;
			if (label.indexOf(":") > 0) {
				var pos,
				pos2;
				pointX = label.substring(0, label.indexOf(","));
				pointY = label.substring(label.indexOf(",") + 1, label.length);
				pos = pointX.indexOf(":");
				var degX = pointX.substring(0, pos);
				var secX = 0;
				var minX;
				pos2 = pointX.substring(pos + 1).indexOf(":")
				if (pos2 > -1) {
					minX = pointX.substr(pos + 1, pos2);
					secX = pointX.substring(pos + pos2 + 2);
				} else
					minX = pointX.substring(pos + 1);
				// if degX is the longitude value and it is negative subtract the numbers 11/6/20
				if (degX < 0)
					pointX = Number(degX) - Number(minX) / 60 - Number(secX) / 3600;
				else
					pointX = Number(degX) + Number(minX) / 60 + Number(secX) / 3600;
				if (pointX >= 100 && pointX <= 110)
					pointX = pointX * -1;
				pos = pointY.indexOf(":");
				var degY = pointY.substring(0, pos);
				var secY = 0;
				var minY;
				pos2 = pointY.substring(pos + 1).indexOf(":")
				if (pos2 > -1) {
					minY = pointY.substr(pos + 1, pos2);
					secY = pointY.substring(pos + pos2 + 2);
				} else
					minY = pointY.substring(pos + 1);
				// if degY is the longitude value and it is negative subtract the numbers 11/6/20
				if (degY < 0)
					pointY = Number(degY) - Number(minY) / 60 - Number(secY) / 3600;
				else
					pointY = Number(degY) + Number(minY) / 60 + Number(secY) / 3600;
				if (pointY >= 100 && pointY <= 110)
					pointY = pointY * -1;
				label = degX + '° ' + minX + '\' ';
				if (secX > 0)
					label += secX + '"';
				label += ", " + degY + '° ' + minY + '\' ';
				if (secY > 0)
					label += secY + '"';
			} else {
				pointX = Number(label.substring(0, label.indexOf(",")));
				pointY = Number(label.substring(label.indexOf(",") + 1, label.length));
			}
			if (((pointY >= -110 && pointY <= -100) || (pointY >= 100 && pointY <= 110)) && (pointX >= 35 && pointX <= 42)) {
				var pos = label.indexOf(",");
				label = label.substr(0, pos) + " N" + label.substr(pos) + " W";
				if (pointY > 0)
					pointY = pointY * -1;
				inSR = new SpatialReference(4326);
				point = new Point(pointY, pointX, inSR);
				var params = new ProjectParameters({
					outSpatialReference: new SpatialReference(wkid),
					geometries: [point]
				});
				GeometryService.project(geometryService,params).then( (feature) => {
					view.goTo({
						target: feature[0],
						scale: lodLevel
						//zoom: lodLevel
					});
					addTempPoint(feature[0]);
					addTempLabel(feature[0],label,11,true);
				}).catch ( (err) => {
					alert("Error projecting point. " + err.message, "Warning");
				});
				return;
			} else if (((pointX >= -110 && pointX <= -100) || (pointX >= 100 && pointX <= 110)) && (pointY >= 35 && pointY <= 42)) {
				var pos = label.indexOf(",");
				label = label.substr(0, pos) + " W" + label.substr(pos) + " N";
				if (pointX > 0)
					pointX = pointX * -1;
				inSR = new SpatialReference(4326);
				point = new Point(pointX, pointY, inSR);
				var params = new ProjectParameters({
					outSpatialReference: new SpatialReference(wkid),
					geometries: [point]
				});
				GeometryService.project(geometryService,params).then( (feature) => {
					view.goTo({
						target: feature[0],
						scale: lodLevel
						//zoom: lodLevel
					});
					addTempPoint(feature[0]);
					addTempLabel(feature[0],label,11,true);
				}).catch( (err)=> {
					alert("Error projecting point. " + err.message, "Warning");
				});
				return;
			} else if ((pointX >= 133000 && pointX <= 1300000) && (pointY >= 4095000 && pointY <= 4580000)) {
				//if (!settings)
					inSR = new SpatialReference(26913);
				//else
				//	inSR = new SpatialReference(Number(settings.XYProjection));
				point = new Point(pointX, pointY, inSR);
				var params = new ProjectParameters({
					outSpatialReference: new SpatialReference(wkid),
					geometries: [point]
				});
				GeometryService.project(geometryService,params).then( (feature) => {
					view.goTo({
						target: feature[0],
						scale: lodLevel
						//zoom: lodLevel
					});
					addTempPoint(feature[0]);
					addTempLabel(feature[0],label,11,true);
				}).catch ( (err) => {
					alert("Error projecting point. " + err.message, "Warning");
				});
				return;
			} else {
				alert("<p>Warning:  This point is not in Colorado, or it is not in one of the supported projections of:</p><ul>" + "<li>Lat, Long decimal degrees (e.g. 39.2, 103.5032 or 39.2, -103.5032)</li>" + "<li>Long, Lat decimal degrees (e.g. -104.345, 39.012 or 104.345, 39.012)</li>" + "<li>Lat, Long degrees, decimal minutes (e.g. 39:3.5,104:30.223)</li>" + "<li>Lat, Long degrees, minutes, seconds (e.g. 39:3:30,104:30:1.44)</li>" + "<li>Long, Lat degrees, decimal minutes (e.g. 104:30.45,39:3.5)</li>" + "<li>Lat, Long degrees, decimal minutes (e.g. 39:3.5,104:30.45)</li>" + "<li>NAD83 UTM (e.g. 1020042,  4333793)</li>" + "<li>NAD27 UTM, or WGS84 UTM.</li></ul>Use a comma to separate the coordinates.", "Warning");
				hideLoading();
				return;
			}
		});
	}
	
//************************
//     Array Functions
//************************
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Nov","Dec"];
	function sortArrayOfObj(item) {
	// Sort an array of objects by field, ascending
	// Example: 
	// arr = [{city: 'Fort Collins', county: 'Larimer'},
	//        {city: 'Boulder', county: 'Boulder'}]
	// To sort by city use: arr.sort(sortArrOfOj('city'));
		return function (a,b) {
			// if GMU### sort numerically 1-9-23 add toString, failed when was a number
			if (a[item] && a[item].toString().substr(0,4) == "GMU ")
				return parseInt(a[item].substring(4)) - parseInt(b[item].substring(4));
			else if (!isNaN(a[item]))
				return a[item] - b[item];
			// Sort by full month name
			else if (months.indexOf(a[item])>-1 && months.indexOf(b[item]>-1))
				return (months.indexOf(a[item]) < months.indexOf(b[item])) ? -1 : (months.indexOf(a[item]) > months.indexOf(b[item])) ? 1: 0;
			// Sort by abbreviated month name
			else if (mo.indexOf(a[item])>-1 && mo.indexOf(b[item]>-1))
				return (mo.indexOf(a[item]) < mo.indexOf(b[item])) ? -1 : (mo.indexOf(a[item]) > mo.indexOf(b[item])) ? 1: 0;
			else
				return (a[item] < b[item]) ? -1 : (a[item] > b[item]) ? 1: 0;
		};
	}
	function descendingSortArrayOfObj(item) {
		// Sort an array of objects by field, descending
		// Example: 
		// arr = [{city: 'Fort Collins', county: 'Larimer'},
		//        {city: 'Boulder', county: 'Boulder'}]
		// To sort by city use: arr.sort(sortArrOfOj('city'));
		return function (a,b) {
			// if GMU### sort numerically 1-9-23 add toString, failed when was a number
			if (isNaN(a[item]) && a[item].toString().substr(0,4) == "GMU ")
				return parseInt(b[item].substring(4)) - parseInt(a[item].substring(4));
			else if (!isNaN(a[item]))
				return b[item] - a[item];
			// Sort by full month name
			else if (months.indexOf(a[item])>-1 && months.indexOf(b[item]>-1))
				return (months.indexOf(a[item]) > months.indexOf(b[item])) ? -1 : (months.indexOf(a[item]) < months.indexOf(b[item])) ? 1: 0;
			// Sort by abbreviated month name
			else if (mo.indexOf(a[item])>-1 && mo.indexOf(b[item]>-1))
				return (mo.indexOf(a[item]) > mo.indexOf(b[item])) ? -1 : (mo.indexOf(a[item]) < mo.indexOf(b[item])) ? 1: 0;
			else
				return (a[item] > b[item]) ? -1 : (a[item] < b[item]) ? 1: 0;
		};
	}
	function sortMultipleArryOfObj() {
	// Ascending sort of an array of objects by multiple fields
	// Example:
	// // arr = [{city: 'Fort Collins', county: 'Larimer'},
	//        {city: 'Boulder', county: 'Boulder'}]
	// arr.sort(sortMultipleArryOfObj("county","city",...));
		/*
		 * save the arguments object as it will be overwritten
		 * note that arguments object is an array-like object
		 * consisting of the names of the properties to sort by
		 */
		var props = arguments;
		if (arguments[0].constructor === Array) props = arguments[0];
		return function (obj1, obj2) {
			var i = 0, result = 0, numberOfProperties = props.length;
			/* try getting a different result from 0 (equal)
			 * as long as we have extra properties to compare
			 */
			while(result === 0 && i < numberOfProperties) {
				result = sortArrayOfObj(props[i])(obj1, obj2);
				i++;
			}
			return result;
		};
	}
	function descendingSortMultipleArryOfObj() {
		// Descending sort of an array of objects by multiple fields
		// Example:
		// // arr = [{city: 'Fort Collins', county: 'Larimer'},
		//        {city: 'Boulder', county: 'Boulder'}]
		// arr.sort(descendingSortMultipleArryOfObj("county","city",...));
		/*
		 * save the arguments object as it will be overwritten
		 * note that arguments object is an array-like object
		 * consisting of the names of the properties to sort by
		 */
		var props = arguments;
		if (arguments[0].constructor === Array) props = arguments[0];
		return function (obj1, obj2) {
			var i = 0, result = 0, numberOfProperties = props.length;
			/* try getting a different result from 0 (equal)
			 * as long as we have extra properties to compare
			 */
			while(result === 0 && i < numberOfProperties) {
				result = descendingSortArrayOfObj(props[i])(obj1, obj2);
				i++;
			}
			return result;
		};
	}
	Array.prototype.moveUp = function(value, by) {
		// Rearrange items in an array. Move up so many positions (by).
		// For example:
		//   var street = items[1];
		//   items.moveUp(street,1); // move up by 1
		var index = this.indexOf(value),     
			newPos = index - (by || 1);
		
		if(index === -1) 
			throw new Error("Element not found in array");
		
		if(newPos < 0) 
			newPos = 0;
			
		this.splice(index,1);
		this.splice(newPos,0,value);
	};	
	Array.prototype.moveTo = function(value, newPos) {
		// Rearrange items in an array. Move to new position.
		// For example:
		//   var street = items[1];
		//   items.moveTo(street,0); // move to position 0
		var index = this.indexOf(value);    
		
		if(index === -1) 
			throw new Error("Element not found in array");
		
		if(newPos < 0) 
			newPos = 0;
			
		this.splice(index,1);
		this.splice(newPos,0,value);
	};

	// detect mobile
	function detectmob() { 
	//  || navigator.userAgent.match(/iPad/i)
	 if( navigator.userAgent.match(/Android/i) ||
	 	 navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i)
	 ){
		return true;
	  }
	 else {
		return false;
	  }
	}