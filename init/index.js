const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const mongoose = require("mongoose");
const maptilerClient = require("@maptiler/client");
const initdata = require("./data");
const Listing = require("../models/listing.js");
const Mongo_url = "mongodb://127.0.0.1:27017/wonderlust";
const mapToken = process.env.MAP_TOKEN;


maptilerClient.config.apiKey = mapToken;
main().catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo_url);
    await initDB();
    await mongoose.connection.close();
}

const initDB = async () => {
    await Listing.deleteMany({});

    const listings = [];

    for (let obj of initdata.data) {
        const response = await maptilerClient.geocoding.forward(
            obj.location,
            { limit: 1 }
        );

        if (response.features.length === 0) {
            console.log(`No location found for ${obj.location}`);
            continue;
        }

        listings.push({
            ...obj,
            owner: "6a9ff98d30576081f4f1b381",
            geometry: response.features[0].geometry
        });
    }

    await Listing.insertMany(listings);

    console.log("added");
};