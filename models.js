'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// sort function for sort i QuestionSchema.pre
var sortAnswers = function (a, b) {
    // - a before b
    // 0 no change
    // + a after b
    if (a.votes === b.votes) {
        return b.updateddAt - a.updateddAt;
    }
    return b.votes - a.votes; 
}

// schema
var AnswerSchema = new Schema ({
    text: String,
    createdAt: { type: Date, default: Date.now }, // blir datoen den lages
    updateddAt: { type: Date, default: Date.now }, 
    votes: { type: Number, default: 0 }
});

// instance method for oppdatering av updated at
AnswerSchema.method('update', function (updates, callback) {
    Object.assign(this, updates, {updatedAt: new Date()});
    this.parent().save(callback);
});

// stemmelogikk
AnswerSchema.method('vote', function (vote, callback) {
    if (vote === 'up') {
        this.votes += 1;
    } else {
        this.votes -= 1;
    }
    this.parent().save(callback);
});

var QuestionSchema = new Schema ({
        text: String,
        createdAt: { type: Date, default: Date.now }, // blir datoen den lages
        answers: [AnswerSchema]
});

// så ting sorteres med en gang folk stemmer på svar
QuestionSchema.pre('save', function (next) {
    this.answers.sort(sortAnswers);
    next();
});

// model
var Question = mongoose.model('Question', QuestionSchema);

// eksporter
module.exports.Question = Question; 