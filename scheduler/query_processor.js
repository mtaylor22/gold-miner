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
    acquireLock(function(){
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

//Initially release lock

lock.release('logging', 'master', function(e, r){
    console.log("Released any lock");
});

var requests = 0;
setInterval(function(){
    requests = 0;
}, 60*1000);

function acquireLock(cb){
    lock.acquire('logging', 10, 'master', function(e, r) {
        if (e){
            if (requests < 10) {
                lock.release('logging', 'master', function(e, r){
                    console.log("Released any lock");
                });
                cb();
            } else {
                setTimeout(function(){
                    acquireLock(cb);
                }, 1000);
            }
        } else {
            requests++;
            cb();
        }
    })
}


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