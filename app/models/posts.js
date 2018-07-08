mongoose = require('mongoose')

var postSchema = new mongoose.Schema({
    board: String,
    OP: {
        type: Number,
        index: true,
    },
    IP: String,
    postID: {
        type: Number,
        index: true,
    },
    name: String,
    subject: String,
    body: String,
    time: Number,
    fileName: String,
    fileOriginalName: String,
    fileSize: String,
    fileDimensions: String,
    sticky: Boolean,
});

module.exports = mongoose.model('Post', postSchema);
