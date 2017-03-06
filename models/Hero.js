// This model will collect statistics for wins on a hero

var Mongoose = require('mongoose');

module.exports = {
    Hero: Mongoose.model('hero', 
		new Mongoose.Schema({
		    winRatio: { type: Number, default: 0 },
		    dataSet: { type: Number, default: 0 },
		    name: { type: String, required: true, unique: true }
		})
	)
};