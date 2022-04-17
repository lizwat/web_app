const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
    usertext:String,
    class:String,
    topic:String,
    description:String,
    replies : [{
        type: String,
    }], 
    uniqueid : String,
}) ;
const Post = mongoose.model("Post",PostSchema);
module.exports = Post;