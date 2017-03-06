// This module will process the priority queue and call the match_logger

var Queue = require('bull'),
    config = require('config'),
    matchLogger = require('./../match_logger');

var loggingQueue = Queue('match logging', config.redis.port, config.redis.host);

loggingQueue.process(matchLogger.logMatch);

module.exports = {
	enqueue: function(request, cb){
		loggingQueue.add(request, {
			priority: 3, 
			removeOnComplete:true, 
			delay: 10*1000				//Note: a 10 second delay will prevent us from 
		});

		if (cb) cb();
	}
}