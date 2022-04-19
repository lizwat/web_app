//Imports
const express = require('express')
const router = express.Router();
User = require("../models/user");
passport = require("passport")
LocalStrategy = require("passport-local")
const authController = require('../controllers/authController')

//passport
passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding
passport.use(new LocalStrategy(User.authenticate()));
    
router.use(passport.initialize());
router.use(passport.session());

//functions
function isLoggedIn(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//routes
router.get("/", authController.login_get);
router.post("/", authController.login_post);



router.get("/userprofile", authController.userprofile_get1);
router.post('/userprofile', authController.userprofile_post1);

module.exports = router