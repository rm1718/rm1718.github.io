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
            timeout: 15000,
            maximumAge: 0,

        };
        navigator.geolocation.getCurrentPosition(function (pos) {
            lastLat = pos.coords.latitude;
            lastLong = pos.coords.longitude;
            lastimeStamp = pos.timestamp;
        }, showError, options);
        watchId = navigator.geolocation.watchPosition(onNewPosition, showError, options);
    } else {
        //location is not supported by this browser
        showSetupError("Geolocation is not supported by this browser");
    }
}

function onNewPosition(position) {
    var distance = getDistanceBetweenPoints(position.coords.latitude, position.coords.longitude, lastLat, lastLong);
    var time = ((position.timestamp - lastimeStamp) / 1000);
    var speed = distance / time;

    //update speedometer
    if (speed != NaN) {
        //$("#speedo-meter").text(` at ${Math.floor(speed * 3.6)} km/h`);
        $("#speedo-meter").text(` at acc: ${position.coords.accuracy} lat: ${position.coords.latitude}, long: ${position.coords.longitude}, time: ${time}, distance: ${Math.floor(distance)}, speed: ${Math.floor(speed * 3.6)} km/h`);
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
var watchId;

//minimum velocity in m/s
const urlParams = new URLSearchParams(window.location.search);
const minVelocity = parseFloat(urlParams.get('minvelocity')) / 3.6;
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