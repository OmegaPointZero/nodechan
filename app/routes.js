const Post = require('./models/posts');
const Board = require('./models/boards');
//const Admin = require('./models/admin'); //administrative stuff
//const AdminUsers = require('./models/mods');
const postManager = require('./src/post');
const toolbox = require('./src/tools');
const imageManager = require('./src/images');
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
const upload = multer({storage: storage});
if(!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length-1]
    }
}

module.exports = (function(app){

    //Get Home page
    app.get('/', (req,res)=>{
        res.send('Build this, yo')
    })

    //Get board page
    /* TO-DO:
        Return 404 if board doesn't exist or page > 10
    */
    app.get('/boards/:board/:page*?', (req,res) => {
        var page;
        req.params.page ? page = req.params.page : page = 1; 
        if(page>10){
            res.send(404)
            return
        }
        var board = req.params.board;
        postManager.getPage(board,page,req,res)
});

    //Post New thread on :board
    app.post('/boards/:board', upload.any(), (req,res) => {
        if(req.files.length===0){
            res.send('Error: You forgot to upload an image')
            return;
        }
        var time = new Date().getTime();
        var imgInfo = imageManager.uploadImage(req.files[0],time,true,req,res)
        postManager.bumpAndGrind(req.params.board)
    })

    //Get thread by ID
    app.get('/:board/thread/:id', (req,res)=>{
        var threadID = req.params.id;
        var board = req.params.board;
        postManager.getThread(board,threadID,res);
    });

    //Reply to thread ID on BOARD
    app.post('/:board/thread/:id', upload.any(), (req,res)=>{
        console.log(req.body)
        if(req.files.length===0 && req.body.text== ""){
            res.send('Error: Response cannot be empty')
        }
        var time = new Date().getTime();
        if(req.files.length>0){
            var imgInfo = imageManager.uploadImage(req.files[0],time,false,req,res);
        } else {
            postManager.writePost(req.params,req.body,req.connection.remoteAddress,{time:new Date().getTime()},req,res);
        }
    });

    app.post('/:board/delete', (req,res)=>{
        console.log(req.body);
        res.send('Got em')
    });

}); 
