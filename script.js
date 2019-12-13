"use strict";

// global variables
var map;
var marker;
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
        map = L.map('mapid').setView([39.8283, -98.5795], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        // sets the view to the center of the united states
         //zoom level is 3 on desktop
        map = L.map('mapid').setView([39.8283, -98.5795], 3);
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
    var url = "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/FindZipCodesInRadius?zipcode=" + zip + "&minimumradius=0&maximumradius=" + mileRad + "&key=KJUOH0TRE1UOXU7FMCD9";

    return url;
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
// too many requests error
var requestError = {
    appear: function() {
        document.querySelector(".request-error").style.transform = "translateY(0px)";
    },
    close: function() {
        document.querySelector(".request-error").style.transform = "translateY(-50px)";
        location.reload();
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
    var input = document.getElementById("zipInput").value;

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            // if readyState repsonse is ready and status is "OK"
            // push zipData into closestZips array
            var zipData = JSON.parse(this.responseText);
            for (var i = 0; i < zipData.DataList.length; i++) {
                closestZips.push(zipData.DataList[i]);
            }
            // clear input
            document.getElementById("zipInput").value = "";
            clearError();

            // throw error if zipcode is not valid
        } else if (input === "" || !/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(input)) {
            errorHandle();
            document.getElementById("error").innerHTML = error;
        } else if (this.status == 429) {
            loading.off();
            requestError.appear();
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
            if (allWalmartStores[i].postalCode === closestZips[a].Code) {
                closestStores.push(allWalmartStores[i]);
                // distances between user's zip and store location
                distances.push(closestZips[a].Distance);
            }
        }
    }

    // hide the pre text
    document.querySelector(".pre-text").style.display = "none";

    //check if element exists, if not
    // output results to DOM
    var li = $("#stores li");
    if (li.length === 0) {
        display();
    } else {
        document.getElementById("stores").innerHTML = "";
        display();
    }

    // once everything has loaded, turn loading screen off
    loading.off();
}

// output results to DOM
function display() {
    var smallestMileRad = Math.min.apply(null, distances);
    var index = distances.indexOf(smallestMileRad);

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

    // check if there are any stores nearby
    if (closestStores.length === 0) {
        loading.off();
        document.querySelector(".pre-text").style.display = "block";
        document.querySelector(".pre-text").innerHTML = "No stores nearby. Try a different mile radius";
    }

    setMap();
}

// change map view and add markers based on location
function setMap() {
    // smallest number of array
    var smallestMileRad = Math.min.apply(null, distances);

    // zoom in closer to map based on location
    map.setView(new L.LatLng(closestStores[0].latitude, closestStores[0].longitude), 10);

    // add markers
    for (var k = 0; k < closestStores.length; k++) {
        marker = new L.marker([closestStores[k].latitude, closestStores[k].longitude]);
        markerGroup.addLayer(marker);
    }
}

// center map to targeted list item, when clicked
function centerOnClick() {
    var index = $("#stores li").index(this);
    
    marker = new L.marker([closestStores[index].latitude, closestStores[index].longitude]).addTo(map)
    .bindPopup(closestStores[index].address1)
    .openPopup();

    map.setView(new L.LatLng(closestStores[index].latitude, closestStores[index].longitude), 13);
}

function resetArrays() {
    closestZips = [];
    allWalmartStores = [];
    closestStores = [];
    distances = [];
}

// call other functions in order here
function loadDoc() {
    markerGroup.clearLayers(); // clear markers before adding new
    loading.on(); // on button click, turn on loading screen
    zipRad();
    walmartStores();
    setTimeout(findClosestStores, 2000);
    resetArrays();
}

// event listeners
function createEventListeners() {
    var search = document.getElementById("btn");
    var close = document.getElementById("close");

    if (search.addEventListener) {
        search.addEventListener("click", loadDoc, false);
    } else if (search.attachEvent) {
        search.attachEvent("onclick", loadDoc);
    }

    // add event when user hits enter key
    $(document).keypress(function(e) {
        var key = (e.keyCode ? e.keyCode : e.which);
        if (key == "13") {
            e.preventDefault();
            loadDoc();
        }
    });

    // reload page once incase of issues
    if (window.addEventListener) {
        window.addEventListener("load", reloadOnce, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", reloadOnce);
    }

    // when a store is clicked in the list of stores,
    // center the view to that store
    $("body").on("click", "#stores li", centerOnClick);

    if (close.addEventListener) {
        close.addEventListener("click", requestError.close, false);
    } else if (close.attachEvent) {
        close.attachEvent("click", requestError.close);
    }
}

// global function calls
initMap();
var markerGroup = L.layerGroup().addTo(map); // must be initialized after setting map
createEventListeners();