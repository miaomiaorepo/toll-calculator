document.addEventListener('DOMContentLoaded', function () {

    var vehicleType = '';
    var paymentMethod = '';
    var originValue = '';
    var destinationValue = '';

    var dropdownTrigger = document.querySelector('.state-layer');
    var dropdownMenu = document.querySelector('.state-layer .dropdown-menu');

    // Toggle the dropdown on clicking the trigger
    dropdownTrigger.addEventListener('click', function (event) {
        dropdownMenu.classList.toggle('show');
        event.stopPropagation(); // Prevents the document click event from firing
    });

    // Event listener to record the value of the clicked item
    var dropdownItems = dropdownMenu.querySelectorAll('a');
    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function() {
            vehicleType = this.textContent; 
            dropdownMenu.classList.remove('show'); // Close the dropdown after selection
            event.stopPropagation()
        });
    });

    // Close the dropdown if clicked outside
    document.addEventListener('click', function (event) {
        if (!dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
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
        payment: paymentMethod
        };
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

        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });

        vehicleType = '';
        paymentMethod = '';

            formData = {
                originAddress: '',
                destinationAddress: '',
                vehicle: '',
                payment: ''
            };
            console.log(formData);
        });

});



