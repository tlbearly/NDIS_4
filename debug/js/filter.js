function makeDropdownActive(selectedBtn){
        // make all buttons inactive
    var btn = document.getElementsByName("filterBtn");
    for(var i=0; i<btn.length; i++){
        if (i!=selectedBtn){
            btn[i].className="esri-widget--button esri-interactive";
            btn[i].active = false;
            if (btn[i].layer)
                btn[i].layer.definitionExpression = "";
            btn[i].style.fontWeight=400;
        }else{
            // set active
            // find the given layer
            if (!btn[i].layer){
                btn[i].layer = findLayer(btn[i].layerTitle,btn[i].layerId);
            }
            
            btn[i].className=btn[i].className+" active";
            btn[i].active = true;
            btn[i].style.fontWeight=500;
           
            // update title by filter button
            var label = document.getElementById("select_"+btn[i].title).selectedOptions[0].label;
            var expression = document.getElementById("select_"+btn[i].title).selectedOptions[0].value;
            document.getElementById("filterTitle").innerHTML = "<strong>Showing: </strong>"+ btn[i].title+" "+label;
            document.getElementById("filterIcon").src = btn[i].icon;
            for (var j=0; j<btn[i].layer.length; j++)
                btn[i].layer[j].definitionExpression = expression;
            // close on mobile
            if (window.innerWidth <= 768)closeFilter();
        }
    }
}
function myFilter(title,icon,btn){
    
    function makeAllInactive(){
        // make all buttons inactive
        for (var j=0; j<btn.length; j++){
            btn[j].className="esri-widget--button esri-interactive";
            btn[j].active = false;
            if (btn[j].layer)
                btn[j].layer.definitionExpression = "";
            btn[j].style.fontWeight=400;
        }
    }
    
    // filter data displayed by selecting different buttons
    // for example: Family Friendly Fishing Pts
    // Title beside the the filter button
    let filterWidget = document.createElement("div");
    filterWidget.style.position="absolute";
    filterWidget.id="Filter_Widget"
    filterWidget.style.top="83px";
    filterWidget.style.zIndex="0";
    filterWidget.style.borderTopRightRadius="0";
    filterWidget.style.borderTopLeftRadius="0";
    if (window.innerWidth <= 768)filterWidget.style.width="244px";
    else filterWidget.style.width="320px";
    filterWidget.style.display="flex";
    filterWidget.style.backgroundColor="var(--background)";
    filterWidget.style.padding="5px";
    filterWidget.style.borderTop="none";
    document.getElementById("titleDiv").style.borderBottomRightRadius="0";
    document.getElementById("titleDiv").style.borderBottomLeftRadius="0";
    filterWidget.className += "myDialog";
    let filterShowing = document.createElement("div");
    filterShowing.id="filterTitle";
    filterShowing.innerHTML = "<strong>Showing: </strong>"+ btn[0].title;
    //filterShowing.style.height= "40px";
    filterShowing.style.paddingLeft="10px";
    filterShowing.style.alignContent="center";
    filterShowing.style.lineHeight= "1em";
    filterShowing.style.wordBreak= "break-word";
    filterShowing.setAttribute("onmouseenter","closeFilter()");
    view.ui.add(filterWidget, "top-left");

    let filterBtn = document.createElement("button");
    filterWidget.appendChild(filterBtn);
    filterWidget.appendChild(filterShowing);
    filterBtn.style.width="45px";
    filterBtn.setAttribute("onmouseenter","openFilter()");
    filterBtn.setAttribute("aria-busy","false");
    filterBtn.setAttribute("aria-label",title);
    filterBtn.setAttribute("title",title);
    filterBtn.setAttribute("aria-live","polite");
    filterBtn.className="esri-widget--button";
    filterBtn.style.border="1px solid #6e6e6e77";
    filterBtn.type="button";
    filterBtn.innerHTML = "<img id='filterIcon' src='./assets/images/"+icon+"' style='width:24px' alt='filter map' aria-hidden='true' class='icon'> &#9660";
    filterBtn.addEventListener("click",function(){
        document.getElementById("filterPopup").style.display = "block";
    });

        // add buttons to filter data
        var iconSize = "32px";
        for (var i=0; i<btn.length; i++){
            btn[i].name="filterBtn";
            btn[i].innerHTML="<img src='"+btn[i].icon+"' style='width:"+iconSize+";'> <span class='filterTxt'>"+btn[i].title+"</span>";
            if (btn[i].active){
                btn[i].className += " active";
                btn[i].style.fontWeight=500;
            }else{
                btn[i].style.fontWeight=400; 
            }
            document.getElementById("filterContent").appendChild(btn[i]);
            if (btn[i].dropdown){
                var list = btn[i].list.split(",");
                var expression = btn[i].expression.split(",");
                var sel = document.createElement("select");
                sel.id = "select_"+btn[i].title;
                sel.setAttribute("onchange","makeDropdownActive("+i+")");
                for(var k=0; k<list.length; k++){
                    var opt = document.createElement("option");
                    opt.value = expression[k];
                    opt.label = list[k];
                    sel.appendChild(opt);
                }
                btn[i].appendChild(sel);
            }

            if (!btn[i].dropdown){
                btn[i].addEventListener("click", function(){
                    var i;
                    // make button active
                    if (!this.active){
                        // make all buttons inactive
                        makeAllInactive();
                        
                        // find the given layer
                        if (!this.layer){
                            this.layer = findLayer(this.layerTitle,this.layerId);
                        }
                        
                        this.className=this.className+" active";
                        this.active = true;
                        this.style.fontWeight=500;
                        // Update title by filter button
                        filterShowing.innerHTML = "<strong>Showing: </strong>"+ this.title;
                        document.getElementById("filterIcon").src = this.icon;
                        for (i=0; i<this.layer.length; i++)
                            this.layer[i].definitionExpression = this.expression;
                        // close on mobile
                        if (window.innerWidth <= 768)closeFilter();
                    }

                    // Make buton inactive, select first (all)
                    else{
                        this.className="esri-widget--button esri-interactive";
                        this.active = false;
                        for (i=0; i<this.layer.length; i++)
                            this.layer[i].definitionExpression = this.expression;
                        this.style.fontWeight=400;

                        // make first active
                        btn[0].className=btn[0].className+" active";
                        btn[0].active = true;
                        btn[0].style.fontWeight=500;

                        // find the given layer
                        if (!btn[0].layer){
                            btn[0].layer = findLayer(btn[0].layerTitle,btn[0].layerId)
                        }

                        for (i=0; i<btn[0].layer.length; i++)
                            btn[0].layer[i].definitionExpression = btn[0].expression;
                        // close on mobile
                        if (window.innerWidth <= 768)closeFilter();
                    }
                },true);
            }
        }
}

function findLayer(layerTitle,layerIds){
    newLayer = [];
    let theLayer = map.allLayers.find(function(layer) {
        if (layer.type !== "group")
            return layer.title === layerTitle;
        else return false;
    });
    // search for the ID
    for (var k=0; k<layerIds.length; k++){
        var found = null;
        for(var i=0; i<theLayer.allSublayers.items.length; i++){
            if (theLayer.allSublayers.items[i].id === parseInt(layerIds[k])){
                found = theLayer.allSublayers.items[i];
                break;
            }
        }
        newLayer.push(found);
    }
    return newLayer;
}
function closeFilter(){
    document.getElementById("filterPopup").style.display = "none";
}
function openFilter(){
    document.getElementById("filterPopup").style.display = "block";
}