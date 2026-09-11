const Listing = require("../models/listing");
const maptilerClient = require("@maptiler/client");
const mapToken = process.env.MAP_TOKEN;
maptilerClient.config.apiKey = mapToken;

module.exports.index = async (req, res) => {
    const { destination, category } = req.query;
    let filter = {};

    if (destination) {
        filter.$or = [
            { location: { $regex: destination, $options: "i" } },
            { country: { $regex: destination, $options: "i" } }
        ];
    }
    if (category) {
        filter.category = category;
    }

    const allListings = await Listing.find(filter);
    res.render("./listings/index.ejs", { allListings, category });
};

module.exports.renderNewForm = async (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await maptilerClient.geocoding.forward(req.body.listing.location, {
        limit: 1
    });
    let url = req.file.path;
    let filename = req.file.filename;
    let newList = new Listing(req.body.listing);
    newList.owner = req.user._id; //to add owner to the listing
    newList.image = { url, filename };
    newList.geometry = response.features[0].geometry;
    await newList.save();
    req.flash("success", "New Listing created successfully");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    let originalimgurl = listing.image.url;
    if (originalimgurl.includes("cloudinary.com")) {
        // For Cloudinary URLs
        originalimgurl = originalimgurl.replace("/upload/", "/upload/w_200,e_blur:10/");
    } else if (originalimgurl.includes("unsplash.com")) {
        // For Unsplash URLs
        originalimgurl = `${originalimgurl}&blur=10&w=200`;
    }

    res.render("./listings/edit.ejs", { listing, originalimgurl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    };
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted !");
    // console.log(deleted);
    res.redirect("/listings");
};

module.exports.searchListing = async (req, res) => {
    const { destination } = req.query;
    const listings = await Listing.find({
        $or: [
            { location: { $regex: destination, $options: "i" } },
            { country: { $regex: destination, $options: "i" } }
        ]
    });

    res.render("./listings/index.ejs", {
        listings,
        destination
    });
};