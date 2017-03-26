 // This model will collect statistics for wins on a hero

var Mongoose = require('mongoose');

module.exports = {
    Prediction: Mongoose.model('prediction',
		new Mongoose.Schema({
		    correct: { type: Boolean, default: true },
			matchId: { type: String, required: true, unique: true }
		})
	)
};