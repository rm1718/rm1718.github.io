var setUpCheckContainerId = "#setup-check-result-container";
var setUpCheckResultMessageId = "#setup-check-result";
var setUpCheckSuccessIconId = "#setup-check-success-icon";
var setUpCheckErrorIconId = "#setup-check-error-icon";
var successMessageClassName = "success-message";
var errorMessageClassName = "error-message";

function navToPrepare() {
    window.location.href = "/html/prepare.html";
}

function checkSetup() {
    //check for permission for location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showSuccess, showError, {
            enableHighAccuracy: false,
            timeout: 5000
        });
    } else {        
        //location is not supported by this browser
        showCheckSetupError("Geolocation is not supported by this browser");
    }
}

function showSuccess(_) {
    $(setUpCheckContainerId).removeClass(errorMessageClassName);
    $(setUpCheckContainerId).addClass(successMessageClassName);

    $(setUpCheckResultMessageId).text("Your setup is approved and can be used");

    $(setUpCheckErrorIconId).attr("hidden", true);
    $(setUpCheckSuccessIconId).attr("hidden", false);
    $(setUpCheckResultMessageId).attr("hidden", false);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            showCheckSetupError("You denied the usage of your location, but we need your location to get the speed of your device")
            break;
        case error.POSITION_UNAVAILABLE:
            showCheckSetupError("Location information is unavailable. Try again with better GPS");
            break;
        case error.TIMEOUT:
            showCheckSetupError("Verifing the usage of your location timed out. Try again");
            break;
        case error.UNKNOWN_ERROR:
            showCheckSetupError("An unknown error occurred. Try again");
            break;
    }
}

function showCheckSetupError(errorMessage){
    $(setUpCheckContainerId).removeClass(successMessageClassName);
    $(setUpCheckContainerId).addClass(errorMessageClassName);

    $(setUpCheckResultMessageId).text(errorMessage);

    $(setUpCheckSuccessIconId).attr("hidden", true);
    $(setUpCheckResultMessageId).attr("hidden", false);
    $(setUpCheckErrorIconId).attr("hidden", false);
}

$(function () {
    var goBtn = document.getElementById("short-cut-go-btn");
    var shortCutGoBtn = document.getElementById("go-btn");
    var testSetupBtn = document.getElementById("test-setup-btn");

    goBtn.addEventListener('click', navToPrepare);
    shortCutGoBtn.addEventListener('click', navToPrepare);
    testSetupBtn.addEventListener('click', checkSetup);
});