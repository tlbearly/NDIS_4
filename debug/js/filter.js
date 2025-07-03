function myFilter(title,btn){
    // filter data displayed by selecting different buttons
    // for example: Family Friendly Fishing Pts
    // Title beside the the filter button
    document.getElementById("filterTitle").innerHTML = title;
    let filterShowing = document.createElement("span");
    filterShowing.innerHTML = "Showing: "+ title;
    filterShowing.style.position = "absolute";
    filterShowing.style.top = "80px";
    filterShowing.style.left= "130px";
    filterShowing.style.width= "200px";
    filterShowing.style.height= "40px";
    filterShowing.style.lineHeight= "1em";
    filterShowing.style.wordBreak= "break-word";
    filterShowing.style.display= "flex";
    filterShowing.style.alignItems= "center";
    view.ui.add(filterShowing, "top-left");

    let filterBtn = document.createElement("button");
    filterBtn.id = "filterBtn";
    filterBtn.setAttribute("onmouseenter","openFilter()");
    filterBtn.setAttribute("aria-busy","false");
    filterBtn.setAttribute("aria-label",title);
    filterBtn.setAttribute("title",title);
    filterBtn.setAttribute("aria-live","polite");
    filterBtn.className="esri-widget--button";
    filterBtn.style.border="1px solid #6e6e6e77";
    filterBtn.type="button";
    if (window.innerWidth > 768) {
        filterBtn.style.position = "absolute";
        filterBtn.style.left = "83px"; //330px";
        filterBtn.style.top = "80px";//"38px";
        document.getElementById("titleDiv").style.height = "120px";
        if (document.getElementsByClassName("esri-search")[0])
            document.getElementsByClassName("esri-search")[0].style.top = "-54px"; // also set in mySearch.js
    }else {
        filterBtn.style.position = "absolute";
        filterBtn.style.left = "7px";//243px";
        filterBtn.style.top = "86px";//39px";//-51px";
        document.getElementById("titleDiv").style.height = "120px";
        if (document.getElementsByClassName("esri-search")[0])
            document.getElementsByClassName("esri-search")[0].style.top = "-50px";
    }
    let filterIcon = document.createElement("calcite-icon");
    filterIcon.className="icon,icon--start";
    filterIcon.setAttribute("aria-hidden","true");
    filterIcon.scale="s";
    filterIcon.icon="filter";
    filterBtn.appendChild(filterIcon);
    filterBtn.addEventListener("click",function(){
        document.getElementById("filterPopup").style.display = "block";
    });

        // add buttons to filter data
    
        //btnTitle = ["All","Family friendly","More remote fly fishing","Ice fishing","Accessible area","Stocked with 10\" catchables","Motor boats"];
        //btnIcon = ["ptmedred.png","ptmedgray.png","ptmedgreen.png","ptmedblue.png","ptlgred.png","ptlggreen.png","ptlggray.png"];
        //btnActive = [true,false,false,false,false,false,false];
        //btnLayerTitle = ["Fishing Info","Fishing Info","Fishing Info","Fishing Info","Fishing Info","Fishing Info","Fishing Info"];
        //btnLayerId = ["3,5,7","3,5,7","3,5,7","3,5,7","3,5,7","3,5,7","3,5,7"]
        //btnFilter = ["","OPP_FAMILY = 'Yes'","OPP_RUSTIC = 'Yes'","OPP_ICE = 'Yes'","HANDI_PIER = 'Yes'","STOCKED = 'Catchable trout'","BOATING = 'Motor boats'"]
        //let btn=[];
        for (var i=0; i<btn.length; i++){
            /*btn.push(document.createElement("button"));
            btn[i].setAttribute("aria-busy","false");
            btn[i].setAttribute("aria-label",btnTitle[i]);
            btn[i].setAttribute("title",btnTitle[i]);
            btn[i].setAttribute("aria-live","polite");
             
            btn[i].icon = "./assets/images/"+btnIcon[i];
            btn[i].title = btnTitle[i];
            btn[i].active = btnActive[i];
            btn[i].layer = null;
            btn[i].layerTitle = btnLayerTitle[i];
            if (btnLayerTitle[i] === undefined) alert("Missing filter layer title for button"+(i+1)+" in config.xml extra_widgets, widget name=filter");
            btn[i].expression = btnFilter[i];
            btn[i].className="esri-widget--button";
            btn[i].className="esri-widget--button esri-interactive";
            btn[i].style.margin="2px 0";
            btn[i].style.padding="0 2px";
            btn[i].style.width="270px";
            btn[i].style.justifyContent="normal";
            btn[i].style.border="none";
            //btn[i].style.backgroundColor = "white";
            
            btn[i].type="button";*/
            if (btn[i].active){
                btn[i].className += " active";
                btn[i].innerHTML="<img src='"+btn[i].icon+"' style='width:24px;'> <span style='text-align:left;margin-right:2px;'>"+btn[i].title+"</span><span class='check'></span>";
                btn[i].style.fontWeight=500;
            }else{
                btn[i].style.fontWeight=400;
                btn[i].innerHTML="<img src='"+btn[i].icon+"' style='width:24px;'> <span style='text-align:left;margin-right:2px;'>"+btn[i].title+"</span>";
            }
            document.getElementById("filterContent").appendChild(btn[i]);
            
            btn[i].addEventListener("click",function(){
                // make button active
                if (!this.active){
                    // make all buttons inactive
                    for (var j=0; j<btn.length; j++){
                        btn[j].className="esri-widget--button esri-interactive";
                        btn[j].active = false;
                        if (btn[j].layer)
                            btn[j].layer.definitionExpression = "";
                        btn[j].style.fontWeight=400;
                        btn[j].innerHTML="<img src='"+btn[j].icon+"' style='width:24px;'> <span style='text-align:left;margin-right:2px;'>"+btn[j].title+"</span>";
                    }
                    // find the given layer                    
                    const layerTitle = this.layerTitle;
                    let layerIds = [3,5,7];
                    
                    if (!this.layer){
                        this.layer = [];
                        let theLayer = map.allLayers.find(function(layer) {
                            if (layer.type !== "group")
                                return layer.title === layerTitle;
                            else return false;
                        });
                        // search for the ID
                        for (var k=0; k<layerIds.length; k++){
                            var found = null;
                            for(var i=0; i<theLayer.allSublayers.items.length; i++){
                                if (theLayer.allSublayers.items[i].id === layerIds[k]){
                                    found = theLayer.allSublayers.items[i];
                                    break;
                                }
                            }
                            this.layer.push(found);
                        }
                    }
                    for (var i=0; i<this.layer.length; i++)
                        this.layer[i].definitionExpression = this.expression;
                    this.className=this.className+" active";
                    this.active = true;
                    this.style.fontWeight=500;
                    this.innerHTML="<img src='"+this.icon+"' style='width:24px;'> <span style='text-align:left;margin-right:2px;'>"+this.title+"</span><span class='check'></span>";
                }

                // Make buton inactive
                else{
                    this.className="esri-widget--button esri-interactive";
                    this.active = false;
                    for (var i=0; i<this.layer.length; i++)
                        this.layer[i].definitionExpression = this.expression;
                    this.style.fontWeight=400;
                    this.innerHTML="<img src='"+this.icon+"' style='width:24px;'> <span style='text-align:left;margin-right:2px;'>"+this.title+"</span>";
                    // make first active
                    btn[0].className=btn[0].className+" active";
                    btn[0].active = true;
                    btn[0].style.fontWeight=500;


                    // TODO move to function
                    // find the given layer                    
                    const layerTitle = btn[0].layerTitle;
                    let layerIds = [3,5,7];
                    
                    if (!btn[0].layer){
                        btn[0].layer = [];
                        let theLayer = map.allLayers.find(function(layer) {
                            if (layer.type !== "group")
                                return layer.title === layerTitle;
                            else return false;
                        });
                        // search for the ID
                        for (var k=0; k<layerIds.length; k++){
                            var found = null;
                            for(var i=0; i<theLayer.allSublayers.items.length; i++){
                                if (theLayer.allSublayers.items[i].id === layerIds[k]){
                                    found = theLayer.allSublayers.items[i];
                                    break;
                                }
                            }
                            btn[0].layer.push(found);
                        }
                    }

                    for (var i=0; i<btn[0].layer.length; i++)
                        btn[0].layer[i].definitionExpression = btn[0].expression;
                    btn[0].innerHTML="<img src='"+btn[0].icon+"' style='width:24px;'> <span style='text-align:left;margin-right:2px;'>"+btn[0].title+"</span><span class='check'></span>";
                }
            });
        }



        view.ui.add(filterBtn, "top-left");

}
function closeFilter(){
    document.getElementById("filterPopup").style.display = "none";
}
function openFilter(){
    document.getElementById("filterPopup").style.display = "block";
}