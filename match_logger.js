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
		console.log("JOB: "+JSON.stringify(matchJob));
		vainglory.matches.collection(matchJob.data).then(function(matches){
			if (matches && matches.errors) console.error("results: "+JSON.stringify(matches));
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
				var stats = attributes.stats;
				var hero = attributes.actor;
				if (hero) hero = hero.replace(/\*/g, '');
				var winner = stats.winner,
					assists = stats['assists'];
					crystalMineCaptures = stats['crystalMineCaptures'];
					deaths = stats['deaths'];
					farm = stats['farm'];
					goldMineCaptures = stats['goldMineCaptures'];
					itemGrants = stats['itemGrants'];
					itemSells = stats['itemSells'];
					itemUses = stats['itemUses'];
					items = stats['items'];
					jungleKills = stats['jungleKills'];
					karmaLevel = stats['karmaLevel'];
					kills = stats['kills'];
					krakenCaptures = stats['krakenCaptures'];
					level = stats['level'];
					minionKills = stats['minionKills'];
					nonJungleMinionKills = stats['nonJungleMinionKills'];
					skillTier = stats['skillTier'];
					skinKey = stats['skinKey'];
					turretCaptures = stats['turretCaptures'];
					wentAfk = stats['wentAfk'];
					winner = stats['winner'];

					incStat(players, hero, {
						'assists': assists,
						'crystalMineCaptures': crystalMineCaptures,
						'deaths': deaths,
						'farm': farm,
						'goldMineCaptures': goldMineCaptures,
						'itemGrants': _.size(itemGrants),
						'itemSells': _.size(itemSells),
						'itemUses': _.size(itemUses),
						'items': _.size(items),
						'jungleKills': jungleKills,
						'karmaLevel': karmaLevel,
						'kills': kills,
						'krakenCaptures': krakenCaptures,
						'level': level,
						'minionKills': minionKills,
						'nonJungleMinionKills': nonJungleMinionKills,
						'skillTier': skillTier,
						'turretCaptures': turretCaptures,
						'wentAfk': (wentAfk) ? 1 : 0,
						'hero': hero,
						'winner': winner
					});
			});
		});
	});
	return {heros: players};
}

function incStat(players, hero, stats){
	if (!players[hero]) players[hero] = {};

	var coeff = (stats.winner) ? 1 : -1;

	for (var stat in stats){
		if (stat=='winner' || stat=='hero') continue;
		players[hero][stat] =  (players[hero][stat] + coeff * stats[stat]) || coeff * stats[stat];
	}

	players[hero].count = ++players[hero].count || 1;
	players[hero].ratio = (players[hero].ratio + coeff) || coeff;
}


function logResults(results, done){
	async.forEachOf(results.heros, function(stats, hero, cb){
		if (stats.count == 0) return cb();
		Hero.findOneAndUpdate({name: hero}, {$inc : stats}, {upsert: true}).lean().exec(function(err, data){ 
		   if(err) return console.log(err);
		   cb();
		});
	}, done);
}