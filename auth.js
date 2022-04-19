const express = require('express');
const router = express.Router();
const authUtils = require('../utils/auth');
const passport = require('passport');
const flash = require('connect-flash');

// Functions
// --------------------------------------------------
function ValidateEmail(mail) //pulled from https://www.w3resource.com/javascript/form/email-validation.php
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

// Create login page
// --------------------------------------------------
router.get('/login', (req, res, next) => {
  const messages = req.flash();
  res.render('login', { messages });
});
// --------------------------------------------------

// Handle login request
// --------------------------------------------------
router.post('/login', passport.authenticate('local', 
{ failureRedirect: '/auth/login', 
    failureFlash: 'Wrong username or password'}), (req, res, next) => {
  res.redirect('/dashboard');
});
// --------------------------------------------------

// Create register page
// --------------------------------------------------
router.get('/register', (req, res, next) => {
  const messages = req.flash();
  res.render('register', { messages });
});
// --------------------------------------------------

// Handle register request
// --------------------------------------------------
router.post('/register', (req, res, next) => {
    const registrationParams = req.body;
    const users = req.app.locals.users;
    if (registrationParams.tutor == "on"){
        tutor = true;
    }
    else {
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

    const payload = {
        fName: req.body.fName.toLowerCase(),
        lName: req.body.lName.toLowerCase(),
        username: req.body.username.toLowerCase(),
        phone: req.body.phone,
        telephone: req.body.telephone,
        grade: req.body.grade,
        phone: req.body.phone,
        email: req.body.email,
        tutor: tutor,
        username: registrationParams.username,
        password: authUtils.hashPassword(registrationParams.password),
    };
  
    users.insertOne(payload, (err) => {
      if (err) {
        console.log("there was an error");
        req.flash('error', 'User account already exists.');
      } else {
        req.flash('success', 'User account registered successfully.');
      }
  
      res.redirect('/auth/login');
    })
  });

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;