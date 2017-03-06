var Hapi = require('hapi'),
    Routes = require('./routes'),
    config = require('config'),
    db = require('./database');

const server = new Hapi.Server();
server.connection({ port: config.api.port, host: config.api.host });

server.route(Routes.endpoints);

server.start(function() {
    console.log('Server started ', server.info.uri);
});