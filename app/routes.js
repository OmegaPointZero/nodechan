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

module.exports = (function(app,passport){

    //Get Home page
    app.get('/', (req,res)=>{

        Board.find({},function(err,boards){
            if(err){console.log(err)}
            res.render('home.ejs',{boards:boards})
        })

    })


    app.get('/boards/:board/catalog', (req,res)=>{
        var board = req.params.board
        postManager.getCatalog(board,req,res)
    });

    //Get board page
    app.get('/boards/:board/:page*?', (req,res,next) => {
        
        var page;
        req.params.page ? page = Number(req.params.page) : page = 1; 
        if(page=='thread'){next();return}
        if(page>-1 && page < 10){
            var board = req.params.board;
            postManager.getPage(board,page,req,res)
        } else if(page>10){
            console.log('redirecting because page requested is >10')
            res.redirect('/error/404')
            return
        } else {
            res.redirect('/error/404')
        } 
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

    // Delete a thread or post from a board
    app.post('/:board/delete', (req,res)=>{
        var board = req.params.board 
        var id = Number(req.body.id.slice(7))
        var OP = req.body.OP 
        var fo = req.body.fo; // fileOnly delete
        var IP = req.connection.remoteAddress;
        if(fo=='true'){ //Only deleting file
            Post.find({board:board,postID:id},function(err,post){
                var file = post[0].fileName
                imageManager.deleteImage(file)
                res.send('OK')
            })
        }else{
            var myObj = {
                postID: id,
                OP: OP,
                IP: IP,
                board: board
            }
            postManager.deletePost(myObj)
            res.send('OK')
        }
    });

    app.post('/report', (req,res)=>{
        /*  Post REPORT to server, record in DB, use websockets
            to send notification to admins */
    });

    //ADMIN FUNCTIONS
    app.get('/login', (req,res)=>{
        res.render('login.ejs');
    });

    /* Route for logging in existing admin */
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/admin',
        failureRedirect : '/login',
    }));

    /*  If it's the first time this database is saving an admin, comment out
        the above POST /login route, and uncomment this one, to register a 
        new user 

    app.post('/login', passport.authenticate('local-signup', {
        successRedirect: '/admin',
        failureRedirect: '/login'})
    ); */

    app.get('/admin', isAdmin, (req,res)=>{
        Board.find({}, function(err,boards){
            if(err){
                throw err;
            }
            res.render('admin.ejs', {boards: boards, user:req.user.username});
        });
    });

    app.post('/admin', isAdmin, (req,res)=>{
        /*  Allow admins to interact with/monitor DB, delete threads, lock
            threads, move thread to a new board (build function to re-number
            posts), ban by IP address, view reports, sort/view posts by user 
            IP address */
    });

    app.post('/admin/sticky', isAdmin, (req,res)=>{
        var body = req.body;
        console.log(req.body);
        res.send('GOT A REQUEST: '+body)
    });

    //API REQUESTS BEGIN HERE

    app.post('/api/users', isAdmin, (req,res)=>{
        var board = req.body.board;
        var IP = req.body.IP;
        Post.find({board:board,IP:IP},function(err,posts){
            if(err){throw(err)}
            res.send(posts)
        });
    })

    app.get('/api/boardlist', (req,res)=>{
        Board.find({},function(err,boards){
            res.send(boards)
        });
    });

    app.get('/api/board/:board/:page*?', (req,res)=>{
        var page;
        req.params.page ? page = Number(req.params.page) : page = 1
        if(page>-1 && page < 10){
            var board = req.params.board;
            postManager.getAPIPage(board,page,req,res)
        } else if(page>10){
            console.log('redirecting because page requested is >10')
            res.redirect('/error/404')
            return
        } else {
            res.redirect('/error/404')
        }
    }); 

    app.get('/api/thread/:board/:thread', (req,res)=>{
        var board = req.params.board;
        var thread = req.params.thread;
        postManager.APIgetThread(board,thread,req,res);
    });

    function isAdmin(req,res,next){
        if(req.isAuthenticated())
            return next();
        res.redirect('/login');
    }
}); 
