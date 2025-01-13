var waitingPoints = [];
var markers = [];
var map;

function buildTotalWaitingTime() {
    var totalWaitingTime = 0;
    for (let i = 0; i < waitingPoints.length; i++) {
        totalWaitingTime += waitingPoints[i].waitingSeconds;
    }
    $("#total-waiting-time").text(getFormattedTime(totalWaitingTime));
}

function buildMap() {
    map = L.map('map').setView([49.0114523863874, 8.41375216035284], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    for (let i = 0; i < waitingPoints.length; i++) {
        var wPoint = waitingPoints[i];
        markers[i] = L.marker([wPoint.latitude, wPoint.longitude]).addTo(map);
        markers[i].bindPopup(waitingPointToHtml(i + 1, wPoint)).openPopup();
    }

    if (waitingPoints.length > 0) {
        var lastWPoint = waitingPoints[waitingPoints.length - 1];
        map.setView([lastWPoint.latitude, lastWPoint.longitude]);
    }
}

function buildList() {
    if (waitingPoints.length <= 0) {
        return;
    }

    var list = document.getElementById("waiting-locations");

    const placeholder = document.getElementById("placeholder-list-item");
    list.removeChild(placeholder);

    for (let i = 0; i < waitingPoints.length; i++) {
        var wPoint = waitingPoints[i];

        var listItem = document.createElement("a");
        listItem.setAttribute("href", "#");
        listItem.classList.add("list-group-item");
        listItem.classList.add("list-group-item-action");
        listItem.classList.add("list-item-no-wrap");
        listItem.innerHTML = waitingPointToHtml(i + 1, wPoint);
        listItem.addEventListener("click", function (event) {
            event.preventDefault();
            map.setView([wPoint.latitude, wPoint.longitude], 16);
            markers[i].openPopup();
        });

        list.appendChild(listItem);
    }
}

function waitingPointToHtml(place, waitingPoint) {
    var wTimeFormatted = getFormattedTime(waitingPoint.waitingSeconds);
    return `<b>${place}. Waiting Point</b><br>${wTimeFormatted}`;
}

function getFormattedTime(totalSeconds){
    var hours = getHours(totalSeconds);
    var minutes = getMinutes(totalSeconds);
    var seconds = getSeconds(totalSeconds);
    var formattedTime = "0h 0m 0s";

    if(seconds > 0){
        formattedTime = `${seconds}s`;
    }

    if(minutes > 0){
        formattedTime = `${minutes}m ` + formattedTime;
    }

    if(hours > 0){
        formattedTime = `${hours}h ` + formattedTime;
    }
    return formattedTime;
}

function getHours(totalWaitingTime) {
    return Math.floor(totalWaitingTime / 3600);
}

function getMinutes(totalWaitingTime) {
    return Math.floor(totalWaitingTime % 3600 / 60);
}

function getSeconds(totalWaitingTime) {
    return Math.floor(totalWaitingTime % 3600 % 60);
}

function restart() {
    history.back();
}

function home() {
    window.location.href = "../index.html";
}


/**
 * Execution
 */
$(function () {
    waitingPoints = JSON.parse(localStorage.getItem("waitingPoints"));

    var restartBtn = document.getElementById("restart-btn");
    restartBtn.addEventListener('click', restart);

    var homeBtn = document.getElementById("home-btn");
    homeBtn.addEventListener('click', home);

    buildTotalWaitingTime();
    buildMap();
    buildList();
});