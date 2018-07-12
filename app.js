// skrive bedre kode? jaja
'use strict';

// sette opp express
var express = require('express');
var app = express();
var routes = require('./routes');

var jsonParser = require('body-parser').json;
var logger = require('morgan');

// bruk installert middleware
app.use(jsonParser());
app.use(logger('dev'));

// MONGOOSE 

// få inn mongoose
var mongoose = require('mongoose');

// connect til mongodb server
// mongodb er protokoll, så lokal maskin, standardport til mongodb, så vår db
mongoose.connect('mongodb://localhost:27017/qa');

// monitor status of requests
var db = mongoose.connection;

// events
db.on('error', function (err) {
    console.log('Ånei, mongoose error yo:', err);
});

db.once('open', function () { // once er bare første gang det skjer, så ikke lytter hele tida
    console.log('databasen er live');
});

// bruk routeren
app.use('/questions', routes);

// error handling
// 404
app.use(function (req, res, next) {
    var err = new Error('Not found!');
    err.status = 404;
    next(err);
});

// vår egen error handler, for errors som json
// når err er en av fire, da er error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500); // vår eller 500 (internal server error)
    res.json({ // send som json
        error: {
            message: err.message,
        }
    })
});

// sette opp serveren
var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('Express lytter på', port);
});
