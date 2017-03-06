// This library will collect and log all statistics from a single match (Miner!)
var Hero = require('./models/hero').Hero,
	Vainglory = require('vainglory'),
	_ = require('lodash'),
	async = require('async'),
	config = require('config');

//VainGlory Options
const options = {
};

const vainglory = new Vainglory(config.vg.apiKey, options);

module.exports = {
	logMatch: function(matchJob, done){
		console.log(JSON.stringify(matchJob));
		vainglory.matches.collection(matchJob.data).then(function(matches){
			var matchResults = processMatches(matches);
			logResults(matchResults, done);
		}).catch(function(error){
			console.error("Query error", error);
			done();
		});
	}
}

function processMatches(data){
	var matches = data.match;
	var players = {};
	_.each(matches, function(match){
		_.each(match.matchRoster, function(roster){
			_.each(roster.rosterParticipants, function(participant){
				var attributes = participant.data.attributes;
				var hero = attributes.actor;
				if (hero) hero = hero.replace(/\*/g, '');
				var winner = attributes.stats.winner;

				if (players[hero]){
					players[hero].ratio += (winner) ? 1 : -1;
					players[hero].count++;
				} else {
					players[hero] = {
						ratio:(winner) ? 1 : -1,
						count:1
					};
				}
			});
		});
	});
	return {heros: players};
}

function logResults(results, done){
	async.forEachOf(results.heros, function(stats, hero, cb){
		if (stats.count == 0) return cb();
		Hero.findOneAndUpdate({name: hero}, {$inc : {winRatio:stats.ratio, dataSet:stats.count}}, {upsert: true}).lean().exec(function(err, data){ 
		   if(err) return console.log(err);
		   cb();
		});
	}, done);
}