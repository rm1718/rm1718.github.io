var velocityFromId = "minimum-velocity-form";
var jQMinVelocityInputId = "#minimum-velocity-input";

//init popover according to bootstrap: 
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

async function navToTravelling() {
    var form = document.getElementById(velocityFromId);

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    //get value before, so user can not change input anymore
    var minvelocity = $(jQMinVelocityInputId).val();
    window.location.href = "/html/travelling.html?minvelocity=" + minvelocity;
}



$(function () {
    //init form validation from bootstrap component
    var form = document.getElementById(velocityFromId);

    // prevent submission of form
    form.addEventListener('submit', event => {
        event.preventDefault();
        event.stopPropagation();
    }, false)

    var goBtn = document.getElementById("go-btn");
    goBtn.addEventListener('click', navToTravelling);
});