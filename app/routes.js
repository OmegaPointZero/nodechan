const Post = require('./models/posts');
const Board = require('./models/boards');
const Admin = require('./models/admin'); //administrative stuff
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

        var cats = [];

        Admin.findOne({item:'categories'},function(err,entry){
            var contents = entry.contents;
            contents.forEach(function(entries){
                cats.push(entries.category)
            })
            res.send(cats)
        })
    })

    //Get board page
    /* TO-DO:
        + get metadata like board title from Boards
        + get OPs
            + Sort by lastUpdated
            + Page Numbers
            + 3 most recent posts
    */
    app.get('/boards/:board/:page*?', (req,res) => {
        var page;
        req.params.page ? page = req.params.page : page = 1; 
        var board = req.params.board;
        postManager.getPage(board,page,req,res)
/*        Board.findOne({boardCode:board},function(err,board){
            if(err) throw err
            var threads = board.activeThreads;
            var sorted = toolbox.sortByUpdate(threads,'lastUpdated');
            /* for each thread listed in [sorted], 
                    sort [get thread's OP + 3 most recent] + NUMBER of total replies 
                    + NUMBER of images
            //
            var finalArr = []
            var completed = 0;
            sorted.forEach(function(thread){
                var OP = thread.OP;
                var index = sorted.indexOf(thread)
                var imageList = thread.imagesList;
                var opObj = {
                    posts: [],
                    replies: 0,
                    images: imageList.length
                }
                Post.find({OP:OP})
                    .sort({postID:'descending'})
                    .exec(function(err,posts){
                        if(err) throw err;
                        var len = posts.length;
                        opObj['replies'] = len - 1;
                        if(len<=4){
                            for(var i=0;i<len;i++){
                                opObj.posts[i] = posts[i]
                            }
                            opObj.posts = toolbox.sortByPost(opObj.posts,'postID')
                        } else {
                            opObj.posts[0] = posts[0]
                            var trailing = len - 3
                            for(i=1;trailing<len;trailing++){
                                opObj.posts[i] = posts[trailing]
                            }
                            opObj.posts = toolbox.sortByPost(opObj.posts,'postID')
                        }
                        finalArr[index] = opObj
                        if(finalArr.length == sorted.length){
                            res.render('board.ejs', {
                                board: board,
                                OPs: finalArr        
                            });
                        } 
                    });
            })
        })
        */
    });


    //Post New thread 
    /*
        TO-DO:
            Delete oldest thread if >100
    */
    app.post('/api/thread/:board', upload.any(), (req,res) => {

        postManager.writePost(req.params,req.body, req.connection.remoteAddress)

        res.send('Check DB and try to access manually')

    })

    //Get thread by ID
    app.get('/:board/thread/:id', (req,res)=>{
        var board = req.params.board;
        var threadID = req.params.id;
        Post.find({board: board, OP:threadID})
            .sort('postID')
            .exec(function(err,posts){
            console.log(posts)
            res.render('thread.ejs',{
                posts: posts,
                boardID: board,
                threadID: threadID
            })
        })
    });

    //Reply to thread ID on BOARD
    app.post('/:board/thread/:id', (req,res)=>{
       
        postManager.writePost(req.params,req.body, req.connection.remoteAddress)
        
        res.redirect('/'+req.params.board+'/thread/'+req.params.id)
        
    });

});
