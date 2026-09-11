const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapToken}`,
    center: coordinates, // Use the variable passed from EJS
    zoom: 9,
    attributionControl: false
});
const popup = new maplibregl.Popup({ offset: 25 })
    .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`);

const marker = new maplibregl.Marker({ color: "red" })
    .setLngLat(coordinates) // Use the variable passed from EJS
    .setPopup(popup)
    .addTo(map);