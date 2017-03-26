var Joi = require('joi'),
    Boom = require('boom'),
    predictionGenerator = require('./../prediction_generator'),
    Prediction = require('./../models/prediction').Prediction;

exports.predict = {
    cors: true,
    validate: {
        payload: {
            match: Joi.object().required()
        }
    },
    handler: function(request, reply) {
        predictionGenerator.predictMatch(request.payload.match, function(err, prediction){
            if (err) console.error("Error predicting match: ", err);
            reply({
                prediction: prediction
            });
        });
    }
};
exports.stats = {
    cors: true,
    validate: {

    },
    handler: function(request, reply) {
        Prediction.count({}, function( err, fullCount){
            if (err) console.error("Error counting stats: ", err);
            Prediction.count({correct: true}, function( err, correctCount){
                if (err) console.error("Error counting stats: ", err);
                reply({
                    total: fullCount,
                    correct: correctCount,
                    accuracy: correctCount / fullCount
                });
            });
        });
    }
};
