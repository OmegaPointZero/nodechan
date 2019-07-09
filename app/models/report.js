const mongoose = require('mongoose')

var reportSchema = new mongoose.Schema({
    board: String,
    post: Number,
    reportingIP: String,
    reason: Array,
    reviewed: Boolean,
    admin: String,
    action: String,
    time: Number
},{collection:'reports'});

module.exports = mongoose.model('Reports', reportSchema);
