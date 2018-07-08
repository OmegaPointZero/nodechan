const Post = require('./models/posts');
const Board = require('./models/boards');
//const Admin = require('./models/admin'); //administrative stuff
//const AdminUsers = require('./models/mods');
const postManager = require('./src/post');
const toolbox = require('./src/tools')
const path = require('path');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'public/temporary')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});
const filepreview = require('filepreview');
const upload = multer({storage: storage});

module.exports = (function(app){

    //Get Home page
    app.get('/', (req,res)=>{
        res.send('Build this, yo')
    })

    //Get board page
    /* TO-DO:
        + get metadata like board title from Boards
    */
    app.get('/boards/:board/:page*?', (req,res) => {
        var page;
        req.params.page ? page = req.params.page : page = 1; 
        var board = req.params.board;
        // function that makes variable, queries board for metadata, and 
        // only returns when the variable is set to the fetched metadata?
        postManager.getPage(board,page,req,res)
});


    //Post New thread 
    app.post('/boards/:board', upload.any(), (req,res) => {
        postManager.writePost(req.params,req.body, req.connection.remoteAddress,req,res)
        postManager.bumpAndGrind(req.params.board)
    })

    //Get thread by ID
    app.get('/:board/thread/:id', (req,res)=>{
        var board = req.params.board;
        var threadID = req.params.id;
        Post.find({board: board, OP:threadID})
            .sort('postID')
            .exec(function(err,posts){
            res.render('thread.ejs',{
                posts: posts,
                boardID: board,
                threadID: threadID
            })
        })
    });

    //Reply to thread ID on BOARD
    app.post('/:board/thread/:id', (req,res)=>{
        postManager.writePost(req.params,req.body, req.connection.remoteAddress,req,res)       
    });

});
