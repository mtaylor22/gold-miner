// This module will actually perform all the queries needed to make a prediction
// It should return a number between [0-1]

const async = require('async'),
        _ = require('lodash'),
    Prediction = require('./models/prediction').Prediction,
    Hero = require('./models/hero').Hero;

exports.predictMatch = function(match, cb){
    if (match.constructor === Array) match = match[0];
    var teamA = {team: match.teams[0]},
        teamB = {team: match.teams[1]};

    async.parallel({
        'teamA': function(done){
            predictionModel.scoreTeam(teamA.team, done);
        },
        'teamB': function(done){
            predictionModel.scoreTeam(teamB.team, done);
        }
    }, function(err, results){
        if (err){
            console.error(err);
            return cb(err);
        }

        var teamAScore = results.teamA,
            teamBScore = results.teamB;

        // var minScore = Math.min(teamAScore, teamBScore);

        // Arbitrary scaler - this value represents how the prediction index translates to advantage percentage
        var minScore = 300;



        // var scaledScores = {
        //     a: (minScore<0) ? teamAScore + (-1*minScore) : teamAScore,
        //     b: (minScore<0) ? teamBScore + (-1*minScore) : teamBScore
        // };

        var scaledScores = {
            a: teamAScore + minScore,
            b: teamBScore + minScore
        };

        var scaledTotal = scaledScores.a + scaledScores.b;
        scaledScores.a = scaledScores.a / scaledTotal;
        scaledScores.b = scaledScores.b / scaledTotal;

        var finalScores = {
            a: (1 + scaledScores.a) / (2 + scaledScores.a + scaledScores.b),
            b: (1 + scaledScores.b) / (2 + scaledScores.a + scaledScores.b)
        };

        // Factor more/less players per team
        // Count players

        // 1 - 3 (1 + 1 - 3) =
        // 3 - 1
        // 1 - 2
        // 2 - 1
        // 1 - 1
        // 3 - 2
        // 4 - 1

        var playerCountA = match.teams[0].players.length;
        var playerCountB = match.teams[1].players.length;


        var coefficient = (1 + Math.abs(playerCountA - playerCountB));
        if (playerCountA > playerCountB){
            finalScores.b = Math.pow(finalScores.b, coefficient);
            finalScores.a = 1 - finalScores.b;
        } else if (playerCountB > playerCountA){
            finalScores.a = Math.pow(finalScores.a, coefficient);
            finalScores.b = 1 - finalScores.a;
        }

        // Set a cap

        finalScores.a = Math.min(1, finalScores.a);
        finalScores.b = Math.min(1, finalScores.b);

        finalScores.a = Math.max(0, finalScores.a);
        finalScores.b = Math.max(0, finalScores.b);

        var success = ((match.teams[0].won && finalScores.a >= finalScores.b) || (match.teams[1].won && finalScores.b >= finalScores.a));
        var matchId = match.id;
        Prediction.create({matchId: matchId, correct: success});

        // console.log("Final scores: "+JSON.stringify(finalScores));
        cb(null, finalScores);
    });
};

var predictionModel = {
    scoreTeam: function(team, cb){
        async.map(team.players, predictionModel.scorePlayer, function(err, scores){
            if (err){
                console.error("Error in scorePlayer, ", err);
                return cb(err);
            }
            // console.log("Got team scores: "+JSON.stringify(scores));
            cb(null, _.sum(scores));
        });
    },
    scorePlayer: function(player, cb){
        if (!player.actor) console.error("Unknown actor, "+JSON.stringify(player));
        Hero.findOne({name: player.actor.replace(/\*/g, '')}).lean().exec(function(err, hero){
            if (err){
                console.error("Error finding hero in scorePlayer, ", err);
                return cb(err);
            }
            var score=0;





            if (hero["assists"]) score += player.stats["assists"] / hero["assists"];
            // if (hero["count"]) score += player.stats["count"] / hero["count"];
            if (hero["wentAfk"]) score += ((player.stats["wentAfk"] == -1) ? 0 : 1) / hero["wentAfk"];
            if (hero["turretCaptures"]) score += player.stats["turretCaptures"] / hero["turretCaptures"];
            if (hero["skillTier"]) score += player.stats["skillTier"] / hero["skillTier"];
            if (hero["nonJungleMinionKills"]) score += player.stats["nonJungleMinionKills"] / hero["nonJungleMinionKills"];
            if (hero["minionKills"]) score += player.stats["minionKills"] / hero["minionKills"];
            if (hero["level"]) score += player.stats["level"] / hero["level"];
            if (hero["krakenCaptures"]) score += player.stats["krakenCaptures"] / hero["krakenCaptures"];
            if (hero["kills"]) score += player.stats["kills"] / hero["kills"];
            if (hero["karmaLevel"]) score += player.stats["karmaLevel"] / hero["karmaLevel"];
            if (hero["jungleKills"]) score += player.stats["jungleKills"] / hero["jungleKills"];
            if (hero["items"]) score += _.size(player.stats["items"]) / hero["items"];
            if (hero["itemUses"]) score += _.size(player.stats["itemUses"]) / hero["itemUses"];
            if (hero["itemSells"]) score += _.size(player.stats["itemSells"]) / hero["itemSells"];
            if (hero["itemGrants"]) score += _.size(player.stats["itemGrants"]) / hero["itemGrants"];
            if (hero["goldMineCaptures"]) score += player.stats["goldMineCaptures"] / hero["goldMineCaptures"];
            if (hero["farm"]) score += player.stats["farm"] / hero["farm"];
            if (hero["deaths"]) score += player.stats["deaths"] / hero["deaths"];
            if (hero["crystalMineCaptures"]) score += player.stats["crystalMineCaptures"] / hero["crystalMineCaptures"];

            var playerStats = {
                'assists': {count: player.stats["assists"], coefficient: 11},
                'wentAfk': {count: (player.stats["wentAfk"] == -1) ? 0 : 1, coefficient: 1000},
                'turretCaptures': {count: player.stats["turretCaptures"], coefficient: 1},
                'skillTier': {count: player.stats["skillTier"], coefficient: 1},
                'nonJungleMinionKills': {count: player.stats["nonJungleMinionKills"], coefficient: 1},
                'minionKills': {count: player.stats["minionKills"], coefficient: 1},
                'level': {count: player.stats["level"], coefficient: 1},
                'krakenCaptures': {count: player.stats["krakenCaptures"], coefficient: 1},
                'kills': {count: player.stats["kills"], coefficient: 10},
                'karmaLevel': {count: player.stats["karmaLevel"], coefficient: 1},
                'jungleKills': {count: player.stats["jungleKills"], coefficient: 1},
                'items': {count: _.size(player.stats["items"]), coefficient: 1},
                'itemUses': {count: _.size(player.stats["itemUses"]), coefficient: 1},
                'itemSells': {count: _.size(player.stats["itemSells"]), coefficient: 1},
                'itemGrants': {count: _.size(player.stats["itemGrants"]), coefficient: 1},
                'goldMineCaptures': {count: player.stats["goldMineCaptures"], coefficient: 1},
                'farm': {count: player.stats["farm"], coefficient: 1},
                'deaths': {count: player.stats["deaths"], coefficient: 10},
                'crystalMineCaptures': {count: player.stats["crystalMineCaptures"], coefficient: 1}
            };

            for (statName in playerStats) score += factorScore(statName, playerStats, hero);

            if (hero["ratio"]) score += (score * hero["ratio"]);

            cb(null, score);
        });
    }
};

function factorScore(statName, playerStats, hero){
    if (!hero || !hero["winTotal"][statName]) return 0;
    if (!playerStats || !playerStats[statName] || !playerStats[statName].count) return 0;

    var stat = playerStats[statName];
    var idealStat = hero["winTotal"][statName];
    var x = idealStat - stat.count;

    // return -1*Math.pow(x, 2);
    // return stat.coefficient / Math.pow(x, 2) - 1;
    // return 1/(.1+Math.pow(idealStat - stat.count, 2));

    // return stat.coefficient * stat.count / hero["winTotal"][statName];
    return stat.coefficient * stat.count / hero["winTotal"][statName];
    // return stat.coefficient * (1 / (hero["winTotal"][statName] - stat.count));
}