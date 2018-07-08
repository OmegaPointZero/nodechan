const Post = require('../models/posts');
const toolbox = require('./tools')

//Get all posts for a single thread
exports.getThread = (function getPosts(OP){
    Post.find({OP:OP}, function(err,posts){
        if(err){console.log(err)};
        var sorted = toolbox.sortByPost(posts)
    })
})

//Get strictly all OPs, but sorted by last bump
//Set an external variable from mongoose call
//set results of mongoose call to external variable
//return variable once variable is set
exports.getCatalog = (function getCatalog(board,page){

})

//Get post info for all posts on any given page
// Add support for catalog
// Add external variable, set pageArr to variable
// then return variable
exports.getPage = (function getPage(board,page,req,res){
    Post.find({board:board},function(err,posts){
        if(err) throw err;
        var OPs = toolbox.getOPs(posts)       
        var sortedOPs = toolbox.getThreadBumps(OPs,posts)
        var pageArr = toolbox.trimToPage(sortedOPs,page) 
        res.send(pageArr)
    });
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
        var OPs = toolbox.getOPs(posts)
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
exports.writePost = (function writePost(params,body,IP,req,res){

    //if it's a reply, don't do it if the thread has 250+ replies
    if(params.id){
        Post.find({board:params.board,OP:params.id},function(err,posts){
            var len = posts.length;
            if(len=>250){
                res.send('Error: You cannot reply to this thread anymore')
                return;
            }
        })
    }
    //Write post to DB
    var post = new Post();     
    post.IP = IP;
    post.name = body.name;
    post.subject = body.subject;
    post.board = params.board;
    post.body = body.text;
    var time = new Date().getTime();
    post.time = time
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
