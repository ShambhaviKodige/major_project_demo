const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId, ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Castle", "Mountain", "Amazing Pools", "Camping", "Farms", "Artic", "Cave", "Boats", "others"],
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }

});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;