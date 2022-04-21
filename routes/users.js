const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const ObjectID = require('mongodb').ObjectID;

User = require("../models/user");


// Rendering user profile view
// --------------------------------------------------
router.get('/userprofile', function(req, res, next) {
    if (!req.isAuthenticated()) { 
      res.redirect('/login');
    }
    else{
        res.render("userprofile");
    }
});

// Handle updating user profile data
// --------------------------------------------------
router.post('/userprofile', async (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.redirect('/login');
    }

    const users = req.app.locals.users;
    const _id = ObjectID(req.session.passport.user);
  
    const { username, fName, lName,
        email, phone } = req.body;

    users.updateOne({ _id }, { $set: { username, fName, lName, phone, email } }, (err) => {
      if (err) {
        throw err;
      }
      res.redirect('/userprofile');
    });
  });

module.exports = router



