const { vary } = require('express/lib/response');
const { on } = require('./models/user');


const express = require('express'),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user");
    Post = require("./models/post");
    var cookie = require('cookie')
    const cookieParser = require('cookie-parser');
const { compileQueryParser } = require('express/lib/utils');


    const stripe = require('stripe')('sk_test_51KgxQBLaWiOxnQqJKlygNvObyWrY9R1NFrL7wkURDdSyVPqvMuL7nuojgjmYGjPwMoXEZJlOiWbGLswfju0rsCka00weMZrDen'); // the secret key from dashboard
//Connecting database
mongoose.connect("mongodb+srv://steve:chocolate3@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
app.use(require("express-session")({
    secret: "Any normal Word", //decode or encode session
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser());

const arr = [];

const db = mongoose.connection
db.on("error", (err) => {
    console.error(`err: ${err}`)
  })// if connected
  db.on('connected', (err, res) => {
    console.log('Connected to database')
})
const postCollection = db.collection('posts')

passport.serializeUser(function(user, done) {
    done(null, user.username);
 }); //session encoding
passport.deserializeUser(function(obj, done) {
    done(null, obj)
}); //session decoding
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
    var usertext = req.cookies.currentUser;
    res.render("createpost");
});


app.get("/matches", async (req, res)=>{
    var users =  await User.find({});
    res.render("matches", {"users": users});
})

app.post("/matches", async (req, res)=>{
    let username = req.body.username;
    var user = await User.findOne({username: username});
    //res.render("/payment", {"user": user});
})

app.get("/matchmaker", (req, res)=> {
    res.render("matchmaker");
})

app.post("/matchmaker", async (req, res)=>{
    processResponses(req)
    res.render("matches")
})

/*app.get("/payment", (req, res)=>{
    res.render("payment", {"user": user});
})*/

app.get("/paymentportal", (req, res) => {
    app.engine('html', require('ejs').renderFile);
    app.use(express.static('./views'));
    res.sendFile(__dirname + '/views/payment.html');
  })
  
  app.post("/charge", (req, res) => {
      try {
        stripe.customers
          .create({ 
            name: req.body.name,         
            email: req.body.email,
            source: req.body.stripeToken
          })
          .then(customer =>
            stripe.charges.create({
              amount: req.body.amount * 100,
              currency: "usd",
              customer: customer.id,
              description: req.body.description,
            })
          )
          .then(() => res.render("paymentsuccess.html"))        
          .catch(err => console.log(err));
      } catch (err) {
        res.send(err);
      }
    });

/*const postSchema = {
    class: String,
    topic: String,
    description: String
}

const Post = mongoose.model('post', postSchema); */

app.get("/dashboard", (req, res) => {
    Post.find({}, function (err, posts){
        res.render('dashboard', {
            postList: posts
        })
    })
});

app.post("/login", passport.authenticate("local"),  setUserIDResponseCookie, function (req, res, next) { //saves username as cookie
    if (req.user) {
        res.redirect("/dashboard");
    } else {
        res.redirect("/login");
    }
    next();
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/changepassword", (req, res) => {
    res.render("changepassword");
});

app.post("/register", (req, res) => {
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
            res.redirect("/login");
            })
        }
    })
})


app.post("/replypost", async (req, res) => {
    var x = req.body.reply;
    var y = req.body.descriptionid;
    //console.log(x, y);
    /*find('posts', {'uniqueid' : y}, function (err, docs) {
        console.dir(docs);
    });*/
    postCollection.updateOne({uniqueid: y}, {$push:{ replies: x}}
    )
    .then(result => {
      res.redirect('dashboard')
    })
    .catch(error => console.error(error))
});

/*function find (name, query, cb) {
    mongoose.connection.db.collection(name, function (err, collection) {
       collection.find(query).toArray(cb);
   });
}*/

function numbergenerator(){
    xo = Math.floor(Math.random()*100);
    while (arr.includes(xo))(
        xo = Math.floor(Math.random()*100)
    )
    return xo;   
}

app.post('/createpost', (req, res) => {
    var username = req.cookies.currentUser;
    postCollection.insertOne(new Post({
        topic: req.body.topic,
        class: req.body.class,
        description: req.body.description,
        usertext: req.cookies.currentUser,
        uniqueid: numbergenerator(),
    }))
    .then(result => {
      res.redirect('dashboard')
    })
    .catch(error => console.error(error))
})

app.get('/posthistory', (req, res) => {
    var userfind = req.cookies.currentUser;
    db.collection('posts').find( {usertext: userfind }).toArray()
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
    const input = req.body.search.toLowerCase();
    if (!handleInput(input)){ //input scrubbing - allows text and numbers
        console.log("Invalid Input")
        return res.send("<script> alert('Please Enter Valid Text'); window.location =  '/dashboard'; </script>")
    }
    type = typefind(input)
    var results = ""
    if(type == "username"){
        results = await User.find({username: {"$regex": input}, tutor:true}) //search queries by username (inclusive) and returns only tutors  
    }else if(type == "name"){ //name might include fname, lname, or username
        results = await User.find({$or:[{fName: {"$regex": input}}, {lName:{"$regex": input}}, {username: {"$regex": input}}], tutor:true})
    }else if (type == "course"){
        console.log("checking for courses")
        results = await User.find({classes: {"$elemMatch": { "$regex": input}}, tutor:true}) //search queries by courslist (inclusive) and returns only tutors
    }
    res.render("tutors", {"users": results});
})
//end search

//Questionnaire for matchmaker
app.get("/questionnaire", (req,res)=>{
    res.render("questionnaire");
})

app.post("/questionnaire",(req,res) => {
    res.render("matchmaker");
})
//end questionnaire

//Course List
app.get("/courses", async (req, res)=>{
    res.render("courses");
 })
 
 app.post("/courses", async (req, res)=> {
     var inputList = req.body;
     for(var value in req.body){
         if(req.body.hasOwnProperty(value)){
            course = req.body[value];
            if(course!=""){
                if(typefind(course)=="course"){
                   await User.updateOne({username: req.cookies.currentUser},{$push: {classes: course}})
                }
            }
         }
     }
     
     res.redirect("/login")
 }) 
 //End Courselist

app.get("/logout",(req,res)=>{
    req.logout();
    res.clearCookie();
    res.redirect("/");
    res.end
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

function handleInput(input){ //scrubs text input from search bar
    inputtext = input;
    if (inputtext == ""){ //check for empty string
        console.log("Empty String")
        return false;
    } else if (inputtext.match(/[^a-z0-9]/)!=null){ //check for non alphanumeric
        console.log("Input Handled")
        return false;
    }else{ //accept only alphanumeric input and continue
        console.log("Input Accepted")
        return true;
    }
}

//interperate field to search
function typefind(input){
    if (input.match(/[0-9]/)!=null&&input.match(/[a-zA-Z]/)!=null){ //Course Code - ABCD123
        if(input.match(/[a-zA-Z]/gi).length==4){
            type = "course";
        }
        }else if(input.match(/[0-9]/)!=null){//Username - abcde123abcde
            type = "username";
        }else{//Name - abcd abcd
            type = "name";
        }
    console.log(type)
    return type;
}

function ValidateEmail(mail) //pulled from https://www.w3resource.com/javascript/form/email-validation.php
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

//parse query output
//TODO: unrated users are left at top of list.  Could be bug, could be feature
function queryParse(querylist){ //parses db results list for specific datafields - will be expanded as user.js is finalized
    querylist = bubbleSort(querylist, querylist.length);
    var result = new Array();
    for(let i =querylist.length-1; i>=0;i--){ //list iterated in reverse as bubblesort orders low to high
        result.push(querylist[i].username);
    }
    return result;
}

//sort search results
function bubbleSort(arr, n){ //bubblesort pulled from https://www.geeksforgeeks.org/bubble-sort/
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

async function processResponses(req){
    for(var value in req.body){
        if(req.body.hasOwnProperty(value)){
            currentResponse = req.body[value];
            await User.updateOne({username: req.cookies.currentUser},{$push: {questionnaire: currentResponse}})
        }
    }
    return findMatches(req.cookies.currentUser);
}

async function findMatches(currentUser){
    var results = Array.from(Array(2), () => new Array(0));
    i =0;
    user = await User.findOne({username: currentUser});
    user.toObject();
    potentialMatches = await User.find({tutor:true, questionnaire:{ $exists: true, $not: {$size: 0} }}); //pull all tutors down who have filled the questionnaire from DB to sort through
    potentialMatches.forEach(tutor=>{
        score = compare(user,tutor); //compare user and tutor answers to judge match
        results[0].push(tutor);
        results[1].push(score);
    })
    console.log(results)


    //return matchList
}

function compare(user,tutor){
user.toObject();
score = 0;
type = "";
    for(i=0; i<12;i++){ //for each question, compare the answer and judge accordingly
        console.log(user.questionnaire[i]);
        console.log(tutor.questionnaire[i]);
        //compare binary match --> matching answer should increase score
        if (type == "bmatch"){
            if(user.questionnaire[i]==tutor.questionnaire[i]){
                score++;
            }
        }
        //compare binary oppose --> opposing answers should increase score
        if (type == "bopp"){ 
            if (user.questionnaire[i]==tutor.questionnaire[i]){
                score++
            }
        }
        //compare range match --> similar choices should increase score, more similar, greater effect
        if (type == "rmatch"){
            score+=(5-(user.questionnaire[i]-tutor.questionnaire[i]))/5;//todo: review this code
        }
        //compare range oppose --> different choices should increase score, more different, greater effect
        if (type == "ropp"){
            score+=(user.questionnaire[i]-tutor.questionnaire[i])/5;//todo: review this code
        }
    }
    return score;
}

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