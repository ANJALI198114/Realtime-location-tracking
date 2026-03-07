const socket = io();

let userCount = 0;
const userCountElement = document.getElementById("userCount");

const markers = {};

// Red marker icon
const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [35, 55],
    iconAnchor: [17, 55]
});

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

const map = L.map("map").setView([0, 0], 20);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);


socket.on("receive-location", (data) => {

    const { id, latitude, longitude } = data;

    if (id === socket.id) {
        map.setView([latitude, longitude], 18);
    }

    if (markers[id]) {

        markers[id].setLatLng([latitude, longitude]);

    }
    else {

        const offsetLat = latitude + (Math.random() - 0.5) * 0.0001;
        const offsetLng = longitude + (Math.random() - 0.5) * 0.0001;

        markers[id] = L.marker([offsetLat, offsetLng], {
            icon: redIcon
        })
        .addTo(map)
        .bindTooltip(`User ${id.substring(0,4)}`, {
            direction: "top",
            offset: [0, -10],
            className: "user-label",
            opacity: 0.9
        });

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