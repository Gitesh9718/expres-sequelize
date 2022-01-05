require('app-module-path').addPath(__dirname);
global._config = require('config/config');
global._appConstant = require('app/Constants/constant');
global._errConstant = require('app/Constants/ErrorMessage');

const CONFIG = require('config/config');
const events = require('events');
const eventEmitter = new events.EventEmitter();


const startApp = function () {
    require('background-processes').run();
};


require('bootstrap/database')(eventEmitter);

eventEmitter.once('db-connection-established', startApp);
