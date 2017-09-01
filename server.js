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

router.post('/', function (req, res) {
    console.log(req);
    var response = 'hello world';
    var x = {
        "facebook": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "elements": [
                        {
                            "title": "Gehraiyaan Uncut Ep-1",
                            "image_url": "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v2/d-1/1151929856.jpg",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://web.viu.com/in-hindi/en/video-gehraiyaan_uncut_ep_1-1151929856"
                            }
                        },
                        {
                            "title": "Gehraiyaan Uncut Ep-2",
                            "image_url": "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v2/d-1/1152042075.jpg",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://web.viu.com/in-hindi/en/video-gehraiyaan_uncut_ep_2-1152042075"
                            }
                        },
                        {
                            "title": "Gehraiyaan Uncut Ep-3",
                            "image_url": "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v3/d-1/1152206104.jpg",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://web.viu.com/in-hindi/en/video-gehraiyaan_uncut_ep_2-1152042075"
                            }
                        },
                        {
                            "title": "Gehraiyaan Uncut Ep-4",
                            "image_url": "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v5/d-1/1154884372.jpg",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://web.viu.com/in-hindi/en/video-gehraiyaan_uncut_ep_3-1152206104"
                            }
                        }
                    ]
                }
            }
        }
    };
    //res.json(x);
    res.json({
        "speech": response,
        "displayText": response,
        data: x
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
    var query = {}
    ClipRepository.find({
        title: req.query.title,
        actor: req.query.actor,
        language: req.query.language,
        genre: req.query.genre,
        episodeNo: req.query.episodeNo,
    }, function(err, clips) {
        if (err)
            res.send(err);
        clips.forEach(function (clip) {
            clip.Tcid16x9 = "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v3/d-1/" + clip.Tcid16x9 + ".jpg";
            clip.videoUrl = "https://web.viu.com/in-hindi/en/video-hackathon-" + clip._id;
        })

        res.json(clips);
    });
});
