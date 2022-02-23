const express = require('express'),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user");
//Connecting database
mongoose.connect("mongodb+srv://steve:chocolate3@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
app.use(require("express-session")({
    secret: "Any normal Word", //decode or encode session
    resave: false,
    saveUninitialized: false
}));
passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(passport.initialize());
app.use(passport.session());
//=======================
//      R O U T E S
//=======================
app.get("/", (req, res) => {
    res.render("home");
})
app.get("/userprofile", isLoggedIn, (req, res) => {
    res.render("userprofile");
})
//Auth Routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
}), function (req, res) {});

app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/register", (req, res) => {

    User.register(new User({
        username: req.body.username,
        phone: req.body.phone,
        telephone: req.body.telephone
    }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/login");
        })
    })
})

//tutor rating
    app.get("/tutors",(req,res)=>{
      res.render("tutors");
    });



    app.post("/tutors", async (req, res)=> {
      const input = req.body;
      var rateVal = parseFloat(input.rating);
      //console.log(rateVal);
      //res.send(rateVal);

      var user = await User.findOne({username: "liz"});

      console.log(user.username);

      if(! user.rateCount){
        var newVals = { $set: {rateCount: 1, rateAverage: rateVal}};
        console.log(newVals[1]);
        User.updateOne(user,{rateCount: 1, rateAverage: rateVal}, function(err, res){
          if(err){
            throw err;
            console.log(err);
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
        var a = "" + updatedRateAvg;
        var b = "" + updateRateCount;
        console.log(updatedRateAvg);
        console.log(updateRateCount);


        var newVals = { $set: {rateCount: updateRateCount, rateAverage: updatedRateAvg}};


        User.updateOne({username: "liz"}, {rateCount: updateRateCount, rateAverage:updatedRateAvg}, function(err, res){
          if(err){
            throw err;
            console.log(err);
          }
          else {
            console.log("1 document updated");
          }
        });

      }

      res.send(user);
    });



//Kevin's section
app.get("/search",(req,res)=>{
    res.render("search");
});

app.post("/search", async (req,res)=>{

    const input = req.body.search;
    const results = await User.find({username: input}) //search only queries by username.  A simple function can be used to make query more robust
    console.log(results)

    res.send(results) //res.send just displays the list.  List will need to be parsed/sent to a new view to actually be helpful
})
//end Kevin's section
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//Listen On Server
app.listen(process.env.PORT || 3000, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Server Started At Port 3000");
    }




});
