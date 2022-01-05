'use strict';

const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

module.exports = function (app) {

    app.use(bodyParser.json({limit: '50mb'}));

    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    app.use(cors());

    app.use(methodOverride(function (req, res) {
        if (req.method.match(/patch/i)) {
            console.log("OVERRIDING patch WITH PATCH!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            return 'PATCH';
        }
    }));

    app.use(logger('dev'));
};