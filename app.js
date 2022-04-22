const { vary } = require('express/lib/response');
const { on } = require('./models/user');
const ObjectID = require('mongodb').ObjectID;
var auth = require('passport-local-authenticate');


const express = require('express'),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user");
    Post = require("./models/post");
    var cookie = require('cookie')
    const cookieParser = require('cookie-parser');
const { compileQueryParser } = require('express/lib/utils');


const stripe = require('stripe')('sk_test_51KgxQBLaWiOxnQqJKlygNvObyWrY9R1NFrL7wkURDdSyVPqvMuL7nuojgjmYGjPwMoXEZJlOiWbGLswfju0rsCka00weMZrDen'); // the secret key from dashboard

//Adding some modules
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
//Connecting to Mongo Client 


MongoClient.connect('mongodb+srv://steve:chocolate3@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
(err, client) => {
    if (err) {
    throw err;
    }
    const db = client.db('myFirstDatabase');
    const users = db.collection('users');
    app.locals.users = users;
    console.log("connected to database");
});

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

/*
passport.serializeUser(function(user, done) {
    done(null, user.username);
 }); //session encoding
passport.deserializeUser(function(obj, done) {
    done(null, obj)
}); //session decoding
*/

passport.serializeUser((user, done) => {
    done(null, user._id);
  });
passport.deserializeUser((id, done) => {
    done(null, { id });
  });

passport.use(new LocalStrategy(User.authenticate()));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    next();
});

//=======================
//      R O U T E S
//=======================
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const tutorsRouter = require('./routes/tutors');
const searchRouter = require('./routes/search');
const matchesRouter = require('./routes/matches');
const matchmakerRouter = require('./routes/matchmaker');


app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/tutors', tutorsRouter);
app.use('/search', searchRouter);
app.use('/matches', matchesRouter);
app.use('/matchmaker', matchmakerRouter);


app.get("/", (req, res) => {
    res.render("home");
})

app.get("/createpost", (req, res) => {
    var usertext = req.cookies.currentUser;
    res.render("createpost");
});

/** 
app.get("/matchmaker", (req, res)=> {
    res.render("matchmaker");
}) */

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

app.get("/dashboard", (req, res) => {
    Post.find({}, function (err, posts){
        res.render('dashboard', {
            postList: posts
        })
    })
});

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

    app.get("/rate_tutors", (req,res)=>{
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
    results = queryParse(results)
    res.render("tutors", {"users": results});
})
//end search

//Questionnaire for matchmaker

app.get("/matchmaker", async (req,res)=>{
    var questions = [
        ["I prefer to work with visual representations of a concept", "bmatch"],
        ["I have tutored/been tutored before","bmatch"],
        ["I prefer putting concepts into words versus mathematical/logical symbols", "rmatch"],
        ["I have a very structured routine / I prefer to go with the flow", "rmatch"],
        ["I prefer give/receive positive reinforcement / I prefer to give/receive constructive criticism", "rmatch"],
        ["I am more objective oriented / I am more process oriented", "rmatch"],
        ["I prefer working with someone older than me / IDC/ I prefer working with someone younger than me", "ropp"],
        ["I prefer to focus on the task / I prefer to get to know my tutor", "rmatch"],
        ["I tend to keep my stuff extremely organized (vs.whatever order makes sense to me)", "rmatch"],
        ["I prefer to work in a few long sessions versus many frequent short sessions", "bmatch"],
        ["I prefer to be in control of the learning process / I prefer to be guided in the learning process", "ropp"],
        ["I work well in high-pressure situations", "bmatch"]
    ]

    var user = req.cookies.currentUser;
    //var userfind = await User.find({username: user});
    console.log(user);

    var filter = await User.find({username: user,  questionnaire:{ $exists: true, $not: {$size: 0}}});
    console.log(filter);
    console.log(filter.length)
    console.log(filter.length == 0);
    console.log(filter.questionnaire);
    if(!filter.length == 0){
        var resUsers = Promise.resolve(findMatches(user));
        resUsers.then(function(list){
           
            res.render("matches", {"users": list});
        });
        
    }
    else { 
        res.render("matchmaker.ejs", {questions: questions});
    }
}) 

app.post("/matchmaker", async (req, res)=>{
    processResponses(req);
    //var users = findMatches(req.cookies.currentUser);
    var resUsers = Promise.resolve(findMatches(req.cookies.currentUser))
    resUsers.then(function(list){
        console.log(list[0].username);
        res.render("matches", {"users": list});
    });
    
    
})
/** 
app.post("/questionnaire",(req,res) => {
    res.render("matchmaker",);
}) */
//end questionnaire

//Course List
app.get("/courses", async (req, res)=>{
    res.render("courses");
 })
 
 app.post("/courses", async (req, res)=> {
     for(var title in req.body){
         if(req.body.hasOwnProperty(title)){
            course = req.body[title];
            console.log(course[0]);
             for(i=0;i<course.length;i++){
                console.log(course[i])
                if(course[i]!=""){
                    if(typefind(course[i])=="course"){
                        //console.log(course);
                       await User.updateOne({username: req.cookies.currentUser},{$push: {classes: course[i]}})
                    }
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
        result.push(querylist[i]);
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
            console.log(currentResponse)
            await User.updateOne({username: req.cookies.currentUser},{$push: {questionnaire: currentResponse}})
        }
    }
}

async function findMatches(currentUser){
    var results = Array.from(Array(2), () => new Array(0));
    i =0;
    user = await User.findOne({username: currentUser});
    user.toObject();
    potentialMatches = await User.find({tutor:true, username: {$ne : currentUser}, questionnaire:{ $exists: true, $not: {$size: 0} }}); //pull all tutors down who have filled the questionnaire from DB to sort through
    potentialMatches.forEach(tutor=>{
        score = compare(user,tutor); //compare user and tutor answers to judge match
        results[0].push(tutor);
        results[1].push(score);
    })
    
    matchlist = bubbleSort2(results, results[0].length)
    
    console.log("Best Match")
    console.log(matchlist[0][0].username)
    console.log("Score")
    console.log(matchlist[1][0])
    //const matches = await Promise.all(matchlist[0])
    return matchlist[0];
    // matchusernames = [];
    // for(i=0;i<matchlist[0].length;i++){
    //     matchusernames.push(matchlist[0][i].username)
    // }
    // console.log(matchusernames)
    // return matchusernames;
    
}

function bubbleSort2(arr, n){ //bubblesort pulled from https://www.geeksforgeeks.org/bubble-sort/
    var i, j, temp;
    var swapped;
    for (i = 0; i < n - 1; i++) {
        swapped = false;
        for (j = 0; j < n - i - 1; j++) {
            if (arr[1][j] > arr[1][j + 1]) { //sorts in order of rate avg.  May apply weight for ratecount in the future.
                temp = arr[0][j];
                temp2 = arr[1][j];
                arr[0][j] = arr[0][j + 1];
                arr[1][j] = arr[1][j + 1];
                arr[0][j + 1] = temp;
                arr[1][j + 1] = temp2;
                swapped = true;
            }
        }
        if (swapped == false)
            break;
    }
    var result = Array.from(Array(2), () => new Array(0));
    for(let i =arr.length-1; i>=0;i--){ //list iterated in reverse as bubblesort orders low to high
        if(!isNaN(arr[1][i])){
            result[0].push(arr[0][i]);
            result[1].push(arr[1][i]);
        }
        
    }
    console.log("######BUBBLESORT######")
    console.log(result[0][0])
    console.log(result[0][1])
    return result
}

function compare(user,tutor){
user.toObject();
score = 0;
type = "";

var questions = [
    ["I prefer to work with visual representations of a concept", "bmatch"],
    ["I have tutored/been tutored before","bmatch"],
    ["I prefer putting concepts into words versus mathematical/logical symbols", "rmatch"],
    ["I have a very structured routine / I prefer to go with the flow", "rmatch"],
    ["I prefer give/receive positive reinforcement / I prefer to give/receive constructive criticism", "rmatch"],
    ["I am more objective oriented / I am more process oriented", "rmatch"],
    ["I prefer working with someone older than me / IDC/ I prefer working with someone younger than me", "ropp"],
    ["I prefer to focus on the task / I prefer to get to know my tutor", "rmatch"],
    ["I tend to keep my stuff extremely organized (vs.whatever order makes sense to me)", "rmatch"],
    ["I prefer to work in a few long sessions versus many frequent short sessions", "bmatch"],
    ["I prefer to be in control of the learning process / I prefer to be guided in the learning process", "ropp"],
    ["I work well in high-pressure situations", "bmatch"]
]

    for(i=0; i<12;i++){ //for each question, compare the answer and judge accordingly
        type = questions[i][1];
        console.log(user.questionnaire[i])
        //compare binary match --> matching answer should increase score
        if (type == "bmatch"){
            if(user.questionnaire[i]==tutor.questionnaire[i]){
                score++;
            }
        }
        //compare binary oppose --> opposing answers should increase score
        if (type == "bopp"){ 
            if (user.questionnaire[i]==tutor.questionnaire[i]){
                score++;
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
    return score
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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

