'use strict';

var express = require('express');
var router = express.Router(); 
var Question = require('./models').Question;

// kjører når qID eksisterer
// You can query the database from `router.param()`, 
// and have the resulting document ready for routes using that parameter.
router.param('qID', function (req, res, next, id) {
    // return spesific question
    Question.findById(req.params.qID, function (err, doc) {
        if (err) return next(err);
        if (!doc) {
            err = new Error('Question not found!');
            err.status = 404;
            return next(err);
        }
        req.question = doc;
        return next();
    });
});

// kjører når aID eksisterer
router.param('aID', function (req, res, next, id) {
    req.answer = req.question.answers.id(id);
    if (!req.answer) {
        err = new Error('Answer not found!');
        err.status = 404;
        return next(err);
    }
    next();
});

// GET /questions
router.get('/', function (req, res, next) {
    // return all questions, ikke projections, derav null, sort createdat desc
    Question.find({})
        .sort({createdAt: -1}) // sortere
        .exec(function (err, questions) { //eksevere når klar
            if (err) return next(err); // sende til express error if error
            res.json(questions); // responder med alle questions som json
        });

    // ELLER:
    // Question.find({}, null, {sort: {createdAt: -1}}, function (err, questions) {
    //     if (err) return next(err); // sende til express error if error
    //     res.json(questions); // responder med alle questions som json
    // });
});

// GET /questions/:qID
router.get('/:qID', function (req, res, next) {
    res.json(req.question); // fra params funksjonen
});

// POST /questions
router.post('/', function (req, res, next) {
    // create question
    var question = new Question(req.body); // lage nytt spørsmål
    question.save(function (err, question, next) { // lagre nytt spørsmål
        if (err) return next(err); // error
        res.status(201); // gi status
        res.json(question); // returnere json
    });
});

// POST /questions/:qID/answers
router.post('/:qID/answers', function (req, res, next) {
    req.question.answers.push(req.body);
    req.question.save(function (err, question) {
        if (err) return next(err);
        res.status(201);
        res.json(question);
    });
});

// PUT /questions/:qID/answers/:aID
router.put('/:qID/answers/:aID', function (req, res, next) {
    // edit answer
    req.answer.update(req.body, function (err, result) {
        if(err) return next(err);
        res.json(result);
    });
});

// PUT /questions/:qID
router.put('/:qID', function (req, res, next) {
    // edit answer
    req.question.update(req.body, function (err, result) {
        if(err) return next(err);
        res.json(result);
    });
});

// DELETE /questions/:qID/answers/:aID
router.delete('/:qID/answers/:aID', function (req, res, next) {
    // delete answer
    req.answer.remove(function (err) {
        req.question.save(function (err, question) {
            if(err) return next(err);
            res.json(question);
        });
    });
});

// DELETE /questions/:qID
router.delete('/:qID', function (req, res, next) {
    // delete answer
    req.question.remove(function (err) {
        if(err) return next(err);
        res.json({'message': 'Deleted!'});
    });
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
router.post('/:qID/answers/:aID/vote-:dir', function (req, res, next) {
    // vote for answer
    // sjekke om vote-down eller vote-up, ingenting annet
    if (req.params.dir.search(/^(up|down)$/) === -1) { // nei
        var err = new Error('Vote not up or down!')
        err.status = 404;
        next (err);
    } else { // ja, da går til next, som her er neste funksjon i samme post route
        req.vote = req.params.dir;
        next();
    }
    }, function (req, res, next) { // alt etter - blir da params.dir
        req.answer.vote(req.vote, function (err, question) {
            if(err) return next(err);
            res.json(question);
        });
});

module.exports = router;