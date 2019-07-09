const mongoose = require('mongoose')

var bannedSchema = new mongoose.Schema({
    boards: Array, /* Array of strings of board codes */
    IP: String, /* IP Address banned*/
    reportingIP: String,
    reason: String,
    offense: Object, /* post info for post that got user banned */
    start: Number, /* Time ban went into effect */ 
    end: Number /* Time Ban expires */ 
},{collection:'bans '});

module.exports = mongoose.model('Bans', bannedSchema);
