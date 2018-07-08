mongoose = require('mongoose')

var boardSchema = new mongoose.Schema({
    boardCode: String,
    boardTitle: String, 
    category: String,
    activeThreads: Array,
});

module.exports = mongoose.model('Board', boardSchema);
