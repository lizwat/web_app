const authController = require('../controllers/authController')
const express = require('express')
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;

//userprofileroutes
router.get('/userprofile', function(req, res, next) {
    if (!req.isAuthenticated()) { 
      res.redirect('/auth/login');
    }
    res.render("userprofile");
});

//router.get('/userprofile', authController.userprofile_get);
//router.post('/userprofile',authController.userprofile_auth);


router.param("userid", (req,res,next,userid) =>{
    //console.log(userid)
    //initializes variable user name in users array
    req.user = users[userid];
    next()
})

// Handle updating user profile data
// --------------------------------------------------
router.post('/userprofile', (req, res, next) => {
    if (!req.isAuthenticated()) {
      res.redirect('/auth/login');
    }

    const users = req.app.locals.users;
    
    const { username, fName, lName,
        email, phone } = req.body;
    //res.send(req.body);
    
    const _id = ObjectID(req.session.passport.user);
  
    users.updateOne({ _id }, { $set: { username, fName, lName, phone, email } }, (err) => {
      if (err) {
        throw err;
      }
      
      res.redirect('users/userprofile');
    });
  });

  // --------------------------------------------------
  router
  .route("/:userid")
  .get((req,res) => {
      //retruns the user in console
      console.log(req.user);
      //res.send(`Get User with ID:  ${req.params.userid}`)
      res.send(`Hello ${req.user.name}`)
  })
  .put((req,res) => {
      res.send(`Update User with ID:  ${req.params.userid}`)
  })
  .delete((req,res) => {
      res.send(`Delete User with ID:  ${req.params.userid}`)
  })

  const users = [{name: 'Kyle'}, {name: 'Sally'}];
module.exports = router