"use strict";

// initialize map view when page loads
function initMap() {
    var mobile = window.matchMedia("(max-width: 768px)");

    if (mobile.matches) {
        // sets the view to the center of the united states
        //zoom level is 2 on mobile
        var map = L.map('mapid').setView([39.8283, -98.5795], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        // sets the view to the center of the united states
         //zoom level is 3 on desktop
        var map = L.map('mapid').setView([39.8283, -98.5795], 3);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
}

// returns a url endpoint containing user's zip code input and
//desired mile radius
function getURL() {
    var zip = document.getElementById("zipInput").value;
    var select = document.getElementById("selectMiles");
    var mileRad = select.options[select.selectedIndex].value;
    var url = "https://www.zipcodeapi.com/rest/GmiyTSTTuReA0ppnY5NodOpUIjuC1TBX4zf9zVGMsYjkReSFb8AJLdhSJAHqn27M/radius.json/" + zip + "/" + mileRad + "/mile";

    return url;
}

// checks zip code matches regular expression
function validZip() {
    var url = getURL();
    var searchIndex = url.search("radius.json/");
    var subString = url.substring(searchIndex + 12, 114);

    var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(subString);

    if (isValidZip) {
        return true;
    } else {
        return false;
    }
}

// global function calls
initMap();