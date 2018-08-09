const Post = require('./models/posts');
const Board = require('./models/boards');
const postManager = require('./src/post');
const toolbox = require('./src/tools');
const imageManager = require('./src/images');
const path = require('path');
const express = require('express');
const router = express.Router();

//Get all the boards
router.get('/boardList', (req,res)=>{
    Board.find({},function(err,boards){
        res.send(boards)
    });
});

//Get a thread
router.get('/thread/:board/:id', (req,res)=>{
    var board = req.params.board
    var OP = req.params.id
    Post.find({board:board,OP:OP},function(err,posts){
        console.log('Sending those fuckers this:')
        console.log(JSON(posts))
        res.send(JSON(posts))
    });
});

//Get a board (/:page)

//Get a post by postID

//Get all posts by an IP Address

module.exports = router
