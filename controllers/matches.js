var Joi = require('joi'),
    Boom = require('boom'),
    _ = require('lodash');
var queryProcessor = require('./../scheduler/query_processor');

exports.getMatches = {
    validate: {
        query: {
            page: Joi.number()
        }
    },
    handler: function(request, reply) {
        const now = new Date();
        const minus3Hours = new Date(new Date() * 1 - 1000 * 3600 * 3);
        const query = {
            page: {
                offset: 0,
                limit: 50
            },
            filter: {
                'createdAt-start': minus3Hours.toISOString(),
                'createdAt-end': now.toISOString()
                // playerNames: ['Dracary5'],
            }
        };
        queryProcessor.enqueue(query, function(err, results){
            var matches_short = _.map(results.matches.data, function(match){
               return {
                   id: match.id
               }
            });



            var simpleMatch = _.map(results.matches.match, function(match){
                var data = match.data;
                return {
                    id: data.id,
                    gameMode: data.attributes.gameMode,
                    endGameReason: data.attributes.stats.endGameReason,
                    started: data.attributes.createdAt,
                    duration: data.attributes.duration,
                    teams: _.map(match.matchRoster, function(roster){
                        return {
                            won: roster.rosterParticipants[0].data.attributes.stats.winner,
                            players: _.map(roster.rosterParticipants, function(participant){
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

            reply({
                success: true,
                matches: simpleMatch
            })
        });
    }
};


