const Post = require('./models/posts');
const Board = require('./models/boards');
const postManager = require('./src/post');
const toolbox = require('./src/tools');
const imageManager = require('./src/images');
const path = require('path');

module.exports = (function(app){
    app.get('/boardList', (req,res)=>{
        Board.find({},function(err,boards){
            res.send(boards)
        })
    })
})
