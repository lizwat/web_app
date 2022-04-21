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


'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('names.json');
let name = JSON.parse(rawdata);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

classlist = ["csds300", "csds310", "csds395", "csds411", "csds284", "csds111", "csds213", "csds432",
  "emae398", "emae350", "emae331", "emae322", "emae211", "emae441", "emae260", "emae360", "emae160", "emae210",
  "mgmt315", "mgmt225", "mgmt405", "mgmt135", "mgmt111", "mgmt255", "mgmt312", "mgmt314", "mgmt270", "mgmt211",
  "fnce331", "fnce311", "fnce321", "fnce341", "fnce351", "fnce361", "fnce231"]



const generateUser = async () => {

  fname = name[getRandomInt(21890)].toLowerCase();
  console.log(fname);
  lname = name[getRandomInt(21890)].toLowerCase();
  console.log(lname);
  username = fname.concat(lname)
  console.log(username);
  num = "216"
  for (i = 0; i < 7; i++) {
    temp = getRandomInt(9).toString();
    num = num.concat(temp)
  }
  console.log(num)
  year = getRandomInt(4)
  switch (year) {
    case 1:
      grade = "freshman"
      break;
    case 2:
      grade = "sophomore"
      break;
    case 3:
      grade = "junior"
      break;
    case 4:
      grade = "senior"
      break;
    default:
      grade = "freshman"
  }
  console.log(grade)
  email = username.concat("@case.edu")
  console.log(email)
  tutor = Math.random() < 0.5;
  console.log(tutor)
  rateCount = getRandomInt(1000);
  rateAverage = getRandomInt(5);
  courses = [];
  for (i = 0; i < getRandomInt(10); i++) {
    courses.push(classlist[getRandomInt(classlist.length)])
  }
  console.log(courses)
  responses = [getRandomInt(2), getRandomInt(2), getRandomInt(5), getRandomInt(5), getRandomInt(5), getRandomInt(5), getRandomInt(5), getRandomInt(5), getRandomInt(5), getRandomInt(2), getRandomInt(5), getRandomInt(2)]
  console.log(responses)

  await User.register(new User({
    fName: fname,
    lName: lname,
    username: username,
    phone: num,
    telephone: num,
    grade: grade,
    email: email,
    tutor: tutor,
    rateCount: rateCount,
    rateAverage: rateAverage,
    questionnaire: responses,
    classes: courses
  }), "12345");

}

//generate users
for (i = 0; i < 100; i++) {
  generateUser()
}

