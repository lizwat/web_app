const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    phone:Number,
    tutor:Boolean,
    telephone:Number,
    classes:Array,
    rateCount: 0,
    rateAverage: 0
}) ;
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);
