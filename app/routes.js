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
        cb(null, file.originalname)
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
            if(err){console.log(err)}
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
        postManager.getCatalog(board,req,res)
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
            var imgInfo = imageManager.uploadImage(req.files[0],time,true,req,res)
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
                var imgInfo = imageManager.uploadImage(req.files[0],time,false,req,res);
            } else {
                postManager.writePost(req.params,req.body,req.connection.remoteAddress,{time:new Date().getTime()},req,res);
            }
        }
    });

    // Delete a thread or post from a board
    app.post('/:board/delete', (req,res)=>{
        // uhhh make it so the IP posting this req has to match IP of post being deleted, unless admin
        var board = req.params.board 
        var id = Number(req.body.id)
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

    app.get('/report/:board/:post', (req,res)=>{
        var b = req.params.board;
        var p = req.params.post;
        if(isNumber.test(p)){
            res.render('report.ejs', {
                board: b, post: p
            })
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
                res.send('Report saved!')
            }
        })
    });

    //ADMIN FUNCTIONS
    app.get(process.env.LOGINROUTE, (req,res)=>{
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    /* Route for logging in existing admin */
    app.post(process.env.LOGINROUTE, passport.authenticate('local-login', {
        successRedirect : process.env.ADMINROUTE,
        failureRedirect : process.env.LOGINROUTE,
        failureFlash: true,
    })); 

    /*  If it's the first time this database is saving an admin, comment out
        the above POST /login route, and uncomment this one, to register a 
        new user. It's a dirty way to do it but it works 

    app.post(process.env.LOGINROUTE, passport.authenticate('local-signup', {
        successRedirect: process.env.ADMINROUTE,
        failureRedirect: process.env.LOGINROUTE})
    );  */

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
        console.log(`test received: ${req.body}`)
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
                    res.send('Board Saved!');
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

    //API REQUESTS BEGIN HERE
    app.post('/api/users', isAdmin, (req,res)=>{
        var board = req.body.board;
        var IP = req.body.IP;
        Post.find({board:board,IP:IP},function(err,posts){
            if(err){throw(err)}
            res.send(posts)
        });
    });

    app.get('/api/admin/reports', isAdmin, (req,res) => {
        Report.find({},function(err,reps){
            if(err){
                throw err
            }
            res.send(reps)
        }); 
    });

    app.get('/api/boardlist', (req,res)=>{
        Board.find({},function(err,boards){
            res.send(boards)
        });
    });

    app.get('/api/bans', isAdmin, (req,res)=>{
        Banned.find({},function(err,bans){
            res.send(bans);
        });
    });
    
    //Get a page of a board
    app.get('/api/board/:board/:page*?', (req,res)=>{
        var page;
        if(/^(\s*|\d+)$/.test(req.params.page)){
            page = req.params.page
        } 
        if(req.params.page==undefined){
            page = 1; 
        }
        if(page>-1 && page < 10){
            var board = req.params.board;
            postManager.APIgetPage(board,page,req,res)
        } else if(page>10){
            console.log('redirecting because page requested is >10')
            res.redirect('/error/404')
            return
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
            res.sendStatus('Invalid Post Number')
        } else {
            Post.findOne({board:board,postID:post}, function(err,post){ 
                var p = postManager.stripIP(post)
                res.send(p)
            });
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
            Post.find({board:board,OP:thread,postID: {$gt: post}}, function(err,posts){
                posts.forEach(function(post){
                    postManager.stripIP(post)
                });
                res.send(posts);
            });
        }
    })

    function isAdmin(req,res,next){
        if(req.isAuthenticated())
            return next();
        res.redirect(process.env.LOGINROUTE);
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
