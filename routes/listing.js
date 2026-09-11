const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedin, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listing");
const multer = require('multer');
const { storage } = require("../cloudconfig");
// const upload = multer({ dest: 'uploads/' });//creates upload automatically
const upload = multer({ storage });


router.route("/")
    .get(wrapAsync(listingController.index))//index route
    .post(isLoggedin, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing))//create route>>add new listing
    .get(wrapAsync(listingController.searchListing));
// new route 
router.get("/new", isLoggedin, wrapAsync(listingController.renderNewForm));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))//show route
    .put(isLoggedin, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))//update route
    .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyListing));//delete route

//edit route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));




module.exports = router;