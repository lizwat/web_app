const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

User = require("../models/user");

// Rendering tutors dashboard view
// --------------------------------------------------
router.get("/", async (req, res)=>{
    console.log("i am here");
    var users =  await User.find({});
    res.render("tutors", {"users": users});
 })

// Post to tutors 
// --------------------------------------------------
 router.post("/", async (req, res)=> {
    console.log("i posted to tutors")
    let tutor =  req.body.username;
    var user = await User.find({username: tutor})
    //res.redirect('/tutors/rate_tutors', {"users": user})
    res.render("rate_tutors", {"users": user});
}) 


router.get("/rate_tutors", (req,res)=>{
    res.render("rate_tutors", {"users": user});
});

router.post("/rate_tutors", async (req, res)=> {
    console.log("i postef to the right /rate_tutors");
    const input = req.body.username;
    console.log(req.body.username);
    const rates = req.body;
    var rateVal = parseFloat(rates.rate);


    var user = await User.findOne({username: input});

    console.log(user.username);

    if(!user.rateCount || isNaN(user.rateAverage)){
    
    User.updateOne(user, {rateCount: 1, rateAverage: rateVal}, function(err, res){
        if(err){
        throw err;
        }
        else {
        console.log("1 document updated");
        console.log(user.rateCount);
        }
    });

    }
    else {
    var rateCount  = parseFloat(user.rateCount);
    var rateAvg = parseFloat(user.rateAverage);
    console.log(rateCount);
    console.log(rateAvg);

    var updatedRateAvg = ((rateCount*rateAvg) + rateVal)/(rateCount + 1);
    var updateRateCount = rateCount +  1;

    console.log(updatedRateAvg);
    console.log(updateRateCount);


    User.updateOne({username: input}, {rateCount: updateRateCount, rateAverage:updatedRateAvg}, function(err, res){
        if(err){
        throw err;
        }
        else {
        console.log("1 document updated");
        }
    });
    }

    res.send(user);
});

//Tutor Ratings 

module.exports = router
