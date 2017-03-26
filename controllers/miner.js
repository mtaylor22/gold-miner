var Joi = require('joi'),
    Boom = require('boom'),
    queryBuilder = require('./../scheduler/query_builder');

exports.mine = {
    validate: {
        query: {
            page: Joi.number()
        }
    },
    handler: function(request, reply) {
    	console.log(JSON.stringify(queryBuilder));
        queryBuilder.buildQuery(request.query, request.query.page || 0);
        reply({
        	success: false,
        	hello: 'world'
        })
    }
};
