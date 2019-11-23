"use strict";

// initialize map view when page loads
function initMap() {
    var map = L.map('mapid').setView([39.8283, -98.5795], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// global function calls
initMap();