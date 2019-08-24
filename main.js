available_maps = {
    alterac_valley : "Alterac Valley", arathi_basin : "Arathi Basin", arathi_highlands : "Arathi Highlands", ashenvale : "Ashenvale", azeroth : "Azeroth", azshara : "Azshara", badlands : "Badlands", blasted_lands : "Blasted Lands", burning_steppes : "Burning Steppes", darkshore : "Darkshore", darnassus : "Darnassus", deadwind_pass : "Deadwind Pass", desolace : "Desolace", dun_morogh : "Dun Morogh", durotar : "Durotar", duskwood : "Duskwood", dustwallow_marsh : "Dustwallow Marsh", eastern_kingdoms : "Eastern Kingdoms", eastern_plaguelands : "Eastern Plaguelands", elwynn_forest : "Elwynn Forest", felwood : "Felwood", feralas : "Feralas", hillsbrad_foothills : "Hillsbrad Foothills", ironforge : "Ironforge", kalimdor : "Kalimdor", loch_modan : "Loch Modan", moonglade : "Moonglade", mulgore : "Mulgore", orgrimmar : "Orgrimmar", redridge_mountains : "Redridge Mountains", searing_gorge : "Searing Gorge", silithus : "Silithus", silverpine_forest : "Silverpine Forest", stonetalon_mountains : "Stonetalon Mountains", stormwind : "Stormwind", stranglethorn_vale : "Stranglethorn Vale", swamp_of_sorrows : "Swamp Of Sorrows", tanaris : "Tanaris", teldrassil : "Teldrassil", the_barrens : "The_Barrens", the_hinterlands : "The Hinterlands", thousand_needles : "Thousand Needles", thunder_bluff : "Thunder Bluff", tirisfal_glades : "Tirisfal Glades", undercity : "Undercity", ungoro_crater : "Ungoro Crater", warsong_gulch : "Warsong Gulch", western_plaguelands : "Western Plaguelands", westfall : "Westfall", wetlands : "Wetlands", winterspring : "Winterspring"
}

available_pins = {
    pin_red : {file: "assets/pin_red.png", value: "pin_red", color: "#ff0000", text:"pin"},
    pin_green : {file: "assets/pin_green.png", value: "pin_green", color: "#00ff00", text:"pin"},
    pin_blue : {file: "assets/pin_blue.png", value: "pin_blue", color: "#0000ff", text:"pin"},
    pin_purple : {file: "assets/pin_purple.png", value: "pin_purple", color: "#ff00ff", text:"pin"},
    pin_yellow : {file: "assets/pin_yellow.png", value: "pin_yellow", color: "#ffff00", text:"pin"},
    qmark : {file: "assets/qmark.png", value: "qmark", color: "#ffff00", text:"quest"},
    hearth : {file: "assets/hearthstone.png", value: "qmark", color: "#ffffff", text:"hearth"}
}

// globs
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
document.getElementById("print_button").addEventListener("click", save_image)
document.getElementById("list_button").addEventListener("click", list_toggle)
document.getElementById("file_browser").addEventListener("change", load)
document.getElementById("color_select").addEventListener("change", color_select_paint_background)
document.getElementById("color_select_overlay").addEventListener("change", color_select_paint_background)
// button elements in edit overlay
document.getElementById("overlay_cancel").addEventListener("click", overlay_cancel)
document.getElementById("overlay_delete").addEventListener("click", overlay_delete)
document.getElementById("overlay_save").addEventListener("click", overlay_save)


document.getElementById("ta").disabled = true

document.getElementById("map_select").value = "azeroth"
loadMap()


// not accessible without console
function importMarkersFromText() {
    let t = document.getElementById("marker_msg_ta").value
    let map_str = document.getElementById("map_select").value
    let pinType = document.getElementById("color_select").selectedIndex
    let lnRegEx = /(.*)\n/g
    let coordRegEx = /\(([\d\.]+), ?([\d\.]+)\)/g;
    /*
    JS regex system is idiotic.
    A regex object stores the index of the last match in its .lastIndex property
    You have to call exec multiple times, every time it gives you the next match
    IF the g flag is set. Don't loop over a regex without g, you get an infinite
    loop. Also, the regex obj STORES the .lastIndex, so if you use the same one
    multiple times in the same block, you have to manually reset .lastIndex
    Also, never use an inline regex, aka. one that is not a variable. The inline
    will generate a NEW regex obj every iteration, which starts at .lastIndex 0
    again and again.
    */
    
    // get lines and number them
    let lines = []
    let linenr = 1
    let mo = null
    while (mo = lnRegEx.exec(t)) {
        lines.push(linenr.toString() + ") " + mo[1])
        ++linenr
    }
    
    // make a marker for each set of coordinates in each line, with the line
    // it occurred in as text
    for (let i = 0; i<lines.length;++i) {
        coordRegEx.lastIndex = 0;
        let coordFound = false
        while (mo = coordRegEx.exec(lines[i])) {
            coordFound = true
            placeNewMarker(mo[1],mo[2],null,null,text=lines[i])
        }
        // place "story-markers", aka. lines without coords
        if (!coordFound) placeNewMarker(99,99,null,null,text=lines[i])
    }
}

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
    pin = document.getElementById("color_select_overlay").selectedIndex
    nav = parseNavFromText(msg)
    let sel_marker = markers[map][selected_marker]
    sel_marker[0] = canv_x
    sel_marker[1] = canv_y
    sel_marker[2] = pin
    sel_marker[4] = x
    sel_marker[5] = y
    sel_marker[6] = msg
    sel_marker[7] = nav
    //selected_marker = null
    drawBoxes()
    document.getElementById("overlay_container").style.display = "none";
    updateMarkerList()
}

// parses nav information from text, returns [navarea,navindex]
// navarea or navindex can be null. If so, they signify no-nav
function parseNavFromText(s) {
    let mapNav = s.match(/#[a-z_]+/);
    if (mapNav != null) {
        mapNav = mapNav[0].substr(1);
        if (!(mapNav in available_maps)) mapNav = null;
    }
    else return null;
    let pinNav = s.match(/#[0-9]+/)
    if (pinNav != null) {
        pinNav = pinNav[0].substr(1);
        pinNav = parseInt(pinNav)
        if (pinNav == NaN) pinNav = null;
    }
    return [mapNav, pinNav];
}

// displays the editing-overlay and fills it with the selected markers data
function show_edit_overlay () {
    if (selected_marker == null) { return }
    document.getElementById("overlay_title").innerHTML = "Edit marker at " + map + " " + markers[map][selected_marker][4] + " / " + markers[map][selected_marker][5]
    document.getElementById("overlay_x").value = markers[map][selected_marker][4]
    document.getElementById("overlay_y").value = markers[map][selected_marker][5]
    document.getElementById("overlay_msg").value = markers[map][selected_marker][6]
    document.getElementById("overlay_container").style.display = "block";
    document.getElementById("color_select_overlay").selectedIndex = markers[map][selected_marker][2]
    color_select_paint_background()
}



// handles keyboard-key prasses caught by body element
function handleKeyboard (ev) {
    
    //console.log(ev.keyCode)
    let key = ev.keyCode
    
    // all keydown functionality is disabled while edit overlay is shown
    if (document.getElementById("overlay_container").style.display == "block") {
        return
    }
    
    
    // ENTER : open edit overlay
    if (key == 13) {
        if (selected_marker != null) {
            tooltip.classList.add("hide")
            show_edit_overlay()
        }
    }
    
    // 39 right 37 left 38 up 40 down
    else if (key == 39 || key == 37) {
        //check if sidelist has focus, ignore key if so.
        if (document.activeElement == document.getElementById("marker_list")) {
            return
        }
        let mlen = markers[map].length
        // pick the first (or last) marker if none is selected
        if (selected_marker == null) {
            if (mlen != 0) selected_marker = (key == 39)?0:(mlen-1);
            else return;
        }
        // pick the next or prev. one if one is selected
        else {
            // if you clicked next (39) and the currently selected marker has
            // a nav link, follow it
            if (key == 39 && navigateByMarker(markers[map][selected_marker])) return;
            
            selected_marker += (key == 39)?1:-1
            if (selected_marker >= mlen) selected_marker = mlen - 1;
            if (selected_marker < 0) selected_marker = 0;
        }
        drawBoxes()
        document.getElementById("marker_list").selectedIndex = selected_marker
        document.getElementById("marker_msg_ta").value = markers[map][selected_marker][6]
        document.getElementById("ta").value = markers[map][selected_marker][4] + " - " + markers[map][selected_marker][5]
    }
    
    // (DEL) remove selected marker
    else if (ev.keyCode == 46) {
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
    selected_marker = mlist.selectedIndex
    drawBoxes()
    ctext = markers[map][selected_marker][4] + " - " + markers[map][selected_marker][5]
    document.getElementById("ta").value = ctext
    document.getElementById("marker_msg_ta").value = markers[map][selected_marker][6]
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



// paint the color SELECT after a new option has been chosen
function color_select_paint_background() {
    let cs = document.getElementById("color_select")
    let ov_cs = document.getElementById("color_select_overlay")
    cs.style.backgroundColor = available_pins[cs.value].color
    ov_cs.style.backgroundColor = available_pins[ov_cs.value].color
}


// Build the 2 select-menus (normal and overlay)
// Also pre-loads the images as hidden elements into a buffer to facilitate
// fast draw options later
// TODO: rename function
function color_select_paint_options_background() {
    let cs = document.getElementById("color_select")
    let ov_cs = document.getElementById("color_select_overlay")
    let buffer = document.getElementById("drawbuffer")
    let p = null
    for (p in available_pins) {
        let color = available_pins[p].color
        let value = available_pins[p].value
        let file = available_pins[p].file
        let text = available_pins[p].text
        let n = document.createElement("Option")
        let no = document.createElement("Option")
        // we pre-load all available img data for later drawing
        let img = document.createElement("img")
        img.src = file
        n.style.backgroundColor = color
        no.style.backgroundColor = color
        n.value = value
        no.value = value
        n.innerHTML = text
        no.innerHTML = text
        cs.appendChild(n)
        ov_cs.appendChild(no)
        buffer.appendChild(img)
    }
    // select the first option of each to trigger color_select_paint_background
    cs.selectedIndex = 0;
    ov_cs.selectedIndex = 0;
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


function save_image() {
    // draw map and markers onto same canvas (overlay)
    let cv = document.getElementById("map_overlay")
    drawBoxes(true)
    // let the HTML canvas write to blob and specify callback
    cv.toBlob(save_image_callback)
    
}
// convert image and offers it for download
function save_image_callback(blob) {
    virtual_link = document.createElement("a")
    document.body.appendChild(virtual_link)
    virtual_link.style = "display: none"
    url = window.URL.createObjectURL(blob)
    virtual_link.href = url
    virtual_link.download = "myMap.png"
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

// do marker-based navigation. m == marker
// returns true if nav, false if not
function navigateByMarker(m) {
    let mTextArea = document.getElementById("marker_msg_ta")
    let nav = m[7]     
    if (nav != null) {
        let mapNav = nav[0]
        let pinNav = nav[1]
        // navigate to new map (if marker[7] != nulll it has at least mapNav)
        document.getElementById("map_select").value = mapNav
        selected_marker = null
        // check if target marker and if it exists on target map
        if (pinNav != null && (markers[mapNav].length-1 >= pinNav)) {
            selected_marker = pinNav
            mTextArea.value = markers[mapNav][selected_marker][6]
        }
        loadMap()
        return true;
    }
    else false;
}



// handle all clicks into the map overlay
function map_overlayClickHandler(ev) {
    x = ev.offsetX
    y = ev.offsetY
    ctrl = ev.ctrlKey
    alt = ev.altKey
    
    let mTextArea = document.getElementById("marker_msg_ta")
    // ------------------------------ right click -------------------------------
    // navigation
    if (ev.button == 2) {
        
        // zoom out on ctrl-click
        if (ctrl) {
            if (navigation[map].out) {
                selected_marker = null
                document.getElementById("map_select").value = navigation[map].out
                loadMap()
            }
            return
        }
        else {
            // if marker under mouse, attempt to navigate by marker
            let index = getBox(x,y)
            if (index != null) {
                if (navigateByMarker(markers[map][index])) return;
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
            mTextArea.value = markers[map][i][6]
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
        
        // ... or add one (no modifier)
        c = document.getElementById("color_select").selectedIndex
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
function drawBoxes(wipe_with_map=false) {
    let cv = document.getElementById("map_overlay")
    let cx = cv.getContext("2d")
    let selX = null, selY = null;
    
    if (wipe_with_map) {
        cx.drawImage(document.getElementById("img_container"),0,0)
    }
    else {
        cx.clearRect(0,0,cv.width,cv.height);
    }
    
    let buffer = document.getElementById("drawbuffer")
    for (let i=0;i<markers[map].length;++i) {
        let x = markers[map][i][0] - 5
        let y = markers[map][i][1] - 5
        let img = buffer.children[markers[map][i][2]]
        //cx.fillStyle = markers[map][i][2]
        //cx.fillRect(x-3,y-3,6,6)
        cx.drawImage(img, x, y)
        // store information for target reticule position so it can be drawn last
        if (selected_marker != null && i == selected_marker) {
            selX = x; selY = y;
        }
    }
    if (selX && selY) {
        cx.fillStyle = "#ffffff"
        cx.fillRect(selX+5,selY,1,11)
        cx.fillRect(selX,selY+5,11,1)        
    }
}

function placeNewMarker(x,y,map_str=null,pinIndex=null,text=null,coordsAreGame=true) {
    //get map string if null
    if (map_str == null) {
        map_str = document.getElementById("map_select").value
    }
    if (!(map_str in available_maps)) {
        console.error("'" + map_str + "' is not a valid map identifier.")
    }
    // create map array if none exists
    if (!markers[map_str]) markers[map_str] = [];
    
    //get the missing set of coords (canvas or game)
    if (coordsAreGame) {
        gx = x; gy = y;
        let coords = convertCoordsToPos(x, y);
        cx = coords[0]; cy = coords[1];
    }
    else {
        cx = x; cy = y;
        let coords = convertPosToCoords(x,y);
        gx = coords[0]; gy = coords[1];
    }
    
    // get the pin index if not specified as param
    if (pinIndex == null) {
        pinIndex = document.getElementById("color_select").selectedIndex;
    }
    
    // text fallback if not specified
    if (text == null) text="";
    
    // get nav info from text
    nav = parseNavFromText(text)

    m = [cx,cy,pinIndex,false,gx,gy,text,nav]
    
    markers[map_str].push(m)
    drawBoxes()
    updateMarkerList()
}