'use strict';

// få inn mongoose
var mongoose = require('mongoose');

// connect til mongodb server
// mongodb er protokoll, så lokal maskin, standardport til mongodb, så vår db
mongoose.connect('mongodb://localhost:27017/sandbox');

// monitor status of requests
var db = mongoose.connection;

// events
db.on('error', function (err) {
    console.log('Ånei, mongoose error yo:', err);
});

// once er bare første gang det skjer, så ikke lytter hele tida
db.once('open', function () {
    console.log('DB connecta!');

    // sette opp schema
    var Schema = mongoose.Schema;
    var AnimalSchema = new Schema({ // datatyper, defaults verdier
        type: {type: String, default: 'goldfish' },
        size: String, // settes i prehook
        color:{type:  String, default: 'golden'},
        mass: {type: Number, default: '0.007'},
        name: {type: String, default: 'Blurp'}
    });

    // prehook middleware, kjører før save
    AnimalSchema.pre('save', function (next) {
        // sette size etter mass
        if (this.mass >= 100) {
            this.size = 'big';
        } else if (this.mass >= 5 && this.mass < 100) {
            this.size = 'medium';
        } else {
            this.size = 'small';
        }
        next();
    });

    // A static method can be called by a model, 
    // and an instance method can be called by a document
    
    // lage static function på schemaen
    AnimalSchema.statics.findSize = function (size, callback) {
        // this == Animal
        return this.find({size: size}, callback);
    }

    // instance method
    AnimalSchema.methods.findSameColor = function () {
        // this == document
        return this.model('Animal').find({color: this.color});
    }

    // sette opp modell, for å laaagre... ting? Animal blir Animals
    var Animal = mongoose.model('Animal', AnimalSchema);

    // lage et dyr
    var elephant = new Animal({
        type: 'elephant',
        color: 'grey',
        mass: 6000,
        name: 'Kukken'
    });

    var defaultAnimal = new Animal({}); // blir defaults, som i gullfisk

    // liste over nye objekter
    var animalData = [
        {
            type: 'mouse',
            color: 'grey',
            mass: 0.005,
            name: 'Marvin'
        },
        {
            type: 'ekkorn',
            color: 'brown',
            mass: 20,
            name: 'Nøtteliten'
        },
        {
            type: 'wolf',
            color: 'grey',
            mass: 1456,
            name: 'Ulvesen'
        },
        elephant,
        defaultAnimal
    ];

    // tømme hele collection før lagre, så bare nytt kommer med
    Animal.remove({}, function (err) {
        if (err) console.log('Shiiit, allerede her error.');
        
        // lagre alt fra animalData
        Animal.create(animalData, function (err, animals) {
            if (err) console.log('Shit, save failed!');
            // lese fra databasen
            Animal.findSize('big', function (err, animals) {
                animals.forEach(function (animal) {
                    console.log(animal.name + ' the ' + animal.size + ' ' + animal.type);
                });
                // steng connection
                db.close(function () { 
                    console.log('Greit, DB closed.');
                }); 
            });
        });
    });

})