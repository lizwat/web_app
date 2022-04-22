const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

User = require("../models/user");

// Match Related Functions
// --------------------------------------------------
async function findMatches(currentUser){
    var results = Array.from(Array(2), () => new Array(0));
    highscore = 0;
    user = await User.findOne({username: currentUser});
    user.toObject();
    potentialMatches = await User.find({tutor:true, username: {$ne : currentUser}, questionnaire:{ $exists: true, $not: {$size: 0} }}); //pull all tutors down who have filled the questionnaire from DB to sort through
    potentialMatches.forEach(tutor=>{
        score = compare(user,tutor); //compare user and tutor answers to judge match
        results[0].push(tutor);
        results[1].push(score);
        if (score>highscore){
            highscore = score;
            topmatch = tutor
        }
    })
    
    matchlist = bubbleSort2(results, results[0].length)
    console.log("Highscore")
    console.log(highscore)
    console.log(topmatch)
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


async function processResponses(req){ //Process Questionnaire Responses
    for(var value in req.body){
        if(req.body.hasOwnProperty(value)){
            currentResponse = req.body[value];
            
            await User.updateOne({username: req.cookies.currentUser},{$push: {questionnaire: currentResponse}})
        }
    }
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

function bubbleSort2(arr, n){ //bubblesort pulled from https://www.geeksforgeeks.org/bubble-sort/
    var i, j, temp;
    var swapped;
    for (i = 0; i < n - 1; i++) {
        swapped = false;
        for (j = 0; j < n - i - 1; j++) {
            if (arr[1][j] > arr[1][j + 1]) { //sorts in order of score
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
    console.log(result[1][0])
    console.log(result[0][1])
    console.log(result[1][1])
    return result
}

// Render MatchMaker View
// --------------------------------------------------
router.get("/", async (req,res)=>{
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

// Display Matchmaker Results
// --------------------------------------------------
router.post("/", async (req, res)=>{
    processResponses(req);
    var users = findMatches(req.cookies.currentUser);
    var resUsers = Promise.resolve(users)
    resUsers.then(function(list){
        res.render("matches", {"users": list});
    });
})

module.exports = router
