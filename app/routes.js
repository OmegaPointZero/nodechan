const Post = require('./models/posts');
const Board = require('./models/boards');
const Report = require('./models/report');
const Banned = require('./models/banned');
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
        var newname = toolbox.filename(file)
        cb(null, newname)
    }
});

const upload = multer({storage: storage});
if(!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length-1]
    }
}

const isNumber = new RegExp(/^\d+$/)

module.exports = (function(app,passport){

    //Get Home page
    app.get('/', (req,res)=>{
        Board.find({},function(err,boards){
            if(err){throw(err)}
            res.render('home.ejs',{boards:boards})
        })
    })

    app.get('/banned',(req,res)=>{
        var foundBan = false;
        Board.find({},function(e,boards){
            if(e){throw(e)}
            Banned.find({},function(err,bans){
                var userIP = req.connection.remoteAddress;
                for(var i=0;i<bans.length;i++){
                    var tb = bans[i]
                    if(tb.IP==userIP){  
                        foundBan = true;
                        var now = new Date().getTime()
                        if(tb.end<now){
                            Banned.remove({IP:userIP},function(e,b){
                                if(e){throw(e)}
                                res.render('bans.ejs', {allBoards:boards,ban:null});
                            });
                        } else if(tb.end>=now){
                            res.render('bans.ejs', {allBoards:boards,ban:tb});
                        }
                    } else if((i==bans.length-1) && (!foundBan)) {
                        res.render('bans.ejs', {allBoards:boards,ban:null});
                    } 
                }
            });
        });
    })

    app.get('/boards/:board/catalog', (req,res)=>{
        var board = req.params.board
        postManager.getCatalog(board,false,req,res)
    });

    //Get board page
    app.get('/boards/:board/:page*?', (req,res,next) => {
        var page;
        if(isNumber.test(req.params.page)){
            page = req.params.page
        } 
        if(req.params.page==undefined){
            page = 1; 
        }
        if(page=='thread'){next();return}
        if(page>-1 && page <= 10){
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
    app.post('/boards/:board', notBanned, upload.any(), (req,res) => {
        if(req.files.length===0){
            res.send('Error: You forgot to upload an image')
            return;
        } else {
            var time = new Date().getTime();
            var imgInfo = imageManager.uploadImage(req.files[0],time,true,false,req,res)
            postManager.bumpAndGrind(req.params.board)
        }
    })

    //Get thread by ID
    app.get('/:board/thread/:id', (req,res)=>{
        var threadID = req.params.id;
        var board = req.params.board;
        isNumber.test(threadID) ? postManager.getThread(board,threadID,res) : res.send('Invalid Thread ID')
    });

    //Reply to thread ID on BOARD
    app.post('/:board/thread/:id', notBanned, upload.any(), (req,res)=>{
        if(req.files.length===0 && req.body.text== ""){
            res.send('Error: Response cannot be empty')
        } else {
            var time = new Date().getTime();
            if(req.files.length>0){
                var imgInfo = imageManager.uploadImage(req.files[0],time,false,false,req,res);
            } else {
                /* this is an if/else because imageManager() will parse the 
                image and attach it to the post, otherwise it doesn't attach */
                postManager.writePost(req.params,req.body,req.connection.remoteAddress,{time:new Date().getTime()},false,req,res);
            }
        }
    });

    // Delete a thread or post from a board
    app.post('/:board/delete', (req,res)=>{
        var payload = req.body.payload;
        var userIP = req.connection.remoteAddress
        var validIP = (function(board,post,IP){
            return new Promise (function(resolve,reject) {
                Post.findOne({board:board,postID:post}, function(err,p){
                    var isValid;
                    p.IP == IP ? isValid = true : isValid = false;
                    resolve(isValid)
                })
            })
        })
        
        var verifyValidIP = async (load,IP,final) => {
            var board = load.board;
            var post = load.id;
            var result = await (validIP(board,post,IP));
            if(result || req.user){
                deleteLoad(load)
            }
            if(final){
                res.send('complete')
            }
        };
            
        var deleteLoad = (function(load){
            var myObj = {
                postID: load.id,
                OP: load.OP,
                board: load.board
            }
            postManager.deletePost(myObj)
        });

        for(var i=0;i<payload.length;i++){
            var load = payload[i]
            verifyValidIP(load,userIP,(i==payload.length-1))
        }
    });

    app.get('/report/:board/:post', (req,res)=>{
        var b = req.params.board;
        var p = req.params.post;
        if(isNumber.test(p)){
            Post.findOne({board:b,postID:p},function(err,post){
                if(err){throw(err)}
                if(post){
                    res.render('report.ejs', {
                        board: b, post: p
                    })
                } else if(!post) {
                    res.send('No such post')
                }
            });
        } else {
            res.send('Invalid post ID')
        }
    });

    app.post('/report', notBanned, (req,res)=>{
        var repo = new Report();
        repo.board = req.body.board;
        repo.post = req.body.post;
        repo.reportingIP = req.connection.remoteAddress;
        repo.reason = req.body.reason;
        repo.reviewed = false;
        repo.admin = '';
        repo.action = '';
        repo.time = new Date().getTime();
        repo.save(function(err){
            if(err){
                throw(err);
                res.send(err)
            } else {
                res.render('reported.ejs')
            }
        })
    });

    //ADMIN FUNCTIONS
    app.get(process.env.LOGINROUTE, (req,res)=>{
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    /* Route for logging in existing admin 
    app.post(process.env.LOGINROUTE, passport.authenticate('local-login', {
        successRedirect : process.env.ADMINROUTE,
        failureRedirect : process.env.LOGINROUTE,
        failureFlash: true,
    })); */

    /*  If it's the first time this database is saving an admin, comment out
        the above POST /login route, and uncomment this one, to register a 
        new user. It's a dirty way to do it but it works 
    */ 
    app.post(process.env.LOGINROUTE, passport.authenticate('local-signup', {
        successRedirect: process.env.ADMINROUTE,
        failureRedirect: process.env.LOGINROUTE})
    );  

    
    app.get(process.env.ADMINROUTE, isAdmin, (req,res)=>{
        Board.find({}, function(err,boards){
            if(err){throw err;}
            Report.find({}, function(error,reports){
                if(err){throw err;}
                Banned.find({},function(e,bans){
                    if(e){throw(e)}
                    res.render('admin.ejs', {boards: boards, reports:reports, bans:bans, user:req.user.username});
                });
            })
        });
    });

    app.post('/admin/test', (req,res)=>{
        console.log(`test received: ${JSON.stringify(req.body)}`)
        res.send(req.body)
    });

    app.post('/admin/boards', isAdmin, (req,res)=>{
        if(req.body.action=='New Board'){
            var B = new Board();
            B.boardCode = req.body.code;
            B.boardTitle = req.body.title,
            B.category = req.body.category;
            B.stickyThreads = [];
            B.lockedThreads = [];
            B.save(function(err){
                if(err){throw(err);res.send(err)}else{
                    res.redirect('/admin');
                }
            });
        } else if(req.body.action=='Delete'){
            Board.findOneAndRemove({boardCode:req.body.board},function(err){
                if(err){
                    throw(err)
                } else {
                    res.redirect(process.env.ADMINROUTE)
                }
            })
        } else {
            var tgt;
            if(req.body.action=='changeCode'){
                tgt="boardCode"
            } else if(req.body.action=='changeTitle'){
                tgt="boardTitle"
            } else if(req.body.action=='changeCategory'){
                tgt="category"
            }
            Board.findOneAndUpdate({"boardCode":req.body.board},{$set:{tgt:req.body.target}},function(err,board){
                if(err){
                    throw err;
                } else {
                    res.send(req.body.target);
                }
            });
        }
    });

    app.post('/admin/repMgr', isAdmin, (req,res)=>{
        var b = req.body.board;
        var p = req.body.post;
        var a = req.body.action;
        var reason = req.body.reason;
        var o = {board:b,post:p}
        var quiet = /q$/.test(a)
        if(a=='nothing'){
            Report.remove(o,function(err,post){
                res.send('success')
            })
        } else if(a=='falseRep'){
            /* Ban reporting IP Address */ 
        } else {  
            Post.findOne({board:b,postID:p},function(error,post){   
                var start = new Date().getTime();
                var end;
                if(/^1/.test(a)){
                    end = start + 86400000
                }
                if(/^3/.test(a)){
                    end = start + 259200000
                }
                if(/^permanent/.test(a)){
                    end = 3141592658979323
                }
                if(/^delete/.test(a)){
                    end = 3141592658979323
                    imageManager.deleteImage(post.fileName)
                }
                var Ban = new Banned()
                Ban.IP = post.IP;
                Ban.start = start;
                Ban.end = end;
                Ban.reason = reason;
                Ban.offense = o;
                Ban.reportingIP = req.connection.remoteAddress;
                Ban.admin = req.user.username;
                Ban.save(function(err){
                    if(err){throw(err)}
                });
                res.send('Success!')
            });
        }
        if(a=='delete'){
            Post.remove({board:b,postID:p},function(e,d){
                if(e){throw(e)}
            });
        }
        if(quiet==false){
            Post.findOneAndUpdate({board:b,postID:p},{$set:{"publicBan":true}}, function(err,post){
                if(err){
                    throw(err)
                }
            });
        }
    });

    app.post('/admin/banMgr', isAdmin, (req,res)=>{
        var a = req.body.action;
        var id = req.body.id;
        if(a=="unban"){
            Banned.remove({_id:id},function(err,ban){
                if(err){throw(err)}
                res.send('removed')
            });
        } else {
            Banned.findOne({_id:id},function(err,ban){
                var newEnd;
                if(a=="permanent"){
                    newEnd = 3141592658979323;
                } else if (a=="1day") {
                    newEnd = ban.start + 86400000;
                } else if (a=="3day"){
                    newEnd = ban.start + 259200000;
                }
                Banned.findOneAndUpdate({_id:id},{$set:{"end":newEnd}},function(e,b){
                    if(err){throw(err)}
                    res.send('updated')
                })
            })
        }
    });

    app.post('/admin/sticky', isAdmin, (req,res)=>{
        var body = req.body;
        var action = req.body.action
        var board = req.body.board
        var thread = req.body.thread
        var update = false
        if(action=='sticky'){
            update = true
            Board.update({"boardCode":board},{$push:{stickyThreads:thread}},function(err,board){
                if(err){throw(err)}
            })
        } else {
            Board.update({"boardCode":board},{$pull:{stickyThreads:thread}},function(err,board){
                if(err){throw(err)}
            })
        }
        Post.update({"board":board,OP:thread},{$set:{sticky:update}},function(err,board){
            if(err){throw(err)}
            res.send('Updated')
        })
    });

    app.post('/admin/lock', isAdmin, (req,res)=>{
        var body = req.body;
        console.log(body)
        var action = req.body.action
        var board = req.body.board
        var thread = req.body.thread
        var update = false
        if(action=='lock'){
            update = true
            Board.update({"boardCode":board},{$push:{lockedThreads:thread}},function(err,board){
                if(err){throw(err)}
            })
        } else {
            Board.update({"boardCode":board},{$pull:{lockedThreads:thread}},function(err,board){
                if(err){throw(err)}
            })
        }
        Post.update({"board":board,OP:thread},{$set:{locked:update}},function(err,board){
            if(err){throw(err)}
            res.send('Updated')
        })
    });

    //API REQUESTS BEGIN HERE
    app.get('/api/boardlist', (req,res)=>{
        Board.find({},function(err,boards){
            res.send(boards)
        });
    });

    app.get('/api/catalog/:board/', (req,res)=>{
        var board = req.params.board
        postManager.getCatalog(board,true,req,res)
    });

    //Post New thread on :board
    app.post('/api/boards/:board', notBanned, upload.any(), (req,res) => {
        if(req.files.length===0){
            res.send('Error: You forgot to upload an image')
            return;
        } else {
            var time = new Date().getTime();
            var imgInfo = imageManager.uploadImage(req.files[0],time,true,true,req,res)
            postManager.bumpAndGrind(req.params.board)
        }
    })
    
    //Reply to thread ID on BOARD
    app.post('/api/thread/:board/:id', notBanned, upload.any(), (req,res)=>{
        if(req.files.length===0 && req.body.text== ""){
            res.send('Error: Response cannot be empty')
        } else {
            var time = new Date().getTime();
            if(req.files.length>0){
                var imgInfo = imageManager.uploadImage(req.files[0],time,false,true,req,res);
            } else {
                /* this is an if/else because imageManager() will parse the 
                image and attach it to the post, otherwise it doesn't attach */
                postManager.writePost(req.params,req.body,req.connection.remoteAddress,{time:new Date().getTime()},true,req,res);
            }
        }
    });

    //Get a page of a board
    app.get('/api/board/:board/:page*?', (req,res)=>{
        var page;
        var board = req.params.board;
        if(/^(\s*|\d+)$/.test(req.params.page)){
            page = req.params.page
        } 
        if(req.params.page==undefined){
            page = 1; 
        }
        if(page>-1 && page < 10){
            Board.findOne({boardCode:board},function(err,brd){
                if(err){throw(err)}
                if(brd){
                    postManager.APIgetPage(brd.boardCode,page,req,res)
                } else if(!brd){
                    res.send('Invalid board')
                }
            })
        } else if(page>10){
            res.sendStatus(404)
        } else {
            res.sendStatus(404)
        }
    }); 

    //Get thread data
    app.get('/api/thread/:board/:thread', (req,res)=>{
        var board = req.params.board;
        var thread = req.params.thread;
        isNumber.test(thread) ? postManager.APIgetThread(board,thread,req,res) : res.send('Invalid Thread ID')
    });

    //Get Post Data
    app.get('/api/post/:board/:post', (req,res)=>{
        var board = req.params.board;
        var post = req.params.post;
        if(!isNumber.test(post)){
            res.send('Invalid Post Number')
        } else {
            Board.findOne({boardCode:board},function(err,brd){
                if(brd){
                    Post.findOne({board:board,postID:post}, function(err,post){ 
                        if(post){
                            var p = postManager.stripIP(post)
                        }
                        res.send(p)
                    });
                } else if(!brd){
                    res.send('Invalid board code')
                }
            })
        }
    });

    // Get all posts made in a thread following :post
    app.get('/api/update/:board/:thread/:post', (req,res)=>{
        var board = req.params.board;
        var post = req.params.post;
        var thread = req.params.thread;
        if(!isNumber.test(post)){
            res.send('Invalid Post Number')
        } else if(!isNumber.test(thread)){
            res.send('Invalid Thread Number')
        } else {
            Board.find({board:board},function(err,b){
                if(err){throw(err)}
                Post.find({board:board,OP:thread,postID: {$gt: post}}, function(err,posts){
                    posts.forEach(function(post){
                        postManager.stripIP(post)
                    });
                    res.send(posts);
                });
            });
        }
    })

    app.get('/api/banner', (req,res) => {
        res.send({'banner': imageManager.getBanners()})
    })

    // API for ADMIN functions
    //Get all posts by user IP address
    app.post('/api/admin/users', isAdminAPI, (req,res)=>{
        var board = req.body.board;
        var IP = req.body.IP;
        Post.find({board:board,IP:IP},function(err,posts){
            if(err){throw(err)}
            res.send(posts)
        });
    });

    app.get('/api/admin/reports', isAdminAPI, (req,res) => {
        Report.find({},function(err,reps){
            if(err){
                throw err
            }
            res.send(reps)
        }); 
    });

    app.get('/api/admin/bans', isAdminAPI, (req,res)=>{
        Banned.find({},function(err,bans){
            res.send(bans);
        });
    });


    function isAdmin(req,res,next){
        if(req.isAuthenticated())
            return next();
        res.redirect(process.env.LOGINROUTE);
    }

    function isAdminAPI(req,res,next){
        if(req.isAuthenticated())
            return next();
        res.status(401).send('Forbidden: You are not authorized')
    }

    function notBanned(req,res,next){
        var ipaddr = req.connection.remoteAddress
        Banned.findOne({IP:ipaddr},function(err,banned){
            if(banned==null){
                return next();
            }
            var now = new Date().getTime();
            if(now<banned.end){
                res.redirect('/banned')
            } else if(now>banned.end){
                Banned.remove({IP:ipaddr},function(e,b){
                    return next();
                });
            }
        });
    }
}); 
