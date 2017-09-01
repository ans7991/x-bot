// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var Clip = require('./app/models/clip');
var ClipRepository = require('./app/repositories/clipRepository')
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

function getGoogleResponse(clips) {
  if( clips.length == 1) {
    var clip = clips[0];
    var response = [{
      "type": "simple_response",
      "platform": "google",
      "textToSpeech": clip.Title
    },
    {
      "type": "basic_card",
      "platform": "google",
      "title": clip.Title,
      "subtitle": clip.Title,
      "formattedText": clip.Title,
      "image": {
        "url": clip.Tcid16x9
      },
      "buttons": [
        {
          "title": clip.Title,
          "openUrlAction": {
            "url": clip.videoUrl
          }
        }
      ]
    }];
    return response;
  } else {
    var cards = []
    clips.forEach(function (clip, index, arr) {
      cards.push({
        "optionInfo": {
          "key": "" + index,
          "synonyms": [
            clip.Title
          ]
        },
        "title": "Watch "+ clip.Title,
        "description": clip.description,
        "image": {
          "url": clip.Tcid16x9
        }
      })
    });

    var response = [
         {
           "type": "simple_response",
           "platform": "google",
           "textToSpeech": "Here are the episodes for you"
         },
         {
           "type": "carousel_card",
           "platform": "google",
           "items": cards
         }
       ]
    return response;
  }
}

router.route('/ra').post(function (req, res) {
    console.log(req.body.result.parameters)
    var query = {}
    ClipRepository.find({
        title: req.body.result.parameters.title,
        actor: req.body.result.parameters.actor,
        language: req.body.result.parameters.language,
        genre: req.body.result.parameters.genre,
        episodeNo: req.body.result.parameters.episodeNo,
    }, function(err, clips) {
        if (err)
            res.send(err);
        clips.forEach(function (clip) {
            clip.Tcid16x9 = "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v3/d-1/" + clip.Tcid16x9;
            clip.videoUrl = "https://web.viu.com/in-hindi/en/video-hackathon-" + clip._id;
        })

        res.json({messages: getGoogleResponse(clips)});
    });
});


router.post('/', function (req, res) {
    console.log(req.body.result.parameters);
    var response = 'hello world';
    ClipRepository.find({
        title: req.body.result.parameters.title,
        actor: req.body.result.parameters.actor,
        language: req.body.result.parameters.language,
        genre: req.body.result.parameters.movieGenre,
        episodeNo: req.body.result.parameters.episodeNo,
        limit: 4
    }, (err, clips) => {
        if (err)
            res.send(err);
        var elements = clips.map((clip) => {
            return {
                "title": clip.Title,
                "image_url": clip.Tcid16x9,
                "default_action": {
                    "type": "web_url",
                    "url": clip.videoUrl
                }
            }
        });

        var resp = {
            "speech": response,
            "displayText": response,
            data: {
                "facebook": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "elements": elements
                        }
                    }
                }
            }
        }
        console.log(JSON.stringify(resp))
        res.json(resp);
    });
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
    ClipRepository.find({
        title: req.query.title,
        actor: req.query.actor,
        language: req.query.language,
        genre: req.query.genre,
        episodeNo: req.query.episodeNo,
    }, function (err, clips) {
        if (err)
            res.send(err);
        clips = clips ? clips : [];
        res.json(clips);
    });
});
