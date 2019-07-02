const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

var adminSchema = new mongoose.Schema({
    username: String, 
    password: String,
},{collection:'admin'});

//Hashing the password, should add salt
adminSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

//Compare and check if password is correct
adminSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password)
}


module.exports = mongoose.model('Admin', adminSchema);
