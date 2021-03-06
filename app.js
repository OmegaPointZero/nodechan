const express = require('express');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const morgan = require('morgan'); //log reqs
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const Board = require('./app/models/boards');
const promise = require('rsvp').Promise;
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');

var configURL = process.env.MONGO;

var cors = (function(req,res,next){
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
    next();
});

app.use(cors)
mongoose.Promise = global.Promise;
mongoose.connect(configURL, {useNewUrlParser:true}).then(res => console.log('Successfully connected to Mongo database')).catch(err=>console.log(err))
mongoose.set('useCreateIndex', true);
require('./config/passport')(passport);
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash())
app.use(function(req,res,next){
    res.setTimeout(480000, function(){
        console.log('Request has timed out');
        res.sendStatus(408);
    });
    next();
});

app.use(session({secret:process.env.SESSION_SECRET,resave:true,saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());
require('./app/routes.js')(app,passport);

app.engine('html', require('ejs').renderFile);
app.set('views', 'views');
app.set('view engine', 'html');

app.use(function(req,res,next){
    Board.find({}, function(err,boards){
        res.status(404).render('404.ejs', {
            allBoards: boards
        })
    });
});

var port = 8080;
app.listen(port,function(){
    console.log('Listening on ' + port)
})
