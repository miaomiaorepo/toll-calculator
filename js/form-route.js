document.addEventListener('DOMContentLoaded', function () {

    var vehicleType = '';
    var paymentMethod = '';
    var originValue = '';
    var destinationValue = '';
    var axleValue = '';
    var vehicleValue = '';

    // Setup the vehicle dropdown
    var vehicleTrigger = document.getElementById('vehicle-trigger');
    var vehicleMenu = document.getElementById('vehicle-menu');
    var vehicleLabel = vehicleTrigger.querySelector('.label');
    var vehicleInput = '';

    vehicleTrigger.addEventListener('click', function (event) {
        vehicleMenu.classList.toggle('show');
        event.stopPropagation(); // Prevents the document click event from firing
    });

    var dropdownItems = vehicleMenu.querySelectorAll('a');
    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function() {
            vehicleInput = this.textContent; 
            vehicleLabel.textContent = vehicleInput ? vehicleInput : 'Vehicle';
            vehicleMenu.classList.remove('show'); 

            // Select vehicleValue 
            if (vehicleInput === "Car, Pickup truck") {
                vehicleValue = "Auto";
            } else {
                vehicleValue = vehicleInput;
            }     
            event.stopPropagation()
        });
    });

    document.addEventListener('click', function (event) {
        if (!vehicleMenu.contains(event.target)) {
            vehicleMenu.classList.remove('show');
        }
    });

    // Set up the axle
    var axleTrigger = document.getElementById('axle-trigger');
    var axleMenu = document.getElementById('axle-menu');
    var axleLabel = axleTrigger.querySelector('.label');
    var axleinput = '';

    axleTrigger.addEventListener('click', function (event) {
        axleMenu.classList.toggle('show');
        event.stopPropagation(); 
    });

    var axleItems = axleMenu.querySelectorAll('a');
    axleItems.forEach(function(item) {
        item.addEventListener('click', function() {
            axleInput = this.textContent; 
            axleLabel.textContent = axleInput ? axleInput : 'Axles';
            //select axleValue
            axleValue = axleInput.replace(/\s+/g, '');

            axleMenu.classList.remove('show'); // Close the dropdown after selection
            event.stopPropagation()
        });
    });

    document.addEventListener('click', function (event) {
        if (!axleMenu.contains(event.target)) {
            axleMenu.classList.remove('show');
        }
    });

    // Setup the date picker
    flatpickr('#datePicker', {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });

    document.getElementById('iconClick').addEventListener('click', function() {
        document.getElementById('datePicker').click();
    });

    //Get the input from the address input field
    var inputOrigin = document.getElementById('input-origin');
    var inputDestination = document.getElementById('input-destination');

    inputOrigin.addEventListener('input', function() {
        originValue = this.value;
    });

    inputDestination.addEventListener('input', function() {
        destinationValue = this.value;
    });

    // Get payment values

    var checkboxCash = document.getElementById('checkboxCash');
    var checkboxETag = document.getElementById('checkboxETag');

    // Only allow one checkbox to be checked at a time
    checkboxCash.addEventListener('change', function() {
        // Uncheck 'checkboxETag' if 'checkboxCash' is checked
        if (this.checked) {
            checkboxETag.checked = false;
        }
    });

    checkboxETag.addEventListener('change', function() {
        // Uncheck 'checkboxCash' if 'checkboxETag' is checked
        if (this.checked) {
            checkboxCash.checked = false;
        }
    });

    var checkboxes = document.querySelectorAll('.checkbox-input');

    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                paymentMethod = this.nextElementSibling.nextElementSibling.textContent;
            }else {
                paymentMethod = '';
            }
        });
    });

     // Forming JSON object;
    var searchButton = document.getElementById('search-button');
    var formData;
    searchButton.addEventListener('click', function() {

        vehicleType = axleValue + vehicleValue

        formData = {
        originAddress: inputOrigin.value,
        destinationAddress: inputDestination.value,
        vehicle: vehicleType,
        payment: paymentMethod,
        departureTime: datePicker.value ? new Date(datePicker.value).getTime() : Math.round(Date.now() / 1000)
        };

        // Call the API
    getTollFee({ address: inputOrigin.value }, 
        { address: inputDestination.value }, 
        vehicleType || "2AxlesAuto",
        datePicker.value ? Math.round(new Date(datePicker.value).getTime() / 1000) : Math.round(Date.now() / 1000),
        paymentMethod || "cash")

    .then(data => {
        const routeData = data.route[0];
        setupMapAndRoute(routeData);
    })
    .catch(error => console.error('Error calling the API:', error));
        console.log('Form Data:', JSON.stringify(formData));
    });

    // Reset the form
    var resetDiv = document.querySelector('.reset-button');
    resetDiv.addEventListener('click', function() {

        // Reset functionality here
        if (inputOrigin) {
            inputOrigin.value = '';
        }
        if (inputDestination) {
            inputDestination.value = '';
        }
        if (datePicker) {
            datePicker.value = '';
        }

        const priceDiv = document.querySelector('.price.price-5');
        if (priceDiv) {
            priceDiv.textContent = '$0.00';
        }
        
        vehicleLabel.textContent = "Vehicle Type";
        axleLabel.textContent = "Axles";

        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });

        vehicleInput = '';
        vehicleValue = '';
        axleInput = '';
        axleValue = '';
        paymentMethod = '';

        formData = {
            originAddress: '',
            destinationAddress: '',
            vehicle: '',
            payment: '',
            departureTime: ''
        };

        //back to the default map
        initMap()

        });

});



