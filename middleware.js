const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

// module.exports.isLoggedin = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         //redirectUrl save is used when user not logged in and trying to add or edit listings and reviews
//         let redirectUrl = req.originalUrl;
//         if (redirectUrl.includes("/reviews/")) {
//             redirectUrl = redirectUrl.split("/reviews/")[0];
//         }
//         req.flash("error", "You must be logged in first");
//         return res.redirect("/login");
//         req.session.redirectUrl = req.originalUrl;
//     }
//     next();
// };
module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Only save the redirect URL if it's a GET request (viewing a page)
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        } else {
            // For DELETE/POST requests triggered while logged out, send back to the listing page
            const listingId = req.params.id;
            req.session.redirectUrl = listingId ? `/listings/${listingId}` : "/listings";
        }

        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveredirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//middlewares for validation schema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};