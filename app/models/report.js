const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

var reportSchema = new mongoose.Schema({
    board: String,
    post: Number,
    reportingIP: String,
    reason: String,
    reviewed: Boolean,
    admin: String,
    action: String,
    time: Number
},{collection:'reports'});

module.exports = mongoose.model('Reports', reportSchema);
