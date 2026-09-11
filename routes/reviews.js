const express = require("express");
const router = express.Router({ mergeParams: true }); //mergeParams:true is used to access the params of parent route in this case listing route
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { validateReview, isLoggedin, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/review");


//review >>post route
router.post("/", isLoggedin, validateReview, wrapAsync(reviewController.createReview));

//delete route for reviews
router.delete("/:reviewId", isLoggedin, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;