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
    userID: String,
    userIDColor: String,
    fileName: String,
    fileOriginalName: String,
    fileSize: String,
    fileDimensions: String,
    publicBan: Boolean
});

module.exports = mongoose.model('Post', postSchema);
