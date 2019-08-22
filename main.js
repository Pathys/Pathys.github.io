available_maps = {
    alterac_valley : "Alterac Valley", arathi_basin : "Arathi Basin", arathi_highlands : "Arathi Highlands", ashenvale : "Ashenvale", azeroth : "Azeroth", azshara : "Azshara", badlands : "Badlands", blasted_lands : "Blasted Lands", burning_steppes : "Burning Steppes", darkshore : "Darkshore", darnassus : "Darnassus", deadwind_pass : "Deadwind Pass", desolace : "Desolace", dun_morogh : "Dun Morogh", durotar : "Durotar", duskwood : "Duskwood", dustwallow_marsh : "Dustwallow Marsh", eastern_kingdoms : "Eastern Kingdoms", eastern_plaguelands : "Eastern Plaguelands", elwynn_forest : "Elwynn Forest", felwood : "Felwood", feralas : "Feralas", hillsbrad_foothills : "Hillsbrad Foothills", ironforge : "Ironforge", kalimdor : "Kalimdor", loch_modan : "Loch Modan", moonglade : "Moonglade", mulgore : "Mulgore", orgrimmar : "Orgrimmar", redridge_mountains : "Redridge Mountains", searing_gorge : "Searing Gorge", silithus : "Silithus", silverpine_forest : "Silverpine Forest", stonetalon_mountains : "Stonetalon Mountains", stormwind : "Stormwind", stranglethorn_vale : "Stranglethorn Vale", swamp_of_sorrows : "Swamp Of Sorrows", tanaris : "Tanaris", teldrassil : "Teldrassil", the_barrens : "The_Barrens", the_hinterlands : "The Hinterlands", thousand_needles : "Thousand Needles", thunder_bluff : "Thunder Bluff", tirisfal_glades : "Tirisfal Glades", undercity : "Undercity", ungoro_crater : "Ungoro Crater", warsong_gulch : "Warsong Gulch", western_plaguelands : "Western Plaguelands", westfall : "Westfall", wetlands : "Wetlands", winterspring : "Winterspring"
}
markers = {}
map_w = 772
map_h = 515
// this is an ugly hack, but i cant be bothered right now...
navX = 0
navY = 0
marker_color = "#ff0000"
map = "ashenvale"
overwrite_current = true
selected_marker = null
color_select_paint_options_background()
color_select_paint_background()
clickCount = 0
clickText = "["


cv = document.getElementById("map_overlay")
cv.addEventListener("mousedown", map_overlayClickHandler)
cv.addEventListener("mousemove", handleMouseover)
// silence the right-click default reaction for the overlay
cv.addEventListener("contextmenu", function(e) { e.preventDefault(); }, false)

// keyboard handler
document.getElementById("body").addEventListener("keyup", handleKeyboard)
// draw map everytime img changes
document.getElementById("img_container").addEventListener("load", drawImage)
// select elements
document.getElementById("map_select").addEventListener("input", loadMap)
document.getElementById("marker_list").addEventListener("change", selectMarkerByList)
// button elements
document.getElementById("clear_page_button").addEventListener("click", clear)
document.getElementById("import_button").addEventListener("click", chooseFileImport)
document.getElementById("load_button").addEventListener("click", chooseFileLoad)
document.getElementById("save_button").addEventListener("click", save)
document.getElementById("list_button").addEventListener("click", list_toggle)
document.getElementById("file_browser").addEventListener("change", load)
document.getElementById("color_select").addEventListener("change", color_select_paint_background)
document.getElementById("color_select_overlay").addEventListener("change", color_select_paint_background)
// button elements in edit overlay
document.getElementById("overlay_cancel").addEventListener("click", overlay_cancel)
document.getElementById("overlay_delete").addEventListener("click", overlay_delete)
document.getElementById("overlay_save").addEventListener("click", overlay_save)


document.getElementById("ta").disabled = true

loadMap()


// overlay - buttons
function overlay_cancel () {
    document.getElementById("overlay_container").style.display = "none";
}
function overlay_delete () {
    if (selected_marker == null) {        
        document.getElementById("overlay_container").style.display = "none";
        return
    }
    markers[map].splice(selected_marker,1)
    selected_marker = null  // no marker is selected after delete
    drawBoxes()
    updateMarkerList()
    document.getElementById("overlay_container").style.display = "none";
}
function overlay_save () {
    if (selected_marker == null) { 
        document.getElementById("overlay_container").style.display = "none";
    }
    x = document.getElementById("overlay_x").value
    y = document.getElementById("overlay_y").value
    canv_pos = convertCoordsToPos(x,y)
    canv_x = canv_pos[0]
    canv_y = canv_pos[1]
    msg = document.getElementById("overlay_msg").value
    color = document.getElementById("color_select_overlay").value
    nav = msg.substr(msg.search("#")+1)
    if (!(nav in available_maps)) nav = null;
    sel_marker = markers[map][selected_marker]
    sel_marker[0] = canv_x
    sel_marker[1] = canv_y
    sel_marker[2] = color
    sel_marker[4] = x
    sel_marker[5] = y
    sel_marker[6] = msg
    sel_marker[7] = nav
    selected_marker = null
    drawBoxes()
    document.getElementById("overlay_container").style.display = "none";
    updateMarkerList()
}


// displays the editing-overlay and fills it with the selected markers data
function show_edit_overlay () {
    if (selected_marker == null) { return }
    document.getElementById("overlay_title").innerHTML = "Edit marker at " + map + " " + markers[map][selected_marker][4] + " / " + markers[map][selected_marker][5]
    document.getElementById("overlay_x").value = markers[map][selected_marker][4]
    document.getElementById("overlay_y").value = markers[map][selected_marker][5]
    document.getElementById("overlay_msg").value = markers[map][selected_marker][6]
    document.getElementById("overlay_container").style.display = "block";
}


// handles keyboard-key prasses caught by body element
function handleKeyboard (ev) {
    // (DEL) remove selected marker
    if (ev.keyCode == 46) {
        if (selected_marker != null) {
            markers[map].splice(selected_marker,1)
            selected_marker = null
        }
        drawBoxes()
        updateMarkerList()
    }
    // num - key == up
    else if (ev.keyCode == 109) {
        if (selected_marker != null && selected_marker != 0) {
            let tmp = markers[map][selected_marker-1]
            markers[map][selected_marker-1] = markers[map][selected_marker]
            markers[map][selected_marker] = tmp
            updateMarkerList()
            --selected_marker
            document.getElementById("marker_list").selectedIndex = selected_marker
        }
    }
    // num + key == down
    else if (ev.keyCode == 107) {
        if (selected_marker != null && selected_marker != markers[map].length - 1) {
            let tmp = markers[map][parseInt(selected_marker)+1] // selected marker may be a string here...and + is stupid
            markers[map][parseInt(selected_marker)+1] = markers[map][selected_marker]
            markers[map][selected_marker] = tmp
            updateMarkerList()
            ++selected_marker
            document.getElementById("marker_list").selectedIndex = selected_marker
        }
    }
}


// selects a marker because it was chosen in the list
function selectMarkerByList () {
    mlist = document.getElementById("marker_list")
    selected_marker = mlist.value
    drawBoxes()
    ctext = markers[map][mlist.value][4] + " - " + markers[map][mlist.value][5]
    document.getElementById("ta").value = ctext
    document.getElementById("marker_msg_ta").value = markers[map][mlist.value][6]
}


// show or hide the marker-list
function list_toggle() {
    mlist = document.getElementById("marker_list")
    mc = document.getElementById("master_container")
    
    // show it
    if (mlist.classList.contains("hide")) {
        mlist.classList.remove("hide")
        mc.style.width = mc.style.width + 200
    }
    // hide it
    else {
        mlist.classList.add("hide")
        mc.style.width = mc.style.width - 200
    }
    
}


// clear all markers from current map
function clear () {
    markers[map] = []
    drawBoxes()
    updateMarkerList()
}


function color_select_paint_background() {
    cs = document.getElementById("color_select")
    overlay_cs = document.getElementById("color_select_overlay")
    cs.style.backgroundColor = cs.value
    overlay_cs.style.backgroundColor = overlay_cs.value
}


//paint the color options
function color_select_paint_options_background() {
    options = document.getElementById("color_select").children
    overlay_options = document.getElementById("color_select_overlay").children
    for (i=0;i<options.length;++i) {
        option = options[i]
        overlay_option = overlay_options[i]
        option.style.backgroundColor = option.value
        overlay_option.style.backgroundColor = option.value
    }
}


// convert markers to blob and offer for "download"
function save() {
    blob = new Blob([JSON.stringify(markers)],{type:'application/json'})
    virtual_link = document.createElement("a")
    document.body.appendChild(virtual_link)
    virtual_link.style = "display: none"
    url = window.URL.createObjectURL(blob)
    virtual_link.href = url
    virtual_link.download = "myMaps.json"
    virtual_link.click()
    window.URL.revokeObjectURL(url)
}


// these let the load_button trigger the file dialog
function chooseFileLoad () {
    overwrite_current = true
    document.getElementById("file_browser").click()
}
function chooseFileImport () {
    overwrite_current = false
    document.getElementById("file_browser").click()
}


// load markers from a file as soon as #file_browser changes
function load () {
    file = document.getElementById("file_browser").files[0]
    reader = new FileReader()
    reader.onload = function(ev) {
        data = JSON.parse(ev.target.result)
        // decide load or import depending on global
        if (overwrite_current) {
            markers = data
        }
        else {
            for (m in data) {
                for (i=0;i<data[m].length;++i) {
                    markers[m].push(data[m][i])
                }
            }
        }
        // add empty marker array to current map if it doesn't exist already
        if (!markers.hasOwnProperty(map)) {
            markers[map] = []
        }
        drawBoxes()
        updateMarkerList()
    }
    reader.readAsText(file)
}


// change map
function loadMap() {
    console.log("loading map: ",document.getElementById("map_select").value)
    map = document.getElementById("map_select").value
    img = document.getElementById("img_container")
    img.src = "maps/" + map + ".jpg"
    // add empty marker array to current map if it doesn't exist already
    if (!markers.hasOwnProperty(map)) {
        markers[map] = []
    }
    //we dont need to redraw the map here, because the img_container reacts to the load event
    //but we do need to draw the boxes for the current overlay
    drawBoxes()
    updateMarkerList()
}


// draw map image on canvas
function drawImage() {
    cv = document.getElementById("map_canvas")
    cx = cv.getContext("2d")
    cx.drawImage(document.getElementById("img_container"),0,0)
}


// handles all mouseover for the map overlay ... diplay coords, show tooltip
function handleMouseover(ev) {
    tooltip = document.getElementById("tooltip")
    cursorX = ev.clientX
    cursorY = ev.clientY
    x = ev.offsetX
    y = ev.offsetY
    coords = convertPosToCoords(x,y)
    mapX = navX = coords[0]
    mapY = navY = coords[1]
    
    document.getElementById("ta").value = mapX + " - " + mapY
    
    // check if there is a marker-box at ccursor position
    // if so, show the tooltip
    i = getBox(x,y)
    if (i != null) {
        tooltip.classList.remove("hide")
        //tooltip.innerHTML = markers[map][i][6]
        tooltip.innerHTML = make_tooltip_text(i)
        tooltip.style.left = (cursorX) + "px"
        tooltip.style.top = (cursorY - 30) + "px"
    }
    else {
        tooltip.classList.add("hide")
    }
}


// buuild the text for the tooltip
function make_tooltip_text(i) {
    text = '<span style="color: #ffff00">' + markers[map][i][4] + " / " + markers[map][i][5] + '</span>'
    let marker_text = markers[map][i][6]
    if (marker_text.length > 23) marker_text = marker_text.substr(0,23) + "...";
    text += '<br/><span style="color: #ff0000">' + marker_text + '</span>'
    return text
}

function make_list_text (i) {
    let marker_text = markers[map][i][6]
    if (marker_text.length > 23) marker_text = marker_text.substr(0,23) + "...";
    return marker_text
}


// turn canvas coordinates into wow map coordinates
function convertPosToCoords(x,y) {
    x /= map_w
    y /= map_h
    x = (Math.round(x * 10000) / 100).toPrecision(4)
    y = (Math.round(y * 10000) / 100).toPrecision(4)
    return [x,y]
}
// does the opposite
function convertCoordsToPos (x,y) {
  x /= 100
  y /= 100
  x = Math.floor(x * map_w)
  y = Math.floor(y * map_h)
  return [x,y]
}


// check if a marker exists for that position, return its index
// will return the first marker found!
function getBox (x, y) {
    for (i=0;i<markers[map].length;++i) {
        elem = markers[map][i]
        if ((Math.abs(elem[0] - x) <= 3 ) && (Math.abs(elem[1] - y) <= 3 )) {
            return i
        }
    }
    return null
}


// handle all clicks into the map overlay
function map_overlayClickHandler(ev) {
    x = ev.offsetX
    y = ev.offsetY
    ctrl = ev.ctrlKey
    alt = ev.altKey
    
    // ------------------------------ right click -------------------------------
    // navigation
    if (ev.button == 2) {
        
        // zoom out on ctrl-click
        if (ctrl) {
            if (navigation[map].out) {
                document.getElementById("map_select").value = navigation[map].out
                loadMap()
            }
            return
        }
        else {
            // if marker under mouse, check if it can navigate
            let index = getBox(x,y)
            if (index != null) {
                if (markers[map][index][7] != null) {
                    console.log("navinfo found in marker:", markers[map][index][7])
                    document.getElementById("map_select").value = markers[map][index][7]
                    selected_marker = null
                    loadMap()
                    return
                }
                else return;
            }
            // else, navigate around based on clickzones
            coords = convertPosToCoords()
            for (i=0;i<navigation[map].nav.length;++i) {
                x1 = navigation[map].nav[i][0][0]
                y1 = navigation[map].nav[i][0][1]
                x2 = navigation[map].nav[i][1][0]
                y2 = navigation[map].nav[i][1][1]
                if (navX >= x1 && navX <= x2 && navY >= y1 && navY <= y2) {
                    document.getElementById("map_select").value = navigation[map].nav[i][2]
                    loadMap()
                    return
                }
            }
        }
        return
    }
    
    // ------------------------------ left click -------------------------------
    
    // check if there is a marker under the cursor and...
    i = getBox(x,y)
    if (i != null) {
        // ...delete it (alt key)
        if (alt) {
            markers[map].splice(i,1)
            selected_marker = null  // no marker is selected after delete
            drawBoxes()
            updateMarkerList()
        }
        // ...update it (ctrl key)
        else if (ctrl) {
            selected_marker = i
            tooltip.classList.add("hide")
            show_edit_overlay()
        }
        // ...select it (no modifier)
        else {
            selected_marker = i
            document.getElementById("marker_list").selectedIndex = i
            ctext = markers[map][i][4] + " - " + markers[map][i][5]
            document.getElementById("ta").value = ctext
            document.getElementById("marker_msg_ta").value = markers[map][i][6]
            drawBoxes()
            
        }
        return
    }
    else {
        // if there is no marker, deselect (alt)
        if (alt) {
            selected_marker = null
            updateMarkerList()
            drawBoxes()
            return
        }
        
        // ... add one (no modifier)
        c = document.getElementById("color_select").value
        mapcoords = convertPosToCoords(x,y)
        mapX = mapcoords[0]
        mapY = mapcoords[1]
        text = ""
        // marker element: [x, y, color, selected, mapX, mapY, text, nav]
        markers[map].push([x,y,c,false,mapX,mapY,text,null])
        drawBoxes()
        updateMarkerList()
        // ...and if ctrl is pressed, edit it immediately
        if (ctrl) {
            selected_marker = markers[map].length - 1
            tooltip.classList.add("hide")
            show_edit_overlay()
        }
    }
    
}


// update the marker list
function updateMarkerList () {
    marker_list = document.getElementById("marker_list")
    
    //remove current elemens
    while(marker_list.firstChild) {
        marker_list.removeChild(marker_list.firstChild)
    }
    
    for (i=0;i<markers[map].length;++i) {    
        new_entry = document.createElement("option")
        new_entry.value = i
        if (markers[map][i][6] == "") {
            new_entry.innerHTML = markers[map][i][4] + "/" + markers[map][i][5]
        }
        else {
            new_entry.innerHTML = make_list_text(i)//markers[map][i][6]
        }
        marker_list.appendChild(new_entry)
    }
}


// draw the current collection of marker-boxes onto the map overlay
function drawBoxes() {
    cv = document.getElementById("map_overlay")
    cx = cv.getContext("2d")
    
    cx.clearRect(0,0,cv.width,cv.height)
    
    for (i=0;i<markers[map].length;++i) {
        x = markers[map][i][0]
        y = markers[map][i][1]
        cx.fillStyle = markers[map][i][2]
        cx.fillRect(x-3,y-3,6,6)
        
        // special draw for the selected marker
        if (selected_marker != null && i == selected_marker) {
            cx.fillStyle = "#ffffff"
            cx.fillRect(x-1,y-5,2,10)
            cx.fillRect(x-5,y-1,10,2)
        }
    }
}