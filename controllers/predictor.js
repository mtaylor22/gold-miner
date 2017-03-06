var Joi = require('joi'),
    Boom = require('boom');

exports.predict = {
    validate: {
        query: {
            hero: Joi.string().required()
        }
    },
    handler: function(request, reply) {
        reply({
        	success: false,
        	hello: 'world'
        })
    }
};
