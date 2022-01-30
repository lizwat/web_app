/*const mongoose = require('mongoose');
const userScheme = mongoose.Schema({
  email: {type: String, unique: true, required: true},
  userName: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true}
})
*/

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    gender: {
        type: String,
    }

}, {collection:'users'});

module.exports = mongoose.model('User', userSchema);
