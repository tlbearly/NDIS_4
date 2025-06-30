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
        measureDiv.style.width="300px";
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
            // close layer list
            var dialogs = document.querySelectorAll("calcite-dialog");
            for (var i=dialogs.length-1; i>0; i--)
                dialogs[i].setAttribute("open",false);
            // wait because when close the subdialog it opens to parent dialog layerlist
            setTimeout(function(){
                dialogs[0].setAttribute("open",false);
            },500);
            closeIdentify();
            closeHelp();
            //document.getElementById("measureIcon").icon = "chevrons-right";
        });
       
        measureBtn.setAttribute("aria-label","Measure");

        view.ui.add(measureBtn, "bottom-right");
        view.ui.add(measureDiv,"top-right");
    });

    return;
}