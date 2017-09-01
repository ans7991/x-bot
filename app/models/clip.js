var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ClipSchema   = new Schema({
    Title: String,
    Actors: String,
    _id: String
});

module.exports = mongoose.model('Clip', ClipSchema);