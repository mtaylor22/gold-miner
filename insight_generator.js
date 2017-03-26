// This library will generate insights for a match by manipulating the prediction model

const _ = require('lodash'),
    async = require('async');
var predictionGenerator = require('./prediction_generator'),
    Hero = require('./models/hero').Hero;

exports.gatherInsights = function(match, cb){
    match = match[0]; // Only one match to consider
    console.log("Match for Insights: "+JSON.stringify(match));

    // Gather Player Insights

    async.map(match.teams, function(team, done){
        async.map(team.players, function(player, done){

            Hero.findOne({name: player.actor.replace(/\*/g, '')}).lean().exec(function(err, hero){
                var insights = [];
                var playerStats = {
                    'wentAfk': {
                        'player': player.stats['wentAfk'],
                        'hero': hero.winTotal['wentAfk']/hero.winCount || 0},
                    'assists': {
                        'player': player.stats['assists'],
                        'hero': hero.winTotal['assists']/hero.winCount || 0},
                    'turretCaptures': {
                        'player': player.stats['turretCaptures'],
                        'hero': hero.winTotal['turretCaptures']/hero.winCount || 0},
                    'skillTier': {
                        'player': player.stats['skillTier'],
                        'hero': hero.winTotal['skillTier']/hero.winCount || 0},
                    'nonJungleMinionKills': {
                        'player': player.stats['nonJungleMinionKills'],
                        'hero': hero.winTotal['nonJungleMinionKills']/hero.winCount || 0},
                    'minionKills': {
                        'player': player.stats['minionKills'],
                        'hero': hero.winTotal['minionKills']/hero.winCount || 0},
                    'level': {
                        'player': player.stats['level'],
                        'hero': hero.winTotal['level']/hero.winCount || 0},
                    'krakenCaptures': {
                        'player': player.stats['krakenCaptures'],
                        'hero': hero.winTotal['krakenCaptures']/hero.winCount || 0},
                    'kills': {
                        'player': player.stats['kills'],
                        'hero': hero.winTotal['kills']/hero.winCount || 0},
                    'karmaLevel': {
                        'player': player.stats['karmaLevel'],
                        'hero': hero.winTotal['karmaLevel']/hero.winCount || 0},
                    'jungleKills': {
                        'player': player.stats['jungleKills'],
                        'hero': hero.winTotal['jungleKills']/hero.winCount || 0},
                    'items': {
                        'player': _.size(player.stats['items']),
                        'hero': hero.winTotal['items']/hero.winCount || 0},
                    'itemUses': {
                        'player': _.size(player.stats['itemUses']),
                        'hero': hero.winTotal['itemUses']/hero.winCount || 0},
                    'itemSells': {
                        'player': _.size(player.stats['itemSells']),
                        'hero': hero.winTotal['itemSells']/hero.winCount || 0},
                    'itemGrants': {
                        'player': _.size(player.stats['itemGrants']),
                        'hero': hero.winTotal['itemGrants']/hero.winCount || 0},
                    'goldMineCaptures': {
                        'player': player.stats['goldMineCaptures'],
                        'hero': hero.winTotal['goldMineCaptures']/hero.winCount || 0},
                    'farm': {
                        'player': player.stats['farm'],
                        'hero': hero.winTotal['farm']/hero.winCount || 0},
                    'deaths': {
                        'player': player.stats['deaths'],
                        'hero': hero.winTotal['deaths']/hero.winCount || 0},
                    'crystalMineCaptures': {
                        'player': player.stats['crystalMineCaptures'],
                        'hero': hero.winTotal['crystalMineCaptures']/hero.winCount || 0}
                };

                async.map(Object.keys(playerStats), function (stat, done){
                    var insight = {};
                    insight.stat = stat;
                    insight.variation = playerStats[stat].player / playerStats[stat].hero;
                    insight.actual = playerStats[stat].player;
                    insight.ideal = playerStats[stat].hero;

                    // Calculate the impact of the 'ideal' stat here
                    var pseudoStats = _.cloneDeep(match);
                    pseudoStats = modifyStat(pseudoStats, player.player, stat, playerStats[stat].hero);
                    calculateImpact(match, pseudoStats, player.actor, function(err, impact){
                        insight.impact = impact;
                        done(null, insight);
                    });
                }, function(err, insights) {
                    // console.log("Insights: "+JSON.stringify(insights));
                    done(null, {
                        actor: player.actor,
                        insights: insights
                    });
                });
            });
        }, done);
    }, cb);
};

function modifyStat(match, playerName, stat, modification){
    match.teams.forEach(function(team){
        team.players.forEach(function(player, i, playerArr){
            if (player.player == playerName)
                playerArr[i].stats[stat] = modification;
        })
    });
    return match;
}

function calculateImpact(stats, pseudoStats, actor, done){
    var team = 'b';
    stats.teams[0].players.forEach(function(player){
        if (player.actor == actor) team = 'a';
    });

    async.parallel({
        'true': function(done){
            predictionGenerator.predictMatch(stats, function(err, prediction){
                done(err, prediction[team]);
            });
        },
        'pseudo': function(done){
            predictionGenerator.predictMatch(pseudoStats, function(err, prediction){
                done(err, prediction[team]);
            });
        }
    }, function(err, results){
        done(err, results.pseudo / results.true);
    })

}