/**
 * Definition
 */
var watchId;

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
            timeout: 15000,
            maximumAge: 0,

        };
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                lastLat = pos.coords.latitude;
                lastLong = pos.coords.longitude;
                lastimeStamp = pos.timestamp;

                watchId = navigator.geolocation.watchPosition(
                    onNewPosition,
                    function (err) {
                        showError(err, true);
                    }, 
                    options);
            },
            function (err) {
                showError(err, false);
            },
            options);
    } else {
        //location is not supported by this browser
        showSetupError("Geolocation is not supported by this browser");
    }
}

function onNewPosition(position) {
    var time = ((position.timestamp - lastimeStamp) / 1000);
    if (time < 3) {
        //wait till movement is stable enough
        return;
    }

    var distance = getDistanceBetweenPoints(position.coords.latitude, position.coords.longitude, lastLat, lastLong);
    var speed = Math.floor((distance / time) * 3.6);

    //update speedometer
    if (speed != NaN) {
        $("#speedo-meter").text(` at ${speed} km/h`);
    }
    else {
        return;
    }

    //set for next position
    lastimeStamp = position.timestamp;
    lastLat = position.coords.latitude;
    lastLong = position.coords.longitude;

    if (waitingPoints.length == 0 && speed <= minVelocity) {
        waitingPoints.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            startUnixTimeStamp: position.timestamp,
            waitingSeconds: 0,
            isClosed: false
        });
        return;
    }

    if (waitingPoints.length > 0) {
        var last = waitingPoints[waitingPoints.length - 1];

        if (speed <= minVelocity) {
            if (last.isClosed) {
                waitingPoints.push({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    startUnixTimeStamp: position.timestamp,
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

function showError(error, travelling) {
    if (error.code == error.PERMISSION_DENIED) {
        showSetupError("You denied the usage of your location, but we need your location to get the speed of your device")
        return;
    }

    if (travelling) {
        return;
    }

    switch (error.code) {
        case error.POSITION_UNAVAILABLE:
            showSetupError("Location information is unavailable. Try again with better GPS");
            break;
        case error.TIMEOUT:
            showSetupError("Verifing the usage of your location timed out. Try again");
            break;
        case error.UNKNOWN_ERROR:
            showSetupError("An unknown error occurred. Try again");
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

    // convert to records
    // 
    // We ignore all waiting points with waiting seconds below 6 seconds,
    // because of inaccuracy of GPS we can distinguish between actual stop
    // or jitter.
    // 
    // One record has max 192bit
    var waitingPointRecords = [];
    for (let i = 0; i < waitingPoints.length; i++) {
        var wPoint = waitingPoints[i];
        if (wPoint.waitingSeconds > 6) {
            waitingPointRecords.push({
                latitude: wPoint.latitude,
                longitude: wPoint.longitude,
                waitingSeconds: wPoint.waitingSeconds
            });
        }
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

function getDistanceBetweenPoints(lat1Deg, lon1Deg, lat2Deg, lon2Deg) {
    function toRad(degree) {
        return degree * Math.PI / 180;
    }

    const lat1 = toRad(lat1Deg);
    const lon1 = toRad(lon1Deg);
    const lat2 = toRad(lat2Deg);
    const lon2 = toRad(lon2Deg);

    const { sin, cos, sqrt, atan2 } = Math;

    const R = 6371000;
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = sin(dLat / 2) * sin(dLat / 2)
        + cos(lat1) * cos(lat2)
        * sin(dLon / 2) * sin(dLon / 2);
    const c = 2 * atan2(sqrt(a), sqrt(1 - a));
    const d = R * c;
    return d; // distance in m
}

/**
 * Execution
 */

var jQTrafficLightId = "#traffic-light-image"
var yellowTrafficLightImgPath = "/images/traffic-light-yellow.png";
var greenTrafficLightImgPath = "/images/traffic-light-green.png";

//minimum velocity in m/s
const urlParams = new URLSearchParams(window.location.search);
const minVelocity = parseFloat(urlParams.get('minvelocity'));
var lastLat = 0;
var lastLong = 0;
var lastimeStamp = 0;

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