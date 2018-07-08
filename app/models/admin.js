mongoose = require('mongoose')

var adminSchema = new mongoose.Schema({
    item: String, //wordfilter, categories, blocked IPs
    contents: Array,    
},{collection:'admin'});

module.exports = mongoose.model('Admin', adminSchema);
