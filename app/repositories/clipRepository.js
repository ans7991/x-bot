var Clip = require('../models/clip');

class ClipRepository {

    static find(criteria, handler) {
        var genres = {
            "bollywood": [333],
            "comedy": [192, 41],
            "sports": [105, 145, 12],
            "science": [202, 146],
            "movie": [19],
            "crime": [104, 47],
            "thriller": [156, 46],
            "action": [147],
            "horror": [40],
            "trailer": [226]
        }

        console.log(criteria);

        var query = {}
        if (criteria.title) {
            query.$text = {
                $search: '\"' + criteria.title + '\"'
            }
        }

        if (criteria.actor) {
            query.$or = query.$or || []
            query.$or = [{
                    Actors: {
                        $regex: ".*" + criteria.actor.charAt(0).toUpperCase() + criteria.actor.toLowerCase().slice(1) + ".*"
                    }
            },
                {
                    Actresses: {
                        $regex: ".*" + criteria.actor.charAt(0).toUpperCase() + criteria.actor.toLowerCase().slice(1) + ".*"
                    }
            }]
        }

        if (criteria.language) {
            query.Language = {
                $eq: criteria.language.charAt(0).toUpperCase() + criteria.language.toLowerCase().slice(1)
            }
        }

        if (criteria.genre) {
            var genre = genres[criteria.genre];
            if (genre && query.$or) {
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
            } else if (genre) {
                query.$or = [{
                        Genre: {
                            $in: genre
                        }
            },
                    {
                        SubGenre: {
                            $in: genre
                        }
            }]
            }
        }

        if (criteria.episodeNo) {
            query.EpisodeNo = {
                $eq: parseInt(criteria.episodeNo, 10)
            }

        }

        console.log(query);

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
            .select('Title _id Actors Actresses Tcid16x9 Language EpisodeNo Paid')
            .lean()
            .limit(criteria.limit || 120)
            .exec((err, clips) => {
                if (!err) {
                    clips.forEach(function (clip) {
                        clip.Tcid16x9 = "https://vuclipi-a.akamaihd.net/p/tthumb280x210/v3/d-1/" + clip.Tcid16x9 + ".jpg";
                        clip.videoUrl = "https://web.viu.com/in-hindi/en/video-hackathon-" + clip._id;
                    })
                }
                if (!criteria.actor && !criteria.episodeNo && !criteria.genre && !criteria.title && !criteria.language) {
                    clips.length = 0;
                }
                handler(err, clips)
            });
    }
}

module.exports = ClipRepository
