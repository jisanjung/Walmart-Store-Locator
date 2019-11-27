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

// global function calls
initMap();