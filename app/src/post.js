const Post = require('../models/posts');
const Board = require('../models/boards');
const toolbox = require('./tools');
const imageManager = require('./images');
const escape = require('escape-html');

exports.stripIP = (function stripIP(post){
    post.IP = "stripped"
    return post
});

//Get all posts for a single thread
exports.getThread = (function getPosts(board,OP,res){
    Board.find({},function(err,boards){
        if(err) throw err;
        var thisBoard = boards.filter(b=>b.boardCode==board)[0]
        Post.find({board:board,OP:OP}, function(error,posts){
            if(error){console.log(error)};
            if(posts.length === 0){
                console.log('redirecting b/c posts.length')
                res.redirect('/404')
            } else {
                var sorted = toolbox.sortByPost(posts)
                var metadata = toolbox.threadMetaData(posts)
                var banner = imageManager.getBanners()
                res.render('thread.ejs', {
                    banner: banner,
                    allBoards: boards,
                    thisBoard: thisBoard,
                    posts: sorted,
                    metadata: metadata
                });
            }
        })
    })
})


//get a specific page of threads on a board
exports.getPage = (function getPage(board,page,req,res){
    //For normal page function, we get all board info at once for the top/bottom
    //banners listing all of the boards. We don't for the API
    Board.find({},function(err,boards){
        if(err){
            throw(err);
        }
        var thisBoard = {}
        for(var k=0;k<boards.length;k++){
            if(boards[k].boardCode==board){
                thisBoard = boards[k];
                Post.find({board:board},function(error,posts){
                    if(error){
                        throw(error);
                    }
                    var OPs = toolbox.getUnique(posts,'OP')       
                    var sortedOPs = toolbox.getThreadBumps(OPs,posts) 
                    var banner = imageManager.getBanners()
                    if(sortedOPs!=undefined){var pageArr = toolbox.trimToPage(sortedOPs,page)} else {var pageArr=""}
                    res.render('board.ejs', {
                        banner: banner,
                        allBoards: boards,
                        thisBoard: thisBoard,
                        OPs: pageArr,
                        page: page,
                   }); 
               });
            }
            if(k==boards.length-1 && thisBoard == {}) {
                res.redirect('/404')
            }
        }
    })  
});

exports.getCatalog = (function getPage(board,req,res){
    //For normal page function, we get all board info at once for the top/bottom
    //banners listing all of the boards. We don't for the API
    Board.find({},function(err,boards){
        if(err){
            throw(err);
        }
        var thisBoard = {}
        for(var k=0;k<boards.length;k++){
            if(boards[k].boardCode==board){
                thisBoard = boards[k];
                Post.find({board:board},function(error,posts){
                    if(error){
                        throw(error);
                    }
                    var OPs = toolbox.getUnique(posts,'OP') 
                    var sortedOPs = toolbox.getThreadBumps(OPs,posts)
                    var banner = imageManager.getBanners()
                    sortedOPs = toolbox.trimCatalog(sortedOPs)
                    res.render('catalog.ejs', {
                        banner: banner,
                        allBoards: boards,
                        thisBoard: thisBoard,
                        OPs: sortedOPs,
                   }); 
               });
            }
        }
    })  
});

exports.APIgetPage = (function getPage(board,page,req,res){
    Post.find({board:board},function(error,posts){ 
        if(error){
            throw(error);
        }
        var OPs = toolbox.getUnique(posts,'OP')       
        var sortedOPs = toolbox.getThreadBumps(OPs,posts)
        var p = new Array()
        if(sortedOPs!=undefined){
            var pageArr = toolbox.trimToPage(sortedOPs,page)
        } else {var pageArr=""}
        pageArr.forEach(function(arr){
            p = p.concat(arr.preview)
        });
        if(p.length==0){
            res.send('')
        } else {
            for(var i=0;i<p.length;i++){
                p[i] = exports.stripIP(p[i])
                if(i==p.length-1){
                    res.send(p)
                }
            }
        } 
   });
});

exports.APIgetThread = (function APIgetThread(board,thread,req,res){
    Post.find({board:board,OP:thread},function(err,posts){
        if(err){
            throw(err);
        }
        var snipped = new Array()
        posts.forEach(function(post){
            snipped.push(exports.stripIP(post))
        });
        res.send(snipped);
    });
})


exports.deletePost = (function deletePost(obj){
    var board = obj.board;
    var postID = obj.postID;
    var OP = obj.OP;
    if(postID != OP){
        Post.findOneAndRemove({board:board,postID:postID},function(err,post){
            if (err) throw err
            if(post){
                if(post.fileName != undefined){
                    imageManager.deleteImage(post.fileName)
                }
            }
        })
    } else if(postID == OP){
        Post.find({board:board,OP:OP},function(err,posts){
            if (err) throw err
            if(posts){
                for(var n=0;n<posts.length;n++){
                    var image = posts[n].fileName
                    imageManager.deleteImage(image)
                }
                Post.remove({board:board,OP:OP},function(error,posts){
                    if (error){throw error}
                })
            }
        }) 
    }
})

//After a thread is uploaded, if there are now >100 threads it will delete the last one
exports.bumpAndGrind = (function bumpAndGrind(board){
    Post.find({board:board},function(err,posts){
        var OPs = toolbox.getUnique(posts,'OP')
        var sortedOPs = toolbox.getThreadBumps(OPs,posts)
        if(sortedOPs == undefined){
            return
        }else{
            if(sortedOPs.length>100){
                var obj = {
                    board: board,
                    postID: null,
                    OP: 0
                }
                obj.OP = sortedOPs[sortedOPs.length-1].OP
                exports.deletePost(obj)
            }
        }
    })
})

//Write new post to database
exports.writePost = (function writePost(params,body,IP,imgInfo,req,res){
    if(params.id){
        Post.find({board:params.board,OP:params.id},function(err,posts){
            var len = posts.length;
            if(len>250){
                res.send('Error: You cannot reply to this thread anymore')
                return;
            }
        })
    }
    var newBody = body.text
    var post = new Post();     
    post.publicBan = false;
    post.locked = false;
    post.sticky = false;
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
        post.fileOriginalName = toolbox.filename(imgInfo)
        post.fileSize = imgInfo.size;
        post.fileDimensions = imgInfo.fileDimensions;
    }
    post.time = time;
    Post.findOne({board:params.board})
        .sort({postID: 'descending'})
        .exec(function(err,posts){
            var OP
            if(params.id){
                OP = params.id;
            }else if(posts){
                OP = posts.postID+1
            }else{
                OP = 1
            }
            post.OP = OP
            post.userID = toolbox.makeID(OP,IP)
            post.userIDColor = toolbox.makeRGB(OP,IP)
            if(posts){
                post.postID = posts.postID + 1;
            } else {
                post.postID = OP
            }
            post.save(function(err){
                if(err) throw err;
                res.redirect('/'+req.params.board+'/thread/'+OP+'#'+post.postID)
            });
        })
})
