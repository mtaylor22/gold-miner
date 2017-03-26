var MinerController = require('./controllers/miner'),
    PredictorController = require('./controllers/predictor'),
    MatchesController = require('./controllers/matches');

exports.endpoints = [
    { method: 'POST', path: '/predict', config: PredictorController.predict },
    { method: 'GET', path: '/stats', config: PredictorController.stats },
    { method: 'GET', path: '/mine', config: MinerController.mine },
    { method: 'GET', path: '/match', config: MatchesController.getMatches },
    { method: 'GET', path: '/match/{match}', config: MatchesController.getMatch},
    { method: 'GET', path: '/player/{player}', config: MatchesController.getMatchesByPlayer}
];