function myFilter(title){
    // filter data displayed by selecting different buttons
    // for example: Family Friendly Fishing Pts
    document.getElementById("filterTitle").innerHTML = title;
    let filterBtn = document.createElement("button");
        filterBtn.setAttribute("aria-busy","false");
        filterBtn.setAttribute("aria-label",title);
        filterBtn.setAttribute("title",title);
        filterBtn.setAttribute("aria-live","polite");
        filterBtn.className="esri-widget--button";
        filterBtn.style.border="1px solid #6e6e6e77";
        filterBtn.type="button";
        if (window.innerWidth > 768) {
            filterBtn.style.position = "absolute";
            filterBtn.style.left = "330px";
            filterBtn.style.top = "38px";//-52px";
        }else {
            filterBtn.style.position = "absolute";
            filterBtn.style.left = "239px";
            filterBtn.style.top = "39px";//-51px";
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
        view.ui.add(filterBtn, "top-left");

}
function closeFilter(){
    document.getElementById("filterPopup").style.display = "none";
}