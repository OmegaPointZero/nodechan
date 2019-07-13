const mongoose = require('mongoose')

var bannedSchema = new mongoose.Schema({
    IP: String, /* IP Address banned*/
    reportingIP: String,
    reason: String,
    offense: Object, /* post info for post that got user banned */
    start: Number, /* Time ban went into effect */ 
    end: Number, /* Time Ban expires */ 
    admin: String /* Admin who took care of ban */
},{collection:'bans '});

module.exports = mongoose.model('Bans', bannedSchema);
