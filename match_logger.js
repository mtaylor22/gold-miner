// This library will collect and log all statistics from a single match (Miner!)
var Hero = require('./models/hero').Hero,
    Match = require('./models/match').Match,
	Vainglory = require('vainglory'),
	_ = require('lodash'),
	async = require('async'),
	config = require('config');

//VainGlory Options
const options = {
    host: 'https://api.dc01.gamelockerapp.com/shards/',
    region: 'na',
    title: 'semc-vainglory'
};

const vainglory = new Vainglory(config.vg.apiKey, options);

module.exports = {
	logMatch: function(matchJob, done){
		switch(matchJob.data.type){
			case 'match':
				delete matchJob.data.type;
				vainglory.matches.single(matchJob.data.matchId).then(function(matches) {
					matches.data = [matches.data];
                    if (matches && matches.errors) console.error("results: "+JSON.stringify(matches));
                    var matchResults = processMatches(matches);
                    logResults(matchResults, function(err, results){
                        done(err, {
                            'loggingResults': results,
                            'matches': matches
                        });
                    });
				}).catch(function(error) {
                    console.error("Query error", error);
                    done();
				});
				break;
			case 'matches':
			default:
				delete matchJob.data.type;
                vainglory.matches.collection(matchJob.data).then(function(matches){
                    if (matches && matches.errors) console.error("results: "+JSON.stringify(matches));
                    var matchResults = processMatches(matches);
                    logResults(matchResults, function(err, results){
                        done(err, {
                            'loggingResults': results,
                            'matches': matches
                        });
                    });
                }).catch(function(error){
                    console.error("Query error", error);
                    done();
                });
		}
	}
};

function processMatches(data){
	var matches = data.match;
	var players = {};
	_.each(matches, function(match){
		Match.create({matchId: match.data.id, match: match}); // Cache the match, non-blocking
		_.each(match.matchRoster, function(roster){
			_.each(roster.rosterParticipants, function(participant){
				var attributes = participant.data.attributes;
				var stats = attributes.stats;
				var hero = attributes.actor;
				if (hero) hero = hero.replace(/\*/g, '');
				var winner = stats.winner,
					assists = stats['assists']||0;
					crystalMineCaptures = stats['crystalMineCaptures']||0;
					deaths = stats['deaths']||0;
					farm = stats['farm']||0;
					goldMineCaptures = stats['goldMineCaptures']||0;
					itemGrants = stats['itemGrants']||[];
					itemSells = stats['itemSells']||[];
					itemUses = stats['itemUses']||[];
					items = stats['items']||[];
					jungleKills = stats['jungleKills']||0;
					karmaLevel = stats['karmaLevel']||0;
					kills = stats['kills']||0;
					krakenCaptures = stats['krakenCaptures']||0;
					level = stats['level']||0;
					minionKills = stats['minionKills']||0;
					nonJungleMinionKills = stats['nonJungleMinionKills']||0;
					skillTier = stats['skillTier']||0;
					skinKey = stats['skinKey']||"N/A";
					turretCaptures = stats['turretCaptures']||0;
					wentAfk = stats['wentAfk']||-1;
					winner = stats['winner']||false;

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
						'wentAfk': (wentAfk == -1) ? 0 : 1,
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

    for (var stat in stats){
        if (stat=='winner' || stat=='hero') continue;

        if (stats.winner) {
            players[hero]["winTotal."+stat] = (players[hero]["winTotal."+stat] + stats[stat]) || stats[stat];
        } else {
            players[hero]["lossTotal."+stat] = (players[hero]["lossTotal."+stat] + stats[stat]) || stats[stat];
        }
    }

    if (stats.winner) {
        players[hero].winCount = ++players[hero].winCount || 1;
	} else {
        players[hero].lossCount = ++players[hero].lossCount || 1;
    }

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