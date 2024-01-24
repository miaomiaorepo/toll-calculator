function initMap() {
    var map = L.map('map').setView([32.7767, -96.7970], 10); // Dallas County Coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', initMap);