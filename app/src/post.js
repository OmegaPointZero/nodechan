const Post = require('../models/posts');
const toolbox = require('./tools')

//Write new post to database
exports.writePost = (function writePost(params,body,IP){
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
            console.log('posts: ' + JSON.stringify(posts))
            if(params.id){post.OP = params.id;}else{post.OP=posts.postID+1}
            post.postID = posts.postID + 1;
            post.save(function(err){
                if(err) throw err;
            });
        })
})

//Get all posts for a single thread
exports.getThread = (function getPosts(OP){
    Post.find({OP:OP}, function(err,posts){
        if(err){console.log(err)};
        var sorted = toolbox.sortByPost(posts)
    })
})

/*  +Get all posts for all threads
    +Make object that holds OP and timestamp of last post
    +sort by timestamps
    +get ten threads that make the requested page
    +cut the threads down to the OP, and last 3
    +push array into final array
    +Return array of arrays, nested arrays are the threads 
*/
exports.getPage = (function getPage(board,page,req,res){
    
    var retArr = [];

    //Get all posts for all threads
    Post.find({board:board},function(err,posts){
        var myObj = {
            OP: 0,
            bumpTime: 0
        }
        //Get all unique OPs
        var OPs = toolbox.getOPs(posts)
        
        //With all OPs, get biggest value for timestamp and sort
        var sortedOPs = toolbox.getThreadBumps(OPs,posts)

        //trim array to only posts that will be on page requested
        var pageArr = toolbox.trimToPage(sortedOPs,page) 
        console.log(pageArr)       
        res.send(pageArr)
    });
});
