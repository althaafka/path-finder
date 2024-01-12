var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


var map = L.map('map').setView([-6.89125, 107.61051], 16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


const add_node = document.getElementById("add_node");
const add_path = document.getElementById("add_path");
const select_start = document.getElementById("select_start");
const select_end = document.getElementById("select_end");

function change_drawing_tool_mode(mode){
    if (mode.classList.contains("active")){
        mode.classList.remove("active");
    } else {
        add_node.classList.remove("active");
        add_path.classList.remove("active");
        select_start.classList.remove("active");
        select_end.classList.remove("active");
        mode.classList.add("active");
    }
}

var nodes = L.featureGroup().addTo(map).on("click", marker_click);
var paths = L.featureGroup().addTo(map);
var result_line = L.featureGroup().addTo(map);

function map_click(e) {
    if (add_node.classList.contains("active")){
        L.marker(e.latlng).addTo(nodes);
    }
}
map.on('click', map_click);

let clicked_node = null;
let start_node = null;
let end_node = null;

function marker_click(e) {
    if (add_path.classList.contains("active")){
        if (clicked_node == null){
            clicked_node = e.layer;
            clicked_node._icon.classList.add("huechange");
        } else {
            L.polyline([e.latlng, clicked_node._latlng]).addTo(paths);
            clicked_node._icon.classList.remove("huechange");
            clicked_node = null;
        }
    } else if (select_start.classList.contains("active")){
        for (let i = 0; i < nodes.getLayers().length; i++){
            if (nodes.getLayers()[i] == end_node) continue;
            nodes.getLayers()[i].setIcon(blueIcon);
        }
        start_node = e.layer;
        e.layer.setIcon(redIcon)
    } else if (select_end.classList.contains("active")){
        for (let i = 0; i < nodes.getLayers().length; i++){
            if (nodes.getLayers()[i] == start_node) continue;
            nodes.getLayers()[i].setIcon(blueIcon);
        }
        end_node = e.layer;
        e.layer.setIcon(redIcon)
    }
}

function reset_nodes(){
    map.removeLayer(nodes);
    nodes = L.featureGroup().addTo(map).on("click", marker_click);
    reset_paths();
    reset_result();
}

function reset_paths(){
    map.removeLayer(paths);
    paths = L.featureGroup().addTo(map);
    reset_result();
}

function reset_result(){
    map.removeLayer(result_line);
    result_line = L.featureGroup().addTo(map);
    document.getElementById("distance").innerHTML = "-";
}


function calculate(){
    let result = calculate2(getAdjacencyMatrix(), getHeuristic(), getNodeIndex(start_node._latlng.lat, start_node._latlng.lng), getNodeIndex(end_node._latlng.lat, end_node._latlng.lng), document.getElementById("alg").value);
    if (result == null) {
        document.getElementById("distance").innerHTML = "No path found";
        return;
    }

    for (let i=0; i<paths.getLayers().length; i++){
        paths.getLayers()[i].setStyle({color: 'black'});
    }

    if (result_line.getLayers().length > 0) {
        map.removeLayer(result_line);
    }
    result_line = L.featureGroup().addTo(map);

    node1= result[0][0];
    for (let i=1; i<result[0].length; i++){
        node2 = result[0][i];
        L.polyline([nodes.getLayers()[node1]._latlng, nodes.getLayers()[node2]._latlng], {color: 'red'}).addTo(result_line);
        node1 = node2;
    }

    document.getElementById("distance").innerHTML = result[1].toFixed(3) + " m";
}

function getHeuristic(){
    let heuristic = [];
    for (let i = 0; i < nodes.getLayers().length; i++){
        heuristic.push(map.distance(nodes.getLayers()[i]._latlng, start_node._latlng));
    }

    return heuristic;
}

function getAdjacencyMatrix(){
    let adjacency_matrix = new Array(nodes.getLayers().length).fill(0).map(() => new Array(nodes.getLayers().length).fill(0));
    for (let i = 0; i < paths.getLayers().length; i++){
        let start = getNodeIndex(paths.getLayers()[i]._latlngs[0].lat, paths.getLayers()[i]._latlngs[0].lng);
        let end = getNodeIndex(paths.getLayers()[i]._latlngs[1].lat, paths.getLayers()[i]._latlngs[1].lng);
        adjacency_matrix[start][end] = map.distance(paths.getLayers()[i]._latlngs[0], paths.getLayers()[i]._latlngs[1]);
        adjacency_matrix[end][start] = map.distance(paths.getLayers()[i]._latlngs[0], paths.getLayers()[i]._latlngs[1]);
    }

    return adjacency_matrix;
}

function getNodeIndex(lat, lng){
    for (let i = 0; i < nodes.getLayers().length; i++){
        if (nodes.getLayers()[i]._latlng.lat == lat && nodes.getLayers()[i]._latlng.lng == lng) return i;
    }
    return -1;
}