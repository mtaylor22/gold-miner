// This library will build a query to mine
// It should avoid running the same query twice
var queryProcessor = require('./query_processor');
module.exports = {
	buildQuery : function(params){
		const query = {
		  page: {
		    offset: 0,
		    limit: 20,
		  },
		  filter: {
		    'createdAt-start': '2017-01-01T08:25:30Z',
		    // playerNames: ['Dracary5'],
		  }
		};
		queryProcessor.enqueue(query);
	}
}