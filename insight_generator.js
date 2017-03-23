// This library will generate insights for a match by manipulating the prediction model

const _ = require('lodash');
var predictionGenerator = require('./prediction_generator');

exports.gatherInsights = function(match){
    console.log("Match for Insights: "+JSON.stringify(match));
    _.each(match.teams, function(team){
       _.each(team.players, function(player){
           
       });
    });
};