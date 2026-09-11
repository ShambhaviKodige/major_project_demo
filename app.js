const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/user");


app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const db_url = process.env.ATLASDB_URL;

main().catch((err) => { console.log(err); });
async function main() {
    await mongoose.connect(db_url);
};

const store = new MongoStore({
    url: db_url,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("mongosession store error", error);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //1 week
        maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
        httpOnly: true, //to prevent client side script to access the cookie
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//error handling
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err; // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("server is listening to port");
});



