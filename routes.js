var MinerController = require('./controllers/miner'),
    PredictorController = require('./controllers/predictor'),
    MatchesController = require('./controllers/matches');

exports.endpoints = [
    { method: 'GET', path: '/predict', config: PredictorController.predict },
    { method: 'GET', path: '/mine', config: MinerController.mine },
    { method: 'GET', path: '/match', config: MatchesController.getMatches },
    { method: 'GET', path: '/match/{match}', config: MatchesController.getMatch}
];