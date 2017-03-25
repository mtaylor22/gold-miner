var Joi = require('joi'),
    Boom = require('boom'),
    _ = require('lodash');
    var queryProcessor = require('./../scheduler/query_processor');
    var predictionGenerator = require('./../prediction_generator');
var insightGenerator = require('./../insight_generator');

exports.getMatches = {
    cors: true,
    validate: {
        query: {
            page: Joi.number()
        }
    },
    handler: function(request, reply) {
        const now = new Date();
        const minus3Hours = new Date(new Date() * 1 - 1000 * 3600 * 3);
        const query = {
            type: 'matches',
            page: {
                offset: 0,
                limit: 50
                },
                sort: '-createdAt',
            filter: {
                'createdAt-start': minus3Hours.toISOString(),
                'createdAt-end': now.toISOString(),
                playerNames: [],
                teamNames: []
            }
        };
        queryProcessor.enqueue(query, function(err, results){
            var matches_short = _.map(results.matches.data, function(match){
                return {
                    id: match.id
                }
            });

            var simpleMatch = simplifyMatchResults(results.matches.match);

            reply({
                success: true,
                matches: simpleMatch
            })
        });
    }
};

exports.getMatch = {
    validate: {
        params: {
            match: Joi.string().required()
        }
    },
    cors: true,
    handler: function(request, reply) {
        const query = {
            type: "match",
            matchId: request.params.match
        };

        console.log("Calling enqueue");

        queryProcessor.enqueue(query, function(err, results){
            if (!results) return;
            console.log("Enqueue Results: "+JSON.stringify(results));


            var simplifyInput = {"matches": results.matches};
            console.log("messed up results: "+JSON.stringify(simplifyInput));
            var simpleMatch = simplifyMatchResults(simplifyInput);

            console.log("Prediction input: "+JSON.stringify(simpleMatch));

            insights = insightGenerator.gatherInsights(simpleMatch);

            predictionGenerator.predictMatch(simpleMatch, function(err, prediction){
                if (err){
                    console.err("Failed to predict match: ", err);
                }

                console.log("Final prediction: "+JSON.stringify(prediction));

                reply({
                    success: !err,
                    matches: simpleMatch,
                    prediction: prediction
                });
            });

        });
    }
};

function simplifyMatchResults(results){

    return _.map(results, function (match) {
        var data = match.data;

        if (data.constructor === Array) data = data[0];
        return {
            id: data.id,
            gameMode: data.attributes.gameMode,
            endGameReason: data.attributes.stats.endGameReason,
            started: data.attributes.createdAt,
            duration: data.attributes.duration,
            teams: _.map(match.matchRoster, function (roster) {

                return {
                    won: roster.rosterParticipants[0].data.attributes.stats.winner,
                    players: _.map(roster.rosterParticipants, function (participant) {
                        return {
                            actor: participant.data.attributes.actor,
                            stats: participant.data.attributes.stats,
                            player: participant.participantPlayer.data.attributes.name,
                            playerStats: participant.participantPlayer.data.attributes.stats
                        }
                    })
                }
            })
        }
    });
}