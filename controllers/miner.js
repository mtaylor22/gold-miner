var Joi = require('joi'),
    Boom = require('boom')
    queryBuilder = require('./../scheduler/query_builder');

exports.mine = {
    validate: {
        query: {}
    },
    handler: function(request, reply) {
    	console.log(JSON.stringify(queryBuilder));
        queryBuilder.buildQuery(request.query);
        reply({
        	success: false,
        	hello: 'world'
        })
    }
};
