/* global _config */
require('app-module-path').addPath(__dirname);
global._config = require('config/config');
global._appConstant = require('app/Constants/constant');
global._errConstant = require('app/Constants/ErrorMessage');

const express = require('express');
const passport = require('passport');
const pe = require('parse-error');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const v1Routes = require('routes/v1');
const v2Routes = require('routes/v2');
const adminRoutes = require('routes/admin');
const requestParse = require('middleware/requestParseMiddleware');
const app = express();

express.Route.prototype._handles_method = function _handles_method (method) {
    if (this.methods._all) {
        return true;
    }

    let name = method.toLowerCase();

    if (name === 'head' && !this.methods['head']) {
        name = 'get';
    }

    name.toUpperCase();

    return Boolean(this.methods[name]);
};

// Log Env
console.log('Environment:', _config.app);

const startApp = function () {
    // SETTING EXPRESS
    require('bootstrap/express')(app);

    // SETTING PUBLIC DIRECTORY
    app.use(express.static('public'));

    // SETTING PASSPORT
    require('bootstrap/passport')(app, passport);

    // REQUEST PARSER
    app.use(requestParse.parse);

    // SETTING ROUTES
    app.use('/v1', v1Routes);
    app.use('/v2', v2Routes);
    app.use('/Admin', adminRoutes);

    app.use(function postHandler (req, res, next) {
        if (res.hasOwnProperty('downloadableFile')) {
            res.download(res.downloadableFile, res['downloadableFileName']);
        } else if (req.route && req.route.path) {
            if (res.getHeader('Content-Type') && res.getHeader('Content-Type').includes('text/plain')) {
                res.send(res.data);
                res.end();
            } else {
                if (res.data && res.data.hasOwnProperty('paginate')) {
                    res.data.paginate = {
                        page: Math.round(req.skip / req.limit) + 1,
                        total: res.data.paginate.total,
                        pages: Math.round(res.data.paginate.total / req.limit),
                        limit: req.limit
                    };
                }
                const responseData = {
                    success: true,
                    resultSize: res.resultSize,
                    ...res.data
                };

                res.json(responseData);
                res.end();
            }
        } else {
            next();
        }
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        res.status(404);
        return res.json({
            success: false,
            error: 'Not found'
        });
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        console.error(err);

        res.status(err.status || 500);
        return res.json({
            success: false,
            error: err.message ? err.message : err
        });
    });

    // This is here to handle all the uncaught promise rejections
    process.on('unhandledRejection', error => {
        console.error('Uncaught Error', pe(error));
    });
};

// SETTING DB
require('bootstrap/database')(eventEmitter);

eventEmitter.once('db-connection-established', startApp);

module.exports = app;
