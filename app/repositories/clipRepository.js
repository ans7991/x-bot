var Clip = require('../models/clip');

class ClipRepository {

    static find(criteria, handler) {
        var genres = {
            "comedy": [192, 41],
            "sports": [105, 145, 12],
            "science": [202, 146],
            "movie": [9, 19],
            "crime": [104, 47],
            "thrillers": [156, 46],
            "action": [147],
            "horror": [40],
            "trailer": [226]
        }

        console.log(criteria);
        var query = { }
        if (criteria.title) {
            query.$text = {
                $search: '\"' + criteria.title + '\"'
            }
        }

        if (criteria.actor) {
            query.$or = query.$or || []
            query.$or = [{
                Actors: {
                    $regex: ".*" + criteria.actor + ".*"
                }
            },
            {
                Actresses: {
                    $regex: ".*" + criteria.actor + ".*"
                }
            }]
        }

        if (criteria.language) {
            query.Language = {
                $eq: criteria.language.charAt(0).toUpperCase() + criteria.language.slice(1)
            }
        }

        if (criteria.genre) {
            var genre = genres[criteria.genre];
            query.$or = query.$or || []
            query.$or.concat([{
                Genre: {
                    $in: genre
                }
            },
            {
                SubGenre: {
                    $in: genre
                }
            }])
        }

        if (criteria.episodeNo) {
            query.EpisodeNo = {
                $eq: parseInt(criteria.episodeNo, 10)
            }

        }

        Clip.find(query, {
            score: {
                $meta: "textScore"
            }
        })
            .sort({
                score: {
                    $meta: "textScore"
                }
            })
            .select('Title _id Actors Actresses Tcid16x9 Language EpisodeNo')
            .lean()
            .limit(criteria.limit || 10)
            .exec((err, clips) => {
                if (!err) {
                    clips.forEach(function (clip) {
                        clip.Tcid16x9 = "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v3/d-1/" + clip.Tcid16x9 + ".jpg";
                        clip.videoUrl = "https://web.viu.com/in-hindi/en/video-hackathon-" + clip._id;
                    })
                }
                handler(err, clips)
            });

    }
}

module.exports = ClipRepository