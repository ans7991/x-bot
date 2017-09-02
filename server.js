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
app.use(express.static(__dirname + '/public'));
require('./app/routes')(app);

var port = process.env.PORT || 5050; // set our port

var router = express.Router(); // get an instance of the express Router

router.use(function (req, res, next) {
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

function getGoogleResponse(clips) {
    if (clips.length == 0) {
        var response = [
            {
                "type": "simple_response",
                "platform": "google",
                "textToSpeech": "I couldn't find something, Can you show you any thing else? What do you want to see?"
       }
     ]
        return response;
    } else if (clips.length == 1) {
        var clip = clips[0];
        var response = [{
                "type": "simple_response",
                "platform": "google",
                "textToSpeech": "Here is the episode for you"
    },
            {
                "type": "basic_card",
                "platform": "google",
                "title": clip.Title,
                "image": {
                    "url": clip.Tcid16x9,
                    "accessibilityText": "Thumbnail image for " + clip.Title
                },
                "buttons": [
                    {
                        "title": "Watch the episode",
                        "openUrlAction": {
                            "url": clip.videoUrl
                        }
        }
      ]
    },
            {
                "type": "link_out_chip",
                "platform": "google",
                "destinationName": "to tell friends",
                "url": "https://www.facebook.com/sharer/sharer.php?u=" + clip.videoUrl
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
                "title": "Watch " + clip.Title,
                "description": clip.description,
                "image": {
                    "url": clip.Tcid16x9,
                    "accessibilityText": "Thumbnail image for " + clip.Title
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

router.post('/', function (req, res) {
    var title;
    var actor;
    var language;
    var genre;
    var episodeNo;
    if (req.body.result.action == "show") {
      title=req.body.result.parameters.title;
      actor=req.body.result.parameters.actor;
      language=req.body.result.parameters.language;
      genre=req.body.result.parameters.movieGenre;
      episodeNo=req.body.result.parameters.episodeNo;
    } else if (req.body.result.action == "play") {
      var context = req.body.result.contexts.find(c => c.name == 'content-shown');
      title=context.parameters['title.original'];
      actor=context.parameters['actor.original'];
      language=context.parameters['language.original'];
      genre=context.parameters['movieGenre.original'];
      episodeNo=context.parameters['episodeNo.original'];
    }

    ClipRepository.find({
        title: title,
        actor: actor,
        language: language,
        genre: genre,
        episodeNo: episodeNo,
        limit: 4
    }, (err, resultClips) => {
        if (err)
            res.send(err);
        var clips;
        if (req.body.result.action == "play") {
          var clipToPlay = resultClips[req.body.result.parameters.ordinal];
          clips = clipToPlay ? [clipToPlay] : []
        } else {
          clips = resultClips ? resultClips : []
        }

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
            "messages": getGoogleResponse(clips),
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
