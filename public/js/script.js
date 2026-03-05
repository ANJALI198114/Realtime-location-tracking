const socket = io();

let userCount = 0;
const userCountElement = document.getElementById("userCount");

const markers = {};

if (navigator.geolocation) {

    navigator.geolocation.watchPosition(

        (position) => {

            const { latitude, longitude } = position.coords;

            socket.emit("sendLocation", {
                latitude,
                longitude
            });

        },

        (error) => {
            console.log(error);
        },

        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }

    );

}

const map = L.map("map").setView([0,0], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);


socket.on("receive-location", (data) => {

    const { id, latitude, longitude } = data;

    map.setView([latitude, longitude]);

    if (markers[id]) {

        markers[id].setLatLng([latitude, longitude]);

    } 
    else {

        markers[id] = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`User: ${id.substring(0,6)}`);

        userCount++;
        userCountElement.textContent = userCount;

    }

});


socket.on("user-disconnected", (id) => {

    if (markers[id]) {

        map.removeLayer(markers[id]);

        delete markers[id];

        userCount--;

        userCountElement.textContent = userCount;

    }

});