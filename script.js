"use strict";

// global variables
var closestZips = [];
var allWalmartStores = [];
var closestStores = [];
var distances = [];

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
    var url = "https://cors-anywhere.herokuapp.com/http://www.zipcodeapi.com/rest/nRkA21zrlgE0bPUQ0SMWsWi1aOJVxUiorurMuhe8gkR0AsrqneexnYJhhRKFgdUA/radius.json/" + zip + "/" + mileRad + "/mile";

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

// call this when there is an error
function errorHandle() {
    document.getElementById("zipInput").style.border = "solid 1px #ff0000";

    return "Invalid Zip Code";
}

// call this when request is successful
function clearError() {
    var zipInput = document.getElementById("zipInput");
    zipInput.style.borderTop = "none";
    zipInput.style.borderRight = "none";
    zipInput.style.borderLeft = "none";
    zipInput.style.borderBottom = "solid 1px #b4b4b4";
    document.getElementById("error").innerHTML = "";
}

// loading screen 
var loading = {
    loadScreen: document.querySelector(".loading"),
    on: function() {
        this.loadScreen.style.display = "block";
    },
    off: function() {
        this.loadScreen.style.display = "none";
    }
};

// reload the page only one time
function reloadOnce() {
    if(!window.location.hash) {
        window.location = window.location + '#loaded';
        window.location.reload(true);
    }
}

// find closest locations and push objects to closestZips
function zipRad() {
    var url = getURL(); // zip code api endpoint
    var error = errorHandle();
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            // if readyState repsonse is ready and status is "OK"
            // push zipData into closestZips array
            var zipData = JSON.parse(this.responseText);
            for (var i = 0; i < zipData.zip_codes.length; i++) {
                closestZips.push(zipData.zip_codes[i]);
            }
            // clear input
            document.getElementById("zipInput").value = "";

            // throw error if zipcode is not valid
        } else if (!validZip || this.status == 400 || this.status == 404) {
            errorHandle();
            document.getElementById("error").innerHTML = error;
        } else {
            // clear error
            clearError();
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

// pushes every walmart store into allWalmartStores
function walmartStores() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            // if readyState repsonse is ready and status is "OK"
            // push walmartData into allWalmartStores array
            var walmartData = JSON.parse(this.responseText);
            for (var i = 0; i < walmartData.length; i++) {
                allWalmartStores.push(walmartData[i]);
            }
        }
    };
    xhr.open("GET", "https://gist.githubusercontent.com/anonymous/83803696b0e3430a52f1/raw/29f2b252981659dfa6ad51922c8155e66ac261b2/walmart.json", true);
    xhr.send();
}

// find the closest walmart by filtering allWalmartStores with closestZips
function findClosestStores() {

    // filters thru 2 arrays and finds closest walmart store
    for (var i = 0; i < allWalmartStores.length; i++) {
        for (var a = 0; a < closestZips.length; a++) {
            if (allWalmartStores[i].postalCode === closestZips[a].zip_code) {
                closestStores.push(allWalmartStores[i]);
                // distances between user's zip and store location
                distances.push(closestZips[a].distance.toFixed(2));
            }
        }
    }

    // hide the pre text
    document.querySelector(".pre-text").style.display = "none";

    // output results to DOM
    display();

    // once everything has loaded, turn loading screen off
    loading.off();
}

// output results to DOM
function display() {
    for (var i = 0; i < closestStores.length; i++) {
        var li = document.createElement("li");
        var city = closestStores[i].city;
        var name = closestStores[i].name;
        var address = closestStores[i].address1;
        var phone = closestStores[i].phone_number;
        // values for text node goes into array
        var textNodes = [city, name, address, phone, distances[i]];

        // create p elements with values, then append inside li element
        // then append li elements to ul element
        for (var k = 0; k < textNodes.length; k++) {
            var p = document.createElement("p");
            var text = document.createTextNode(textNodes[k]);
            p.appendChild(text);
            li.appendChild(p);
            document.getElementById("stores").appendChild(li);
        }
    }
    // clear arrays once data is present in DOM
    closestZips = [];
    allWalmartStores = [];
    closestStores = [];
}

// clear items in the DOM and display new results
function replace() {
    var li = document.querySelector("#stores li");
    if (li) {
        document.getElementById("stores").innerHTML = "";
        display();
    }
}

// call other functions in order here
function loadDoc() {
    loading.on(); // on button click, turn on loading screen
    zipRad();
    walmartStores();
    setTimeout(findClosestStores, 3000);
    replace();
}

// event listeners
function createEventListeners() {
    var search = document.getElementById("btn");

    if (search.addEventListener) {
        search.addEventListener("click", loadDoc, false);
    } else if (search.attachEvent) {
        search.attachEvent("onclick", loadDoc);
    }

    // reload page once incase of issues
    if (window.addEventListener) {
        window.addEventListener("load", reloadOnce, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", reloadOnce);
    }
}

// global function calls
initMap();
createEventListeners();