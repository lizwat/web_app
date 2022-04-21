const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

User = require("../models/user");

// Rendering tutors dashboard view
// --------------------------------------------------
router.get("/tutors", async (req, res)=>{
    console.log("i am here");
    var users =  await User.find({});
    res.render("tutors", {"users": users});
 })

// Post to tutors 
// --------------------------------------------------
 router.post("/tutors", async (req, res)=> {
    let tutor =  req.body.username;
    var user = await User.find({username: tutor})
    //res.redirect('/tutors/rate_tutors', {"users": user})
    res.render("rate_tutors", {"users": user});
}) 

router.get("/rate_tutors", (req,res)=>{
    res.render("rate_tutors", {"users": user});
});

module.exports = router
