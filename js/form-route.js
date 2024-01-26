document.addEventListener('DOMContentLoaded', function () {
    var dropdownTrigger = document.querySelector('.vehicle');
    var dropdownMenu = document.querySelector('.vehicle .dropdown-menu');

    // Toggle the dropdown on clicking the trigger
    dropdownTrigger.addEventListener('click', function (event) {
        dropdownMenu.classList.toggle('show');
        event.stopPropagation(); // Prevents the document click event from firing
    });

    // Event listener to record the value of the clicked item
    var dropdownItems = dropdownMenu.querySelectorAll('a');
    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function() {
            var vehicleType = this.textContent; 
            console.log(vehicleType); 

            dropdownMenu.classList.remove('show'); // Close the dropdown after selection
        });
    });

    // Close the dropdown if clicked outside
    document.addEventListener('click', function (event) {
        if (!dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
});
