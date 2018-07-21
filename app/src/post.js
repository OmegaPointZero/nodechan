const Post = require('../models/posts');
const Board = require('../models/boards');
const toolbox = require('./tools');
const escape = require('escape-html');

//Get all posts for a single thread
exports.getThread = (function getPosts(board,OP,res){
    Board.find({},function(err,boards){
        if(err) throw err;
        var thisBoard = boards.filter(b=>b.boardCode==board)[0]
        Post.find({board:board,OP:OP}, function(error,posts){
            if(error){console.log(error)};
            if(posts.length === 0){
                res.send(404)
            } else {
                var sorted = toolbox.sortByPost(posts)
                var metadata = toolbox.threadMetaData(posts)
                res.render('thread.ejs', {
                    allBoards: boards,
                    thisBoard: thisBoard,
                    posts: sorted,
                    metadata: metadata
                });
            }
        })
    })
})


//Get catalog of a board
exports.getCatalog = (function getCatalog(board,page){

})

//get a specific page of threads on a board
exports.getPage = (function getPage(board,page,req,res){
    Board.find({},function(err,boards){
        var thisBoard = boards.filter(b=>b.boardCode==board)
        if(thisBoard==""){
            res.status(404).send(404)
            return
        }
        Post.find({board:board},function(err,posts){
            if(err) throw err;
            var OPs = toolbox.getUnique(posts,'OP')       
            var sortedOPs = toolbox.getThreadBumps(OPs,posts)
            if(sortedOPs!=undefined){var pageArr = toolbox.trimToPage(sortedOPs,page)} else {var pageArr=""}
            res.render('board.ejs', {
                allBoards: boards,
                thisBoard: thisBoard,
                OPs: pageArr
            })
        });
    })    
});


//Deletes post with specified postID for one post, or OP for a thread
exports.deletePost = (function deletePost(obj){
    var board = obj.board;
    var postID = obj.postID;
    var OP = obj.OP;
    if(postID && !OP){
        Post.findOneAndRemove({board:board,postID:postID},function(err,post){
            if (err) throw err
            if(post){
                console.log('Deleted ' + post + ' posts')
            }
        })
    } else if(!postID && OP){
        Post.remove({board:board,OP:OP},function(err,post){
            if (err) throw err
            if(post){
                console.log('Deleted a thread: ' + post + ' posts')
            }
        })
    }
})

//After a thread is uploaded, if there are now >100 threads it will delete the last one
exports.bumpAndGrind = (function bumpAndGrind(board){
    Post.find({board:board},function(err,posts){
        var OPs = toolbox.getUnique(posts,'OP')
        var sortedOPs = toolbox.getThreadBumps(OPs,posts)
        var len = sortedOPs.length;
        if(len>100){
            var obj = {
                board: board,
                postID: null,
                OP: 0
            }
            obj.OP = sortedOPs[sortedOPs.length-1].OP
            exports.deletePost(obj)
        }
    })
})

//Write new post to database
exports.writePost = (function writePost(params,body,IP,imgInfo,req,res){
    //if it's a reply, don't do it if the thread has 250+ replies
    if(params.id){
        Post.find({board:params.board,OP:params.id},function(err,posts){
            var len = posts.length;
            if(len>250){
                res.send('Error: You cannot reply to this thread anymore')
                return;
            }
        })
    }
    //convert body.text into
    var newBody = body.text
    
    var post = new Post();     
    post.IP = IP;
    post.name = escape(body.name);
    post.subject = escape(body.subject);
    post.board = params.board;
    post.body = escape(body.text);
    if(imgInfo.time){
        var time = imgInfo.time;
    } else {
        var time = new Date().getTime();
    }
    if(imgInfo.size){
        post.fileName = imgInfo.fileName;
        post.fileOriginalName = imgInfo.originalname;
        post.fileSize = imgInfo.size;
        post.fileDimensions = imgInfo.fileDimensions;
    }
    post.time = time;
    Post.findOne({board:params.board})
        .sort({postID: 'descending'})
        .exec(function(err,posts){
            var OP
            if(params.id){OP = params.id;}else{OP= posts.postID+1}
            post.OP = OP
            var userID = toolbox.makeID(OP,IP)
            post.userID = userID
            post.userIDColor = toolbox.makeRGB(OP,IP)
            post.postID = posts.postID + 1;
            post.save(function(err){
                if(err) throw err;
                res.redirect('/'+req.params.board+'/thread/'+OP)
            });
        })
})
