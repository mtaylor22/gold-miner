// This module will actually perform all the queries needed to make a prediction
// It should return a number between [0-1]

const async = require('async'),
    _ = require('lodash'),
    Hero = require('./models/hero').Hero;

exports.predictMatch = function(match, cb){
    console.log("True match: "+JSON.stringify(match));
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
            teamBScore = results.teamB,
            minScore = Math.min(teamAScore, teamBScore);

        var scaledScores = {
            a: (minScore<0) ? teamAScore + (-1*minScore) : teamAScore,
            b: (minScore<0) ? teamBScore + (-1*minScore) : teamBScore
        };

        var scaledTotal = scaledScores.a + scaledScores.b;
        scaledScores.a = scaledScores.a / scaledTotal;
        scaledScores.b = scaledScores.b / scaledTotal;

        var finalScores = {
            a: (1 + scaledScores.a) / (2 + scaledScores.a + scaledScores.b),
            b: (1 + scaledScores.b) / (2 + scaledScores.a + scaledScores.b)
        };
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
            console.log("Got team scores: "+JSON.stringify(scores));
            cb(null, _.sum(scores));
        });
    },
    scorePlayer: function(player, cb){
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

            if (hero["ratio"]) score += (score * hero["ratio"]);

            cb(null, score);
        });
    }
};