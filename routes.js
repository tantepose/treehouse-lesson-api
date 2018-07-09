'use strict';

var express = require('express');
var router = express.Router(); 

// GET /questions
router.get('/', function (req, res) {
    // return all questions
    res.json({
        reponse: 'Nei, men hallo! Dette er get!'
    });
});

// GET /questions/:qID
router.get('/:qID', function (req, res) {
    // return spesific question
    res.json({
        reponse: 'Nei, men hallo! Dette er SPESIFIKK get! ID:' + req.params.qID
    });
});

// POST /questions
router.post('/', function (req, res) {
    // create question
    res.json({
        reponse: 'Dette er post!',
        body: req.body
    });
});

// POST /questions/:qID/answers
router.post('/:qID/answers', function (req, res) {
    // create answer
    res.json({
        reponse: 'Post til /answers!',
        questionId: req.params.qID,
        body: req.body
    });
});

// PUT /questions/:qID/answers/:aID
router.put('/:qID/answers/:aID', function (req, res) {
    // edit answer
    res.json({
        reponse: 'PUT til /answers!',
        questionId: req.params.qID,
        answerID: req.params.aID,
        body: req.body
    });
});

// DELETE /questions/:qID/answers/:aID
router.delete('/:qID/answers/:aID', function (req, res) {
    // delete answer
    res.json({
        reponse: 'DELETE til /answers!',
        questionId: req.params.qID,
        answerID: req.params.aID,
    });
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
router.post('/:qID/answers/:aID/vote-:dir', function (req, res, next) {
    // sjekke om vote-down eller vote-up, ingenting annet
    if (req.params.dir.search(/^(up|down)$/) === -1) { // nei
        var err = new Error('Vote not up or down!')
        err.status = 404;
        next (err);
    } else { // ja, da går til next, som her er neste funksjon i samme post route
        next();
    }
    }, function (req, res) { // alt etter - blir da params.dir
        // vote for answer
        res.json({
            reponse: 'POST til vote-' + req.params.dir,
            questionId: req.params.qID,
            answerID: req.params.aID,
            vote: req.params.dir
        });
});

module.exports = router;