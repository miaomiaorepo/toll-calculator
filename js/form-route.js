document.addEventListener('DOMContentLoaded', function () {

    var vehicleType = '';
    var paymentMethod = '';
    var originValue = '';
    var destinationValue = '';

    // Setup the vehicle dropdown
    var vehicleTrigger = document.getElementById('vehicle-trigger');
    var vehicleMenu = document.getElementById('vehicle-menu');
    var vehicleLabel = vehicleTrigger.querySelector('.label');

    vehicleTrigger.addEventListener('click', function (event) {
        vehicleMenu.classList.toggle('show');
        event.stopPropagation(); // Prevents the document click event from firing
    });

    var dropdownItems = vehicleMenu.querySelectorAll('a');
    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function() {
            vehicleType = this.textContent; 
            vehicleLabel.textContent = vehicleType ? vehicleType : 'Vehicle';
            vehicleMenu.classList.remove('show'); // Close the dropdown after selection
            event.stopPropagation()
        });
    });

    // Close the dropdown if clicked outside
    document.addEventListener('click', function (event) {
        if (!vehicleMenu.contains(event.target)) {
            vehicleMenu.classList.remove('show');
        }
    });

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

    // Add event listeners to these checkboxes
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

     // Forming JSON object
    var searchButton = document.getElementById('search-button');
    var formData;
    searchButton.addEventListener('click', function() {
        formData = {
        originAddress: inputOrigin.value,
        destinationAddress: inputDestination.value,
        vehicle: vehicleType,
        payment: paymentMethod,
        Date: datePicker.value
        };

    getTollFee({ address: inputOrigin.value }, { address: inputDestination.value }, { type: vehicleType || "2AxlesTaxi" })
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
        
        vehicleLabel.textContent = "Vehicle";

        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });

        vehicleType = '';
        paymentMethod = '';

            formData = {
                originAddress: '',
                destinationAddress: '',
                vehicle: '',
                payment: '',
                Date: '',
                Hour: '',
            };
            console.log(formData);
        });

});



