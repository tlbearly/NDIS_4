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
  