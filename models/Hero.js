 // This model will collect statistics for wins on a hero

var Mongoose = require('mongoose');

module.exports = {
    Hero: Mongoose.model('hero', 
		new Mongoose.Schema({
            winTotal: { type: Object },
            lossTotal: { type: Object },
		    winRatio: { type: Number, default: 0 },
		    dataSet: { type: Number, default: 0 },
		    name: { type: String, required: true, unique: true },
		    assists: {type: Number, default: 0},
			crystalMineCaptures: {type: Number, default: 0},
			deaths: {type: Number, default: 0},
			farm: {type: Number, default: 0},
			goldMineCaptures: {type: Number, default: 0},
			itemGrants: {type: Number, default: 0},
			itemSells: {type: Number, default: 0},
			itemUses: {type: Number, default: 0},
			items: {type: Number, default: 0},
			jungleKills: {type: Number, default: 0},
			karmaLevel: {type: Number, default: 0},
			kills: {type: Number, default: 0},
			krakenCaptures: {type: Number, default: 0},
			level: {type: Number, default: 0},
			minionKills: {type: Number, default: 0},
			nonJungleMinionKills: {type: Number, default: 0},
			skillTier: {type: Number, default: 0},
			skinKey: {type: Number, default: 0},
			turretCaptures: {type: Number, default: 0},
			wentAfk: {type: Number, default: 0},
			count: {type: Number, default: 0},
			ratio: {type: Number, default: 0},
            winCount: {type: Number, default: 0},
            lossCount: {type: Number, default: 0}
		})
	)
};