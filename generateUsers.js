const { on } = require('./models/user');
mongoose = require("mongoose")
passportLocalMongoose = require("passport-local-mongoose")
User = require("./models/user");

mongoose.connect("mongodb+srv://steve:chocolate3@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
const db = mongoose.connection
db.on("error", (err) => {
    console.error(`err: ${err}`)
  })// if connected
  db.on('connected', (err, res) => {
    console.log('Connected to database')
})


for(i = 0; i<iterations, i++){
    
}

// User.register(new User({
//     fName: "Test",
//     lName: "generateUser",
//     username: "TestgenerateUser",
//     phone: 1234567890,
//     telephone: 1234567890,
//     grade: "freshman",
//     email: "TestgenerateUser@email.com",
//     tutor: true}),"12345");