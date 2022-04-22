const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

User = require("../models/user");

//Search

// Search Related Functions
// --------------------------------------------------

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
    }S
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

//TODO: filter queries to only retrieve tutors for a specific class during search
router.get("/",(req,res)=>{
    res.render("search");
});

router.post("/", async (req,res)=>{
    console.log("i hit the right search");
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

module.exports = router
