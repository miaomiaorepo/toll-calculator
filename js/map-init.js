function initMap() {
    getTollFee({ lat: 32.780540, lng: -96.794170 }, { lat: 33.172710, lng: -96.906230 }, { type: "2AxlesTaxi", axles: 2 })
        .then(data => {
            const routeData = data.route[0];
            setupMapAndRoute(routeData);
        })
        .catch(error => console.error('Error calling the API:', error));
}

function decode(encoded) {
    var points = []
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    while (index < len) {
        var b, shift = 0, result = 0;
        do {

            b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);


        var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([(lng / 1E5), (lat / 1E5)])

    }
    return points
}

async function getTollFee(source, destination, vehicle) {
    // Default options are marked with *
    const API_END_POINT = "https://apis.tollguru.com/toll/v2/origin-destination-waypoints";
    // const API_END_POINT = "https://apis.tollguru.com/v2/web-trial";
    const API_KEY =  ;
    const response = await fetch(API_END_POINT, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(
            {
                "from": {
                    "lat": source["lat"],
                    "lng": source["lng"]
                },
                "to": {
                    "lat": destination["lat"],
                    "lng": destination["lng"]
                },
                "serviceProvider": "gmaps",
                "vehicleType": "2AxlesAuto",
                "vehicle": {
                   "type": vehicle["type"],
                   "axles": vehicle["axles"]
                }
            }
        ),
    });
    const tollInfo = await response.json();
    const route = tollInfo["summary"]["route"][0];
    const originAddress = route["address"];
    const originLat = route["location"]["lat"];
    const originLng = route["location"]["lng"];
    const destinationAddress = route["address"];
    const destinationLat = route["location"]["lat"];
    const destinationLng = route["location"]["lng"];
    const decodedPolyline = decode(tollInfo["routes"][0]["polyline"])

    const result = {
        route: [
            {
                "origin": {
                    "origin_address": originAddress,
                    "origin_lat": originLat,
                    "origin_lng": originLng
                },
                "destination": {
                    "destination_address": destinationAddress,
                    "destination_lat": destinationLat,
                    "destination_lng": destinationLng
                },
                "polyline": decodedPolyline
            },
        ]
    };
    return result;
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
    const tollName = routeData.tollFacility["name"];
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