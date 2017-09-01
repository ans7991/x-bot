// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var Clip = require('./app/models/clip');
//var mongoose = require('mongoose');
//
//mongoose.connect('mongodb://artist:artist@ds127260.mlab.com:27260/content');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var port = process.env.PORT || 5050; // set our port

var router = express.Router(); // get an instance of the express Router

router.use(function (req, res, next) {
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function (req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

app.use('/api', router);

var mongoose = require('mongoose');

var options = {
    server: {
        socketOptions: {
            keepAlive: 300000,
            connectTimeoutMS: 30000
        }
    },
    replset: {
        socketOptions: {
            keepAlive: 300000,
            connectTimeoutMS: 30000
        }
    }
};

var mongodbUri = 'mongodb://artist:artist@ds127260.mlab.com:27260/content';

mongoose.connect(mongodbUri, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function () {
    app.listen(port);
    console.log('Magic happens on port ' + port);
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------


router.route('/query').get(function (req, res) {
    var query = {}
    if (req.query.title) {
        query = {
            $text: {
                $search: req.query.title
            }
        }
    }
    if (req.query.actor) {
        query.Actors = {
            $regex: ".*" + req.query.actor + ".*"
        }
    }
    if (req.query.language) {
        query.Language = {
            $eq: req.query.language.charAt(0).toUpperCase() + req.query.language.slice(1)
        }
    }

    console.log(query);
    Clip.find(query).select('Title _id Actors Actresses Tcid16x9 Language').lean().limit(100).exec(
        function (err, clips) {
            if (err)
                res.send(err);
            clips.forEach(function (clip) {
                clip.Tcid16x9 = "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v3/d-1/" + clip.Tcid16x9 + ".jpg";
                clip.videoUrl = "https://web.viu.com/in-hindi/en/video-hackathon-" + clip._id;
            })

            res.json(clips);
        });

});
