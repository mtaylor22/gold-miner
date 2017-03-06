var MinerController = require('./controllers/miner'),
	PredictorController = require('./controllers/predictor');

exports.endpoints = [
  { method: 'GET', path: '/predict', config: PredictorController.predict },
  { method: 'GET', path: '/mine', config: MinerController.mine }
];