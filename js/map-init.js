function initMap() {
    getTollFee({ lat: 32.780540, lng: -96.794170 }, { lat: 33.172710, lng: -96.906230 }, "2AxlesAuto", Math.round(Date.now() / 1000))
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

async function getTollFee(source, destination, vehicle, departureTime, payment) {
    // Default options are marked with *
    const API_END_POINT = "https://apis.tollguru.com/toll/v2/origin-destination-waypoints";
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
                "from": source,
                "to": destination,
                "serviceProvider": "gmaps",
                "vehicle": {
                   "type": vehicle,
                },
                "departure_time": departureTime
            }
        ),
    });
    const tollInfo = await response.json();
    const route = tollInfo["summary"]["route"];
    const originAddress = route[0]["address"];
    const originLat = route[0]["location"]["lat"];
    const originLng = route[0]["location"]["lng"];
    const destinationAddress = route[1]["address"];
    const destinationLat = route[1]["location"]["lat"];
    const destinationLng = route[1]["location"]["lng"];
    const decodedPolyline = decode(tollInfo["routes"][0]["polyline"])
    const roadName = tollInfo["routes"][0]["summary"]["name"];
    const tolls = tollInfo['routes'][0]['tolls']

    let tollGantry = [];
    for (let i of tolls) {
        let toll = {
            name: i.name,
            lat: i.lat,
            lng: i.lng,
            tagCost: i.tagCost,
            cashCost: i.licensePlateCost
        };
        tollGantry.push(toll);
    }

    const result = {
        route: [
            {
                "tollFacility": {
                    "name": roadName,
                },
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
                'tollGantry': tollGantry,
                "polyline": decodedPolyline,
                'paymentMethod': payment
            },
        ]
    };
    return result;
}


const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let polyline = null;
let originMarker = null;
let destinationMarker = null;

function setupMapAndRoute(routeData) {

    //Set up the map
    const origin = routeData.origin;
    const destination = routeData.destination;
    const polylinePoints = routeData.polyline;

    map.fitBounds([
        [origin.origin_lat, origin.origin_lng],
        [destination.destination_lat, destination.destination_lng]
    ]);


    if (polyline) {
        polyline.remove(map);
    }
    polyline = L.polyline(polylinePoints.map(point => point.reverse()), {color: 'blue'}).addTo(map);
    if (originMarker) {
        originMarker.remove(map);
    }
    originMarker = L.marker([origin.origin_lat, origin.origin_lng]).addTo(map);
    if (destinationMarker) {
        destinationMarker.remove(map);
    }
    destinationMarker = L.marker([destination.destination_lat, destination.destination_lng]).addTo(map);

    // Set up the Toll Facility Name
    const tollName = routeData.tollFacility["name"];
    const tollNameElement = document.querySelector('.toll-name');
    if (tollNameElement) {
        tollNameElement.textContent = tollName;
    }

    // Generate toll gantry list
    if (routeData.tollGantry) {
        generateGantryDivs(routeData.tollGantry, routeData.paymentMethod);
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
    // Generate the toll gantry and cost breakdown
    function generateGantryDivs(tollGantry, payment) {
        const breakdownContainer = document.querySelector('.breakdown-line');
        breakdownContainer.innerHTML = "";

        let totalCost = 0;
    
        tollGantry.forEach(gantry => {

            if (payment === 'E-Tag') {
                totalCost += gantry.tagCost;
            } else { // by default, use cash cost
                totalCost += gantry.cashCost;
            }

            const breakdownDiv = document.createElement('div');
            breakdownDiv.className = 'breakdown';
    
            const gantryNameDiv = document.createElement('div');
            gantryNameDiv.className = 'gantry-name';
            gantryNameDiv.textContent = gantry.name;
    
            const priceDiv = document.createElement('div');
            priceDiv.className = 'price-1 price-5';
            priceDiv.textContent = `$${(payment === 'E-Tag' ? gantry.tagCost : gantry.cashCost).toFixed(2)}`;
    
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
        totalPriceDiv.textContent = `$${totalCost.toFixed(2)}`;;
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