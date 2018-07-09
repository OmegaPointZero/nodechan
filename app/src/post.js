const Post = require('../models/posts');
const Board = require('../models/boards');
const toolbox = require('./tools')

//Get all posts for a single thread
exports.getThread = (function getPosts(OP){
    Post.find({OP:OP}, function(err,posts){
        if(err){console.log(err)};
        var sorted = toolbox.sortByPost(posts)
    })
})

exports.getCatalog = (function getCatalog(board,page){

})

exports.getPage = (function getPage(board,page,req,res){

    Board.find({},function(err,boards){

        var thisBoard = boards.filter(b=>b.boardCode==board)
        console.log(`thisBoard: ${thisBoard}`)
        Post.find({board:board},function(err,posts){
            if(err) throw err;
            var OPs = toolbox.getUnique(posts,'OP')       
            var sortedOPs = toolbox.getThreadBumps(OPs,posts)
            var pageArr = toolbox.trimToPage(sortedOPs,page) 
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
        console.log(`len: ${len}`)
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
    console.log(`imgInfo:\n${imgInfo}`)
    //Write information to post Schema for db
    var post = new Post();     
    post.IP = IP;
    post.name = body.name;
    post.subject = body.subject;
    post.board = params.board;
    post.body = body.text;
    var time = imgInfo.time;
    post.fileName = imgInfo.fileName;
    post.fileOriginalName = imgInfo.originalname;
    post.fileSize = imgInfo.size;
    post.fileDimensions = imgInfo.fileDimensions;
    post.time = time;
    console.log(`post so far:\n${post}`)
    //Get all posts and grab the biggest post #
    //Assign biggest post # +1 to post
    //check if this is an OP
    Post.findOne({board:params.board})
        .sort({postID: 'descending'})
        .exec(function(err,posts){
            var OP
            if(params.id){OP = params.id;}else{OP= posts.postID+1}
            post.OP = OP
            post.postID = posts.postID + 1;
            post.save(function(err){
                if(err) throw err;
                res.redirect('/'+req.params.board+'/thread/'+OP)
            });
        })
})
