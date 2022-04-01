const express = require('express'),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user");
    PostModel = require("./models/post");


//Connecting database
mongoose.connect("mongodb+srv://steve:chocolate3@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
app.use(require("express-session")({
    secret: "Any normal Word", //decode or encode session
    resave: false,
    saveUninitialized: false
}));

const db = mongoose.connection
db.on("error", (err) => {
    console.error(`err: ${err}`)
  })// if connected
  db.on('connected', (err, res) => {
    console.log('Connected to database')
})
const postCollection = db.collection('posts')

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

app.get("/createpost", (req, res) => {
    res.render("createpost");
});

app.get("/matches", async (req, res)=>{
    var users =  await User.find({});
    res.render("matches", {"users": users});
})

app.get("/payment", (req, res)=>{
    res.render("payment");
})

const postSchema = {
    class: String,
    topic: String,
    description: String
}

const Post = mongoose.model('post', postSchema); 

app.get("/dashboard", (req, res) => {
    Post.find({}, function (err, posts){
        res.render('dashboard', {
            postList: posts
        })
    })
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
}), function (req, res) {});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/changepassword", (req, res) => {
    res.render("changepassword");
});

app.post("/register", (req, res) => {

    User.register(new User({
        username: req.body.username,
        phone: req.body.phone,
        telephone: req.body.telephone,
        tutor: true,
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

app.post('/createpost', (req, res) => {
    postCollection.insertOne(req.body)
    .then(result => {
      res.redirect('dashboard')
    })
    .catch(error => console.error(error))
})

app.get('/posthistory', (req, res) => {
    db.collection('posts').find().toArray()
    .then(results => {
        res.render('posthistory', { posts: results})
      })
      .catch(error => console.error(error))
})

app.get("/tutors", async (req, res)=>{
   var users =  await User.find({});
   res.render("tutors", {"users": users});
})


app.post("/tutors", async (req, res)=> {
    let tutor =  req.body.username;
    var user = await User.find({username: tutor})
    res.render("rate_tutors", {"users": user});
}) 


//tutor rating

    app.get("/rate_tutors",(req,res)=>{
      res.render("rate_tutors", {"users": user});
    });


    app.post("/rate_tutors", async (req, res)=> {
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


//end tutor rating

//Search
//TODO: filter queries to only retrieve tutors for a specific class during search
app.get("/search",(req,res)=>{
    res.render("search");
});

app.post("/search", async (req,res)=>{

    const input = req.body.search;
    const results = await User.find({username: {"$regex": input}, tutor:true}) //search queries by username (inclusive) and returns only tutors  
    const output = queryParse(results)
    console.log(output)

    res.render("tutors", {"users": results});

   // res.send(output) //res.send just displays the list.  List will need to be parsed/sent to a new view to actually be helpful
})
//end search

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

//parse query output
//TODO: unrated users are left at top of list.  Could be bug, could be feature
function queryParse(querylist){ //parses db results list for specific datafields - will be expanded as user.js is finalized
    querylist = bubbleSort(querylist, querylist.length);
    var result = new Array();
    for(let i =querylist.length-1; i>=0;i--){ //list iterated in reverse as bubblesort orders low to high
        result.push(querylist[i].username);
        //console.log(querylist[i].username + " - Rate: " + querylist[i].rateAverage)
    }
    return result;
}

//sort search results
function bubbleSort(arr, n){ //bubblesort algorithm pulled from https://www.geeksforgeeks.org/bubble-sort/
    var i, j, temp;
    var swapped;
    for (i = 0; i < n - 1; i++) {
        swapped = false;
        for (j = 0; j < n - i - 1; j++) {
            if (arr[j].rateAverage > arr[j + 1].rateAverage) { //sorts in order of rate avg.  May apply weight for ratecount in the future.
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (swapped == false)
            break;
    }
    return arr
}