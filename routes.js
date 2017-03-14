var MinerController = require('./controllers/miner'),
    PredictorController = require('./controllers/predictor'),
    MatchesController = require('./controllers/matches');

exports.endpoints = [
    { method: 'GET', path: '/predict', config: PredictorController.predict },
    { method: 'GET', path: '/mine', config: MinerController.mine },
    { method: 'GET', path: '/matches', config: MatchesController.getMatches }
];