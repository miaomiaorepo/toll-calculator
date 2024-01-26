function initMap() {

    fetch('routes.json')
        .then(response => response.json())
        .then(data => {
            const routeData = data.route[0]; 
            setupMapAndRoute(routeData);
        })
        .catch(error => console.error('Error loading the JSON file:', error));
}

function setupMapAndRoute(routeData) {
    var origin = routeData.origin;
    var destination = routeData.destination;
    var polylinePoints = routeData.polyline;

    var map = L.map('map').fitBounds([
        [origin.origin_lat, origin.origin_lng],
        [destination.destination_lat, destination.destination_lng]
    ]);


    //var map = L.map('map').setView([32.7767, -96.7970], 10); // Dallas County Coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    
    var polyline = L.polyline(polylinePoints.map(point => point.reverse()), {color: 'blue'}).addTo(map);
    var originMarker = L.marker([origin.origin_lat, origin.origin_lng]).addTo(map);
    var destinationMarker = L.marker([destination.destination_lat, destination.destination_lng]).addTo(map);
}

document.addEventListener('DOMContentLoaded', initMap);