// This module will process the priority queue and call the match_logger

var Queue = require('bull'),
    config = require('config'),
    matchLogger = require('./../match_logger'),
    Lock = require('node-redis-lock'),
    redis = require('redis');

const client = redis.createClient({
    'host': config.redis.host,
    'port': config.redis.port
});

var lock = new Lock({namespace: 'locking'}, client);

var loggingQueue = Queue('match logging', config.redis.port, config.redis.host);
const uuidV1 = require('uuid/v1');

var jobWaiter = {};

loggingQueue.process(1, function(matchJob, done){
    lock.acquire('logging', 1000*10, 'master', function(e, r) {
        var cbkey;
        if (matchJob.data && matchJob.data.cbkey){
            cbkey = matchJob.data.cbkey;
            delete matchJob.data['cbkey'];
        }
        matchLogger.logMatch(matchJob, function(err, result){
            if (cbkey){
                jobWaiter[cbkey] && jobWaiter[cbkey](null, result);
            }
            done(err, result);
        });
    });
});

module.exports = {
	enqueue: function(request, finalCb){
	    if (finalCb){
            var key = uuidV1();
            request.cbkey = key;
            jobWaiter[key] = finalCb;
        }
		loggingQueue.add(request, {
			priority: 3, 
			removeOnComplete:true, 
			// delay: 10*1000				//Note: a 10 second delay will prevent us from
		});
	}
};