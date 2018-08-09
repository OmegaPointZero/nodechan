const express = require('express');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const morgan = require('morgan'); //log reqs
const bodyParser = require('body-parser')
const passport = require('passport');
const app = express();
const Board = require('./app/models/boards')

//Declare configURL
var configURL = "mongodb://@127.0.0.1:27017/nodechan"

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

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Pass to next layer of middleware
    next();
});

var routes = require('./app/routes');
var api = require('./app/api');

app.use('/', routes);
app.use('/api',api);


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
