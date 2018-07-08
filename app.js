const express = require('express');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const morgan = require('morgan'); //log reqs
const bodyParser = require('body-parser')
const passport = require('passport');
const app = express();

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
require('./app/routes.js')(app,passport);


app.engine('html', require('ejs').renderFile);
app.set('views', 'views');
app.set('view engine', 'html');

var port = 80;
app.listen(port,function(){
    console.log('Listening on ' + port)
})
