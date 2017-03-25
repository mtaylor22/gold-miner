 // This model will collect statistics for wins on a hero

var Mongoose = require('mongoose');

module.exports = {
    Match: Mongoose.model('match',
		new Mongoose.Schema({
		    match: { type: Object },
			matchId: { type: String, required: true, unique: true },
		})
	)
};