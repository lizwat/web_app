const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    phone:Number,
    tutor:Boolean,
    telephone:Number,
    grade:String,
    classes:Array,
    fName:String,
    lName:String,
    questionnaire:Array,
    hash: String,
    rateCount: 0,
    rateAverage: 0
}) ;
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);
