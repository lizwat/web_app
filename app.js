const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./User.js')
app.use(express.json());

app.get('/home', function(req, res){
    res.send('Home Screen');
});


//Connecting to DB
mongoose.connect('mongodb+srv://steve:chocolate3@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    { useNewUrlParser: true },
    function (){
        console.log('connected to database');
    }
);

/**
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://emw119:Mikey567!@cluster0.g7hvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}); */

//CRUD Operations

//get all users
app.get('/read', async function(req, res){
    const users = await User.find().exec();
    res.status(200).json(users);

});


//Post user data
app.post('/post', async function(req, res){
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender
    });

    try {
        await user.save();
        res.status(200).json({"success": true, "message":"User details saved"});

    } catch (err) {
        res.status(400).json({"success": false, "message":"Error in saving user details"});
    }

});

app.listen(3000, () => console.log('Listening on Port 3000'));
