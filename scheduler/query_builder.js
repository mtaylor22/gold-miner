// This library will build a query to mine
// It should avoid running the same query twice
var queryProcessor = require('./query_processor');
module.exports = {
	buildQuery : function(params, offset){
		const query = {
		  page: {
		    offset: offset || 0,
		    limit: 50,
		  },
		  filter: {
		    'createdAt-end': '2017-03-01T00:00:00Z',
		    'createdAt-start': '2017-01-01T00:00:00Z',
		    // playerNames: ['Dracary5'],
		  }
		};
		queryProcessor.enqueue(query);
	}
}