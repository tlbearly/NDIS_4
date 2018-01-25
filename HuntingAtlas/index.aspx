<!DOCTYPE html>
<html>
 <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<script type="text/javascript">
	// detect mobile
	function detectmob() { 
		// Add this below for ipad to use mobile version:  || navigator.userAgent.match(/iPad/i)
		if( navigator.userAgent.match(/Android/i)
			|| navigator.userAgent.match(/webOS/i)
			|| navigator.userAgent.match(/iPhone/i)
			|| navigator.userAgent.match(/iPod/i)
			|| navigator.userAgent.match(/BlackBerry/i)
			|| navigator.userAgent.match(/Windows Phone/i)
		){
			return true;
		}
		else {
			return false;
		}
	}
	</script>
</head>
<body>
<noscript>JavaScript must be enabled to run this site.  Here are the<a href="http://www.enable-javascript.com/" target="_blank">
	instructions for how to enable JavaScript in your web browser</a></noscript>
<script type="text/javascript">
	// **************************************
	//   Set the application directory name 
	// **************************************
	var app = "HuntingAtlas";
	
	// Add url name/value pairs
	var name_value = "?app="+app;
	name_value += document.location.search[0] === "?" ? "&"+ document.location.search.substr(1) : "";
	// Dectect if mobile
	if (detectmob())
		location.href = "../indexM.html"+name_value;
	else
		location.href = "../index.html"+name_value;
</script>
</body>
</html>