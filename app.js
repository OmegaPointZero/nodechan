const express = require('express');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const morgan = require('morgan'); //log reqs
const bodyParser = require('body-parser')
const passport = require('passport');
const app = express();
const Board = require('./app/models/boards')
const promise = require('rsvp').Promise;
require('dotenv').config()


//Declare configURL
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
//app.use(promise)
mongoose.connect(configURL);
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser());
app.use(function(req,res,next){
    res.setTimeout(480000, function(){
        console.log('Request has timed out');
        res.send(408);
    });
    next();
});
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
