const express = require('express');
const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash');
const ObjectID = require('mongodb').ObjectID;

User = require("../models/user");
LocalStrategy = require("passport-local"),


passport.use(new LocalStrategy(User.authenticate()));

router.use(passport.initialize());
router.use(passport.session());

// Functions
// --------------------------------------------------
function setUserIDResponseCookie(req, res, next) { //sets cookie during login, pulled from https://stackoverflow.com/questions/12258795/how-to-access-cookie-set-with-passport-js
    // if user-id cookie is out of date, update it
    if (req.user?.id != req.cookies["currentUser"]) {
        // if user successfully signed in, store user-id in cookie
        if (req.user) {
            res.cookie("currentUser", req.user.username, {
                // expire in year 9999 (from: https://stackoverflow.com/a/28289961)
                expires: new Date(253402300000000),
                httpOnly: false, // allows JS code to access it
            });
        } else {
            res.clearCookie("currentUser");
        }
    }
    next();
}

function ValidateEmail(mail) //pulled from https://www.w3resource.com/javascript/form/email-validation.php
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

// get login page
// --------------------------------------------------
router.get("/login", (req, res) => {
    res.render("login");
});

// authenticate login to go to homepage 
// --------------------------------------------------
router.post("/login", passport.authenticate("local"),  setUserIDResponseCookie, function (req, res, next) { //saves username as cookie
    if (req.user) {
        res.redirect("/dashboard");
    } else {
        res.redirect("/auth/login");
    }
    next();
});

// get register page
// --------------------------------------------------
router.get("/register", (req, res) => {
    res.render("register");
});

// posting to regiseter 
// --------------------------------------------------
router.post("/register", (req, res) => {
    if (req.body.tutor == "on"){ //check status of tutor textbox
        tutor = true;
    }else{
        tutor = false;
    }
    if (!ValidateEmail(req.body.email)){
        return res.send("<script> alert('Please Enter A Valid Email'); window.location =  '/register'; </script>")
    }
    res.cookie("currentUser", req.body.username, {
        // expire in year 9999 (from: https://stackoverflow.com/a/28289961)
        expires: new Date(253402300000000),
        httpOnly: false, // allows JS code to access it
    });
        User.register(new User({
            fName: req.body.fName.toLowerCase(),
            lName: req.body.lName.toLowerCase(),
            username: req.body.username.toLowerCase(),
            phone: req.body.phone,
            telephone: req.body.telephone,
            grade: req.body.grade,
            phone: req.body.phone,
            email: req.body.email,
            tutor: tutor,
        }), req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.render("register");
            }else if(tutor){
                console.log("to courses")
                res.render("courses");
            }else{
                passport.authenticate("local")(req, res, function () {
                res.redirect("/auth/login");
                })
            }
        })
    })

// Rendering change password view 
// --------------------------------------------------
router.get("/changepassword", (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        console.log("i am here")
        res.render("changepassword");
    }
});

// Handle password change request
// --------------------------------------------------
router.post("/changepassword", async (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("i am not authenticated")
        res.redirect('/login');
    }

    else{

    current_password = req.body.curr_password;
    new_password = req.body.new_password;
    retyped_new_password = req.body.retyped_new_password;

    //check if the new password and retyped password are the same 
    if (new_password != retyped_new_password){
        console.log("the new password and retyped password do not match");
        throw err
    } 
    else{
        const _id = ObjectID(req.session.passport.user);
        
        user = await User.findById(_id);
        user.changePassword(req.body.curr_password, req.body.new_password);
        res.redirect('/auth/login');
    }   
}});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;