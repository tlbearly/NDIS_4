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

  async function projectPoint(pt, div){
    require(["esri/geometry/support/webMercatorUtils", "esri/geometry/SpatialReference", "esri/rest/support/ProjectParameters", "esri/rest/geometryService"],
    function(webMercatorUtils, SpatialReference, ProjectParameters, GeometryService) {
        // Project point pt to user selected projection from Settings
        var geoPt;

        var myPrj = document.getElementById("xycoords_combo").value; // user defined projection. Used to be "settings_xycoords_combo"
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
  