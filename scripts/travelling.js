/**
 *  Data for testing 
 * 
 *  {
        latitude: 49.01230471623594,
        longitude: 8.396098558159043,
        startUnixTimeStamp: 1736636189000,
        waitingSeconds: 30,
        isClosed: true
    },
    {
        latitude: 49.01062987955606,
        longitude: 8.397922460303354,
        startUnixTimeStamp: 1736636265000,
        waitingSeconds: 10,
        isClosed: true
    },
    {
        latitude: 49.008434209993574,
        longitude: 8.402020875709985,
        startUnixTimeStamp: 1736637173000,
        waitingSeconds: 50,
        isClosed: false
    }
 */

async function startTravel() {
    var trafficLightInterval = 1000;
    $(jQTrafficLightId).attr("src", yellowTrafficLightImgPath);
    await wait(trafficLightInterval);
    $(jQTrafficLightId).attr("src", greenTrafficLightImgPath);
    await wait(trafficLightInterval);

    startWatchingPosition();
}

function startWatchingPosition() {
    //check for permission of location
    if (navigator.geolocation) {
        $("#error-container").attr("hidden", true);
        $("#start-trip-container").attr("hidden", true);
        $("#travelling-container").attr("hidden", false);

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };
        navigator.geolocation.getCurrentPosition(onNewPosition, showError, options);
        watchId = navigator.geolocation.watchPosition(onNewPosition, showError, options);
    } else {
        //location is not supported by this browser
        showSetupError("Geolocation is not supported by this browser");
    }
}

function onNewPosition(position) {
    if (position.coords.speed != null) {
        showSetupError("Your browser isn't able to estimate the speed. Try changing your device or browser!");
        navigator.geolocation.clearWatch(watchId);
        return;
    }

    if (waitingPoints.length == 0 && position.coords.speed <= minVelocity) {
        waitingPoints.push({
            latitude: position.coords.latitude,
            longitude: position.coord.longitude,
            startUnixTimeStamp: Date.now() / 1000,
            waitingSeconds: 0,
            isClosed: false
        });
        return;
    }

    if (waitingPoints.length > 0) {
        var last = waitingPoints[waitingPoints.length - 1];

        if (position.coords.speed <= minVelocity) {
            if (last.isClosed) {
                waitingPoints.push({
                    latitude: position.coords.latitude,
                    longitude: position.coord.longitude,
                    startUnixTimeStamp: Date.now() / 1000,
                    waitingSeconds: 0,
                    isClosed: false
                });
            }
        }
        else {
            if (!last.isClosed) {
                last.waitingSeconds = (Date.now() - last.startUnixTimeStamp) / 1000;
                last.isClosed = true;
            }
        }
    }
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            showSetupError("You denied the usage of your location, but we need your location to get the speed of your device");
            break;
        case error.POSITION_UNAVAILABLE:
        case error.TIMEOUT:
        case error.UNKNOWN_ERROR:
            break;
    }
}

function showSetupError(errorMessage) {
    $("#error-message").text(errorMessage);

    $("#travelling-container").attr("hidden", true);
    $("#start-trip-container").attr("hidden", true);
    $("#error-container").attr("hidden", false);
}

function navToBack() {
    history.back();
}

function navToResult() {
    navigator.geolocation.clearWatch(watchId);

    //close last if not closed already
    if (waitingPoints.length > 0) {
        var last = waitingPoints[waitingPoints.length - 1];
        if (!last.isClosed) {
            last.waitingSeconds = (Date.now() - last.startUnixTimeStamp) / 1000;
            last.isClosed = true;
        }
    }

    //convert to records. One record has max 192bit
    var waitingPointRecords = [];
    for (let i = 0; i < waitingPoints.length; i++) {
        var wPoint = waitingPoints[i];
        waitingPointRecords.push({
            latitude: wPoint.latitude,
            longitude: wPoint.longitude,
            waitingSeconds: wPoint.waitingSeconds
        });
    }

    //local storage is 5MiB big => 218000 waiting points are possible => need a world tour for that...
    localStorage.setItem("waitingPoints", JSON.stringify(waitingPointRecords));
    window.location.replace("result.html");
}

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

/**
 * Execution
 */

var jQTrafficLightId = "#traffic-light-image"
var yellowTrafficLightImgPath = "/images/traffic-light-yellow.png";
var greenTrafficLightImgPath = "/images/traffic-light-green.png";
var watchId;

//minimum velocity in m/s
const urlParams = new URLSearchParams(window.location.search);
const minVelocity = parseFloat(urlParams.get('minvelocity')) / 3.6;

var waitingPoints = [];

$(function () {
    var goBtn = document.getElementById("go-btn");
    goBtn.addEventListener('click', startTravel);

    var backBtn = document.getElementById("back-btn");
    backBtn.addEventListener('click', navToBack);

    var arrivedBtn = document.getElementById("arrived-btn");
    arrivedBtn.addEventListener('click', navToResult);

    var errBackBtn = document.getElementById("err-back-btn");
    errBackBtn.addEventListener('click', navToBack);

    var retryBtn = document.getElementById("retry-btn");
    retryBtn.addEventListener('click', startWatchingPosition);
});