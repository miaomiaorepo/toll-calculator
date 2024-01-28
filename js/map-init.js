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

    //Set up the map
    const origin = routeData.origin;
    const destination = routeData.destination;
    const polylinePoints = routeData.polyline;

    const map = L.map('map').fitBounds([
        [origin.origin_lat, origin.origin_lng],
        [destination.destination_lat, destination.destination_lng]
    ]);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    
    const polyline = L.polyline(polylinePoints.map(point => point.reverse()), {color: 'blue'}).addTo(map);
    const originMarker = L.marker([origin.origin_lat, origin.origin_lng]).addTo(map);
    const destinationMarker = L.marker([destination.destination_lat, destination.destination_lng]).addTo(map);

    // Set up the Toll Facility Name
    const tollName = routeData.tollFacility['name'];
    const tollNameElement = document.querySelector('.toll-name');
    if (tollNameElement) {
        tollNameElement.textContent = tollName;
    }

    // Generate toll gantry list
    if (routeData.tollGantry) {
        generateGantryDivs(routeData.tollGantry);
    }
    
    // Add animation to the total cost
    function animateValue(obj, end, duration) {
        let current = 0;
        const stepTime = duration / (end / 0.5);
    
        const timer = setInterval(() => {
            current += 0.5;
            if (current > end) {
                current = end;
            }
            obj.textContent = `$${current.toFixed(2)}`;
    
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    function generateGantryDivs(tollGantry) {
        const breakdownContainer = document.querySelector('.breakdown-line');
        let totalCost = 0;
    
        tollGantry.forEach(gantry => {

            totalCost += gantry.tagCost;

            const breakdownDiv = document.createElement('div');
            breakdownDiv.className = 'breakdown';
    
            const gantryNameDiv = document.createElement('div');
            gantryNameDiv.className = 'gantry-name';
            gantryNameDiv.textContent = gantry.name;
    
            const priceDiv = document.createElement('div');
            priceDiv.className = 'price-1 price-5';
            priceDiv.textContent = `$${gantry.tagCost.toFixed(2)}`;
    
            breakdownDiv.appendChild(gantryNameDiv);
            breakdownDiv.appendChild(priceDiv);
    
            breakdownContainer.appendChild(breakdownDiv);
            
        });

        // Create and append the total div
        const totalDiv = document.createElement('div');
        totalDiv.className = 'breakdown';

        const totalNameDiv = document.createElement('div');
        totalNameDiv.className = 'gantry-name';
        totalNameDiv.textContent = 'Total';
        totalDiv.appendChild(totalNameDiv);

        const totalPriceDiv = document.createElement('div');
        totalPriceDiv.className = 'price-1 price-5';
        totalPriceDiv.textContent = `$${totalCost.toFixed(2)}`;
        totalDiv.appendChild(totalPriceDiv);

        breakdownContainer.appendChild(totalDiv);

        // Update the total cost in the address section and add animation
        const totalPriceElement = document.querySelector('.price.price-5');
        if (totalPriceElement) {
            animateValue(totalPriceElement, totalCost, 800); // Animate the total cost
        }
    }

}

document.addEventListener('DOMContentLoaded', initMap);